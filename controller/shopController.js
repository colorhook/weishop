var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');

var database = require('../model/database');
var Suite = database.Suite;
var Template = database.Template;
var Shop = database.Shop;


/**
获取所有模板
**/
function getTemplates(callback){
  Template.find({}, callback); 
}
/**
获取所有主题
**/
function getSuites(callback){
  Suite.find({}, callback);
}
/**
获取所有主题和模板
**/
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
/**
店铺首页渲染
**/
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

/**
新增店铺页面渲染
**/
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

/**
编辑页面渲染
**/
exports.edit = function(req, res){
  
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  
  var id = req.params.id || req.param('id');
  var tab = req.params.tab || req.param('tab') || req.flash('tab');
  if(tab != 'template' && tab != 'weixin'){
    tab = 'basic';
  }
  if(!id){
    req.flash('info', '请指定店铺ID');
    req.flash('backurl', '/admin/shop');
    return res.redirect('/admin/error');
  }

  Shop.findById(id, function(e, shop){
    
    if(!shop){
      req.flash('info', '店铺ID' + id + '有误，没有找到该店铺');
      req.flash('backurl', '/admin/shop');
      return res.redirect('/admin/error');
    }
    
    getSuitesAndTemplates(function(err, suites, templates){
      if(err){
        req.flash('info', err.message);
        return res.render('/admin/shop/edit/'+id);
      }
      var data;
      try{
        data = JSON.parse(shop.data);
      }catch(err){
        data = {};
      }
      
      var templateDir = null;
      var template_form;
      templates.forEach(function(item){
        if(item._id == shop.template){
          templateDir = item.path;
        }
      });
      if(templateDir){
        var tpl = path.normalize(__dirname + '/../templates/' + templateDir + '/form.html');
        tpl = fs.readFileSync(tpl, 'utf-8');
        template_form = nunjucks.renderString(tpl, { data: data});
      }

      res.render('admin/shop-edit.html', {
        mode: 'edit',
        tab: tab,
        id: id,
        info: req.flash('info'),
        name: shop.name,
        url: shop.url,
        customer: shop.customer,
        weixin: shop.weixin,
        weixinID: shop.weixinID,
        tel: shop.tel,
        suites: suites,
        templates: templates,
        suite: shop.suite,
        creator: shop.creator,
        template: shop.template,
        note: shop.note,
        subscribe: shop.subscribe || {},
        template_form: template_form,
        data: data
      });
    });
    
  });
}


/**
增加或编辑表单请求
**/
exports.action = function(req, res){
  if(req.param('mode') === 'add'){
    exports.insert(req, res);
  }else{
    exports.update(req, res);
  }
}

/**
提交订阅
**/
exports.subscribe = function(req, res){
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  
  var id = req.params.id || req.param('id');
  var title = req.param('title');
  var description = req.param('description');
  var img = req.param('img');
  
  var info;
  
  if(!id){
    req.flash('tab', '');
    req.flash('info', '请先创建店铺');
    return res.redirect('/admin/shop/add');
  }
  if(!title){
    info = '订阅标题不能为空';
  }else if(!description){
    info = '订阅描述不能为空';
  }else if(!img){
    info = '订阅预览图不能为空';
  }
  if(info){
    req.flash('tab', 'subscribe');
    req.flash('info', info);
    return res.redirect('/admin/shop/edit/'+id+'?step=subscribe');
  }
  Shop.findById(id, function (err, shop) {
    if(!shop){
      req.flash('info', '修改出错！该店铺不存在');
      return res.redirect('/admin/shop');
    }
    var $set = {
      subscribe: {
        title: title,
        description: description,
        img: img
      }
    }

    shop.update({$set: $set}, function(err){
      if(err){
        req.flash('info', err.message);
      }
      res.saveOperation('修改了weixin='+shop.weixin +',id='+id+'的微信订阅信息');
      return res.redirect('/admin/shop/edit/'+id+"?step=template");
    })
  });
}

