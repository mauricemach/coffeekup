/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

if (typeof(bespin) === 'undefined') {
    bespin = {};
}

if (typeof(document) !== 'undefined') {
    var link = document.getElementById("bespin_base");
    if (link) {
        var href = link.href;
        bespin.base = href.substring(href.length - 1) !== "/" ? href + "/" : href;
    } else {
        bespin.base = "";
    }
}


(function() {
/*! @license
==========================================================================
Tiki 1.0 - CommonJS Runtime
copyright 2009-2010, Apple Inc., Sprout Systems Inc., and contributors.

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

Tiki is part of the SproutCore project.

SproutCore and the SproutCore logo are trademarks of Sprout Systems, Inc.

For more information visit http://www.sproutcore.com/tiki

==========================================================================
@license */

/*globals tiki ENV ARGV ARGS */

"use modules false";
"use loader false";

/**
  Implements a very simple handler for the loader registration API so that
  additional scripts can load without throwing exceptions.  This loader can
  also return module instances for modules registered with an actual factory
  function.
  
  Note that this stub loader cannot be used on its own.  You must load the 
  regular tiki package as well, which will replace this loader as soon as it
  is fetched.
*/
if ("undefined" === typeof tiki) { var tiki = function() {
  
  var T_UNDEFINED = 'undefined',
      queue = [];
        
  // save a registration method in a queue to be replayed later once the 
  // real loader is available.
  function _record(method, args) {
    queue.push({ m: method, a: args });
  }
  
  var tiki = {
    
    // used to detect when real loader should replace this one
    isBootstrap: true,
    
    // log of actions to be replayed later
    queue: queue, 
    
    // helpers just record into queue
    register: function(packageId, opts) { 
      
      // this hack will make unit tests work for tiki by adding core_test to
      // the list of dependencies.
      if (packageId.match(/^tiki/) && this.ENV) {
        if ((this.ENV.app === 'tiki') && (this.ENV.mode === 'test')) {
          if (!opts.dependencies) opts.dependencies = {};
          opts.dependencies['core_test'] = '~';
        }
      }
      
      _record('register', arguments);
       return this;  
    },
    
    // Keep these around just in case we need them in the end...
    // script:   function() { 
    //   _record('script', arguments); 
    //   return this; 
    // },
    // 
    // stylesheet: function() { 
    //   _record('stylesheet', arguments); 
    //   return this; 
    // },

    // modules actually get saved as well a recorded so you can use them.
    module: function(moduleId, factory) {
      if (moduleId.match(/\:tiki$/)) this.tikiFactory = factory;
      _record('module', arguments);
      return this ;
    },

    // load the tikiFactory 
    start: function() {
      var exp = {}, ret;
      this.tikiFactory(null, exp, null); // no require or module!
      ret = exp.Browser.start(this.ENV, this.ARGS, queue);
      queue = null;
      return ret ;
    }
    
  };
  
  if (T_UNDEFINED !== typeof ENV) tiki.ENV = ENV;
  if (T_UNDEFINED !== typeof ARGV) tiki.ARGS = ARGV; // for older versions
  if (T_UNDEFINED !== typeof ARGS) tiki.ARGS = ARGS;
  
  return tiki;
  
}(); }


tiki.register('::tiki/1.0.0', {
"name": "tiki",
"version": "1.0.0"
});

tiki.module('::tiki/1.0.0:tiki', function(require, exports, module) {
// ==========================================================================
// Project:   Tiki - CommonJS Runtime
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*jslint evil:true */

/**
  @file 
  
  This file implements the core building blocks needed to implement the 
  tiki runtime in an environment.  If you can require this one module, you can
  setup a runtime that will load additional packages.
  
  It is important that this module NOT require() any other modules since a
  functioning require() statement may not be available.  The module can 
  populate, but not replace, the exports object.

  To configure a Tiki runtime, you need to create a Sandbox and Loader 
  instance from this API with one or more loader Sources.  The BrowserSource
  object implements the basic source you need to work in the browser.  The
  Repository object implemented in the server-side only 'file' API can be 
  used to load from a local repository of packages.
*/

// used for type checking.  This allows the type strings to be minified.
var T_FUNCTION = 'function',
    T_STRING   = 'string',
    T_UNDEFINED = 'undefined';
    
    
var IS_CANONICAL = /^::/; // must begin with ::
var isCanonicalId = function(id) {
  return !!IS_CANONICAL.exec(id);
};  

var DEBUG = function() {
  exports.debug.apply(this, arguments);
};

exports.debug = function() {
  var msg = Array.prototype.join.call(arguments, '');
  require('sys').debug(msg);
};

// ..........................................................
// CORE UTILITIES
// 

var TMP_ARY = [];

/**
  Tests whether the passed object is an array or not.
*/
var isArray;

if (Array.isArray) {
  isArray = Array.isArray;
} else {
  isArray = function(obj) {
    if ('object' !== typeof obj) return false;
    if (obj instanceof Array) return true;
    return obj.constructor && (obj.constructor.name==='Array');
  };
}
exports.isArray = isArray;

/**
  Create a new object with the passed object as the prototype.
*/
var createObject;
if (Object.create) {
  createObject = Object.create;
} else {
  var K = function() {},
      Kproto = K.prototype;
  createObject = function(obj) {
    if (!obj) obj = Object.prototype;
    K.prototype = obj;
    
    var ret = new K();
    ret.prototype = obj;
    K.prototype = Kproto;
    
    return ret ;
  };
}
exports.createObject = createObject;

var _constructor, _extend, extend;

// returns a new constructor function with clean closure...
_constructor = function() {
  return function() {
    if (this.init) return this.init.apply(this, arguments);
    else return this;
  };
};

_extend = function() {
  return extend(this);
};

/**
  Creates a "subclass" of the passed constructor.  The default constructor
  will call look for a local "init" method and call it.
  
  If you don't pass an initial constructor, this will create a new based 
  object.
*/
extend = function(Constructor) {
  var Ret = _constructor();
  Ret.prototype = createObject(Constructor.prototype);
  Ret.prototype.constructor = Ret;
  Ret.super_ = Constructor;
  Ret.extend = _extend;
  return Ret;
};
exports.extend = extend;

/**
  Invokes the passed fn on each item in the array in parallel.  Invokes
  done when finished.
  
  # Example
  
      parallel([1,2,3], function(item, done) {
        // do something with item
        done();
      })(function(err) {
        // invoked when done, err if there was an error
      });
      
  @param {Array} array 
    items to iterate
    
  @param {Function} fn
    callback to invoke
    
  @returns {void}
*/
var parallel = function(array, fn) {
  if (fn && !fn.displayName) fn.displayName = 'parallel#fn';
  
  return function(done) {
    if (array.length === 0) return done(null, []);
    
    var len = array.length,
        cnt = len,
        cancelled = false,
        idx;

    var tail = function(err) {
      if (cancelled) return; // nothing to do

      if (err) {
        cancelled = true;
        return done(err);
      }

      if (--cnt <= 0) done(); 
    };
    tail.displayName = 'parallel#tail';

    for(idx=0;idx<len;idx++) fn(array[idx], tail);
  };
};
parallel.displayName = 'parallel';

/**
  @private
  
  Implements the sync map() on all platforms
*/
var map;
if (Array.prototype.map) {
  map = function(array, fn) {
    return array.map(fn);
  };

} else {
  map = function(array, fn) {
    var idx, len = array.length, ret = [];
    for(idx=0;idx<len;idx++) {
      ret[idx] = fn(array[idx], idx);
    }
    return ret ;
  };
}
map.displayName = 'map';


var PENDING = 'pending',
    READY   = 'ready',
    RUNNING = 'running';
    
/**
  Returns a function that will execute the continuable exactly once and 
  then cache the result.  Invoking the same return function more than once
  will simply return the old result. 
  
  This is a good replacement for promises in many cases.
  
  h3. Example
  
  {{{
    // load a file only once
    var loadit = Co.once(Co.fs.loadFile(pathToFile));

    loadit(function(content) { 
      // loads the file
    });
    
    loadit(function(content) {
      // if already loaded, just invokes with past content
    });
    
  }}}
  
  @param {Function} cont
    Continuable to invoke 
    
  @returns {Function} 
    A new continuable that will only execute once then returns the cached
    result.
*/
var once = function(action, context) {
  var state = PENDING,
      queue = [],
      makePending = false,
      args  = null;

  var ret = function(callback) {
    if (!context) context = this;
    
    // cont has already finished, just invoke callback based on result
    switch(state) {
      
      // already resolved, invoke callback immediately
      case READY:
        callback.apply(null, args);
        break;

      // action has started running but hasn't finished yet
      case RUNNING:
        queue.push(callback);
        break;
        
      // action has not started yet
      case PENDING:
        queue.push(callback);
        state = RUNNING;

        action.call(context, function(err) {
          args  = Array.prototype.slice.call(arguments);
          
          var oldQueue = queue, oldArgs = args;

          if (makePending) {
            state = PENDING;
            queue = [];
            args  = null; 
            makePending = false;

          } else {
            state = READY;
            queue = null;
          }
          
          if (oldQueue) {
            oldQueue.forEach(function(q) { q.apply(null, oldArgs); });
          }
        });
        break;
    }
    return this;
  };
  ret.displayName = 'once#handler';

  // allow the action to be reset so it is called again
  ret.reset = function() {
    switch(state) {
      
      // already run, need to reset
      case READY: 
        state = PENDING;
        queue = [];
        args  = null;
        break;
        
      // in process - set makePending so that resolving will reset to pending
      case RUNNING:
        makePending = true;
        break;
        
      // otherwise ignore pending since there is nothing to reset
    }
  };
  ret.reset.displayName = 'once#handler.reset';
  
  return ret ;
};
exports.once = once;


/**
  Iterate over a property, setting display names on functions as needed.
  Call this on your own exports to setup display names for debugging.
*/
var displayNames = function(obj, root) {
  var k,v;
  for(k in obj) {
    if (!obj.hasOwnProperty(k)) continue ;
    v = obj[k];
    if ('function' === typeof v) {
      if (!v.displayName) {
        v.displayName = root ? (root+'.'+k) : k;
        displayNames(v.prototype, v.displayName);
      }
      
    }
  }
  return obj;
};

// ..........................................................
// ERRORS
// 

var NotFound = extend(Error);
NotFound.prototype.init = function(canonicalId, pkgId) {
  var msg = canonicalId+' not found';
  if (pkgId) {
    if (T_STRING === typeof pkgId) msg = msg+' '+pkgId;
    else msg = msg+' in package '+(pkgId.id || '(unknown)');
  }
  this.message = msg;
  return this;
};
exports.NotFound = NotFound;

var InvalidPackageDef = extend(Error);
InvalidPackageDef.prototype.init = function(def, reason) {
  if ('undefined' !== typeof JSON) def = JSON.stringify(def);
  this.message = "Invalid package definition. "+reason+" "+def;
};
exports.InvalidPackageDef = InvalidPackageDef;

// ..........................................................
// semver
// 

// ..........................................................
// NATCOMPARE
// 
// Used with thanks to Kristof Coomans 
// Find online at http://sourcefrog.net/projects/natsort/natcompare.js
// Cleaned up JSLint errors

/*
natcompare.js -- Perform 'natural order' comparisons of strings in JavaScript.
Copyright (C) 2005 by SCK-CEN (Belgian Nucleair Research Centre)
Written by Kristof Coomans <kristof[dot]coomans[at]sckcen[dot]be>

Based on the Java version by Pierre-Luc Paour, of which this is more or less a straight conversion.
Copyright (C) 2003 by Pierre-Luc Paour <natorder@paour.com>

The Java version was based on the C version by Martin Pool.
Copyright (C) 2000 by Martin Pool <mbp@humbug.org.au>

This software is provided 'as-is', without any express or implied
warranty.  In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
claim that you wrote the original software. If you use this software
in a product, an acknowledgment in the product documentation would be
appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/
var natcompare = function() {
  
  var isWhitespaceChar = function(a) {
    var charCode = a.charCodeAt(0);
    return charCode <= 32;
  };

  var isDigitChar = function(a) {
    var charCode = a.charCodeAt(0);
    return ( charCode >= 48  && charCode <= 57 );
  };

  var compareRight = function(a,b) {
    var bias = 0,
        ia   = 0,
        ib   = 0,
        ca, cb;

    // The longest run of digits wins.  That aside, the greatest
    // value wins, but we can't know that it will until we've scanned
    // both numbers to know that they have the same magnitude, so we
    // remember it in BIAS.
    for (;; ia++, ib++) {
      ca = a.charAt(ia);
      cb = b.charAt(ib);

      if (!isDigitChar(ca) && !isDigitChar(cb)) return bias;
      else if (!isDigitChar(ca)) return -1;
      else if (!isDigitChar(cb)) return +1;
      else if (ca < cb) if (bias === 0) bias = -1;
      else if (ca > cb) if (bias === 0) bias = +1;
      else if (ca === 0 && cb === 0) return bias;
    }
  };

  var natcompare = function(a,b) {

    var ia  = 0, 
    ib  = 0,
    nza = 0, 
    nzb = 0,
    ca, cb, result;

    while (true) {
      // only count the number of zeroes leading the last number compared
      nza = nzb = 0;

      ca = a.charAt(ia);
      cb = b.charAt(ib);

      // skip over leading spaces or zeros
      while ( isWhitespaceChar( ca ) || ca =='0' ) {
        if (ca == '0') nza++;
        else nza = 0; // only count consecutive zeroes
        ca = a.charAt(++ia);
      }

      while ( isWhitespaceChar( cb ) || cb == '0') {
        if (cb == '0') nzb++;
        else nzb = 0; // only count consecutive zeroes
        cb = b.charAt(++ib);
      }

      // process run of digits
      if (isDigitChar(ca) && isDigitChar(cb)) {
        if ((result = compareRight(a.substring(ia), b.substring(ib))) !== 0) {
          return result;
        }
      }

      // The strings compare the same.  Perhaps the caller
      // will want to call strcmp to break the tie.
      if (ca === 0 && cb === 0) return nza - nzb;

      if (ca < cb) return -1;
      else if (ca > cb) return +1;

      ++ia; ++ib;
    }
  };

  return natcompare;
}();
exports.natcompare = natcompare;

// ..........................................................
// PUBLIC API
// 

// Support Methods
var invalidVers = function(vers) {
  return new Error('' + vers + ' is an invalid version string');
};
invalidVers.displayName = 'invalidVers';

var compareNum = function(vers1, vers2, num1, num2) {
  num1 = Number(num1);
  num2 = Number(num2);
  if (isNaN(num1)) throw invalidVers(vers1);
  if (isNaN(num2)) throw invalidVers(vers2);
  return num1 - num2 ;
};
compareNum.displayName = 'compareNum';


var vparse;
var semver = {
  
  /**
    Parse the version number into its components.  Returns result of a regex.
  */
  parse: function(vers) {
    var ret = vers.match(/^(=|~)?([\d]+?)(\.([\d]+?)(\.(.+))?)?$/);
    if (!ret) return null; // no match
    return [ret, ret[2], ret[4] || '0', ret[6] || '0', ret[1]];
  },


  /**
    Returns the major version number of a version string. 

    @param {String} vers
      version string

    @returns {Number} version number or null if could not be parsed
  */
  major: function(vers) {
    return Number(vparse(vers)[1]);
  },

  /**
    Returns the minor version number of a version string


    @param {String} vers
      version string

    @returns {Number} version number or null if could not be parsed
  */
  minor: function(vers) {
    return Number(vparse(vers)[2]);
  },

  /**
    Returns the patch of a version string.  The patch value is always a string
    not a number
  */
  patch: function(vers) {
    var ret = vparse(vers)[3];
    return isNaN(Number(ret)) ? ret : Number(ret);
  },

  STRICT: 'strict',
  NORMAL: 'normal',

  /**
    Returns the comparison mode.  Will be one of NORMAL or STRICT
  */
  mode: function(vers) {
    var ret = vparse(vers)[4];
    return ret === '=' ? semver.STRICT : semver.NORMAL;
  },

  /**
    Compares two patch strings using the proper matching formula defined by
    semver.org.  Returns:
    
    @param {String} patch1 first patch to compare
    @param {String} patch2 second patch to compare
    @returns {Number} -1 if patch1 < patch2, 1 if patch1 > patch2, 0 if equal 
  */
  comparePatch: function(patch1, patch2) {
    var num1, num2;

    if (patch1 === patch2) return 0; // equal

    num1   = Number(patch1);
    num2   = Number(patch2);

    if (isNaN(num1)) {
      if (isNaN(num2)) {
        // do lexigraphic comparison
        return natcompare(patch1, patch2);

      } else return -1; // num2 is a number therefore num1 < num2

    // num1 is a number but num2 is not so num1 > num2
    } else if (isNaN(num2)) {
      return 1 ;
    } else {
      return num1<num2 ? -1 : (num1>num2 ? 1 : 0) ;
    }
  },

  /**
    Compares two version strings, using natural sorting for the patch.
  */
  compare: function(vers1, vers2) {
    var ret ;

    if (vers1 === vers2) return 0;
    if (vers1) vers1 = vparse(vers1);
    if (vers2) vers2 = vparse(vers2);

    if (!vers1 && !vers2) return 0;
    if (!vers1) return -1; 
    if (!vers2) return 1; 


    ret = compareNum(vers1[0], vers2[0], vers1[1], vers2[1]);
    if (ret === 0) {
      ret = compareNum(vers1[0], vers2[0], vers1[2], vers2[2]);
      if (ret === 0) ret = semver.comparePatch(vers1[3], vers2[3]);
    }

    return (ret < 0) ? -1 : (ret>0 ? 1 : 0);
  },

  /**
    Returns true if the second version string represents a version compatible 
    with the first version.  In general this means the second version must be
    greater than or equal to the first version but its major version must not 
    be different.
  */
  compatible: function(reqVers, curVers) {
    if (!reqVers) return true; // always compatible with no version
    if (reqVers === curVers) return true; // fast path

    // make sure these parse - or else treat them like null
    if (reqVers && !vparse(reqVers)) reqVers = null;
    if (curVers && !vparse(curVers)) curVers = null;

    // try fast paths again in case they changed state
    if (!reqVers) return true; // always compatible with no version
    if (reqVers === curVers) return true; // fast path
    
    // strict mode, must be an exact (semantic) match
    if (semver.mode(reqVers) === semver.STRICT) {
      return curVers && (semver.compare(reqVers, curVers)===0);

    } else {
      if (!curVers) return true; // if no vers, always assume compat

      // major vers
      if (semver.major(reqVers) !== semver.major(curVers)) return false; 
      return semver.compare(reqVers, curVers) <= 0;
    }
  },

  /**
    Normalizes version numbers so that semantically equivalent will be treated 
    the same.
  */
  normalize: function(vers) {
    var patch;

    if (!vers || vers.length===0) return null;
    vers = semver.parse(vers);
    if (!vers) return null;

    patch = Number(vers[3]);
    if (isNaN(patch)) patch = vers[3];

    return [Number(vers[1]), Number(vers[2]), patch].join('.');
  }
  
};
exports.semver = semver;
vparse = semver.parse;


// ..........................................................
// FACTORY
// 

/**
  @constructor
  
  A factory knows how to instantiate a new module for a sandbox, including 
  generating the require() method used by the module itself.  You can return
  custom factories when you install a plugin.  Your module should export
  loadFactory().
  
  The default factory here actually expects to receive a module descriptor
  as generated by the build tools.
*/
var Factory = exports.extend(Object);
exports.Factory = Factory;

Factory.prototype.init = function(moduleId, pkg, factory) {
  this.id  = moduleId;
  this.pkg = pkg;
  this.factory = factory;
};

/**
  Actually generates a new set of exports for the named sandbox.  The sandbox
  must return a module object that can be used to generate the factory.
  
  If the current value of the local factory is a string, then we will actually
  eval/compile the factory as well.
  
  @param sandbox {Sandbox}
    The sandbox the will own the module instance
    
  @param module {Module}
    The module object the exports will belong to
    
  @returns {Hash} exports from instantiated module
*/
Factory.prototype.call = function(sandbox, module) {

  // get the factory function, evaluate if needed
  var func = this.factory,
      filename = this.__filename,
      dirname  = this.__dirname;
      
  if (T_STRING === typeof(func)) {
    func = this.factory = Factory.compile(func, this.pkg.id+':'+this.id);
  }

  // generate a nested require for this puppy
  var req = sandbox.createRequire(module),
      exp = module.exports;
  func.call(exp, req, exp, module, filename, dirname);
  return module.exports;
};


// standard wrapper around a module.  replace item[1] with a string and join.
var MODULE_WRAPPER = [
  '(function(require, exports, module) {',
  null,
  '\n});\n//@ sourceURL=',
  null,
  '\n'];

/**
  Evaluates the passed string.  Returns a function.
  
  @param moduleText {String}
    The module text to compile
    
  @param moduleId {String}
    Optional moduleId.  If provided will be used for debug
    
  @returns {Function} compiled factory
*/
Factory.compile = function(moduleText, moduleId) {
  var ret;
  
  MODULE_WRAPPER[1] = moduleText;
  MODULE_WRAPPER[3] = moduleId || '(unknown module)';
  
  ret = MODULE_WRAPPER.join('');
  ret = eval(ret);
  
  MODULE_WRAPPER[1] = MODULE_WRAPPER[3] = null;
  return ret;
};

exports.Factory = Factory;

// ..........................................................
// MODULE
// 

/**
  A Module describes a single module, including its id, ownerPackage, and
  the actual module exports once the module has been instantiated.  It also
  implements the resource() method which can lookup a resource on the module's
  package.
*/
var Module = exports.extend(Object);
exports.Module = Module;

Module.prototype.init = function(id, ownerPackage, sandbox) {
  this.id           = id;
  this.ownerPackage = ownerPackage;
  this.exports      = {};
  var module        = this;
  
  /**
    Lookup a resource on the module's ownerPackage.  Returns a URL or path 
    for the discovered resource.  The method used to detect the module or 
    package is implemented in the package.
    
    Note that this method is generated for each module we create because some
    code will try to pluck this method off of the module and call it in a
    different context.
    
    @param resourceId {String}
      Full or partial name of resource to retrieve
      
    @param done {Function}
      Optional.  Makes the resource discovery asyncronous
      
    @returns {String} url or path if not called async
  */
  this.resource = function(id) {
    return sandbox.resource(id, module.id, ownerPackage);
  };
};

// ..........................................................
// PACKAGE
// 

/**
  Package expects you to register the package with a config having the 
  following keys:
  
    {
      "name": "name-of-package" (vs canonical id)
      "version": current version of package (if known)
      
      // these are dependencies you require to run.  If the package is 
      // async loaded, these will be the ones loaded
      "dependencies": {
         "package-name": "version"
      },
      
      // these map a specific package-name/version to a canonicalId that must
      // be registered for the package to be loaded.  You may include 
      // additional packages here that may be referenced but are not required
      // to run (for example - lazy loaded packages)
      //
      // This also forms the universe of packages this particular package can
      // reference.
      //
      "tiki:packages": {
        "package-name": [
          { "version": "1.0.0", "id": "canonicalId", "url": "url" }
        ]
      },

      // ids mapped to urls.  all of these scripts must be loaded for this 
      // package to be considered ready 
      "tiki:scripts": {
        "id": "url"
      },
      
      // stylesheets that must be loaded for this package to be considered
      // ready.  The id is used so that the URL can load from a relative path
      // that may move around and still be accurate.
      "tiki:stylesheets": {
        "id": "url",
        "id": "url"
      },
      
      // maps asset paths for non-JS and non-CSS assets to URLs.  Used to 
      // progrmatically load images, etc.
      "tiki:resources": {
        "asset/path": "url",
        "asset/path": "url"
      }
    }

  This registration ensures that the package and it's related assets are 
  loaded.
*/
     
var Package = exports.extend(Object);
exports.Package = Package;

Package.prototype.init = function(id, config) {
  if (!isCanonicalId(id)) id = '::'+id; // normalize
  this.id = id;
  this.config = config;
  this.isReady = true;
};

// ..........................................................
// Package Configs
// 

/**
  Retrieves the named config property.  This method can be overidden by 
  subclasses to perform more advanced processing on the key data
  
  @param {String} key
    The key to retrieve
    
  @returns {Object} the key value or undefined
*/
Package.prototype.get = function(key) {
  return this.config ? this.config[key] : undefined;
};

/**
  Updates the named config property.

  @param {String} key
    The key to update
    
  @param {Object} value
    The object value to change
    
  @returns {Package} receiver
*/
Package.prototype.set = function(key, value) {
  if (!this.config) this.config = {};
  this.config[key] = value;
  return this;
};

/**
  Determines the required version of the named packageId, if any, specified
  in this package.
  
  @param {String} packageId
    The packageId to lookup
    
  @returns {String} The required version or null (meaning any)
*/
Package.prototype.requiredVersion = function(packageId) { 
  var deps = this.get('dependencies');
  return deps ? deps[packageId] : null;
};

// ..........................................................
// Nested Packages
// 

/**
  Attempts to match the passed packageId and version to the receiver or a 
  nested package inside the receiver.  If a match is found, returns the 
  packages canonicalId.  Otherwise returns null.  
  
  This does not search remote sources for the package.  It only looks at 
  what packages are available locally.
  
  This method is called after a package version has been checked for 
  compatibility with the package dependencies.  It is not necessary to 
  validate the requested version against any dependencies.
  
  @param {String} packageId
    The package id to look up

  @param {String} vers
    The expected version.  If null, then return the newest version for the 
    package.
    
  @param {String} Canonical packageId or null
*/
Package.prototype.canonicalPackageId = function(packageId, vers) {
  if ((packageId === this.get('name')) && 
      semver.compatible(vers, this.get('version'))) {
      return this.id;
  }
  return null;
};

/**
  Returns the receiver or an instance of a nested package if it matches the
  canonicalId passed here.  This method will only be called with a canonicalId
  returned from a previous call to Package#canonicalPackageId.
  
  If the package identified by the canonicalId is not available locally for
  some reason, return null.
  
  @param {String} canonicalId 
    The canonical packageId.
    
  @returns {Package} a package instance or null
*/
Package.prototype.packageFor = function(canonicalId) {
  if (canonicalId === this.id) return this;
  return null;
};

/**
  Verifies that the package identified by the passed canonical id is available
  locally and ready for use.  If it is not available, this method should 
  attempt to download the package from a remote source.
  
  Invokes the `done` callback when complete.
  
  If for some reason you cannot download and install the package you should
  invoke the callback with an error object describing the reason.  There are
  a number of standard errors defined on Package such as NotFound.
  
  @param {String} canonicalId
    The canonical packageId
    
  @param {Function} done
    Callback to invoke with result.  Pass an error object if the package 
    could not be loaded for some reason.  Otherwise invoke with no params
    
  @returns {void}
*/
Package.prototype.ensurePackage = function(canonicalId, done) {
  if (canonicalId === this.id) return done();
  else return done(new NotFound(canonicalId, this));
};

/**
  Returns all packages in the package including the package itself and any 
  nested packages.  Default just returns self.
*/
Package.prototype.catalogPackages = function() {
  return [this];
};

// ..........................................................
// Package Module Loading
// 

/**
  Detects whether the moduleId exists in the current package.
  
  @param {String} moduleId
    The moduleId to check
    
  @returns {Boolean} true if the module exists
*/
Package.prototype.exists = function(moduleId) {
  return !!(this.factories && this.factories[moduleId]);
};

/**
  Returns a Factory object for the passed moduleId or null if no matching
  factory could be found.
  
  @param {String} moduleId
    The moduleId to check
    
  @returns {Factory} factory object
*/
Package.prototype.load = function(moduleId) {
  return this.factories ? this.factories[moduleId] : null;
};

// ..........................................................
// LOADER
// 

// potentially optimize to avoid memory churn.
var joinPackageId = function joinPackageId(packageId, moduleId) {
  return packageId+':'+moduleId;
};

/**
  A loader is responsible for finding and loading factory functions.  The 
  primary purpose of the loader is to find packages and modules in those 
  packages.  The loader typically relies on one or more sources to actually
  find a particular package.
*/
var Loader = exports.extend(Object);
exports.Loader = Loader;

Loader.prototype.init = function(sources) {
  this.sources = sources || [];
  this.clear();
};

/**
  Clear caches in the loader causing future requests to go back to the 
  sources.
*/
Loader.prototype.clear = function() {
  this.factories = {};
  this.canonicalIds = {};
  this.packages ={};
  this.packageSources = {};
  this.canonicalPackageIds = {};
};

/**
  The default package.  This can be replaced but normally it is empty, meaning
  it will never match a module.
  
  @property {Package}
*/
Loader.prototype.defaultPackage = new Package('default', { 
  name: "default" 
});

/**
  The anonymous package.  This can be used when loading files outside of a 
  package.
  
  @property {Package}
*/
Loader.prototype.anonymousPackage = new Package('(anonymous)', { 
  name: "(anonymous)"
});


/**

  Discovers the canonical id for a module.  A canonicalId is a valid URN that
  can be used to uniquely identify a module.
  that looks like:
  
    ::packageId:moduleId
    
  For example:
  
    ::sproutcore-runtime/1.2.0:mixins/enumerable
  
  Canonical Ids are discovered according to the following algorithm:
  
  1.  If you pass in an already canonicalId, return it
  2.  If you pass in a relative moduleId, it will be expanded and attached
      to the workingPackage.
  3.  If you pass in a moduleId with a packageId embedded, lookup the latest
      version of the package that is compatible with the passed workingPackage
  4.  If you pass a moduleId with no packageId embedded, then first look
      for the module on the workingPackage.  
  5.  If not found there, look for a packageId with the same name.  If that is 
      found, return either packageId:index or packageId:packageId as module.  
  6.  Otherwise, assume it is part of the default package. 

  @param {String} moduleId
    The moduleId to lookup.  May be a canonicalId, packageId:moduleId, 
    absolute moduleId or relative moduleId
    
  @param {String} curModuleId
    Optional.  moduleId of the module requesting the lookup.  Only needed if
    the moduleId param might be relative.
    
  @param {Package} workingPackage
    The working package making the request.  When searching for a package,
    only use packages that are compatible with the workingPackage.
    
    This parameter is also optional, though if you omit it, this method 
    assumes the anonymousPackage.
    
  @returns {void}
*/
Loader.prototype.canonical = function(moduleId, curModuleId, workingPackage) {
  
  var cache, cacheId, idx, packageId, canonicalId, pkg, ret; 
  
  // NORMALIZE PARAMS
  // normalize params - curModuleId can be omitted (though relative ids won't)
  // work
  if (curModuleId && (T_STRING !== typeof curModuleId)) {
    workingPackage = curModuleId;
    curModuleId = null;
  }
  
  // return immediately if already canonical
  if (isCanonicalId(moduleId)) return moduleId;
  
  // if no workingPackage, assume anonymous
  if (!workingPackage) workingPackage = this.anonymousPackage;
  
  // Resolve moduleId - may return canonical
  moduleId = this._resolve(moduleId, curModuleId, workingPackage);
  if (isCanonicalId(moduleId)) return moduleId;
  
  // then lookup in cache
  cacheId = workingPackage ? workingPackage.id : '(null)';
  cache = this.canonicalIds;
  if (!cache) cache = this.canonicalIds = {};
  if (!cache[cacheId]) cache[cacheId] = {};
  cache = cache[cacheId];
  if (cache[moduleId]) return cache[moduleId];
  cacheId = moduleId; // save for later

  // Not Found in Cache.  Do a lookup
  idx = moduleId.indexOf(':');
  if (idx>=0) {
    packageId = moduleId.slice(0,idx);
    moduleId  = moduleId.slice(idx+1);
    if (moduleId[0]==='/') {
      throw new Error('Absolute path not allowed with packageId');
    }
  }

  // if packageId is provided, just resolve packageId to a canonicalId
  ret = null;
  if (packageId && (packageId.length>0)) {
    canonicalId = this._canonicalPackageId(packageId, null, workingPackage);
    if (canonicalId) ret = joinPackageId(canonicalId, moduleId);

  // no packageId is provided, we'll need to do a little more searching
  } else {

    // first look in workingPackage for match...
    if (workingPackage && workingPackage.exists(moduleId)) {
      ret = joinPackageId(workingPackage.id, moduleId);
      
    // not in working package, look for packageId:index or
    // packageId:packageId
    } else {
      canonicalId = this._canonicalPackageId(moduleId, null, workingPackage);
      if (canonicalId) pkg = this._packageFor(canonicalId, workingPackage);
      if (pkg) {
        if (pkg.exists('index')) ret = joinPackageId(pkg.id, 'index');
        else if (pkg.exists(moduleId)) ret = joinPackageId(pkg.id,moduleId);
      }
    }
    
    // not in working package and isn't a package itself, assume default
    // package.  If there is no defaultPackage, return with the working
    // package.  This will fail but at least the error will be more 
    // helpful
    if (!ret) {
      if (this.defaultPackage) packageId = this.defaultPackage.id;
      else if (this.workingPackage) packageId = this.workingPackage.id;
      else if (this.anonymousPackage) packageId = this.anonymousPackage.id;
      else return packageId = null;
      
      if (packageId) ret = joinPackageId(packageId, moduleId);
    }
  }

  // save to cache and return
  cache[cacheId] = ret;
  return ret ;
};
  
/**

  Loads a factory for the named canonical module Id.  If you did not obtain
  the canonical module id through the loader's canonical() method, then you
  must also pass a workingPackage property so that the loader can locate the
  package that owns the module.
  
  The returns factory function can be used to actually generate a module.
  
  @param {String} canonicalId
    A canonical module id
    
  @param {Package} workingPackage
    Optional working package.  Only required if you pass in a canonical id
    that you did not obtain from the loader's canonical() method.
    
  @returns {void}
  
*/
Loader.prototype.load = function(canonicalId, workingPackage, sandbox) {

  var cache, ret, idx, packageId, moduleId, pkg;
  
  if (!workingPackage) workingPackage = this.anonymousPackage;
  
  cache = this.factories;
  if (!cache) cache = this.factories = {};
  if (cache[canonicalId]) return cache[canonicalId];

  // not in cache - load from package
  idx       = canonicalId.indexOf(':',2);
  packageId = canonicalId.slice(0,idx);
  moduleId  = canonicalId.slice(idx+1);

  pkg = this._packageFor(packageId, workingPackage);
  
//@if(debug)
  if (!pkg) DEBUG('Loader#load - '+packageId+' not found for '+moduleId);
//@endif

  if (!pkg) return null; // not found
  
  ret = pkg.load(moduleId, sandbox);
  cache[canonicalId] = ret;
  return ret ;
};

/**
  Returns a catalog of all known packages visible to the workingPackage.
  The catalog is simply an array of package objects in no particular order
*/
Loader.prototype.catalogPackages = function(workingPackage) {
  if (!workingPackage) workingPackage = this.anonymousPackage;
  var catalog = [], sources, idx, len, seen = {};
  if (this.defaultPackage) catalog.push(this.defaultPackage);
  
  // anonymous package is never visible unless it is working..
  //if (this.anonymousPackage) ret.push(this.anonymousPackage);

  // append any packages with versions that haven't been seen already
  var append = function(packages) {
    var idx, len, check, cur;
    
    if (!packages) return; // nothing to do
    len = packages.length;
    for(idx=0;idx<len;idx++) {
      cur = packages[idx];
      check = seen[cur.get('name')];
      if (!check) check = seen[cur.get('name')] = {};      
      if (!check[cur.get('version')]) {
        catalog.push(cur);
        check[cur.get('version')] = cur;
      }
    }
  };
  
  if (workingPackage) append(workingPackage.catalogPackages());

  sources = this.sources;
  len = sources.length;
  for(idx=0;idx<len;idx++) append(sources[idx].catalogPackages());
  
  seen = null; // no longer needed.
  return catalog;
};

/**
  Discovers the canonical id for a package.  A cnaonicalID is a URN that can
  be used to uniquely identify a package.  It looks like: 
  
    ::packageId
  
  for example:
  
    ::sproutcore-datastore/1.2.0/1ef3ab23ce23ff938

  If you need to perform some low-level operation on a package, this method
  is the best way to identify the package you want to work with specifically.
  
  ## Examples
  
  Find a compatible package named 'foo' in the current owner module:
  
      loader.canonicalPackage('foo', ownerPackage, function(err, pkg) {
        // process response
      });
      
  Find the package named 'foo', exactly version '1.0.0'.  This may return a
  packes nested in the ownerPackage:
  
      loader.canonicalPackage('foo', '=1.0.0', ownerPackage, function(err, pkg) {
        // process response
      });
  
  Find the latest version of 'foo' installed in the system - not specific to 
  any particular package
  
      loader.canonicalPackage('foo', loader.anonymousPackage, function(err, pkg) {
        // process result
      });
      
  @param {String|Package} packageId
    The packageId to load.  If you pass a package, the package itself will
    be returned.
    
  @param {String} vers 
    The required version.  Pass null or omit this parameter to use the latest
    version (compatible with the workingPackage).
    
  @param {Package} workingPackage
    The working package.  This method will search in this package first for
    nested packages.  It will also consult the workingPackage to determine 
    the required version if you don't name a version explicitly.
    
    You may pass null or omit this parameter, in which case the anonymous
    package will be used for context.
    
  @param {Function} done 
    Callback.  Invoked with an error and the loaded package.  If no matching
    package can be found, invoked with null for the package.

  @returns {void}
*/
Loader.prototype.canonicalPackageId = function(packageId, vers, workingPackage) {

  var idx;

  // fast path in case you pass in a package already
  if (packageId instanceof Package) return packageId.id;

  // fast path packageId is already canonical - slice of moduleId first
  if (isCanonicalId(packageId)) {
    idx = packageId.indexOf(':', 2);
    if (idx>=0) packageId = packageId.slice(0,idx);
    return packageId;
  }
  
  // normalize the params.  vers may be omitted
  if (vers && (T_STRING !== typeof vers)) {
    workingPackage = vers;
    vers = null;
  }  

  // must always have a package
  if (!workingPackage) workingPackage = this.anonymousPackage;
  
  // if packageId includes a moduleId, slice it off
  idx = packageId.indexOf(':');
  if (idx>=0) packageId = packageId.slice(0, idx);
  
  // now we can just pass onto internal primitive
  return this._canonicalPackageId(packageId, vers, workingPackage);
};


/**
  Primitive returns the package instance for the named canonicalId.  You can
  pass in a canonicalId for a package only or a package and module.  In either
  case, this method will only return the package instance itself.
  
  Note that to load a canonicalId that was not resolved through the 
  canonicalPackageId() or canonical() method, you will need to also pass in
  a workingPackage so the loader can find the package.
  
  @param {String} canonicalId
    The canonicalId to load a package for.  May contain only the packageId or
    a moduleId as well.
    
  @param {Package} workingPackage
    Optional workingPackage used to locate the package.  This is only needed
    if you request a canonicalId that you did not obtain through the 
    canonical*() methods on the loader.

  @returns {void}
*/
Loader.prototype.packageFor = function(canonicalId, workingPackage){

  if (!workingPackage) workingPackage = this.anonymousPackage;
  
  // remove moduleId
  var idx = canonicalId.indexOf(':', 2);
  if (idx>=0) canonicalId = canonicalId.slice(0, idx);

  return this._packageFor(canonicalId, workingPackage);
};

/**
  Verifies that the named canonicalId is ready for use, including any of its
  dependencies.  You can pass in either a canonical packageId only or a 
  moduleId.   In either case, this method will actually only check the package
  properties for dependency resolution since dependencies are not tracked for
  individual modules.
  
  @param {String} canonicalId
    The canonicalId to use for lookup
    
  @param 
*/
Loader.prototype.ready = function(canonicalId, workingPackage) {

  if (!workingPackage) workingPackage = this.anonymousPackage;
  
  // strip out moduleId
  var idx = canonicalId.indexOf(':', 2), 
      moduleId, pkg;
  
  if (idx >= 0) {
    moduleId    = canonicalId.slice(idx+1);
    canonicalId = canonicalId.slice(0, idx);
  }
  
  if (this._packageReady(canonicalId, workingPackage, {})) {
    pkg = this._packageFor(canonicalId, workingPackage);
    if (!pkg) return false;
    return !!pkg.exists(moduleId);
  } else return false;
  
};

/**
  Ensures the package that maps to the passed packageId/vers combo and all
  of its known dependencies are loaded and ready for use.  If anything is not
  loaded, it will load them also.  
  
  Invokes the passed callback when loading is complete.
  
  This method ends up calling ensurePackage() on one or more of its sources
  to get the actual packages to load.
  
  @param {String} packageId
    The packageID to load.  May be a packageId name or a canonical packageId
    
  @param {String} vers
    Optional version used to constrain the compatible package
    
  @param {Package} workingPackage
    Optional working package used to match the packageId.  If the package 
    might be nested you should always pass a workingPackage.  Default assumes
    anonymousPackage.
    
  @param {Function} done
    Callback invoked when package is loaded.  Passes an error if there was an
    error.  Otherwise no params.
    
  @returns {void}
*/
Loader.prototype.ensurePackage = function(packageId, vers, workingPackage, done) {

  // normalize params
  if (vers && (T_STRING !== typeof vers)) {
    done = workingPackage ;
    workingPackage = vers;
    vers = null;
  }

  if (workingPackage && (T_FUNCTION === typeof workingPackage)) {
    done = workingPackage;
    workingPackage = null;
  }
  
  if (!workingPackage) workingPackage = this.anonymousPackage;

  this._ensurePackage(packageId, vers, workingPackage, {}, done);
};

/**
  @private
  
  Primitive for ensurePackage().  Does no param normalization.  Called 
  recursively for dependencies.
*/
Loader.prototype._ensurePackage = function(packageId, vers, workingPackage, seen, done) {

  var loader = this, canonicalId, source;
  
  // find the canonicalId and source to ask to ensure...
  canonicalId = this._canonicalPackageId(packageId, vers, workingPackage);
  if (!canonicalId) {
    return done(new NotFound(packageId, workingPackage));
  }

  if (seen[canonicalId]) return done(); // success
  seen[canonicalId] = true;

  source = this._sourceForCanonicalPackageId(canonicalId, workingPackage);
  if (!source) {
    return done(new NotFound(canonicalId, workingPackage));
  }

  source.ensurePackage(canonicalId, function(err) {
    var pkg, deps, packageId, packageIds;

    if (err) return done(err);
    pkg = loader.packageFor(canonicalId, workingPackage);
    if (!pkg) {
      return done(new NotFound(canonicalId, workingPackage));
    }

    deps = pkg.get('dependencies');
    if (!deps) return done(); // nothing to do
    
    // map deps to array to we can process in parallel
    packageIds = [];
    for(packageId in deps) {
      if (!deps.hasOwnProperty(packageId)) continue;
      packageIds.push({ packageId: packageId, vers: deps[packageId] });
    }
    
    parallel(packageIds, function(info, done) {
      loader._ensurePackage(info.packageId, info.vers, pkg, seen, done);
    })(done);

  });
  
};

/**
  @private
  
  Discovers the canonical packageId for the named packageId, version and 
  working package.  This will also store in cache the source where you can
  locare and load the associated package, if needed.
  
  This primitive is used by all other package methods to resolve a package
  into a canonicalId that can be used to reference a specific package instance
  
  It does not perform any error checking on passed in parameters which is why
  it should never be called directly outside of the Loader itself.
  
  @param {String|Package} packageId
    The packageId to load.  If you pass a package, the package itself will
    be returned.
    
  @param {String} vers 
    The required version.  Pass null or omit this parameter to use the latest
    version (compatible with the workingPackage).
    
  @param {Package} workingPackage
    The working package.  This method will search in this package first for
    nested packages.  It will also consult the workingPackage to determine 
    the required version if you don't name a version explicitly.
    
  @returns {String}
*/
Loader.prototype._canonicalPackageId = function(packageId, vers, workingPackage) {
  
  // fast paths
  if (packageId instanceof Package) return packageId.id;
  if (isCanonicalId(packageId)) return packageId;
  if ((packageId === 'default') && this.defaultPackage) {
    return this.defaultPackage.id;
  }
  
  var cache = this.canonicalPackageIds,
      cacheId, sources, ret, idx, len, source;
  // use anonymousPackage if no workingPackage is provided
  if (!workingPackage) workingPackage = this.anonymousPackage;
  if (!workingPackage) throw new Error('working package is required');

  // if packageId is already canonical, vers must be null, otherwise lookup
  // vers in working package
  if (!vers) vers = workingPackage.requiredVersion(packageId);
  
  // look in cache...
  cacheId = workingPackage.id;
  if (!cache) cache = this.canonicalPackageIds = {};
  if (!cache[cacheId]) cache[cacheId] = {};
  cache = cache[cacheId];
  if (!cache[packageId]) cache[packageId] = {};
  cache = cache[packageId];
  if (cache[vers]) return cache[vers];

  sources = this.sources;

  // first, ask the workingPackage  
  ret = workingPackage.canonicalPackageId(packageId, vers);
  source = workingPackage;
  

  // not found - make sure there isn't another incompatible version in 
  // workingPackage.  nested packages superceed all other packages so if there
  // is an incompatible nested version we need to throw an error.
  if (!ret) {
    ret = workingPackage.canonicalPackageId(packageId, null);
    if (ret) {
      throw new Error(
        workingPackage.get('name')+" contains an incompatible nested"+
        " package "+packageId+" (expected: "+vers+")");
    }
  }
  
    
  // next, if not found in the workingPackage, then ask each of our 
  // sources in turn until a match is found.  When found, return
  if (!ret && sources) {
    len = sources.length;
    for(idx=0;!ret && (idx<len);idx++) {
      source = sources[idx];
      ret = source.canonicalPackageId(packageId, vers);
    }
  }
  
  if (ret) this._cachePackageSource(ret, workingPackage, source);
  cache[vers] = ret;
  return ret ;
};

// add a function to the cache that will immediately return the source
Loader.prototype._cachePackageSource = function(id, workingPackage, source) {
  var scache = this.packageSources, pkgId = workingPackage.id;
  
  if (!scache) scache = this.packageSources = {};
  if (!scache[pkgId]) scache[pkgId] = {};
  scache = scache[pkgId];
  scache[id] = source;
};

/**
  Looks up the source for the named canonicalId in the cache.  Returns null
  if no match is found.
*/
Loader.prototype._sourceForCanonicalPackageId = function(canonicalId, workingPackage) {
  var scache = this.packageSources, 
      wpackageId = workingPackage.id, 
      pkg, sources, len, idx, ret;

  if (!scache) scache = this.packageSources = {};
  if (!scache[wpackageId]) scache[wpackageId] = {};
  scache = scache[wpackageId];
  if (scache[canonicalId]) return scache[canonicalId];
  
  sources = this.sources;
    
  // first, ask the workingPackage to find any matching package (since it 
  // can only have one version).  Then check the returned version against 
  // the expected version.  
  if (workingPackage) {
    pkg = workingPackage.packageFor(canonicalId);
    if (pkg) ret = workingPackage; 
  }
  
  if (!ret && sources) {
    len = sources.length;
    for(idx=0;!ret && (idx<len); idx++) {
      ret = sources[idx];
      if (!ret.packageFor(canonicalId)) ret = null;
    }
  }
  
  scache[canonicalId] = ret;
  return ret ;
};

/**
  Primitive actually loads a package from a canonicalId.  Throws an exception
  if source for package is not already in cache.  Also caches loaded package.
*/
Loader.prototype._packageFor = function(canonicalId, workingPackage) {
  var cache, source, ret;

  // special case - if default packageId just get the default package.
  if (this.defaultPackage && (canonicalId === this.defaultPackage.id)) {
    return this.defaultPackage;
  }
  
  // try to resolve out of cache
  cache = this.packages;
  if (!cache) cache = this.packages = {};
  if (cache[canonicalId]) return cache[canonicalId];

  source = this._sourceForCanonicalPackageId(canonicalId, workingPackage);
  if (source) ret = source.packageFor(canonicalId);
  cache[canonicalId] = ret;
  return ret ;
};

/**
  Primitive simply checks to see if the named canonicalId is ready or not
  along with any dependencies
*/
Loader.prototype._packageReady = function(canonicalId, workingPackage, seen) {
  var cache = this.packages, pkg, deps, packageId, vers;

  // if we've already seen this package, exit immediately
  if (seen[canonicalId]) return true;
  seen[canonicalId] = true;
  
  // first try to find the package for the receiver
  pkg = this._packageFor(canonicalId, workingPackage);
  if (!pkg) return false; // nothing to do.

  // look at dependencies. make sure they are also loaded
  deps = pkg.get('dependencies');
  for(packageId in deps) {
    if (!deps.hasOwnProperty(packageId)) continue;
    vers = deps[packageId];
    canonicalId = this._canonicalPackageId(packageId, vers, pkg);
    if (!canonicalId) return false;
    return this._packageReady(canonicalId, pkg, seen);
  }
  
  return true;
};

/**
  Take a relative or fully qualified module name as well as an optional
  base module Id name and returns a fully qualified module name.  If you 
  pass a relative module name and no baseId, throws an exception.

  Any embedded package name will remain in-tact.

  resolve('foo', 'bar', 'my_package') => 'foo'
  resolve('./foo', 'bar/baz', 'my_package') => 'my_package:bar/foo'
  resolve('/foo/bar/baz', 'bar/baz', 'my_package') => 'default:/foo/bar/baz'
  resolve('foo/../bar', 'baz', 'my_package') => 'foo/bar'
  resolve('your_package:foo', 'baz', 'my_package') => 'your_package:foo'

  If the returned id does not include a packageId then the canonical() 
  method will attempt to resolve the ID by searching the default package, 
  then the current package, then looking for a package by the same name.

  @param {String} moduleId relative or fully qualified module id
  @param {String} baseId fully qualified base id
  @returns {String} fully qualified name
*/
Loader.prototype._resolve = function(moduleId, curModuleId, pkg){
  var path, len, idx, part, parts, packageId, err;

  // if id does not contain a packageId and it starts with a / then 
  // return with anonymous package id.
  if (moduleId[0]==='/' && moduleId.indexOf(':')<0) {
    return this.anonymousPackage.id + ':' + moduleId;
  }

  // contains relative components?
  if (moduleId.match(/(^\.\.?\/)|(\/\.\.?\/)|(\/\.\.?\/?$)/)) {

    // if we have a packageId embedded, get that first
    if ((idx=moduleId.indexOf(':'))>=0) {
      packageId = moduleId.slice(0,idx);
      moduleId  = moduleId.slice(idx+1);
      path      = []; // path must always be absolute.

    // if no package ID, then use baseId if first component is . or ..
    } else if (moduleId.match(/^\.\.?\//)) {
      if (!curModuleId) {
        throw new Error("id required to resolve relative id: "+moduleId);
      }

      // if base moduleId contains a packageId return an error
      if (curModuleId.indexOf(':')>=0) {
        throw new Error("current moduleId cannot contain packageId");
      }
        
      // use the pkg.id (which will be canonical)
      if (pkg) packageId = pkg.id;

      // work from current moduleId as base.  Ignore current module name
      path = curModuleId.split('/');
      path.pop(); 

    } else path = [];

    // iterate through path components and update path
    parts = moduleId.split('/');
    len   = parts.length;
    for(idx=0;idx<len;idx++) {
      part = parts[idx];
      if (part === '..') {
        if (path.length<1) throw new Error("invalid path: "+moduleId);
        path.pop();

      } else if (part !== '.') path.push(part);
    }

    moduleId = path.join('/');
    if (packageId) moduleId = joinPackageId(packageId, moduleId);
  }

  return moduleId ;
};


// ..........................................................
// SANDBOX
// 

/**
  A Sandbox maintains a cache of instantiated modules.  Whenever a modules 
  is instantiated, it will always be owned by a single sandbox.  This way
  when you required the same module more than once, you will always get the
  same module.
  
  Each sandbox is owned by a single loader, which is responsible for providing
  the sandbox with Factory objects to instantiate new modules.
  
  A sandbox can also have a 'main' module which can be used as a primary
  entry point for finding other related modules.
  
*/
var Sandbox = exports.extend(Object);
exports.Sandbox = Sandbox;

Sandbox.prototype.init = function(loader, env, args, mainModuleId) {
  this.loader = loader;
  this.env    = env;
  this.args   = args;
  if (mainModuleId) this.main(mainModuleId);

  this.clear();
};

Sandbox.prototype.catalogPackages = function(workingPackage) {
  return this.loader.catalogPackages(workingPackage);
};

Sandbox.prototype.createRequire = function(module) {
  
  var sandbox = this,
      curId   = module.id,
      curPkg  = module.ownerPackage,
      reqd;
      
  // basic synchronous require
  var req = function(moduleId, packageId) {
    if (packageId && moduleId.indexOf(':')<0) {
      if (packageId.isPackage) packageId = packageId.id;
      moduleId = packageId+':'+moduleId;
    }
    return sandbox.require(moduleId, curId, curPkg);
  };
  reqd = req.displayName = (curId||'(unknown)')+'#require';

  // expose any native require.  Mostly used by seed
  req.nativeRequire = sandbox.nativeRequire;
  
  // async version - packageId is optional
  req.ensure = function(moduleIds, done) {
    // always normalize moduleId to an array
    if (!isArray(moduleIds)) {
      moduleIds = Array.prototype.slice.call(arguments);
      done = moduleIds.pop();
    }

    // ensure each module is loaded 
    parallel(moduleIds, function(moduleId, done) {
      sandbox.ensure(moduleId, curId, curPkg, done);

    })(function(err) { 
      if (err) return done(err);
      if (done.length<=1) return done(); // don't lookup modules themselves
      
      done(null, map(moduleIds, function(moduleId) {
        return sandbox.require(moduleId, curId, curPkg);
      }));
    });
  };
  req.ensure.displayName = reqd+'.ensure';
  
  // return true if the passed module or modules are ready for use right now
  // this is like calling ensure() but it won't load anything that isn't 
  // actually ready
  req.ready = function(moduleIds) {
    var idx, len ;
    
    // always normalize moduleId to an array
    if (!isArray(moduleIds)) {
      moduleIds = Array.prototype.slice.call(arguments);
    }

    len = moduleIds.length;
    for(idx=0;idx<len;idx++) {
      if (!sandbox.ready(moduleIds[idx], curId, curPkg)) return false;
    }
    return true;
  };
  req.ready.displayName = reqd+'.ready';

  /**
    Returns the package for the named packageId and optional version from
    the perspective of the current package.  This invokes a similar method 
    on the sandbox, which will pass it along to the loader, though a secure
    sandbox may actually wrap the responses as well.
    
    This method only acts on packages available locally.  To get possibly
    remote packages, you must first call require.ensurePackage() to ensure
    the package and its dependencies have been loaded.
    
    @param {String} packageId
      The packageId to load
      
    @param {String} vers
      Optional version
      
    @returns {Package} the package or null
  */
  req.packageFor = function(packageId, vers) {
    return sandbox.packageFor(packageId, vers, curPkg);
  };
  req.packageFor.displayName = reqd+'.packageFor';
  
  /**
    Asynchronously loads the named package and any dependencies if needed.
    This is only required if you suspect your package may not be available 
    locally.  If your callback accepts only one parameter, then the packages
    will be loaded but not instantiated. The first parameter is always an 
    error object or null.
    
    If your callback accepts more than one parameter, then the packages will
    be instantiated and passed to your callback as well.
  
    If a package cannot be loaded for some reason, your callback will be 
    invoked with an error of type NotFound.
    
    @param {String} packageId
      The packageId to load
    
    @param {String} vers
      Optional version

    @param {Function} done
      Callback invoked once packages have loaded.
    
    @returns {Package} the package or null
  */
  req.ensurePackage = function(packageId, vers, done) {
    sandbox.ensurePackage(packageId, vers, curPkg, function(err) {
      if (err) return done(err);
      if (done.length <= 1) return done();
      done(null, sandbox.packageFor(packageId, vers, curPkg));
    });
  };
  req.ensurePackage.displayName = reqd+'.ensurePackage.displayName';
  
  /**
    Returns a catalog of all packages visible to the current module without
    any additional loading.  This may be an expensive operation; you should
    only use it when necessary to detect plugins, etc.
  */
  req.catalogPackages = function() {
    return sandbox.catalogPackages(curPkg);
  };
  
  // mark main module in sandbox
  req.main = sandbox.main();
  req.env  = sandbox.env;
  req.args = sandbox.args;
  req.sandbox = sandbox;
  req.loader  = sandbox.loader;
  
  req.isTiki = true; // walk like a duck
  
  return req;
};

// ..........................................................
// RESOLVING MODULE IDS
// 

Sandbox.prototype.Module = Module;

/**
  Retrieves a module object for the passed moduleId.  You can also pass 
  optional package information, including an optional curModuleId and a
  workingPackage.  You MUST pass at least a workingPackage.
  
  The returned module object represents the module but the module exports may
  not yet be instantiated.  Use require() to retrieve the module exports.
  
  @param {String} moduleId
    The module id to lookup.  Should include a nested packageId
    
  @param {String} curModuleId
    Optional current module id to resolve relative modules.
    
  @param {Package} workingPackage
    The working package making the request
    
  @returns {void}
*/
Sandbox.prototype.module = function(moduleId, curModuleId, workingPackage) {

  var ret, canonicalId, cache, packageId, idx, pkg;
  
  // assume canonicalId will normalize params
  canonicalId = this.loader.canonical(moduleId, curModuleId, workingPackage);
  if (!canonicalId) throw(new NotFound(moduleId, workingPackage));

  // get out of cache first
  cache = this.modules;
  if (!cache) cache = this.modules = {};
  if (ret = cache[canonicalId]) return ret;
  
  // not in cache...add it
  idx       = canonicalId.indexOf(':', 2);
  moduleId  = canonicalId.slice(idx+1);
  packageId = canonicalId.slice(0, idx);
  pkg = this.loader.packageFor(packageId, workingPackage);
  if (!pkg) throw(new NotFound(packageId, workingPackage));
  ret = cache[canonicalId] = new this.Module(moduleId, pkg, this);
  
  return ret ;
};

/**
  Returns the main module for the sandbox.  This should only be called 
  from the factory when it is setting main on itself.  Otherwise the main
  module may not exist yet.
  
  Note that the mainModule will be resolved using the anonymousPackage so
  the named module must be visible from there.
*/
Sandbox.prototype.main = function(newMainModuleId, workingPackage) {
  if (newMainModuleId !== undefined) {
    this._mainModule = null;
    this._mainModuleId = newMainModuleId;
    this._mainModuleWorkingPackage = workingPackage;
    return this;
    
  } else {
    if (!this._mainModule && this._mainModuleId) {
      workingPackage = this._mainModuleWorkingPackage;
      this._mainModule = this.module(this._mainModuleId, workingPackage);
    }
    return this._mainModule;
  }
};

/**
  Returns the exports for the named module.

  @param {String} moduleId
    The module id to lookup.  Should include a nested packageId
  
  @param {String} curModuleId
    Optional current module id to resolve relative modules.
  
  @param {Package} workingPackage
    The working package making the request
  
  @param {Function} done
    Callback to invoke when the module has been retrieved.
  
  @returns {void}
*/
Sandbox.prototype.require = function(moduleId, curModuleId, workingPackage) {

  var ret, canonicalId, cache, used, factory, module, exp;
  
  // assume canonical() will normalize params
  canonicalId = this.loader.canonical(moduleId, curModuleId, workingPackage);
  if (!canonicalId) throw new NotFound(moduleId, workingPackage);

  // return out of cache
  cache = this.exports; used  = this.usedExports;
  if (!cache) cache = this.exports = {};
  if (!used)  used  = this.usedExports = {};
  if (ret = cache[canonicalId]) {
    ret = ret.exports;
    if (!used[canonicalId]) used[canonicalId] = ret;
    return ret;
  }

  // not in cache, get factory, module, and run function...
  factory = this.loader.load(canonicalId, workingPackage, this);
  if (!factory) throw(new NotFound(canonicalId, workingPackage));

  module  = this.module(canonicalId, workingPackage);
  cache[canonicalId] = module;

  exp = factory.call(this, module);
  module.exports = exp;
  
  // check for cyclical refs
  if (used[canonicalId] && (used[canonicalId] !== exp)) {
    throw new Error("cyclical requires() in "+canonicalId);
  }

  return exp;
};

/**
  Returns true if the given module is ready. This checks the local cache 
  first then hands this off to the loader.
*/
Sandbox.prototype.ready = function(moduleId, curModuleId, workingPackage) {
  // assume canonicalPackageId() will normalize params
  var id = this.loader.canonical(moduleId, curModuleId, workingPackage);
  return id ? this.loader.ready(id) : false;
};

/**
  Ensures the passed moduleId and all of its dependencies are available in
  the local domain.  If any dependencies are not available locally, attempts
  to retrieve them from a remote server.
  
  You don't usually call this method directly.  Instead you should call the 
  require.ensure() method defined on a module's local require() method.
  
*/
Sandbox.prototype.ensure = function(moduleId, curModuleId, workingPackage, done) {

  var id, loader, packageId, idx;
  
  // normalize params so that done is in right place
  if (curModuleId && (T_STRING !== typeof curModuleId)) {
    done = workingPackage;
    workingPackage = curModuleId;
    curModuleId = null;
  }
  
  if (workingPackage && (T_FUNCTION === typeof workingPackage)) {
    done = workingPackage ;
    workingPackage = null;
  }
  
  id = this.loader.canonical(moduleId, curModuleId, workingPackage);
  if (!id) return done(new NotFound(moduleId, workingPackage));
  
  idx       = id.indexOf(':', 2);
  moduleId  = id.slice(idx+1);
  packageId = id.slice(0, idx);
  loader    = this.loader;

  loader.ensurePackage(packageId, workingPackage, function(err) {
    if (err) return done(err);
    var pkg = loader.packageFor(packageId, workingPackage);
    if (!pkg.exists(moduleId)) done(new NotFound(moduleId, pkg));
    else done(); // all clear
  });
};

/**
  TODO: document
*/
Sandbox.prototype.packageFor = function(packageId, vers, workingPackage) {

  // assume canonicalPackageId() will normalize params
  var id = this.loader.canonicalPackageId(packageId, vers, workingPackage);
  if (!id) return null;
  return this.loader.packageFor(id);
};

/** 
  TODO: document
*/
Sandbox.prototype.ensurePackage = function(packageId, vers, workingPackage, done) {

  // normalize params so that done is in right place
  if (vers && (T_STRING !== typeof vers)) {
    done = workingPackage;
    workingPackage = vers;
    vers = null;
  }
  
  if (workingPackage && (T_FUNCTION === typeof workingPackage)) {
    done = workingPackage ;
    workingPackage = null;
  }
  
  var id = this.loader.canonicalPackageId(packageId, vers, workingPackage);
  if (!id) return done(new NotFound(packageId, workingPackage));
  this.loader.ensurePackage(id, done);
};


/**
  Returns the path or URL to a resource in the named package. 
*/
Sandbox.prototype.resource = function(resourceId, moduleId, ownerPackage) {
  if (!ownerPackage.resource) return null;
  return ownerPackage.resource(resourceId, moduleId);
};

/**
  Clears the sandbox.  requiring modules will cause them to be reinstantied
*/
Sandbox.prototype.clear = function() {
  this.exports = {};
  this.modules = {};
  this.usedExports = {};
  return this;
};

// ..........................................................
// BROWSER
// 

// Implements a default loader source for use in the browser.  This object
// should also be set as the "require" global on the browser to allow for
// module registrations

var Browser = exports.extend(Object);
exports.Browser = Browser;

Browser.prototype.init = function() {
  this._ready  = {};
  this._unload = {};
  
  this.clear();
};

/**
  Reset the browser caches.  This would require all packages and modules 
  to register themselves.  You should also clear the associated loader and
  sandbox if you use this.
*/
Browser.prototype.clear = function() {
  this.packageInfoByName = {}; // stores package info sorted by name/version
  this.packageInfoById   = {}; // stores package info sorted by id
  this.packages    = {}; // instantiated packages
  this.factories   = {}; // registered module factories by id

  this.stylesheetActions = {}; // resolvable stylesheet load actions
  this.scriptActions     = {}; // resolvable script actions
  this.ensureActions     = {}; // resolvable package actions
};

/**
  Configures a basic sandbox environment based on the browser.  Now you can
  register and require from it.
  
  @returns {Browser} new instance
*/
Browser.start = function(env, args, queue) {
  // build new chain of objects and setup require.
  var browser, len, idx, action;
  
  browser         = new Browser();
  browser.loader  = new Loader([browser]);
  browser.sandbox = new Sandbox(browser.loader, env, args);
  browser.queue   = queue;

  var mod = { 
    id: 'index', 
    ownerPackage: browser.loader.anonymousPackage 
  };

  browser.require = browser.sandbox.createRequire(mod);
  // TODO: amend standard CommonJS methods for loading modules when they
  // are standardized
  
  return browser;
};

Browser.prototype.replay = function() {
  var queue = this.queue,
      len   = queue ? queue.length : 0,
      idx, action;
      
  this.queue = null;
  for(idx=0;idx<len;idx++) {
    action = queue[idx];
    this[action.m].apply(this, action.a);
  }
  
  return this;
};

// safe - in place of preamble start()
Browser.prototype.start = function() {
  return this;
};

/**
  Makes all dependencies of the passed canonical packageId global.  Used
  for backwards compatibility with non-CommonJS libraries.
*/
Browser.prototype.global = function(canonicalId) {
  if (!domAvailable && !xhrAvailable) return this;  // don't work out of brsr
  var GLOBAL = (function() { return this; })();
  
  var globals, pkg, deps, packageId, exports, keys, key, idx, len;
  
  globals = this.globals;
  if (!globals) globals = this.globals = {};

  pkg = this.packageFor(canonicalId);
  if (!pkg) throw new Error(canonicalId+' package not found');
  
  deps = pkg.get('dependencies');
  if (!deps) return this; // nothing to do
  
  for(packageId in deps) {
    if (!deps.hasOwnProperty(packageId)) continue;
    canonicalId  = this.loader.canonical(packageId, pkg);
    if (globals[canonicalId]) continue;
    globals[canonicalId] = true;
    
    // some cases a dependency refers to a package that is itself not 
    // using modules.  In this case just ignore
    if (!this.sandbox.ready(packageId, pkg)) continue;
    
    exports = this.sandbox.require(packageId, pkg);
    if (keys = exports.__globals__) {
      len = keys.length;
      for(idx=0;idx<len;idx++) {
        key = keys[idx];
        GLOBAL[key] = exports[key];
      }

    // no __globals__ key is defined so just iterate through any exported
    // properties. this should actually be the more common case
    } else {
      for(key in exports) {
        if (!exports.hasOwnProperty(key)) continue;
        GLOBAL[key] = exports[key];
      }
    }
    
  }

  return this;
};

// ..........................................................
// Ready & Unload Handlers
// 

var buildInvocation = function(args) {
  var context, method;
  
  if (args.length === 1) {
    context = null;
    method  = args[0];
    args = Array.prototype.slice.call(args, 1);
  } else {
    context = args[0];
    method  = args[1];
    args    = Array.prototype.slice.call(args, 2);
  }

  return { target: context, method: method, args: args };
};

var queueListener = function(base, queueName, args) {
  if (!base[queueName]) base[queueName] = [];
  base[queueName].push(buildInvocation(args));
};

/**
  Invoke the passed callback when the document is ready.  You can pass 
  either an object/function or a moduleId and property name plus additional
  arguments.
*/
Browser.prototype.addReadyListener = function(context, method) {
  if (this._ready && this._ready.isReady) {
    this._invoke(buildInvocation(arguments));
  } else {
    this._setupReadyListener();
    queueListener(this._ready, 'queue', arguments);
  }
};

/**
  Invoke the passed callback just after any ready listeners have fired but
  just before the main moduleId is required.  This is primarily provided as 
  a way for legacy environments to hook in their own main function.
*/
Browser.prototype.addMainListener = function(context, method) {
  if (this._ready && this._ready.isReady) {
    this._invoke(buildInvocation(arguments));
  } else {
    this._setupReadyListener();
    queueListener(this._ready, 'mqueue', arguments);
  }
};

/**
  Invoke the passed callback when the browser is about to unload.
*/
Browser.prototype.addUnloadListener = function(context, method) {
  if (this._unload && this._unload.isUnloading) {
    this._invoke(buildInvocation(arguments));
  } else {
    this._setupUnloadListener();
    queueListener(this._unload, 'queue', arguments);
  }
};


Browser.prototype._invoke = function(inv) {
  var target = inv.target, method = inv.method;
  if (T_STRING === typeof target) target = this.require(target);
  if (T_STRING === typeof method) method = target[method];
  if (method) method.apply(target, inv.args);
  inv.target = inv.method = inv.args = null;
};

Browser.prototype._setupReadyListener = function() {
  if (this._ready.setup) return this;
  this._ready.setup =true;
  
  var ready = this._ready, source = this, fire;
  
  fire = function() {
    if (ready.isReady) return;
    ready.isReady = true;
    
    // first cleanup any listeners so they don't fire again
    if (ready.cleanup) ready.cleanup();
    ready.cleanup = null;
    
    var q, len, idx;
    
    q = ready.queue;
    len = q ? q.length : 0;
    ready.queue = null;
    for(idx=0;idx<len;idx++) source._invoke(q[idx]);
    
    q = ready.mqueue;
    len = q ? q.length : 0 ;
    ready.mqueue = null;
    for(idx=0;idx<len;idx++) source._invoke(q[idx]);

    source._runMain(); // get main module.
  };
      
  // always listen for onready event - detect based on platform
  // those code is derived from jquery 1.3.1
  // server-side JS
  if (T_UNDEFINED === typeof document) {
    // TODO: handler server-side JS cases here

  // Mozilla, Opera, webkit nightlies
  } else if (document.addEventListener) {

    // cleanup handler to be called whenever any registered listener fires
    // should prevent additional listeners from firing
    ready.cleanup = function() {
      document.removeEventListener('DOMContentLoaded', fire, false);
      document.removeEventListener('load', fire, false);
    };

    // register listeners
    document.addEventListener('DOMContentLoaded', fire, false);
    document.addEventListener('load', fire, false);

  // IE
  } else if (document.attachEvent) {

    // cleanup handler - should cleanup all registered listeners
    ready.cleanup = function() {
      document.detachEvent('onreadystatechange', fire);
      document.detachEvent('onload', fire);
      ready.ieHandler = null; // will stop the ieHandler from firing again
    };

    // listen for readystate and load events
    document.attachEvent('onreadystatechange', fire);
    document.attachEvent('onload', fire);

    // also if IE and no an iframe, continually check to see if the document 
    // is ready
    // NOTE: DO NOT CHANGE TO ===, FAILS IN IE.
    if ( document.documentElement.doScroll && window == window.top ) {
      ready.ieHandler = function() {

        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        if (ready.ieHandler && !ready.isReady) {
          try {
            document.documentElement.doScroll("left");
          } catch( error ) {
            setTimeout( ready.ieHandler, 0 );
            return;
          }
        }

        // and execute any waiting functions
        fire();
      };

      ready.ieHandler();
    }

  }  
};

Browser._scheduleUnloadListener = function() {
  if (this._unload.setup) return this;
  this._unload.setup =true;
  
  var unload = this._unload, source = this, fire;

  unload.isUnloading = false;
  fire = function() { 
    if (unload.isUnloading) return;
    unload.isUnloading = true;
    
    if (unload.cleanup) unload.cleanup();
    unload.cleanup = null;
    
    var q = unload.queue,
        len = q ? q.length : 0,
        idx, inv;
        
    unload.queue = null;
    for(idx=0;idx<len;idx++) source._invoke(q[idx]);
  };

  if (T_UNDEFINED === typeof document) {
    // TODO: Handle server-side JS mode
    
  } else if (document.addEventListener) {
    unload.cleanup = function() {
      document.removeEventListener('unload', fire);
    };
    document.addEventListener('unload', fire, false);
    
  } else if (document.attachEvent) {
    unload.cleanup = function() {
      document.detachEvent('onunload', fire);
    };
    document.attachEvent('unload', fire);
  }
  
};

// ..........................................................
// Registration API
// 

/**
  Sets the main moduleId on the sandbox.  This module will be automatically
  required after all other ready and main handlers have run when the document
  is ready.
  
  @param {String} moduleId
    A moduleId with packageId included ideally.  Can be canonicalId.
    
  @returns {void}
*/
Browser.prototype.main = function(moduleId, method) {
  if (this.sandbox) this.sandbox.main(moduleId);
  this._setupReadyListener(); // make sure we listen for ready event
  this._main = { id: moduleId, method: method };
};

Browser.prototype._runMain = function() {
  if (!this._main) return ;
  
  var moduleId = this._main.id,
      method   = this._main.method,
      req      = this.require;
  
  if (!moduleId || !req) return ;
  this._main = null;

  // async load any main module dependencies if needed then require
  req.ensure(moduleId, function(err) {
    if (err) throw err;
    var exp = req(moduleId);
    if (T_STRING === typeof method) method = exp[method];
    if (method) method.call(exp);
  });
};


// creates a new action that will invoke the passed value then setup the
// resolve() method to wait on response
Browser.prototype._action  = function(action) {
  var ret;
  
  ret = once(function(done) {
    ret.resolve = function(err, val) {
      ret.resolve = null; // no more...
      done(err, val);
    };
    action(); 
  });
  return ret;
  
};

Browser.prototype._resolve = function(dict, key, value) {
  
  // for pushed content, just create the action function
  if (!dict[key]) dict[key] = function(done) { done(null, value); };
  
  // if a value already exists, call resolve if still valid
  else if (dict[key].resolve) dict[key].resolve(null, value);
  return this;
};

Browser.prototype._fail = function(dict, key, err) {
  if (dict[key].resolve) dict[key].resolve(err);
};

var T_SCRIPT     = 'script',
    T_STYLESHEET = 'stylesheet',
    T_RESOURCE   = 'resource';
    
/**
  Normalizes package info, expanding some compacted items out to full 
  info needed.
*/
Browser.prototype._normalize = function(def, packageId) {
  if (!isCanonicalId(packageId)) packageId = '::'+packageId;
  def.id = packageId;
  def.version = semver.normalize(def.version);
  def['tiki:external'] = !!def['tiki:external']; 
  def['tiki:private']  = !!def['tiki:private'];  // ditto

  // expand list of resources
  var base = def['tiki:base']; 
  if (def['tiki:resources']) {

    def['tiki:resources'] = map(def['tiki:resources'], function(item) {
      
      // expand a simple string into a default entry
      if (T_STRING === typeof item) {
        item = { 
          id: packageId+':'+item,
          name: item 
        };
      }

      // must have an item name or you can't lookup the resource
      if (!item.name) {
        throw new InvalidPackageDef(def, 'resources must have a name');
      }

      if (!item.id) {
        item.id = packageId+':'+item.name;
      }
      if (!isCanonicalId(item.id)) item.id = '::'+item.id;
      
      // assume type from ext if one is provided
      if (!item.type) {
        if (item.name.match(/\.js$/)) item.type = T_SCRIPT;
        else if (item.name.match(/\.css$/)) item.type = T_STYLESHEET;
        else item.type = T_RESOURCE;
      }
      
      if (!item.url) {
        if (base) item.url = base+'/'+item.name;
        else item.url = item.id+item.name;
      }
      
      return item;
    });
  }
   
  // always have a nested and dependencies hash, even if it is empty
  if (!def.dependencies) def.dependencies = {};

  var nested = def['tiki:nested'], key;
  if (nested) {
    for(key in nested) {
      if (!nested.hasOwnProperty(key)) continue;
      if (!isCanonicalId(nested[key])) nested[key] = '::'+nested[key];
    }
    
  } else def['tiki:nested'] = {};
  
  return def;
};

/**
  Register new package information.
*/
Browser.prototype.register = function(packageId, def) {
  var reg, replace, name, vers, idx = -1;
  
  // normalize some basics...
  def = this._normalize(def, packageId);
  packageId = def.id; // make sure to get normalized packageId

  // see if a pkg with same id is registered.  if so, replace it only if 
  // the new one is not external and the old one is
  reg = this.packageInfoById;
  if (!reg) reg = this.packageInfoById = {};
  if (reg[packageId]) {
    if (!reg[packageId]['tiki:external']) return this;
    replace = reg[packageId];
  }
  reg[packageId] = def;
  
  if (def.name) {
    name = def.name;
    vers = def.version;
    
    reg = this.packageInfoByName;
    if (!reg) reg = this.packageInfoByName = {};
    if (!reg[name]) reg[name] = {};
    reg = reg[name];
    
    // update list of packageIds matching version...
    if (!reg[vers] || (reg[vers].length<=1)) {
      reg[vers] = [def];
    } else {
      if (replace) idx = reg[vers].indexOf(replace);
      if (idx>=0) {
        reg[vers] = reg[vers].slice(0, idx).concat(reg[vers].slice(idx+1));
      }
      reg[vers].push(def);
    }
    
  }
  
  return this;
};

/**
  Main registration API for all modules.  Simply registers a module for later
  use by a package.
*/
Browser.prototype.module = function(key, def) {
  if (!isCanonicalId(key)) key = '::'+key;
  this.factories[key] = def;
  return this; 
};

/**
  Register a script that has loaded
*/
Browser.prototype.script = function(scriptId) {
  if (!isCanonicalId(scriptId)) scriptId = '::'+scriptId;
  this._resolve(this.scriptActions, scriptId, true);
};

/**
  Register a stylesheet that has loaded.
*/
Browser.prototype.stylesheet = function(stylesheetId) {
  if (!isCanonicalId(stylesheetId)) stylesheetId = '::'+stylesheetId;
  this._resolve(this.stylesheetActions, stylesheetId, true);
};

// ..........................................................
// Called by Loader
//

var domAvailable = T_UNDEFINED !== typeof document && document.createElement;
var xhrAvailable = T_UNDEFINED !== typeof XMLHttpRequest;

/**
  Whether to use XHR by default. If true, XHR is tried first to fetch script
  resources; script tag injection is only used as a fallback if XHR fails. If
  false (the default if the DOM is available), script tag injection is tried
  first, and XHR is used as the fallback.
*/
Browser.prototype.xhr = !domAvailable;

/**
  Whether to automatically wrap the fetched JavaScript in tiki.module() and
  tiki.script() calls. With this on, CommonJS modules will "just work" without
  preprocessing. Setting this to true requires, and implies, that XHR will be
  used to fetch the files.
*/
Browser.prototype.autowrap = false;

var findPublicPackageInfo = function(infos) {
  if (!infos) return null;
  
  var loc = infos.length;
  while(--loc>=0) {
    if (!infos[loc]['tiki:private']) return infos[loc];
  }
  return null;
};

/**
  Find the canonical package ID for the passed package ID and optional 
  version.  This will look through all the registered package infos, only
  searching those that are not private, but including external references.
*/
Browser.prototype.canonicalPackageId = function(packageId, vers) {
  var info = this.packageInfoByName[packageId],
      ret, cur, cvers, rvers;
  
  if (vers) vers = semver.normalize(vers);
  if (!info) return null; // not found
  
  // see if we have caught a lucky break
  if (info[vers] && (info[vers].length===1)) return info[vers][0].id;

  // need to search...
  for(cvers in info) {
    if (!info.hasOwnProperty(cvers)) continue;
    if (!semver.compatible(vers, cvers)) continue;
    if (!ret || (semver.compare(rvers, cvers)<0)) {
      ret = findPublicPackageInfo(info[cvers]);
      if (ret) rvers = cvers; 
    }
  }
  
  return ret ? ret.id : null;
};

// get package for canonicalId, instantiate if needed
Browser.prototype.packageFor = function(canonicalId) {
  var ret = this.packages[canonicalId];
  if (ret) return ret ;

  // instantiate if needed
  ret = this.packageInfoById[canonicalId];
  if (ret && !ret['tiki:external']) { // external refs can't be instantiated
    ret = new this.Package(canonicalId, ret, this);
    this.packages[canonicalId] = ret;
    return ret ;
  }

  return null ; // not found
};

/**
  Ensures the named canonical packageId and all of its dependent scripts are
  loaded.
*/
Browser.prototype.ensurePackage = function(canonicalId, done) {
  var action = this.ensureActions[canonicalId];
  if (action) return action(done); // add another listener
  
  // no action get - get the package info and start one.
  var info = this.packageInfoById[canonicalId];
  if (!info) {
    return done(new NotFound(canonicalId, 'browser package info'));
  }
  
  var source = this;
  
  action = once(function(done) {
    var cnt = 1, ready = false, cancelled;
    
    // invoked when an action finishes.  Will resolve this action
    // when all of them finish.
    var cleanup = function(err) {
      if (cancelled) return;
      if (err) {
        cancelled = true;
        return done(err);
      }
      
      cnt = cnt-1;
      if (cnt<=0 && ready) return done(null, info);
    };

    // proactively kick off any known packages.  If a dependent package
    // is not known here just skip it for now.  This is just an optimization
    // anyway.  The Loader will take care of ensuring all dependencies are
    // really met.
    var dependencies = info.dependencies,
        nested       = info['tiki:nested'],
        packageId, vers, depInfo, curId;

    for(packageId in dependencies) {
      if (!dependencies.hasOwnProperty(packageId)) continue;
      curId = nested[packageId];
      if (!curId) {
        vers = dependencies[packageId];
        curId = source.canonicalPackageId(packageId, vers);
      }
      
      if (curId && source.packageInfoById[canonicalId]) {
        cnt++;
        source.ensurePackage(curId, cleanup);
      }
    }
    
    // step through resources and kick off each script and stylesheet
    var resources = info['tiki:resources'], 
        lim = resources ? resources.length : 0,
        loc, rsrc;
    for(loc=0;loc<lim;loc++) {
      rsrc = resources[loc];
      if (rsrc.type === T_RESOURCE) continue;
      if (rsrc.type === T_SCRIPT) {
        cnt++;
        source.ensureScript(rsrc.id, rsrc.url, cleanup);
      } else if (rsrc.type === T_STYLESHEET) {
        cnt++;
        source.ensureStylesheet(rsrc.id, rsrc.url, cleanup);
      }
    }
      
    // done, set ready to true so that the final handler can fire
    ready = true;
    cleanup(); 
    
  });
  
  this.ensureActions[canonicalId] = action;
  action(done); // kick off
};

Browser.prototype.ensureScript = function(id, url, done) {
  var action = this.scriptActions[id];
  if (action) return action(done);
  
  var source = this;
  action = this._action(function() {
    source._loadScript(id, url);
  });
  
  this.scriptActions[id] = action;
  return action(done);
};

Browser.prototype.ensureStylesheet = function(id, url, done) {
  var action = this.stylesheetActions[id];
  if (action) return action(done);
  
  var source = this;
  action = this._action(function() {
    source._loadStylesheet(id, url);
  });

  this.stylesheetActions[id] = action;
  return action(done);
};

Browser.prototype._injectScript = function(id, url) {
  var body, el;

  body = document.body;
  el = document.createElement('script');
  el.src = url;
  body.appendChild(el);
  body = el = null;
};

Browser.prototype._xhrScript = function(id, url) {
  var autowrap = this.autowrap;

  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onreadystatechange = function(evt) {
    // Accept 200 or 0 for local file requests.
    if (req.readyState !== 4 || (req.status !== 200 && req.status !== 0)) {
      return;
    }

    var src = req.responseText;
    if (autowrap) {
      src = "tiki.module('" + id + "', function(require, exports, module) {" +
        src + "});" + "tiki.script('" + id + "');";
    }

    // Add a Firebug-style sourceURL parameter to help debugging.
    eval(src + "\n//@ sourceURL=" + url);

    // Immediately return after the eval. The script may have stomped all over
    // our local state.
  };

  req.send(null);
};

Browser.prototype._loadScript = function(id, url) {
    if (this.autowrap) {
        this.xhr = true;
        if (!xhrAvailable) {
            DEBUG('Autowrap is on but XHR is not available. Danger ahead.');
        }
    }

    if (xhrAvailable && domAvailable) {
        if (this.xhr) {
            try {
                return this._xhrScript(id, url);
            } catch (e) {
                return this._injectScript(id, url);
            }
        } else {
            try {
                return this._injectScript(id, url);
            } catch (e) {
                return this._xhrScript(id, url);
            }
        }
    } else if (xhrAvailable) {
        return this._xhrScript(id, url);
    } else if (domAvailable) {
        return this._injectScript(id, url);
    }

    DEBUG('Browser#_loadScript() not supported on this platform.');
    this.script(id);
};

if (domAvailable) {
  // actually loads the stylesheet.  separated out to ease unit testing
  Browser.prototype._loadStylesheet = function(id, url) {
    var body, el;
    
    body = document.getElementsByTagName('head')[0] || document.body;
    el   = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = url;
    el.type = 'text/css';
    body.appendChild(el);
    el = body = null;

    this.stylesheet(id); // no onload support - just notify now.
  };
} else {
  // actually loads the stylesheet.  separated out to ease unit testing
  Browser.prototype._loadStylesheet = function(id, url) {
    DEBUG('Browser#_loadStylesheet() not supported on this platform.');
    this.stylesheet(id);
  };
}



// ..........................................................
// BROWSER PACKAGE
// 

/**
  Special edition of Package designed to work with the Browser source.  This
  kind of package knows how to get its data out of the Browser source on 
  demand.
*/
var BrowserPackage = Package.extend();
Browser.prototype.Package = BrowserPackage;

BrowserPackage.prototype.init = function(id, config, source) {
  Package.prototype.init.call(this, id, config);
  this.source = source;
};

// if not self, look for nested packages
BrowserPackage.prototype.canonicalPackageId = function(packageId, vers) {
  var ret, nested, info;
  
  ret = Package.prototype.canonicalPackageId.call(this, packageId, vers);
  if (ret) return ret ;
  
  nested = this.get('tiki:nested') || {}; 
  ret = nested[packageId];
  if (!ret) return null;

  info = this.source.packageInfoById[ret];
  return info && semver.compatible(vers,info.version) ? ret : null;
};

BrowserPackage.prototype.packageFor = function(canonicalId) {
  var ret = Package.prototype.packageFor.call(this, canonicalId);
  return ret ? ret : this.source.packageFor(canonicalId);
};

BrowserPackage.prototype.ensurePackage = function(canonicalId, done) {
  if (canonicalId === this.id) return done(); 
  this.source.ensurePackage(canonicalId, done);
};

BrowserPackage.prototype.catalogPackages = function() {
  var ret = [this], nested, key;

  nested = this.get('tiki:nested') || {};
  for(key in nested) {
    if (!nested.hasOwnProperty(key)) continue;
    ret.push(this.source.packageFor(nested[key]));
  }
  
  return ret ;
};

BrowserPackage.prototype.exists = function(moduleId) {
  var canonicalId = this.id+':'+moduleId;
  return !!this.source.factories[canonicalId];
};

BrowserPackage.prototype.load = function(moduleId) {
  var canonicalId, factory;
  
  canonicalId = this.id+':'+moduleId;
  factory  = this.source.factories[canonicalId];
  return factory ? new this.Factory(moduleId, this, factory) : null;
};

BrowserPackage.prototype.Factory = Factory;


displayNames(exports, 'tiki');

});
// ==========================================================================
// Project:   Tiki - CommonJS Runtime
// Copyright: ©2009-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals tiki ENV ARGS */

// This postamble runs when the loader and supporting modules are all 
// registered, allowing the real loader to replace the bootstrap version.
// it is not wrapped as a module so that it can run immediately.
"use modules false";
"use loader false";

// note that the loader.start method is safe so that calling this more than
// once will only setup the default loader once.
tiki = tiki.start();
tiki.replay(); // replay queue

bespin.tiki = tiki;
})();

