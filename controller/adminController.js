var database = require('../model/database');


exports.index = function(req, res){
  if(options.username === 'admin'){
    return callback(null);
  }
  return callback('username is error');
}

exports.login = function(req, res){
  
}

exports.add = function(req, res){
  
}


exports.addAdmin = function(){
  var admin = new database.Admin({ username: 'admin', password: 'a1s2d3f4' });
  admin.save(function(err){
    if(err){
      return console.log(err);
    }
    console.log('success');
  });
}