"use strict";

var async = require("async");
var DynamicDictionaries = require("kuromoji/src/dict/DynamicDictionaries");

function joinUrl(base, filename) {
  return base.replace(/\/$/, "") + "/" + filename;
}

function DictionaryLoader(dic_path) {
  this.dic = new DynamicDictionaries();
  this.dic_path = dic_path;
}

DictionaryLoader.prototype.loadArrayBuffer = function (_file, _callback) {
  throw new Error("DictionaryLoader#loadArrayBuffer should be overwritten");
};

DictionaryLoader.prototype.load = function (load_callback) {
  var dic = this.dic;
  var dic_path = this.dic_path;
  var loadArrayBuffer = this.loadArrayBuffer;
  var loadFiles = function (filenames, callback) {
    async.map(filenames, function (filename, next) {
      loadArrayBuffer(joinUrl(dic_path, filename), next);
    }, callback);
  };

  async.parallel([
    function (callback) {
      loadFiles(["base.dat.gz", "check.dat.gz"], function (err, buffers) {
        if (err) return callback(err);
        dic.loadTrie(new Int32Array(buffers[0]), new Int32Array(buffers[1]));
        callback(null);
      });
    },
    function (callback) {
      loadFiles(["tid.dat.gz", "tid_pos.dat.gz", "tid_map.dat.gz"], function (err, buffers) {
        if (err) return callback(err);
        dic.loadTokenInfoDictionaries(new Uint8Array(buffers[0]), new Uint8Array(buffers[1]), new Uint8Array(buffers[2]));
        callback(null);
      });
    },
    function (callback) {
      loadArrayBuffer(joinUrl(dic_path, "cc.dat.gz"), function (err, buffer) {
        if (err) return callback(err);
        dic.loadConnectionCosts(new Int16Array(buffer));
        callback(null);
      });
    },
    function (callback) {
      loadFiles(["unk.dat.gz", "unk_pos.dat.gz", "unk_map.dat.gz", "unk_char.dat.gz", "unk_compat.dat.gz", "unk_invoke.dat.gz"], function (err, buffers) {
        if (err) return callback(err);
        dic.loadUnknownDictionaries(
          new Uint8Array(buffers[0]),
          new Uint8Array(buffers[1]),
          new Uint8Array(buffers[2]),
          new Uint8Array(buffers[3]),
          new Uint32Array(buffers[4]),
          new Uint8Array(buffers[5])
        );
        callback(null);
      });
    }
  ], function (err) {
    load_callback(err, dic);
  });
};

module.exports = DictionaryLoader;
