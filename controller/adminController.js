/**
@author hk1k
**/
var monitor = require('pomelo-monitor');
var database = require('../model/database');
var logger = require('../lib/logger');
var Admin = database.Admin;

/**
像数据库中添加管理员用户
@method insert
@param username {String} 用户名
@param password {String} 密码
@param role {Int|Object} 角色
@param callback {Function} 回调函数
**/
function insert(username, password, role, callback){
  if(!username || !password){
    return callback(new Error('请输入用户名和密码'));
  }
  if(!role){
    role = database.Role.create(0);
  }else if(!isNaN(role)){
    role = database.Role.create(role);
  }
  
  Admin.find({username: username}, function(err, users){
    if(err){
      return callback(err);
    }
    if(users.length){
      return callback(new Error('用户名 ' + username + ' 已经存在'));
    }
    var admin = new database.Admin({ username: username, password: password, role: role });
    admin.save(function(err){
      if(err){
        return callback(new Error('添加失败:' + err.message));
      }
      callback(null, admin);
    });
  });
}

/**
使用用户名密码登陆
@method login
@param username {String} 用户名
@param password {String} 密码
@param callback {Function} 回调函数
@param sid {String|null} 登录token
**/
exports.login = function(username, password, callback, sid){
  database.Admin.find({
   username:username, 
   password:password
  }, function(err, data){
    if(err){
      logger.error('登陆验证时数据库出错:'+ err.message);
      return callback(error);
    }
    if(!data.length){
      logger.debug('登陆验证不成功：用户名' + username+ '错误或者密码错误');
      return callback('login error');
    }
    var $set = {loginTime: Date.now()};
    if(sid){ $set.sid = sid };
    data[0].update({$set: $set}).exec();
    return callback(null, data[0]);
  });
}

/**
使用用户名和cookie登陆
@method loginByToken
@param username {String} 用户名
@param sid {String} 登陆token(从cookie中取得)
**/
exports.loginByToken = function(username, sid, callback){
  if(!username || !sid){
    return callback('login error');
  }
  database.Admin.find({
     username:username, 
     sid:sid
   }, function(err, data){
     if(err || !data || !data.length){
       logger.debug('使用token登陆不成功：' + err ? error.toString() : '没用用户' + username+ '的信息');
       return callback('login error');
     }
     var admin = data[0];
     var loginTime = admin.loginTime;
     var diff = Date.now() - loginTime.getTime();
     if(diff < 7 * 24 * 60 * 60 * 1000){
       return callback(null, admin);
     }
     logger.debug('使用token登陆不成功：用户名' + username + 'cookie过期');
     return callback('login timeout');
   });
}

/**
admin主页渲染
@method index
@param req {HttpRequest} http请求
@param res {HttpResponse} http响应
**/
exports.index = function(req, res){
  var maxKey = req.session.admin.role.key;
  Admin.find({}, function(err, data){
    if(err){
      logger.error('admin主页获取用户列表出错');
      res.redirect('/admin/error');
    }
    var param = {
      pid: process.pid,
      serverId: 'node-server'
    };

    monitor.psmonitor.getPsInfo(param, function(err, sys) {
      res.render('admin/admin.html', {
        users: data,
        sys: sys,
        addInfo: req.flash('addInfo'),
        info: req.flash('info'),
        roles: database.Role.all(maxKey)
      });
    });
 
    
  });
}

/**
添加管理员用户的接口
> 管理员和超级管理员可以新增用户
> 新增用户的角色不能超过当前登录用户的角色
@method add
@param req {HttpRequest} http请求
@param res {HttpResponse} http响应
**/
exports.add = function(req, res){
  var admin = req.session.admin;
  if(admin.role.key < 2){
    req.flash('addInfo', '您的级别不够，无法增加管理人员帐号');
    logger.debug('权限不够，无法增加管理人员帐号:'+admin.username);
    return res.redirect('/admin/admin');
  }
  
  var username = req.param('username');
  var password1 = req.param('password1');
  var password2 = req.param('password2');
  var role = parseInt(req.param('role'));
  var addInfo;
  if(!username){
    addInfo = '用户名不能为空';
  }else if(!password1 || !password2){
    addInfo = '密码不能为空';
  }else if(password1 != password2){
    addInfo = '输入的密码不一致';
  }else if(role > admin.role.key){
    addInfo = '设置的角色权限过高，您无权添加该角色的用户';
  }
  if(addInfo){
    req.flash('addInfo', addInfo);
    return res.redirect('/admin/admin');
  }
  
  //增加用户
  insert(username, password1, role, function(err){
    if(err){
      logger.error('增加用户时数据库出错');
      req.flash('addInfo', err);
    }
    res.saveOperation('增加了新用户:'+username);
    res.redirect('/admin/admin');
  });
}

