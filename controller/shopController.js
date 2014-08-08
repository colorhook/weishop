exports.index = function(req, res){
  var list = [];
  res.render('admin/shop.html', {
    list: list
  });
}

exports.add = function(req, res){
  res.render('admin/shop-edit.html', {
    mode: 'add',
    templates:{
      'normal': [
        {key: 'simple', value: '简约'}
      ],
      'advanced': [
      ]
    }
  });
}

exports.edit = function(req, res){
  res.render('admin/shop-edit.html', {
    mode: 'edit',
    name: 'sn',
    weixin: 'weixin',
    price: 201,
    company: '公司',
    address: '地址',
    tel: '电话',
    shopTypes: [{key: 'normal', value:'普及型'}],
    template: 'simple',
    templates: {
      'normal': [
        {key: 'simple', value: '简约'}
      ],
      'advanced': [
      ]
    },
    note: '备注'
  });
}

exports.insert = function(req, res){
 var params = req.params;
  console.log(params);
}