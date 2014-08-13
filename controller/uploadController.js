var fs = require('fs');
var path = require('path');

function uuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

exports.upload = function(req, res){
  var json = {};
  
  if(!req.session.admin){
    json.code = 500;
    json.message = 'please login first';

  }else if(req.session.admin.role.key < 1){
    json.code = 501;
    json.message = 'permission deny';
  }
  
  if(json.code){
    res.end(JSON.stringify(json));
  }
  
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    var id = uuid();
    var extname = path.extname(filename);
    var newName = id + extname;
    
    fstream = fs.createWriteStream(__dirname + '/../upload/' + newName);
    file.pipe(fstream);
    fstream.on('close', function () {
      json.code = 200;
      json.message = 'success'
      json.img = '/upload/' + newName;
      res.end(JSON.stringify(json));
    });
    fstream.on('error', function (e) {
      json.code = 510;
      json.message = e.message || e;
      res.end(JSON.stringify(json));
    });
  });
  
  
}