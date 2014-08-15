/**
@author hk1k
**/
var path = require('path');
var Logger = require('mini-logger');

var logger = Logger({
  dir: path.join(__dirname, '../logs'),
  categories: [ 'log', 'info', 'debug', 'warn' ]
});

module.exports = logger;