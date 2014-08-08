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

var Operation = mongoose.model('Operation', {
  username: String,
  ip: String,
  action: String,
  time: {type: Date, default: Date.now}
});

var Shop = mongoose.model('Shop', {
  name: String,
  weixin: String,
  customer: String,
  tel: String,
  location: {
    longitude: Number,
    latitude: Number,
    address: String
  },
  company: String,
  time: {type: Date, default: Date.now},
  price: Number,
  level: String,
  template: String,
  note: String
});

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
exports.Shop = Shop;
exports.Role = Role;
                           