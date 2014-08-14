var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');

var database = require('../model/database');
var Operation = database.Operation;



/**
操作记录首页渲染
**/
exports.index = function(req, res){
  var page = req.params.page || req.param('page');
  page = Number(page);
  if(isNaN(page) || page < 1){
    page = 1;
  }
  var pageCount = 20;
  var count;
  var size;
  
  Operation.find({}, function(err, data){
    count = data.length;
    size = Math.ceil(count/pageCount) || 1;
    var list = data.slice((page - 1) * pageCount, (page - 1) * pageCount + pageCount);
    res.render('admin/operation.html', {
      info: req.flash('info'),
      list: list,
      page: page,
      size: size,
      count: count
    });
  });
}

/**
删除操作记录
**/
exports.delete = function(req, res){
  var id = req.param('id');
  if(!id){
    req.flash('info', '请指定需要删除的操作记录');
    return res.redirect('/admin/shop');
  }
  if(req.session.admin.role.key < 3){
    return res.redirect('/admin/permission-error');
  }
  Operation.findById(id, function (err, operation) {
    if(operation){
      operation.remove(function(err){
        if(err){
          req.flash('info', err.message);
        }
        return res.redirect('/admin/operation');
      });
    }else{
      req.flash('info', '未找到需要删除的操作记录');
      return res.redirect('/admin/operation');
    }
  });
}