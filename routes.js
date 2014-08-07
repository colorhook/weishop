'use strict';
var config = require('./config');

var loginController = require('./controller/loginController');
var adminController = require('./controller/adminController');
var memberController = require('./controller/memberController');
var templateController = require('./controller/templateController');
var shopController = require('./controller/shopController');

module.exports = function(app){

  app.get(['/', '/index.htm', '/index.html'], function(req, res) {
    res.render('index.html', {
      title: ''
    });
  });
  
  app.get('/admin/login', loginController.index)
  app.post('/admin/login', loginController.login);
  app.all('/admin/logout', loginController.logout);
  
  app.all(['/admin', '/admin/*'], function(req, res, next) {
    if(req.session.admin){
      require('nunjucks/src/globals').admin = req.session.admin;
      return next();
    }
    res.redirect('/admin/login?redirect='+req.url);
  });
  
  app.get(['/admin', '/admin/index.html'], function(req, res, next){
    res.redirect('/admin/admin');
  });
   
  app.get('/admin/admin', adminController.index);
  app.post('/admin/admin/add', adminController.add);
  //app.get('/admin/admin/:id', adminController.get);
  
  app.get('/admin/member', memberController.index);
  app.get('/admin/template', templateController.index);
  
  app.get('/admin/shop', shopController.index);
  app.post('/admin/shop', shopController.insert);
  app.get('/admin/shop/add', shopController.add);
  app.get('/admin/shop/:id', shopController.edit);
  
  
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