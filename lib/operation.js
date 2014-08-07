var database = require('../model/database');
var logger = require('./logger');
var Operation = database.Operation;

exports.add = function(action){
  if(!action){
    return;
  }
  var admin = global.app.local.admin;
  if(!admin){
    return;
  }
  var user = admin.user;
  new Operation({
    user: user,
    action: action,
    time: Date.now()
  }).save(function(err){
    if(err){
      logger.error('添加Operation出错,action:'+action);
    }
  });
}