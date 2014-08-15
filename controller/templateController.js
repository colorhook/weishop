/**
@author hk1k
**/
var database = require('../model/database');
var logger = require('../lib/logger');
var Template = database.Template;

/**
通过name或者path来获取模板
@method getNameOrPath
@param {String} name 模板名称
@param {String} path 模板路径
**/
function getNameOrPath(name, path, callback){
  Template.find({name: name}, function(err, data){
    if(data && data.length){
      return callback(null, data[0]);
    }
    Template.find({path: path}, function(err2, data){
      if(data && data.length){
        return callback(null, data[0]);
      }
      return callback(new Error('not exist'));
    });
  });
}

/**
向数据库中新增一个模板
@method insert
@param {String} name 模板名称
@param {String} path 模板路径
**/
function insert(name, path, callback){
  getNameOrPath(name, path, function(e, t){
    if(t){
      return callback(new Error('template existed'));
    }
    new Template({
      name: name,
      path: path
    }).save(callback);
  });
}

/**
模板首页
@method index
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.index = function(req, res){
  Template.find({}, function(err, data){
    if(err){
      logger.error('模板首页获取模板列表失败');
      req.flash('info', '获取模板列表失败');
      res.redirect('/admin/error');
    }
    res.render('admin/template.html', {
      items: data,
      info: req.flash('info')
    })
  });
}

/**
模板表单处理
@method action
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.action = function(req, res){
  var id = req.param('id');
  var name = req.param('name');
  var path = req.param('path');
  
  if(req.session.admin.role.key < 3){
    logger.debug('模板处理权限不够,username:'+req.session.admin.username);
    return res.redirect('/admin/permission-error');
  }

  if(!id){
    insert(name, path, function(err, data){
      if(err){
        logger.error('添加模板时数据库删操作失败:'+err.message);
        req.flash('info', '添加失败！请重试'); 
      }
      res.saveOperation('新增了模板'+data.name);
      return res.redirect('/admin/template');
    });
  }else{
    Template.findById(id, function (err, template) {
      if(!template){
        req.flash('info', '修改出错！该模板不存在');
        logger.warn("修改模板时，没有通过ID找到该模板:"+id);
        return res.redirect('/admin/template');
      }
      
      var oldname = template.name;
      
      var $set = {
        name: name,
        path: path
      }
      
      getNameOrPath(name, path, function(e, t){
        if(t){
          req.flash('info', '该模板已经存在，请重新设置名称和路径');
          return res.redirect('/admin/template');
        }
        
        template.update({$set: $set}, function(err){
          if(err){
            logger.error('更新模板时数据库删操作失败:'+err.message);
            req.flash('info', err.message);
          }
          var msg;
          if(oldname != name){
            msg = '由' + oldname + '变为了' + name;
          }else{
            msg = name;
          }
          res.saveOperation('更新了模板'+msg);
          return res.redirect('/admin/template');
        })
        
      });
      
    });
  }
}


/**
删除模板表单处理
@method delete
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.delete = function(req, res){
  if(req.session.admin.role.key < 3){
    logger.debug('删除模板处理权限不够,username:'+req.session.admin.username);
    return res.redirect('/admin/permission-error');
  }
  
  var id = req.param('id');
  
  if(!id){
    logger.debug('删除模板时，ID不能为空');
    req.flash('info', '请指定需要删除的套餐');
    return res.redirect('/admin/template');
  }
  Template.findById(id, function (err, template) {
    if(template){
      var name = template.name;
      template.remove(function(err){
        if(err){
          logger.error('删除模板时数据库删操作失败:'+err.message);
          req.flash('info', err.message);
        }
        res.saveOperation('删除了模板:'+name);
        return res.redirect('/admin/template');
      })
    }else{
      req.flash('info', '未找到需要删除的模板');
      logger.debug('删除模板时，未找到需要删除的模板:'+id);
      return res.redirect('/admin/template');
    }
  });
}