;bespin.tiki.register("::settings", {
    name: "settings",
    dependencies: { "types": "0.0.0" }
});
bespin.tiki.module("settings:cookie",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var cookie = require('bespin:util/cookie');

/**
 * Save the settings in a cookie
 * This code has not been tested since reboot
 * @constructor
 */
exports.CookiePersister = function() {
};

exports.CookiePersister.prototype = {
    loadInitialValues: function(settings) {
        settings._loadDefaultValues().then(function() {
            var data = cookie.get('settings');
            settings._loadFromObject(JSON.parse(data));
        }.bind(this));
    },

    persistValue: function(settings, key, value) {
        try {
            // Aggregate the settings into a file
            var data = {};
            settings._getSettingNames().forEach(function(key) {
                data[key] = settings.get(key);
            });

            var stringData = JSON.stringify(data);
            cookie.set('settings', stringData);
        } catch (ex) {
            console.error('Unable to JSONify the settings! ' + ex);
            return;
        }
    }
};

});

bespin.tiki.module("settings:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * This plug-in manages settings.
 *
 * <p>Some quick terminology: A _Choice_, is something that the application
 * offers as a way to customize how it works. For each _Choice_ there will be
 * a number of _Options_ but ultimately the user will have a _Setting_ for each
 * _Choice_. This _Setting_ maybe the default for that _Choice_.
 *
 * <p>It provides an API for controlling the known settings. This allows us to
 * provide better GUI/CLI support. See setting.js
 * <p>It provides 3 implementations of a setting store:<ul>
 * <li>MemorySettings: i.e. temporary, non-persistent. Useful in textarea
 * replacement type scenarios. See memory.js
 * <li>CookieSettings: Stores the data in a cookie. Generally not practical as
 * it slows client server communication (if any). See cookie.js
 * <li>ServerSettings: Stores data on a server using the <tt>server</tt> API.
 * See server.js
 * </ul>
 * <p>It is expected that an HTML5 storage option will be developed soon. This
 * plug-in did contain a prototype Gears implementation, however this was never
 * maintained, and has been deleted due to bit-rot.
 * <p>This plug-in also provides commands to manipulate the settings from the
 * command_line and canon plug-ins.
 *
 * <p>TODO:<ul>
 * <li>Check what happens when we alter settings from the UI
 * <li>Ensure that values can be bound in a SC sense
 * <li>Convert all subscriptions to bindings.
 * <li>Implement HTML5 storage option
 * <li>Make all settings have a 'description' member and use that in set|unset
 * commands.
 * <li>When the command system is re-worked to include more GUI interaction,
 * expose data in settings to that system.
 * </ul>
 *
 * <p>For future versions of the API it might be better to decrease the
 * dependency on settings, and increase it on the system with a setting.
 * e.g. Now:
 * <pre>
 * setting.addSetting({ name:'foo', ... });
 * settings.set('foo', 'bar');
 * </pre>
 * <p>Vs the potentially better:
 * <pre>
 * var foo = setting.addSetting({ name:'foo', ... });
 * foo.value = 'bar';
 * </pre>
 * <p>Comparison:
 * <ul>
 * <li>The latter version gains by forcing access to the setting to be through
 * the plug-in providing it, so there wouldn't be any hidden dependencies.
 * <li>It's also more compact.
 * <li>It could provide access to to other methods e.g. <tt>foo.reset()</tt>
 * and <tt>foo.onChange(function(val) {...});</tt> (but see SC binding)
 * <li>On the other hand dependencies are so spread out right now that it's
 * probably hard to do this easily. We should move to this in the future.
 * </ul>
 */

var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Promise = require('bespin:promise').Promise;
var groupPromises = require('bespin:promise').group;

var types = require('types:types');

/**
 * Find and configure the settings object.
 * @see MemorySettings.addSetting()
 */
exports.addSetting = function(settingExt) {
    require('settings').settings.addSetting(settingExt);
};

/**
 * Fetch an array of the currently known settings
 */
exports.getSettings = function() {
    return catalog.getExtensions('setting');
};

/**
 * Something of a hack to allow the set command to give a clearer definition
 * of the type to the command line.
 */
exports.getTypeSpecFromAssignment = function(typeSpec) {
    var assignments = typeSpec.assignments;
    var replacement = 'text';

    if (assignments) {
        // Find the assignment for 'setting' so we can get it's value
        var settingAssignment = null;
        assignments.forEach(function(assignment) {
            if (assignment.param.name === 'setting') {
                settingAssignment = assignment;
            }
        });

        if (settingAssignment) {
            var settingName = settingAssignment.value;
            if (settingName && settingName !== '') {
                var settingExt = catalog.getExtensionByKey('setting', settingName);
                if (settingExt) {
                    replacement = settingExt.type;
                }
            }
        }
    }

    return replacement;
};

/**
 * A base class for all the various methods of storing settings.
 * <p>Usage:
 * <pre>
 * // Create manually, or require 'settings' from the container.
 * // This is the manual version:
 * var settings = require('bespin:plugins').catalog.getObject('settings');
 * // Add a new setting
 * settings.addSetting({ name:'foo', ... });
 * // Display the default value
 * alert(settings.get('foo'));
 * // Alter the value, which also publishes the change etc.
 * settings.set('foo', 'bar');
 * // Reset the value to the default
 * settings.resetValue('foo');
 * </pre>
 * @class
 */
exports.MemorySettings = function() {
};

exports.MemorySettings.prototype = {
    /**
     * Storage for the setting values
     */
    _values: {},

    /**
     * Storage for deactivated values
     */
    _deactivated: {},

    /**
     * A Persister is able to store settings. It is an object that defines
     * two functions:
     * loadInitialValues(settings) and persistValue(settings, key, value).
     */
    setPersister: function(persister) {
        this._persister = persister;
        if (persister) {
            persister.loadInitialValues(this);
        }
    },

    /**
     * Read accessor
     */
    get: function(key) {
        return this._values[key];
    },

    /**
     * Override observable.set(key, value) to provide type conversion and
     * validation.
     */
    set: function(key, value) {
        var settingExt = catalog.getExtensionByKey('setting', key);
        if (!settingExt) {
            // If there is no definition for this setting, then warn the user
            // and store the setting in raw format. If the setting gets defined,
            // the addSetting() function is called which then takes up the
            // here stored setting and calls set() to convert the setting.
            console.warn('Setting not defined: ', key, value);
            this._deactivated[key] = value;
        }
        else if (typeof value == 'string' && settingExt.type == 'string') {
            // no conversion needed
            this._values[key] = value;
        }
        else {
            var inline = false;

            types.fromString(value, settingExt.type).then(function(converted) {
                inline = true;
                this._values[key] = converted;

                // Inform subscriptions of the change
                catalog.publish(this, 'settingChange', key, converted);
            }.bind(this), function(ex) {
                console.error('Error setting', key, ': ', ex);
            });

            if (!inline) {
                console.warn('About to set string version of ', key, 'delaying typed set.');
                this._values[key] = value;
            }
        }

        this._persistValue(key, value);
        return this;
    },

    /**
     * Function to add to the list of available settings.
     * <p>Example usage:
     * <pre>
     * var settings = require('bespin:plugins').catalog.getObject('settings');
     * settings.addSetting({
     *     name: 'tabsize', // For use in settings.get('X')
     *     type: 'number',  // To allow value checking.
     *     defaultValue: 4  // Default value for use when none is directly set
     * });
     * </pre>
     * @param {object} settingExt Object containing name/type/defaultValue members.
     */
    addSetting: function(settingExt) {
        if (!settingExt.name) {
            console.error('Setting.name == undefined. Ignoring.', settingExt);
            return;
        }

        if (!settingExt.defaultValue === undefined) {
            console.error('Setting.defaultValue == undefined', settingExt);
        }

        types.isValid(settingExt.defaultValue, settingExt.type).then(function(valid) {
            if (!valid) {
                console.warn('!Setting.isValid(Setting.defaultValue)', settingExt);
            }

            // The value can be
            // 1) the value of a setting that is not activated at the moment
            //       OR
            // 2) the defaultValue of the setting.
            var value = this._deactivated[settingExt.name] ||
                    settingExt.defaultValue;

            // Set the default value up.
            this.set(settingExt.name, value);
        }.bind(this), function(ex) {
            console.error('Type error ', ex, ' ignoring setting ', settingExt);
        });
    },

    /**
     * Reset the value of the <code>key</code> setting to it's default
     */
    resetValue: function(key) {
        var settingExt = catalog.getExtensionByKey('setting', key);
        if (settingExt) {
            this.set(key, settingExt.defaultValue);
        } else {
            console.log('ignore resetValue on ', key);
        }
    },

    resetAll: function() {
        this._getSettingNames().forEach(function(key) {
            this.resetValue(key);
        }.bind(this));
    },

    /**
     * Make a list of the valid type names
     */
    _getSettingNames: function() {
        var typeNames = [];
        catalog.getExtensions('setting').forEach(function(settingExt) {
            typeNames.push(settingExt.name);
        });
        return typeNames;
    },

    /**
     * Retrieve a list of the known settings and their values
     */
    _list: function() {
        var reply = [];
        this._getSettingNames().forEach(function(setting) {
            reply.push({
                'key': setting,
                'value': this.get(setting)
            });
        }.bind(this));
        return reply;
    },

    /**
     * delegates to the persister. no-op if there's no persister.
     */
    _persistValue: function(key, value) {
        var persister = this._persister;
        if (persister) {
            persister.persistValue(this, key, value);
        }
    },

    /**
     * Delegates to the persister, otherwise sets up the defaults if no
     * persister is available.
     */
    _loadInitialValues: function() {
        var persister = this._persister;
        if (persister) {
            persister.loadInitialValues(this);
        } else {
            this._loadDefaultValues();
        }
    },

    /**
     * Prime the local cache with the defaults.
     */
    _loadDefaultValues: function() {
        return this._loadFromObject(this._defaultValues());
    },

    /**
     * Utility to load settings from an object
     */
    _loadFromObject: function(data) {
        var promises = [];
        // take the promise action out of the loop to avoid closure problems
        var setterFactory = function(keyName) {
            return function(value) {
                this.set(keyName, value);
            };
        };

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var valueStr = data[key];
                var settingExt = catalog.getExtensionByKey('setting', key);
                if (settingExt) {
                    // TODO: We shouldn't just ignore values without a setting
                    var promise = types.fromString(valueStr, settingExt.type);
                    var setter = setterFactory(key);
                    promise.then(setter);
                    promises.push(promise);
                }
            }
        }

        // Promise.group (a.k.a groupPromises) gives you a list of all the data
        // in the grouped promises. We don't want that in case we change how
        // this works with ignored settings (see above).
        // So we do this to hide the list of promise resolutions.
        var replyPromise = new Promise();
        groupPromises(promises).then(function() {
            replyPromise.resolve();
        });
        return replyPromise;
    },

    /**
     * Utility to grab all the settings and export them into an object
     */
    _saveToObject: function() {
        var promises = [];
        var reply = {};

        this._getSettingNames().forEach(function(key) {
            var value = this.get(key);
            var settingExt = catalog.getExtensionByKey('setting', key);
            if (settingExt) {
                // TODO: We shouldn't just ignore values without a setting
                var promise = types.toString(value, settingExt.type);
                promise.then(function(value) {
                    reply[key] = value;
                });
                promises.push(promise);
            }
        }.bind(this));

        var replyPromise = new Promise();
        groupPromises(promises).then(function() {
            replyPromise.resolve(reply);
        });
        return replyPromise;
    },

    /**
     * The default initial settings
     */
    _defaultValues: function() {
        var defaultValues = {};
        catalog.getExtensions('setting').forEach(function(settingExt) {
            defaultValues[settingExt.name] = settingExt.defaultValue;
        });
        return defaultValues;
    }
};

