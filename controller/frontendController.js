/**
@author hk1k
**/
var path = require('path');
var nunjucks = require('nunjucks');
var logger = require('../lib/logger');
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
@method index
**/
exports.index = function(req, res){
  var page = req.param('page') || 'index';
  var shopid = req.params.shop || req.param('shop');

  if(!shopid){
    req.flash('info', '店铺ID丢失');
    logger.debug('微信店铺首页，店铺ID丢失');
    return res.redirect('/error');
  }
  Shop.findById(shopid, function(err, shop){
    if(!shop){
      req.flash('info', '店铺不存在');
      logger.warn('微信店铺首页，店铺未找到:'+shopid);
      return res.redirect('/error');
    }
    var templateid = shop.template;
    
    if(!templateid){
      req.flash('info', '店铺模板未设置');
      logger.warn('微信店铺首页，店铺模板未设置:'+shopid);
      return res.redirect('/error');
    }
    Template.findById(templateid, function(err, template){
      if(!template){
        req.flash('info', '店铺模板不存在');
        logger.error('微信店铺首页，店铺模板不存在:'+shopid);
        return res.redirect('/error');
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
        if(err){
          logger.error('微信店铺首页，店铺获取模板失败:'+shopid);
          req.flash('info', '微信店铺模板出错');
          return res.redirect('/error');
        }
        var result;
        try{
          result = tmp.render({
            template_root: template_root,
            shop: shop,
            data: data,
          });
        }catch(err){
          logger.error('微信店铺首页，店铺渲染模板失败:'+shopid);
          req.flash('info', '微信店铺模板数据出错');
          return res.redirect('/error');
        }
        res.end(result);
      });
    });
  });
}

/**
店铺ID未设置或者店铺ID设置不对或者该店铺模板数据未定义都将跳转到该页面
@method error
**/
exports.error = function(req, res){
  res.render('error.html', {
    info: req.flash('info')
  });
}