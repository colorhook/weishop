var database = require('../model/database');
var logger = require('./logger');
var Operation = database.Operation;


var add = function(admin, ip, action){
  if(!admin || !action){
    return;
  }
  var username = admin.username;
  new Operation({
    username: username,
    action: action,
    ip: ip,
    time: Date.now()
  }).save(function(err){
    if(err){
      logger.error('添加Operation出错,action:'+action);
    }
  });
}

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