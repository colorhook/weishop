var path = require('path');
var nunjucks = require('nunjucks');

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


/**
微信推送过去的被订阅消息将推送一个图文首页，该首页的点开首页将是这个页面
**/

exports.index = function(req, res){
  var page = req.param('page') || 'index';
  var shopid = req.params.shop || req.param('shop');

  if(!shopid){
    req.flash('info', '店铺ID丢失');
    return res.redirect('/error.html');
  }
  Shop.findById(shopid, function(err, shop){
    if(!shop){
      req.flash('info', '店铺不存在');
      return res.redirect('/error.html');
    }
    var templateid = shop.template;
    
    if(!templateid){
      req.flash('info', '店铺模板未设置');
      return res.redirect('/error.html');
    }
    Template.findById(templateid, function(err, template){
      if(!template){
        req.flash('info', '店铺模板不存在');
        return res.redirect('/error.html');
      }
      var template_root = '/templates/' + template.path;
      //渲染模板
      var data;
      try{
        data = JSON.parse(shop.data);
      }catch(err){
        data = {}
      }
      env.getTemplate(template.path + '/' + page + '.html', function(err, tmp){
        var result = tmp.render({
          template_root: template_root,
          shop: shop,
          data: data,
        });
        res.end(result);
      });
    });
  });
}

/**
店铺ID未设置或者店铺ID设置不对或者该店铺模板数据未定义都将跳转到该页面
**/
exports.error = function(req, res){
  res.render('error.html', {
    info: req.flash('info')
  });
}