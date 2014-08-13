exports.submit = function(req, res, next){
  var data = {};
  var company = req.param('company');
  var banner1 = req.param('banner1');
  var banner2 = req.param('banner2');
  var banner3 = req.param('banner3');
  var banners = [];
  if(banner1.length){
    banners.push(banner1);
  }
  if(banner2.length){
    banners.push(banner2);
  }
  if(banner3.length){
    banners.push(banner3);
  }
  data.company = company;
  data.banners = banners;
  req.params.data = data;
  next();
}