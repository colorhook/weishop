var fs = require('fs');
var os = require('fs');
var path = require('path');


var cachePool = {};

exports.combo = function(req, res){
  var url = req.url;
  
  if(cachePool[url]){
    return res.end(cachePool[url]);
  }
  
  url = url.replace(/^\/combo(\/)?/, '');

  var dir;
  var files = [];
  if(url.indexOf("??") !== -1){
    dir = url.split("??")[0] || "";
    files = url.split("??")[1].split(",");
  }else{
    dir = "";
    files = [url];
  }
  var topDirMap = {
    "css": __dirname + "/../public/css",
    "js": __dirname + "/../public/js",
    "lib": __dirname + "/../public/lib",
    "templates": __dirname + "/../templates"
  }
  var filterFiles = [];
  files.forEach(function(item){
    item = path.normalize(dir + "/" + item);
    var splits = item.match(/\/?([^\/]*)\/(.*)/);
    if(!splits){
      return;
    }
    var topDir = splits[1];
    var f = splits[2];
    topDir = topDirMap[topDir];
    if(!topDir){
      return;
    }
    f = path.normalize(topDir + "/" + f);
    if(filterFiles.indexOf(f) == -1){
      filterFiles.push(f);
    }
  });
  var html = [];
  filterFiles.forEach(function(file){
    try{
      html.push(fs.readFileSync(file, 'utf-8'));
    }catch(err){
    }
  });
  var result = html.join(os.EOL + os.EOL);
  cachePool[req.url] = result;
  res.end(result);
};