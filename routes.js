'use strict';
var path = require('path');
var express = require('express');
var config = require('./config');

var comboController = require('./controller/comboController');
var frontendController = require('./controller/frontendController');
var loginController = require('./controller/loginController');
var adminController = require('./controller/adminController');
var suiteController = require('./controller/suiteController');
var templateController = require('./controller/templateController');
var shopController = require('./controller/shopController');
var uploadController = require('./controller/uploadController');
var operationController = require('./controller/operationController');
var logController = require('./controller/logController');


module.exports = function(app){
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/upload', express.static(path.join(__dirname, 'upload')));
  app.use('/templates', express.static(path.join(__dirname, 'templates')));
  require('nunjucks/src/globals').basepath = "";
  
  app.get(['/combo', /\/combo.*/], comboController.combo);
  
  app.get('/shop/:shop', frontendController.index);
  
  app.get(['/error', '/error.html'], frontendController.error);
  
  app.get('/admin/error', function(req, res){
    res.render('admin/error.html', {
      info: req.flash('info'),
      backurl: req.flash('backurl')
    });
  });
  app.get('/admin/permission-error', function(req, res){
    res.render('admin/permission-error.html', {
      info: req.flash('info'),
      backurl: req.flash('backurl')
    });
  });
  
  app.get(['/', '/index.htm', '/index.html'], function(req, res){
    res.render('index.html');
  });
  
  app.get('/favicon.ico', function(req, res) {
    res.redirect(301, '/public/favicon.ico');
  });
  
  app.use(function(req, res, next){
    if(app.locals.databaseError){
      if(req.path == '/admin/error'){
        return next();
      }
      req.flash('info', '数据库连接不上，请刷新或稍后再试');
      return res.redirect('/admin/error')
    }
    next();
  })
  
  app.get('/admin/login', loginController.index);
  app.all('/admin/logout', loginController.logout);
  app.post('/admin/login', loginController.login);
  app.all('/admin/upload', uploadController.upload);
  
  app.all(['/admin', '/admin/*'], function(req, res, next) {
    if(req.session.admin){
      require('nunjucks/src/globals').admin = req.session.admin;
      return next();
    }
    res.redirect('/admin/login');
  });
  
  
  app.get(['/admin', '/admin/index.html'], function(req, res, next){
    res.redirect('/admin/shop');
  });
  
  app.get('/admin/shop', shopController.index);
  app.get('/admin/shop/add', shopController.add);
  app.get('/admin/shop/edit/:id', shopController.edit);
  app.all('/admin/shop/delete', shopController.delete);
  app.all('/admin/shop/action', shopController.action);
  app.all('/admin/shop/action/subscribe', shopController.subscribe);
  app.all('/admin/shop/action/template', shopController.template);
 
  app.get('/admin/suite', suiteController.index);
  app.post('/admin/suite/action', suiteController.action);
  app.post('/admin/suite/delete', suiteController.delete);
  
  app.get('/admin/template', templateController.index);
  app.post('/admin/template/action', templateController.action);
  app.post('/admin/template/delete', templateController.delete);
  
  app.get('/admin/admin', adminController.index);
  app.post('/admin/admin/delete', adminController.delete);
  app.post('/admin/admin/add', adminController.add);
  app.post('/admin/admin/edit', adminController.edit);
  
  app.get('/admin/operation', operationController.index);
  app.post('/admin/operation/delete', operationController.delete);
  
  app.get('/admin/log', logController.index);
  app.get('/admin/log/file/:file', logController.file);
    
  app.all('*', function(req, res) {
    res.redirect('/admin/error');
  });
  
};