exports.settings = new exports.MemorySettings();

});

bespin.tiki.module("settings:commands",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var env = require('environment').env;

var settings = require('settings').settings;

/**
 * 'set' command
 */
exports.setCommand = function(args, request) {
    var html;

    if (!args.setting) {
        var settingsList = settings._list();
        html = '';
        // first sort the settingsList based on the key
        settingsList.sort(function(a, b) {
            if (a.key < b.key) {
                return -1;
            } else if (a.key == b.key) {
                return 0;
            } else {
                return 1;
            }
        });

        settingsList.forEach(function(setting) {
            html += '<a class="setting" href="https://wiki.mozilla.org/Labs/Bespin/Settings#' +
                    setting.key +
                    '" title="View external documentation on setting: ' +
                    setting.key +
                    '" target="_blank">' +
                    setting.key +
                    '</a> = ' +
                    setting.value +
                    '<br/>';
        });
    } else {
        if (args.value === undefined) {
            html = '<strong>' + args.setting + '</strong> = ' + settings.get(args.setting);
        } else {
            html = 'Setting: <strong>' + args.setting + '</strong> = ' + args.value;
            settings.set(args.setting, args.value);
        }
    }

    request.done(html);
};

/**
 * 'unset' command
 */
exports.unsetCommand = function(args, request) {
    settings.resetValue(args.setting);
    request.done('Reset ' + args.setting + ' to default: ' + settings.get(args.setting));
};

});
;bespin.tiki.register("::canon", {
    name: "canon",
    dependencies: { "environment": "0.0.0", "events": "0.0.0", "settings": "0.0.0" }
});
bespin.tiki.module("canon:request",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Event = require('events').Event;
var history = require('canon:history');

/**
 * To create an invocation, you need to do something like this (all the ctor
 * args are optional):
 * <pre>
 * var request = new Request({
 *     command: command,
 *     commandExt: commandExt,
 *     args: args,
 *     typed: typed
 * });
 * </pre>
 */
exports.Request = function(options) {
    options = options || {};

    // Will be used in the keyboard case and the cli case
    this.command = options.command;
    this.commandExt = options.commandExt;

    // Will be used only in the cli case
    this.args = options.args;
    this.typed = options.typed;

    // Have we been initialized?
    this._begunOutput = false;

    this.start = new Date();
    this.end = null;
    this.completed = false;
    this.error = false;

    this.changed = new Event();
};

/**
 * Lazy init to register with the history should only be done on output.
 * init() is expensive, and won't be used in the majority of cases
 */
exports.Request.prototype._beginOutput = function() {
    this._begunOutput = true;
    this.outputs = [];

    history.addRequestOutput(this);
};

/**
 * Sugar for:
 * <pre>request.error = true; request.done(output);</pre>
 */
exports.Request.prototype.doneWithError = function(content) {
    this.error = true;
    this.done(content);
};

/**
 * Declares that this function will not be automatically done when
 * the command exits
 */
exports.Request.prototype.async = function() {
    if (!this._begunOutput) {
        this._beginOutput();
    }
};

/**
 * Complete the currently executing command with successful output.
 * @param output Either DOM node, an SproutCore element or something that
 * can be used in the content of a DIV to create a DOM node.
 */
exports.Request.prototype.output = function(content) {
    if (!this._begunOutput) {
        this._beginOutput();
    }

    if (typeof content !== 'string' && !(content instanceof Node)) {
        content = content.toString();
    }

    this.outputs.push(content);
    this.changed();

    return this;
};

/**
 * All commands that do output must call this to indicate that the command
 * has finished execution.
 */
exports.Request.prototype.done = function(content) {
    this.completed = true;
    this.end = new Date();
    this.duration = this.end.getTime() - this.start.getTime();

    if (content) {
        this.output(content);
    } else {
        this.changed();
    }
};

});

