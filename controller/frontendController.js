var path = require('path');
var nunjucks = require('nunjucks');
var NTemplate = require('nunjucks/src/environment').Template;

var database = require('../model/database');
var Shop = database.Shop;
var Template = database.Template;


//template
var env = nunjucks.configure('templates', {
  autoescape: true
});
env.addFilter('json', function(input){
  if(!input){
    return "";
  }
  return JSON.stringify(input);
});
env.addFilter('time', function(input, format){
  if(!input){
    return "";
  }
  return moment(input).format(format || "YYYY-MM-DD HH:mm:ss");
});

exports.index = function(req, res){
  var shopid = req.param('shop');
  
  Shop.findById(shopid, function(err, shop){
    var templateid = shop.template;
    Template.findById(templateid, function(err, template){
      var template_root = '/template/' + template.path;
      var dir = path.normalize(__dirname + '../template',  template.path);
      var tpl = fs.readFileSync(dir + '/index.html', 'utf-8');
      var tmpl = new NTemplate(tpl, env, dir, );
    });
  });
  
  tmpl.render({}, function(err, result) {
    if(err) {
        throw err;
     }
     res.end(result);
  });
}