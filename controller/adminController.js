exports.login = function(username, password, callback){
  if(username === 'admin'){
    return callback(null);
  }
  return callback('username is error');
}