'use strict';

var fb = require('./fblink.js');
var cfg = require('../config.js');
var providerHelper = require('../providerhelper.js');
var imageCache = require('../utils/image-cache.js');
var logger = console;

function FanPageHandler(options) {
  var mThis = this;
  var providers = new Array();
  var fblink = new fb.FacebookLink(options);
  var fanpageID = options.fanpageID;
  var handlerOptions = options;
  var cacheTypeMap = {'rss': 'news',
                      'flickr': 'photo',
                      'youtube': 'video',
                      'googlenews': 'news'};

  function initProviders() {

    for ( var i = 0; i < options.providers.length; i++) {
      var oProCfg = options.providers[i];
      providers[providers.length] = createProvider(oProCfg);
    }
  }

  function createProvider(options) {
    logger.log('debug', 'initialize ' + options.type);
    var provider = providerHelper.create(options.type);
    provider.options = options;
    provider.dataCallback = function(data, finished) {
      if (finished) {
        logger.log('info', 'end of ' + options.type);
      } else {
        logger.log('info', 'post ' + options.type + ' to fb');
        try {
          var url = '';
          if (typeof data === 'string') {
            url = data;
          } else if (data.url) {
            url = data.url
          } else {
            return;
          }
          if (options.imageCache || handlerOptions.imageCache) {
            imageCache.cacheUrl(url, cacheTypeMap[options.type], fanpageID);
          }
          if (!mThis._debug) {
            fblink.post(url);
          }
        } catch (ex) {
          logger.log('error', 'post ' + options.type + ' to fb error: ' +
            ex.message);
        }
      }
    }

    return provider;
  }

  function initFacebook() {
    fblink.facebookReady = function() {
      logger.log('debug', 'facebook ready to go for: ' + options.name);
      startProviders();
    };
    fblink.options = options;
    fblink.prepare();
  }

  function startProviders() {
    // load provider async.
    // the load method should be run in async mode.
    for ( var i = 0; i < providers.length; i++) {
      logger.log('debug', 'load provider #' + i + ' for ' + options.name);
      providers[i].load();
    }
  }

  this.start = function() {
    providerHelper.hookReady((function() {
      logger.log('debug', 'start page ' + options.name + ' with: ' + 
                          this._debug);
      initProviders();
      // we will start provider while facebook ready.
      initFacebook();
    }).bind(this));
  };

  this._debug = false;
}

module.exports.FanPageHandler = FanPageHandler;
