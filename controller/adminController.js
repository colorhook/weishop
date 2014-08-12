var database = require('../model/database');
var Admin = database.Admin;
/**
@method insert
@param username {String} 用户名
@param password {String} 密码
@param role {Int|Object} 角色
@param callback {Function} 回调函数
**/
function insert(username, password, role, callback){
  if(!username || !password){
    return callback('请输入用户名和密码');
  }
  if(!role){
    role = database.Role.create(0);
  }else if(!isNaN(role)){
    role = database.Role.create(role);
  }
  
  Admin.find({username: username}, function(err){
    if(err){
      return callback('用户名 ' + username + ' 已经存在');
    }
    var admin = new database.Admin({ username: username, password: password, role: role });
    admin.save(function(err){
      if(err){
        return callback('添加失败:' + err.message);
      }
      callback(null, admin);
    });
  });
}

exports.login = function(username, password, callback, sid){
  database.Admin.find({
   username:username, 
   password:password
  }, function(err, data){
    if(err || !data || !data.length){
     return callback('login error');
    }
    var $set = {loginTime: Date.now()};
    if(sid){ $set.sid = sid };
    data[0].update({$set: $set}).exec();
    return callback(null, data[0]);
  });
}

exports.loginByToken = function(username, sid, callback){
  if(!username || !sid){
    return callback('login error');
  }
  database.Admin.find({
     username:username, 
     sid:sid
   }, function(err, data){
     if(err || !data || !data.length){
       return callback('login error');
     }
     var admin = data[0];
     var loginTime = admin.loginTime;
     var diff = Date.now() - loginTime.getTime();
     if(diff < 7 * 24 * 60 * 60 * 1000){
       return callback(null, admin);
     }
     return callback('login timeout');
   });
}

exports.index = function(req, res){
  var maxKey = req.session.admin.role.key;
  Admin.find({}, function(err, data){
    res.render('admin/admin.html', {
      users: data,
      addInfo: req.flash('addInfo'),
      info: req.flash('info'),
      roles: database.Role.all(maxKey)
    })
  });
}


exports.add = function(req, res){
  var admin = req.session.admin;
  if(!admin){
    req.flash('addInfo', '请先登录');
    return res.redirect('/admin/login');
  }
  if(admin.role.key < 2){
    req.flash('addInfo', '您的级别不够，无法增加管理人员帐号');
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
  
  insert(username, password1, role, function(err){
    if(err){
      req.flash('addInfo', err);
    }
    res.redirect('/admin/admin');
  });
}


exports.edit = function(req, res){
  var admin = req.session.admin;
  if(!admin){
    req.flash('info', '请先登录');
    return res.redirect('/admin/login');
  }
  var username = req.param('username');
  var passwordOld = req.param('passwordOld');
  var password1 = req.param('password1');
  var password2 = req.param('password2');
  var role = parseInt(req.param('role'));
  var info;
  if(!username){
    info = '用户名不能为空';
  }else if(role > admin.role.key){
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
  
  Admin.findById(id, function (err, user) {
    if(!user){
      return res.redirect('/admin/admin');
    }
    
    if(passwordOld || password1 || password2){
      if(passwordOld !== user.password){
        req.flash('info', '旧密码输入有误');
        return res.redirect('/admin/admin');
      }
    }
    
    var $set = {
      username: username,
      role: database.Role.create(role)
    }
    if(password1){
      $set.password = password1;
    }
    user.update({$set: $set}, function(err){
      if(err){
        req.flash('info', err.message);
      }
      return res.redirect('/admin/admin');
    })
  });
}

exports.delete = function(req, res){
  var admin = req.session.admin;
  if(!admin){
    req.flash('info', '');
    return res.redirect('/admin/login');
  }
  if(admin.role.key < 2){
    req.flash('info', '您的级别不够，无法删除管理人员帐号');
    return res.redirect('/admin/admin');
  }
  var id = req.param('id');
  if(!id){
    req.flash('info', '请指定需要删除的管理人员');
    return res.redirect('/admin/admin');
  }
  Admin.findById(id, function (err, user) {
    if(user){
      if(user.role.key == 3){
        req.flash('info', '该用户被锁定，您无权删除');
        return res.redirect('/admin/admin');
      }
      user.remove(function(err){
        if(err){
          req.flash('info', err.message);
        }
        return res.redirect('/admin/admin');
      })
    }else{
      req.flash('info', '未找到需要删除的用户');
      return res.redirect('/admin/admin');
    }
  });
  
}