/**
提交模板
**/
exports.template = function(req, res){
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  var id = req.params.id || req.param('id');
  
  if(!id){
    req.flash('tab', '');
    req.flash('info', '请先创建店铺');
    return res.redirect('/admin/shop/add');
  }
  
  Shop.findById(id, function (err, shop) {
    if(!shop){
      req.flash('info', '修改出错！该店铺不存在');
      return res.redirect('/admin/shop');
    }
    var template = shop.template;
    var templateDir;
    
    //save
    function saveTemplate(){
      var data = req.params.data || {};
      shop.update({$set: {data: JSON.stringify(data)}}, function(err){
        if(err){
          req.flash('info', err.message);
        }
        res.saveOperation('修改了weixin='+shop.weixin +',id='+id+'的模板信息');
        return res.redirect('/admin/shop/edit/'+id);
      });
    }
    
    //get templates
    getTemplates(function(e, templates){
      templates = templates || [];
      templates.forEach(function(item){console.log(item);
        if(item._id == template){
          templateDir = item.path;
        }
      });
      
      console.log("templateDir:",templateDir);
      if(!templateDir){
        req.flash('info', '店铺模板设置有错，请返回更改');
        req.flash('tab', '');
        return res.redirect('/admin/shop/edit/' + id);
      }
      
      var plugin;
      try{
        plugin = require(__dirname + '/../templates/' + templateDir + '/plugin');
      }catch(err){
        req.flash('info', '店铺模板设置有错，请返回更改');
        req.flash('tab', '');
        return res.redirect('/admin/shop/edit/' + id);
      }
      plugin.submit(req, function(e){
        if(e){
          req.flash('info', e.message || e);
          req.flash('tab', 'template');
          return res.redirect('/admin/shop/edit/' + id);
        }
        saveTemplate();
      });
    });
  });
}

/**
新增店铺
**/
exports.insert = function(req, res){
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  var name = req.param('name');
  var url = req.param('url');
  var customer = req.param('customer');
  var weixin = req.param('weixin');
  var weixinID = req.param('weixinID');
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
  }else if(!weixinID){
    info = '微信OpenID不能为空';
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
    res.saveOperation('增加了weixin='+weixin+'的店铺');
    return res.redirect('/admin/shop');
  });
}

/**
更新店铺
**/
exports.update = function(req, res){
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  var id = req.params.id || req.param('id');
  var name = req.param('name');
  var url = req.param('url');
  var customer = req.param('customer');
  var weixin = req.param('weixin');
  var weixinID = req.param('weixinID');
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
  }else if(!weixinID){
    info = '微信OpenID不能为空';
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
      return res.redirect('admin/shop');
    }
    var oldWeixin = shop.weixin;
    var $set = {
      name: name,
      url: url,
      customer: customer,
      weixin: weixin,
      weixinID: weixinID,
      tel: tel,
      suite: suite,
      template: template,
      note: note
    }
    if(oldWeixin != weixin){
      res.saveOperation('更新了id='+id+'的店铺，weixin由' + oldWeixin + '变为' + weixin);
    }
    res.saveOperation('更新了id='+id+'的店铺');
    shop.update({$set: $set}, function(err){
      if(err){
        req.flash('info', err.message);
      }
      return res.redirect('/admin/shop');
    });
  });
}

/**
删除店铺
**/
exports.delete = function(req, res){
  var id = req.param('id');
  if(!id){
    req.flash('info', '请指定需要删除的店铺');
    return res.redirect('/admin/shop');
  }
  if(req.session.admin.role.key < 1){
    return res.redirect('/admin/permission-error');
  }
  Shop.findById(id, function (err, shop) {
    if(shop){
      if(req.session.admin.role.key == 1 && shop.creator != req.session.admin.username){
        req.flash('info', "该店铺不是你创建的，若要删除请联系管理员");
        return res.redirect('/admin/shop');
      }
      var weixin = shop.weixin;
      shop.remove(function(err){
        if(err){
          req.flash('info', err.message);
        }
        res.saveOperation('删除了weixin='+weixin+'的店铺');
        return res.redirect('/admin/shop');
      });
    }else{
      req.flash('info', '未找到需要删除的店铺');
      return res.redirect('/admin/shop');
    }
  });
}