exports.index = function(req, res){
  
  var list = [];
  res.render('admin/shop.html', {
    list: list
  });
}