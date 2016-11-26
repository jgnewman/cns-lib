const CNS_ = {

  /**
   * @private
   * Contains runtime configuration options
   */
  config: {
    use: {
      react: true
    }
  },

  /**
   * @private
   * Retrieves runtime configuration options
   *
   * @param  {String} key  The name of the value to retrieve
   * @return {Any}
   */
  getConfig: function (key) {
    const pieces = key.split('.');
    var obj = CNS_.config;
    pieces.every(function (item) {
      obj = obj[item];
      return obj !== undefined;
    });
    return obj;
  },

  /**
   * @private
   * Generates a tuple data type
   *
   * @param  {Array} arr  Any array.
   * @return {Array}      Marked with a special property identifying it as a tuple.
   */
  tuple: function (arr) {
    if (!arr.length) CNS_.die('Tuples can not be empty.');
    Object.defineProperty
      ? Object.defineProperty(arr, 'CNS_isTuple_', {enumerable: false, configurable: false, writable: false, value: CNS_})
      : (arr.CNS_isTuple_ = CNS_);
    return arr;
  },

  /**
   * @private
   * Determines whether a value is a tuple.
   *
   * @param  {Any}     val  Any value
   * @return {Boolean}      Whether the value was a tuple.
   */
  isTuple: function (val) {
    return val.CNS_isTuple_ === CNS_;
  },

  /**
   * @private
   * Conditionally executes one function or another.
   *
   * @param  {Any}      condition  Assessed for its truthiness.
   * @param  {Function} callback   Executed if `condition` is truthy.
   * @param  {Function} elseCase   Executed if `condition` is falsy.
   * @return {Any}                 The result of the executed function or `undefined`.
   */
  qualify: function (condition, callback, elseCase) {
    return condition ? callback() : elseCase ? elseCase() : undefined;
  },

  /**
   * @private
   * Binds a function to the current context. If the value is not a function,
   * Generates a function that returns the value, bound to the current context.
   *
   * @param  {Any} val      Any value.
   * @param  {Any} context  Any value.
   * @return {Function}     Retrieves `val` and is bound to `context`.
   */
  lazify: function(val, context) {
    return typeof val === 'function'
           ? val.bind(context)
           : function () { return val }.bind(context);
  },

  /**
   * @public
   * Sets a language configuration option.
   *
   * @param  {String} key  The name of the config option.
   * @param  {Any}    val  The value for the option.
   * @return {undefined}
   */
  lang: function (key, val) {
    const pieces = key.split('.');
    var obj = CNS_.config;
    pieces.forEach(function (item, index) {
      const isLast = index === pieces.length - 1;
      if (isLast) {
        obj[item] = val;
      } else {
        obj[item] = obj[item] || {};
        obj = obj[item];
      }
    });
  },

  /**
   * @public
   * Shortcuts throwing an error in a way that can be returned by a
   * JavaScript function.
   *
   * @param  {String} msg  The error message.
   * @return {undefined}
   */
  die: function (msg) {
    throw new Error(msg);
  },

  /**
   * @public
   * Generates an array of a certain length specified by the bound parameters.
   *
   * @param  {Number} from     A lower bound.
   * @param  {Number} through  An upper bound.
   * @return {Array}           The resulting array.
   */
  range: function (from, through) {
    const out = [];
    for (var i = from; i <= through; i += 1) out.push(i);
    return out;
  },

  /**
   * @public
   * Shorcuts console.log but only if it exists.
   */
  log: function () {
    return typeof console !== 'undefined' && typeof console.log === 'function'
      ? console.log.apply(console, arguments)
      : undefined;
  },

  /**
   * @public
   * Shorcuts console.warn but only if it exists.
   * Tries to fall back to console.log.
   */
  warn: function () {
    return typeof console !== 'undefined' && typeof console.warn === 'function'
      ? console.warn.apply(console, arguments)
      : CNS_.log.apply(null, arguments);
  },

  /**
   * @public
   * Shorcuts console.debug but only if it exists.
   * Tries to fall back to console.log.
   */
  debug: function () {
    return typeof console !== 'undefined' && typeof console.debug === 'function'
      ? console.debug.apply(console, arguments)
      : CNS_.log.apply(null, arguments);
  },

  /**
   * @public
   * Converts a tuple to an object.
   *
   * @param  {Tuple}    list  A tuple data type.
   * @param  {Function} fn    Optional. Called once for each item and determines
   *                          how to name the object key.
   * @return {Object}
   */
  tupleToObject: function (list, fn) {
    const obj = {};
    if (!CNS_.isTuple(list)) CNS_.die('Argument provided is not a tuple');
    list.forEach(function (item, index) { obj[fn ? fn(item, index) : index] = item });
    return obj;
  },

  /**
   * @public
   * Converts a tuple to an array.
   *
   * @param  {Tuple} tuple  An instance of a tuple data type.
   * @return {Array}        Converted from the tuple.
   */
  tupleToArray: function (tuple) {
    if (!CNS_.isTuple(tuple)) CNS_.die('Argument provided is not a tuple');
    return tuple.slice();
  },

  /**
   * @public
   * Converts an array to a tuple.
   *
   * @param  {Array} arr  Any array.
   * @return {Tuple}      Converted from the array.
   */
  arrayToTuple: function (arr) {
    if (CNS_.isTuple(arr) || !Array.isArray(arr)) CNS_.die('Argument provided is not an array');
    return CNS_.tuple(arr.slice());
  },

  /**
   * @public
   * Performs a deep equal operation on two collections.
   *
   * @param  {Any} a   Any data.
   * @param  {Any} b   Any data.
   * @return {Boolean} Whether `a` and `b` are deep equal.
   */
  eql: function (a, b) {
    if (a === CNS_ || b === CNS_) return true; // <- Hack to force a match
    if (a === b || (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b))) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object') {
      if (Array.isArray(a)) return a.every(function(item, index) { return CNS_.eql(item, b[index]) }.bind(this));
      const ks = Object.keys, ak = ks(a), bk = ks(b);
      if (!CNS_.eql(ak, bk)) return false;
      return ak.every(function (key) { return CNS_.eql(a[key], b[key]) }.bind(this));
    }
    return false;
  },

  /**
   * @private
   * Matches a function's arguments against expected patterns.
   * For example: CNS_.match(args, [['Identifier', 'x']]);
   *
   * @param  {Array} args     Contains a function's arguments.
   * @param  {Array} pattern  Describes patterns to match arguments against.
   * @return {Boolean}        Whether or not arguments match patterns.
   */
  match: function (args, pattern) {
    const NUMTEST    = /^(\-)?[0-9]+(\.[0-9]+)?(e\-?[0-9]+)?$/;
    const ATOMTEST   = /^[\$_A-z][\$_A-z0-9]*$/;
    const SYMTEST    = /^Symbol\.for\(/;
    const SYMREPLACE = /^Symbol\.for\((\'|\")|(\'|\")\)$/g;
    function convertSpecial(special) {
      switch (special) {
        case 'null': return null; case 'undefined': return undefined;
        case 'true': return true; case 'false': return false; default: return special;
      }
    }
    function arrMismatch(matchType, arg) {
      const isTuple = CNS_.isTuple(arg);
      return matchType === 'Tuple' && !isTuple || matchType === 'Arr' && isTuple;
    }
    function testArrParam(arg, arrParam, position) {
      if (arrParam === '_') return true; // Yes, if it's the catch all.
      if (arrParam === 'NaN') return isNaN(arg[position]); // Yes, if they're both NaN.
      if ((converted = convertSpecial(arrParam)) !== arrParam) return arg[position] === converted; // Yes, if it's a special and the specials match.
      if (SYMTEST.test(arrParam)) return arg[position] === Symbol.for(arrParam.replace(SYMREPLACE, '')); // Yes, if it's a symbol and symbols match.
      return ATOMTEST.test(arrParam) ? true : CNS_.eql(arg[position], JSON.parse(arrParam)); // Yes, for identifiers, recursive equality check for anything else.
    }
    return args.every(function (arg, index) {
      if (!pattern[index]) return false; // No match if the arity's wrong.
      var matchType = pattern[index][0]; // For example "Tuple"
      var matchVal  = pattern[index][1]; // For example ["x","y"]
      var converted;
      switch(matchType) {
        case 'Identifier': return true; // An identifier is a variable assignment so we allow it.
        case 'Atom': return arg === Symbol.for(matchVal); // Match if it's the same atom.
        case 'String': return arg === matchVal; // Match if it's the same string.
        case 'Number': return NUMTEST.test(arg) && arg === parseFloat(matchVal); // Match if the arg is a number and the numbers are equal.
        case 'Special': return matchVal === 'NaN' ? isNaN(arg) : arg === convertSpecial(matchVal); // Match if the special values are equal.
        case 'HeadTail':
        case 'LeadLast':
          return Array.isArray(arg); // Match any array because we're just doing array destructuring.
        case 'Arr':
        case 'Tuple':
          // No match if it's not an array, we've mismatched arrays/tuples, or if we have the wrong amount of items.
          if (!Array.isArray(arg) || arrMismatch(matchType, arg) || arg.length !== matchVal.length) return false;
          // Match if all of the subobjects match.
          return matchVal.every(function (arrParam, position) {
            return testArrParam(arg, arrParam, position);
          });
        case 'Keys':
        case 'Obj':
          // Similar to the arr/tuple condition except here we don't care if the amount of keys matches our pattern length.
          if (typeof arg !== 'object' || arg.constructor !== Object) return false; // No match if the arg isn't an object.
          if (matchType === 'Keys') return true; // Match if the arg is an object and we're just destructuring keys.
          return matchVal.every(function (pair) {
            const kv = pair.split(':');
            if (SYMTEST.test(kv[0])) (kv[0] = Symbol.for(kv[0].replace(SYMREPLACE, '')));
            return testArrParam(arg, kv[1].trim(), typeof kv[0] === 'string' ?  kv[0].trim() : kv[0]);
          });
        default: CNS_.die('Can not pattern match against type ' + matchType); // No match if we don't have a matchable type.
      }
    });
  },

  /**
   * @private
   * Converts `arguments` to an array.
   *
   * @param  {Arguments} args  Any `arguments` object.
   * @return {Array}           Converted from the `arguments`.
   */
  args: function (args) {
    const out = [];
    Array.prototype.push.apply(out, args);
    return out;
  },

  /**
   * @public
   * Retrieves an item from a collection.
   *
   * @param  {String|Number} item        Identifies the item by key or position.
   * @param  {Collection}    collection  Any collection type.
   * @return {Any}                       The retrieved item.
   */
  get: function (item, collection) {
    return collection[item];
  },

  /**
   * @public
   * Throws an instance of an error object.
   * For example: CNS_.throw(CNS_.create(Error));
   *
   * @param  {Error} err  Any error object.
   * @return {undefined}
   */
  throw: function (err) {
    throw err;
  },

  /**
   * @public
   * Creates a `new` object.
   * For example: CNS_.create(ClassName, arg1, arg2);
   *
   * @param  {Constructor} cls  Any constructor function.
   * @return {Instance}         An instance of the constructor's object.
   */
  create: function(cls) {
    return new (Function.prototype.bind.apply(cls, arguments));
  },

  /**
   * @public
   * Assesses data types.
   *
   * @param  {Any} val  Any value.
   * @return {String}   The type of data assessed.
   */
  dataType: function (val) {
    const type = typeof val;
    switch (type) {
      case 'symbol': return 'atom';
      case 'number': return isNaN(val) ? 'nan' : type;
      case 'object':
        if (val === null) return 'null';
        if (Array.isArray(val)) return CNS_.isTuple(val) ? 'tuple' : 'array';
        if (val instanceof Date) return 'date';
        if (val instanceof RegExp) return 'regexp';
        if (typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) return 'htmlelement';
        if ( (typeof Worker !== 'undefined' && val instanceof Worker) ||
             (val.constructor.name === 'ChildProcess' && typeof val.pid === 'number') ) return 'process';
        return type;
      default: return type;
    }
  },

  /**
   * @public
   * Functionizes the `instanceof` operator.
   *
   * @param  {Any}         val   Any value.
   * @param  {Constructor} type  Any constructor function.
   * @return {Boolean}           The result of calling `val instanceof type`.
   */
  instanceof: function (val, type) {
    return val instanceof type;
  },

  /**
   * @public
   * Returns the first item in a list.
   *
   * @param  {Array|Tuple|String} list  Any list type.
   * @return {Any}                      The item in position 0.
   */
  head: function (list) {
    return list[0];
  },

  /**
   * @public
   * Returns all but the first item in a list.
   *
   * @param  {Array|Tuple|String} list  Any list type.
   * @return {Array|Tuple|String}       Minus the first item in `list`.
   */
  tail: function (list) {
    const out = list.slice(1);
    return CNS_.isTuple(list) ? CNS_.tuple(out) : out;
  },

  /**
   * Selects a random item from a list type colelction.
   *
   * @param  {Array|Tuple|String} list  Any list type.
   * @return {Any}                      A randomly selected item.
   */
  random: function (list) {
    return list[Math.floor(Math.random()*list.length)];
  },

  /**
   * @public
   * Returns all but the last item in a list.
   *
   * @param  {Array|Tuple|String} list  Any list type.
   * @return {Array|Tuple|String}       Minus the last item in `list`.
   */
  lead: function (list) {
    const out = list.slice(0, list.length - 1);
    return CNS_.isTuple(list) ? CNS_.tuple(out) : out;
  },

  /**
   * @public
   * Returns the last item in a list.
   *
   * @param  {Array|Tuple|String} list  Any list type.
   * @return {Any}                      The item in the last position.
   */
  last: function (list) {
    return list[list.length - 1];
  },

  /**
   * @public
   * Calls a function.
   * For example: CNS_.apply(function () {}, x, y, z);
   *
   * @param  {Function} fn  The function to call.
   * @return {Any}          The result of calling the function.
   */
  apply: function (fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return args.length ? fn.apply(null, args) : fn();
  },

  /**
   * @public
   * Creates a new collection by updating an item in an existing collection.
   * EXCEPTION: If the collection is a function, modifies the existing function.
   *
   * @param  {String|Number} keyOrIndex  Identifies the item to update.
   * @param  {Any}           val         The new value.
   * @param  {Collection}    collection  Any collection type.
   * @return {Collection}                A copy of the original collection.
   */
  update: function (keyOrIndex, val, collection) {
    if (Array.isArray(collection)) {
      if (CNS_.isTuple(collection) && collection.indexOf(keyorIndex) === -1) {
        CNS_.die('Can not add extra items to tuples.');
      }
      const newSlice = collection.slice();
      newSlice[keyOrIndex] = val;
      return newSlice;
    } else if (typeof HTMLElement !== 'undefined' && collection instanceof HTMLElement) {
      const clone = collection.cloneNode();
      clone[keyOrIndex] = val;
      return clone;
    } else if (typeof collection === 'function') {
      // Updating a function allows breaking the functionalism rule only
      // because JavaScript makes it impossible to clone a function and account
      // for all necessary cases. This should be avoided where possible.
      collection[keyOrIndex] = val;
      return collection;
    } else {
      const replacer = {};
      replacer[keyOrIndex] = val;
      return Object.assign({}, collection, replacer);
    }
  },

  /**
   * @public
   * Creates a new collection by removing an item in an existing collection.
   *
   * @param  {String|Number} keyOrIndex  Identifies the item to remove.
   * @param  {Collection}    collection  Any collection type.
   * @return {Collection}                A copy of the original collection.
   */
  remove: function (keyOrIndex, collection) {
    if (Array.isArray(collection)) {
      if (CNS_.isTuple(collection)) CNS_.die('Can not remove items from tuples.');
      const splicer = collection.slice();
      splicer.splice(keyOrIndex, 1);
      return splicer;
    } else {
      const newObj = {};
      const keys = Object.keys(collection).concat(
        Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(collection) : []
      );
      keys.forEach(function (key) {
        keyOrIndex !== key && (newObj[key] = collection[key]);
      });
      return newObj;
    }
  },

  /**
   * @public
   * Creats an html element.
   *
   * @param  {String|Constructor} type  The type of element to create.
   * @param  {Object}             attrs The element's attributes.
   * @param  {Array}              body  Children of the element.
   * @return {HtmlElement}              The resulting element.
   */
  createElement: function (type, attrs, body) {
    var react;
    const a = attrs || {};
    const b = body  || [];
    if (typeof React !== 'undefined') { // If we have React, reference it.
      react = React;
    }
    if (!react && typeof require !== 'undefined') { // If we have require, try to require React.
      try {
        react = require('react');
      } catch (_) {
        react = null;
      }
    }
    if (react && CNS_.getConfig('use.react')) { // If we have react, pass to React.
      return react.createElement.apply(react, [type, a].concat(b));
    }
    if (typeof document === 'undefined') { // Die if we're not in a browser environment.
      return CNS_.die('No HTML document is available.');
    }
    const elem = document.createElement(type); // Create an element and set attributes.
    Object.keys(a).forEach(function (key) {
      switch (key) {
        case 'className' : return elem.setAttribute('class', a[key]);
        case 'htmlFor'   : return elem.setAttribute('for', a[key]);
        default          : return elem.setAttribute(key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), a[key]);
      }
    });
    b.forEach(function (node) { // Append children.
      elem.appendChild(node);
    });
    return elem;
  },

  // CNS_.aritize(fun, 2);
  /**
   * @public
   * Makes a new function that calls an existing function but only
   * accepts a certain amount of arguments.
   *
   * @param  {Function} fun    A function to lock down.
   * @param  {Number}   arity  The acceptable amount of arguments.
   * @return {Function}        A resulting function.
   */
  aritize: function (fun, arity) {
    return function () {
      if (arguments.length === arity) {
        return fun.apply(undefined, arguments);
      } else {
        CNS_.die('Function ' + (fun.name || '') + ' called with wrong arity. Expected ' + arity + ' got ' + arguments.length + '.');
      }
    };
  },

  /**
   * @public
   * Selects a single DOM element by selector.
   *
   * @param  {String} selector  Describes the element to select.
   * @return {HTMLElement}      The selected element.
   */
  dom: function (selector) {
    return document.querySelector(selector);
  },

  /**
   * @public
   * Selects an array of DOM elements by selector.
   *
   * @param  {String} selector  Describes the element to select.
   * @return {Array}            The selected elements.
   */
  domArray: function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  },

  /********************************
   * Begin message passing stuff
   ********************************/

   /**
    * @private
    * A package of utilities for multithreading.
    */
   msgs: {
     isBrowser: function () { return typeof navigator !== 'undefined' },
     isChild: false,
     queue: [],
     handlers: [],
     isWaiting: false,

     // Should only be used on objects that you know for sure only contain
     // functions, objects, and arrays, deeply nested.
     // Top signifies we are stringifying at the top level (true/false)
     stringify: function (obj, top) {
       if (typeof obj === 'function') {
         return obj.toString();
       } else if (typeof obj === 'string') {
         return obj;
       } else if (obj === true || obj === false) {
         return obj;
       } else if (Array.isArray(obj)) {
         return '[' + obj.map(function (item) { return CNS_.msgs.stringify(item, false) }).join(', ') + ']';
       } else {
         return '{' + Object.keys(obj).map(function (key) {
           if (top && key === 'config') return key + ':' + JSON.stringify({use:{react:true}});
           return key + ':' + CNS_.msgs.stringify(obj[key], false);
         }).join(',\n') + '}';
       }
     },

     symbolize: function (data, reSymbolize) {
       // If we need to stringify a symbol, give it a special syntax and return it.
       if (!reSymbolize && typeof data === 'symbol') return '__' + data.toString() + '__';
       // If we need to turn a string into a symbol, generate a symbol and return it.
       if (reSymbolize && typeof data === 'string' && /^__Symbol\(.+\)__$/.test(data)) {
         return Symbol.for(data.replace(/^__Symbol\(|\)__$/g, ''));
       }
       // If this is an array, map over it and see if we need to symbolize any data in it.
       // Return the new array.
       if (Array.isArray(data)) {
         var out = [];
         data.forEach(function (item) { out.push(CNS_.msgs.symbolize(item, reSymbolize)) });
         if (!reSymbolize && CNS_.isTuple(data)) (out = { CNS_tuple_: out });
         return out;
       // If this is an object, check to see if it's supposed to be a tuple.
       } else if (typeof data === 'object' && data !== null) {
         // If it's supposed to be a tuple, take care of recursively building a new
         // array and then turn it into a tuple and return it.
         if (reSymbolize && data.CNS_tuple_) {
           var out = CNS_.msgs.symbolize(data.CNS_tuple_, true);
           return CNS_.tuple(out);
         // If it's actually an object, build a new object, symbolizing all the values.
         // We don't try to symbolize object keys because the purpose of a symbol as an object
         // key is to not have it be enumerable.
         } else {
           var out = {};
           Object.keys(data).forEach(function (key) { out[key] = CNS_.msgs.symbolize(data[key], reSymbolize) });
           return out;
         }
       }
       return data;
     },

     onMsg: function (msg) {
       CNS_.msgs.isBrowser() && (msg = msg.data);
       const m = CNS_.msgs.symbolize(msg, true);
       CNS_.msgs.queue.push(m);
       if (!CNS_.msgs.isWaiting) {
         CNS_.msgs.isWaiting = true;
         setTimeout(function () {
           CNS_.msgs.runQueue();
         }, 0);
       }
     },

     runQueue: function () {
       this.queue.forEach(function (msgObj) {
         this.handlers.forEach(function (handler) {
           handler(msgObj);
         });
       }.bind(this));
       this.queue = [];
       this.isWaiting = false;
     },

     Thread: function(fnBody) {
       const isBrowser = typeof navigator !== 'undefined';
       const body = 'const CNS_ = ' + CNS_.msgs.stringify(CNS_, true) + ';\n' +
                    'CNS_.msgs.isChild = true;\n' +
                    'CNS_.msgs.handlers = [];\n' +
                    (isBrowser ? 'this.onmessage = CNS_.msgs.onMsg;\n'
                               : 'process.on("message", CNS_.msgs.onMsg);\n') +
                    'var arguments = [];\n' +
                    fnBody;
       this.isBrowser  = isBrowser;
       this.thread     = isBrowser
                       ? new Worker(window.URL.createObjectURL(
                           new Blob([body], {type: 'application/javascript'})
                         ))
                       : require('child_process').fork(null, [], {
                           execPath: 'node',
                           execArgv: ['-e', body]
                         })
                       ;
       isBrowser ? (this.thread.onmessage = CNS_.msgs.onMsg)
                 : this.thread.on('message', CNS_.msgs.onMsg);
       !isBrowser && this.thread.on('exit', function () { console.log('process exited') })
       return this;
     }
   },

   /**
    * @public
    * Spins up a new thread from a function.
    *
    * @param  {Function} fn  Contains the process body.
    * @return {Object}       The multithreading tools package.
    */
   spawn: function (fn) {
    return new CNS_.msgs.Thread('(' + fn.toString() + '())');
   },

   /**
    * @public
    * Determines what to do when messages come in from another thread.
    *
    * @param  {Function} fn  Handles the incoming message.
    * @return {undefined}
    */
   receive: function (fn) {
     CNS_.msgs.handlers.push(fn);
   },

   /**
    * @public
    * Kills a process.
    *
    * @param  {Process} thread  A thread to kill.
    * @return {undefined}
    */
   kill: function (thread) {
     thread.isBrowser ? thread.thread.terminate() : thread.thread.kill('SIGINT');
   },

   /**
    * @public
    * Sends a message back to a parent thread from a child thread.
    *
    * @param  {Serializable} msg  Any serializable data.
    * @return {undefined}
    */
   reply: function (msg) {
     const m = CNS_.msgs.symbolize(msg, false);
     CNS_.msgs.isBrowser() ? postMessage(m) : process.send(m) ;
   },

   /**
    * @public
    * Sends a message to a child thread.
    *
    * @param  {Process}      thread  The child process.
    * @param  {Serializable} msg     Any serializable data.
    * @return {undefined}
    */
   send: function (thread, msg) {
     const m = CNS_.msgs.symbolize(msg, false);
     CNS_.msgs.isBrowser() ? thread.thread.postMessage(m) : thread.thread.send(m);
   }

   /********************************
    * End message passing stuff
    ********************************/
};


// export default CNS_;
module.exports = CNS_;
