/**
@author hk1k
**/
var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');

var database = require('../model/database');
var Operation = database.Operation;

/**
操作记录首页渲染
@method index
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
    if(err){
      logger.error('操作记录页面，获取操作记录列表失败');
      req.flash('获取操作记录失败');
      return res.redirect('/admin/error');
    }
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
@method delete
**/
exports.delete = function(req, res){
  var id = req.param('id');
  if(!id){
    req.flash('info', '请指定需要删除的操作记录');
    logger.debug('需要指定要删除的操作记录的ID');
    return res.redirect('/admin/shop');
  }
  if(req.session.admin.role.key < 3){
    logger.warn('你无权删除操作记录, user: ' + req.session.admin.username);
    return res.redirect('/admin/permission-error');
  }
  Operation.findById(id, function (err, operation) {
    if(operation){
      var msg = JSON.stringify(operation);
      operation.remove(function(err){
        if(err){
          req.flash('info', err.message);
        }
        logger.warn(req.session.admin.username + '删除了操作记录:' + msg);
        return res.redirect('/admin/operation');
      });
    }else{
      req.flash('info', '未找到需要删除的操作记录');
      logger.debug('为找到要删除的操作记录,id:'+id);
      return res.redirect('/admin/operation');
    }
  });
}