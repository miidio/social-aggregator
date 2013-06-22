'use strict';

var fanpage = require('./consumer/fanpagehandler.js');
var cfg = require('./config.js');
var logger = console;
// if debug is true, we don't post anything to facebook
var _DEBUG = true;
// system variables
var sources = new Array();

function initLogger() {
  // we use winston before, but it doesn't work properly at the latest version.
}

function initSources() {
  for ( var i = 0; i < cfg.Config.length; i++) {
    sources[sources.length] = new fanpage.FanPageHandler(cfg.Config[i]);
    logger.log('info', 'initialize fanpage handler #' + i + ': ' + cfg.Config[i].name);
  }
}

function startSources() {
  for ( var i = 0; i < sources.length; i++) {
    sources[i]._debug = _DEBUG;
    try {
    sources[i].start();
    } catch (ex) {
      logger.log('debug', ex);
    }
  }
}

/*process.on('uncaughtException', function(err) {
  console.log(err);
  logger.log('debug', err);
});
*/
initLogger();
initSources();
startSources();
logger.log('debug', 'all sources started...');
setTimeout(function(){logger.log('debug', 'timed-out');}, 1000);
setTimeout(function(){logger.log('debug', 'start timed-out');}, 0);
logger.log('debug', 'schedule timed-out');
