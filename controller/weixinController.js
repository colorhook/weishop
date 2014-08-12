var database = require('../model/database');
var Shop = database.Shop;

exports.subscribe = function(weixinID, callback){
  console.log(weixinID);
  Shop.find({weixinID: weixinID}, function(err, shop){
    if(!shop || shop.length == 0){
      return calback('shop not found');
    }
    shop = shop[0];
    if(!shop.subscribe || !shop.subscribe.title){
      shop.subscribe = {
        title: '欢迎订阅32like',
        description: '大风起兮云飞扬，安的猛士兮走四方',
        img: 'http://oldimg.brandcn.com/UploadFiles_9675/201209/2012091011571822.jpg'
      }
      //return callback('shop setting is not completed');
    }
    console.log(shop);
    callback(null, [{
      title: shop.subscribe.title,
      description: shop.subscribe.description,
      picurl: shop.subscribe.img,
      url: 'http://weishop.zmzp.cn/shop/' + shop._id
    }]);
  });
}