/**
@author hk1k
**/
var mongoose = require('mongoose');
var logger = require('../lib/logger');

mongoose.connect("mongodb://32like:A1s2d3f4@zmzp.cn/weishop");
var db = mongoose.connection;
db.once('open', function(){
  logger.log('database opend');
});

db.on('error', function(err) {
  global.app.locals.databaseError = err;
  logger.error(err);
});
/**
@class Admin
**/
var Admin = mongoose.model('Admin', {
  username: String,
  password: String,
  sid: {type: String, default: ''},
  loginTime: {type: Date},
  role: {
    key: Number,
    value: String
  },
  time: {type: Date, default: Date.now}
});

/**
@class Suite
**/
var Suite = mongoose.model('Suite', {
  name: String,
  price: Number,
  note: String
});

/**
@class Operation
**/
var Operation = mongoose.model('Operation', {
  username: String,
  ip: String,
  action: String,
  time: {type: Date, default: Date.now}
});

/**
@class Shop
**/
var Shop = mongoose.model('Shop', {
  name: String,
  url: String,
  weixin: String,
  weixinID: String,
  customer: String,
  tel: String,
  time: {type: Date, default: Date.now},
  suite: String,
  template: String,
  creator: String,
  subscribe: {
    title: String,
    description: String,
    img: String
  },
  data: String,
  note: String
});

/**
@class Template
**/
var Template = mongoose.model('Template', {
  name: String,
  path: String
});

/**
@class Role
@example
    
    var role = Role.create(0);
    var roleList = Role.all();
    var roleListFilter = Role.all(2);
**/
var Role = {
  data: ['报告员', '业务员', '管理员', '超级管理员'],
  //create a role
  create: function(v){
    return {
      key: v,
      value: this.data[v]
    }
  },
  //return all the role
  all: function(maxKey){
    var result = [];
    this.data.forEach(function(item, index){
      if(maxKey != null){
        if(maxKey >= index){
          result.push({key: index, value: item});
        }
      }else{
        result.push({key: index, value: item});
      }
    });
    return result;
  }
}

exports.Admin = Admin;
exports.Operation = Operation;
exports.Suite = Suite;
exports.Template = Template;
exports.Shop = Shop;
exports.Role = Role;
                           