bespin.tiki.module("canon:history",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var Trace = require('bespin:util/stacktrace').Trace;
var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;

/**
 * Current requirements are around displaying the command line, and provision
 * of a 'history' command and cursor up|down navigation of history.
 * <p>Future requirements could include:
 * <ul>
 * <li>Multiple command lines
 * <li>The ability to recall key presses (i.e. requests with no output) which
 * will likely be needed for macro recording or similar
 * <li>The ability to store the command history either on the server or in the
 * browser local storage.
 * </ul>
 * <p>The execute() command doesn't really live here, except as part of that
 * last future requirement, and because it doesn't really have anywhere else to
 * live.
 */

/**
 * The array of requests that wish to announce their presence
 */
exports.requests = [];

/**
 * How many requests do we store?
 */
var maxRequestLength = 100;

/**
 * Called by Request instances when some output (or a cell to async() happens)
 */
exports.addRequestOutput = function(request) {
    exports.requests.push(request);
    // This could probably be optimized with some maths, but 99.99% of the
    // time we will only be off by one, and I'm feeling lazy.
    while (exports.requests.length > maxRequestLength) {
        exports.requests.shiftObject();
    }

    catalog.publish(this, 'addedRequestOutput', null, request);
};

/**
 * Execute a new command.
 * This is basically an error trapping wrapper around request.command(...)
 */
exports.execute = function(args, request) {
    // Check the function pointed to in the meta-data exists
    if (!request.command) {
        request.doneWithError('Command not found.');
        return;
    }

    try {
        request.command(args, request);
    } catch (ex) {
        var trace = new Trace(ex, true);
        console.group('Error executing command \'' + request.typed + '\'');
        console.log('command=', request.commandExt);
        console.log('args=', args);
        console.error(ex);
        trace.log(3);
        console.groupEnd();

        request.doneWithError(ex);
    }
};

});

bespin.tiki.module("canon:index",function(require,exports,module) {

});
;bespin.tiki.register("::syntax_directory", {
    name: "syntax_directory",
    dependencies: {  }
});
bespin.tiki.module("syntax_directory:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "description": "Catalogs the available syntax engines",
    "dependencies": {},
    "environments": { "main": true, "worker": true },
    "provides": [
        {
            "ep": "extensionhandler",
            "name": "syntax",
            "register": "#discoveredNewSyntax"
        }
    ]
});
"end";

var plugins = require("bespin:plugins");

function SyntaxInfo(ext) {
    this.extension = ext;
    this.name = ext.name;
    this.fileExts = ext.hasOwnProperty('fileexts') ? ext.fileexts : [];
    this.settings = ext.settings != null ? ext.settings : [];
}

/**
 * Stores metadata for all of the syntax plugins.
 *
 * @exports syntaxDirectory as syntax_directory:syntaxDirectory
 */
var syntaxDirectory = {
    _fileExts: {},
    _syntaxInfo: {},

    get: function(syntaxName) {
        return this._syntaxInfo[syntaxName];
    },

    hasSyntax: function(syntax) {
        return this._syntaxInfo.hasOwnProperty(syntax);
    },

    register: function(extension) {
        var syntaxInfo = new SyntaxInfo(extension);
        this._syntaxInfo[syntaxInfo.name] = syntaxInfo;

        var fileExts = this._fileExts;
        syntaxInfo.fileExts.forEach(function(fileExt) {
            fileExts[fileExt] = syntaxInfo.name;
        });
    },

    syntaxForFileExt: function(fileExt) {
        fileExt = fileExt.toLowerCase();
        var fileExts = this._fileExts;
        return fileExts.hasOwnProperty(fileExt) ? fileExts[fileExt] : 'plain';
    }
};

function discoveredNewSyntax(syntaxExtension) {
    syntaxDirectory.register(syntaxExtension);
}

exports.syntaxDirectory = syntaxDirectory;
exports.discoveredNewSyntax = discoveredNewSyntax;


});
;bespin.tiki.register("::environment", {
    name: "environment",
    dependencies: { "settings": "0.0.0" }
});
bespin.tiki.module("environment:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "dependencies": {
        "settings": "0.0.0"
    }
});
"end";

var util = require('bespin:util/util');
var console = require('bespin:console').console;
var catalog = require("bespin:plugins").catalog;
var settings = require('settings').settings;

/**
 * The environment plays a similar role to the environment under unix.
 * Bespin does not currently have a concept of variables, (i.e. things the user
 * directly changes, however it does have a number of pre-defined things that
 * are changed by the system.
 * <p>The role of the Environment is likely to be expanded over time.
 */
exports.Environment = function() {
    // The current command line pushes this value into here
    this.commandLine = null;

    // Fire the sizeChanged event when the window is resized.
    window.addEventListener('resize', this.dimensionsChanged.bind(this), false);
};

Object.defineProperties(exports.Environment.prototype, {

    /**
     * Provides a get() and set() function to set and get settings.
     */
    settings: {
        value: {
            set: function(key, value) {
                if (util.none(key)) {
                    throw new Error('setSetting(): key must be supplied');
                }
                if (util.none(value)) {
                    throw new Error('setSetting(): value must be supplied');
                }

                settings.set(key, value);
            },
            
            get: function(key) {
                if (util.none(key)) {
                    throw new Error('getSetting(): key must be supplied');
                }
                return settings.get(key);
            }
        }
    },

    dimensionsChanged: {
        value: function() {
            catalog.publish(this, 'dimensionsChanged');
        }
    },

    /**
     * Retrieves the EditSession
     */
    session: {
        get: function() {
            return catalog.getObject('session');
        }
    },

    /**
     * Gets the currentView from the session.
     */
    view: {
        get: function() {
            if (!this.session) {
                // This can happen if the session is being reloaded.
                return null;
            }
            return this.session.currentView;
        }
    },

    /**
     * Gets the currentEditor from the session.
     */
    editor: {
        get: function() {
            if (!this.session) {
                // This can happen if the session is being reloaded.
                return null;
            }
            return this.session.currentView.editor;
        }
    },

    /**
     * Returns the currently-active syntax contexts.
     */
    contexts: {
        get: function() {
            // when editorapp is being refreshed, the textView is not available.
            if (!this.view) {
                return [];
            }

            var syntaxManager = this.view.editor.layoutManager.syntaxManager;
            var pos = this.view.getSelectedRange().start;
            return syntaxManager.contextsAtPosition(pos);
        }
    },

    /**
     * The current Buffer from the session
     */
    buffer: {
        get: function() {
            if (!this.session) {
                console.error("command attempted to get buffer but there's no session");
                return undefined;
            }
            return this.view.editor.buffer;
        }
    },

    /**
     * The current editor model might not always be easy to find so you should
     * use <code>instruction.model</code> to access the view where
     * possible.
     */
    model: {
        get: function() {
            if (!this.buffer) {
                console.error('Session has no current buffer');
                return undefined;
            }
            return this.view.editor.layoutManager.textStorage;
        }
    },

    /**
     * gets the current file from the session
     */
    file: {
        get: function() {
            if (!this.buffer) {
                console.error('Session has no current buffer');
                return undefined;
            }
            return this.buffer.file;
        }
    },

    /**
     * If files are available, this will get them. Perhaps we need some other
     * mechanism for populating these things from the catalog?
     */
    files: {
        get: function() {
            return catalog.getObject('files');
        }
    }
});

/**
 * The global environment used throughout this Bespin instance.
 */
exports.env = new exports.Environment();

});
;bespin.tiki.register("::traits", {
    name: "traits",
    dependencies: {  }
});
bespin.tiki.module("traits:index",function(require,exports,module) {
// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// See http://code.google.com/p/es-lab/wiki/Traits
// for background on traits and a description of this library

"define metadata";
({
    "description": "Traits library, traitsjs.org",
    "dependencies": {},
    "provides": []
});
"end";

// --- Begin traits-0.3.js ---

// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// See http://code.google.com/p/es-lab/wiki/Traits
// for background on traits and a description of this library

var Trait = (function(){

  // == Ancillary functions ==
  
  var SUPPORTS_DEFINEPROP = (function() {
    try {
      var test = {};
      Object.defineProperty(test, 'x', {get: function() { return 0; } } );
      return test.x === 0;
    } catch(e) {
      return false;
    }
  })();
  
  // IE8 implements Object.defineProperty and Object.getOwnPropertyDescriptor
  // only for DOM objects. These methods don't work on plain objects.
  // Hence, we need a more elaborate feature-test to see whether the
  // browser truly supports these methods:
  function supportsGOPD() {
    try {
      if (Object.getOwnPropertyDescriptor) {
        var test = {x:0};
        return !!Object.getOwnPropertyDescriptor(test,'x');        
      }
    } catch(e) {}
    return false;
  };
  function supportsDP() {
    try {
      if (Object.defineProperty) {
        var test = {};
        Object.defineProperty(test,'x',{value:0});
        return test.x === 0;
      }
    } catch(e) {}
    return false;
  };

  var call = Function.prototype.call;

  /**
   * An ad hoc version of bind that only binds the 'this' parameter.
   */
  var bindThis = Function.prototype.bind ?
    function(fun, self) { return Function.prototype.bind.call(fun, self); } :
    function(fun, self) {
      function funcBound(var_args) {
        return fun.apply(self, arguments);
      }
      return funcBound;
    };

  var hasOwnProperty = bindThis(call, Object.prototype.hasOwnProperty);
  var slice = bindThis(call, Array.prototype.slice);
    
  // feature testing such that traits.js runs on both ES3 and ES5
  var forEach = Array.prototype.forEach ?
      bindThis(call, Array.prototype.forEach) :
      function(arr, fun) {
        for (var i = 0, len = arr.length; i < len; i++) { fun(arr[i]); }
      };
  
  // on v8 version 2.3.4.1, Object.freeze(obj) returns undefined instead of obj
  var freeze = (Object.freeze ? function(obj) { Object.freeze(obj); return obj; }
                              : function(obj) { return obj; });
  var getPrototypeOf = Object.getPrototypeOf || function(obj) { 
    return Object.prototype;
  };
  var getOwnPropertyNames = Object.getOwnPropertyNames ||
      function(obj) {
        var props = [];
        for (var p in obj) { if (hasOwnProperty(obj,p)) { props.push(p); } }
        return props;
      };
  var getOwnPropertyDescriptor = supportsGOPD() ?
      Object.getOwnPropertyDescriptor :
      function(obj, name) {
        return {
          value: obj[name],
          enumerable: true,
          writable: true,
          configurable: true
        };
      };
  var defineProperty = supportsDP() ? Object.defineProperty :
      function(obj, name, pd) {
        obj[name] = pd.value;
      };
  var defineProperties = Object.defineProperties ||
      function(obj, propMap) {
        for (var name in propMap) {
          if (hasOwnProperty(propMap, name)) {
            defineProperty(obj, name, propMap[name]);
          }
        }
      };
  var Object_create = Object.create ||
      function(proto, propMap) {
        var self;
        function dummy() {};
        dummy.prototype = proto || Object.prototype;
        self = new dummy();
        if (propMap) {
          defineProperties(self, propMap);          
        }
        return self;
      };
  var getOwnProperties = Object.getOwnProperties ||
      function(obj) {
        var map = {};
        forEach(getOwnPropertyNames(obj), function (name) {
          map[name] = getOwnPropertyDescriptor(obj, name);
        });
        return map;
      };
  
  // end of ES3 - ES5 compatibility functions
  
  function makeConflictAccessor(name) {
    var accessor = function(var_args) {
      throw new Error("Conflicting property: "+name);
    };
    freeze(accessor.prototype);
    return freeze(accessor);
  };

  function makeRequiredPropDesc(name) {
    return freeze({
      value: undefined,
      enumerable: false,
      required: true
    });
  }
  
  function makeConflictingPropDesc(name) {
    var conflict = makeConflictAccessor(name);
    if (SUPPORTS_DEFINEPROP) {
      return freeze({
       get: conflict,
       set: conflict,
       enumerable: false,
       conflict: true
      }); 
    } else {
      return freeze({
        value: conflict,
        enumerable: false,
        conflict: true
      });
    }
  }
  
  /**
   * Are x and y not observably distinguishable?
   */
  function identical(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1/x === 1/y;
    } else {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      return x !== x && y !== y;
    }
  }

  // Note: isSameDesc should return true if both
  // desc1 and desc2 represent a 'required' property
  // (otherwise two composed required properties would be turned into
  // a conflict) 
  function isSameDesc(desc1, desc2) {
    // for conflicting properties, don't compare values because
    // the conflicting property values are never equal
    if (desc1.conflict && desc2.conflict) {
      return true;
    } else {
      return (   desc1.get === desc2.get
              && desc1.set === desc2.set
              && identical(desc1.value, desc2.value)
              && desc1.enumerable === desc2.enumerable
              && desc1.required === desc2.required
              && desc1.conflict === desc2.conflict); 
    }
  }
  
  function freezeAndBind(meth, self) {
    return freeze(bindThis(meth, self));
  }

  /* makeSet(['foo', ...]) => { foo: true, ...}
   *
   * makeSet returns an object whose own properties represent a set.
   *
   * Each string in the names array is added to the set.
   *
   * To test whether an element is in the set, perform:
   *   hasOwnProperty(set, element)
   */
  function makeSet(names) {
    var set = {};
    forEach(names, function (name) {
      set[name] = true;
    });
    return freeze(set);
  }

  // == singleton object to be used as the placeholder for a required
  // property == 
  
  var required = freeze({ 
    toString: function() { return '<Trait.required>'; } 
  });

  // == The public API methods ==

  /**
   * var newTrait = trait({ foo:required, ... })
   *
   * @param object an object record (in principle an object literal)
   * @returns a new trait describing all of the own properties of the object
   *          (both enumerable and non-enumerable)
   *
   * As a general rule, 'trait' should be invoked with an object
   * literal, since the object merely serves as a record
   * descriptor. Both its identity and its prototype chain are
   * irrelevant.
   * 
   * Data properties bound to function objects in the argument will be
   * flagged as 'method' properties. The prototype of these function
   * objects is frozen.
   * 
   * Data properties bound to the 'required' singleton exported by
   * this module will be marked as 'required' properties.
   *
   * The <tt>trait</tt> function is pure if no other code can witness
   * the side-effects of freezing the prototypes of the methods. If
   * <tt>trait</tt> is invoked with an object literal whose methods
   * are represented as in-place anonymous functions, this should
   * normally be the case.
   */
  function trait(obj) {
    var map = {};
    forEach(getOwnPropertyNames(obj), function (name) {
      var pd = getOwnPropertyDescriptor(obj, name);
      if (pd.value === required) {
        pd = makeRequiredPropDesc(name);
      } else if (typeof pd.value === 'function') {
        pd.method = true;
        if ('prototype' in pd.value) {
          freeze(pd.value.prototype);
        }
      } else {
        if (pd.get && pd.get.prototype) { freeze(pd.get.prototype); }
        if (pd.set && pd.set.prototype) { freeze(pd.set.prototype); }
      }
      map[name] = pd;
    });
    return map;
  }

  /**
   * var newTrait = compose(trait_1, trait_2, ..., trait_N)
   *
   * @param trait_i a trait object
   * @returns a new trait containing the combined own properties of
   *          all the trait_i.
   * 
   * If two or more traits have own properties with the same name, the new
   * trait will contain a 'conflict' property for that name. 'compose' is
   * a commutative and associative operation, and the order of its
   * arguments is not significant.
   *
   * If 'compose' is invoked with < 2 arguments, then:
   *   compose(trait_1) returns a trait equivalent to trait_1
   *   compose() returns an empty trait
   */
  function compose(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        if (hasOwnProperty(newTrait, name) &&
            !newTrait[name].required) {
          
          // a non-required property with the same name was previously
          // defined this is not a conflict if pd represents a
          // 'required' property itself:
          if (pd.required) {
            return; // skip this property, the required property is
   	            // now present 
          }
            
          if (!isSameDesc(newTrait[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another trait => mark as
	    // conflicting property
            newTrait[name] = makeConflictingPropDesc(name); 
          } // else,
          // properties are not in conflict if they refer to the same value
          
        } else {
          newTrait[name] = pd;
        }
      });
    });
    
    return freeze(newTrait);
  }

  /* var newTrait = exclude(['name', ...], trait)
   *
   * @param names a list of strings denoting property names.
   * @param trait a trait some properties of which should be excluded.
   * @returns a new trait with the same own properties as the original trait,
   *          except that all property names appearing in the first argument
   *          are replaced by required property descriptors.
   *
   * Note: exclude(A, exclude(B,t)) is equivalent to exclude(A U B, t)
   */
  function exclude(names, trait) {
    var exclusions = makeSet(names);
    var newTrait = {};
    
    forEach(getOwnPropertyNames(trait), function (name) {
      // required properties are not excluded but ignored
      if (!hasOwnProperty(exclusions, name) || trait[name].required) {
        newTrait[name] = trait[name];
      } else {
        // excluded properties are replaced by required properties
        newTrait[name] = makeRequiredPropDesc(name);
      }
    });
    
    return freeze(newTrait);
  }

  /**
   * var newTrait = override(trait_1, trait_2, ..., trait_N)
   *
   * @returns a new trait with all of the combined properties of the
   *          argument traits.  In contrast to 'compose', 'override'
   *          immediately resolves all conflicts resulting from this
   *          composition by overriding the properties of later
   *          traits. Trait priority is from left to right. I.e. the
   *          properties of the leftmost trait are never overridden.
   *
   *  override is associative:
   *    override(t1,t2,t3) is equivalent to override(t1, override(t2, t3)) or
   *    to override(override(t1, t2), t3)
   *  override is not commutative: override(t1,t2) is not equivalent
   *    to override(t2,t1)
   *
   * override() returns an empty trait
   * override(trait_1) returns a trait equivalent to trait_1
   */
  function override(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        // add this trait's property to the composite trait only if
        // - the trait does not yet have this property
        // - or, the trait does have the property, but it's a required property
        if (!hasOwnProperty(newTrait, name) || newTrait[name].required) {
          newTrait[name] = pd;
        }
      });
    });
    return freeze(newTrait);
  }
  
  /**
   * var newTrait = override(dominantTrait, recessiveTrait)
   *
   * @returns a new trait with all of the properties of dominantTrait
   *          and all of the properties of recessiveTrait not in dominantTrait
   *
   * Note: override is associative:
   *   override(t1, override(t2, t3)) is equivalent to
   *   override(override(t1, t2), t3) 
   */
  /*function override(frontT, backT) {
    var newTrait = {};
    // first copy all of backT's properties into newTrait
    forEach(getOwnPropertyNames(backT), function (name) {
      newTrait[name] = backT[name];
    });
    // now override all these properties with frontT's properties
    forEach(getOwnPropertyNames(frontT), function (name) {
      var pd = frontT[name];
      // frontT's required property does not override the provided property
      if (!(pd.required && hasOwnProperty(newTrait, name))) {
        newTrait[name] = pd; 
      }      
    });
    
    return freeze(newTrait);
  }*/

  /**
   * var newTrait = rename(map, trait)
   *
   * @param map an object whose own properties serve as a mapping from
            old names to new names.
   * @param trait a trait object
   * @returns a new trait with the same properties as the original trait,
   *          except that all properties whose name is an own property
   *          of map will be renamed to map[name], and a 'required' property
   *          for name will be added instead.
   *
   * rename({a: 'b'}, t) eqv compose(exclude(['a'],t),
   *                                 { a: { required: true },
   *                                   b: t[a] })
   *
   * For each renamed property, a required property is generated.  If
   * the map renames two properties to the same name, a conflict is
   * generated.  If the map renames a property to an existing
   * unrenamed property, a conflict is generated.
   *
   * Note: rename(A, rename(B, t)) is equivalent to rename(\n ->
   * A(B(n)), t) Note: rename({...},exclude([...], t)) is not eqv to
   * exclude([...],rename({...}, t))
   */
  function rename(map, trait) {
    var renamedTrait = {};
    forEach(getOwnPropertyNames(trait), function (name) {
      // required props are never renamed
      if (hasOwnProperty(map, name) && !trait[name].required) {
        var alias = map[name]; // alias defined in map
        if (hasOwnProperty(renamedTrait, alias) && 
	    !renamedTrait[alias].required) {
          // could happen if 2 props are mapped to the same alias
          renamedTrait[alias] = makeConflictingPropDesc(alias);
        } else {
          // add the property under an alias
          renamedTrait[alias] = trait[name];
        }
        // add a required property under the original name
        // but only if a property under the original name does not exist
        // such a prop could exist if an earlier prop in the trait was
        // previously aliased to this name
        if (!hasOwnProperty(renamedTrait, name)) {
          renamedTrait[name] = makeRequiredPropDesc(name);     
        }
      } else { // no alias defined
        if (hasOwnProperty(renamedTrait, name)) {
          // could happen if another prop was previously aliased to name
          if (!trait[name].required) {
            renamedTrait[name] = makeConflictingPropDesc(name);            
          }
          // else required property overridden by a previously aliased
          // property and otherwise ignored
        } else {
          renamedTrait[name] = trait[name];
        }
      }
    });
    
    return freeze(renamedTrait);
  }
  
  /**
   * var newTrait = resolve({ oldName: 'newName', excludeName:
   * undefined, ... }, trait)
   *
   * This is a convenience function combining renaming and
   * exclusion. It can be implemented as <tt>rename(map,
   * exclude(exclusions, trait))</tt> where map is the subset of
   * mappings from oldName to newName and exclusions is an array of
   * all the keys that map to undefined (or another falsy value).
   *
   * @param resolutions an object whose own properties serve as a
            mapping from old names to new names, or to undefined if
            the property should be excluded
   * @param trait a trait object
   * @returns a resolved trait with the same own properties as the
   * original trait.
   *
   * In a resolved trait, all own properties whose name is an own property
   * of resolutions will be renamed to resolutions[name] if it is truthy,
   * or their value is changed into a required property descriptor if
   * resolutions[name] is falsy.
   *
   * Note, it's important to _first_ exclude, _then_ rename, since exclude
   * and rename are not associative, for example:
   * rename({a: 'b'}, exclude(['b'], trait({ a:1,b:2 }))) eqv trait({b:1})
   * exclude(['b'], rename({a: 'b'}, trait({ a:1,b:2 }))) eqv
   * trait({b:Trait.required}) 
   *
   * writing resolve({a:'b', b: undefined},trait({a:1,b:2})) makes it
   * clear that what is meant is to simply drop the old 'b' and rename
   * 'a' to 'b'
   */
  function resolve(resolutions, trait) {
    var renames = {};
    var exclusions = [];
    // preprocess renamed and excluded properties
    for (var name in resolutions) {
      if (hasOwnProperty(resolutions, name)) {
        if (resolutions[name]) { // old name -> new name
          renames[name] = resolutions[name];
        } else { // name -> undefined
          exclusions.push(name);
        }
      }
    }
    return rename(renames, exclude(exclusions, trait));
  }

  /**
   * var obj = create(proto, trait)
   *
   * @param proto denotes the prototype of the completed object
   * @param trait a trait object to be turned into a complete object
   * @returns an object with all of the properties described by the trait.
   * @throws 'Missing required property' the trait still contains a
   *         required property.
   * @throws 'Remaining conflicting property' if the trait still
   *         contains a conflicting property. 
   *
   * Trait.create is like Object.create, except that it generates
   * high-integrity or final objects. In addition to creating a new object
   * from a trait, it also ensures that:
   *    - an exception is thrown if 'trait' still contains required properties
   *    - an exception is thrown if 'trait' still contains conflicting
   *      properties 
   *    - the object is and all of its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is bound to the composed object.
   *
   *  Use Object.create instead of Trait.create if you want to create
   *  abstract or malleable objects. Keep in mind that for such objects:
   *    - no exception is thrown if 'trait' still contains required properties
   *      (the properties are simply dropped from the composite object)
   *    - no exception is thrown if 'trait' still contains conflicting
   *      properties (these properties remain as conflicting
   *      properties in the composite object) 
   *    - neither the object nor its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is left unbound.
   */
  function create(proto, trait) {
    var self = Object_create(proto);
    var properties = {};
  
    forEach(getOwnPropertyNames(trait), function (name) {
      var pd = trait[name];
      // check for remaining 'required' properties
      // Note: it's OK for the prototype to provide the properties
      if (pd.required) {
        if (!(name in proto)) {
          throw new Error('Missing required property: '+name);
        }
      } else if (pd.conflict) { // check for remaining conflicting properties
        throw new Error('Remaining conflicting property: '+name);
      } else if ('value' in pd) { // data property
        // freeze all function properties and their prototype
        if (pd.method) { // the property is meant to be used as a method
          // bind 'this' in trait method to the composite object
          properties[name] = {
            value: freezeAndBind(pd.value, self),
            enumerable: pd.enumerable,
            configurable: pd.configurable,
            writable: pd.writable
          };
        } else {
          properties[name] = pd;
        }
      } else { // accessor property
        properties[name] = {
          get: pd.get ? freezeAndBind(pd.get, self) : undefined,
          set: pd.set ? freezeAndBind(pd.set, self) : undefined,
          enumerable: pd.enumerable,
          configurable: pd.configurable,
          writable: pd.writable            
        };
      }
    });

    defineProperties(self, properties);
    return freeze(self);
  }

  /** A shorthand for create(Object.prototype, trait({...}), options) */
  function object(record, options) {
    return create(Object.prototype, trait(record), options);
  }

  /**
   * Tests whether two traits are equivalent. T1 is equivalent to T2 iff
   * both describe the same set of property names and for all property
   * names n, T1[n] is equivalent to T2[n]. Two property descriptors are
   * equivalent if they have the same value, accessors and attributes.
   *
   * @return a boolean indicating whether the two argument traits are
   *         equivalent.
   */
  function eqv(trait1, trait2) {
    var names1 = getOwnPropertyNames(trait1);
    var names2 = getOwnPropertyNames(trait2);
    var name;
    if (names1.length !== names2.length) {
      return false;
    }
    for (var i = 0; i < names1.length; i++) {
      name = names1[i];
      if (!trait2[name] || !isSameDesc(trait1[name], trait2[name])) {
        return false;
      }
    }
    return true;
  }
  
  // if this code is ran in ES3 without an Object.create function, this
  // library will define it on Object:
  if (!Object.create) {
    Object.create = Object_create;
  }
  // ES5 does not by default provide Object.getOwnProperties
  // if it's not defined, the Traits library defines this utility
  // function on Object 
  if(!Object.getOwnProperties) {
    Object.getOwnProperties = getOwnProperties;
  }
  
  // expose the public API of this module
  function Trait(record) {
    // calling Trait as a function creates a new atomic trait
    return trait(record);
  }
  Trait.required = freeze(required);
  Trait.compose = freeze(compose);
  Trait.resolve = freeze(resolve);
  Trait.override = freeze(override);
  Trait.create = freeze(create);
  Trait.eqv = freeze(eqv);
  Trait.object = freeze(object); // not essential, cf. create + trait
  return freeze(Trait);
  
})();

