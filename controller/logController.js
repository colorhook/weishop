var path = require('path');
var fileutil = require('fileutil');


function getAllLogs(){
  return fileutil.list(path.normalize(__dirname + "/../logs"), {
    excludeDirectory: true, //不包含文件夹
    excludeFile: false, //包含文件
    matchFunction: function(item){
      return item.name.match(/\.log$/);
    }
  });
}

/**
日志首页渲染
**/
exports.index = function(req, res){
  var page = req.params.page || req.param('page');
  page = Number(page);
  if(isNaN(page) || page < 1){
    page = 1;
  }
  var pageCount = 20;
  var count;
  var size;
  
  var files = getAllLogs();
  var data = [];
  count = data.length;
  size = Math.ceil(count/pageCount) || 1;
  var list = data.slice((page - 1) * pageCount, (page - 1) * pageCount + pageCount);
  res.render('admin/log.html', {
    list: list,
    page: page,
    size: size,
    count: count
  });
}

/**
查看某个日志文件
**/
exports.file = function(){
}
