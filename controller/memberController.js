exports.index = function(req, res){
  
  var list = [];
  res.render('admin/member.html', {
    list: list
  });
}