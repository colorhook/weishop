'use strict';
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var config = require('./config');
var routes = require('./routes');
var nunjucks = require('nunjucks');
var logger = require('./lib/logger');

require('./model/database');

//express and static
var app = global.app = express();
app.locals.pretty = false;
app.use(express.static(path.join(__dirname, 'public')));
app.set('view cache', config.viewCache);
app.disable('x-powered-by');

//template
var env = nunjucks.configure('views', {
  autoescape: true
});
nunjucks.precompile(path.normalize(__dirname +'/views'), { env: env, include:[/./] });
env.express(app);

//middleware
app
.use(bodyParser.json())
.use(bodyParser.urlencoded({extended:true}))
.use(cookieParser())
.use(session({secret:'weishop'}))
.use(function(err, req, res, next) {
  res.json(err);
  console.error('[%s][%s] Express handle exception: [%s]', new Date(), process.pid, err);
});

//routes
routes(app);

//listen
module.exports = (function() {
  app.listen(config.port, function() {
      console.log('[%s] app start : %s', new Date(), config.port);
  });
  return app;
})();

//exception
//process.on('uncaughtException', function(err) {
//  console.error('[%s][%s] Caught exception: [%s]', new Date(), process.pid, err);
//  logger.error('uncaughtException:' + process.pid);
//  process.exit(1);
//});