/*!
@author hk1k
*/
exports.submit = function(req, callback){
  var data = {};
  
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
  
  var ad_img1 = req.param('ad_img1');
  var ad_link1 = req.param('ad_link1');
  var ad_img2 = req.param('ad_img2');
  var ad_link2 = req.param('ad_link2');
  var ad_img3 = req.param('ad_img3');
  var ad_link3 = req.param('ad_link3');
  
  data.ad_img1 = ad_img1;
  data.ad_img2 = ad_img2;
  data.ad_img3 = ad_img3;
  
  data.ad_link1 = ad_link1;
  data.ad_link2 = ad_link2;
  data.ad_link3 = ad_link3;
  
  data.style = req.param('style');
  
  data.banners = banners;
  req.params.data = data;
  callback();
}