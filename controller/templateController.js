var database = require('../model/database');
var Template = database.Template;


function getNameOrPath(name, path, callback){
  Template.find({name: name}, function(err, data){
    if(data && data.length){
      return callback(null, data[0]);
    }
    Template.find({path: path}, function(err2, data){
      if(data && data.length){
        return callback(null, data[0]);
      }
      return callback('not exist');
    });
  });
}


function insert(name, path, callback){
  getNameOrPath(name, path, function(e, t){
    if(t){
      return callback('template existed');
    }
    new Template({
      name: name,
      path: path
    }).save(callback);
  });
}

exports.index = function(req, res){
  Template.find({}, function(err, data){
    res.render('admin/template.html', {
      items: data,
      info: req.flash('info')
    })
  });
}

exports.action = function(req, res){
  var id = req.param('id');
  var name = req.param('name');
  var path = req.param('path');
  
  if(req.session.admin.role.key < 3){
    return res.redirect('admin/permission-error');
  }

  if(!id){
    insert(name, path, function(err, data){
      if(err){
        req.flash('info', '添加失败！请重试'); 
      }
      return res.redirect('/admin/template');
    });
  }else{
    Template.findById(id, function (err, template) {
      if(!template){
        req.flash('info', '修改出错！该模板不存在');
        return res.redirect('/admin/template');
      }

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
            req.flash('info', err.message);
          }
          return res.redirect('/admin/template');
        })
        
      });
      
    });
  }
}

exports.delete = function(req, res){
  if(req.session.admin.role.key < 3){
    return res.redirect('admin/permission-error');
  }
  
  var id = req.param('id');
  
  if(!id){
    req.flash('info', '请指定需要删除的套餐');
    return res.redirect('/admin/template');
  }
  Template.findById(id, function (err, template) {
    if(template){
      template.remove(function(err){
        if(err){
          req.flash('info', err.message);
        }
        return res.redirect('/admin/template');
      })
    }else{
      req.flash('info', '未找到需要删除的模板');
      return res.redirect('/admin/template');
    }
  });
}