if (typeof exports !== "undefined") { // CommonJS module support
  exports.Trait = Trait;
}

// --- End traits-0.3.js ---


});
;bespin.tiki.register("::bespin", {
    name: "bespin",
    dependencies: {  }
});bespin.bootLoaded = true;
bespin.tiki.module("bespin:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// BEGIN VERSION BLOCK
/** The core version of the Bespin system */
exports.versionNumber = 'tip';

/** The version number to display to users */
exports.versionCodename = 'DEVELOPMENT MODE';

/** The version number of the API (to ensure that the client and server are talking the same language) */
exports.apiVersion = 'dev';

// END VERSION BLOCK


});

bespin.tiki.module("bespin:promise",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var console = require('bespin:console').console;
var Trace = require('bespin:util/stacktrace').Trace;

/**
 * A promise can be in one of 2 states.
 * The ERROR and SUCCESS states are terminal, the PENDING state is the only
 * start state.
 */
var ERROR = -1;
var PENDING = 0;
var SUCCESS = 1;

/**
 * We give promises and ID so we can track which are outstanding
 */
var _nextId = 0;

/**
 * Debugging help if 2 things try to complete the same promise.
 * This can be slow (especially on chrome due to the stack trace unwinding) so
 * we should leave this turned off in normal use.
 */
var _traceCompletion = false;

/**
 * Outstanding promises. Handy list for debugging only.
 */
exports._outstanding = [];

/**
 * Recently resolved promises. Also for debugging only.
 */
exports._recent = [];

/**
 * Create an unfulfilled promise
 */
exports.Promise = function () {
    this._status = PENDING;
    this._value = undefined;
    this._onSuccessHandlers = [];
    this._onErrorHandlers = [];

    // Debugging help
    this._id = _nextId++;
    //this._createTrace = new Trace(new Error());
    exports._outstanding[this._id] = this;
};

/**
 * Yeay for RTTI.
 */
exports.Promise.prototype.isPromise = true;

/**
 * Have we either been resolve()ed or reject()ed?
 */
exports.Promise.prototype.isComplete = function() {
    return this._status != PENDING;
};

/**
 * Have we resolve()ed?
 */
exports.Promise.prototype.isResolved = function() {
    return this._status == SUCCESS;
};

/**
 * Have we reject()ed?
 */
exports.Promise.prototype.isRejected = function() {
    return this._status == ERROR;
};

/**
 * Take the specified action of fulfillment of a promise, and (optionally)
 * a different action on promise rejection.
 */
exports.Promise.prototype.then = function(onSuccess, onError) {
    if (typeof onSuccess === 'function') {
        if (this._status === SUCCESS) {
            onSuccess.call(null, this._value);
        } else if (this._status === PENDING) {
            this._onSuccessHandlers.push(onSuccess);
        }
    }

    if (typeof onError === 'function') {
        if (this._status === ERROR) {
            onError.call(null, this._value);
        } else if (this._status === PENDING) {
            this._onErrorHandlers.push(onError);
        }
    }

    return this;
};

/**
 * Like then() except that rather than returning <tt>this</tt> we return
 * a promise which
 */
exports.Promise.prototype.chainPromise = function(onSuccess) {
    var chain = new exports.Promise();
    chain._chainedFrom = this;
    this.then(function(data) {
        try {
            chain.resolve(onSuccess(data));
        } catch (ex) {
            chain.reject(ex);
        }
    }, function(ex) {
        chain.reject(ex);
    });
    return chain;
};

/**
 * Supply the fulfillment of a promise
 */
exports.Promise.prototype.resolve = function(data) {
    return this._complete(this._onSuccessHandlers, SUCCESS, data, 'resolve');
};

/**
 * Renege on a promise
 */
exports.Promise.prototype.reject = function(data) {
    return this._complete(this._onErrorHandlers, ERROR, data, 'reject');
};

/**
 * Internal method to be called on resolve() or reject().
 * @private
 */
exports.Promise.prototype._complete = function(list, status, data, name) {
    // Complain if we've already been completed
    if (this._status != PENDING) {
        console.group('Promise already closed');
        console.error('Attempted ' + name + '() with ', data);
        console.error('Previous status = ', this._status,
                ', previous value = ', this._value);
        console.trace();

        if (this._completeTrace) {
            console.error('Trace of previous completion:');
            this._completeTrace.log(5);
        }
        console.groupEnd();
        return this;
    }

    if (_traceCompletion) {
        this._completeTrace = new Trace(new Error());
    }

    this._status = status;
    this._value = data;

    // Call all the handlers, and then delete them
    list.forEach(function(handler) {
        handler.call(null, this._value);
    }, this);
    this._onSuccessHandlers.length = 0;
    this._onErrorHandlers.length = 0;

    // Remove the given {promise} from the _outstanding list, and add it to the
    // _recent list, pruning more than 20 recent promises from that list.
    delete exports._outstanding[this._id];
    exports._recent.push(this);
    while (exports._recent.length > 20) {
        exports._recent.shift();
    }

    return this;
};

/**
 * Takes an array of promises and returns a promise that that is fulfilled once
 * all the promises in the array are fulfilled
 * @param group The array of promises
 * @return the promise that is fulfilled when all the array is fulfilled
 */
exports.group = function(promiseList) {
    if (!(promiseList instanceof Array)) {
        promiseList = Array.prototype.slice.call(arguments);
    }

    // If the original array has nothing in it, return now to avoid waiting
    if (promiseList.length === 0) {
        return new exports.Promise().resolve([]);
    }

    var groupPromise = new exports.Promise();
    var results = [];
    var fulfilled = 0;

    var onSuccessFactory = function(index) {
        return function(data) {
            results[index] = data;
            fulfilled++;
            // If the group has already failed, silently drop extra results
            if (groupPromise._status !== ERROR) {
                if (fulfilled === promiseList.length) {
                    groupPromise.resolve(results);
                }
            }
        };
    };

    promiseList.forEach(function(promise, index) {
        var onSuccess = onSuccessFactory(index);
        var onError = groupPromise.reject.bind(groupPromise);
        promise.then(onSuccess, onError);
    });

    return groupPromise;
};

/**
 * Take an asynchronous function (i.e. one that returns a promise) and
 * return a synchronous version of the same function.
 * Clearly this is impossible without blocking or busy waiting (both evil).
 * In this case we make the assumption that the called function is only
 * theoretically asynchronous (which is actually common with Bespin, because the
 * most common cause of asynchronaity is the lazy loading module system which
 * can sometimes be proved to be synchronous in use, even though in theory
 * there is the potential for asynch behaviour)
 */
exports.synchronizer = function(func, scope) {
    return function() {
        var promise = func.apply(scope, arguments);
        if (!promise.isComplete()) {
            throw new Error('asynchronous function can\'t be synchronized');
        }
        return promise._value;
    };
};

});

bespin.tiki.module("bespin:util/cookie",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Adds escape sequences for special characters in regular expressions
 * @param {String} str a String with special characters to be left unescaped
 */
var escapeString = function(str, except){
    return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(ch){
        if(except && except.indexOf(ch) != -1){
            return ch;
        }
        return "\\" + ch;
    });
};

/**
 * Get a cookie value by name
 * @param {String} name The cookie value to retrieve
 * @return The value, or undefined if the cookie was not found
 */
exports.get = function(name) {
    var matcher = new RegExp("(?:^|; )" + escapeString(name) + "=([^;]*)");
    var matches = document.cookie.match(matcher);
    return matches ? decodeURIComponent(matches[1]) : undefined;
};

/**
 * Set a cookie value
 * @param {String} name The cookie value to alter
 * @param {String} value The new value for the cookie
 * @param {Object} props (Optional) cookie properties. One of:<ul>
 * <li>expires: Date|String|Number|null If a number, the number of days from
 * today at which the cookie will expire. If a date, the date past which the
 * cookie will expire. If expires is in the past, the cookie will be deleted.
 * If expires is omitted or is 0, the cookie will expire either directly (ff3)
 * or when the browser closes
 * <li>path: String|null The path to use for the cookie.
 * <li>domain: String|null The domain to use for the cookie.
 * <li>secure: Boolean|null Whether to only send the cookie on secure connections
 * </ul>
 */
exports.set = function(name, value, props) {
    props = props || {};

    if (typeof props.expires == "number") {
        var date = new Date();
        date.setTime(date.getTime() + props.expires * 24 * 60 * 60 * 1000);
        props.expires = date;
    }
    if (props.expires && props.expires.toUTCString) {
        props.expires = props.expires.toUTCString();
    }

    value = encodeURIComponent(value);
    var updatedCookie = name + "=" + value, propName;
    for (propName in props) {
        updatedCookie += "; " + propName;
        var propValue = props[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
};

/**
 * Remove a cookie by name. Depending on the browser, the cookie will either
 * be deleted directly or at browser close.
 * @param {String} name The cookie value to retrieve
 */
exports.remove = function(name) {
    exports.set(name, "", { expires: -1 });
};

/**
 * Use to determine if the current browser supports cookies or not.
 * @return Returns true if user allows cookies, false otherwise
 */
exports.isSupported = function() {
    if (!("cookieEnabled" in navigator)) {
        exports.set("__djCookieTest__", "CookiesAllowed");
        navigator.cookieEnabled = exports.get("__djCookieTest__") == "CookiesAllowed";
        if (navigator.cookieEnabled) {
            exports.remove("__djCookieTest__");
        }
    }
    return navigator.cookieEnabled;
};

});

bespin.tiki.module("bespin:util/scratchcanvas",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require('bespin:util/util');

/**
 * A invisible singleton canvas on the page, useful whenever a canvas context
 * is needed (e.g. for computing text sizes), but an actual canvas isn't handy
 * at the moment.
 * @constructor
 */
var ScratchCanvas = function() {
    this._canvas = document.getElementById('bespin-scratch-canvas');

    // It's possible that another ScratchCanvas instance in another sandbox
    // exists on the page. If so, we assume they're compatible, and use
    // that one.
    if (util.none(this._canvas)) {
        this._canvas = document.createElement('canvas');
        this._canvas.id = 'bespin-scratch-canvas';
        this._canvas.width = 400;
        this._canvas.height = 300;
        this._canvas.style.position = 'absolute';
        this._canvas.style.top = "-10000px";
        this._canvas.style.left = "-10000px";
        document.body.appendChild(this._canvas);
    }
};

ScratchCanvas.prototype.getContext = function() {
    return this._canvas.getContext('2d');
};

/**
 * Returns the width in pixels of the given string ("M", by default) in the
 * given font.
 */
ScratchCanvas.prototype.measureStringWidth = function(font, str) {
    if (util.none(str)) {
        str = "M";
    }

    var context = this.getContext();
    context.save();
    context.font = font;
    var width = context.measureText(str).width;
    context.restore();
    return width;
};

var singleton = null;

/**
 * Returns the instance of the scratch canvas on the page, creating it if
 * necessary.
 */
exports.get = function() {
    if (singleton === null) {
        singleton = new ScratchCanvas();
    }
    return singleton;
};

});

bespin.tiki.module("bespin:util/util",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Create an object representing a de-serialized query section of a URL.
 * Query keys with multiple values are returned in an array.
 * <p>Example: The input "foo=bar&foo=baz&thinger=%20spaces%20=blah&zonk=blarg&"
 * Produces the output object:
 * <pre>{
 *   foo: [ "bar", "baz" ],
 *   thinger: " spaces =blah",
 *   zonk: "blarg"
 * }
 * </pre>
 * <p>Note that spaces and other urlencoded entities are correctly handled
 * @see dojo.queryToObject()
 * While dojo.queryToObject() is mainly for URL query strings, this version
 * allows to specify a separator character
 */
exports.queryToObject = function(str, seperator) {
    var ret = {};
    var qp = str.split(seperator || "&");
    var dec = decodeURIComponent;
    qp.forEach(function(item) {
        if (item.length) {
            var parts = item.split("=");
            var name = dec(parts.shift());
            var val = dec(parts.join("="));
            if (exports.isString(ret[name])){
                ret[name] = [ret[name]];
            }
            if (Array.isArray(ret[name])){
                ret[name].push(val);
            } else {
                ret[name] = val;
            }
        }
    });
    return ret;
};

/**
 * Takes a name/value mapping object and returns a string representing a
 * URL-encoded version of that object for use in a GET request
 * <p>For example, given the input:
 * <code>{ blah: "blah", multi: [ "thud", "thonk" ] }</code>
 * The following string would be returned:
 * <code>"blah=blah&multi=thud&multi=thonk"</code>
 * @param map {Object} The object to convert
 * @return {string} A URL-encoded version of the input
 */
exports.objectToQuery = function(map) {
    // FIXME: need to implement encodeAscii!!
    var enc = encodeURIComponent;
    var pairs = [];
    var backstop = {};
    for (var name in map) {
        var value = map[name];
        if (value != backstop[name]) {
            var assign = enc(name) + "=";
            if (value.isArray) {
                for (var i = 0; i < value.length; i++) {
                    pairs.push(assign + enc(value[i]));
                }
            } else {
                pairs.push(assign + enc(value));
            }
        }
    }
    return pairs.join("&");
};

/**
 * Holds the count to keep a unique value for setTimeout
 * @private See rateLimit()
 */
var nextRateLimitId = 0;

/**
 * Holds the timeouts so they can be cleared later
 * @private See rateLimit()
 */
var rateLimitTimeouts = {};

/**
 * Delay calling some function to check that it's not called again inside a
 * maxRate. The real function is called after maxRate ms unless the return
 * value of this function is called before, in which case the clock is restarted
 */
exports.rateLimit = function(maxRate, scope, func) {
    if (maxRate) {
        var rateLimitId = nextRateLimitId++;

        return function() {
            if (rateLimitTimeouts[rateLimitId]) {
                clearTimeout(rateLimitTimeouts[rateLimitId]);
            }

            rateLimitTimeouts[rateLimitId] = setTimeout(function() {
                func.apply(scope, arguments);
                delete rateLimitTimeouts[rateLimitId];
            }, maxRate);
        };
    }
};

/**
 * Return true if it is a String
 */
exports.isString = function(it) {
    return (typeof it == "string" || it instanceof String);
};

/**
 * Returns true if it is a Boolean.
 */
exports.isBoolean = function(it) {
    return (typeof it == 'boolean');
};

/**
 * Returns true if it is a Number.
 */
exports.isNumber = function(it) {
    return (typeof it == 'number' && isFinite(it));
};

/**
 * Hack copied from dojo.
 */
exports.isObject = function(it) {
    return it !== undefined &&
        (it === null || typeof it == "object" ||
        Array.isArray(it) || exports.isFunction(it));
};

/**
 * Is the passed object a function?
 * From dojo.isFunction()
 */
exports.isFunction = (function() {
    var _isFunction = function(it) {
        var t = typeof it; // must evaluate separately due to bizarre Opera bug. See #8937
        //Firefox thinks object HTML element is a function, so test for nodeType.
        return it && (t == "function" || it instanceof Function) && !it.nodeType; // Boolean
    };

    return exports.isSafari ?
        // only slow this down w/ gratuitious casting in Safari (not WebKit)
        function(/*anything*/ it) {
            if (typeof it == "function" && it == "[object NodeList]") {
                return false;
            }
            return _isFunction(it); // Boolean
        } : _isFunction;
})();

/**
 * A la Prototype endsWith(). Takes a regex excluding the '$' end marker
 */
exports.endsWith = function(str, end) {
    if (!str) {
        return false;
    }
    return str.match(new RegExp(end + "$"));
};

/**
 * A la Prototype include().
 */
exports.include = function(array, item) {
    return array.indexOf(item) > -1;
};

/**
 * Like include, but useful when you're checking for a specific
 * property on each object in the list...
 *
 * Returns null if the item is not in the list, otherwise
 * returns the index of the item.
 */
exports.indexOfProperty = function(array, propertyName, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][propertyName] == item) {
            return i;
        }
    }
    return null;
};

/**
 * A la Prototype last().
 */
exports.last = function(array) {
    if (Array.isArray(array)) {
        return array[array.length - 1];
    }
};

/**
 * Knock off any undefined items from the end of an array
 */
exports.shrinkArray = function(array) {
    var newArray = [];

    var stillAtBeginning = true;
    array.reverse().forEach(function(item) {
        if (stillAtBeginning && item === undefined) {
            return;
        }

        stillAtBeginning = false;

        newArray.push(item);
    });

    return newArray.reverse();
};

/**
 * Create an array
 * @param number The size of the new array to create
 * @param character The item to put in the array, defaults to ' '
 */
exports.makeArray = function(number, character) {
    if (number < 1) {
        return []; // give us a normal number please!
    }
    if (!character){character = ' ';}

    var newArray = [];
    for (var i = 0; i < number; i++) {
        newArray.push(character);
    }
    return newArray;
};

/**
 * Repeat a string a given number of times.
 * @param string String to repeat
 * @param repeat Number of times to repeat
 */
exports.repeatString = function(string, repeat) {
    var newstring = '';

    for (var i = 0; i < repeat; i++) {
        newstring += string;
    }

    return newstring;
};

/**
 * Given a row, find the number of leading spaces.
 * E.g. an array with the string "  aposjd" would return 2
 * @param row The row to hunt through
 */
exports.leadingSpaces = function(row) {
    var numspaces = 0;
    for (var i = 0; i < row.length; i++) {
        if (row[i] == ' ' || row[i] == '' || row[i] === undefined) {
            numspaces++;
        } else {
            return numspaces;
        }
    }
    return numspaces;
};

/**
 * Given a row, find the number of leading tabs.
 * E.g. an array with the string "\t\taposjd" would return 2
 * @param row The row to hunt through
 */
exports.leadingTabs = function(row) {
    var numtabs = 0;
    for (var i = 0; i < row.length; i++) {
        if (row[i] == '\t' || row[i] == '' || row[i] === undefined) {
            numtabs++;
        } else {
            return numtabs;
        }
    }
    return numtabs;
};

/**
 * Given a row, extract a copy of the leading spaces or tabs.
 * E.g. an array with the string "\t    \taposjd" would return an array with the
 * string "\t    \t".
 * @param row The row to hunt through
 */
exports.leadingWhitespace = function(row) {
    var leading = [];
    for (var i = 0; i < row.length; i++) {
        if (row[i] == ' ' || row[i] == '\t' || row[i] == '' || row[i] === undefined) {
            leading.push(row[i]);
        } else {
            return leading;
        }
    }
    return leading;
};

/**
 * Given a camelCaseWord convert to "Camel Case Word"
 */
exports.englishFromCamel = function(camel) {
    camel.replace(/([A-Z])/g, function(str) {
        return " " + str.toLowerCase();
    }).trim();
};

/**
 * I hate doing this, but we need some way to determine if the user is on a Mac
 * The reason is that users have different expectations of their key combinations.
 *
 * Take copy as an example, Mac people expect to use CMD or APPLE + C
 * Windows folks expect to use CTRL + C
 */
exports.OS = {
    LINUX: 'LINUX',
    MAC: 'MAC',
    WINDOWS: 'WINDOWS'
};

var ua = navigator.userAgent;
var av = navigator.appVersion;

/** Is the user using a browser that identifies itself as Linux */
exports.isLinux = av.indexOf("Linux") >= 0;

/** Is the user using a browser that identifies itself as Windows */
exports.isWindows = av.indexOf("Win") >= 0;

/** Is the user using a browser that identifies itself as WebKit */
exports.isWebKit = parseFloat(ua.split("WebKit/")[1]) || undefined;

/** Is the user using a browser that identifies itself as Chrome */
exports.isChrome = parseFloat(ua.split("Chrome/")[1]) || undefined;

/** Is the user using a browser that identifies itself as Mac OS */
exports.isMac = av.indexOf("Macintosh") >= 0;

/* Is this Firefox or related? */
exports.isMozilla = av.indexOf('Gecko/') >= 0;

if (ua.indexOf("AdobeAIR") >= 0) {
    exports.isAIR = 1;
}

/**
 * Is the user using a browser that identifies itself as Safari
 * See also:
 * - http://developer.apple.com/internet/safari/faq.html#anchor2
 * - http://developer.apple.com/internet/safari/uamatrix.html
 */
var index = Math.max(av.indexOf("WebKit"), av.indexOf("Safari"), 0);
if (index && !exports.isChrome) {
    // try to grab the explicit Safari version first. If we don't get
    // one, look for less than 419.3 as the indication that we're on something
    // "Safari 2-ish".
    exports.isSafari = parseFloat(av.split("Version/")[1]);
    if (!exports.isSafari || parseFloat(av.substr(index + 7)) <= 419.3) {
        exports.isSafari = 2;
    }
}

if (ua.indexOf("Gecko") >= 0 && !exports.isWebKit) {
    exports.isMozilla = parseFloat(av);
}

/**
 * Return a exports.OS constant
 */
exports.getOS = function() {
    if (exports.isMac) {
        return exports.OS['MAC'];
    } else if (exports.isLinux) {
        return exports.OS['LINUX'];
    } else {
        return exports.OS['WINDOWS'];
    }
};

/** Returns true if the DOM element "b" is inside the element "a". */
if (typeof(document) !== 'undefined' && document.compareDocumentPosition) {
    exports.contains = function(a, b) {
        return a.compareDocumentPosition(b) & 16;
    };
} else {
    exports.contains = function(a, b) {
        return a !== b && (a.contains ? a.contains(b) : true);
    };
}

/**
 * Prevents propagation and clobbers the default action of the passed event
 */
exports.stopEvent = function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
};

/**
 * Create a random password of the given length (default 16 chars)
 */
exports.randomPassword = function(length) {
    length = length || 16;
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var charIndex = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(charIndex);
    }
    return pass;
};

/**
 * Is the passed object free of members, i.e. are there any enumerable
 * properties which the objects claims as it's own using hasOwnProperty()
 */
exports.isEmpty = function(object) {
    for (var x in object) {
        if (object.hasOwnProperty(x)) {
            return false;
        }
    }
    return true;
};

/**
 * Does the name of a project indicate that it is owned by someone else
 * TODO: This is a major hack. We really should have a File object that include
 * separate owner information.
 */
exports.isMyProject = function(project) {
    return project.indexOf("+") == -1;
};

/**
 * Format a date as dd MMM yyyy
 */
exports.formatDate = function (date) {
    if (!date) {
        return "Unknown";
    }
    return date.getDate() + " " +
        exports.formatDate.shortMonths[date.getMonth()] + " " +
        date.getFullYear();
};

/**
 * Month data for exports.formatDate
 */
exports.formatDate.shortMonths = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

/**
 * Add a CSS class to the list of classes on the given node
 */
exports.addClass = function(node, className) {
    var parts = className.split(/\s+/);
    var cls = " " + node.className + " ";
    for (var i = 0, len = parts.length, c; i < len; ++i) {
        c = parts[i];
        if (c && cls.indexOf(" " + c + " ") < 0) {
            cls += c + " ";
        }
    }
    node.className = cls.trim();
};

/**
 * Remove a CSS class from the list of classes on the given node
 */
exports.removeClass = function(node, className) {
    var cls;
    if (className !== undefined) {
        var parts = className.split(/\s+/);
        cls = " " + node.className + " ";
        for (var i = 0, len = parts.length; i < len; ++i) {
            cls = cls.replace(" " + parts[i] + " ", " ");
        }
        cls = cls.trim();
    } else {
        cls = "";
    }
    if (node.className != cls) {
        node.className = cls;
    }
};

/**
 * Add or remove a CSS class from the list of classes on the given node
 * depending on the value of <tt>include</tt>
 */
exports.setClass = function(node, className, include) {
    if (include) {
        exports.addClass(node, className);
    } else {
        exports.removeClass(node, className);
    }
};

/**
 * Is the passed object either null or undefined (using ===)
 */
exports.none = function(obj) {
    return obj === null || obj === undefined;
};

/**
 * Creates a clone of the passed object.  This function can take just about
 * any type of object and create a clone of it, including primitive values
 * (which are not actually cloned because they are immutable).
 * If the passed object implements the clone() method, then this function
 * will simply call that method and return the result.
 *
 * @param object {Object} the object to clone
 * @param deep {Boolean} do a deep clone?
 * @returns {Object} the cloned object
 */
exports.clone = function(object, deep) {
    if (Array.isArray(object) && !deep) {
        return object.slice();
    }

    if (typeof object === 'object' || Array.isArray(object)) {
        if (object === null) {
            return null;
        }

        var reply = (Array.isArray(object) ? [] : {});
        for (var key in object) {
            if (deep && (typeof object[key] === 'object'
                            || Array.isArray(object[key]))) {
                reply[key] = exports.clone(object[key], true);
            } else {
                 reply[key] = object[key];
            }
        }
        return reply;
    }

    if (object && typeof(object.clone) === 'function') {
        return object.clone();
    }

    // That leaves numbers, booleans, undefined. Doesn't it?
    return object;
};


/**
 * Helper method for extending one object with another
 * Copies all properties from source to target. Returns the extended target
 * object.
 * Taken from John Resig, http://ejohn.org/blog/javascript-getters-and-setters/.
 */
exports.mixin = function(a, b) {
    for (var i in b) {
        var g = b.__lookupGetter__(i);
        var s = b.__lookupSetter__(i);

        if (g || s) {
            if (g) {
                a.__defineGetter__(i, g);
            }
            if (s) {
                a.__defineSetter__(i, s);
            }
        } else {
            a[i] = b[i];
        }
    }

    return a;
};

/**
 * Basically taken from Sproutcore.
 * Replaces the count items from idx with objects.
 */
exports.replace = function(arr, idx, amt, objects) {
    return arr.slice(0, idx).concat(objects).concat(arr.slice(idx + amt));
};

/**
 * Return true if the two frames match.  You can also pass only points or sizes.
 * @param r1 {Rect} the first rect
 * @param r2 {Rect} the second rect
 * @param delta {Float} an optional delta that allows for rects that do not match exactly. Defaults to 0.1
 * @returns {Boolean} true if rects match
 */
exports.rectsEqual = function(r1, r2, delta) {
    if (!r1 || !r2) {
        return r1 == r2;
    }

    if (!delta && delta !== 0) {
        delta = 0.1;
    }

    if ((r1.y != r2.y) && (Math.abs(r1.y - r2.y) > delta)) {
        return false;
    }

    if ((r1.x != r2.x) && (Math.abs(r1.x - r2.x) > delta)) {
        return false;
    }

    if ((r1.width != r2.width) && (Math.abs(r1.width - r2.width) > delta)) {
        return false;
    }

    if ((r1.height != r2.height) && (Math.abs(r1.height - r2.height) > delta)) {
        return false;
    }

    return true;
};

});

