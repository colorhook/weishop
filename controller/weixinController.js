/**
@author hk1k
**/
var database = require('../model/database');
var logger = require('../lib/logger');
var Shop = database.Shop;

/**
当收到微信订阅消息后，通过weixin OpenID来查找对应的店铺
@method subscribe
@param {String} weixinID weixin OpenID
@param {Function} callback 订阅恢复信息的回调
**/
exports.subscribe = function(weixinID, callback){
  
  logger.info('收到订阅请求, weixin OpenID:' + weixinID);
  
  var defaults = [{
    title: '欢迎订阅32like',
    description: '再不好好营店，就把你嫁给知识分子！',
    picurl: 'http://weishop.zmzp.cn/img/subscribe.png',
    url: 'http://weishop.zmzp.cn'
  }];
  Shop.find({weixinID: weixinID}, function(err, shop){
    if(!shop || shop.length == 0){
      logger.error('没有通过weixinID找到店铺，weixinID: '+ weixinID);
      return calback('shop not found', defaults);
    }
    shop = shop[0];
    if(!shop.subscribe || !shop.subscribe.title){
      logger.error('店铺的订阅设置不正确，shop: '+ shop.id);
      return callback(null, defaults);
    }
    logger.info('推送订阅内容, shop: ' + shop.id + ', subscribe: ' + JSON.stringify(shop.subscribe));
    callback(null, [{
      title: shop.subscribe.title,
      description: shop.subscribe.description,
      picurl: shop.subscribe.img,
      url: 'http://weishop.zmzp.cn/shop/' + shop._id
    }]);
  });
}