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

  var prefix = config.prefix || "";
  
  app.use(prefix, express.static(path.join(__dirname, 'public')));
  require('nunjucks/src/globals').basepath = prefix;
  
  app.get([prefix+'/', prefix+'/index.htm', prefix+'/index.html'], function(req, res) {
    res.render('index.html', {
      title: ''
    });
  });
  
  app.get(prefix+'/admin/permission-error', function(req, res){
    res.render('admin/permission-error.html');
  });
  
  app.get(prefix+'/admin/login', loginController.index)
  app.post(prefix+'/admin/login', loginController.login);
  app.all(prefix+'/admin/logout', loginController.logout);
  
  app.all([prefix+'/admin', prefix+'/admin/*'], function(req, res, next) {
    if(req.session.admin){
      require('nunjucks/src/globals').admin = req.session.admin;
      return next();
    }
    res.redirect(prefix+'/admin/login');
  });
  
  app.get([prefix+'/admin', prefix+'/admin/index.html'], function(req, res, next){
    res.redirect(prefix+'/admin/shop');
  });
  
  app.get(prefix+'/admin/shop', shopController.index);
  app.get(prefix+'/admin/shop/add', shopController.add);
  app.get(prefix+'/admin/shop/edit/:id', shopController.edit);
  app.all(prefix+'/admin/shop/action', shopController.action);
  
  
  
  app.get(prefix+'/admin/suite', suiteController.index);
  app.post(prefix+'/admin/suite/action', suiteController.action);
  app.post(prefix+'/admin/suite/delete', suiteController.delete);
  
  app.get(prefix+'/admin/template', templateController.index);
  app.post(prefix+'/admin/template/action', templateController.action);
  app.post(prefix+'/admin/template/delete', templateController.delete);
  
  app.get(prefix+'/admin/admin', adminController.index);
  app.post(prefix+'/admin/admin/delete', adminController.delete);
  app.post(prefix+'/admin/admin/add', adminController.add);
  app.post(prefix+'/admin/admin/edit', adminController.edit);
  

  
  app.get(prefix+'/config', function(req, res) {
    res.json(config);
  });

  app.get(prefix+'/favicon.ico', function(req, res) {
    res.redirect(301, prefix+'/public/favicon.ico');
  });
    
  app.all('*', function(req, res) {
    res.send(404, '404');
  });
  
};