bespin.tiki.module("bespin:util/stacktrace",function(require,exports,module) {
// Changed to suit the specific needs of running within Bespin

// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Øyvind Sean Kinsey http://kinsey.no/blog
//
// Information and discussions
// http://jspoker.pokersource.info/skin/test-printstacktrace.html
// http://eriwen.com/javascript/js-stack-trace/
// http://eriwen.com/javascript/stacktrace-update/
// http://pastie.org/253058
// http://browsershots.org/http://jspoker.pokersource.info/skin/test-printstacktrace.html
//

//
// guessFunctionNameFromLines comes from firebug
//
// Software License Agreement (BSD License)
//
// Copyright (c) 2007, Parakey Inc.
// All rights reserved.
//
// Redistribution and use of this software in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above
//   copyright notice, this list of conditions and the
//   following disclaimer.
//
// * Redistributions in binary form must reproduce the above
//   copyright notice, this list of conditions and the
//   following disclaimer in the documentation and/or other
//   materials provided with the distribution.
//
// * Neither the name of Parakey Inc. nor the names of its
//   contributors may be used to endorse or promote products
//   derived from this software without specific prior
//   written permission of Parakey Inc.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
// IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
// OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var util = require('bespin:util/util');
var console = require("bespin:console").console;

/**
 * Different browsers create stack traces in different ways.
 * <strike>Feature</strike> Browser detection baby ;).
 */
var mode = (function() {

    // We use SC's browser detection here to avoid the "break on error"
    // functionality provided by Firebug. Firebug tries to do the right
    // thing here and break, but it happens every time you load the page.
    // bug 554105
    if (util.isMozilla) {
        return 'firefox';
    } else if (util.isOpera) {
        return 'opera';
    } else if (util.isSafari) {
        return 'other';
    }

    // SC doesn't do any detection of Chrome at this time.

    // this is the original feature detection code that is used as a
    // fallback.
    try {
        (0)();
    } catch (e) {
        if (e.arguments) {
            return 'chrome';
        }
        if (e.stack) {
            return 'firefox';
        }
        if (window.opera && !('stacktrace' in e)) { //Opera 9-
            return 'opera';
        }
    }
    return 'other';
})();

/**
 *
 */
function stringifyArguments(args) {
    for (var i = 0; i < args.length; ++i) {
        var argument = args[i];
        if (typeof argument == 'object') {
            args[i] = '#object';
        } else if (typeof argument == 'function') {
            args[i] = '#function';
        } else if (typeof argument == 'string') {
            args[i] = '"' + argument + '"';
        }
    }
    return args.join(',');
}

/**
 * Extract a stack trace from the format emitted by each browser.
 */
var decoders = {
    chrome: function(e) {
        var stack = e.stack;
        if (!stack) {
            console.log(e);
            return [];
        }
        return stack.replace(/^.*?\n/, '').
                replace(/^.*?\n/, '').
                replace(/^.*?\n/, '').
                replace(/^[^\(]+?[\n$]/gm, '').
                replace(/^\s+at\s+/gm, '').
                replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').
                split('\n');
    },

    firefox: function(e) {
        var stack = e.stack;
        if (!stack) {
            console.log(e);
            return [];
        }
        // stack = stack.replace(/^.*?\n/, '');
        stack = stack.replace(/(?:\n@:0)?\s+$/m, '');
        stack = stack.replace(/^\(/gm, '{anonymous}(');
        return stack.split('\n');
    },

    // Opera 7.x and 8.x only!
    opera: function(e) {
        var lines = e.message.split('\n'), ANON = '{anonymous}',
            lineRE = /Line\s+(\d+).*?script\s+(http\S+)(?:.*?in\s+function\s+(\S+))?/i, i, j, len;

        for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
            if (lineRE.test(lines[i])) {
                lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) +
                ' -- ' +
                lines[i + 1].replace(/^\s+/, '');
            }
        }

        lines.splice(j, lines.length - j);
        return lines;
    },

    // Safari, Opera 9+, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], j = 0, fn, args;

        var maxStackSize = 10;
        while (curr && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments']);
            stack[j++] = fn + '(' + stringifyArguments(args) + ')';

            //Opera bug: if curr.caller does not exist, Opera returns curr (WTF)
            if (curr === curr.caller && window.opera) {
                //TODO: check for same arguments if possible
                break;
            }
            curr = curr.caller;
        }
        return stack;
    }
};

/**
 *
 */
function NameGuesser() {
}

NameGuesser.prototype = {

    sourceCache: {},

    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (!req) {
            return;
        }
        req.open('GET', url, false);
        req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        req.send('');
        return req.responseText;
    },

    createXMLHTTPObject: function() {
	    // Try XHR methods in order and store XHR factory
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {}
        }
    },

    getSource: function(url) {
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /{anonymous}\(.*\)@(\w+:\/\/([-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
            var frame = stack[i], m = reStack.exec(frame);
            if (m) {
                var file = m[1], lineno = m[4]; //m[7] is character position in Chrome
                if (file && lineno) {
                    var functionName = this.guessFunctionName(file, lineno);
                    stack[i] = frame.replace('{anonymous}', functionName);
                }
            }
        }
        return stack;
    },

    guessFunctionName: function(url, lineNo) {
        try {
            return this.guessFunctionNameFromLines(lineNo, this.getSource(url));
        } catch (e) {
            return 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
    },

    guessFunctionNameFromLines: function(lineNo, source) {
        var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/;
        var reGuessFunction = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
        // Walk backwards from the first line in the function until we find the line which
        // matches the pattern above, which is the function definition
        var line = '', maxLines = 10;
        for (var i = 0; i < maxLines; ++i) {
            line = source[lineNo - i] + line;
            if (line !== undefined) {
                var m = reGuessFunction.exec(line);
                if (m) {
                    return m[1];
                }
                else {
                    m = reFunctionArgNames.exec(line);
                }
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};

var guesser = new NameGuesser();

var frameIgnorePatterns = [
    /http:\/\/localhost:4020\/sproutcore.js:/
];

exports.ignoreFramesMatching = function(regex) {
    frameIgnorePatterns.push(regex);
};

/**
 * Create a stack trace from an exception
 * @param ex {Error} The error to create a stacktrace from (optional)
 * @param guess {Boolean} If we should try to resolve the names of anonymous functions
 */
exports.Trace = function Trace(ex, guess) {
    this._ex = ex;
    this._stack = decoders[mode](ex);

    if (guess) {
        this._stack = guesser.guessFunctions(this._stack);
    }
};

/**
 * Log to the console a number of lines (default all of them)
 * @param lines {number} Maximum number of lines to wrote to console
 */
exports.Trace.prototype.log = function(lines) {
    if (lines <= 0) {
        // You aren't going to have more lines in your stack trace than this
        // and it still fits in a 32bit integer
        lines = 999999999;
    }

    var printed = 0;
    for (var i = 0; i < this._stack.length && printed < lines; i++) {
        var frame = this._stack[i];
        var display = true;
        frameIgnorePatterns.forEach(function(regex) {
            if (regex.test(frame)) {
                display = false;
            }
        });
        if (display) {
            console.debug(frame);
            printed++;
        }
    }
};

});

bespin.tiki.module("bespin:console",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require("util/util");

/**
 * This object represents a "safe console" object that forwards debugging
 * messages appropriately without creating a dependency on Firebug in Firefox.
 */

// We could prefer to copy the methods on window.console to exports.console
// one by one because then we could be sure of using the safe subset that is
// implemented on all browsers, however this doesn't work properly everywhere
// ...

var noop = function() {
};

// These are the functions that are available in Chrome 4/5, Safari 4
// and Firefox 3.6. Don't add to this list without checking browser support
var NAMES = [
    "assert", "count", "debug", "dir", "dirxml", "error", "group", "groupEnd",
    "info", "log", "profile", "profileEnd", "time", "timeEnd", "trace", "warn"
];

if (typeof(window) === 'undefined') {
    // We're in a web worker. Forward to the main thread so the messages
    // will show up.
    var console = {};
    NAMES.forEach(function(name) {
        console[name] = function() {
            var args = Array.prototype.slice.call(arguments);
            var msg = { op: 'log', method: name, args: args };
            postMessage(JSON.stringify(msg));
        };
    });

    exports.console = console;
} else if (util.isSafari || util.isChrome) {
    // Webkit's output functions are bizarre because they get confused if 'this'
    // is not window.console, so we just copy it all across
    exports.console = window.console;
} else {
    // So we're not in Webkit, but we may still be no console object (in the
    // case of Firefox without Firebug)
    exports.console = { };

    // For each of the console functions, copy them if they exist, stub if not
    NAMES.forEach(function(name) {
        if (window.console && window.console[name]) {
            exports.console[name] = window.console[name].bind(window.console);
        } else {
            exports.console[name] = noop;
        }
    });
}


});

bespin.tiki.module("bespin:sandbox",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var tiki = require('tiki');
var util = require('bespin:util/util');
var catalog = require('bespin:plugins').catalog;

/**
 * A sandbox can only be used from inside of the `master` catalog.
 */
if (catalog.parent) {
    throw new Error('The sandbox module can\'t be used inside of a slave catalog!');
}

/**
 * A special Bespin subclass of the tiki sandbox class. When the sandbox is
 * created, the catalog for the new sandbox is setup based on the catalog
 * data that is already in the so called `master` catalog.
 */
var Sandbox = function() {
    // Call the default constructor. This creates a new tiki sandbox.
    tiki.Sandbox.call(this, bespin.tiki.require.loader, {}, []);

    // Register the plugins from the main catalog in the sandbox catalog.
    var sandboxCatalog = this.require('bespin:plugins').catalog;

    // Set the parent catalog for the sandbox catalog. This makes the sandbox
    // be a slave catalog of the master catalog.
    sandboxCatalog.parent = catalog;
    catalog.children.push(sandboxCatalog);

    // Copy over a few things from the master catalog.
    sandboxCatalog.deactivatePlugin = util.clone(catalog.deactivatePlugin);
    sandboxCatalog._extensionsOrdering = util.clone(catalog._extensionsOrdering);

    // Register the metadata from the master catalog.
    sandboxCatalog._registerMetadata(util.clone(catalog.metadata, true));
};

Sandbox.prototype = new tiki.Sandbox();

/**
 * Overrides the standard tiki.Sandbox.require function. If the requested
 * module/plugin is shared between the sandboxes, then the require function
 * on the `master` sandbox is called. Otherwise it calls the overridden require
 * function.
 */
Sandbox.prototype.require = function(moduleId, curModuleId, workingPackage) {
    // assume canonical() will normalize params
    var canonicalId = this.loader.canonical(moduleId, curModuleId, workingPackage);
    // Get the plugin name.
    var pluginName = canonicalId.substring(2).split(':')[0];

    // Check if this module should be shared.
    if (catalog.plugins[pluginName].share) {
        // The module is shared, so require it from the main sandbox.
        return bespin.tiki.sandbox.require(moduleId, curModuleId, workingPackage);
    } else {
        // This module is not shared, so use the normal require function.
        return tiki.Sandbox.prototype.require.call(this, moduleId,
                                                    curModuleId, workingPackage);
    }
}

// Expose the sandbox.
exports.Sandbox = Sandbox;

});

bespin.tiki.module("bespin:builtins",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

exports.metadata =
{
    "bespin":
    {
        "provides":
        [
            {
                "ep": "extensionpoint",
                "name": "extensionpoint",
                "indexOx": "name",
                "register": "plugins#registerExtensionPoint",
                "unregister": "plugins#unregisterExtensionPoint",
                "description": "Defines a new extension point",
                "params": [
                    {
                        "name": "name",
                        "type": "string",
                        "description": "the extension point's name",
                        "required": true
                    },
                    {
                        "name": "description",
                        "type": "string",
                        "description": "description of what the extension point is for"
                    },
                    {
                        "name": "params",
                        "type": "array of objects",
                        "description": "parameters that provide the metadata for a given extension. Each object should have name and description, minimally. It can also have a 'type' (eg string, pointer, or array) and required to denote whether or not this parameter must be present on the extension."
                    },
                    {
                        "name": "indexOn",
                        "type": "string",
                        "description": "You can provide an 'indexOn' property to name a property of extensions through which you'd like to be able to easily look up the extension."
                    },
                    {
                        "name": "register",
                        "type": "pointer",
                        "description": "function that is called when a new extension is discovered. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                    },
                    {
                        "name": "unregister",
                        "type": "pointer",
                        "description": "function that is called when an extension is removed. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                    }
                ]
            },
            {
                "ep": "extensionpoint",
                "name": "extensionhandler",
                "register": "plugins#registerExtensionHandler",
                "unregister": "plugins#unregisterExtensionHandler",
                "description": "Used to attach listeners ",
                "params": [
                    {
                        "name": "name",
                        "type": "string",
                        "description": "name of the extension point to listen to",
                        "required": true
                    },
                    {
                        "name": "register",
                        "type": "pointer",
                        "description": "function that is called when a new extension is discovered. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                    },
                    {
                        "name": "unregister",
                        "type": "pointer",
                        "description": "function that is called when an extension is removed. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                    }
                ]
            },
            {
                "ep": "extensionpoint",
                "name": "factory",
                "description": "Provides a factory for singleton components. Each extension needs to provide a name, a pointer and an action. The action can be 'call' (if the pointer refers to a function), 'new' (if the pointer refers to a traditional JS object) or 'value' (if the pointer refers to the object itself that is the component).",
                "indexOn": "name"
            },
            {
                "ep": "factory",
                "name": "hub",
                "action": "create",
                "pointer": "util/hub#Hub"
            },
            {
                "ep": "extensionpoint",
                "name": "command",
                "description": "Editor commands/actions. TODO: list parameters here."
            }
        ]
    }
};

});

bespin.tiki.module("bespin:proxy",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var util = require("util/util");
var Promise = require("promise").Promise;

exports.xhr = function(method, url, async, beforeSendCallback) {
    var pr = new Promise();

    if (!bespin.proxy || !bespin.proxy.xhr) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState !== 4) {
                return;
            }

            var status = req.status;
            if (status !== 0 && status !== 200) {
                var error = new Error(req.responseText + ' (Status ' + req.status + ")");
                error.xhr = req;
                pr.reject(error);
                return;
            }

            pr.resolve(req.responseText);
        }.bind(this);

        req.open("GET", url, async);
        if (beforeSendCallback) {
            beforeSendCallback(req);
        }
        req.send();
    } else {
        bespin.proxy.xhr.call(this, method, url, async, beforeSendCallback, pr);
    }

    return pr;
};

exports.Worker = function(url) {
    if (!bespin.proxy || !bespin.proxy.worker) {
        return new Worker(url);
    } else {
        return new bespin.proxy.worker(url);
    }
};

});

