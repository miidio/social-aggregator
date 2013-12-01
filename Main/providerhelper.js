'use strict';

var fs = require('fs');

(function(exports) {

  var map = {};
  var onready = null;
  var ready = false;
  var readyCallbacks = new Array();

  function endsWith(str, suffix) {
     return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  function getFilename(str) {
    return str.substring(0, str.lastIndexOf('.'));
  }

  fs.readdir(__dirname + '/providers', function(err, files) {
    for (var i = 0; i < files.length; i++) {
      if (endsWith(files[i], '.js')) {
        console.log('debug', 'filename: ' + getFilename(files[i]) + ', path: ' + __dirname + '/providers/' + files[i]);
        map[getFilename(files[i])] = require(__dirname + '/providers/' + files[i]);
      }
    }
    ready = true;
    for (var i = 0; i < readyCallbacks.length; i++) {
      readyCallbacks[i]();
    }
    readyCallbacks = new Array();
  });

  exports.hookReady = function(cb) {
    if (ready) {
      cb();
      return;
    }
    readyCallbacks.push(cb);
  };

  exports.create = function(type) {
    if (map[type]) {
      console.log('info', 'create type: ' + type);
      return new map[type].Provider();
    } else {
      return null;
    }
  }
})(exports);