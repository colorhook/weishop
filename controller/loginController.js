/**
@author hk1k
**/
var logger = require('../lib/logger');
var adminController = require('./adminController');


/**
登录首页渲染
@method index
**/
exports.index = function(req, res){
  if(req.session.admin){
    return res.redirect('/admin');
  }
  adminController.loginByToken(req.cookies.admin, req.cookies.lastToken, function(err, admin){
    if(admin){
      req.session.admin = admin;
      res.locals.admin = admin;
      logger.info(admin.username + '通过token登录');
      return res.redirect('back');
    }
    res.render('admin/login.html', {
      loginError: req.session.loginError
    });
  });
}


/**
登录表单
@method login
**/
exports.login = function(req, res){
  
  var username = req.param('username');
  var password = req.param('password');
  var remember = req.param('remember');
  var sid = req.cookies['connect.sid'];
  adminController.login(username, password, function(err, admin){
    if(err){
      logger.debug('登录失败, username:'+username)
      req.session.loginError = true;
      return res.redirect('/admin/login');
    }else{
      delete req.session.loginError;
      req.session.admin = admin;
      res.locals.admin = admin;
      logger.info(admin.username + '通过用户名密码登录');
      if(remember){
        res.cookie('admin', username, {maxAge: 7 * 24 * 60 * 60 * 1000});
        res.cookie('lastToken', sid,  {maxAge: 7 * 24 * 60 * 60 * 1000});
      }else{
        res.clearCookie ('admin');
        res.clearCookie ('lastToken');
      }
      return res.redirect('/admin');
    }
  }, remember ? sid : null);
}

/**
登出表单
@method logout
**/
exports.logout = function(req, res){
  if(!req.session.admin){
    return;
  }
  logger.info(admin.username + '登出系统');
  delete req.session.admin;
  res.clearCookie ('admin');
  res.clearCookie ('lastToken');
  res.redirect('/admin/login');
}