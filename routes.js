'use strict';
var config = require('./config');
var adminController = require('./controller/adminController');
var memberController = require('./controller/memberController');
var templateController = require('./controller/templateController');

module.exports = function(app){

  app.get(['/', '/index.htm', '/index.html'], function(req, res) {
    res.render('index.html', {
      title: ''
    });
  });
  
  app.get('/admin/login', function(req, res) {
    res.render('admin/login.html', {
      loginError: req.session.loginError
    });
  }).post('/admin/login', function(req, res){
    var username = req.param('username');
    var password = req.param('password');
    console.log(req);
    adminController.login({
      username: username, 
      password: password
    }, function(err){
      if(err){
        req.session.loginError = true;
        return res.redirect('/admin/login');
      }else{
        delete req.session.loginError;
        return res.redirect('/admin');
      }
    });
  });
  
  app.get('/admin/logout', function(req, res){
    delete req.session.admin;
    res.redirect('/admin/login');
  });
  
  app.all(['/admin', '/admin/*'], function(req, res, next) {
    if(req.session.admin){
      return next();
    }
    res.redirect('/admin/login?redirect='+req.url);
  });
  
  app.get(['/admin', '/admin/index.html'], function(req, res, next){
    res.render('admin/index.html', {
      title: 'weishop - 管理后台'
    });
  });
  
  
  
  app.get('/admin/admin', adminController.index);
  app.post('/admin/admin/add', adminController.add);
  //app.get('/admin/admin/:id', adminController.get);
  
  app.get('/admin/member', memberController.index);
  app.get('/admin/template', templateController.index);
  
  app.get('/admin/shop', function(req, res){
  });
  app.get('admin/shop/add', function(req, res){
  });
  app.get('/admin/shop/:id', function(req, res){
  });
  app.post('/admin/shop/:id', function(req, res){
  });
  
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