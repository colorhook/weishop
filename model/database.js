var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;

mongoose.connect("mongodb://zmzp.cn/weishop");

var Admin = mongoose.model('Admin', {
  username: 'string',
  password: 'string',
  role: 'string',
  regTime: 'number'
});

var Log = mongoose.model('Log', {
  username: 'string',
  category: 'string',
  action: 'string',
  time: 'number'
});


var Member = mongoose.model('Member', {
  username: 'string',
  companey: 'string',
  address: 'string',
  tel: 'string',
  level: 'number'
});


exports.Admin = Admin;
exports.Log = Log;
exports.Member = Member;

//exports.route = function(app){
//  Admin.register(app, '/api/admin');
//  Member.register(app, '/admin/api/member');
//  Log.register(app, '/admin/api/log');
//}
                           