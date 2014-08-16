/**
@author hk1k
**/
'use strict';
var path = require('path');
var express = require('express');
var moment = require('moment');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var busboy = require('connect-busboy');
var session = require('express-session');
var flash = require('connect-flash');
var wechat = require('./lib/wechat');
var config = require('./config');
var routes = require('./routes');
var nunjucks = require('nunjucks');
var logger = require('./lib/logger');
var operation = require('./lib/operation');


require('./model/database');

//express and static
var app = global.app = express();
app.locals.pretty = false;

app.set('view cache', config.viewCache);
app.disable('x-powered-by');

//template
var env = nunjucks.configure('views', {
  autoescape: true
});
env.addFilter('json', function(input){
  if(!input){
    return "";
  }
  return JSON.stringify(input);
});
env.addFilter('time', function(input, format){
  if(!input){
    return "";
  }
  return moment(input).format(format || "YYYY-MM-DD HH:mm:ss");
});
nunjucks.precompile(path.normalize(__dirname +'/views'), { env: env, include:[/./] });
env.express(app);

//middleware
app
.use(bodyParser.json())
.use(bodyParser.urlencoded({extended:true}))
.use(busboy())
.use(cookieParser())
.use(session({secret:'weishop'}))
.use(flash())
.use(operation())
.use(function(err, req, res, next) {
  res.json(err);
  console.error('[%s][%s] Express handle exception: [%s]', new Date(), process.pid, err);
});

//wechat
wechat(app);

//routes
routes(app);

//listen
module.exports = (function() {
  app.listen(config.port, function() {
      logger.log('[%s] app start : %s', new Date(), config.port);
  });
  return app;
})();

/*/exception
process.on('uncaughtException', function(err) {
  console.error('[%s][%s] Caught exception: [%s]', new Date(), process.pid, err);
  logger.error('uncaughtException:' + process.pid);
  process.exit(1);
});
//*/