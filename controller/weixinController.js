var database = require('../model/database');
var Shop = database.Shop;
var Template = database.Template;

exports.subscribe = function(weixinID, callback){
  Shop.find({weixin: weixinID}, function(err, shop){
    if(!shop){
      return calback('not found');
    }
    callback(null, {
      title: '',
      description: '',
      picurl: '',
      url: ''
    });
  });
}