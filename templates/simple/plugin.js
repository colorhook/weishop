/*!
@author hk1k
*/
exports.submit = function(req, callback){
  var data = {};
  var slogan = req.param('slogan');
  var banner1 = req.param('banner1');
  var banner2 = req.param('banner2');
  var banner3 = req.param('banner3');
  var banners = [];
  
  if(banner1 && banner1.length){
    banners.push(banner1);
  }
  if(banner2 && banner2.length){
    banners.push(banner2);
  }
  if(banner3 && banner3.length){
    banners.push(banner3);
  }
  if(!banners.length){
    return callback(new Error('banner图必须要有一张'));
  }
  data.slogan = slogan;
  data.banners = banners;
  req.params.data = data;
  callback();
}