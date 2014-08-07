var database = require('../model/database');
/**
@method insert
@param username {String} 用户名
@param password {String} 密码
@param role {Object} 角色
@param callback {Function} 回调函数
**/
function insert(username, password, role, callback){
  if(!username || !password){
    return callback('username and password are required');
  }
  if(!role){
    role = database.Role.create(0);
  }else if(!isNaN(role)){
    role = database.Role.create(role);
  }
  
  Admin.find({username: username}, function(err){
    if(err){
      return callback('The username ' + username + ' was existed');
    }
    var admin = new database.Admin({ username: username, password: password, role: role });
    admin.save(function(err){
      if(err){
        return callback('insert error:' + username);
      }
      callbac(null, admin);
    });
  });
}

exports.index = function(req, res){
  database.Admin.find({}, function(err, data){
    res.render('admin/admin.html', {
      users: data,
      roles: database.Role.all()
    })
  });
}

exports.login = function(username, password, callback){
   database.Admin.find({
     username:username, 
     password:password
   }, function(err, data){
     if(err || !data || !data.length){
       return callback('login error');
     }
     return callback(null, data[0]);
   });
}

exports.add = function(req, res){
  
}


