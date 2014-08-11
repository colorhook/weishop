var mongoose = require('mongoose');

mongoose.connect("mongodb://zmzp.cn/weishop");

var AdminSchema = new mongoose.Schema({
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

var Admin = mongoose.model('Admin', AdminSchema);


var Suite = mongoose.model('Suite', {
  name: String,
  price: Number,
  note: String
});

var Operation = mongoose.model('Operation', {
  username: String,
  ip: String,
  action: String,
  time: {type: Date, default: Date.now}
});

var Shop = mongoose.model('Shop', {
  name: String,
  url: String,
  weixin: String,
  customer: String,
  tel: String,
  time: {type: Date, default: Date.now},
  suite: String,
  template: String,
  creator: String,
  note: String
});

var Template = mongoose.model('Template', {
  name: String,
  path: String
});

/**
@static
@example
    
    var role = Role.create(0);
    var roleList = Role.all();
    var roleListFilter = Role.all(2);
**/
var Role = {
  data: ['报告员', '业务员', '管理员', '超级管理员'],
  create: function(v){
    return {
      key: v,
      value: this.data[v]
    }
  },
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
                           