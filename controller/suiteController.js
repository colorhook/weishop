var database = require('../model/database');
var Suite = database.Suite;


function insert(name, price, note, callback){
  Suite.find({name: name}, function(err, data){
    if(data && data.length){
      return callback('suite existed');
    }
    new Suite({
      name: name,
      price: price,
      note: note
    }).save(callback);
  });
}

exports.index = function(req, res){
  Suite.find({}, function(err, data){
    res.render('admin/suite.html', {
      items: data,
      info: req.flash('info')
    })
  });
}

exports.action = function(req, res){
  var id = req.param('id');
  var name = req.param('name');
  var price = req.param('price');
  var note = req.param('note');
  
  if(req.session.admin.role.key < 2){
    return res.redirect('/admin/permission-error');
  }

  if(!id){
    insert(name, price, note, function(err, data){
      if(err){
        req.flash('info', '添加失败！请重试'); 
      }
      return res.redirect('/admin/suite');
    });
  }else{
    Suite.findById(id, function (err, suite) {
      if(!suite){
        req.flash('info', '修改出错！该套餐不存在');
        return res.redirect('/admin/suite');
      }

      var $set = {
        name: name,
        price: price,
        note: note
      }
      Suite.find({name: name}, function(err, data){
        if(data && data.length && data[0].id !== id){
          req.flash('info', '修改失败！套餐名称已经存在，请重新设置套餐名称');
          return res.redirect('/admin/suite');
        }
        suite.update({$set: $set}, function(err){
          if(err){
            req.flash('info', err.message);
          }
          return res.redirect('/admin/suite');
        });
      });
    });
  }
}

exports.delete = function(req, res){
  if(req.session.admin.role.key < 2){
    return res.redirect('/admin/permission-error');
  }
  
  var id = req.param('id');
  
  if(!id){
    req.flash('info', '请指定需要删除的套餐');
    return res.redirect('/admin/suite');
  }
  Suite.findById(id, function (err, suite) {
    if(suite){
      suite.remove(function(err){
        if(err){
          req.flash('info', err.message);
        }
        return res.redirect('/admin/suite');
      });
    }else{
      req.flash('info', '未找到需要删除的套餐');
      return res.redirect('/admin/suite');
    }
  });
}