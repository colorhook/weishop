var logger = require('../lib/logger');
var adminController = require('./adminController');

exports.index = function(req, res){
  if(req.session.admin){
    return res.redirect('/admin');
  }
  res.render('admin/login.html', {
    loginError: req.session.loginError
  });
}


exports.login = function(req, res){
  
  var username = req.param('username');
  var password = req.param('password');
  
  adminController.login(username, password, function(err, admin){
    if(err){
      req.session.loginError = true;
      return res.redirect('/admin/login');
    }else{
      delete req.session.loginError;
      req.session.admin = admin;
      res.locals.admin = admin;
      return res.redirect('/admin');
    }
  });
}

exports.logout = function(req, res){
  delete req.session.admin;
  res.redirect('/admin/login');
}