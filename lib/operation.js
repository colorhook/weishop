/**
@author hk1k
**/
var database = require('../model/database');
var logger = require('./logger');
var Operation = database.Operation;

/**
通过admin, ip, action记录后台操作
@method add
**/
var add = function(admin, ip, action){
  if(!admin || !action){
    return;
  }
  var username = admin.username;
  logger.log('*Operation* username:' + username + ',action:'+action + ',ip:'+ip);
  new Operation({
    username: username,
    action: action,
    ip: ip,
    time: Date.now()
  }).save(function(err){
    if(err){
      logger.error('添加Operation出错, action:'+action);
    }
  });
}

//express middleware
module.exports = function(){
  return function(req, res, next){
    var ip = req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    
    res.saveOperation = function(action){
      add(req.session.admin || res.locals.admin, ip, action);
    };
    next();
  }
}