'use strict';
var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var taobaostatus = require('taobaostatus');
var config = require('./config');
var routes = require('./routes');
var nunjucks = require('nunjucks');

var app = global.app = express();
app.locals.pretty = false;

var env = nunjucks.configure('views', {
  autoescape: true
});

nunjucks.precompile(path.normalize(__dirname +'/views'), { env: env, include:[/./] });

app.use(express.static(path.join(__dirname, 'public')));
app.set('view cache', config.viewCache);
app.disable('x-powered-by');

app.use(cookieParser()).use(function(err, req, res, next) {
  res.json(err);
  console.error('[%s][%s] Express handle exception: [%s]', new Date(), process.pid, err);
});

routes(app);

module.exports = (function() {
    app.listen(config.port, function() {
        console.log('[%s] app start : %s', new Date(), config.port);
    });
    return app;
})();

process.on('uncaughtException', function(err) {
    console.error('[%s][%s] Caught exception: [%s]', new Date(), process.pid, err);
    process.exit(1);
});