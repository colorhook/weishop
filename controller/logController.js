/**
@author hk1k
**/
var path = require('path');
var fileutil = require('fileutil');


function getAllLogs(){
  return fileutil.list(path.normalize(__dirname + "/../logs"), {
    excludeDirectory: true, //不包含文件夹
    excludeFile: false, //包含文件
    matchFunction: function(item){
      return item.name.match(/\.log$/);
    }
  }, true);
}

/**
日志首页渲染
**/
exports.index = function(req, res){
  var page = req.params.page || req.param('page');
  var type = req.params.type || req.param('type') || 'error';
  type = type.toLowerCase();
  if(['info', 'debug', 'warn', 'log'].indexOf(type) === -1){
    type = 'error';
  }
  page = Number(page);
  if(isNaN(page) || page < 1){
    page = 1;
  }
  var pageCount = 50;
  var count;
  var size;
  
  var files = getAllLogs();
  var data = [];
  files.forEach(function(item){
    var filename = item.filename;
    if(filename.indexOf(type) === 0){
      data.unshift(filename);
    }
  });
  
  count = data.length;
  size = Math.ceil(count/pageCount) || 1;
  var list = data.slice((page - 1) * pageCount, (page - 1) * pageCount + pageCount);
  res.render('admin/log.html', {
    list: list,
    type: type,
    page: page,
    size: size,
    count: count
  });
}

/**
查看某个日志文件
**/
exports.file = function(req, res){
  var admin = req.session.admin;
  if(admin.role.key < 3){
    return res.redirect('/admin/permission-error');
  }
  var file = req.params.file || req.param('file');
  var f = __dirname + '/../logs/' + file;
  var data = require('fs').readFileSync(f, 'utf-8');
  res.end(data);
}
