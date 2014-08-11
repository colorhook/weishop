'use strict';
var path = require('path');
var express = require('express');
var config = require('./config');

var loginController = require('./controller/loginController');
var adminController = require('./controller/adminController');
var suiteController = require('./controller/suiteController');
var templateController = require('./controller/templateController');
var shopController = require('./controller/shopController');

module.exports = function(app){
  
  app.use(express.static(path.join(__dirname, 'public')));
  require('nunjucks/src/globals').basepath = "";
  
  app.get(['/', '/index.htm', '/index.html'], function(req, res) {
    res.render('index.html', {
      title: ''
    });
  });
  
  app.get('/admin/permission-error', function(req, res){
    res.render('admin/permission-error.html');
  });
  
  app.get('/admin/login', loginController.index)
  app.post('/admin/login', loginController.login);
  app.all('/admin/logout', loginController.logout);
  
  app.all(['/admin', '/admin/*'], function(req, res, next) {
    if(req.session.admin){
      require('nunjucks/src/globals').admin = req.session.admin;
      return next();
    }
    res.redirect(prefix+'admin/login');
  });
  
  app.get(['/admin', '/admin/index.html'], function(req, res, next){
    res.redirect('/admin/shop');
  });
  
  app.get('/admin/shop', shopController.index);
  app.get('/admin/shop/add', shopController.add);
  app.get('/admin/shop/edit/:id', shopController.edit);
  app.all('/admin/shop/action', shopController.action);
  
  
  
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
  

  
  app.get('/config', function(req, res) {
    res.json(config);
  });

  app.get('/favicon.ico', function(req, res) {
    res.redirect(301, '/public/favicon.ico');
  });
    
  app.all('*', function(req, res) {
    res.send(404, '404');
  });
  
};