/**
@author hk1k
**/
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
@method index
@param {HttpRequest} req
@param {HttpResponse} res
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
    if(err){
      req.flash('info', '获取模板和套餐失败');
      logger.error('店铺列表页面获取模板和套餐失败');
      return res.redirect('/admin/error');
    }
    var suitesPool = {}, templatesPool = {};
    suites.forEach(function(item){
      suitesPool[item._id] = item.name;
    });
    templates.forEach(function(item){
      templatesPool[item._id] = item.name;
    });
    Shop.find({}, function(err, data){
      if(err){
        logger.error('店铺列表获取店铺数据失败');
        req.flash('info', '获取店铺数据出错');
        return res.redirect('/admin/error');
      }
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
@method add
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.add = function(req, res){
  getSuitesAndTemplates(function(err, suites, templates){
    if(err){
      req.flash('info', '获取模板和套餐失败');
      logger.error('新增店铺时获取模板和套餐失败');
      return res.redirect('/admin/error');
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
@method edit
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.edit = function(req, res){
  
  if(req.session.admin.role.key < 1){
    logger.debug('编辑店铺权限不够,username:'+req.session.admin.username);
    return res.redirect('/admin/permission-error');
  }
  
  var id = req.params.id || req.param('id');
  var tab = req.params.tab || req.param('tab') || req.flash('tab');
  
  if(tab != 'template' && tab != 'weixin'){
    tab = 'basic';
  }
  if(!id){
    logger.debug('编辑店铺时店铺ID未设置');
    req.flash('info', '请指定店铺ID');
    req.flash('backurl', '/admin/shop');
    return res.redirect('/admin/error');
  }

  Shop.findById(id, function(e, shop){
    
    if(!shop){
      logger.debug('编辑店铺时店铺ID不合法:'+id);
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
        try{
          tpl = fs.readFileSync(tpl, 'utf-8');
        }catch(err){
          tpl = null;
          logger.error('读取模板表单失败:' + shop.template + '@'+templateDir);
        }
        if(tpl){
          try{
            template_form = nunjucks.renderString(tpl, { data: data});
          }catch(err){
            logger.error('渲染模板表单失败:' + shop.template + '@'+templateDir);
          }
        }
      }else{
        logger.error('店铺模板设置有误:'+shop.template);
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
@method action
@param {HttpRequest} req
@param {HttpResponse} res
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
@method subscribe
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.subscribe = function(req, res){
  if(req.session.admin.role.key < 1){
    logger.debug('提交订阅权限不够,username:'+req.session.admin.username);
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
    return res.redirect('/admin/shop/edit/'+id+'?tab=weixin');
  }
  Shop.findById(id, function (err, shop) {
    if(!shop){
      req.flash('info', '修改出错！该店铺不存在');
      logger.error('提交订阅操作中未找到店铺:'+id);
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
        logger.error('更新订阅失败:'+err.message);
        req.flash('info', err.message);
      }
      res.saveOperation('修改了weixin='+shop.weixin +',id='+id+'的微信订阅信息');
      return res.redirect('/admin/shop/edit/'+id+"?tab=weixin");
    })
  });
}

/**
提交模板
**/
exports.template = function(req, res){
  if(req.session.admin.role.key < 1){
    logger.debug('提交模板权限不够,username:'+req.session.admin.username);
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
      logger.error('提交模板失败店铺未找到:'+id);
      return res.redirect('/admin/shop');
    }
    var template = shop.template;
    var templateDir;
    
    //save
    function saveTemplate(){
      var data = req.params.data || {};
      shop.update({$set: {data: JSON.stringify(data)}}, function(err){
        if(err){
          logger.error('更新模板失败:'+err.message);
          req.flash('info', err.message);
        }
        res.saveOperation('修改了weixin='+shop.weixin +',id='+id+'的模板信息');
        return res.redirect('/admin/shop/edit/' + id + '?tab=template');
      });
    }
    
    //get templates
    getTemplates(function(e, templates){
      templates = templates || [];
      templates.forEach(function(item){
        if(item._id == template){
          templateDir = item.path;
        }
      });
      
      if(!templateDir){
        req.flash('info', '店铺模板设置有错，请返回更改');
        req.flash('tab', '');
        return res.redirect('/admin/shop/edit/' + id + '?tab=basic');
      }
      
      var plugin;
      try{
        plugin = require(__dirname + '/../templates/' + templateDir + '/plugin');
      }catch(err){
        req.flash('info', '店铺模板设置有错，请返回更改');
        logger.error('提交店铺模板数据时未找到模板插件代码:'+templateDir);
        req.flash('tab', '');
        return res.redirect('/admin/shop/edit/' + id + '?tab=basic');
      }
      plugin.submit(req, function(e){
        if(e){
          logger.debug('提交店铺模板数据不合法:'+e.message ? m.message : e);
          req.flash('info', e.message || e);
          req.flash('tab', 'template');
          return res.redirect('/admin/shop/edit/' + id + '?tab=template');
        }
        saveTemplate();
      });
    });
  });
}

/**
新增店铺
@method insert
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.insert = function(req, res){
  if(req.session.admin.role.key < 1){
    logger.debug('增加店铺权限不够,username:'+req.session.admin.username);
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
    weixinID: weixinID,
    tel: tel,
    suite: suite,
    template: template,
    creator: creator,
    note: note
  }).save(function(err, shop){
    if(err){
      logger.error('增加店铺出错:' + err.message);
      req.flash('info', err.message);
    }
    res.saveOperation('增加了weixin='+weixin+',id='+shop.id+'的店铺');
    return res.redirect('/admin/shop/edit/'+shop.id + '?tab=weixin');
  });
}

/**
更新店铺
@method update
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.update = function(req, res){
  if(req.session.admin.role.key < 1){
    logger.debug('编辑店铺权限不够,username:'+req.session.admin.username);
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
      logger.debug('编辑店铺动作失败，ID不对:'+id);
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
    res.saveOperation('更新了weixin='+weixin+',id='+id+'的店铺');
    shop.update({$set: $set}, function(err){
      if(err){
        logger.error('编辑店铺动作失败:'+err.message);
        req.flash('info', err.message);
      }
      return res.redirect('/admin/shop/edit/'+id+"?tab=weixin");
    });
  });
}

/**
删除店铺
@method delete
@param {HttpRequest} req
@param {HttpResponse} res
**/
exports.delete = function(req, res){
  var id = req.param('id');
  if(!id){
    req.flash('info', '请指定需要删除的店铺');
    logger.debug('删除店铺需要带上店铺ID');
    return res.redirect('/admin/shop');
  }
  if(req.session.admin.role.key < 1){
    logger.debug('删除店铺权限不够,username:'+req.session.admin.username);
    return res.redirect('/admin/permission-error');
  }
  Shop.findById(id, function (err, shop) {
    if(shop){
      if(req.session.admin.role.key == 1 && shop.creator != req.session.admin.username){
        req.flash('info', "该店铺不是你创建的，若要删除请联系管理员");
        logger.debug('非法删除店铺:'+req.session.admin.username);
        return res.redirect('/admin/shop');
      }
      var weixin = shop.weixin;
      shop.remove(function(err){
        if(err){
          logger.error('删除店铺失败:'+err.message);
          req.flash('info', err.message);
        }
        res.saveOperation('删除了weixin='+weixin+'的店铺');
        return res.redirect('/admin/shop');
      });
    }else{
      req.flash('info', '未找到需要删除的店铺');
      logger.debug('删除店铺动作失败，ID不对:'+id);
      return res.redirect('/admin/shop');
    }
  });
}