bespin.tiki.module("bespin:plugins",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

require("globals");

var Promise = require("promise").Promise;
var group = require("promise").group;
var builtins = require("builtins");
var console = require("console").console;
var util = require("util/util");
var Trace = require("util/stacktrace").Trace;
var proxy = require('proxy');

var r = require;

var loader = require.loader;
var browser = loader.sources[0];

var USER_DEACTIVATED    = 'USER';
var DEPENDS_DEACTIVATED = 'DEPENDS';

/**
 * Split an extension pointer from module/path#objectName into an object of the
 * type { modName:"module/path", objName:"objectName" } using a pluginName
 * as the base to which roots the pointer
 */
var _splitPointer = function(pluginName, pointer) {
    if (!pointer) {
        return undefined;
    }

    var parts = pointer.split("#");
    var modName;

    // this allows syntax like #foo
    // which is equivalent to PluginName:index#foo
    if (parts[0]) {
        modName = pluginName + ":" + parts[0];
    } else {
        modName = pluginName;
    }

    return {
        modName: modName,
        objName: parts[1]
    };
};

var _retrieveObject = function(pointerObj) {
    var module = r(pointerObj.modName);
    if (pointerObj.objName) {
        return module[pointerObj.objName];
    }
    return module;
};

/**
 * An Extension represents some code that can be lazy-loaded when needed.
 * @constructor
 */
exports.Extension = function(metadata) {
    this.pluginName = null;

    for (property in metadata) {
        if (metadata.hasOwnProperty(property)) {
            this[property] = metadata[property];
        }
    }

    this._observers = [];
};

exports.Extension.prototype = {
    /**
     * Asynchronously load the actual code represented by this Extension
     * @param callback Function to call when the load has finished (deprecated)
     * @param property Extension property to load (default 'pointer')
     * @returns A promise to be fulfilled on completion. Preferred over using the
     * <tt>callback</tt> parameter.
     */
    load: function(callback, property, catalog) {
        catalog = catalog || exports.catalog;
        var promise = new Promise();

        var onComplete = function(func) {
            if (callback) {
                callback(func);
            }
            promise.resolve(func);
        };

        var pointerVal = this[property || 'pointer'];
        if (util.isFunction(pointerVal)) {
            onComplete(pointerVal);
            return promise;
        }

        var pointerObj = _splitPointer(this.pluginName, pointerVal);

        if (!pointerObj) {
            console.error('Extension cannot be loaded because it has no \'pointer\'');
            console.log(this);

            promise.reject(new Error('Extension has no \'pointer\' to call'));
            return promise;
        }

        var pluginName = this.pluginName;
        catalog.loadPlugin(pluginName).then(function() {
            require.ensure(pointerObj.modName, function() {
                var func = _retrieveObject(pointerObj);
                onComplete(func);

                // TODO: consider caching 'func' to save looking it up again
                // Something like: this._setPointer(property, data);
            });
        }, function(err) {
            console.error('Failed to load plugin ', pluginName, err);
        });

        return promise;
    },

    /**
     * Loads this extension and passes the result to the callback.
     * Any time this extension changes, the callback is called with the new value.
     * Note that if this extension goes away, the callback will be called with
     * undefined.
     * <p>observingPlugin is required, because if that plugin is torn down,
     * all of its observing callbacks need to be torn down as well.
     */
    observe: function(observingPlugin, callback, property) {
        this._observers.push({
            plugin: observingPlugin,
            callback: callback,
            property: property
        });
        this.load(callback, property);
    },

    /**
     * Returns the name of the plugin that provides this extension.
     */
    getPluginName: function() {
        return this.pluginName;
    },

    /**
     *
     */
    _getLoaded: function(property) {
        var pointerObj = this._getPointer(property);
        return _retrieveObject(pointerObj);
    }
};

/**
 * An ExtensionPoint is a get of Extensions grouped under the same name
 * for fast access.
 * @constructor
 */
exports.ExtensionPoint = function(name, catalog) {
    this.name = name;
    this.catalog = catalog;

    this.pluginName = undefined;
    this.indexOn = undefined;

    this.extensions = [];
    this.handlers = [];
};

/**
 * Implementation of ExtensionPoint
 */
exports.ExtensionPoint.prototype = {
    /**
    * Retrieves the list of plugins which provide extensions
    * for this extension point.
    */
    getImplementingPlugins: function() {
        var pluginSet = {};
        this.extensions.forEach(function(ext) {
            pluginSet[ext.pluginName] = true;
        });
        var matches = Object.keys(pluginSet);
        matches.sort();
        return matches;
    },

    /**
     * Get the name of the plugin that defines this extension point.
     */
    getDefiningPluginName: function() {
        return this.pluginName;
    },

    /**
     * If we are keeping an index (an indexOn property is set on the
     * extension point), you can look up an extension by key.
     */
    getByKey: function(key) {
        var indexOn = this.indexOn;

        if (!indexOn) {
            return undefined;
        }

        for (var i = 0; i < this.extensions.length; i++) {
            if (this.extensions[i][indexOn] == key) {
                return this.extensions[i];
            }
        }
        return undefined;
    },

    register: function(extension) {
        var catalog = this.catalog;
        this.extensions.push(extension);
        this.handlers.forEach(function(handler) {
            if (handler.register) {
                handler.load(function(register) {
                    if (!register) {
                        console.error('missing register function for pluginName=', extension.pluginName, ", extension=", extension.name);
                    } else {
                         register(extension, catalog);
                    }
                }, "register", catalog);
            }
        });
    },

    unregister: function(extension) {
        var catalog = this.catalog;
        this.extensions.splice(this.extensions.indexOf(extension), 1);
        this.handlers.forEach(function(handler) {
            if (handler.unregister) {
                handler.load(function(unregister) {
                    if (!unregister) {
                        console.error('missing unregister function for pluginName=', extension.pluginName, ", extension=", extension.name);
                    } else {
                         unregister(extension, catalog);
                    }
                }, "unregister", catalog);
            }
        });
    },

    /**
     * Order the extensions by a plugin order.
     */
    orderExtensions: function(pluginOrder) {
        var orderedExt = [];

        for (var i = 0; i < pluginOrder.length; i++) {
            var n = 0;
            while (n != this.extensions.length) {
                if (this.extensions[n].pluginName === pluginOrder[i]) {
                    orderedExt.push(this.extensions[n]);
                    this.extensions.splice(n, 1);
                } else {
                    n ++;
                }
            }
        }

        this.extensions = orderedExt.concat(this.extensions);
    }
};

/**
 * A Plugin is a set of Extensions that are loaded as a unit
 * @constructor
 */
exports.Plugin = function(metadata) {
    // Should be provided in the metadata
    this.catalog = null;
    this.name = null;
    this.provides = [];
    this.stylesheets = [];
    this.reloadURL = null;
    this.reloadPointer = null;

    for (property in metadata) {
        if (metadata.hasOwnProperty(property)) {
            this[property] = metadata[property];
        }
    }
};

/**
 * Implementation of Plugin
 */
exports.Plugin.prototype = {
    register: function() {
        this.provides.forEach(function(extension) {
            var ep = this.catalog.getExtensionPoint(extension.ep, true);
            ep.register(extension);
        }, this);
    },

    unregister: function() {
        this.provides.forEach(function(extension) {
            var ep = this.catalog.getExtensionPoint(extension.ep, true);
            ep.unregister(extension);
        }, this);
    },

    _getObservers: function() {
        var result = {};
        this.provides.forEach(function(extension) {
            console.log('ep: ', extension.ep);
            console.log(extension._observers);
            result[extension.ep] = extension._observers;
        });
        return result;
    },

    /**
     * Figure out which plugins depend on a given plugin. This
     * will allow the reload behavior to unregister/reregister
     * all of the plugins that depend on the one being reloaded.
     * If firstLevelOnly is true, only direct dependent plugins are listed.
     */
    _findDependents: function(pluginList, dependents, firstLevelOnly) {
        var pluginName = this.name;
        var self = this;
        pluginList.forEach(function(testPluginName) {
            if (testPluginName == pluginName) {
                return;
            }
            var plugin = self.catalog.plugins[testPluginName];
            if (plugin && plugin.dependencies) {
                for (dependName in plugin.dependencies) {
                    if (dependName == pluginName && !dependents[testPluginName]) {
                        dependents[testPluginName] = {
                            keepModule: false
                        };
                        if (!firstLevelOnly) {
                            plugin._findDependents(pluginList, dependents);
                        }
                    }
                }
            }
        });
    },

    /**
     * Removes the plugin from Tiki's registries.
     * As with the new multiple Bespins, this only clears the current sandbox.
     */
    _cleanup: function(leaveLoader) {
        // Remove the css files.
        this.stylesheets.forEach(function(stylesheet) {
            var links = document.getElementsByTagName('link');
            for (var i = 0; i < links.length; i++) {
                if (links[i].href.indexOf(stylesheet.url) != -1) {
                    links[i].parentNode.removeChild(links[i]);
                    break;
                }
            }
        });

        // Remove all traces of the plugin.
        var pluginName = this.name;

        var nameMatch = new RegExp("^" + pluginName + '$');
        var moduleMatch = new RegExp('^::' + pluginName + ':');
        var packageMatch = new RegExp("^::" + pluginName + '$');

        var sandbox = require.sandbox;
        var loader = require.loader;
        var source = browser;

        if (!leaveLoader) {
            // Clear the loader.
            _removeFromObject(moduleMatch, loader.factories);
            _removeFromObject(packageMatch, loader.canonicalIds);
            _removeFromObject(packageMatch, loader.canonicalPackageIds);
            _removeFromObject(packageMatch, loader.packageSources);
            _removeFromObject(packageMatch, loader.packages);

            // Clear the source.
            _removeFromObject(nameMatch, source.packageInfoByName);
            _removeFromObject(moduleMatch, source.factories);
            _removeFromObject(moduleMatch, source.scriptActions);
            _removeFromObject(moduleMatch, source.stylesheetActions);
            _removeFromObject(packageMatch, source.packages);
            _removeFromObject(packageMatch, source.ensureActions);
            _removeFromObject(packageMatch, source.packageInfoById);
        }

        // Clear the sandbox.
        _removeFromObject(moduleMatch, sandbox.exports);
        _removeFromObject(moduleMatch, sandbox.modules);
        _removeFromObject(moduleMatch, sandbox.usedExports);
    },

    /**
     * reloads the plugin and reinitializes all
     * dependent plugins
     */
    reload: function(callback) {
        // TODO: Broken. Needs to be updated to the latest Tiki.

        // All reloadable plugins will have a reloadURL
        if (!this.reloadURL) {
            return;
        }

        if (this.reloadPointer) {
            var pointer = _splitPointer(this.name, this.reloadPointer);
            func = _retrieveObject(pointer);
            if (func) {
                func();
            } else {
                console.error("Reload function could not be loaded. Aborting reload.");
                return;
            }
        }

        // find all of the dependents recursively so that
        // they can all be unregistered
        var dependents = {};

        var pluginList = Object.keys(this.catalog.plugins);

        this._findDependents(pluginList, dependents);

        var reloadDescription = {
            pluginName: this.name,
            dependents: dependents
        };

        for (var dependName in dependents) {
            var plugin = this.catalog.plugins[dependName];
            if (plugin.preRefresh) {
                var parts = _splitPointer(dependName, plugin.preRefresh);
                func = _retrieveObject(parts);
                if (func) {
                    // the preRefresh call can return an object
                    // that includes attributes:
                    // keepModule (true to keep the module object)
                    // callPointer (pointer to call at the end of reloading)
                    dependents[dependName] = func(reloadDescription);
                }
            }
        }

        // notify everyone that this plugin is going away
        this.unregister();

        for (dependName in dependents) {
            this.catalog.plugins[dependName].unregister();
        }

        this._cleanup(this.name);

        // clear the sandbox of modules from all of the dependent plugins
        var fullModList = [];
        var sandbox = require.sandbox;

        var modulesKey = Object.keys(sandbox.modules);
        var i = modulesKey.length;
        var dependRegexes = [];
        for (dependName in dependents) {
            // check to see if the module stated that it shouldn't be
            // refreshed
            if (!dependents[dependName].keepModule) {
                dependRegexes.push(new RegExp("^::" + dependName + ":"));
            }
        }

        var nameMatch = new RegExp("^::" + this.name + ":");

        while (--i >= 0) {
            var item = modulesKey[i];
            if (nameMatch.exec(item)) {
                fullModList.push(item);
            } else {
                var j = dependRegexes.length;
                while (--j >= 0) {
                    if (dependRegexes[j].exec(item)) {
                        fullModList.push(item);
                        break;
                    }
                }
            }
        }

        // Remove the modules of the dependent plugins from the sandbox.
        fullModList.forEach(function(item) {
            delete sandbox.exports[item];
            delete sandbox.modules[item];
            delete sandbox.usedExports[item];
        });

        // reload the plugin metadata
        var onLoad = function() {
            // actually load the plugin, so that it's ready
            // for any dependent plugins
            this.catalog.loadPlugin(this.name).then(function() {
                // re-register all of the dependent plugins
                for (dependName in dependents) {
                    this.catalog.plugins[dependName].register();
                }

                for (dependName in dependents) {
                    if (dependents[dependName].callPointer) {
                        var parts = _splitPointer(dependName,
                            dependents[dependName].callPointer);
                        var func = _retrieveObject(parts);
                        if (func) {
                            func(reloadDescription);
                        }
                    }
                }

                if (callback) {
                    // at long last, reloading is done.
                    callback();
                }
            }.bind(this));
        }.bind(this);

        // TODO: There should be more error handling then just logging
        // to the command line.
        var onError = function() {
            console.error('Failed to load metadata from ' + this.reloadURL);
        }.bind(this);

        this.catalog.loadMetadataFromURL(this.reloadURL).then(onLoad, onError);
    }
};

var _setPath = function(root, path, value) {
    var segments = path.split('.');
    var current = root;
    var top = segments.length - 1;
    if (top > 0) {
        for (var i = 0; i < top; i++) {
            current = current[segments[i]];
        }
    }
    current[top] = value;
};

exports.Catalog = function() {
    this.points = {};
    this.plugins = {};
    this.metadata = {};

    this.USER_DEACTIVATED = USER_DEACTIVATED;
    this.DEPENDS_DEACTIVATED = DEPENDS_DEACTIVATED;

    // Stores the deactivated plugins. Plugins deactivated by the user have the
    // value USER_DEACTIVATED. If a plugin is deactivated because a required
    // plugin is deactivated, then the value is a DEPENDS_DEACTIVATED.
    this.deactivatedPlugins = {};
    this._extensionsOrdering = [];
    this.instances = {};
    this.instancesLoadPromises = {};
    this._objectDescriptors = {};

    // Stores the child catalogs.
    this.children = [];

    // set up the "extensionpoint" extension point.
    // it indexes on name.
    var ep = this.getExtensionPoint("extensionpoint", true);
    ep.indexOn = "name";
    this.registerMetadata(builtins.metadata);
};

exports.Catalog.prototype = {

    /**
     * Returns true if the extension is shared.
     */
    shareExtension: function(ext) {
        return this.plugins[ext.pluginName].share;
    },

    /**
     * Returns true, if the plugin is loaded (checks if there is a module in the
     * current sandbox).
     */
    isPluginLoaded: function(pluginName) {
        var usedExports = Object.keys(require.sandbox.usedExports);

        return usedExports.some(function(item) {
            return item.indexOf('::' + pluginName + ':') == 0;
        });
    },

    /**
     * Registers information about an instance that will be tracked
     * by the catalog. The first parameter is the name used for looking up
     * the object. The descriptor should contain:
     * - factory (optional): name of the factory extension used to create the
     *                       object. defaults to the same value as the name
     *                       property.
     * - arguments (optional): array that is passed in if the factory is a
     *                      function.
     * - objects (optional): object that describes other objects that are
     *                      required when constructing this one (see below)
     *
     * The objects object defines objects that must be created before this
     * one and how they should be passed in. The key defines how they
     * are passed in, and the value is the name of the object to pass in.
     * You define how they are passed in relative to the arguments
     * array, using a very simple interface of dot separated keys.
     * For example, if you have an arguments array of [null, {foo: null}, "bar"]
     * you can have an object array like this:
     * {
     *  "0": "myCoolObject",
     *  "1.foo": "someOtherObject"
     * }
     *
     * which will result in arguments like this:
     * [myCoolObject, {foo: someOtherObject}, "bar"]
     * where myCoolObject and someOtherObject are the actual objects
     * created elsewhere.
     *
     * If the plugin containing the factory is reloaded, the object will
     * be recreated. The object will also be recreated if objects passed in
     * are reloaded.
     *
     * This method returns nothing and does not actually create the objects.
     * The objects are created via the createObject method and retrieved
     * via the getObject method.
     */
    registerObject: function(name, descriptor) {
        this._objectDescriptors[name] = descriptor;
    },

    /**
     * Stores an object directly in the instance cache. This should
     * not generally be used because reloading cannot work with
     * these objects.
     */
    _setObject: function(name, obj) {
        this.instances[name] = obj;
    },

    /**
     * Creates an object with a previously registered descriptor.
     *
     * Returns a promise that will be resolved (with the created object)
     * once the object has been made. The promise will be resolved
     * immediately if the instance is already there.
     *
     * throws an exception if the object is not registered or if
     * the factory cannot be found.
     */
    createObject: function(name) {
        // console.log("Creating", name);

        // If there is already a loading promise for this instance, then
        // return this one.
        if (this.instancesLoadPromises[name] !== undefined) {
            // console.log("Already have one (it's very nice)");
            return this.instancesLoadPromises[name];
        }

        var descriptor = this._objectDescriptors[name];
        if (descriptor === undefined) {
            throw new Error('Tried to create object "' + name +
                '" but that object is not registered.');
        }

        var factoryName = descriptor.factory || name;
        var ext = this.getExtensionByKey("factory", factoryName);
        if (ext === undefined) {
            throw new Error('When creating object "' + name +
                '", there is no factory called "' + factoryName +
                '" available."');
        }

        // If this is a child catalog and the extension is shared, then
        // as the master/parent catalog to create the object.
        if (this.parent && this.shareExtension(ext)) {
            return this.instancesLoadPromises[name] = this.parent.createObject(name);
        }

        // Otherwise create a new loading promise (which is returned at the
        // end of the function) and create the instance.
        var pr = this.instancesLoadPromises[name] = new Promise();

        var factoryArguments = descriptor.arguments || [];
        var argumentPromises = [];
        if (descriptor.objects) {
            var objects = descriptor.objects;
            for (var key in objects) {
                var objectName = objects[key];
                var ropr = this.createObject(objectName);
                argumentPromises.push(ropr);
                // key is changing, so we need to hang onto the
                // current value
                ropr.location = key;
                ropr.then(function(obj) {
                    _setPath(factoryArguments, ropr.location, obj);
                });
            }
        }

        group(argumentPromises).then(function() {
            ext.load().then(function(factory) {
                // console.log("Got factory for ", name);
                var action = ext.action;
                var obj;

                if (action === "call") {
                    obj = factory.apply(factory, factoryArguments);
                } else if (action === "new") {
                    if (factoryArguments.length > 1) {
                        pr.reject(new Error('For object ' + name + ', create a simple factory function and change the action to call because JS cannot handle this case.'));
                        return;
                    }
                    obj = new factory(factoryArguments[0]);
                } else if (action === "value") {
                    obj = factory;
                } else {
                    pr.reject(new Error("Create action must be call|new|value. " +
                            "Found" + action));
                    return;
                }

                this.instances[name] = obj;
                pr.resolve(obj);
            }.bind(this));
        }.bind(this));

        return pr;
    },

    /**
     * Retrieve a registered object. Returns undefined
     * if the instance has not been created.
     */
    getObject: function(name) {
        return this.instances[name] || (this.parent ? this.parent.getObject(name) : undefined);
    },

    /** Retrieve an extension point object by name, optionally creating it if it
    * does not exist.
    */
    getExtensionPoint: function(name, create) {
        if (create && this.points[name] === undefined) {
            this.points[name] = new exports.ExtensionPoint(name, this);
        }
        return this.points[name];
    },

    /**
     * Retrieve the list of extensions for the named extension point.
     * If none are defined, this will return an empty array.
     */
    getExtensions: function(name) {
        var ep = this.getExtensionPoint(name);
        if (ep === undefined) {
            return [];
        }
        return ep.extensions;
    },

    /**
     * Sets the order of the plugin's extensions. Note that this orders *only*
     * Extensions and nothing else (load order of CSS files e.g.)
     */
    orderExtensions: function(pluginOrder) {
        pluginOrder = pluginOrder || this._extensionsOrdering;

        for (name in this.points) {
            this.points[name].orderExtensions(pluginOrder);
        }
        this._extensionsOrdering = pluginOrder;
    },

    /**
     * Returns the current plugin exentions ordering.
     */
    getExtensionsOrdering: function() {
        return this._extensionsOrdering;
    },

    /**
     * Look up an extension in an indexed extension point by the given key. If
     * the extension point or the key are unknown, undefined will be returned.
     */
    getExtensionByKey: function(name, key) {
        var ep = this.getExtensionPoint(name);
        if (ep === undefined) {
            return undefined;
        }

        return ep.getByKey(key);
    },

    // Topological sort algorithm from Wikipedia, credited to Tarjan 1976.
    //     http://en.wikipedia.org/wiki/Topological_sort
    _toposort: function(metadata) {
        var sorted = [];
        var visited = {};
        var visit = function(key) {
            if (key in visited || !(key in metadata)) {
                return;
            }

            visited[key] = true;
            var depends = metadata[key].dependencies;
            if (!util.none(depends)) {
                for (var dependName in depends) {
                    visit(dependName);
                }
            }

            sorted.push(key);
        };

        for (var key in metadata) {
            visit(key);
        }

        return sorted;
    },

    /**
     * Register new metadata. If the current catalog is not the master catalog,
     * then the master catalog registerMetadata function is called. The master
     * catalog then makes some basic operations on the metadata and calls the
     * _registerMetadata function on all the child catalogs and for itself as
     * well.
     */
    registerMetadata: function(metadata) {
        // If we are the master catalog, then store the metadata.
        if (this.parent) {
            this.parent.registerMetadata(metadata);
        } else {
            for (var pluginName in metadata) {
                var md = metadata[pluginName];
                if (md.errors) {
                    console.error("Plugin ", pluginName, " has errors:");
                    md.errors.forEach(function(error) {
                        console.error(error);
                    });
                    delete metadata[pluginName];
                    continue;
                }

                if (md.dependencies) {
                    md.depends = Object.keys(md.dependencies);
                }

                md.name = pluginName;
                md.version = null;

                var packageId = browser.canonicalPackageId(pluginName);
                if (packageId === null) {
                    browser.register('::' + pluginName, md);
                    continue;
                }
            }

            // Save the new metadata.
            util.mixin(this.metadata, util.clone(metadata, true));

            // Tell every child about the new metadata.
            this.children.forEach(function(child) {
                child._registerMetadata(util.clone(metadata, true));
            });
            // Register the metadata in the master catalog as well.
            this._registerMetadata(util.clone(metadata, true));
        }
    },

    /**
     * Registers plugin metadata. See comments inside of the function.
     */
    _registerMetadata: function(metadata) {
        var pluginName, plugin;
        var plugins = this.plugins;

        this._toposort(metadata).forEach(function(name) {
            // If the plugin is already registered.
            if (this.plugins[name]) {
                // Check if the plugin is loaded.
                if (this.isPluginLoaded(name)) {
                    // If the plugin is loaded, then the metadata/plugin/extensions
                    // have to stay the way they are at the moment.
                    return;
                } else {
                    // If the plugin is not loaded and the plugin is already
                    // registerd, then remove the plugin.
                    //
                    // Reason: As new metadata arrives, this might also mean,
                    // that the factory in the tiki.loader has changed. If the
                    // old plugins/extensions would stay, they might not fit to
                    // the new factory. As such, the plugin has to be updated,
                    // which is achieved by unregister the plugin and then add it
                    // later in this function again.
                    var plugin = this.plugins[name];
                    plugin.unregister();
                }
            }

            var md = metadata[name];
            var activated = !(this.deactivatedPlugins[name]);

            // Check if all plugins this one depends on are activated as well.
            if (activated && md.depends && md.depends.length != 0) {
                var works = md.depends.some(function(name) {
                    return !(this.deactivatedPlugins[name]);
                }, this);
                // At least one depending plugin is not activated -> this plugin
                // can't be activated. Mark this plugin as deactivated.
                if (!works) {
                    this.deactivatedPlugins[name] = DEPENDS_DEACTIVATED;
                    activated = false;
                }
            }

            md.catalog = this;
            md.name = name;
            plugin = new exports.Plugin(md);
            plugins[name] = plugin;

            // Skip if the plugin is not activated.
            if (md.provides) {
                var provides = md.provides;
                for (var i = 0; i < provides.length; i++) {
                    var extension = new exports.Extension(provides[i]);
                    extension.pluginName = name;
                    provides[i] = extension;

                    var epname = extension.ep;
                    // This special treatment is required for the extension point
                    // definition. TODO: Refactor the code so that this is no
                    // longer necessary.
                    if (epname == "extensionpoint" && extension.name == 'extensionpoint') {
                        exports.registerExtensionPoint(extension, this, false);
                    } else {
                        // Only register the extension if the plugin is activated.
                        // TODO: This should handle extension points and
                        if (activated) {
                            var ep = this.getExtensionPoint(extension.ep, true);
                            ep.register(extension);

                        // Even if the plugin is deactivated, the ep need to
                        // be registered. Call the registerExtensionPoint
                        // function manually, but pass as third argument 'true'
                        // which indicates, that the plugin is deactivated and
                        // prevents the handlers on the ep to get registered.
                        } else if (epname == "extensionpoint") {
                            exports.registerExtensionPoint(extension, this, true);
                        }
                    }
                }
            } else {
                md.provides = [];
            }
        }, this);

        for (pluginName in metadata) {
            this._checkLoops(pluginName, plugins, []);
        }

        this.orderExtensions();
    },

    /**
     * Loads the named plugin, returning a promise called
     * when the plugin is loaded. This function is a convenience
     * for unusual situations and debugging only. Generally,
     * you should load plugins by calling load() on an Extension
     * object.
     */
    loadPlugin: function(pluginName) {
        var pr = new Promise();
        var plugin = this.plugins[pluginName];
        if (plugin.objects) {
            var objectPromises = [];
            plugin.objects.forEach(function(objectName) {
                objectPromises.push(this.createObject(objectName));
            }.bind(this));
            group(objectPromises).then(function() {
                require.ensurePackage(pluginName, function() {
                    pr.resolve();
                });
            });
        } else {
            require.ensurePackage(pluginName, function(err) {
                if (err) {
                    pr.reject(err);
                } else {
                    pr.resolve();
                }
            });
        }
        return pr;
    },

    /**
     * Retrieve metadata from the server. Returns a promise that is
     * resolved when the metadata has been loaded.
     */
    loadMetadataFromURL: function(url, type) {
        var pr = new Promise();
        proxy.xhr('GET', url, true).then(function(response) {
            this.registerMetadata(JSON.parse(response));
            pr.resolve();
        }.bind(this), function(err) {
            pr.reject(err);
        });

        return pr;
    },

    /**
     * Dactivates a plugin. If no plugin was deactivated, then a string is
     * returned which contains the reason why deactivating was not possible.
     * Otherwise the plugin is deactivated as well as all plugins that depend on
     * this plugin and a array is returned holding all depending plugins that were
     * deactivated.
     *
     * @param pluginName string Name of the plugin to deactivate
     * @param recursion boolean True if the funciton is called recursive.
     */
    deactivatePlugin: function(pluginName, recursion) {
        var plugin = this.plugins[pluginName];
        if (!plugin) {
            // Deactivate the plugin only if the user called the function.
            if (!recursion) {
                this.deactivatedPlugins[pluginName] = USER_DEACTIVATED;
            }
            return 'There is no plugin named "' + pluginName + '" in this catalog.';
        }

        if (this.deactivatedPlugins[pluginName]) {
            // If the plugin is already deactivated but the user explicip wants
            // to deactivate the plugin, then store true as deactivation reason.
            if (!recursion) {
                this.deactivatedPlugins[pluginName] = USER_DEACTIVATED;
            }
            return 'The plugin "' + pluginName + '" is already deactivated';
        }

        // If the function is called within a recursion, then mark the plugin
        // as DEPENDS_DEACTIVATED otherwise as USER_DEACTIVATED.
        this.deactivatedPlugins[pluginName] = (recursion ? DEPENDS_DEACTIVATED
                                                          : USER_DEACTIVATED);

        // Get all plugins that depend on this plugin.
        var dependents = {};
        var deactivated = [];
        plugin._findDependents(Object.keys(this.plugins), dependents, true);

        // Deactivate all dependent plugins.
        Object.keys(dependents).forEach(function(plugin) {
            var ret = this.deactivatePlugin(plugin, true);
            if (Array.isArray(ret)) {
                deactivated = deactivated.concat(ret);
            }
        }, this);

        // Deactivate this plugin.
        plugin.unregister();

        if (recursion) {
            deactivated.push(pluginName);
        }

        return deactivated;
    },

    /**
     * Activates a plugin. If the plugin can't be activated a string is returned
     * explaining why. Otherwise the plugin is activated, all plugins that depend
     * on this plugin are tried to activated and an array with all the activated
     * depending plugins is returned.
     * Note: Depending plugins are not activated if they user called
     * deactivatePlugin on them to deactivate them explicit.
     *
     * @param pluginName string Name of the plugin to activate.
     * @param recursion boolean True if the funciton is called recursive.
     */
    activatePlugin: function(pluginName, recursion) {
        var plugin = this.plugins[pluginName];
        if (!plugin) {
            return 'There is no plugin named "' + pluginName + '" in this catalog.';
        }

        if (!this.deactivatedPlugins[pluginName]) {
            return 'The plugin "' + pluginName + '" is already activated';
        }

        // Don't activate this plugin if the user explicip deactivated this one
        // and the plugin activation call is called beacuse another plugin
        // this one depended on was activated.
        if (recursion && this.deactivatedPlugins[pluginName] === USER_DEACTIVATED) {
            return;
        }

        // Check if all dependent plugins are activated.
        if (plugin.depends && plugin.depends.length != 0) {
            var works = plugin.depends.some(function(plugin) {
                return !this.deactivatedPlugins[plugin];
            }, this);

            if (!works) {
                // The user activated the plugin but some of the dependent
                // plugins are still deactivated. Change the deactivation reason
                // to DEPENDS_DEACTIVATED.
                this.deactivatedPlugins[pluginName] = DEPENDS_DEACTIVATED;
                return 'Can not activate plugin "' + pluginName +
                        '" as some of its dependent plugins are not activated';
            }
        }

        // Activate this plugin.
        plugin.register();
        this.orderExtensions();
        delete this.deactivatedPlugins[pluginName];

        // Try to activate all the plugins that depend on this one.
        var activated = [];
        var dependents = {};
        plugin._findDependents(Object.keys(this.plugins), dependents, true);
        Object.keys(dependents).forEach(function(pluginName) {
            var ret = this.activatePlugin(pluginName, true);
            if (Array.isArray(ret)) {
                activated = activated.concat(ret);
            }
        }, this);

        if (recursion) {
            activated.push(pluginName);
        }

        return activated;
    },

    /**
     * Removes a plugin, unregistering it and cleaning up.
     */
    removePlugin: function(pluginName) {
        var plugin = this.plugins[pluginName];
        if (plugin == undefined) {
            throw new Error("Attempted to remove plugin " + pluginName
                                            + " which does not exist.");
        }

        plugin.unregister();
        plugin._cleanup(true /* leaveLoader */);
        delete this.metadata[pluginName];
        delete this.plugins[pluginName];
    },

    /**
     * for the given plugin, get the first part of the URL required to
     * get at that plugin's resources (images, etc.).
     */
    getResourceURL: function(pluginName) {
        var link = document.getElementById("bespin_base");
        var base = "";
        if (link) {
            base += link.href;
            if (!util.endsWith(base, "/")) {
                base += "/";
            }
        }
        var plugin = this.plugins[pluginName];
        if (plugin == undefined) {
            return undefined;
        }
        return base + plugin.resourceURL;
    },

    /**
     * Check the dependency graph to ensure we don't have cycles.
     */
    _checkLoops: function(pluginName, data, trail) {
        var circular = false;
        trail.forEach(function(node) {
            if (pluginName === node) {
                console.error("Circular dependency", pluginName, trail);
                circular = true;
            }
        });
        if (circular) {
            return true;
        }
        trail.push(pluginName);
        if (!data[pluginName]) {
            console.error("Missing metadata for ", pluginName);
        } else {
            if (data[pluginName].dependencies) {
                for (var dependency in data[pluginName].dependencies) {
                    var trailClone = trail.slice();
                    var errors = this._checkLoops(dependency, data, trailClone);
                    if (errors) {
                        console.error("Errors found when looking at ", pluginName);
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /**
     * Retrieve an array of the plugin objects.
     * The opts object can include the following options:
     * onlyType (string): only include plugins of this type
     * sortBy (array): list of keys to sort by (the primary sort is first).
     *                 default is sorted alphabetically by name.
     */
    getPlugins: function(opts) {
        var result = [];
        var onlyType = opts.onlyType;

        for (var key in this.plugins) {
            var plugin = this.plugins[key];

            // apply the filter
            if ((onlyType && plugin.type && plugin.type != onlyType)
                || plugin.name == "bespin") {
                continue;
            }

            result.push(plugin);
        }

        var sortBy = opts.sortBy;
        if (!sortBy) {
            sortBy = ["name"];
        }

        var sortfunc = function(a, b) {
            for (var i = 0; i < sortBy.length; i++) {
                key = sortBy[i];
                if (a[key] < b[key]) {
                    return -1;
                } else if (b[key] < a[key]) {
                    return 1;
                }
            }
            return 0;
        };

        result.sort(sortfunc);
        return result;
    },

    /**
     * Returns a promise to retrieve the object at the given property path,
     * loading the plugin if necessary.
     */
    loadObjectForPropertyPath: function(path, context) {
        var promise = new Promise();
        var parts = /^([^:]+):([^#]+)#(.*)$/.exec(path);
        if (parts === null) {
            throw new Error("loadObjectForPropertyPath: malformed path: '" +
                path + "'");
        }

        var pluginName = parts[1];
        if (pluginName === "") {
            if (util.none(context)) {
                throw new Error("loadObjectForPropertyPath: no plugin name " +
                    "supplied and no context is present");
            }

            pluginName = context;
        }

        require.ensurePackage(pluginName, function() {
            promise.resolve(this.objectForPropertyPath(path));
        }.bind(this));

        return promise;
    },

    /**
     * Finds the object for the passed path or array of path components.  This is
     * the standard method used in SproutCore to traverse object paths.
     * @param path {String} the path
     * @param root {Object} optional root object.  window is used otherwise
     * @param stopAt {Integer} optional point to stop searching the path.
     * @returns {Object} the found object or undefined.
     */
    objectForPropertyPath: function(path, root, stopAt) {
        stopAt = (stopAt == undefined) ? path.length : stopAt;
        if (!root) {
            root = window;
        }

        var hashed = path.split("#");
        if (hashed.length !== 1) {
            var module = require(hashed[0]);
            if (module === undefined) {
                return undefined;
            }

            path = hashed[1];
            root = module;
            stopAt = stopAt - hashed[0].length;
        }

        var loc = 0;
        while (root && loc < stopAt) {
            var nextDotAt = path.indexOf('.', loc);
            if (nextDotAt < 0 || nextDotAt > stopAt) {
                nextDotAt = stopAt;
            }
            var key = path.slice(loc, nextDotAt);
            root = root[key];
            loc = nextDotAt + 1;
        }

        if (loc < stopAt) {
            root = undefined; // hit a dead end. :(
        }

        return root;
    },

    /**
     * Publish <tt>value</tt> to all plugins that match both <tt>ep</tt> and
     * <tt>key</tt>.
     * @param source {object} The source calling the publish function.
     * @param epName {string} An extension point (indexed by the catalog) to which
     * we publish the information.
     * @param key {string} A key to which we publish (linearly searched, allowing
     * for regex matching).
     * @param value {object} The data to be passed to the subscribing function.
     */
    publish: function(source, epName, key, value) {
        var ep = this.getExtensionPoint(epName);

        if (this.shareExtension(ep)) {
            if (this.parent) {
                this.parent.publish(source, epName, key, value);
            } else {
                this.children.forEach(function(child) {
                    child._publish(source, epName, key, value);
                });
                this._publish(source, epName, key, value);
            }
        } else {
            this._publish(source, epName, key, value);
        }
    },

    _publish: function(source, epName, key, value) {
        var subscriptions = this.getExtensions(epName);
        subscriptions.forEach(function(sub) {
            // compile regexes only once
            if (sub.match && !sub.regexp) {
                sub.regexp = new RegExp(sub.match);
            }
            if (sub.regexp && sub.regexp.test(key)
                    || sub.key === key
                    || (util.none(sub.key) && util.none(key))) {
                sub.load().then(function(handler) {
                    handler(source, key, value);
                });
            }
        });
    },

    /**
     * The subscribe side of #publish for use when the object which will
     * publishes is created dynamically.
     * @param ep The extension point name to subscribe to
     * @param metadata An object containing:
     * <ul>
     * <li>pointer: A function which should be called on matching publish().
     * This can also be specified as a pointer string, however if you can do
     * that, you should be placing the metadata in package.json.
     * <li>key: A string that exactly matches the key passed to the publish()
     * function. For smarter matching, you can use 'match' instead...
     * <li>match: A regexp to be used in place of key
     * </ul>
     */
    registerExtension: function(ep, metadata) {
        var extension = new exports.Extension(metadata);
        extension.pluginName = '__dynamic';
        this.getExtensionPoint(ep).register(extension);
    }
};

/**
 * Register handler for extension points.
 * The argument `deactivated` is set to true or false when this method is called
 * by the _registerMetadata function.
 */
exports.registerExtensionPoint = function(extension, catalog, deactivated) {
    var ep = catalog.getExtensionPoint(extension.name, true);
    ep.description = extension.description;
    ep.pluginName = extension.pluginName;
    ep.params = extension.params;
    if (extension.indexOn) {
        ep.indexOn = extension.indexOn;
    }

    if (!deactivated && (extension.register || extension.unregister)) {
        exports.registerExtensionHandler(extension, catalog);
    }
};

/**
 * Register handler for extension handler.
 */
exports.registerExtensionHandler = function(extension, catalog) {
    // Don't add the extension handler if there is a master/partent catalog
    // and this plugin is shared. The extension handlers are only added
    // inside of the master catalog.
    if (catalog.parent && catalog.shareExtension(extension)) {
        return;
    }

    var ep = catalog.getExtensionPoint(extension.name, true);
    ep.handlers.push(extension);
    if (extension.register) {
        // Store the current extensions to this extension point. We can't
        // use the ep.extensions array within the load-callback-function, as
        // the array at that point in time also contains extensions that got
        // registered by calling the handler.register function directly.
        // As such, using the ep.extensions in the load-callback-function
        // would result in calling the handler's register function on a few
        // extensions twice.
        var extensions = util.clone(ep.extensions);

        extension.load(function(register) {
            if (!register) {
                throw extension.name + " is not ready";
            }
            extensions.forEach(function(ext) {
                // console.log('call register on:', ext)
                register(ext, catalog);
            });
        }, "register", catalog);
    }
};

/**
 * Unregister handler for extension point.
 */
exports.unregisterExtensionPoint = function(extension, catalog) {
    // Note: When an extensionPoint is unregistered, the extension point itself
    // stays but the handler goes away.
    // DISCUSS: Is this alright? The other option is to remove the ep completly.
    // The downside of this is, that when the ep arrives later again, it has
    // to look for extension handlers bound to this ep and add them all again.
    if (extension.register || extension.unregister) {
        exports.unregisterExtensionHandler(extension);
    }
};

/**
 * Unregister handler for extension handler.
 */
exports.unregisterExtensionHandler = function(extension, catalog) {
    // Don't remove the extension handler if there is a master/partent catalog
    // and this plugin is shared. The extension handlers are only added
    // inside of the master catalog.
    if (catalog.parent && catalog.shareExtension(extension)) {
        return;
    }

    var ep = catalog.getExtensionPoint(extension.name, true);
    if (ep.handlers.indexOf(extension) == -1) {
        return;
    }
    ep.handlers.splice(ep.handlers.indexOf(extension), 1);
    if (extension.unregister) {
        // Store the current extensions to this extension point. We can't
        // use the ep.extensions array within the load-callback-function, as
        // the array at that point in time also contains extensions that got
        // registered by calling the handler.register function directly.
        // As such, using the ep.extensions in the load-callback-function
        // would result in calling the handler's register function on a few
        // extensions twice.
        var extensions = util.clone(ep.extensions);

        extension.load(function(unregister) {
            if (!unregister) {
                throw extension.name + " is not ready";
            }
            extensions.forEach(function(ext) {
                // console.log('call register on:', ext)
                unregister(ext);
            });
        }, "unregister");
    }
};

exports.catalog = new exports.Catalog();

var _removeFromList = function(regex, array, matchFunc) {
    var i = 0;
    while (i < array.length) {
        if (regex.exec(array[i])) {
            var item = array.splice(i, 1);
            if (matchFunc) {
                matchFunc(item);
            }
            continue;
        }
        i++;
    }
};

var _removeFromObject = function(regex, obj) {
    var keys = Object.keys(obj);
    var i = keys.length;
    while (--i > 0) {
        if (regex.exec(keys[i])) {
            delete obj[keys[i]];
        }
    }
};

exports.getUserPlugins = function() {
    return exports.catalog.getPlugins({ onlyType: 'user' });
};

});

bespin.tiki.module("bespin:globals",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
* Installs ES5 and SproutCore monkeypatches as needed.
*/
var installGlobals = function() {
    /**
     * Array detector.
     * Firefox 3.5 and Safari 4 have this already. Chrome 4 however ...
     * Note to Dojo - your isArray is still broken: instanceof doesn't work with
     * Arrays taken from a different frame/window.
     */
    if (!Array.isArray) {
        Array.isArray = function(data) {
            return (data && Object.prototype.toString.call(data) == "[object Array]");
        };
    }

    /**
     * Retrieves the list of keys on an object.
     */
    if (!Object.keys) {
        Object.keys = function(obj) {
            var k, ret = [];
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    ret.push(k);
                }
            }
            return ret;
        };
    }

    if (!Function.prototype.bind) {
        // From Narwhal
        Function.prototype.bind = function () {
            var args = Array.prototype.slice.call(arguments);
            var self = this;
            var bound = function () {
                return self.call.apply(
                    self,
                    args.concat(
                        Array.prototype.slice.call(arguments)
                    )
                );
            };
            bound.name = this.name;
            bound.displayName = this.displayName;
            bound.length = this.length;
            bound.unbound = self;
            return bound;
        };
    }
};

// Narwhal's shim for ES5 defineProperty

// ES5 15.2.3.6
if (!Object.defineProperty) {
    Object.defineProperty = function(object, property, descriptor) {
        var has = Object.prototype.hasOwnProperty;
        if (typeof descriptor == "object" && object.__defineGetter__) {
            if (has.call(descriptor, "value")) {
                if (!object.__lookupGetter__(property) && !object.__lookupSetter__(property)) {
                    // data property defined and no pre-existing accessors
                    object[property] = descriptor.value;
                }
                if (has.call(descriptor, "get") || has.call(descriptor, "set")) {
                    // descriptor has a value property but accessor already exists
                    throw new TypeError("Object doesn't support this action");
                }
            }
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
            !(has.call(descriptor, "writable") ? descriptor.writable : true) ||
            !(has.call(descriptor, "enumerable") ? descriptor.enumerable : true) ||
            !(has.call(descriptor, "configurable") ? descriptor.configurable : true)
            )
            throw new RangeError(
            "This implementation of Object.defineProperty does not " +
            "support configurable, enumerable, or writable."
            );
            */
            else if (typeof descriptor.get == "function") {
                object.__defineGetter__(property, descriptor.get);
            }
            if (typeof descriptor.set == "function") {
                object.__defineSetter__(property, descriptor.set);
            }
        }
        return object;
    };
}

// ES5 15.2.3.7
if (!Object.defineProperties) {
    Object.defineProperties = function(object, properties) {
        for (var property in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, property)) {
                Object.defineProperty(object, property, properties[property]);
            }
        }
        return object;
    };
}



installGlobals();

});
;bespin.tiki.register("::underscore", {
    name: "underscore",
    dependencies: {  }
});
bespin.tiki.module("underscore:index",function(require,exports,module) {
// Underscore.js
// (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the terms of the MIT license.
// Portions of Underscore are inspired by or borrowed from Prototype.js,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore

"define metadata";
({
    "description": "Functional Programming Aid for Javascript. Works well with jQuery."
});
"end";

(function() {
  // ------------------------- Baseline setup ---------------------------------

  // Establish the root object, "window" in the browser, or "global" on the server.
  var root = this;

  // Save the previous value of the "_" variable.
  var previousUnderscore = root._;

  // Establish the object that gets thrown to break out of a loop iteration.
  var breaker = typeof StopIteration !== 'undefined' ? StopIteration : '__break__';

  // Quick regexp-escaping function, because JS doesn't have RegExp.escape().
  var escapeRegExp = function(s) { return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1'); };

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice                 = ArrayProto.slice,
      unshift               = ArrayProto.unshift,
      toString              = ObjProto.toString,
      hasOwnProperty        = ObjProto.hasOwnProperty,
      propertyIsEnumerable  = ObjProto.propertyIsEnumerable;

  // All ECMA5 native implementations we hope to use are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for CommonJS.
  if (typeof exports !== 'undefined') exports._ = _;

  // Export underscore to global scope.
  root._ = _;

  // Current version.
  _.VERSION = '1.0.2';

  // ------------------------ Collection Functions: ---------------------------

  // The cornerstone, an each implementation.
  // Handles objects implementing forEach, arrays, and raw objects.
  // Delegates to JavaScript 1.6's native forEach if available.
  var each = _.forEach = function(obj, iterator, context) {
    try {
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (_.isNumber(obj.length)) {
        for (var i = 0, l = obj.length; i < l; i++) iterator.call(context, obj[i], i, obj);
      } else {
        for (var key in obj) {
          if (hasOwnProperty.call(obj, key)) iterator.call(context, obj[key], key, obj);
        }
      }
    } catch(e) {
      if (e != breaker) throw e;
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to JavaScript 1.6's native map if available.
  _.map = function(obj, iterator, context) {
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    var results = [];
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  // Reduce builds up a single result from a list of values, aka inject, or foldl.
  // Delegates to JavaScript 1.8's native reduce if available.
  _.reduce = function(obj, memo, iterator, context) {
    if (nativeReduce && obj.reduce === nativeReduce) return obj.reduce(_.bind(iterator, context), memo);
    each(obj, function(value, index, list) {
      memo = iterator.call(context, memo, value, index, list);
    });
    return memo;
  };

  // The right-associative version of reduce, also known as foldr. Uses
  // Delegates to JavaScript 1.8's native reduceRight if available.
  _.reduceRight = function(obj, memo, iterator, context) {
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) return obj.reduceRight(_.bind(iterator, context), memo);
    var reversed = _.clone(_.toArray(obj)).reverse();
    return _.reduce(reversed, memo, iterator, context);
  };

  // Return the first value which passes a truth test.
  _.detect = function(obj, iterator, context) {
    var result;
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        _.breakLoop();
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to JavaScript 1.6's native filter if available.
  _.filter = function(obj, iterator, context) {
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    var results = [];
    each(obj, function(value, index, list) {
      iterator.call(context, value, index, list) && results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    each(obj, function(value, index, list) {
      !iterator.call(context, value, index, list) && results.push(value);
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to JavaScript 1.6's native every if available.
  _.every = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    var result = true;
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) _.breakLoop();
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to JavaScript 1.6's native some if available.
  _.some = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    var result = false;
    each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) _.breakLoop();
    });
    return result;
  };

  // Determine if a given value is included in the array or object using '==='.
  _.include = function(obj, target) {
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    var found = false;
    each(obj, function(value) {
      if (found = value === target) _.breakLoop();
    });
    return found;
  };

  // Invoke a method with arguments on every item in a collection.
  _.invoke = function(obj, method) {
    var args = _.rest(arguments, 2);
    return _.map(obj, function(value) {
      return (method ? value[method] : value).apply(value, args);
    });
  };

  // Convenience version of a common use case of map: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum item or (item-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator = iterator || _.identity;
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return iterable;
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // -------------------------- Array Functions: ------------------------------

  // Get the first element of an array. Passing "n" will return the first N
  // values in the array. Aliased as "head". The "guard" check allows it to work
  // with _.map.
  _.first = function(array, n, guard) {
    return n && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as "tail".
  // Especially useful on the arguments object. Passing an "index" will return
  // the rest of the values in the array from that index onward. The "guard"
   //check allows it to work with _.map.
  _.rest = function(array, index, guard) {
    return slice.call(array, _.isUndefined(index) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, [], function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo.push(value);
      return memo;
    });
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    var values = _.rest(arguments);
    return _.filter(array, function(value){ return !_.include(values, value); });
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  _.uniq = function(array, isSorted) {
    return _.reduce(array, [], function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo.push(el);
      return memo;
    });
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersect = function(array) {
    var rest = _.rest(arguments);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = _.toArray(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, String(i));
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, MSIE),
  // we need this function. Return the position of the first occurence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to JavaScript 1.8's native indexOf if available.
  _.indexOf = function(array, item) {
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (var i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to JavaScript 1.6's native lastIndexOf if available.
  _.lastIndexOf = function(array, item) {
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python range() function. See:
  // http://docs.python.org/library/functions.html#range
  _.range = function(start, stop, step) {
    var a     = _.toArray(arguments);
    var solo  = a.length <= 1;
    var start = solo ? 0 : a[0], stop = solo ? a[0] : a[1], step = a[2] || 1;
    var len   = Math.ceil((stop - start) / step);
    if (len <= 0) return [];
    var range = new Array(len);
    for (var i = start, idx = 0; true; i += step) {
      if ((step > 0 ? i - stop : stop - i) >= 0) return range;
      range[idx++] = i;
    }
  };

  // ----------------------- Function Functions: ------------------------------

  // Create a function bound to a given object (assigning 'this', and arguments,
  // optionally). Binding with arguments is also known as 'curry'.
  _.bind = function(func, obj) {
    var args = _.rest(arguments, 2);
    return function() {
      return func.apply(obj || {}, args.concat(_.toArray(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = _.rest(arguments);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = _.rest(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(_.rest(arguments)));
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(_.toArray(arguments));
      return wrapper.apply(wrapper, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = _.toArray(arguments);
    return function() {
      var args = _.toArray(arguments);
      for (var i=funcs.length-1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // ------------------------- Object Functions: ------------------------------

  // Retrieve the names of an object's properties.
  // Delegates to ECMA5's native Object.keys
  _.keys = nativeKeys || function(obj) {
    if (_.isArray(obj)) return _.range(0, obj.length);
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  _.functions = function(obj) {
    return _.filter(_.keys(obj), function(key){ return _.isFunction(obj[key]); }).sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(_.rest(arguments), function(source) {
      for (var prop in source) obj[prop] = source[prop];
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (_.isArray(obj)) return obj.slice(0);
    return _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return true;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return !!(obj && obj.concat && obj.unshift && !obj.callee);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return obj && obj.callee;
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return (obj === +obj) || (toString.call(obj) === '[object Number]');
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is the given value NaN -- this one is interesting. NaN != NaN, and
  // isNaN(undefined) == true, so we make sure it's a number first.
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return typeof obj == 'undefined';
  };

  // -------------------------- Utility Functions: ----------------------------

  // Run Underscore.js in noConflict mode, returning the '_' variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function n times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Break out of the middle of an iteration.
  _.breakLoop = function() {
    throw breaker;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    start       : '<%',
    end         : '%>',
    interpolate : /<%=(.+?)%>/g
  };

  // JavaScript templating a-la ERB, pilfered from John Resig's
  // "Secrets of the JavaScript Ninja", page 83.
  // Single-quote fix from Rick Strahl's version.
  // With alterations for arbitrary delimiters.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var endMatch = new RegExp("'(?=[^"+c.end.substr(0, 1)+"]*"+escapeRegExp(c.end)+")","g");
    var fn = new Function('obj',
      'var p=[],print=function(){p.push.apply(p,arguments);};' +
      'with(obj){p.push(\'' +
      str.replace(/[\r\t\n]/g, " ")
         .replace(endMatch,"\t")
         .split("'").join("\\'")
         .split("\t").join("'")
         .replace(c.interpolate, "',$1,'")
         .split(c.start).join("');")
         .split(c.end).join("p.push('")
         + "');}return p.join('');");
    return data ? fn(data) : fn;
  };

  // ------------------------------- Aliases ----------------------------------

  _.each     = _.forEach;
  _.foldl    = _.inject       = _.reduce;
  _.foldr    = _.reduceRight;
  _.select   = _.filter;
  _.all      = _.every;
  _.any      = _.some;
  _.head     = _.first;
  _.tail     = _.rest;
  _.methods  = _.functions;

  // ------------------------ Setup the OOP Wrapper: --------------------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = _.toArray(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();

exports._.noConflict();
});
;bespin.tiki.register("::worker_manager", {
    name: "worker_manager",
    dependencies: { "canon": "0.0.0", "events": "0.0.0", "underscore": "0.0.0" }
});
bespin.tiki.module("worker_manager:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "description": "Manages a web worker on the browser side",
    "dependencies": {
        "canon": "0.0.0",
        "events": "0.0.0",
        "underscore": "0.0.0"
    },
    "provides": [
        {
            "ep": "command",
            "name": "worker",
            "description": "Low-level web worker control (for plugin development)"
        },
        {
            "ep": "command",
            "name": "worker restart",
            "description": "Restarts all web workers (for plugin development)",
            "pointer": "#workerRestartCommand"
        }
    ]
});
"end";

if (window == null) {
    throw new Error('The "worker_manager" plugin can only be loaded in the ' +
        'browser, not a web worker. Use "worker" instead.');
}

var proxy = require('bespin:proxy');
var plugins = require('bespin:plugins');
var console = require('bespin:console').console;
var _ = require('underscore')._;
var Event = require('events').Event;
var Promise = require('bespin:promise').Promise;
var env = require('environment').env;

var workerManager = {
    _workers: [],

    add: function(workerSupervisor) {
        this._workers.push(workerSupervisor);
    },

    remove: function(workerSupervisor) {
        this._workers = _(this._workers).without(workerSupervisor);
    },

    restartAll: function() {
        var workers = this._workers;
        _(workers).invoke('kill');
        _(workers).invoke('start');
    }
};

function WorkerSupervisor(pointer) {
    var m = /^([^#:]+)(?::([^#:]+))?#([^#:]+)$/.exec(pointer);
    if (m == null) {
        throw new Error('WorkerSupervisor: invalid pointer specification: "' +
            pointer + '"');
    }

    var packageId = m[1], target = m[3];
    var moduleId = packageId + ":" + (m[2] != null ? m[2] : "index");
    var base = bespin != null && bespin.base != null ? bespin.base : "";

    this._packageId = packageId;
    this._moduleId = moduleId;
    this._base = base;
    this._target = target;

    this._worker = null;
    this._currentId = 0;

    this.started = new Event();
}

WorkerSupervisor.prototype = {
    _onError: function(ev) {
        this._worker = null;
        workerManager.remove(this);

        console.error("WorkerSupervisor: worker failed at file " +
            ev.filename + ":" + ev.lineno + "; fix the worker and use " +
            "'worker restart' to restart it");
    },

    _onMessage: function(ev) {
        var msg = JSON.parse(ev.data);
        switch (msg.op) {
        case 'finish':
            if (msg.id === this._currentId) {
                var promise = this._promise;

                // We have to set the promise to null first, in case the user's
                // then() handler on the promise decides to send another
                // message to the object.
                this._promise = null;

                promise.resolve(msg.result);
            }
            break;

        case 'log':
            console[msg.method].apply(console, msg.args);
            break;
        }
    },

    _promise: null,

    /** An event that fires whenever the worker is started or restarted. */
    started: null,

    /**
     * Terminates the worker. After this call, the worker can be restarted via
     * a call to start().
     */
    kill: function() {
        var oldPromise = this._promise;
        if (oldPromise != null) {
            oldPromise.reject("killed");
            this._promise = null;
        }

        this._worker.terminate();
        this._worker = null;
        workerManager.remove(this);
    },

    /**
     * Invokes a method on the target running in the worker and returns a
     * promise that will resolve to the result of that method.
     */
    send: function(method, args) {
        var oldPromise = this._promise;
        if (oldPromise != null) {
            oldPromise.reject("interrupted");
            this._currentId++;
        }

        var id = this._currentId;
        var promise = new Promise();
        this._promise = promise;

        var msg = { op: 'invoke', id: id, method: method, args: args };
        this._worker.postMessage(JSON.stringify(msg));

        return promise;
    },

    /**
     * Starts the worker. Immediately after this method is called, the
     * "started" event will fire.
     */
    start: function() {
        if (this._worker != null) {
            throw new Error("WorkerSupervisor: worker already started");
        }

        var base = this._base, target = this._target;
        var packageId = this._packageId, moduleId = this._moduleId;

        var worker = new proxy.Worker(base + "BespinEmbedded.js");

        worker.onmessage = this._onMessage.bind(this);
        worker.onerror = this._onError.bind(this);

        var msg = {
            op:     'load',
            base:   base,
            pkg:    packageId,
            module: moduleId,
            target: target
        };
        worker.postMessage(JSON.stringify(msg));

        this._worker = worker;
        this._currentId = 0;

        workerManager.add(this);

        this.started();
    }
};

function workerRestartCommand(args, req) {
    workerManager.restartAll();
}

exports.WorkerSupervisor = WorkerSupervisor;
exports.workerManager = workerManager;
exports.workerRestartCommand = workerRestartCommand;


});
;bespin.tiki.register("::events", {
    name: "events",
    dependencies: { "traits": "0.0.0" }
});
bespin.tiki.module("events:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

exports.Event = function() {
    var handlers = [];
    var evt = function() {
        var args = arguments;
        handlers.forEach(function(handler) { handler.func.apply(null, args); });
    };

    /**
     * Adds a new handler via
     *  a) evt.add(handlerFunc)
     *  b) evt.add(reference, handlerFunc)
     */
    evt.add = function() {
        if (arguments.length == 1) {
            handlers.push({
                ref: arguments[0],
                func: arguments[0]
            });
        } else {
            handlers.push({
                ref: arguments[0],
                func: arguments[1]
            });
        }
    };

    evt.remove = function(ref) {
        var notEqual = function(other) { return ref !== other.ref; };
        handlers = handlers.filter(notEqual);
    };

    evt.removeAll = function() {
        handlers = [];
    };

    return evt;
};


});
;bespin.tiki.register("::types", {
    name: "types",
    dependencies: {  }
});
bespin.tiki.module("types:types",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Promise = require('bespin:promise').Promise;

/**
 * Get the simple text-only, no-param version of a typeSpec.
 */
exports.getSimpleName = function(typeSpec) {
    if (!typeSpec) {
        throw new Error('null|undefined is not a valid typeSpec');
    }

    if (typeof typeSpec == 'string') {
        return typeSpec;
    }

    if (typeof typeSpec == 'object') {
        if (!typeSpec.name) {
            throw new Error('Missing name member to typeSpec');
        }

        return typeSpec.name;
    }

    throw new Error('Not a typeSpec: ' + typeSpec);
};

/**
 * 2 typeSpecs are considered equal if their simple names are the same.
 */
exports.equals = function(typeSpec1, typeSpec2) {
    return exports.getSimpleName(typeSpec1) == exports.getSimpleName(typeSpec2);
};

/**
 * A deferred type is one where we hope to find out what the type is just
 * in time to use it. For example the 'set' command where the type of the 2nd
 * param is defined by the 1st param.
 * @param typeSpec An object type spec with name = 'deferred' and a pointer
 * which to call through catalog.loadObjectForPropertyPath (passing in the
 * original typeSpec as a parameter). This function is expected to return either
 * a new typeSpec, or a promise of a typeSpec.
 * @returns A promise which resolves to the new type spec from the pointer.
 */
exports.undeferTypeSpec = function(typeSpec) {
    // Deferred types are specified by the return from the pointer
    // function.
    var promise = new Promise();
    if (!typeSpec.pointer) {
        promise.reject(new Error('Missing deferred pointer'));
        return promise;
    }

    catalog.loadObjectForPropertyPath(typeSpec.pointer).then(function(obj) {
        var reply = obj(typeSpec);
        if (typeof reply.then === 'function') {
            reply.then(function(newTypeSpec) {
                promise.resolve(newTypeSpec);
            }, function(ex) {
                promise.reject(ex);
            });
        } else {
            promise.resolve(reply);
        }
    }, function(ex) {
        promise.reject(ex);
    });

    return promise;
};

// Warning: These next 2 functions are virtually cut and paste from
// command_line:typehint.js
// If you change this, there are probably parallel changes to be made there
// There are 2 differences between the functions:
// - We lookup type|typehint in the catalog
// - There is a concept of a default typehint, where there is no similar
//   thing for types. This is sensible, because hints are optional nice
//   to have things. Not so for types.
// Whilst we could abstract out the changes, I'm not sure this simplifies
// already complex code

/**
 * Given a string, look up the type extension in the catalog
 * @param name The type name. Object type specs are not allowed
 * @returns A promise that resolves to a type extension
 */
function resolveObjectType(typeSpec) {
    var promise = new Promise();
    var ext = catalog.getExtensionByKey('type', typeSpec.name);
    if (ext) {
        promise.resolve({ ext: ext, typeSpec: typeSpec });
    } else {
        promise.reject(new Error('Unknown type: ' + typeSpec.name));
    }
    return promise;
};

/**
 * Look-up a typeSpec and find a corresponding type extension. This function
 * does not attempt to load the type or go through the resolution process,
 * for that you probably want #resolveType()
 * @param typeSpec A string containing the type name or an object with a name
 * and other type parameters e.g. { name: 'selection', data: [ 'one', 'two' ] }
 * @return a promise that resolves to an object containing the resolved type
 * extension and the typeSpec used to resolve the type (which could be different
 * from the passed typeSpec if this was deferred). The object will be in the
 * form { ext:... typeSpec:... }
 */
function resolveTypeExt(typeSpec) {
    if (typeof typeSpec === 'string') {
        return resolveObjectType({ name: typeSpec });
    }

    if (typeof typeSpec === 'object') {
        if (typeSpec.name === 'deferred') {
            var promise = new Promise();
            exports.undeferTypeSpec(typeSpec).then(function(newTypeSpec) {
                resolveTypeExt(newTypeSpec).then(function(reply) {
                    promise.resolve(reply);
                }, function(ex) {
                    promise.reject(ex);
                });
            });
            return promise;
        } else {
            return resolveObjectType(typeSpec);
        }
    }

    throw new Error('Unknown typeSpec type: ' + typeof typeSpec);
};

/**
 * Do all the nastiness of: converting the typeSpec to an extension, then
 * asynchronously loading the extension to a type and then calling
 * resolveTypeSpec if the loaded type defines it.
 * @param typeSpec a string or object defining the type to resolve
 * @returns a promise which resolves to an object containing the type and type
 * extension as follows: { type:... ext:... }
 * @see #resolveTypeExt
 */
exports.resolveType = function(typeSpec) {
    var promise = new Promise();

    resolveTypeExt(typeSpec).then(function(data) {
        data.ext.load(function(type) {
            // We might need to resolve the typeSpec in a custom way
            if (typeof type.resolveTypeSpec === 'function') {
                type.resolveTypeSpec(data.ext, data.typeSpec).then(function() {
                    promise.resolve({ type: type, ext: data.ext });
                }, function(ex) {
                    promise.reject(ex);
                });
            } else {
                // Nothing to resolve - just go
                promise.resolve({ type: type, ext: data.ext });
            }
        });
    }, function(ex) {
        promise.reject(ex);
    });

    return promise;
};

/**
 * Convert some data from a string to another type as specified by
 * <tt>typeSpec</tt>.
 */
exports.fromString = function(stringVersion, typeSpec) {
    var promise = new Promise();
    exports.resolveType(typeSpec).then(function(typeData) {
        promise.resolve(typeData.type.fromString(stringVersion, typeData.ext));
    });
    return promise;
};

/**
 * Convert some data from an original type to a string as specified by
 * <tt>typeSpec</tt>.
 */
exports.toString = function(objectVersion, typeSpec) {
    var promise = new Promise();
    exports.resolveType(typeSpec).then(function(typeData) {
        promise.resolve(typeData.type.toString(objectVersion, typeData.ext));
    });
    return promise;
};

/**
 * Convert some data from an original type to a string as specified by
 * <tt>typeSpec</tt>.
 */
exports.isValid = function(originalVersion, typeSpec) {
    var promise = new Promise();
    exports.resolveType(typeSpec).then(function(typeData) {
        promise.resolve(typeData.type.isValid(originalVersion, typeData.ext));
    });
    return promise;
};

});

bespin.tiki.module("types:basic",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var catalog = require('bespin:plugins').catalog;
var console = require('bespin:console').console;
var Promise = require('bespin:promise').Promise;

var r = require;

/**
 * These are the basic types that we accept. They are vaguely based on the
 * Jetpack settings system (https://wiki.mozilla.org/Labs/Jetpack/JEP/24)
 * although clearly more restricted.
 * <p>In addition to these types, Jetpack also accepts range, member, password
 * that we are thinking of adding in the short term.
 */

/**
 * 'text' is the default if no type is given.
 */
exports.text = {
    isValid: function(value, typeExt) {
        return typeof value == 'string';
    },

    toString: function(value, typeExt) {
        return value;
    },

    fromString: function(value, typeExt) {
        return value;
    }
};

/**
 * We don't currently plan to distinguish between integers and floats
 */
exports.number = {
    isValid: function(value, typeExt) {
        if (isNaN(value)) {
            return false;
        }
        if (value === null) {
            return false;
        }
        if (value === undefined) {
            return false;
        }
        if (value === Infinity) {
            return false;
        }
        return typeof value == 'number';// && !isNaN(value);
    },

    toString: function(value, typeExt) {
        if (!value) {
            return null;
        }
        return '' + value;
    },

    fromString: function(value, typeExt) {
        if (!value) {
            return null;
        }
        var reply = parseInt(value, 10);
        if (isNaN(reply)) {
            throw new Error('Can\'t convert "' + value + '" to a number.');
        }
        return reply;
    }
};

/**
 * true/false values
 */
exports.bool = {
    isValid: function(value, typeExt) {
        return typeof value == 'boolean';
    },

    toString: function(value, typeExt) {
        return '' + value;
    },

    fromString: function(value, typeExt) {
        if (value === null) {
            return null;
        }

        if (!value.toLowerCase) {
            return !!value;
        }

        var lower = value.toLowerCase();
        if (lower == 'true') {
            return true;
        } else if (lower == 'false') {
            return false;
        }

        return !!value;
    }
};

/**
 * A JSON object
 * TODO: Check to see how this works out.
 */
exports.object = {
    isValid: function(value, typeExt) {
        return typeof value == 'object';
    },

    toString: function(value, typeExt) {
        return JSON.stringify(value);
    },

    fromString: function(value, typeExt) {
        return JSON.parse(value);
    }
};

/**
 * One of a known set of options
 */
exports.selection = {
    isValid: function(value, typeExt) {
        if (typeof value != 'string') {
            return false;
        }

        if (!typeExt.data) {
            console.error('Missing data on selection type extension. Skipping');
            return true;
        }

        var match = false;
        typeExt.data.forEach(function(option) {
            if (value == option) {
                match = true;
            }
        });

        return match;
    },

    toString: function(value, typeExt) {
        return value;
    },

    fromString: function(value, typeExt) {
        // TODO: should we validate and return null if invalid?
        return value;
    },

    resolveTypeSpec: function(extension, typeSpec) {
        var promise = new Promise();

        if (typeSpec.data) {
            // If we've got the data already - just use it
            extension.data = typeSpec.data;
            promise.resolve();
        } else if (typeSpec.pointer) {
            catalog.loadObjectForPropertyPath(typeSpec.pointer).then(function(obj) {
                var reply = obj(typeSpec);
                if (typeof reply.then === 'function') {
                    reply.then(function(data) {
                        extension.data = data;
                        promise.resolve();
                    });
                } else {
                    extension.data = reply;
                    promise.resolve();
                }
            }, function(ex) {
                promise.reject(ex);
            });
        } else {
            // No extra data available
            console.warn('Missing data/pointer for selection', typeSpec);
            promise.resolve();
        }

        return promise;
    }
};

});

bespin.tiki.module("types:index",function(require,exports,module) {

});
;bespin.tiki.register("::syntax_manager", {
    name: "syntax_manager",
    dependencies: { "worker_manager": "0.0.0", "syntax_directory": "0.0.0", "events": "0.0.0", "underscore": "0.0.0", "settings": "0.0.0" }
});
bespin.tiki.module("syntax_manager:index",function(require,exports,module) {
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var _ = require('underscore')._;
var Event = require('events').Event;
var WorkerSupervisor = require('worker_manager').WorkerSupervisor;
var console = require('bespin:console').console;
var rangeutils = require('rangeutils:utils/range');
var settings = require('settings').settings;
var syntaxDirectory = require('syntax_directory').syntaxDirectory;

// The number of lines to highlight at once.
var GRANULARITY = 100;

// Replaces elements at position i in dest with the elements of src. If i is
// beyond the end of dest, expands dest with copies of fill.
function replace(dest, i, src, fill) {
    while (dest.length < i) {
        dest.push(_(fill).clone());
    }

    var args = [ i, src.length ].concat(src);
    Array.prototype.splice.apply(dest, args);
    return dest;
}

// A simple key-value store in which each key is paired with a corresponding
// line. When the syntax information is updated for a line, the symbols from
// those lines are wiped out and replaced with the new symbols.
function Symbols() {
    this._lines = [];
    this._syms = {};
}

Symbols.prototype = {
    get: function(sym) {
        return this._syms["-" + sym];
    },

    replaceLine: function(row, newSymbols) {
        var lines = this._lines, syms = this._syms;
        if (row < lines.length && _(lines[row]).isArray()) {
            _(lines[row]).each(function(ident) { delete syms["-" + ident]; });
        }

        function stripLeadingDash(s) { return s.substring(1); }
        lines[row] = _(newSymbols).keys().map(stripLeadingDash);

        _(syms).extend(newSymbols);
    }
};

function Context(syntaxInfo, syntaxManager) {
    this._syntaxInfo = syntaxInfo;
    this._syntaxManager = syntaxManager;

    this._invalidRow = 0;
    this._states = [];
    this._active = false;

    this.symbols = new Symbols;
}

Context.prototype = {
    _annotate: function() {
        if (this._invalidRow == null) {
            throw new Error("syntax_manager.Context: attempt to annotate " +
                "without any invalid row");
        }
        if (!this._active) {
            throw new Error("syntax_manager.Context: attempt to annotate " +
                "while inactive");
        }

        if (this._worker == null) {
            this._createWorker();
            return;
        }

        var lines = this._syntaxManager.getTextLines();
        var row = this._invalidRow;
        var state = row === 0 ? this.getName() + ':start' : this._states[row];
        var lastRow = Math.min(lines.length, row + GRANULARITY);
        lines = lines.slice(row, lastRow);

        var runRange = {
            start: { row: row, col: 0 },
            end: { row: lastRow - 1, col: _(lines).last().length }
        };

        var pr = this._worker.send('annotate', [ state, lines, runRange ]);
        pr.then(_(this._annotationFinished).bind(this, row, lastRow));
    },

    _annotationFinished: function(row, lastRow, result) {
        if (!this._active) {
            return;
        }

        var syntaxManager = this._syntaxManager;
        syntaxManager.mergeAttrs(row, result.attrs);
        syntaxManager.mergeSymbols(row, result.symbols);

        replace(this._states, row, result.states);

        if (lastRow >= this._getRowCount()) {
            this._invalidRow = null;    // We're done!
            this._active = false;
            return;
        }

        this._invalidRow = lastRow;
        this._annotate();
    },

    _createWorker: function() {
        var syntaxInfo = this._syntaxInfo;
        if (syntaxInfo == null) {
            return false;
        }

        var worker = new WorkerSupervisor("syntax_worker#syntaxWorker");
        this._worker = worker;

        worker.started.add(this._workerStarted.bind(this));
        worker.start();

        return true;
    },

    _getRowCount: function() {
        return this._syntaxManager.getTextLines().length;
    },

    _workerStarted: function() {
        this._syntaxInfo.settings.forEach(function(name) {
            var value = settings.get(name);
            this._worker.send('setSyntaxSetting', [ name, value ]);
        }, this);

        this._worker.send('loadSyntax', [ this._syntaxInfo.name ]);

        if (this._active) {
            this._annotate();
        }
    },

    // Switches on this syntax context and begins annotation. It is the
    // caller's responsibility to ensure that there exists an invalid row
    // before calling this. (Typically the caller ensures this by calling cut()
    // first.)
    activateAndAnnotate: function() {
        this._active = true;
        this._annotate();
    },

    contextsAtPosition: function(pos) {
        var syntaxInfo = this._syntaxInfo;
        if (syntaxInfo == null) {
            return [ 'plain' ];
        }

        return [ syntaxInfo.name ];             // FIXME
    },

    // Invalidates the syntax context at a row.
    cut: function(row) {
        var endRow = this._getRowCount();
        if (row < 0 || row >= endRow) {
            throw new Error("Attempt to cut the context at an invalid row");
        }

        if (this._invalidRow != null && this._invalidRow < row) {
            return;
        }
        this._invalidRow = row;

        // Mark ourselves as inactive, so that if the web worker was working on
        // a series of rows we know to discard its results.
        this._active = false;
    },

    getName: function() {
        return this._syntaxInfo.name;
    },

    kill: function() {
        var worker = this._worker;
        if (worker == null) {
            return;
        }

        worker.kill();
        this._worker = null;
    }
};

/**
 * The syntax manager coordinates a series of syntax contexts, each run in a
 * separate web worker. It receives text editing notifications, updates and
 * stores the relevant syntax attributes, and provides marked-up text as the
 * layout manager requests it.
 *
 * @constructor
 * @exports SyntaxManager as syntax_manager:SyntaxManager
 */
function SyntaxManager(layoutManager) {
    this.layoutManager = layoutManager;

    /** Called whenever the attributes have been updated. */
    this.attrsChanged = new Event;

    /** Called whenever the syntax (file type) has been changed. */
    this.syntaxChanged = new Event;

    this._context = null;
    this._invalidRows = null;
    this._contextRanges = null;
    this._attrs = [];
    this._symbols = new Symbols;
    this._syntax = 'plain';

    this._reset();
}

SyntaxManager.prototype = {
    /** @lends SyntaxManager */

    _getTextStorage: function() {
        return this.layoutManager.textStorage;
    },

    // Invalidates all the highlighting and recreates the workers.
    _reset: function() {
        var ctx = this._context;
        if (ctx != null) {
            ctx.kill();
            this._context = null;
        }

        var syn = this._syntax;
        var syntaxInfo = syn === 'plain' ? null : syntaxDirectory.get(syn);

        ctx = new Context(syntaxInfo, this);
        this._context = ctx;
        ctx.activateAndAnnotate();
    },

    attrsChanged: null,
    syntaxChanged: null,

    /** Returns the contexts that are active at the position pos. */
    contextsAtPosition: function(pos) {
        return this._context.contextsAtPosition(pos);
    },

    /**
     * Returns the attributes most recently delivered from the syntax engine.
     * Does not instruct the engine to perform any work; use invalidateRow()
     * for that.
     */
    getAttrsForRows: function(startRow, endRow) {
        return this._attrs.slice(startRow, endRow);
    },

    /**
     * Returns the metadata currently associated with the given symbol, or null
     * if the symbol is unknown.
     */
    getSymbol: function(ident) {
        return this._symbols.get(ident);
    },

    /** Returns the current syntax. */
    getSyntax: function() {
        return this._syntax;
    },

    /** A convenience function to return the lines from the text storage. */
    getTextLines: function() {
        return this._getTextStorage().lines;
    },

    /** Marks the text as needing an update starting at the given row. */
    invalidateRow: function(row) {
        var ctx = this._context;
        ctx.cut(row);
        ctx.activateAndAnnotate();
    },

    /**
     * Merges the supplied attributes into the text, overwriting the attributes
     * that were there previously.
     */
    mergeAttrs: function(startRow, newAttrs) {
        replace(this._attrs, startRow, newAttrs, []);
        this.attrsChanged(startRow, startRow + newAttrs.length);
    },

    /**
     * Merges the supplied symbols into the symbol store, overwriting any
     * symbols previously defined on those lines.
     */
    mergeSymbols: function(startRow, newSymbols) {
        var symbols = this._symbols;
        _(newSymbols).each(function(lineSyms, i) {
            symbols.replaceLine(startRow + i, lineSyms);
        });
    },

    /**
     * Sets the syntax and invalidates all the highlighting. If no syntax
     * plugin is available, sets the syntax to "plain".
     */
    setSyntax: function(syntax) {
        this._syntax = syntaxDirectory.hasSyntax(syntax) ? syntax : 'plain';
        this.syntaxChanged(syntax);
        this._reset();
    },

    /** Sets the syntax appropriately for a file extension. */
    setSyntaxFromFileExt: function(fileExt) {
        return this.setSyntax(syntaxDirectory.syntaxForFileExt(fileExt));
    }
};

exports.SyntaxManager = SyntaxManager;


});

bespin.tiki.require("bespin:plugins").catalog.registerMetadata({"bespin": {"testmodules": [], "resourceURL": "resources/bespin/", "name": "bespin", "environments": {"main": true, "worker": true}, "type": "plugins/boot"}, "settings": {"resourceURL": "resources/settings/", "description": "Infrastructure and commands for managing user preferences", "share": true, "dependencies": {"types": "0.0"}, "testmodules": [], "provides": [{"indexOn": "name", "description": "A setting is something that the application offers as a way to customize how it works", "register": "index#addSetting", "ep": "extensionpoint", "name": "setting"}, {"description": "A settingChange is a way to be notified of changes to a setting", "ep": "extensionpoint", "name": "settingChange"}, {"pointer": "commands#setCommand", "description": "define and show settings", "params": [{"defaultValue": null, "type": {"pointer": "settings:index#getSettings", "name": "selection"}, "name": "setting", "description": "The name of the setting to display or alter"}, {"defaultValue": null, "type": {"pointer": "settings:index#getTypeSpecFromAssignment", "name": "deferred"}, "name": "value", "description": "The new value for the chosen setting"}], "ep": "command", "name": "set"}, {"pointer": "commands#unsetCommand", "description": "unset a setting entirely", "params": [{"type": {"pointer": "settings:index#getSettings", "name": "selection"}, "name": "setting", "description": "The name of the setting to return to defaults"}], "ep": "command", "name": "unset"}], "type": "plugins/supported", "name": "settings"}, "canon": {"resourceURL": "resources/canon/", "name": "canon", "environments": {"main": true, "worker": false}, "dependencies": {"environment": "0.0.0", "events": "0.0.0", "settings": "0.0.0"}, "testmodules": [], "provides": [{"indexOn": "name", "description": "A command is a bit of functionality with optional typed arguments which can do something small like moving the cursor around the screen, or large like cloning a project from VCS.", "ep": "extensionpoint", "name": "command"}, {"description": "An extension point to be called whenever a new command begins output.", "ep": "extensionpoint", "name": "addedRequestOutput"}, {"description": "A dimensionsChanged is a way to be notified of changes to the dimension of Bespin", "ep": "extensionpoint", "name": "dimensionsChanged"}, {"description": "How many typed commands do we recall for reference?", "defaultValue": 50, "type": "number", "ep": "setting", "name": "historyLength"}, {"action": "create", "pointer": "history#InMemoryHistory", "ep": "factory", "name": "history"}], "type": "plugins/supported", "description": "Manages commands"}, "events": {"resourceURL": "resources/events/", "description": "Dead simple event implementation", "dependencies": {"traits": "0.0"}, "testmodules": ["tests/test"], "provides": [], "type": "plugins/supported", "name": "events"}, "environment": {"testmodules": [], "dependencies": {"settings": "0.0.0"}, "resourceURL": "resources/environment/", "name": "environment", "type": "plugins/supported"}, "traits": {"resourceURL": "resources/traits/", "description": "Traits library, traitsjs.org", "dependencies": {}, "testmodules": [], "provides": [], "type": "plugins/thirdparty", "name": "traits"}, "underscore": {"testmodules": [], "type": "plugins/thirdparty", "resourceURL": "resources/underscore/", "description": "Functional Programming Aid for Javascript. Works well with jQuery.", "name": "underscore"}, "worker_manager": {"resourceURL": "resources/worker_manager/", "description": "Manages a web worker on the browser side", "dependencies": {"canon": "0.0.0", "events": "0.0.0", "underscore": "0.0.0"}, "testmodules": [], "provides": [{"description": "Low-level web worker control (for plugin development)", "ep": "command", "name": "worker"}, {"description": "Restarts all web workers (for plugin development)", "pointer": "#workerRestartCommand", "ep": "command", "name": "worker restart"}], "type": "plugins/supported", "name": "worker_manager"}, "syntax_directory": {"resourceURL": "resources/syntax_directory/", "name": "syntax_directory", "environments": {"main": true, "worker": true}, "dependencies": {}, "testmodules": [], "provides": [{"register": "#discoveredNewSyntax", "ep": "extensionhandler", "name": "syntax"}], "type": "plugins/supported", "description": "Catalogs the available syntax engines"}, "types": {"resourceURL": "resources/types/", "description": "Defines parameter types for commands", "testmodules": ["tests/testTypes", "tests/testBasic"], "provides": [{"indexOn": "name", "description": "Commands can accept various arguments that the user enters or that are automatically supplied by the environment. Those arguments have types that define how they are supplied or completed. The pointer points to an object with methods convert(str value) and getDefault(). Both functions have `this` set to the command's `takes` parameter. If getDefault is not defined, the default on the command's `takes` is used, if there is one. The object can have a noInput property that is set to true to reflect that this type is provided directly by the system. getDefault must be defined in that case.", "ep": "extensionpoint", "name": "type"}, {"description": "Text that the user needs to enter.", "pointer": "basic#text", "ep": "type", "name": "text"}, {"description": "A JavaScript number", "pointer": "basic#number", "ep": "type", "name": "number"}, {"description": "A true/false value", "pointer": "basic#bool", "ep": "type", "name": "boolean"}, {"description": "An object that converts via JavaScript", "pointer": "basic#object", "ep": "type", "name": "object"}, {"description": "A string that is constrained to be one of a number of pre-defined values", "pointer": "basic#selection", "ep": "type", "name": "selection"}, {"description": "A type which we don't understand from the outset, but which we hope context can help us with", "ep": "type", "name": "deferred"}], "type": "plugins/supported", "name": "types"}, "syntax_manager": {"resourceURL": "resources/syntax_manager/", "name": "syntax_manager", "environments": {"main": true, "worker": false}, "dependencies": {"worker_manager": "0.0.0", "syntax_directory": "0.0.0", "events": "0.0.0", "underscore": "0.0.0", "settings": "0.0.0"}, "testmodules": [], "provides": [], "type": "plugins/supported", "description": "Provides syntax highlighting services for the editor"}});
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// Responsible for loading the second script (BespinMain 
// or BespinWorker)

// check to see if we're in a worker
if (typeof(window) === "undefined") {
    importScripts("BespinWorker.js");
} else {
    (function() {
        var mainscript = document.createElement("script");
        mainscript.setAttribute("src", bespin.base + "BespinMain.js");
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(mainscript);
    })();
}
