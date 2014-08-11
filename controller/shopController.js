var database = require('../model/database');
var Suite = database.Suite;
var Template = database.Template;
var Shop = database.Shop;


function getTemplates(callback){
  Template.find({}, callback); 
}
function getSuites(callback){
  Suite.find({}, callback);
}
function getSuitesAndTemplates(callback){
  getSuites(function(err, suites){
    if(err){
      return callback(err);
    }else{
      getTemplates(function(er, templates){
        if(err){
          return callback(err);
        }
        callback(null, suites, templates);
      });
    }
  });
}

exports.index = function(req, res){
  var page = req.params.page || req.param('page');
  page = Number(page);
  if(isNaN(page) || page < 1){
    page = 1;
  }
  var pageCount = 20;
  var count;
  var size;
  
  getSuitesAndTemplates(function(err, suites, templates){
    var suitesPool = {}, templatesPool = {};
    suites.forEach(function(item){
      suitesPool[item._id] = item.name;
    });
    templates.forEach(function(item){
      templatesPool[item._id] = item.name;
    });
    Shop.find({}, function(err, data){
      data.forEach(function(item){
        item.suiteName = suitesPool[item.suite];
        item.templateName = templatesPool[item.template];
      });
      count = data.length;
      size = Math.ceil(count/pageCount) || 1;
      var list = data.slice((page - 1) * pageCount, (page - 1) * pageCount + pageCount);
      res.render('admin/shop.html', {
        list: list,
        page: page,
        size: size,
        count: count
      });
    });
  });
  
}

exports.add = function(req, res){
  getSuitesAndTemplates(function(err, suites, templates){
    if(err){
      return res.redirect('/admin/permission-error');
    }
    res.render('admin/shop-edit.html', {
      mode: 'add',
      info: req.flash('info'),
      templates: templates,
      suites: suites
    });
  });
}

exports.edit = function(req, res){
  var id = req.params.id || req.param('id');

  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  
  if(!id){
    return res.redirect('/admin/permission-error');
  }

  Shop.findById(id, function(e, shop){
    if(!shop){
      return res.redirect('/admin/permission-error');
    }
    
    getSuitesAndTemplates(function(err, suites, templates){
      if(err){
        req.flash('info', err.message);
        return res.render('/admin/shop/edit/'+id);
      }
      res.render('admin/shop-edit.html', {
        mode: 'edit',
        id: id,
        info: req.flash('info'),
        name: shop.name,
        url: shop.url,
        customer: shop.customer,
        weixin: shop.weixin,
        tel: shop.tel,
        suites: suites,
        templates: templates,
        suite: shop.suite,
        creator: shop.creator,
        template: shop.template,
        note: shop.note
      });
    });
    
  });
}



exports.action = function(req, res){
  if(req.param('mode') === 'add'){
    exports.insert(req, res);
  }else{
    exports.update(req, res);
  }
}
exports.insert = function(req, res){
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  var name = req.param('name');
  var url = req.param('url');
  var customer = req.param('customer');
  var weixin = req.param('weixin');
  var tel = req.param('tel');
  var suite = req.param('suite');
  var template = req.param('template');
  var note = req.param('note');
  var creator = req.session.admin.username;
  var info;
  
  if(!name){
    info = '店铺名称不能为空';
  }else if(!url){
    info = '店铺网址不能为空';
  }else if(!customer){
    info = '客户姓名不能为空';
  }else if(!weixin){
    info = '微信号不能为空';
  }else if(!tel){
    info = '客户电话不能为空';
  }else if(!suite){
    info = '店铺套餐不能为空';
  }else if(!template){
    info = '店铺模板不能为空';
  }
  if(info){
    req.flash('info', info);
    return res.redirect('/admin/shop/add');
  }
  new Shop({
    name: name,
    url: url,
    customer: customer,
    weixin: weixin,
    tel: tel,
    suite: suite,
    template: template,
    creator: creator,
    note: note
  }).save(function(err){
    if(err){
      req.flash('info', err.message);
    }
    return res.redirect('/admin/shop');
  });
}

exports.update = function(req, res){
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  var id = req.params.id || req.param('id');
  var name = req.param('name');
  var url = req.param('url');
  var customer = req.param('customer');
  var weixin = req.param('weixin');
  var tel = req.param('tel');
  var suite = req.param('suite');
  var template = req.param('template');
  var note = req.param('note');
  
  var info;
  if(!id){
    info = '店铺id未找到';
  }else if(!name){
    info = '店铺名称不能为空';
  }else if(!url){
    info = '店铺网址不能为空';
  }else if(!customer){
    info = '客户姓名不能为空';
  }else if(!weixin){
    info = '微信号不能为空';
  }else if(!tel){
    info = '客户电话不能为空';
  }else if(!suite){
    info = '店铺套餐不能为空';
  }else if(!template){
    info = '店铺模板不能为空';
  }
  if(info){
    req.flash('info', info);
    return res.redirect('/admin/shop/edit/' + id);
  }
  
  Shop.findById(id, function (err, shop) {
    if(!shop){
      req.flash('info', '修改出错！该店铺不存在');
      return res.redirect('/admin/shop');
    }

    var $set = {
      name: name,
      url: url,
      customer: customer,
      weixin: weixin,
      tel: tel,
      suite: suite,
      template: template,
      note: note
    }

    shop.update({$set: $set}, function(err){
      if(err){
        req.flash('info', err.message);
      }
      return res.redirect('/admin/shop');
    })
  });
}