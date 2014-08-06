'use strict';
var config = require('./config');

module.exports = function(app){

  app.get(['/', '/index.htm', '/index.html'], function(req, res) {
    res.render('index.html', {
      title: ''
    });
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