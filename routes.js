'use strict';
var config = require('./config');
var adminController = require('./controller/adminController');

module.exports = function(app){

  app.get(['/', '/index.htm', '/index.html'], function(req, res) {
    res.render('index.html', {
      title: ''
    });
  });
  
  app.get('/admin/login', function(req, res) {
    res.render('admin/login.html', {
      title: 'weishop - 登录'
    });
  }).post('/admin/login', function(req, res){
    var isUser = adminController.login(username, password);
    if(isUser){
      req.session.admin = username;
      return res.redirect('/admin');
    }
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
  
  
  
  app.get('/admin/admin', function(req, res){
  });
  app.get('/admin/admin/add', function(req, res){
  });
  app.post('/admin/admin/add', function(req, res){
  });
  app.get('/admin/admin/:id', function(req, res){
  });
  app.post('/admin/admin/:id', function(req, res){
  });
  
  app.get('/admin/member', function(req, res){
  });
  app.get('/admin/member/add', function(req, res){
  });
  app.post('/admin/member/add', function(req, res){
  });
  app.get('/admin/member/:id', function(req, res){
  });
  app.post('/admin/member/:id', function(req, res){
  });
  
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