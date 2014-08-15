/**
@author hk1k
**/
var database = require('../model/database');
var logger = require('../lib/logger');
var Suite = database.Suite;

/**
向数据库中新增套餐
@param {String} name 套餐名称
@param {Number} price 套餐价格
@param {String} note 套餐备注
@param {Function} callback 回调函数
**/
function insert(name, price, note, callback){
  Suite.find({name: name}, function(err, data){
    if(data && data.length){
      return callback(new Error('suite existed'));
    }
    new Suite({
      name: name,
      price: price,
      note: note
    }).save(callback);
  });
}

/**
套餐首页
@method index
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.index = function(req, res){
  Suite.find({}, function(err, data){
    if(err){
      logger.error('套餐首页获取套餐列表失败');
      req.flash('info', '获取套餐列表失败');
      res.redirect('/admin/error');
    }
    res.render('admin/suite.html', {
      items: data,
      info: req.flash('info')
    })
  });
}

/**
套餐表单处理
@method action
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.action = function(req, res){
  var id = req.param('id');
  var name = req.param('name');
  var price = req.param('price');
  var note = req.param('note');
  
  if(req.session.admin.role.key < 2){
    logger.debug('套餐处理权限不够,username:'+req.session.admin.username);
    return res.redirect('/admin/permission-error');
  }

  if(!id){
    insert(name, price, note, function(err, data){
      if(err){
        logger.error('新增店铺失败:'+err.message);
        req.flash('info', '添加失败！请重试'); 
      }
      res.saveOperation('新增了套餐' + data.name);
      return res.redirect('/admin/suite');
    });
  }else{
    Suite.findById(id, function (err, suite) {
      if(!suite){
        req.flash('info', '修改出错！该套餐不存在');
        logger.warn('修改出错！该套餐不存在:'+id);
        return res.redirect('/admin/suite');
      }
      
      var oldname = suite.name;
      var $set = {
        name: name,
        price: price,
        note: note
      }
      Suite.find({name: name}, function(err, data){
        if(data && data.length && data[0].id !== id){
          logger.debug('修改失败！套餐名称已经存在，请重新设置套餐名称');
          return res.redirect('/admin/suite');
        }
        suite.update({$set: $set}, function(err){
          if(err){
            logger.error('修改店铺失败:'+err.message);
            req.flash('info', err.message);
          }
          var msg;
          if(oldname == name){
            msg = name;
          }else{
            msg = '由' + oldname + '变为了' + name;
          }
          res.saveOperation('修改了套餐' + msg);
          return res.redirect('/admin/suite');
        });
      });
    });
  }
}
/**
删除套餐表单处理
@method delete
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.delete = function(req, res){
  if(req.session.admin.role.key < 2){
    logger.debug('套餐删除权限不够,username:'+req.session.admin.username);
    return res.redirect('/admin/permission-error');
  }
  
  var id = req.param('id');
  
  if(!id){
    req.flash('info', '请指定需要删除的套餐');
    return res.redirect('/admin/suite');
  }
  Suite.findById(id, function (err, suite) {
    if(suite){
      var name = suite.name;
      suite.remove(function(err){
        if(err){
          req.flash('info', err.message);
        }
        res.saveOperation('删除了套餐'+name);
        return res.redirect('/admin/suite');
      });
    }else{
      req.flash('info', '未找到需要删除的套餐');
      return res.redirect('/admin/suite');
    }
  });
}