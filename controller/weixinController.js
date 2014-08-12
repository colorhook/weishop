var database = require('../model/database');
var Shop = database.Shop;

exports.subscribe = function(weixinID, callback){
  Shop.find({weixin: weixinID}, function(err, shop){
    if(!shop){
      return calback('shop not found');
    }
    if(!shop.subscribe || !shop.subscribe.title){
      //return callback('shop setting is not completed');
    }
    callback(null, {
      title: shop.subscribe.title,
      description: shop.subscribe.description,
      picurl: shop.subscribe.img,
      url: 'http://weishop.zmzp.cn/' + shop.id
    });
  });
}