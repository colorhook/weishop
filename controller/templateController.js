exports.index = function(req, res){
  
  var list = [];
  res.render('admin/template.html', {
    list: list
  });
}