/**
编辑用户接口
>超级管理员可以编辑任何账号
>管理员可以编辑除超级管理员的任何账号
>管理员级别以下的只能编辑自己的账号
@method edit
@param req {HttpRequest} http请求
@param res {HttpResponse} http响应
**/
exports.edit = function(req, res){
  var admin = req.session.admin;
  if(!admin){
    req.flash('info', '');
    return res.redirect('/admin/login');
  }

  var passwordOld = req.param('passwordOld');
  var password1 = req.param('password1');
  var password2 = req.param('password2');
  var role = parseInt(req.param('role'));
  var info;
  
  if(role > admin.role.key){
    info = '设置的角色权限过高';
  }

  if(!info){
    if(passwordOld || password1 || password2){
      if(!passwordOld){
        info = '如果要修改密码，旧密码不能为空';
      }else if(!password1){
        info = '如果要修改密码，新密码不能为空';
      }else if(password1 !== password2){
        info = '如果要修改密码，两次输入的新密码要一致';
      }
    }
  }
  
  if(info){
    req.flash('info', info);
    return res.redirect('/admin/admin');
  }
  
  var id = req.param('id');
  
  if(admin.role.key <= 2 && admin._id != id){
    req.flash('info', '您的级别不够，无法编辑他人帐号');
    logger.debug('权限不够，无法编辑他人帐号:'+admin.username);
    return res.redirect('/admin/admin');
  }
  
  Admin.findById(id, function (err, user) {
    if(err){
      logger.error('编辑用户时数据库读取出错');
      req.flash('info', '系统错误，请重试');
      return res.redirect('/admin/admin');
    }

    if(!user){
      logger.debug('未找到需要编辑的用户:'+id);
      req.flash('info', '未找到需要编辑的用户');
      return res.redirect('/admin/admin');
    }
    
    if(user.role.key == 3 && req.session.admin.role.key < 3){
      req.flash('info', '你的权限不够，无法编辑超级管理员账号');
      logger.debug('你的权限不够，无法编辑超级管理员账号:'+admin.username);
      return res.redirect('/admin/admin');
    }
    
    if(passwordOld || password1 || password2){
      if(passwordOld !== user.password){
        req.flash('info', '旧密码输入有误');
        return res.redirect('/admin/admin');
      }
    }
    
    var $set = {
      role: database.Role.create(role)
    }
    if(password1){
      $set.password = password1;
    }
    user.update({$set: $set}, function(err){
      if(err){
        logger.error('更新用户账号时数据库操作出错:'+err.message);
        req.flash('info', err.message);
      }
      res.saveOperation('更新了用户信息,username:'+user.username);
      return res.redirect('/admin/admin');
    })
  });
}

/**
删除用户接口
>超级管理员无法被删除
>管理员可以删除除了超级管理员的所有账号
>管理员级别以下的用户可以删除自己的账号
@method delete
@param req {HttpRequest} http请求
@param res {HttpResponse} http响应
**/
exports.delete = function(req, res){
  var admin = req.session.admin;
  if(!admin){
    req.flash('info', '');
    return res.redirect('/admin/login');
  }
  var id = req.param('id');
  if(!id){
    req.flash('info', '请指定需要删除的管理人员');
    logger.debug('删除用户操作ID丢失');
    return res.redirect('/admin/admin');
  }
  if(admin.role.key <= 2 && admin._id != id){
    req.flash('info', '您的级别不够，无法删除他人帐号');
    logger.debug('权限不够，无法删除他人帐号:'+admin.username);
    return res.redirect('/admin/admin');
  }
  Admin.findById(id, function (err, user) {
    if(err){
      logger.error('删除用户时数据库读取出错');
      return res.redirect('/admin/admin');
    }
    if(user){
      if(user.role.key == 3){
        req.flash('info', '该用户被锁定，您无权删除');
        logger.debug('该用户被锁定，您无权删除');
        return res.redirect('/admin/admin');
      }
      user.remove(function(err){
        if(err){
          logger.error('删除用户时数据库删操作出错');
          req.flash('info', err.message);
        }
        res.saveOperation('删除了用户:'+user.username);
        return res.redirect('/admin/admin');
      });
    }else{
      req.flash('info', '未找到需要删除的用户');
      logger.debug('未找到需要删除的用户:'+id);
      return res.redirect('/admin/admin');
    }
  });
  
}

