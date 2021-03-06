'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var path__default = _interopDefault(path);
var ts = _interopDefault(require('typescript'));
var crypto = _interopDefault(require('crypto'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function cleanDiagnostics(diagnostics) {
    const cleaned = [];
    const maxErrors = Math.min(diagnostics.length, MAX_ERRORS);
    const dups = new Set();
    for (var i = 0; i < maxErrors; i++) {
        const d = diagnostics[i];
        const key = d.absFilePath + d.code + d.messageText + d.type;
        if (dups.has(key)) {
            continue;
        }
        dups.add(key);
        if (d.messageText) {
            if (typeof d.messageText.message === 'string') {
                d.messageText = d.messageText.message;
            }
            else if (typeof d.messageText === 'string' && d.messageText.indexOf('Error: ') === 0) {
                d.messageText = d.messageText.substr(7);
            }
        }
        cleaned.push(d);
    }
    return cleaned;
}
function splitLineBreaks(sourceText) {
    if (!sourceText)
        return [];
    sourceText = sourceText.replace(/\\r/g, '\n');
    return sourceText.split('\n');
}
const MAX_ERRORS = 15;

/**
 * SSR Attribute Names
 */
const SSR_VNODE_ID = 'ssrv';
const SSR_CHILD_ID = 'ssrc';
/**
 * Default style mode id
 */
const DEFAULT_STYLE_MODE = '$';
/**
 * Reusable empty obj/array
 * Don't add values to these!!
 */
const EMPTY_OBJ = {};
/**
 * Key Name to Key Code Map
 */
const KEY_CODE_MAP = {
    'enter': 13,
    'escape': 27,
    'space': 32,
    'tab': 9,
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40
};
/**
 * File names and value
 */
const BANNER = `Built with http://stenciljs.com`;
const COLLECTION_MANIFEST_FILE_NAME = 'collection-manifest.json';
const WEB_COMPONENTS_JSON_FILE_NAME = 'web-components.json';
const APP_NAMESPACE_REGEX = /["']__APP__['"]/g;

function hasServiceWorkerChanges(config, buildCtx) {
    if (config.devMode && !config.flags.serviceWorker) {
        return false;
    }
    const wwwServiceOutputs = config.outputTargets.filter(o => o.type === 'www' && o.serviceWorker && o.serviceWorker.swSrc);
    return wwwServiceOutputs.some(outputTarget => {
        return buildCtx.filesChanged.some(fileChanged => config.sys.path.basename(fileChanged).toLowerCase() === config.sys.path.basename(outputTarget.serviceWorker.swSrc).toLowerCase());
    });
}
/**
 * Test if a file is a typescript source file, such as .ts or .tsx.
 * However, d.ts files and spec.ts files return false.
 * @param filePath
 */
function isTsFile(filePath) {
    const parts = filePath.toLowerCase().split('.');
    if (parts.length > 1) {
        if (parts[parts.length - 1] === 'ts' || parts[parts.length - 1] === 'tsx') {
            if (parts.length > 2 && (parts[parts.length - 2] === 'd' || parts[parts.length - 2] === 'spec')) {
                return false;
            }
            return true;
        }
    }
    return false;
}
function isDtsFile(filePath) {
    const parts = filePath.toLowerCase().split('.');
    if (parts.length > 2) {
        return (parts[parts.length - 2] === 'd' && parts[parts.length - 1] === 'ts');
    }
    return false;
}
function hasFileExtension(filePath, extensions) {
    filePath = filePath.toLowerCase();
    return extensions.some(ext => filePath.endsWith('.' + ext));
}
function generatePreamble(config, opts = {}) {
    let preamble = [];
    if (config.preamble) {
        preamble = config.preamble.split('\n');
    }
    if (typeof opts.prefix === 'string') {
        opts.prefix.split('\n').forEach(c => {
            preamble.push(c);
        });
    }
    if (opts.defaultBanner === true) {
        preamble.push(BANNER);
    }
    if (typeof opts.suffix === 'string') {
        opts.suffix.split('\n').forEach(c => {
            preamble.push(c);
        });
    }
    if (preamble.length > 1) {
        preamble = preamble.map(l => ` * ${l}`);
        preamble.unshift(`/*!`);
        preamble.push(` */`);
        return preamble.join('\n');
    }
    if (opts.defaultBanner === true) {
        return `/*! ${BANNER} */`;
    }
    return '';
}
function buildError(diagnostics) {
    const diagnostic = {
        level: 'error',
        type: 'build',
        header: 'Build Error',
        messageText: 'build error',
        relFilePath: null,
        absFilePath: null,
        lines: []
    };
    diagnostics.push(diagnostic);
    return diagnostic;
}
function buildWarn(diagnostics) {
    const diagnostic = {
        level: 'warn',
        type: 'build',
        header: 'build warn',
        messageText: 'build warn',
        relFilePath: null,
        absFilePath: null,
        lines: []
    };
    diagnostics.push(diagnostic);
    return diagnostic;
}
function catchError(diagnostics, err, msg) {
    const diagnostic = {
        level: 'error',
        type: 'build',
        header: 'Build Error',
        messageText: 'build error',
        relFilePath: null,
        absFilePath: null,
        lines: []
    };
    if (typeof msg === 'string') {
        diagnostic.messageText = msg;
    }
    else if (err) {
        if (err.stack) {
            diagnostic.messageText = err.stack.toString();
        }
        else {
            if (err.message) {
                diagnostic.messageText = err.message.toString();
            }
            else {
                diagnostic.messageText = err.toString();
            }
        }
    }
    if (diagnostics && !shouldIgnoreError(diagnostic.messageText)) {
        diagnostics.push(diagnostic);
    }
}
const TASK_CANCELED_MSG = `task canceled`;
function shouldIgnoreError(msg) {
    return (msg === TASK_CANCELED_MSG);
}
function hasError(diagnostics) {
    if (!diagnostics) {
        return false;
    }
    return diagnostics.some(d => d.level === 'error' && d.type !== 'runtime');
}
function hasWarning(diagnostics) {
    if (!diagnostics) {
        return false;
    }
    return diagnostics.some(d => d.level === 'warn');
}
function pathJoin(config, ...paths) {
    return normalizePath(config.sys.path.join.apply(config.sys.path, paths));
}
function normalizePath(str) {
    // Convert Windows backslash paths to slash paths: foo\\bar ➔ foo/bar
    // https://github.com/sindresorhus/slash MIT
    // By Sindre Sorhus
    if (typeof str !== 'string') {
        throw new Error(`invalid path to normalize`);
    }
    str = str.trim();
    if (EXTENDED_PATH_REGEX.test(str) || NON_ASCII_REGEX.test(str)) {
        return str;
    }
    str = str.replace(SLASH_REGEX, '/');
    // always remove the trailing /
    // this makes our file cache look ups consistent
    if (str.charAt(str.length - 1) === '/') {
        const colonIndex = str.indexOf(':');
        if (colonIndex > -1) {
            if (colonIndex < str.length - 2) {
                str = str.substring(0, str.length - 1);
            }
        }
        else if (str.length > 1) {
            str = str.substring(0, str.length - 1);
        }
    }
    return str;
}
function isDocsPublic(jsDocs) {
    return !(jsDocs && jsDocs.tags.some((s) => s.name === 'internal'));
}
const EXTENDED_PATH_REGEX = /^\\\\\?\\/;
const NON_ASCII_REGEX = /[^\x00-\x80]+/;
const SLASH_REGEX = /\\/g;

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob = function isExtglob(str) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  var match;
  while ((match = /(\\).|([@?!+*]\(.*\))/g.exec(str))) {
    if (match[2]) return true;
    str = str.slice(match.index + match[0].length);
  }

  return false;
};

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */


var chars = { '{': '}', '(': ')', '[': ']'};

var isGlob = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob(str)) {
    return true;
  }

  var regex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
  var match;

  // optionally relax regex
  if (options && options.strict === false) {
    regex = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;
  }

  while ((match = regex.exec(str))) {
    if (match[2]) return true;
    var idx = match.index + match[0].length;

    // if an open bracket/brace/paren is escaped,
    // set the index to the next closing character
    var open = match[1];
    var close = open ? chars[open] : null;
    if (open && close) {
      var n = str.indexOf(close, idx);
      if (n !== -1) {
        idx = n + 1;
      }
    }

    str = str.slice(idx);
  }
  return false;
};

var concatMap = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var balancedMatch = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}

var braceExpansion = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balancedMatch('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balancedMatch('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length);
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}

var minimatch_1 = minimatch;
minimatch.Minimatch = Minimatch;

var path$1 = { sep: '/' };
try {
  path$1 = path__default;
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};


var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
};

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]';

// * => any number of characters
var star = qmark + '*?';

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!');

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true;
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/;

minimatch.filter = filter;
function filter (pattern, options) {
  options = options || {};
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {};
  b = b || {};
  var t = {};
  Object.keys(b).forEach(function (k) {
    t[k] = b[k];
  });
  Object.keys(a).forEach(function (k) {
    t[k] = a[k];
  });
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch;

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  };

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  };

  return m
};

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
};

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {};

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {};
  pattern = pattern.trim();

  // windows support: need to use /, not \
  if (path$1.sep !== '/') {
    pattern = pattern.split(path$1.sep).join('/');
  }

  this.options = options;
  this.set = [];
  this.pattern = pattern;
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;

  // make the set of regexps etc.
  this.make();
}

Minimatch.prototype.debug = function () {};

Minimatch.prototype.make = make;
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern;
  var options = this.options;

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true;
    return
  }
  if (!pattern) {
    this.empty = true;
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate();

  // step 2: expand braces
  var set = this.globSet = this.braceExpand();

  if (options.debug) this.debug = console.error;

  this.debug(this.pattern, set);

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  });

  this.debug(this.pattern, set);

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this);

  this.debug(this.pattern, set);

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  });

  this.debug(this.pattern, set);

  this.set = set;
}

Minimatch.prototype.parseNegate = parseNegate;
function parseNegate () {
  var pattern = this.pattern;
  var negate = false;
  var options = this.options;
  var negateOffset = 0;

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate;
    negateOffset++;
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset);
  this.negate = negate;
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
};

Minimatch.prototype.braceExpand = braceExpand;

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options;
    } else {
      options = {};
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern;

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return braceExpansion(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse;
var SUBPARSE = {};
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options;

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = '';
  var hasMagic = !!options.nocase;
  var escaping = false;
  // ? => one single character
  var patternListStack = [];
  var negativeLists = [];
  var stateChar;
  var inClass = false;
  var reClassStart = -1;
  var classStart = -1;
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)';
  var self = this;

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star;
          hasMagic = true;
        break
        case '?':
          re += qmark;
          hasMagic = true;
        break
        default:
          re += '\\' + stateChar;
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re);
      stateChar = false;
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c);

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c;
      escaping = false;
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar();
        escaping = true;
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class');
          if (c === '!' && i === classStart + 1) c = '^';
          re += c;
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar);
        clearStateChar();
        stateChar = c;
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar();
      continue

      case '(':
        if (inClass) {
          re += '(';
          continue
        }

        if (!stateChar) {
          re += '\\(';
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        });
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
        this.debug('plType %j %j', stateChar, re);
        stateChar = false;
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)';
          continue
        }

        clearStateChar();
        hasMagic = true;
        var pl = patternListStack.pop();
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close;
        if (pl.type === '!') {
          negativeLists.push(pl);
        }
        pl.reEnd = re.length;
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|';
          escaping = false;
          continue
        }

        clearStateChar();
        re += '|';
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar();

        if (inClass) {
          re += '\\' + c;
          continue
        }

        inClass = true;
        classStart = i;
        reClassStart = re.length;
        re += c;
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c;
          escaping = false;
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i);
          try {
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE);
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue
          }
        }

        // finish up the class.
        hasMagic = true;
        inClass = false;
        re += c;
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar();

        if (escaping) {
          // no need
          escaping = false;
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\';
        }

        re += c;

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1);
    sp = this.parse(cs, SUBPARSE);
    re = re.substr(0, reClassStart) + '\\[' + sp[0];
    hasMagic = hasMagic || sp[1];
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length);
    this.debug('setting tail', re, pl);
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\';
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    });

    this.debug('tail=%j\n   %s', tail, tail, pl, re);
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type;

    hasMagic = true;
    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
  }

  // handle trailing things that only matter at the very end.
  clearStateChar();
  if (escaping) {
    // trailing \\
    re += '\\\\';
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false;
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true;
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n];

    var nlBefore = re.slice(0, nl.reStart);
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
    var nlAfter = re.slice(nl.reEnd);

    nlLast += nlAfter;

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1;
    var cleanAfter = nlAfter;
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
    }
    nlAfter = cleanAfter;

    var dollar = '';
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$';
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
    re = newRe;
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re;
  }

  if (addPatternStart) {
    re = patternStart + re;
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : '';
  try {
    var regExp = new RegExp('^' + re + '$', flags);
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern;
  regExp._src = re;

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
};

Minimatch.prototype.makeRe = makeRe;
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set;

  if (!set.length) {
    this.regexp = false;
    return this.regexp
  }
  var options = this.options;

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot;
  var flags = options.nocase ? 'i' : '';

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|');

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$';

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$';

  try {
    this.regexp = new RegExp(re, flags);
  } catch (ex) {
    this.regexp = false;
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {};
  var mm = new Minimatch(pattern, options);
  list = list.filter(function (f) {
    return mm.match(f)
  });
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list
};

Minimatch.prototype.match = match;
function match (f, partial) {
  this.debug('match', f, this.pattern);
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options;

  // windows: need to use /, not \
  if (path$1.sep !== '/') {
    f = f.split(path$1.sep).join('/');
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit);
  this.debug(this.pattern, 'split', f);

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set;
  this.debug(this.pattern, 'set', set);

  // Find the basename of the path by looking for the last non-empty segment
  var filename;
  var i;
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i];
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i];
    var file = f;
    if (options.matchBase && pattern.length === 1) {
      file = [filename];
    }
    var hit = this.matchOne(file, pattern, partial);
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options;

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern });

  this.debug('matchOne', file.length, pattern.length);

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop');
    var p = pattern[pi];
    var f = file[fi];

    this.debug(pattern, p, f);

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f]);

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi;
      var pr = pi + 1;
      if (pr === pl) {
        this.debug('** at the end');
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr];

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee);
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr);
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue');
          fr++;
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit;
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase();
      } else {
        hit = f === p;
      }
      this.debug('string match', p, f, hit);
    } else {
      hit = f.match(p);
      this.debug('pattern match', p, f, hit);
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '');
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
};

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

function generateHmr(config, compilerCtx, buildCtx) {
    if (!config.devServer || !config.devServer.hotReplacement || !buildCtx.isRebuild) {
        return null;
    }
    const hmr = {};
    if (buildCtx.scriptsAdded.length > 0) {
        hmr.scriptsAdded = buildCtx.scriptsAdded.slice();
    }
    if (buildCtx.scriptsDeleted.length > 0) {
        hmr.scriptsDeleted = buildCtx.scriptsDeleted.slice();
    }
    const excludeHmr = excludeHmrFiles(config, config.devServer.excludeHmr, buildCtx.filesChanged);
    if (excludeHmr.length > 0) {
        hmr.excludeHmr = excludeHmr.slice();
    }
    if (buildCtx.hasIndexHtmlChanges) {
        hmr.indexHtmlUpdated = true;
    }
    if (buildCtx.hasServiceWorkerChanges) {
        hmr.serviceWorkerUpdated = true;
    }
    const componentsUpdated = getComponentsUpdated(compilerCtx, buildCtx);
    if (componentsUpdated) {
        hmr.componentsUpdated = componentsUpdated;
    }
    if (Object.keys(buildCtx.stylesUpdated).length > 0) {
        hmr.inlineStylesUpdated = buildCtx.stylesUpdated.map(s => {
            return {
                styleTag: s.styleTag,
                styleMode: s.styleMode,
                styleText: s.styleText,
                isScoped: s.isScoped
            };
        }).sort((a, b) => {
            if (a.styleTag < b.styleTag)
                return -1;
            if (a.styleTag > b.styleTag)
                return 1;
            return 0;
        });
    }
    const externalStylesUpdated = getExternalStylesUpdated(config, buildCtx);
    if (externalStylesUpdated) {
        hmr.externalStylesUpdated = externalStylesUpdated;
    }
    const externalImagesUpdated = getImagesUpdated(config, buildCtx);
    if (externalImagesUpdated) {
        hmr.imagesUpdated = externalImagesUpdated;
    }
    if (Object.keys(hmr).length === 0) {
        return null;
    }
    hmr.versionId = Date.now().toString().substring(6);
    return hmr;
}
function getComponentsUpdated(compilerCtx, buildCtx) {
    // find all of the components that would be affected from the file changes
    if (!buildCtx.filesChanged) {
        return null;
    }
    const filesToLookForImporters = buildCtx.filesChanged.filter(f => {
        return f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx');
    });
    if (filesToLookForImporters.length === 0) {
        return null;
    }
    const changedScriptFiles = [];
    const checkedFiles = [];
    const allModuleFiles = Object.keys(compilerCtx.moduleFiles)
        .map(tsFilePath => compilerCtx.moduleFiles[tsFilePath])
        .filter(moduleFile => moduleFile.localImports && moduleFile.localImports.length > 0);
    while (filesToLookForImporters.length > 0) {
        const scriptFile = filesToLookForImporters.shift();
        addTsFileImporters(allModuleFiles, filesToLookForImporters, checkedFiles, changedScriptFiles, scriptFile);
    }
    const tags = changedScriptFiles.reduce((tags, changedTsFile) => {
        const moduleFile = compilerCtx.moduleFiles[changedTsFile];
        if (moduleFile && moduleFile.cmpMeta && moduleFile.cmpMeta.tagNameMeta) {
            if (!tags.includes(moduleFile.cmpMeta.tagNameMeta)) {
                tags.push(moduleFile.cmpMeta.tagNameMeta);
            }
        }
        return tags;
    }, []);
    if (tags.length === 0) {
        return null;
    }
    return tags.sort();
}
function addTsFileImporters(allModuleFiles, filesToLookForImporters, checkedFiles, changedScriptFiles, scriptFile) {
    if (!changedScriptFiles.includes(scriptFile)) {
        // add it to our list of files to transpile
        changedScriptFiles.push(scriptFile);
    }
    if (checkedFiles.includes(scriptFile)) {
        // already checked this file
        return;
    }
    checkedFiles.push(scriptFile);
    // get all the ts files that import this ts file
    const tsFilesThatImportsThisTsFile = allModuleFiles.reduce((arr, moduleFile) => {
        moduleFile.localImports.forEach(localImport => {
            let checkFile = localImport;
            if (checkFile === scriptFile) {
                arr.push(moduleFile.sourceFilePath);
                return;
            }
            checkFile = localImport + '.tsx';
            if (checkFile === scriptFile) {
                arr.push(moduleFile.sourceFilePath);
                return;
            }
            checkFile = localImport + '.ts';
            if (checkFile === scriptFile) {
                arr.push(moduleFile.sourceFilePath);
                return;
            }
            checkFile = localImport + '.js';
            if (checkFile === scriptFile) {
                arr.push(moduleFile.sourceFilePath);
                return;
            }
        });
        return arr;
    }, []);
    // add all the files that import this ts file to the list of ts files we need to look through
    tsFilesThatImportsThisTsFile.forEach(tsFileThatImportsThisTsFile => {
        // if we add to this array, then the while look will keep working until it's empty
        filesToLookForImporters.push(tsFileThatImportsThisTsFile);
    });
}
function getExternalStylesUpdated(config, buildCtx) {
    if (!buildCtx.isRebuild) {
        return null;
    }
    const outputTargets = config.outputTargets.filter(o => o.type === 'www');
    if (outputTargets.length === 0) {
        return null;
    }
    const cssFiles = buildCtx.filesWritten.filter(f => f.endsWith('.css'));
    if (cssFiles.length === 0) {
        return null;
    }
    return cssFiles.map(cssFile => {
        return config.sys.path.basename(cssFile);
    }).sort();
}
function getImagesUpdated(config, buildCtx) {
    const outputTargets = config.outputTargets.filter(o => o.type === 'www');
    if (outputTargets.length === 0) {
        return null;
    }
    const imageFiles = buildCtx.filesChanged.reduce((arr, filePath) => {
        if (IMAGE_EXT.some(ext => filePath.toLowerCase().endsWith(ext))) {
            const fileName = config.sys.path.basename(filePath);
            if (!arr.includes(fileName)) {
                arr.push(fileName);
            }
        }
        return arr;
    }, []);
    if (imageFiles.length === 0) {
        return null;
    }
    return imageFiles.sort();
}
function excludeHmrFiles(config, excludeHmr, filesChanged) {
    const excludeFiles = [];
    if (!excludeHmr || excludeHmr.length === 0) {
        return excludeFiles;
    }
    excludeHmr.forEach(excludeHmr => {
        return filesChanged.map(fileChanged => {
            let shouldExclude = false;
            if (isGlob(excludeHmr)) {
                shouldExclude = minimatch_1(fileChanged, excludeHmr);
            }
            else {
                shouldExclude = (normalizePath(excludeHmr) === normalizePath(fileChanged));
            }
            if (shouldExclude) {
                config.logger.debug(`excludeHmr: ${fileChanged}`);
                excludeFiles.push(config.sys.path.basename(fileChanged));
            }
            return shouldExclude;
        }).some(r => r);
    });
    return excludeFiles.sort();
}
const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg'];

function generateBuildResults(config, compilerCtx, buildCtx) {
    const timeSpan = buildCtx.createTimeSpan(`generateBuildResults started`, true);
    const buildResults = {
        buildId: buildCtx.buildId,
        bundleBuildCount: buildCtx.bundleBuildCount,
        diagnostics: cleanDiagnostics(buildCtx.diagnostics),
        dirsAdded: buildCtx.dirsAdded.slice().sort(),
        dirsDeleted: buildCtx.dirsDeleted.slice().sort(),
        duration: Date.now() - buildCtx.startTime,
        filesAdded: buildCtx.filesAdded.slice().sort(),
        filesChanged: buildCtx.filesChanged.slice().sort(),
        filesDeleted: buildCtx.filesDeleted.slice().sort(),
        filesUpdated: buildCtx.filesUpdated.slice().sort(),
        filesWritten: buildCtx.filesWritten.sort(),
        hasError: hasError(buildCtx.diagnostics),
        hasSlot: buildCtx.hasSlot,
        hasSuccessfulBuild: compilerCtx.hasSuccessfulBuild,
        hasSvg: buildCtx.hasSvg,
        isRebuild: buildCtx.isRebuild,
        styleBuildCount: buildCtx.styleBuildCount,
        transpileBuildCount: buildCtx.transpileBuildCount,
        components: [],
        entries: generateBuildResultsEntries(config, buildCtx)
    };
    const hmr = generateHmr(config, compilerCtx, buildCtx);
    if (hmr) {
        buildResults.hmr = hmr;
    }
    buildResults.entries.forEach(en => {
        buildResults.components.push(...en.components);
    });
    timeSpan.finish(`generateBuildResults finished`);
    return buildResults;
}
function generateBuildResultsEntries(config, buildCtx) {
    const entries = buildCtx.entryModules.map(en => {
        return getEntryModule(config, buildCtx, en);
    });
    return entries;
}
function getEntryModule(config, buildCtx, en) {
    en.modeNames = en.modeNames || [];
    en.entryBundles = en.entryBundles || [];
    en.moduleFiles = en.moduleFiles || [];
    const entryCmps = [];
    buildCtx.entryPoints.forEach(ep => {
        entryCmps.push(...ep);
    });
    const buildEntry = getBuildEntry(config, entryCmps, en);
    const modes = en.modeNames.slice();
    if (modes.length > 1 || (modes.length === 1 && modes[0] !== DEFAULT_STYLE_MODE)) {
        buildEntry.modes = modes.sort();
    }
    en.moduleFiles.forEach(m => {
        const encap = m.cmpMeta.encapsulationMeta === 2 /* ScopedCss */ ? 'scoped' : m.cmpMeta.encapsulationMeta === 1 /* ShadowDom */ ? 'shadow' : 'none';
        if (!buildEntry.encapsulations.includes(encap)) {
            buildEntry.encapsulations.push(encap);
        }
    });
    buildEntry.encapsulations.sort();
    return buildEntry;
}
function getBuildEntry(config, entryCmps, en) {
    const buildEntry = {
        entryId: en.entryKey,
        components: en.moduleFiles.map(m => {
            const entryCmp = entryCmps.find(ec => {
                return ec.tag === m.cmpMeta.tagNameMeta;
            });
            const dependencyOf = ((entryCmp && entryCmp.dependencyOf) || []).slice().sort();
            const buildCmp = {
                tag: m.cmpMeta.tagNameMeta,
                dependencies: m.cmpMeta.dependencies.slice(),
                dependencyOf: dependencyOf
            };
            return buildCmp;
        }),
        bundles: en.entryBundles.map(entryBundle => {
            return getBuildBundle(config, entryBundle);
        }),
        inputs: en.moduleFiles.map(m => {
            return normalizePath(config.sys.path.relative(config.rootDir, m.jsFilePath));
        }).sort(),
        encapsulations: []
    };
    return buildEntry;
}
function getBuildBundle(config, entryBundle) {
    const buildBundle = {
        fileName: entryBundle.fileName,
        outputs: entryBundle.outputs.map(filePath => {
            return normalizePath(config.sys.path.relative(config.rootDir, filePath));
        }).sort()
    };
    buildBundle.size = entryBundle.text.length;
    if (typeof entryBundle.sourceTarget === 'string') {
        buildBundle.target = entryBundle.sourceTarget;
    }
    if (entryBundle.modeName !== DEFAULT_STYLE_MODE) {
        buildBundle.mode = entryBundle.modeName;
    }
    if (entryBundle.isScopedStyles) {
        buildBundle.scopedStyles = entryBundle.isScopedStyles;
    }
    return buildBundle;
}

function generateBuildStats(config, compilerCtx, buildCtx, buildResults) {
    return __awaiter(this, void 0, void 0, function* () {
        const statsTargets = config.outputTargets.filter(o => o.type === 'stats');
        yield Promise.all(statsTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield generateStatsOutputTarget(config, compilerCtx, buildCtx, buildResults, outputTarget);
        })));
    });
}
function generateStatsOutputTarget(config, compilerCtx, buildCtx, buildResults, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let jsonData;
            if (buildResults.hasError) {
                jsonData = {
                    diagnostics: buildResults.diagnostics
                };
            }
            else {
                const stats = {
                    compiler: {
                        name: config.sys.compiler.name,
                        version: config.sys.compiler.version
                    },
                    app: {
                        namespace: config.namespace,
                        fsNamespace: config.fsNamespace,
                        components: buildResults.components.length,
                        entries: buildResults.entries.length,
                        bundles: buildResults.entries.reduce((total, en) => {
                            total += en.bundles.length;
                            return total;
                        }, 0)
                    },
                    options: {
                        minifyJs: config.minifyJs,
                        minifyCss: config.minifyCss,
                        hashFileNames: config.hashFileNames,
                        hashedFileNameLength: config.hashedFileNameLength,
                        buildEs5: config.buildEs5
                    },
                    components: buildResults.components,
                    entries: buildResults.entries,
                    rollupResults: buildCtx.rollupResults,
                    sourceGraph: {},
                    collections: buildCtx.collections.map(c => {
                        return {
                            name: c.collectionName,
                            source: normalizePath(config.sys.path.relative(config.rootDir, c.moduleDir)),
                            tags: c.moduleFiles.map(m => m.cmpMeta.tagNameMeta).sort()
                        };
                    }).sort((a, b) => {
                        if (a.name < b.name)
                            return -1;
                        if (a.name > b.name)
                            return 1;
                        return 0;
                    })
                };
                const moduleFiles = compilerCtx.rootTsFiles.map(rootTsFile => {
                    return compilerCtx.moduleFiles[rootTsFile];
                });
                moduleFiles
                    .sort((a, b) => {
                    if (a.sourceFilePath < b.sourceFilePath)
                        return -1;
                    if (a.sourceFilePath > b.sourceFilePath)
                        return 1;
                    return 0;
                }).forEach(moduleFile => {
                    const key = normalizePath(config.sys.path.relative(config.rootDir, moduleFile.sourceFilePath));
                    stats.sourceGraph[key] = moduleFile.localImports.map(localImport => {
                        return normalizePath(config.sys.path.relative(config.rootDir, localImport));
                    }).sort();
                });
                jsonData = stats;
            }
            yield compilerCtx.fs.writeFile(outputTarget.file, JSON.stringify(jsonData, null, 2));
            yield compilerCtx.fs.commit();
        }
        catch (e) { }
    });
}

function getAppBuildDir(config, outputTarget) {
    return pathJoin(config, outputTarget.buildDir, config.fsNamespace);
}
function getRegistryFileName(config) {
    return `${config.fsNamespace}.registry.json`;
}
function getRegistryJson(config, outputTarget) {
    return pathJoin(config, getAppBuildDir(config, outputTarget), getRegistryFileName(config));
}
function getLoaderFileName(config) {
    return `${config.fsNamespace}.js`;
}
function getLoaderPath(config, outputTarget) {
    return pathJoin(config, outputTarget.buildDir, getLoaderFileName(config));
}
function getGlobalFileName(config) {
    return `${config.fsNamespace}.global.js`;
}
function getGlobalJsBuildPath(config, outputTarget) {
    return pathJoin(config, getAppBuildDir(config, outputTarget), getGlobalFileName(config));
}
function getCoreFilename(config, coreId, jsContent) {
    if (config.hashFileNames) {
        // prod mode renames the core file with its hashed content
        const contentHash = config.sys.generateContentHash(jsContent, config.hashedFileNameLength);
        return `${config.fsNamespace}.${contentHash}.js`;
    }
    // dev file name
    return `${config.fsNamespace}.${coreId}.js`;
}
function getDistCjsIndexPath(config, outputTarget) {
    return pathJoin(config, outputTarget.buildDir, 'index.js');
}
function getDistEsmDir(config, outputTarget, sourceTarget) {
    return pathJoin(config, outputTarget.buildDir, 'esm', sourceTarget || '');
}
function getDistEsmComponentsDir(config, outputTarget, sourceTarget) {
    return pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), 'build');
}
function getDistEsmIndexPath(config, outputTarget, sourceTarget) {
    return pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), 'index.js');
}
function getCoreEsmBuildPath(config, outputTarget, sourceTarget) {
    return pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getCoreEsmFileName(config));
}
function getDefineCustomElementsPath(config, outputTarget, sourceTarget) {
    return pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getDefineEsmFilename(config));
}
function getGlobalEsmBuildPath(config, outputTarget, sourceTarget) {
    return pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getGlobalEsmFileName(config));
}
function getComponentsEsmBuildPath(config, outputTarget, sourceTarget) {
    return pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getComponentsEsmFileName(config));
}
function getPolyfillsEsmBuildPath(config, outputTarget, sourceTarget) {
    return pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), `polyfills`);
}
function getCoreEsmFileName(config) {
    return `${config.fsNamespace}.core.js`;
}
function getDefineEsmFilename(config) {
    return `${config.fsNamespace}.define.js`;
}
function getGlobalEsmFileName(config) {
    return `${config.fsNamespace}.global.js`;
}
function getComponentsEsmFileName(config) {
    return `${config.fsNamespace}.components.js`;
}
function getLoaderEsmPath(config, outputTarget) {
    return pathJoin(config, outputTarget.buildDir, outputTarget.esmLoaderPath);
}
function getGlobalStyleFilename(config) {
    return `${config.fsNamespace}.css`;
}
function getBrowserFilename(bundleId, isScopedStyles, sourceTarget) {
    return `${bundleId}${isScopedStyles ? '.sc' : ''}${sourceTarget === 'es5' ? '.es5' : ''}.entry.js`;
}
function getEsmFilename(bundleId, isScopedStyles) {
    return `${bundleId}${isScopedStyles ? '.sc' : ''}.entry.js`;
}
function getComponentsDtsSrcFilePath(config) {
    return pathJoin(config, config.srcDir, GENERATED_DTS);
}
function getComponentsDtsTypesFilePath(config, outputTarget) {
    return pathJoin(config, outputTarget.typesDir, GENERATED_DTS);
}
const GENERATED_DTS = 'components.d.ts';

class FsWatchNormalizer {
    constructor(config, events) {
        this.config = config;
        this.events = events;
        this.dirsAdded = [];
        this.dirsDeleted = [];
        this.filesAdded = [];
        this.filesDeleted = [];
        this.filesUpdated = [];
    }
    fileUpdate(filePath) {
        filePath = normalizePath(filePath);
        if (shouldIgnore(filePath)) {
            return;
        }
        if (!this.filesUpdated.includes(filePath)) {
            this.log('file updated', filePath);
            this.filesUpdated.push(filePath);
            this.queue();
        }
    }
    fileAdd(filePath) {
        filePath = normalizePath(filePath);
        if (shouldIgnore(filePath)) {
            return;
        }
        if (!this.filesAdded.includes(filePath)) {
            this.log('file added', filePath);
            this.filesAdded.push(filePath);
            this.queue();
        }
    }
    fileDelete(filePath) {
        filePath = normalizePath(filePath);
        if (shouldIgnore(filePath)) {
            return;
        }
        if (!this.filesDeleted.includes(filePath)) {
            this.log('file deleted', filePath);
            this.filesDeleted.push(filePath);
            this.queue();
        }
    }
    dirAdd(dirPath) {
        dirPath = normalizePath(dirPath);
        if (!this.dirsAdded.includes(dirPath)) {
            this.log('directory added', dirPath);
            this.dirsAdded.push(dirPath);
            this.queue();
        }
    }
    dirDelete(dirPath) {
        dirPath = normalizePath(dirPath);
        if (!this.dirsDeleted.includes(dirPath)) {
            this.log('directory deleted', dirPath);
            this.dirsDeleted.push(dirPath);
            this.queue();
        }
    }
    queue() {
        // let's chill out for a few moments to see if anything else
        // comes in as something that changed in the file system
        clearTimeout(this.flushTmrId);
        this.flushTmrId = setTimeout(this.flush.bind(this), 40);
    }
    flush() {
        // create the watch results from all that we've learned today
        const fsWatchResults = {
            dirsAdded: this.dirsAdded.slice(),
            dirsDeleted: this.dirsDeleted.slice(),
            filesAdded: this.filesAdded.slice(),
            filesDeleted: this.filesDeleted.slice(),
            filesUpdated: this.filesUpdated.slice()
        };
        // reset the data for next time
        this.dirsAdded.length = 0;
        this.dirsDeleted.length = 0;
        this.filesAdded.length = 0;
        this.filesDeleted.length = 0;
        this.filesUpdated.length = 0;
        // send out the event of what we've learend
        this.events.emit('fsChange', fsWatchResults);
    }
    subscribe() {
        this.events.subscribe('fileUpdate', this.fileUpdate.bind(this));
        this.events.subscribe('fileAdd', this.fileAdd.bind(this));
        this.events.subscribe('fileDelete', this.fileDelete.bind(this));
        this.events.subscribe('dirAdd', this.dirAdd.bind(this));
        this.events.subscribe('dirDelete', this.dirDelete.bind(this));
    }
    log(msg, filePath) {
        const relPath = this.config.sys.path.relative(this.config.rootDir, filePath);
        this.config.logger.debug(`watch, ${msg}: ${relPath}, ${Date.now().toString().substring(5)}`);
    }
}
function shouldIgnore(filePath) {
    return filePath.endsWith(GENERATED_DTS);
}

function initFsWatch(config, compilerCtx, buildCtx) {
    // only create the watcher if this is a watch build
    // and we haven't created a watch listener already
    if (compilerCtx.hasWatch || !config.watch) {
        return false;
    }
    buildCtx.debug(`initFsWatch: ${config.sys.path.relative(config.rootDir, config.srcDir)}`);
    const fsWatchNormalizer = new FsWatchNormalizer(config, compilerCtx.events);
    fsWatchNormalizer.subscribe();
    compilerCtx.hasWatch = true;
    if (config.sys.createFsWatcher) {
        const fsWatcher = config.sys.createFsWatcher(compilerCtx.events, config.srcDir, {
            ignored: config.watchIgnoredRegex,
            ignoreInitial: true
        });
        if (fsWatcher && config.configPath) {
            config.configPath = normalizePath(config.configPath);
            fsWatcher.add(config.configPath);
        }
    }
    return true;
}

function writeCacheStats(config, compilerCtx, buildCtx) {
    if (!config.enableCacheStats) {
        return;
    }
    const statsPath = pathJoin(config, config.rootDir, 'stencil-cache-stats.json');
    config.logger.warn(`cache stats enabled for debugging, which is horrible for build times. Only enableCacheStats when debugging memory issues.`);
    const timeSpan = config.logger.createTimeSpan(`cache stats started: ${statsPath}`);
    let statsData = {};
    try {
        const dataStr = compilerCtx.fs.disk.readFileSync(statsPath);
        statsData = JSON.parse(dataStr);
    }
    catch (e) { }
    statsData['compilerCtx'] = statsData['compilerCtx'] || {};
    getObjectSize(statsData['compilerCtx'], compilerCtx);
    statsData['compilerCtx.cache.cacheFs.items'] = statsData['compilerCtx.cache.cacheFs.items'] || {};
    getObjectSize(statsData['compilerCtx.cache.cacheFs.items'], compilerCtx.cache['cacheFs']['items']);
    statsData['buildCtx'] = statsData['buildCtx'] || {};
    getObjectSize(statsData['buildCtx'], buildCtx);
    compilerCtx.fs.disk.writeFileSync(statsPath, JSON.stringify(statsData, null, 2));
    timeSpan.finish(`cache stats finished`);
}
function getObjectSize(data, obj) {
    if (obj) {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object') {
                const size = objectSizeEstimate(obj[key]);
                if (size > 20000) {
                    data[key] = data[key] || [];
                    data[key].push(size);
                }
            }
        });
    }
}
function objectSizeEstimate(obj) {
    if (!obj) {
        return 0;
    }
    const objectList = [];
    const stack = [obj];
    let bytes = 0;
    while (stack.length) {
        const value = stack.pop();
        if (typeof value === 'boolean') {
            bytes += 4;
        }
        else if (typeof value === 'string') {
            bytes += value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes += 8;
        }
        else if (typeof value === 'object' && !objectList.includes(value)) {
            objectList.push(value);
            for (const i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}

function buildFinish(config, compilerCtx, buildCtx, aborted) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasFinished && buildCtx.buildResults) {
            // we've already marked this build as finished and
            // already created the build results, just return these
            return buildCtx.buildResults;
        }
        buildCtx.debug(`${aborted ? 'aborted' : 'finished'} build, ${buildCtx.timestamp}`);
        // create the build results data
        buildCtx.buildResults = generateBuildResults(config, compilerCtx, buildCtx);
        // log any errors/warnings
        if (!buildCtx.hasFinished) {
            // haven't set this build as finished yet
            if (!buildCtx.hasPrintedResults) {
                config.logger.printDiagnostics(buildCtx.buildResults.diagnostics);
            }
            if (!compilerCtx.hasLoggedServerUrl && config.devServer && config.devServer.browserUrl && config.flags.serve) {
                // we've opened up the dev server
                // let's print out the dev server url
                config.logger.info(`dev server: ${config.logger.cyan(config.devServer.browserUrl)}`);
                compilerCtx.hasLoggedServerUrl = true;
            }
            if (buildCtx.isRebuild && buildCtx.buildResults.hmr && !aborted && buildCtx.isActiveBuild) {
                // this is a rebuild, and we've got hmr data
                // and this build hasn't been aborted
                logHmr(config, buildCtx);
            }
            // create a nice pretty message stating what happend
            const buildText = buildCtx.isRebuild ? 'rebuild' : 'build';
            const watchText = config.watch ? ', watching for changes...' : '';
            let buildStatus = 'finished';
            let statusColor = 'green';
            if (buildCtx.hasError) {
                // gosh darn, build had errors
                // ಥ_ಥ
                compilerCtx.lastBuildHadError = true;
                buildStatus = 'failed';
                statusColor = 'red';
            }
            else {
                // successful build!
                // ┏(°.°)┛ ┗(°.°)┓ ┗(°.°)┛ ┏(°.°)┓
                compilerCtx.hasSuccessfulBuild = true;
                compilerCtx.lastBuildHadError = false;
            }
            if (!aborted || (aborted && !compilerCtx.hasSuccessfulBuild)) {
                // print out the time it took to build
                // and add the duration to the build results
                buildCtx.timeSpan.finish(`${buildText} ${buildStatus}${watchText}`, statusColor, true, true);
                buildCtx.hasPrintedResults = true;
                // write the build stats
                yield generateBuildStats(config, compilerCtx, buildCtx, buildCtx.buildResults);
                // emit a buildFinish event for anyone who cares
                compilerCtx.events.emit('buildFinish', buildCtx.buildResults);
            }
            // write all of our logs to disk if config'd to do so
            // do this even if there are errors or not the active build
            config.logger.writeLogs(buildCtx.isRebuild);
            if (config.watch) {
                // this is a watch build
                // setup watch if we haven't done so already
                initFsWatch(config, compilerCtx, buildCtx);
            }
            else {
                // not a watch build, so lets destroy anything left open
                config.sys.destroy();
            }
        }
        // write cache stats only for memory debugging
        writeCacheStats(config, compilerCtx, buildCtx);
        // it's official, this build has finished
        buildCtx.hasFinished = true;
        if (buildCtx.isActiveBuild) {
            compilerCtx.isActivelyBuilding = false;
        }
        return buildCtx.buildResults;
    });
}
function logHmr(config, buildCtx) {
    // this is a rebuild, and we've got hmr data
    // and this build hasn't been aborted
    const hmr = buildCtx.buildResults.hmr;
    if (hmr.componentsUpdated) {
        cleanupUpdateMsg(config, `updated component`, hmr.componentsUpdated);
    }
    if (hmr.inlineStylesUpdated) {
        const inlineStyles = hmr.inlineStylesUpdated.map(s => s.styleTag).reduce((arr, v) => {
            if (!arr.includes(v)) {
                arr.push(v);
            }
            return arr;
        }, []);
        cleanupUpdateMsg(config, `updated style`, inlineStyles);
    }
    if (hmr.externalStylesUpdated) {
        cleanupUpdateMsg(config, `updated stylesheet`, hmr.externalStylesUpdated);
    }
    if (hmr.imagesUpdated) {
        cleanupUpdateMsg(config, `updated image`, hmr.imagesUpdated);
    }
}
function cleanupUpdateMsg(config, msg, fileNames) {
    if (fileNames.length > 0) {
        let fileMsg = '';
        if (fileNames.length > 7) {
            const remaining = fileNames.length - 6;
            fileNames = fileNames.slice(0, 6);
            fileMsg = fileNames.join(', ') + `, +${remaining} others`;
        }
        else {
            fileMsg = fileNames.join(', ');
        }
        if (fileNames.length > 1) {
            msg += 's';
        }
        config.logger.info(`${msg}: ${config.logger.cyan(fileMsg)}`);
    }
}

class BuildContext {
    constructor(config, compilerCtx) {
        this.config = config;
        this.compilerCtx = compilerCtx;
        this.appFileBuildCount = 0;
        this.buildId = -1;
        this.buildMessages = [];
        this.buildResults = null;
        this.bundleBuildCount = 0;
        this.collections = [];
        this.components = [];
        this.data = {};
        this.diagnostics = [];
        this.dirsAdded = [];
        this.dirsDeleted = [];
        this.entryModules = [];
        this.entryPoints = [];
        this.filesAdded = [];
        this.filesChanged = [];
        this.filesDeleted = [];
        this.filesUpdated = [];
        this.filesWritten = [];
        this.global = null;
        this.graphData = null;
        this.hasConfigChanges = false;
        this.hasCopyChanges = false;
        this.hasFinished = false;
        this.hasIndexHtmlChanges = false;
        this.hasPrintedResults = false;
        this.hasServiceWorkerChanges = false;
        this.hasScriptChanges = true;
        this.hasSlot = null;
        this.hasStyleChanges = true;
        this.hasSvg = null;
        this.indexBuildCount = 0;
        this.isRebuild = false;
        this.requiresFullBuild = true;
        this.scriptsAdded = [];
        this.scriptsDeleted = [];
        this.startTime = Date.now();
        this.styleBuildCount = 0;
        this.stylesUpdated = [];
        this.timeSpan = null;
        this.transpileBuildCount = 0;
    }
    start() {
        this.compilerCtx.isActivelyBuilding = true;
        // get the build id from the incremented activeBuildId
        ++this.compilerCtx.activeBuildId;
        if (this.compilerCtx.activeBuildId >= 100) {
            // reset the build id back to 0
            this.compilerCtx.activeBuildId = 0;
        }
        this.buildId = this.compilerCtx.activeBuildId;
        // print out a good message
        const msg = `${this.isRebuild ? 'rebuild' : 'build'}, ${this.config.fsNamespace}, ${this.config.devMode ? 'dev' : 'prod'} mode, started`;
        // create a timespan for this build
        this.timeSpan = this.createTimeSpan(msg);
        // create a build timestamp for this build
        this.timestamp = getBuildTimestamp();
        // debug log our new build
        this.debug(`start build, ${this.timestamp}`);
    }
    createTimeSpan(msg, debug) {
        if ((this.isActiveBuild && !this.hasFinished) || debug) {
            if (debug) {
                if (this.config.watch) {
                    msg = `${this.config.logger.cyan('[' + this.buildId + ']')} ${msg}`;
                }
            }
            const timeSpan = this.config.logger.createTimeSpan(msg, debug, this.buildMessages);
            if (!debug && this.compilerCtx.events) {
                this.compilerCtx.events.emit('buildLog', {
                    messages: this.buildMessages.slice()
                });
            }
            return {
                finish: (finishedMsg, color, bold, newLineSuffix) => {
                    if ((this.isActiveBuild && !this.hasFinished) || debug) {
                        if (debug) {
                            if (this.config.watch) {
                                finishedMsg = `${this.config.logger.cyan('[' + this.buildId + ']')} ${finishedMsg}`;
                            }
                        }
                        timeSpan.finish(finishedMsg, color, bold, newLineSuffix);
                        if (!debug) {
                            this.compilerCtx.events.emit('buildLog', {
                                messages: this.buildMessages.slice()
                            });
                        }
                    }
                }
            };
        }
        return {
            finish: () => { }
        };
    }
    debug(msg) {
        if (this.config.watch) {
            this.config.logger.debug(`${this.config.logger.cyan('[' + this.buildId + ']')} ${msg}`);
        }
        else {
            this.config.logger.debug(msg);
        }
    }
    get isActiveBuild() {
        return (this.compilerCtx.activeBuildId === this.buildId);
    }
    get hasError() {
        if (hasError(this.diagnostics)) {
            // remember if the last build had an error or not
            // this is useful if the next build should do a full build or not
            this.compilerCtx.lastBuildHadError = true;
            return true;
        }
        return false;
    }
    get hasWarning() {
        if (hasWarning(this.diagnostics)) {
            return true;
        }
        return false;
    }
    abort() {
        return __awaiter(this, void 0, void 0, function* () {
            return buildFinish(this.config, this.compilerCtx, this, true);
        });
    }
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
            return buildFinish(this.config, this.compilerCtx, this, false);
        });
    }
    validateTypesBuild() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasError || !this.isActiveBuild) {
                // no need to wait on this one since
                // we already aborted this build
                return;
            }
            if (!this.validateTypesPromise) {
                // there is no pending validate types promise
                // so it probably already finished
                // so no need to wait on anything
                return;
            }
            if (!this.config.watch) {
                // this is not a watch build, so we need to make
                // sure that the type validation has finished
                this.debug(`build, non-watch, waiting on validateTypes`);
                yield this.validateTypesPromise;
                this.debug(`build, non-watch, finished waiting on validateTypes`);
            }
        });
    }
}
function getBuildTimestamp() {
    const d = new Date();
    // YYYY-MM-DDThh:mm:ss
    let timestamp = d.getUTCFullYear() + '-';
    timestamp += ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-';
    timestamp += ('0' + d.getUTCDate()).slice(-2) + 'T';
    timestamp += ('0' + d.getUTCHours()).slice(-2) + ':';
    timestamp += ('0' + d.getUTCMinutes()).slice(-2) + ':';
    timestamp += ('0' + d.getUTCSeconds()).slice(-2);
    return timestamp;
}

class MarkdownTable {
    constructor() {
        this.rows = [];
    }
    addHeader(data) {
        this.addRow(data, true);
    }
    addRow(data, isHeader = false) {
        const colData = [];
        data.forEach(text => {
            const col = {
                text: escapeMarkdownTableColumn(text),
                width: text.length
            };
            colData.push(col);
        });
        this.rows.push({
            columns: colData,
            isHeader: isHeader
        });
    }
    toMarkdown() {
        return createTable(this.rows);
    }
}
function escapeMarkdownTableColumn(text) {
    text = text.replace(/\r?\n/g, ' ');
    text = text.replace(/\|/g, '\\|');
    return text;
}
function createTable(rows) {
    const content = [];
    if (rows.length === 0) {
        return content;
    }
    normalize(rows);
    const th = rows.find(r => r.isHeader);
    if (th) {
        const headerRow = createRow(th);
        content.push(headerRow);
        content.push(createBorder(th));
    }
    const tds = rows.filter(r => !r.isHeader);
    tds.forEach(td => {
        content.push(createRow(td));
    });
    return content;
}
function createBorder(th) {
    const border = {
        columns: [],
        isHeader: false
    };
    th.columns.forEach(c => {
        const borderCol = {
            text: '',
            width: c.width
        };
        while (borderCol.text.length < borderCol.width) {
            borderCol.text += '-';
        }
        border.columns.push(borderCol);
    });
    return createRow(border);
}
function createRow(row) {
    const content = ['| '];
    row.columns.forEach(c => {
        content.push(c.text);
        content.push(' | ');
    });
    return content.join('').trim();
}
function normalize(rows) {
    normalizeColumCount(rows);
    normalizeColumnWidth(rows);
}
function normalizeColumCount(rows) {
    let columnCount = 0;
    rows.forEach(r => {
        if (r.columns.length > columnCount) {
            columnCount = r.columns.length;
        }
    });
    rows.forEach(r => {
        while (r.columns.length < columnCount) {
            r.columns.push({
                text: ``,
                width: 0
            });
        }
    });
}
function normalizeColumnWidth(rows) {
    const columnCount = rows[0].columns.length;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        let longestText = 0;
        rows.forEach(r => {
            const col = r.columns[columnIndex];
            if (col.text.length > longestText) {
                longestText = col.text.length;
            }
        });
        rows.forEach(r => {
            const col = r.columns[columnIndex];
            col.width = longestText;
            while (col.text.length < longestText) {
                col.text += ' ';
            }
        });
    }
}
function getEventDetailType(eventType) {
    if (eventType && eventType.text && typeof eventType.text === 'string' && eventType.text !== 'void') {
        return eventType.text.trim();
    }
    return 'void';
}
function getMemberDocumentation(jsDoc) {
    if (jsDoc && typeof jsDoc.documentation === 'string') {
        return jsDoc.documentation.trim();
    }
    return '';
}
function getMemberType(jsDoc) {
    if (jsDoc && typeof jsDoc.type === 'string') {
        return jsDoc.type.trim();
    }
    return '';
}
function getMethodParameters({ parameters }) {
    if (parameters) {
        return parameters.map(({ name, type, documentation }) => ({
            name,
            type,
            docs: documentation
        }));
    }
    return [];
}
function getMethodReturns({ returns }) {
    if (returns) {
        return {
            type: returns.type,
            docs: returns.documentation
        };
    }
    return null;
}

const AUTO_GENERATE_COMMENT = `<!-- Auto Generated Below -->`;
const NOTE = `*Built with [StencilJS](https://stenciljs.com/)*`;

function generateDocData(config, compilerCtx, diagnostics) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            timestamp: getBuildTimestamp(),
            compiler: {
                name: config.sys.compiler.name,
                version: config.sys.compiler.version,
                typescriptVersion: config.sys.compiler.typescriptVersion
            },
            components: yield getComponents(config, compilerCtx, diagnostics)
        };
    });
}
function getComponents(config, compilerCtx, diagnostics) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmpDirectories = new Set();
        const promises = Object.keys(compilerCtx.moduleFiles)
            .sort()
            .filter(filePath => {
            const moduleFile = compilerCtx.moduleFiles[filePath];
            if (!moduleFile.cmpMeta || moduleFile.isCollectionDependency) {
                return false;
            }
            if (!isDocsPublic(moduleFile.cmpMeta.jsdoc)) {
                return false;
            }
            const dirPath = normalizePath(config.sys.path.dirname(filePath));
            if (cmpDirectories.has(dirPath)) {
                const warn = buildWarn(diagnostics);
                warn.relFilePath = dirPath;
                warn.messageText = `multiple components found in: ${dirPath}`;
                return false;
            }
            cmpDirectories.add(dirPath);
            return true;
        })
            .map((filePath) => __awaiter(this, void 0, void 0, function* () {
            const moduleFile = compilerCtx.moduleFiles[filePath];
            const dirPath = normalizePath(config.sys.path.dirname(filePath));
            const readmePath = normalizePath(config.sys.path.join(dirPath, 'readme.md'));
            const usagesDir = normalizePath(config.sys.path.join(dirPath, 'usage'));
            const membersMeta = Object.keys(moduleFile.cmpMeta.membersMeta)
                .sort()
                .map(memberName => [memberName, moduleFile.cmpMeta.membersMeta[memberName]])
                .filter(([_, member]) => isDocsPublic(member.jsdoc));
            const readme = yield getUserReadmeContent(compilerCtx, readmePath);
            return {
                dirPath,
                filePath,
                fileName: config.sys.path.basename(filePath),
                readmePath,
                usagesDir,
                tag: moduleFile.cmpMeta.tagNameMeta,
                readme,
                docs: generateDocs(readme, moduleFile.cmpMeta.jsdoc),
                docsTags: generateDocsTags(moduleFile.cmpMeta.jsdoc),
                usage: yield generateUsages(config, compilerCtx, usagesDir),
                encapsulation: getEncapsulation(moduleFile.cmpMeta),
                props: getProperties(membersMeta),
                methods: getMethods(membersMeta),
                events: getEvents(moduleFile.cmpMeta),
                styles: getStyles(moduleFile.cmpMeta)
            };
        }));
        return Promise.all(promises);
    });
}
function getEncapsulation(cmpMeta) {
    const encapsulation = cmpMeta.encapsulationMeta;
    if (encapsulation === 1 /* ShadowDom */) {
        return 'shadow';
    }
    else if (encapsulation === 2 /* ScopedCss */) {
        return 'scoped';
    }
    else {
        return 'none';
    }
}
function getProperties(members) {
    return members
        .filter(([_, member]) => member.memberType & (1 /* Prop */ | 2 /* PropMutable */))
        .map(([memberName, member]) => {
        return {
            name: memberName,
            type: member.jsdoc.type,
            mutable: member.memberType === 2 /* PropMutable */,
            attr: getAttrName(member),
            reflectToAttr: !!member.reflectToAttrib,
            docs: getMemberDocumentation(member.jsdoc),
            docsTags: generateDocsTags(member.jsdoc),
            default: member.jsdoc.default,
            optional: member.attribType ? member.attribType.optional : true,
            required: member.attribType ? member.attribType.required : false,
        };
    });
}
function getMethods(members) {
    return members
        .filter(([_, member]) => member.memberType & (32 /* Method */))
        .map(([memberName, member]) => {
        return {
            name: memberName,
            returns: getMethodReturns(member.jsdoc),
            signature: getMethodSignature(memberName, member.jsdoc),
            parameters: getMethodParameters(member.jsdoc),
            docs: getMemberDocumentation(member.jsdoc),
            docsTags: generateDocsTags(member.jsdoc),
        };
    });
}
function getEvents(cmpMeta) {
    if (!Array.isArray(cmpMeta.eventsMeta)) {
        return [];
    }
    return cmpMeta.eventsMeta.sort((a, b) => {
        if (a.eventName.toLowerCase() < b.eventName.toLowerCase())
            return -1;
        if (a.eventName.toLowerCase() > b.eventName.toLowerCase())
            return 1;
        return 0;
    })
        .filter(eventMeta => isDocsPublic(eventMeta.jsdoc))
        .map(eventMeta => {
        return {
            event: eventMeta.eventName,
            detail: getEventDetailType(eventMeta.eventType),
            bubbles: !!eventMeta.eventBubbles,
            cancelable: !!eventMeta.eventCancelable,
            composed: !!eventMeta.eventComposed,
            docs: getMemberDocumentation(eventMeta.jsdoc),
            docsTags: generateDocsTags(eventMeta.jsdoc),
        };
    });
}
function getMethodSignature(memberName, jsdoc) {
    return memberName + getMemberType(jsdoc);
}
function getStyles(cmpMeta) {
    if (!cmpMeta.styleDocs) {
        return [];
    }
    return cmpMeta.styleDocs.sort((a, b) => {
        if (a.annotation < b.annotation)
            return -1;
        if (a.annotation > b.annotation)
            return 1;
        if (a.name.toLowerCase() < b.name.toLowerCase())
            return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase())
            return 1;
        return 0;
    }).map(styleDoc => {
        return {
            name: styleDoc.name,
            annotation: styleDoc.annotation || '',
            docs: styleDoc.docs || ''
        };
    });
}
function getAttrName(memberMeta) {
    if (memberMeta.attribName) {
        const propType = memberMeta.propType;
        if (propType !== 0 /* Unknown */) {
            return memberMeta.attribName;
        }
    }
    return undefined;
}
function getUserReadmeContent(compilerCtx, readmePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingContent = yield compilerCtx.fs.readFile(readmePath);
            const userContentIndex = existingContent.indexOf(AUTO_GENERATE_COMMENT) - 1;
            if (userContentIndex >= 0) {
                return existingContent.substring(0, userContentIndex);
            }
        }
        catch (e) { }
        return undefined;
    });
}
function generateDocs(readme, jsdoc) {
    const docs = getMemberDocumentation(jsdoc);
    if (docs !== '' || !readme) {
        return docs;
    }
    let isContent = false;
    const lines = readme.split('\n');
    const contentLines = [];
    for (const line of lines) {
        const isHeader = line.startsWith('#');
        if (isHeader && isContent) {
            break;
        }
        if (!isHeader && !isContent) {
            isContent = true;
        }
        if (isContent) {
            contentLines.push(line);
        }
    }
    return contentLines.join('\n').trim();
}
function generateDocsTags(jsdoc) {
    return jsdoc.tags || [];
}
function generateUsages(config, compilerCtx, usagesDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const rtn = {};
        try {
            const usageFilePaths = yield compilerCtx.fs.readdir(usagesDir);
            const usages = {};
            yield Promise.all(usageFilePaths.map((f) => __awaiter(this, void 0, void 0, function* () {
                if (!f.isFile) {
                    return;
                }
                const fileName = config.sys.path.basename(f.relPath);
                if (!fileName.toLowerCase().endsWith('.md')) {
                    return;
                }
                const parts = fileName.split('.');
                parts.pop();
                const key = parts.join('.');
                usages[key] = yield compilerCtx.fs.readFile(f.absPath);
            })));
            Object.keys(usages).sort().forEach(key => {
                rtn[key] = usages[key];
            });
        }
        catch (e) { }
        return rtn;
    });
}

function generateWebComponentsJson(config, compilerCtx, distOutputs, docsData) {
    return __awaiter(this, void 0, void 0, function* () {
        const json = {
            'tags': docsData.components.map(cmp => ({
                'label': cmp.tag,
                'description': cmp.docs,
                'attributes': cmp.props.filter(p => p.attr).map(p => ({
                    'label': p.attr,
                    'description': p.docs,
                    'required': p.required
                }))
            }))
        };
        const jsonContent = JSON.stringify(json, null, 2);
        yield Promise.all(distOutputs.map((distOutput) => __awaiter(this, void 0, void 0, function* () {
            const filePath = normalizePath(config.sys.path.join(distOutput.buildDir, WEB_COMPONENTS_JSON_FILE_NAME));
            yield compilerCtx.fs.writeFile(filePath, jsonContent);
        })));
    });
}

function generateJsonDocs(compilerCtx, jsonOutputs, docsData) {
    return __awaiter(this, void 0, void 0, function* () {
        const json = Object.assign({}, docsData, { components: docsData.components.map(cmp => ({
                tag: cmp.tag,
                encapsulation: cmp.encapsulation,
                readme: cmp.readme,
                docs: cmp.docs,
                docsTags: cmp.docsTags,
                usage: cmp.usage,
                props: cmp.props,
                methods: cmp.methods,
                events: cmp.events,
                styles: cmp.styles,
            })) });
        const jsonContent = JSON.stringify(json, null, 2);
        yield Promise.all(jsonOutputs.map((jsonOutput) => __awaiter(this, void 0, void 0, function* () {
            yield compilerCtx.fs.writeFile(jsonOutput.file, jsonContent);
        })));
    });
}

function propsToMarkdown(props) {
    const content = [];
    if (props.length === 0) {
        return content;
    }
    content.push(`## Properties`);
    content.push(``);
    const table = new MarkdownTable();
    table.addHeader([
        'Property',
        'Attribute',
        'Description',
        'Type',
        'Default'
    ]);
    props.forEach(prop => {
        const propName = `\`${prop.name}\`${prop.required ? ' _(required)_' : ''}`;
        table.addRow([
            propName,
            prop.attr ? `\`${prop.attr}\`` : '--',
            prop.docs,
            `\`${prop.type}\``,
            `\`${prop.default}\``
        ]);
    });
    content.push(...table.toMarkdown());
    content.push(``);
    content.push(``);
    return content;
}

function eventsToMarkdown(events) {
    const content = [];
    if (events.length === 0) {
        return content;
    }
    content.push(`## Events`);
    content.push(``);
    const table = new MarkdownTable();
    table.addHeader([
        'Event',
        'Description',
        'Type'
    ]);
    events.forEach(ev => {
        table.addRow([
            `\`${ev.event}\``,
            ev.docs,
            `\`CustomEvent<${ev.detail}>\``,
        ]);
    });
    content.push(...table.toMarkdown());
    content.push(``);
    content.push(``);
    return content;
}

function methodsToMarkdown(methods) {
    const content = [];
    if (methods.length === 0) {
        return content;
    }
    content.push(`## Methods`);
    content.push(``);
    methods.forEach(method => {
        content.push(`### \`${method.signature}\``);
        content.push(``);
        content.push(method.docs);
        content.push(``);
        if (method.parameters.length > 0) {
            const parmsTable = new MarkdownTable();
            parmsTable.addHeader(['Name', 'Type', 'Description']);
            method.parameters.forEach(({ name, type, docs }) => {
                parmsTable.addRow(['`' + name + '`', '`' + type + '`', docs]);
            });
            content.push(`#### Parameters`);
            content.push(``);
            content.push(...parmsTable.toMarkdown());
            content.push(``);
        }
        if (method.returns) {
            content.push(`#### Returns`);
            content.push(``);
            content.push(`Type: \`${method.returns.type}\``);
            content.push(``);
            content.push(method.returns.docs);
            content.push(``);
        }
    });
    content.push(``);
    return content;
}

const isDef = (v) => v != null;
const toLowerCase = (str) => str.toLowerCase();
const toDashCase = (str) => toLowerCase(str.replace(/([A-Z0-9])/g, g => ' ' + g[0]).trim().replace(/ /g, '-'));
const dashToPascalCase = (str) => toLowerCase(str).split('-').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.substr(1);
const captializeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const noop = () => { };
const pluck = (obj, keys) => {
    return keys.reduce((final, key) => {
        if (obj[key]) {
            final[key] = obj[key];
        }
        return final;
    }, {});
};
const isObject = (val) => {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

function usageToMarkdown(usages) {
    const content = [];
    const merged = mergeUsages(usages);
    if (merged.length === 0) {
        return content;
    }
    content.push(`## Usage`);
    merged.forEach(({ name, text }) => {
        content.push('');
        content.push(`### ${captializeFirstLetter(name)}`);
        content.push('');
        content.push(text);
        content.push('');
    }),
        content.push('');
    content.push('');
    return content;
}
function mergeUsages(usages) {
    const keys = Object.keys(usages);
    const map = new Map();
    keys.forEach(key => {
        const usage = usages[key].trim();
        const array = map.get(usage) || [];
        array.push(key);
        map.set(usage, array);
    });
    const merged = [];
    map.forEach((value, key) => {
        merged.push({
            name: value.join(' / '),
            text: key
        });
    });
    return merged;
}

function stylesToMarkdown(styles) {
    const content = [];
    if (styles.length === 0) {
        return content;
    }
    content.push(`## CSS Custom Properties`);
    content.push(``);
    const table = new MarkdownTable();
    table.addHeader(['Name', 'Description']);
    styles.forEach(style => {
        table.addRow([
            `\`${style.name}\``,
            style.docs
        ]);
    });
    content.push(...table.toMarkdown());
    content.push(``);
    content.push(``);
    return content;
}

function generateReadmeDocs(config, compilerCtx, readmeOutputs, docs) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(docs.components.map((cmpData) => __awaiter(this, void 0, void 0, function* () {
            yield generateReadme(config, compilerCtx, readmeOutputs, cmpData);
        })));
    });
}
function generateReadme(config, compilerCtx, readmeOutputs, docsData) {
    return __awaiter(this, void 0, void 0, function* () {
        const isUpdate = !!docsData.readme;
        const userContent = isUpdate ? docsData.readme : getDefaultReadme(docsData);
        const content = generateMarkdown(userContent, docsData);
        const readmeContent = content.join('\n');
        yield Promise.all(readmeOutputs.map((readmeOutput) => __awaiter(this, void 0, void 0, function* () {
            if (readmeOutput.dir) {
                const relPath = config.sys.path.relative(config.srcDir, docsData.readmePath);
                const absPath = config.sys.path.join(readmeOutput.dir, relPath);
                const results = yield compilerCtx.fs.writeFile(absPath, readmeContent);
                if (results.changedContent) {
                    if (isUpdate) {
                        config.logger.info(`updated readme docs: ${docsData.tag}`);
                    }
                    else {
                        config.logger.info(`created readme docs: ${docsData.tag}`);
                    }
                }
            }
        })));
    });
}
function generateMarkdown(userContent, cmp) {
    return [
        userContent,
        AUTO_GENERATE_COMMENT,
        '',
        '',
        ...usageToMarkdown(cmp.usage),
        ...propsToMarkdown(cmp.props),
        ...eventsToMarkdown(cmp.events),
        ...methodsToMarkdown(cmp.methods),
        ...stylesToMarkdown(cmp.styles),
        `----------------------------------------------`,
        '',
        NOTE,
        ''
    ];
}
function getDefaultReadme(docsData) {
    return [
        `# ${docsData.tag}`,
        '',
        '',
        ''
    ].join('\n');
}

function generateCustomDocs(config, customOutputs, docsData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(customOutputs.map((customOutput) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield customOutput.generator(docsData);
            }
            catch (e) {
                config.logger.error(`uncaught custom docs error: ${e}`);
            }
        })));
    });
}

class BuildEvents {
    constructor() {
        this.evCallbacks = {};
    }
    subscribe(eventName, cb) {
        const evName = getEventName(eventName);
        if (!this.evCallbacks[evName]) {
            this.evCallbacks[evName] = [];
        }
        this.evCallbacks[evName].push(cb);
        return () => {
            this.unsubscribe(evName, cb);
        };
    }
    unsubscribe(eventName, cb) {
        const evName = getEventName(eventName);
        if (this.evCallbacks[evName]) {
            const index = this.evCallbacks[evName].indexOf(cb);
            if (index > -1) {
                this.evCallbacks[evName].splice(index, 1);
            }
        }
    }
    unsubscribeAll() {
        this.evCallbacks = {};
    }
    emit(eventName, ...args) {
        const evName = getEventName(eventName);
        const evCallbacks = this.evCallbacks[evName];
        if (evCallbacks) {
            evCallbacks.forEach(cb => {
                try {
                    cb.apply(this, args);
                }
                catch (e) {
                    console.log(e);
                }
            });
        }
    }
}
function getEventName(evName) {
    return evName.trim().toLowerCase();
}

class Cache {
    constructor(config, cacheFs) {
        this.config = config;
        this.cacheFs = cacheFs;
        this.failed = 0;
        this.skip = false;
    }
    initCacheDir() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config._isTesting) {
                return;
            }
            if (!this.config.enableCache) {
                this.config.logger.info(`cache optimizations disabled`);
                this.clearDiskCache();
                return;
            }
            this.config.logger.debug(`cache enabled, cacheDir: ${this.config.cacheDir}`);
            try {
                const readmeFilePath = this.config.sys.path.join(this.config.cacheDir, '_README.log');
                yield this.cacheFs.writeFile(readmeFilePath, CACHE_DIR_README);
            }
            catch (e) {
                this.config.logger.error(`Cache, initCacheDir: ${e}`);
                this.config.enableCache = false;
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.enableCache || this.skip) {
                return null;
            }
            if (this.failed >= MAX_FAILED) {
                if (!this.skip) {
                    this.skip = true;
                    this.config.logger.debug(`cache had ${this.failed} failed ops, skip disk ops for remander of build`);
                }
                return null;
            }
            let result;
            try {
                result = yield this.cacheFs.readFile(this.getCacheFilePath(key));
                this.failed = 0;
                this.skip = false;
            }
            catch (e) {
                this.failed++;
                result = null;
            }
            return result;
        });
    }
    put(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.enableCache) {
                return false;
            }
            let result;
            try {
                yield this.cacheFs.writeFile(this.getCacheFilePath(key), value);
                result = true;
            }
            catch (e) {
                this.failed++;
                result = false;
            }
            return result;
        });
    }
    createKey(domain, ...args) {
        if (!this.config.enableCache) {
            return '';
        }
        return domain + '_' + this.config.sys.generateContentHash(JSON.stringify(args), 32);
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.enableCache) {
                this.skip = false;
                this.failed = 0;
                yield this.cacheFs.commit();
                yield this.clearExpiredCache();
            }
        });
    }
    clear() {
        this.cacheFs.clearCache();
    }
    clearExpiredCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const lastClear = yield this.config.sys.storage.get(EXP_STORAGE_KEY);
            if (lastClear != null) {
                const diff = now - lastClear;
                if (diff < ONE_DAY) {
                    return;
                }
                const fs = this.cacheFs.disk;
                const cachedFileNames = yield fs.readdirSync(this.config.cacheDir);
                const cachedFilePaths = cachedFileNames.map(f => this.config.sys.path.join(this.config.cacheDir, f));
                let totalCleared = 0;
                const promises = cachedFilePaths.map((filePath) => __awaiter(this, void 0, void 0, function* () {
                    const stat = yield fs.stat(filePath);
                    const lastModified = stat.mtime.getTime();
                    const diff = now - lastModified;
                    if (diff > ONE_WEEK) {
                        yield fs.unlink(filePath);
                        totalCleared++;
                    }
                }));
                yield Promise.all(promises);
                this.config.logger.debug(`clearExpiredCache, cachedFileNames: ${cachedFileNames.length}, totalCleared: ${totalCleared}`);
            }
            this.config.logger.debug(`clearExpiredCache, set last clear`);
            yield this.config.sys.storage.set(EXP_STORAGE_KEY, now);
        });
    }
    clearDiskCache() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.cacheFs.access(this.config.cacheDir)) {
                yield this.cacheFs.remove(this.config.cacheDir);
                yield this.cacheFs.commit();
            }
        });
    }
    getCacheFilePath(key) {
        return this.config.sys.path.join(this.config.cacheDir, key) + '.log';
    }
    getMemoryStats() {
        return this.cacheFs.getMemoryStats();
    }
}
const MAX_FAILED = 100;
const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;
const EXP_STORAGE_KEY = `last_clear_expired_cache`;
const CACHE_DIR_README = `# Stencil Cache Directory

This directory contains files which the compiler has
cached for faster builds. To disable caching, please set
"enableCache: false" within the stencil config.

To change the cache directory, please update the
"cacheDir" property within the stencil config.
`;

class InMemoryFileSystem {
    constructor(disk, sys) {
        this.disk = disk;
        this.sys = sys;
        this.items = new Map();
    }
    accessData(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.getItem(filePath);
            const data = {
                exists: false,
                isDirectory: false,
                isFile: false
            };
            if (typeof item.exists === 'boolean') {
                data.exists = item.exists;
                data.isDirectory = item.isDirectory;
                data.isFile = item.isFile;
                return data;
            }
            try {
                const s = yield this.stat(filePath);
                item.exists = true;
                item.isDirectory = s.isDirectory;
                item.isFile = s.isFile;
                data.exists = item.exists;
                data.isDirectory = item.isDirectory;
                data.isFile = item.isFile;
            }
            catch (e) {
                item.exists = false;
            }
            return data;
        });
    }
    access(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.accessData(filePath);
            return data.exists;
        });
    }
    /**
     * Synchronous!!! Do not use!!!
     * (Only typescript transpiling is allowed to use)
     * @param filePath
     */
    accessSync(filePath) {
        const item = this.getItem(filePath);
        if (typeof item.exists === 'boolean') {
            return item.exists;
        }
        let hasAccess = false;
        try {
            const s = this.statSync(filePath);
            item.exists = true;
            item.isDirectory = s.isDirectory;
            item.isFile = s.isFile;
            hasAccess = true;
        }
        catch (e) {
            item.exists = false;
        }
        return hasAccess;
    }
    emptyDir(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.getItem(dirPath);
            yield this.removeDir(dirPath);
            item.isFile = false;
            item.isDirectory = true;
            item.queueWriteToDisk = true;
            item.queueDeleteFromDisk = false;
        });
    }
    readdir(dirPath, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            dirPath = normalizePath(dirPath);
            const collectedPaths = [];
            if (opts.inMemoryOnly) {
                let inMemoryDir = dirPath;
                if (!inMemoryDir.endsWith('/')) {
                    inMemoryDir += '/';
                }
                const inMemoryDirs = dirPath.split('/');
                this.items.forEach((d, filePath) => {
                    if (!filePath.startsWith(dirPath)) {
                        return;
                    }
                    const parts = filePath.split('/');
                    if (parts.length === inMemoryDirs.length + 1 || (opts.recursive && parts.length > inMemoryDirs.length)) {
                        if (d.exists) {
                            const item = {
                                absPath: filePath,
                                relPath: parts[inMemoryDirs.length],
                                isDirectory: d.isDirectory,
                                isFile: d.isFile
                            };
                            collectedPaths.push(item);
                        }
                    }
                });
            }
            else {
                // always a disk read
                yield this.readDirectory(dirPath, dirPath, opts, collectedPaths);
            }
            return collectedPaths.sort((a, b) => {
                if (a.absPath < b.absPath)
                    return -1;
                if (a.absPath > b.absPath)
                    return 1;
                return 0;
            });
        });
    }
    readDirectory(initPath, dirPath, opts, collectedPaths) {
        return __awaiter(this, void 0, void 0, function* () {
            // used internally only so we could easily recursively drill down
            // loop through this directory and sub directories
            // always a disk read!!
            const dirItems = yield this.disk.readdir(dirPath);
            // cache some facts about this path
            const item = this.getItem(dirPath);
            item.exists = true;
            item.isFile = false;
            item.isDirectory = true;
            yield Promise.all(dirItems.map((dirItem) => __awaiter(this, void 0, void 0, function* () {
                // let's loop through each of the files we've found so far
                // create an absolute path of the item inside of this directory
                const absPath = normalizePath(this.sys.path.join(dirPath, dirItem));
                const relPath = normalizePath(this.sys.path.relative(initPath, absPath));
                // get the fs stats for the item, could be either a file or directory
                const stats = yield this.stat(absPath);
                // cache some stats about this path
                const subItem = this.getItem(absPath);
                subItem.exists = true;
                subItem.isDirectory = stats.isDirectory;
                subItem.isFile = stats.isFile;
                collectedPaths.push({
                    absPath: absPath,
                    relPath: relPath,
                    isDirectory: stats.isDirectory,
                    isFile: stats.isFile
                });
                if (opts.recursive && stats.isDirectory) {
                    // looks like it's yet another directory
                    // let's keep drilling down
                    yield this.readDirectory(initPath, absPath, opts, collectedPaths);
                }
            })));
        });
    }
    readFile(filePath, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!opts || (opts.useCache === true || opts.useCache === undefined)) {
                const item = this.getItem(filePath);
                if (item.exists && typeof item.fileText === 'string') {
                    return item.fileText;
                }
            }
            const fileContent = yield this.disk.readFile(filePath);
            const item = this.getItem(filePath);
            if (fileContent.length < MAX_TEXT_CACHE) {
                item.exists = true;
                item.isFile = true;
                item.isDirectory = false;
                item.fileText = fileContent;
            }
            return fileContent;
        });
    }
    /**
     * Synchronous!!! Do not use!!!
     * (Only typescript transpiling is allowed to use)
     * @param filePath
     */
    readFileSync(filePath, opts) {
        if (!opts || (opts.useCache === true || opts.useCache === undefined)) {
            const item = this.getItem(filePath);
            if (item.exists && typeof item.fileText === 'string') {
                return item.fileText;
            }
        }
        const fileContent = this.disk.readFileSync(filePath);
        const item = this.getItem(filePath);
        if (fileContent.length < MAX_TEXT_CACHE) {
            item.exists = true;
            item.isFile = true;
            item.isDirectory = false;
            item.fileText = fileContent;
        }
        return fileContent;
    }
    remove(itemPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.stat(itemPath);
            if (stats.isDirectory) {
                yield this.removeDir(itemPath);
            }
            else if (stats.isFile) {
                yield this.removeItem(itemPath);
            }
        });
    }
    removeDir(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.getItem(dirPath);
            item.isFile = false;
            item.isDirectory = true;
            if (!item.queueWriteToDisk) {
                item.queueDeleteFromDisk = true;
            }
            try {
                const dirItems = yield this.readdir(dirPath, { recursive: true });
                yield Promise.all(dirItems.map((item) => __awaiter(this, void 0, void 0, function* () {
                    yield this.removeItem(item.absPath);
                })));
            }
            catch (e) {
                // do not throw error if the directory never existed
            }
        });
    }
    removeItem(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.getItem(filePath);
            if (!item.queueWriteToDisk) {
                item.queueDeleteFromDisk = true;
            }
        });
    }
    stat(itemPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.getItem(itemPath);
            if (typeof item.isDirectory !== 'boolean' || typeof item.isFile !== 'boolean') {
                const s = yield this.disk.stat(itemPath);
                item.exists = true;
                item.isDirectory = s.isDirectory();
                item.isFile = s.isFile();
                item.size = s.size;
            }
            return {
                exists: !!item.exists,
                isFile: !!item.isFile,
                isDirectory: !!item.isDirectory,
                size: typeof item.size === 'number' ? item.size : 0
            };
        });
    }
    /**
     * Synchronous!!! Do not use!!!
     * (Only typescript transpiling is allowed to use)
     * @param itemPath
     */
    statSync(itemPath) {
        const item = this.getItem(itemPath);
        if (typeof item.isDirectory !== 'boolean' || typeof item.isFile !== 'boolean') {
            const s = this.disk.statSync(itemPath);
            item.exists = true;
            item.isDirectory = s.isDirectory();
            item.isFile = s.isFile();
        }
        return {
            isFile: item.isFile,
            isDirectory: item.isDirectory
        };
    }
    writeFile(filePath, content, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = {};
            if (typeof filePath !== 'string') {
                throw new Error(`writeFile, invalid filePath: ${filePath}`);
            }
            if (typeof content !== 'string') {
                throw new Error(`writeFile, invalid content: ${filePath}`);
            }
            if (shouldIgnore$1(filePath)) {
                results.ignored = true;
                return results;
            }
            const item = this.getItem(filePath);
            item.exists = true;
            item.isFile = true;
            item.isDirectory = false;
            item.queueDeleteFromDisk = false;
            results.changedContent = item.fileText !== content;
            results.queuedWrite = false;
            item.fileText = content;
            if (opts && opts.useCache === false) {
                item.useCache = false;
            }
            if (opts && opts.inMemoryOnly) {
                // we don't want to actually write this to disk
                // just keep it in memory
                if (item.queueWriteToDisk) {
                    // we already queued this file to write to disk
                    // in that case we still need to do it
                    results.queuedWrite = true;
                }
                else {
                    // we only want this in memory and
                    // it wasn't already queued to be written
                    item.queueWriteToDisk = false;
                }
            }
            else if (opts && opts.immediateWrite) {
                // If this is an immediate write then write the file
                // and do not add it to the queue
                yield this.disk.writeFile(filePath, item.fileText);
            }
            else {
                // we want to write this to disk (eventually)
                // but only if the content is different
                // from our existing cached content
                if (!item.queueWriteToDisk && results.changedContent) {
                    // not already queued to be written
                    // and the content is different
                    item.queueWriteToDisk = true;
                    results.queuedWrite = true;
                }
            }
            return results;
        });
    }
    writeFiles(files, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const writtenFiles = yield Promise.all(Object.keys(files).map((filePath) => __awaiter(this, void 0, void 0, function* () {
                const writtenFile = yield this.writeFile(filePath, files[filePath], opts);
                return writtenFile;
            })));
            return writtenFiles;
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            const instructions = getCommitInstructions(this.sys.path, this.items);
            // ensure directories we need exist
            const dirsAdded = yield this.commitEnsureDirs(instructions.dirsToEnsure);
            // write all queued the files
            const filesWritten = yield this.commitWriteFiles(instructions.filesToWrite);
            // remove all the queued files to be deleted
            const filesDeleted = yield this.commitDeleteFiles(instructions.filesToDelete);
            // remove all the queued dirs to be deleted
            const dirsDeleted = yield this.commitDeleteDirs(instructions.dirsToDelete);
            instructions.filesToDelete.forEach(fileToDelete => {
                this.clearFileCache(fileToDelete);
            });
            instructions.dirsToDelete.forEach(dirToDelete => {
                this.clearDirCache(dirToDelete);
            });
            // return only the files that were
            return {
                filesWritten: filesWritten,
                filesDeleted: filesDeleted,
                dirsDeleted: dirsDeleted,
                dirsAdded: dirsAdded
            };
        });
    }
    commitEnsureDirs(dirsToEnsure) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirsAdded = [];
            for (const dirPath of dirsToEnsure) {
                const item = this.getItem(dirPath);
                if (item.exists && item.isDirectory) {
                    // already cached that this path is indeed an existing directory
                    continue;
                }
                try {
                    // cache that we know this is a directory on disk
                    item.exists = true;
                    item.isDirectory = true;
                    item.isFile = false;
                    yield this.disk.mkdir(dirPath);
                    dirsAdded.push(dirPath);
                }
                catch (e) { }
            }
            return dirsAdded;
        });
    }
    commitWriteFiles(filesToWrite) {
        const writtenFiles = Promise.all(filesToWrite.map((filePath) => __awaiter(this, void 0, void 0, function* () {
            if (typeof filePath !== 'string') {
                throw new Error(`unable to writeFile without filePath`);
            }
            return this.commitWriteFile(filePath);
        })));
        return writtenFiles;
    }
    commitWriteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.getItem(filePath);
            if (item.fileText == null) {
                throw new Error(`unable to find item fileText to write: ${filePath}`);
            }
            yield this.disk.writeFile(filePath, item.fileText);
            if (item.useCache === false) {
                this.clearFileCache(filePath);
            }
            return filePath;
        });
    }
    commitDeleteFiles(filesToDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedFiles = yield Promise.all(filesToDelete.map((filePath) => __awaiter(this, void 0, void 0, function* () {
                if (typeof filePath !== 'string') {
                    throw new Error(`unable to unlink without filePath`);
                }
                yield this.disk.unlink(filePath);
                return filePath;
            })));
            return deletedFiles;
        });
    }
    commitDeleteDirs(dirsToDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirsDeleted = [];
            for (const dirPath of dirsToDelete) {
                try {
                    yield this.disk.rmdir(dirPath);
                }
                catch (e) { }
                dirsDeleted.push(dirPath);
            }
            return dirsDeleted;
        });
    }
    clearDirCache(dirPath) {
        dirPath = normalizePath(dirPath);
        this.items.forEach((_, f) => {
            const filePath = this.sys.path.relative(dirPath, f).split('/')[0];
            if (!filePath.startsWith('.') && !filePath.startsWith('/')) {
                this.clearFileCache(f);
            }
        });
    }
    clearFileCache(filePath) {
        filePath = normalizePath(filePath);
        const item = this.items.get(filePath);
        if (item && !item.queueWriteToDisk) {
            this.items.delete(filePath);
        }
    }
    cancelDeleteFilesFromDisk(filePaths) {
        filePaths.forEach(filePath => {
            const item = this.getItem(filePath);
            if (item.isFile && item.queueDeleteFromDisk) {
                item.queueDeleteFromDisk = false;
            }
        });
    }
    cancelDeleteDirectoriesFromDisk(dirPaths) {
        dirPaths.forEach(dirPath => {
            const item = this.getItem(dirPath);
            if (item.queueDeleteFromDisk) {
                item.queueDeleteFromDisk = false;
            }
        });
    }
    getItem(itemPath) {
        itemPath = normalizePath(itemPath);
        let item = this.items.get(itemPath);
        if (item) {
            return item;
        }
        this.items.set(itemPath, item = {});
        return item;
    }
    clearCache() {
        this.items = new Map();
    }
    get keys() {
        return Array.from(this.items.keys()).sort();
    }
    getMemoryStats() {
        return `data length: ${this.items.size}`;
    }
}
function getCommitInstructions(path$$1, d) {
    const instructions = {
        filesToDelete: [],
        filesToWrite: [],
        dirsToDelete: [],
        dirsToEnsure: []
    };
    d.forEach((item, itemPath) => {
        if (item.queueWriteToDisk) {
            if (item.isFile) {
                instructions.filesToWrite.push(itemPath);
                const dir = normalizePath(path$$1.dirname(itemPath));
                if (!instructions.dirsToEnsure.includes(dir)) {
                    instructions.dirsToEnsure.push(dir);
                }
                const dirDeleteIndex = instructions.dirsToDelete.indexOf(dir);
                if (dirDeleteIndex > -1) {
                    instructions.dirsToDelete.splice(dirDeleteIndex, 1);
                }
                const fileDeleteIndex = instructions.filesToDelete.indexOf(itemPath);
                if (fileDeleteIndex > -1) {
                    instructions.filesToDelete.splice(fileDeleteIndex, 1);
                }
            }
            else if (item.isDirectory) {
                if (!instructions.dirsToEnsure.includes(itemPath)) {
                    instructions.dirsToEnsure.push(itemPath);
                }
                const dirDeleteIndex = instructions.dirsToDelete.indexOf(itemPath);
                if (dirDeleteIndex > -1) {
                    instructions.dirsToDelete.splice(dirDeleteIndex, 1);
                }
            }
        }
        else if (item.queueDeleteFromDisk) {
            if (item.isDirectory && !instructions.dirsToEnsure.includes(itemPath)) {
                instructions.dirsToDelete.push(itemPath);
            }
            else if (item.isFile && !instructions.filesToWrite.includes(itemPath)) {
                instructions.filesToDelete.push(itemPath);
            }
        }
        item.queueDeleteFromDisk = false;
        item.queueWriteToDisk = false;
    });
    // add all the ancestor directories for each directory too
    for (let i = 0, ilen = instructions.dirsToEnsure.length; i < ilen; i++) {
        const segments = instructions.dirsToEnsure[i].split('/');
        for (let j = 2; j < segments.length; j++) {
            const dir = segments.slice(0, j).join('/');
            if (!instructions.dirsToEnsure.includes(dir)) {
                instructions.dirsToEnsure.push(dir);
            }
        }
    }
    // sort directories so shortest paths are ensured first
    instructions.dirsToEnsure.sort((a, b) => {
        const segmentsA = a.split('/').length;
        const segmentsB = b.split('/').length;
        if (segmentsA < segmentsB)
            return -1;
        if (segmentsA > segmentsB)
            return 1;
        if (a.length < b.length)
            return -1;
        if (a.length > b.length)
            return 1;
        return 0;
    });
    // sort directories so longest paths are removed first
    instructions.dirsToDelete.sort((a, b) => {
        const segmentsA = a.split('/').length;
        const segmentsB = b.split('/').length;
        if (segmentsA < segmentsB)
            return 1;
        if (segmentsA > segmentsB)
            return -1;
        if (a.length < b.length)
            return 1;
        if (a.length > b.length)
            return -1;
        return 0;
    });
    instructions.dirsToEnsure.forEach(dirToEnsure => {
        const i = instructions.dirsToDelete.indexOf(dirToEnsure);
        if (i > -1) {
            instructions.dirsToDelete.splice(i, 1);
        }
    });
    instructions.dirsToDelete = instructions.dirsToDelete.filter(dir => {
        if (dir === '/' || dir.endsWith(':/')) {
            return false;
        }
        return true;
    });
    instructions.dirsToEnsure = instructions.dirsToEnsure.filter(dir => {
        const item = d.get(dir);
        if (item && item.exists && item.isDirectory) {
            return false;
        }
        if (dir === '/' || dir.endsWith(':/')) {
            return false;
        }
        return true;
    });
    return instructions;
}
function shouldIgnore$1(filePath) {
    filePath = filePath.trim().toLowerCase();
    return IGNORE.some(ignoreFile => filePath.endsWith(ignoreFile));
}
const IGNORE = [
    '.ds_store',
    '.gitignore',
    'desktop.ini',
    'thumbs.db'
];
// only cache if it's less than 5MB-ish (using .length as a rough guess)
// why 5MB? idk, seems like a good number for source text
// it's pretty darn large to cover almost ALL legitimate source files
// and anything larger is probably a REALLY large file and a rare case
// which we don't need to eat up memory for
const MAX_TEXT_CACHE = 5242880;

function getModuleFile(compilerCtx, sourceFilePath) {
    sourceFilePath = normalizePath(sourceFilePath);
    return compilerCtx.moduleFiles[sourceFilePath] = compilerCtx.moduleFiles[sourceFilePath] || {
        sourceFilePath: sourceFilePath,
        localImports: [],
        externalImports: [],
        potentialCmpRefs: []
    };
}
function getCompilerCtx(config, compilerCtx) {
    // reusable data between builds
    compilerCtx = compilerCtx || {};
    compilerCtx.isActivelyBuilding = false;
    compilerCtx.fs = compilerCtx.fs || new InMemoryFileSystem(config.sys.fs, config.sys);
    if (!compilerCtx.cache) {
        compilerCtx.cache = new Cache(config, new InMemoryFileSystem(config.sys.fs, config.sys));
        compilerCtx.cache.initCacheDir();
    }
    compilerCtx.events = compilerCtx.events || new BuildEvents();
    compilerCtx.appFiles = compilerCtx.appFiles || {};
    compilerCtx.moduleFiles = compilerCtx.moduleFiles || {};
    compilerCtx.collections = compilerCtx.collections || [];
    compilerCtx.resolvedCollections = compilerCtx.resolvedCollections || [];
    compilerCtx.compiledModuleJsText = compilerCtx.compiledModuleJsText || {};
    compilerCtx.compiledModuleLegacyJsText = compilerCtx.compiledModuleLegacyJsText || {};
    compilerCtx.lastBuildStyles = compilerCtx.lastBuildStyles || new Map();
    compilerCtx.cachedStyleMeta = compilerCtx.cachedStyleMeta || new Map();
    compilerCtx.lastComponentStyleInput = compilerCtx.lastComponentStyleInput || new Map();
    if (typeof compilerCtx.activeBuildId !== 'number') {
        compilerCtx.activeBuildId = -1;
    }
    return compilerCtx;
}
function resetCompilerCtx(compilerCtx) {
    compilerCtx.fs.clearCache();
    compilerCtx.cache.clear();
    compilerCtx.appFiles = {};
    compilerCtx.moduleFiles = {};
    compilerCtx.collections.length = 0;
    compilerCtx.resolvedCollections.length = 0;
    compilerCtx.compiledModuleJsText = {};
    compilerCtx.compiledModuleLegacyJsText = {};
    compilerCtx.compilerOptions = null;
    compilerCtx.cachedStyleMeta.clear();
    compilerCtx.lastComponentStyleInput.clear();
    compilerCtx.tsService = null;
    compilerCtx.rootTsFiles = null;
    // do NOT reset 'hasSuccessfulBuild'
}

function strickCheckDocs(config, docsData) {
    docsData.components.forEach(component => {
        component.props.forEach(prop => {
            if (!prop.docs) {
                config.logger.warn(`Property "${prop.name}" of "${component.tag}" is not documented. ${component.filePath}`);
            }
        });
        component.methods.forEach(prop => {
            if (!prop.docs) {
                config.logger.warn(`Method "${prop.name}" of "${component.tag}" is not documented. ${component.filePath}`);
            }
        });
        component.events.forEach(prop => {
            if (!prop.docs) {
                config.logger.warn(`Event "${prop.event}" of "${component.tag}" is not documented. ${component.filePath}`);
            }
        });
    });
}

function validateCollectionCompatibility(config, collection) {
    if (!collection.compiler) {
        // if there is no compiler data at all then this was probably
        // set on purpose and we should avoid doing any upgrading
        return [];
    }
    // fill in any default data if somehow it's missing entirely
    collection.compiler.name = collection.compiler.name || '@stencil/core';
    collection.compiler.version = collection.compiler.version || '0.0.1';
    collection.compiler.typescriptVersion = collection.compiler.typescriptVersion || '2.5.3';
    // figure out which compiler upgrades, if any, we need to do
    return calculateRequiredUpgrades(config, collection.compiler.version);
}
function calculateRequiredUpgrades(config, collectionVersion) {
    // CUSTOM CHECKS PER KNOWN BREAKING CHANGES
    // UNIT TEST UNIT TEST UNIT TEST
    const upgrades = [];
    if (config.sys.semver.lte(collectionVersion, '0.0.6-10')) {
        // 2017-10-04
        // between 0.0.5 and 0.0.6-11 we no longer have a custom JSX parser
        upgrades.push(0 /* JSX_Upgrade_From_0_0_5 */);
    }
    if (config.sys.semver.lte(collectionVersion, '0.1.0')) {
        // 2017-12-27
        // from 0.1.0 and earlier, metadata was stored separately
        // from the component constructor. Now it puts the metadata
        // as static properties on each component constructor
        upgrades.push(1 /* Metadata_Upgrade_From_0_1_0 */);
    }
    if (config.sys.semver.lte(collectionVersion, '0.2.0')) {
        // 2018-01-19
        // ensure all @stencil/core imports are removed
        upgrades.push(2 /* Remove_Stencil_Imports */);
    }
    if (config.sys.semver.lte(collectionVersion, '0.3.0')) {
        // 2018-01-30
        // add dependencies to component metadata
        upgrades.push(3 /* Add_Component_Dependencies */);
    }
    if (config.sys.semver.gte(collectionVersion, '0.11.5')) {
        // 2018-08-08
        // add dependencies to component metadata
        // this is used in create of components.d.ts for local vs
        // dist.
        upgrades.push(4 /* Add_Local_Intrinsic_Elements */);
    }
    return upgrades;
}

function updateStencilTypesImports(config, typesDir, dtsFilePath, dtsContent) {
    const dir = config.sys.path.dirname(dtsFilePath);
    const relPath = config.sys.path.relative(dir, typesDir);
    let coreDtsPath = normalizePath(config.sys.path.join(relPath, CORE_FILENAME));
    if (!coreDtsPath.startsWith('.')) {
        coreDtsPath = `./${coreDtsPath}`;
    }
    if (dtsContent.includes('JSX')) {
        dtsContent = `import '${coreDtsPath}';\n${dtsContent}`;
    }
    if (dtsContent.includes('@stencil/core')) {
        dtsContent = dtsContent.replace(/\@stencil\/core/g, coreDtsPath);
    }
    return dtsContent;
}
function copyStencilCoreDts(config, compilerCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const typesOutputTargets = config.outputTargets.filter(o => o.typesDir);
        yield Promise.all(typesOutputTargets.map((typesOutputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield copyStencilCoreDtsOutput(config, compilerCtx, typesOutputTarget);
        })));
    });
}
function copyStencilCoreDtsOutput(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const srcDts = yield config.sys.getClientCoreFile({
            staticName: 'declarations/stencil.core.d.ts'
        });
        const coreDtsFilePath = normalizePath(config.sys.path.join(outputTarget.typesDir, CORE_DTS));
        yield compilerCtx.fs.writeFile(coreDtsFilePath, srcDts);
    });
}
const CORE_FILENAME = `stencil.core`;
const CORE_DTS = `${CORE_FILENAME}.d.ts`;

function generateComponentTypes(config, compilerCtx, buildCtx, destination = 'src') {
    return __awaiter(this, void 0, void 0, function* () {
        // only gather components that are still root ts files we've found and have component metadata
        // the compilerCtx cache may still have files that may have been deleted/renamed
        const metadata = compilerCtx.rootTsFiles
            .slice()
            .sort()
            .map(tsFilePath => compilerCtx.moduleFiles[tsFilePath])
            .filter(moduleFile => moduleFile && moduleFile.cmpMeta);
        // Generate d.ts files for component types
        let componentTypesFileContent = yield generateComponentTypesFile(config, compilerCtx, metadata, destination);
        // immediately write the components.d.ts file to disk and put it into fs memory
        let componentsDtsFilePath = getComponentsDtsSrcFilePath(config);
        if (destination !== 'src') {
            componentsDtsFilePath = config.sys.path.resolve(destination, GENERATED_DTS);
            componentTypesFileContent = updateStencilTypesImports(config, destination, componentsDtsFilePath, componentTypesFileContent);
        }
        yield compilerCtx.fs.writeFile(componentsDtsFilePath, componentTypesFileContent, { immediateWrite: true });
        buildCtx.debug(`generated ${config.sys.path.relative(config.rootDir, componentsDtsFilePath)}`);
    });
}
/**
 * Generate the component.d.ts file that contains types for all components
 * @param config the project build configuration
 * @param options compiler options from tsconfig
 */
function generateComponentTypesFile(config, compilerCtx, metadata, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        let typeImportData = {};
        const allTypes = {};
        const defineGlobalIntrinsicElements = destination === 'src';
        const collectionTypesImports = yield getCollectionsTypeImports(config, compilerCtx, defineGlobalIntrinsicElements);
        const collectionTypesImportsString = collectionTypesImports.map((cti) => {
            return `import '${cti.pkgName}';`;
        })
            .join('\n');
        const modules = metadata.map(moduleFile => {
            const cmpMeta = moduleFile.cmpMeta;
            const importPath = normalizePath(config.sys.path.relative(config.srcDir, moduleFile.sourceFilePath)
                .replace(/\.(tsx|ts)$/, ''));
            typeImportData = updateReferenceTypeImports(config, typeImportData, allTypes, cmpMeta, moduleFile.sourceFilePath);
            return createTypesAsString(cmpMeta, importPath);
        });
        const componentsFileString = `
export namespace Components {
${modules.map(m => {
            return `${m.StencilComponents}${m.JSXElements}`;
        })
            .join('\n')}
}

declare global {
interface StencilElementInterfaces {
${modules.map(m => `'${m.tagNameAsPascal}': Components.${m.tagNameAsPascal};`).join('\n')}
}

interface StencilIntrinsicElements {
${modules.map(m => m.IntrinsicElements).join('\n')}
}

${modules.map(m => m.global).join('\n')}

interface HTMLElementTagNameMap {
${modules.map(m => m.HTMLElementTagNameMap).join('\n')}
}

interface ElementTagNameMap {
${modules.map(m => m.ElementTagNameMap).join('\n')}
}
`;
        const typeImportString = Object.keys(typeImportData).reduce((finalString, filePath) => {
            const typeData = typeImportData[filePath];
            let importFilePath;
            if (config.sys.path.isAbsolute(filePath)) {
                importFilePath = normalizePath('./' +
                    config.sys.path.relative(config.srcDir, filePath)).replace(/\.(tsx|ts)$/, '');
            }
            else {
                importFilePath = filePath;
            }
            finalString +=
                `import {
${typeData.sort(sortImportNames).map(td => {
                    if (td.localName === td.importName) {
                        return `${td.importName},`;
                    }
                    else {
                        return `${td.localName} as ${td.importName},`;
                    }
                }).join('\n')}
} from '${importFilePath}';\n`;
            return finalString;
        }, '');
        const header = `/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */`;
        const code = `
import '@stencil/core';

${collectionTypesImportsString}
${typeImportString}
${componentsFileString}
${defineGlobalIntrinsicElements ? generateLocalTypesFile() : ''}
}
`;
        return `${header}

${indentTypes(code)}`;
    });
}
function generateLocalTypesFile() {
    return `
  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}
`;
}
function indentTypes(code) {
    const INDENT_STRING = '  ';
    let indentSize = 0;
    return code
        .split('\n')
        .map(cl => {
        let newCode = cl.trim();
        if (newCode.length === 0) {
            return newCode;
        }
        if (newCode.startsWith('}') && indentSize > 0) {
            indentSize -= 1;
        }
        newCode = INDENT_STRING.repeat(indentSize) + newCode;
        if (newCode.endsWith('{')) {
            indentSize += 1;
        }
        return newCode;
    })
        .join('\n');
}
function sortImportNames(a, b) {
    const aName = a.localName.toLowerCase();
    const bName = b.localName.toLowerCase();
    if (aName < bName)
        return -1;
    if (aName > bName)
        return 1;
    if (a.localName < b.localName)
        return -1;
    if (a.localName > b.localName)
        return 1;
    return 0;
}
/**
 * Find all referenced types by a component and add them to the importDataObj and return the newly
 * updated importDataObj
 *
 * @param importDataObj key/value of type import file, each value is an array of imported types
 * @param cmpMeta the metadata for the component that is referencing the types
 * @param filePath the path of the component file
 * @param config general config that all of stencil uses
 */
function updateReferenceTypeImports(config, importDataObj, allTypes, cmpMeta, filePath) {
    const updateImportReferences = updateImportReferenceFactory(config, allTypes, filePath);
    importDataObj = Object.keys(cmpMeta.membersMeta)
        .filter((memberName) => {
        const member = cmpMeta.membersMeta[memberName];
        return [1 /* Prop */, 2 /* PropMutable */, 32 /* Method */].indexOf(member.memberType) !== -1 &&
            member.attribType.typeReferences;
    })
        .reduce((obj, memberName) => {
        const member = cmpMeta.membersMeta[memberName];
        return updateImportReferences(obj, member.attribType.typeReferences);
    }, importDataObj);
    cmpMeta.eventsMeta
        .filter((meta) => {
        return meta.eventType && meta.eventType.typeReferences;
    })
        .reduce((obj, meta) => {
        return updateImportReferences(obj, meta.eventType.typeReferences);
    }, importDataObj);
    return importDataObj;
}
function updateImportReferenceFactory(config, allTypes, filePath) {
    function getIncrememntTypeName(name) {
        if (allTypes[name] == null) {
            allTypes[name] = 1;
            return name;
        }
        allTypes[name] += 1;
        return `${name}${allTypes[name]}`;
    }
    return (obj, typeReferences) => {
        Object.keys(typeReferences).map(typeName => {
            return [typeName, typeReferences[typeName]];
        }).forEach(([typeName, type]) => {
            let importFileLocation;
            // If global then there is no import statement needed
            if (type.referenceLocation === 'global') {
                return;
                // If local then import location is the current file
            }
            else if (type.referenceLocation === 'local') {
                importFileLocation = filePath;
            }
            else if (type.referenceLocation === 'import') {
                importFileLocation = type.importReferenceLocation;
            }
            // If this is a relative path make it absolute
            if (importFileLocation.startsWith('.')) {
                importFileLocation =
                    config.sys.path.resolve(config.sys.path.dirname(filePath), importFileLocation);
            }
            obj[importFileLocation] = obj[importFileLocation] || [];
            // If this file already has a reference to this type move on
            if (obj[importFileLocation].find(df => df.localName === typeName)) {
                return;
            }
            const newTypeName = getIncrememntTypeName(typeName);
            obj[importFileLocation].push({
                localName: typeName,
                importName: newTypeName
            });
        });
        return obj;
    };
}
/**
 * Generate a string based on the types that are defined within a component.
 *
 * @param cmpMeta the metadata for the component that a type definition string is generated for
 * @param importPath the path of the component file
 */
function createTypesAsString(cmpMeta, _importPath) {
    const tagName = cmpMeta.tagNameMeta;
    const tagNameAsPascal = dashToPascalCase(cmpMeta.tagNameMeta);
    const interfaceName = `HTML${tagNameAsPascal}Element`;
    const jsxInterfaceName = `${tagNameAsPascal}Attributes`;
    const propAttributes = membersToPropAttributes(cmpMeta.membersMeta);
    const methodAttributes = membersToMethodAttributes(cmpMeta.membersMeta);
    const eventAttributes = membersToEventAttributes(cmpMeta.eventsMeta);
    const stencilComponentAttributes = attributesToMultiLineString(Object.assign({}, propAttributes, methodAttributes), false);
    const stencilComponentJSXAttributes = attributesToMultiLineString(Object.assign({}, propAttributes, eventAttributes), true);
    return {
        tagNameAsPascal: tagNameAsPascal,
        StencilComponents: `
interface ${tagNameAsPascal} {${stencilComponentAttributes !== '' ? `\n${stencilComponentAttributes}\n` : ''}}`,
        JSXElements: `
interface ${jsxInterfaceName} extends StencilHTMLAttributes {${stencilComponentJSXAttributes !== '' ? `\n${stencilComponentJSXAttributes}\n` : ''}}`,
        global: `
interface ${interfaceName} extends Components.${tagNameAsPascal}, HTMLStencilElement {}
var ${interfaceName}: {
  prototype: ${interfaceName};
  new (): ${interfaceName};
};`,
        HTMLElementTagNameMap: `'${tagName}': ${interfaceName}`,
        ElementTagNameMap: `'${tagName}': ${interfaceName};`,
        IntrinsicElements: `'${tagName}': Components.${jsxInterfaceName};`
    };
}
function attributesToMultiLineString(attributes, jsxAttributes, paddingString = '') {
    if (Object.keys(attributes).length === 0) {
        return '';
    }
    return Object.keys(attributes)
        .sort()
        .reduce((fullList, key) => {
        const type = attributes[key];
        if (type.public || !jsxAttributes) {
            if (type.jsdoc) {
                fullList.push(`/**`);
                fullList.push(` * ${type.jsdoc.replace(/\r?\n|\r/g, ' ')}`);
                fullList.push(` */`);
            }
            const optional = (jsxAttributes)
                ? !type.required
                : type.optional;
            fullList.push(`'${key}'${optional ? '?' : ''}: ${type.type};`);
        }
        return fullList;
    }, [])
        .map(item => `${paddingString}${item}`)
        .join(`\n`);
}
function membersToPropAttributes(membersMeta) {
    const interfaceData = Object.keys(membersMeta)
        .filter((memberName) => {
        return [1 /* Prop */, 2 /* PropMutable */].indexOf(membersMeta[memberName].memberType) !== -1;
    })
        .reduce((obj, memberName) => {
        const member = membersMeta[memberName];
        obj[memberName] = {
            type: member.attribType.text,
            optional: member.attribType.optional,
            required: member.attribType.required,
            public: isDocsPublic(member.jsdoc)
        };
        if (member.jsdoc) {
            obj[memberName].jsdoc = member.jsdoc.documentation;
        }
        return obj;
    }, {});
    return interfaceData;
}
function membersToMethodAttributes(membersMeta) {
    const interfaceData = Object.keys(membersMeta)
        .filter((memberName) => {
        return [32 /* Method */].indexOf(membersMeta[memberName].memberType) !== -1;
    })
        .reduce((obj, memberName) => {
        const member = membersMeta[memberName];
        obj[memberName] = {
            type: member.attribType.text,
            optional: false,
            required: false,
            public: isDocsPublic(member.jsdoc)
        };
        if (member.jsdoc) {
            obj[memberName].jsdoc = member.jsdoc.documentation;
        }
        return obj;
    }, {});
    return interfaceData;
}
function membersToEventAttributes(eventMetaList) {
    const interfaceData = eventMetaList
        .reduce((obj, eventMetaObj) => {
        const memberName = `on${captializeFirstLetter(eventMetaObj.eventName)}`;
        const eventType = (eventMetaObj.eventType) ? `CustomEvent<${eventMetaObj.eventType.text}>` : `CustomEvent`;
        obj[memberName] = {
            type: `(event: ${eventType}) => void`,
            optional: false,
            required: false,
            public: isDocsPublic(eventMetaObj.jsdoc)
        };
        if (eventMetaObj.jsdoc) {
            obj[memberName].jsdoc = eventMetaObj.jsdoc.documentation;
        }
        return obj;
    }, {});
    return interfaceData;
}
function getCollectionsTypeImports(config, compilerCtx, includeIntrinsicElements = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = compilerCtx.collections.map(collection => {
            const upgrades = validateCollectionCompatibility(config, collection);
            const shouldIncludeLocalIntrinsicElements = includeIntrinsicElements && upgrades.indexOf(4 /* Add_Local_Intrinsic_Elements */) !== -1;
            return getCollectionTypesImport(config, compilerCtx, collection, shouldIncludeLocalIntrinsicElements);
        });
        const collectionTypes = yield Promise.all(collections);
        return collectionTypes;
    });
}
function getCollectionTypesImport(config, compilerCtx, collection, includeIntrinsicElements = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let typeImport = null;
        try {
            const collectionDir = collection.moduleDir;
            const collectionPkgJson = config.sys.path.join(collectionDir, 'package.json');
            const pkgJsonStr = yield compilerCtx.fs.readFile(collectionPkgJson);
            const pkgData = JSON.parse(pkgJsonStr);
            if (pkgData.types && pkgData.collection) {
                typeImport = {
                    pkgName: pkgData.name,
                    includeIntrinsicElements
                };
            }
        }
        catch (e) {
            config.logger.debug(`getCollectionTypesImport: ${e}`);
        }
        if (typeImport == null) {
            config.logger.debug(`unabled to find "${collection.collectionName}" collection types`);
        }
        return typeImport;
    });
}

function writeAppCollections(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputTargets = config.outputTargets.filter(o => o.collectionDir);
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield writeAppCollection(config, compilerCtx, buildCtx, outputTarget);
        })));
    });
}
// this maps the json data to our internal data structure
// apping is so that the internal data structure "could"
// change, but the external user data will always use the same api
// over the top lame mapping functions is basically so we can loosly
// couple core component meta data between specific versions of the compiler
function writeAppCollection(config, compilerCtx, buildCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the absolute path to the directory where the collection will be saved
        const collectionDir = normalizePath(outputTarget.collectionDir);
        // create an absolute file path to the actual collection json file
        const collectionFilePath = normalizePath(config.sys.path.join(collectionDir, COLLECTION_MANIFEST_FILE_NAME));
        // serialize the collection into a json string and
        // add it to the list of files we need to write when we're ready
        const collectionData = serializeAppCollection(config, compilerCtx, collectionDir, buildCtx.entryModules, buildCtx.global);
        // don't bother serializing/writing the collection if we're not creating a distribution
        yield compilerCtx.fs.writeFile(collectionFilePath, JSON.stringify(collectionData, null, 2));
    });
}
function serializeAppCollection(config, compilerCtx, collectionDir, entryModules, globalModule) {
    // create the single collection we're going to fill up with data
    const collectionData = {
        components: [],
        collections: serializeCollectionDependencies(compilerCtx),
        compiler: {
            name: config.sys.compiler.name,
            version: config.sys.compiler.version,
            typescriptVersion: config.sys.compiler.typescriptVersion
        },
        bundles: []
    };
    // add component data for each of the collection files
    entryModules.forEach(entryModule => {
        entryModule.moduleFiles.forEach(moduleFile => {
            const cmpData = serializeComponent(config, collectionDir, moduleFile);
            if (cmpData) {
                collectionData.components.push(cmpData);
            }
        });
    });
    // sort it alphabetically, cuz
    collectionData.components.sort((a, b) => {
        if (a.tag < b.tag)
            return -1;
        if (a.tag > b.tag)
            return 1;
        return 0;
    });
    // set the global path if it exists
    serializeAppGlobal(config, collectionDir, collectionData, globalModule);
    serializeBundles(config, collectionData);
    // success!
    return collectionData;
}
function serializeCollectionDependencies(compilerCtx) {
    const collectionDeps = compilerCtx.collections.map(c => {
        const collectionDeps = {
            name: c.collectionName,
            tags: c.moduleFiles.filter(m => {
                return !!m.cmpMeta;
            }).map(m => m.cmpMeta.tagNameMeta).sort()
        };
        return collectionDeps;
    });
    return collectionDeps.sort((a, b) => {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    });
}
function parseCollectionData(config, collectionName, collectionDir, collectionJsonStr) {
    const collectionData = JSON.parse(collectionJsonStr);
    const collection = {
        collectionName: collectionName,
        dependencies: parseCollectionDependencies(collectionData),
        compiler: {
            name: collectionData.compiler.name,
            version: collectionData.compiler.version,
            typescriptVersion: collectionData.compiler.typescriptVersion
        },
        bundles: []
    };
    parseComponents(config, collectionDir, collectionData, collection);
    parseGlobal(config, collectionDir, collectionData, collection);
    parseBundles(collectionData, collection);
    return collection;
}
function parseComponents(config, collectionDir, collectionData, collection) {
    const componentsData = collectionData.components;
    if (!componentsData || !Array.isArray(componentsData)) {
        collection.moduleFiles = [];
        return;
    }
    collection.moduleFiles = componentsData.map(cmpData => {
        return parseComponentDataToModuleFile(config, collection, collectionDir, cmpData);
    });
}
function parseCollectionDependencies(collectionData) {
    const dependencies = [];
    if (Array.isArray(collectionData.collections)) {
        collectionData.collections.forEach(c => {
            dependencies.push(c.name);
        });
    }
    return dependencies;
}
function excludeFromCollection(config, cmpData) {
    // this is a component from a collection dependency
    // however, this project may also become a collection
    // for example, "ionicons" is a dependency of "ionic"
    // and "ionic" is it's own stand-alone collection, so within
    // ionic's collection we want ionicons to just work
    // cmpData is a component from a collection dependency
    // if this component is listed in this config's bundles
    // then we'll need to ensure it also becomes apart of this collection
    const isInBundle = config.bundles && config.bundles.some(bundle => {
        return bundle.components && bundle.components.some(tag => tag === cmpData.tag);
    });
    // if it's not in the config bundle then it's safe to exclude
    // this component from going into this build's collection
    return !isInBundle;
}
function serializeComponent(config, collectionDir, moduleFile) {
    if (!moduleFile || !moduleFile.cmpMeta || moduleFile.isCollectionDependency || moduleFile.excludeFromCollection) {
        return null;
    }
    const cmpData = {};
    const cmpMeta = moduleFile.cmpMeta;
    // get the current absolute path to our built js file
    // and figure out the relative path from the src dir
    const relToSrc = normalizePath(config.sys.path.relative(config.srcDir, moduleFile.jsFilePath));
    // figure out the absolute path when it's in the collection dir
    const compiledComponentAbsoluteFilePath = normalizePath(config.sys.path.join(collectionDir, relToSrc));
    // create a relative path from the collection file to the compiled component's output javascript file
    const compiledComponentRelativeFilePath = normalizePath(config.sys.path.relative(collectionDir, compiledComponentAbsoluteFilePath));
    // create a relative path to the directory where the compiled component's output javascript is sitting in
    const compiledComponentRelativeDirPath = normalizePath(config.sys.path.dirname(compiledComponentRelativeFilePath));
    serializeTag(cmpData, cmpMeta);
    serializeComponentDependencies(cmpData, cmpMeta);
    serializeComponentClass(cmpData, cmpMeta);
    serializeComponentPath(config, collectionDir, compiledComponentAbsoluteFilePath, cmpData);
    serializeStyles(config, compiledComponentRelativeDirPath, cmpData, cmpMeta);
    serializeAssetsDir(config, compiledComponentRelativeDirPath, cmpData, cmpMeta);
    serializeProps(cmpData, cmpMeta);
    serializeStates(cmpData, cmpMeta);
    serializeListeners(cmpData, cmpMeta);
    serializeMethods(cmpData, cmpMeta);
    serializeContextMember(cmpData, cmpMeta);
    serializeConnectMember(cmpData, cmpMeta);
    serializeHostElementMember(cmpData, cmpMeta);
    serializeEvents(cmpData, cmpMeta);
    serializeHost(cmpData, cmpMeta);
    serializeEncapsulation(cmpData, cmpMeta);
    return cmpData;
}
function parseComponentDataToModuleFile(config, collection, collectionDir, cmpData) {
    const moduleFile = {
        sourceFilePath: normalizePath(config.sys.path.join(collectionDir, cmpData.componentPath)),
        cmpMeta: {},
        isCollectionDependency: true,
        excludeFromCollection: excludeFromCollection(config, cmpData),
        localImports: [],
        externalImports: [],
        potentialCmpRefs: []
    };
    const cmpMeta = moduleFile.cmpMeta;
    parseTag(cmpData, cmpMeta);
    parseComponentDependencies(cmpData, cmpMeta);
    parseComponentClass(cmpData, cmpMeta);
    parseModuleJsFilePath(config, collectionDir, cmpData, moduleFile);
    parseStyles(config, collectionDir, cmpData, cmpMeta);
    parseAssetsDir(config, collectionDir, cmpData, cmpMeta);
    parseProps(config, collection, cmpData, cmpMeta);
    parseStates(cmpData, cmpMeta);
    parseListeners(cmpData, cmpMeta);
    parseMethods(cmpData, cmpMeta);
    parseContextMember(cmpData, cmpMeta);
    parseConnectMember(cmpData, cmpMeta);
    parseHostElementMember(cmpData, cmpMeta);
    parseEvents(cmpData, cmpMeta);
    parseHost(cmpData, cmpMeta);
    parseEncapsulation(cmpData, cmpMeta);
    // DEPRECATED: 2017-12-27
    parseWillChangeDeprecated(cmpData, cmpMeta);
    parseDidChangeDeprecated(cmpData, cmpMeta);
    return moduleFile;
}
function serializeTag(cmpData, cmpMeta) {
    cmpData.tag = cmpMeta.tagNameMeta;
}
function parseTag(cmpData, cmpMeta) {
    cmpMeta.tagNameMeta = cmpData.tag;
}
function serializeComponentPath(config, collectionDir, compiledComponentAbsoluteFilePath, cmpData) {
    // convert absolute path into a path that's relative to the collection file
    cmpData.componentPath = normalizePath(config.sys.path.relative(collectionDir, compiledComponentAbsoluteFilePath));
}
function parseModuleJsFilePath(config, collectionDir, cmpData, moduleFile) {
    // convert the path that's relative to the collection file
    // into an absolute path to the component's js file path
    if (typeof cmpData.componentPath !== 'string') {
        throw new Error(`parseModuleJsFilePath, "componentPath" missing on cmpData: ${cmpData.tag}`);
    }
    moduleFile.jsFilePath = normalizePath(config.sys.path.join(collectionDir, cmpData.componentPath));
    // remember the original component path from its collection
    moduleFile.originalCollectionComponentPath = cmpData.componentPath;
}
function serializeComponentDependencies(cmpData, cmpMeta) {
    cmpData.dependencies = (cmpMeta.dependencies || []).sort();
}
function parseComponentDependencies(cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.dependencies)) {
        cmpMeta.dependencies = [];
    }
    else {
        cmpMeta.dependencies = cmpData.dependencies.sort();
    }
}
function serializeComponentClass(cmpData, cmpMeta) {
    cmpData.componentClass = cmpMeta.componentClass;
}
function parseComponentClass(cmpData, cmpMeta) {
    cmpMeta.componentClass = cmpData.componentClass;
}
function serializeStyles(config, compiledComponentRelativeDirPath, cmpData, cmpMeta) {
    if (cmpMeta.stylesMeta) {
        cmpData.styles = {};
        const modeNames = Object.keys(cmpMeta.stylesMeta).map(m => m.toLowerCase()).sort();
        modeNames.forEach(modeName => {
            cmpData.styles[modeName] = serializeStyle(config, compiledComponentRelativeDirPath, cmpMeta.stylesMeta[modeName]);
        });
    }
}
function parseStyles(config, collectionDir, cmpData, cmpMeta) {
    const stylesData = cmpData.styles;
    cmpMeta.stylesMeta = {};
    if (stylesData) {
        Object.keys(stylesData).forEach(modeName => {
            modeName = modeName.toLowerCase();
            cmpMeta.stylesMeta[modeName] = parseStyle(config, collectionDir, cmpData, stylesData[modeName]);
        });
    }
}
function serializeStyle(config, compiledComponentRelativeDirPath, modeStyleMeta) {
    const modeStyleData = {};
    if (modeStyleMeta.externalStyles && modeStyleMeta.externalStyles.length > 0) {
        modeStyleData.stylePaths = modeStyleMeta.externalStyles.map(externalStyle => {
            // convert style paths which are relative to the component file
            // to be style paths that are relative to the collection file
            // we've already figured out the component's relative path from the collection file
            // use the value we already created in serializeComponentPath()
            // create a relative path from the collection file to the style path
            return normalizePath(config.sys.path.join(compiledComponentRelativeDirPath, externalStyle.cmpRelativePath));
        });
        modeStyleData.stylePaths.sort();
    }
    if (typeof modeStyleMeta.styleStr === 'string') {
        modeStyleData.style = modeStyleMeta.styleStr;
    }
    return modeStyleData;
}
function parseStyle(config, collectionDir, cmpData, modeStyleData) {
    const modeStyle = {
        styleStr: modeStyleData.style
    };
    if (modeStyleData.stylePaths) {
        modeStyle.externalStyles = modeStyleData.stylePaths.map(stylePath => {
            const externalStyle = {};
            externalStyle.absolutePath = normalizePath(config.sys.path.join(collectionDir, stylePath));
            externalStyle.cmpRelativePath = normalizePath(config.sys.path.relative(config.sys.path.dirname(cmpData.componentPath), stylePath));
            externalStyle.originalCollectionPath = normalizePath(stylePath);
            return externalStyle;
        });
    }
    return modeStyle;
}
function serializeAssetsDir(config, compiledComponentRelativeDirPath, cmpData, cmpMeta) {
    if (invalidArrayData(cmpMeta.assetsDirsMeta)) {
        return;
    }
    // convert asset paths which are relative to the component file
    // to be asset paths that are relative to the collection file
    // we've already figured out the component's relative path from the collection file
    // use the value we already created in serializeComponentPath()
    // create a relative path from the collection file to the asset path
    cmpData.assetPaths = cmpMeta.assetsDirsMeta.map(assetMeta => {
        return normalizePath(config.sys.path.join(compiledComponentRelativeDirPath, assetMeta.cmpRelativePath));
    }).sort();
}
function parseAssetsDir(config, collectionDir, cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.assetPaths)) {
        return;
    }
    cmpMeta.assetsDirsMeta = cmpData.assetPaths.map(assetsPath => {
        const assetsMeta = {
            absolutePath: normalizePath(config.sys.path.join(collectionDir, assetsPath)),
            cmpRelativePath: normalizePath(config.sys.path.relative(config.sys.path.dirname(cmpData.componentPath), assetsPath)),
            originalCollectionPath: normalizePath(assetsPath)
        };
        return assetsMeta;
    }).sort((a, b) => {
        if (a.cmpRelativePath < b.cmpRelativePath)
            return -1;
        if (a.cmpRelativePath > b.cmpRelativePath)
            return 1;
        return 0;
    });
}
function serializeProps(cmpData, cmpMeta) {
    if (!cmpMeta.membersMeta)
        return;
    Object.keys(cmpMeta.membersMeta).sort(nameSort).forEach(memberName => {
        const memberMeta = cmpMeta.membersMeta[memberName];
        if (memberMeta.memberType === 1 /* Prop */ || memberMeta.memberType === 2 /* PropMutable */) {
            cmpData.props = cmpData.props || [];
            const propData = {
                name: memberName
            };
            if (memberMeta.propType === 4 /* Boolean */) {
                propData.type = BOOLEAN_KEY;
            }
            else if (memberMeta.propType === 8 /* Number */) {
                propData.type = NUMBER_KEY;
            }
            else if (memberMeta.propType === 2 /* String */) {
                propData.type = STRING_KEY;
            }
            else if (memberMeta.propType === 1 /* Any */) {
                propData.type = ANY_KEY;
            }
            if (memberMeta.memberType === 2 /* PropMutable */) {
                propData.mutable = true;
            }
            if (memberMeta.reflectToAttrib) {
                propData.reflectToAttr = true;
            }
            if (typeof memberMeta.attribName === 'string') {
                propData.attr = memberMeta.attribName;
            }
            if (memberMeta.watchCallbacks && memberMeta.watchCallbacks.length > 0) {
                propData.watch = memberMeta.watchCallbacks.slice();
            }
            cmpData.props.push(propData);
        }
    });
}
function parseProps(config, collection, cmpData, cmpMeta) {
    const propsData = cmpData.props;
    if (invalidArrayData(propsData)) {
        return;
    }
    cmpMeta.membersMeta = cmpMeta.membersMeta || {};
    propsData.forEach(propData => {
        const member = cmpMeta.membersMeta[propData.name] = {};
        if (propData.mutable) {
            member.memberType = 2 /* PropMutable */;
        }
        else {
            member.memberType = 1 /* Prop */;
        }
        if (propData.reflectToAttr) {
            member.reflectToAttrib = true;
        }
        // the standard is the first character of the type is capitalized
        // however, lowercase and normalize for good measure
        const type = typeof propData.type === 'string' ? propData.type.toLowerCase().trim() : null;
        if (type === BOOLEAN_KEY.toLowerCase()) {
            member.propType = 4 /* Boolean */;
        }
        else if (type === NUMBER_KEY.toLowerCase()) {
            member.propType = 8 /* Number */;
        }
        else if (type === STRING_KEY.toLowerCase()) {
            member.propType = 2 /* String */;
        }
        else if (type === ANY_KEY.toLowerCase()) {
            member.propType = 1 /* Any */;
        }
        else if (!collection.compiler || !collection.compiler.version || config.sys.semver.lt(collection.compiler.version, '0.0.6-23')) {
            // older compilers didn't remember "any" type
            member.propType = 1 /* Any */;
        }
        if (member.propType) {
            // deprecated 0.7.3, 2018-03-19
            member.attribName = propData.name;
        }
        if (typeof propData.attr === 'string') {
            member.attribName = propData.attr;
        }
        if (!invalidArrayData(propData.watch)) {
            member.watchCallbacks = propData.watch.slice().sort();
        }
    });
}
function parseWillChangeDeprecated(cmpData, cmpMeta) {
    // DEPRECATED: 2017-12-27
    // previous way of storing change, 0.1.0 and below
    const propWillChangeData = cmpData.propsWillChange;
    if (invalidArrayData(propWillChangeData)) {
        return;
    }
    propWillChangeData.forEach((willChangeData) => {
        const propName = willChangeData.name;
        const methodName = willChangeData.method;
        cmpMeta.membersMeta = cmpMeta.membersMeta || {};
        cmpMeta.membersMeta[propName] = cmpMeta.membersMeta[propName] || {};
        cmpMeta.membersMeta[propName].watchCallbacks = cmpMeta.membersMeta[propName].watchCallbacks || [];
        cmpMeta.membersMeta[propName].watchCallbacks.push(methodName);
    });
}
function parseDidChangeDeprecated(cmpData, cmpMeta) {
    // DEPRECATED: 2017-12-27
    // previous way of storing change, 0.1.0 and below
    const propDidChangeData = cmpData.propsDidChange;
    if (invalidArrayData(propDidChangeData)) {
        return;
    }
    propDidChangeData.forEach((didChangeData) => {
        const propName = didChangeData.name;
        const methodName = didChangeData.method;
        cmpMeta.membersMeta = cmpMeta.membersMeta || {};
        cmpMeta.membersMeta[propName] = cmpMeta.membersMeta[propName] || {};
        cmpMeta.membersMeta[propName].watchCallbacks = cmpMeta.membersMeta[propName].watchCallbacks || [];
        cmpMeta.membersMeta[propName].watchCallbacks.push(methodName);
    });
}
function serializeStates(cmpData, cmpMeta) {
    if (!cmpMeta.membersMeta)
        return;
    Object.keys(cmpMeta.membersMeta).sort(nameSort).forEach(memberName => {
        const member = cmpMeta.membersMeta[memberName];
        if (member.memberType === 16 /* State */) {
            cmpData.states = cmpData.states || [];
            cmpData.states.push({
                name: memberName
            });
        }
    });
}
function parseStates(cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.states)) {
        return;
    }
    cmpMeta.membersMeta = cmpMeta.membersMeta || {};
    cmpData.states.forEach(stateData => {
        cmpMeta.membersMeta[stateData.name] = {
            memberType: 16 /* State */
        };
    });
}
function serializeListeners(cmpData, cmpMeta) {
    if (invalidArrayData(cmpMeta.listenersMeta)) {
        return;
    }
    cmpData.listeners = cmpMeta.listenersMeta.map(listenerMeta => {
        const listenerData = {
            event: listenerMeta.eventName,
            method: listenerMeta.eventMethodName
        };
        if (listenerMeta.eventPassive === false) {
            listenerData.passive = false;
        }
        if (listenerMeta.eventDisabled === true) {
            listenerData.enabled = false;
        }
        if (listenerMeta.eventCapture === false) {
            listenerData.capture = false;
        }
        return listenerData;
    }).sort((a, b) => {
        if (a.event.toLowerCase() < b.event.toLowerCase())
            return -1;
        if (a.event.toLowerCase() > b.event.toLowerCase())
            return 1;
        return 0;
    });
}
function parseListeners(cmpData, cmpMeta) {
    const listenersData = cmpData.listeners;
    if (invalidArrayData(listenersData)) {
        return;
    }
    cmpMeta.listenersMeta = listenersData.map(listenerData => {
        const listener = {
            eventName: listenerData.event,
            eventMethodName: listenerData.method,
            eventPassive: (listenerData.passive !== false),
            eventDisabled: (listenerData.enabled === false),
            eventCapture: (listenerData.capture !== false)
        };
        return listener;
    });
}
function serializeMethods(cmpData, cmpMeta) {
    if (!cmpMeta.membersMeta)
        return;
    Object.keys(cmpMeta.membersMeta).sort(nameSort).forEach(memberName => {
        const member = cmpMeta.membersMeta[memberName];
        if (member.memberType === 32 /* Method */) {
            cmpData.methods = cmpData.methods || [];
            cmpData.methods.push({
                name: memberName
            });
        }
    });
}
function parseMethods(cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.methods)) {
        return;
    }
    cmpMeta.membersMeta = cmpMeta.membersMeta || {};
    cmpData.methods.forEach(methodData => {
        cmpMeta.membersMeta[methodData.name] = {
            memberType: 32 /* Method */
        };
    });
}
function serializeContextMember(cmpData, cmpMeta) {
    if (!cmpMeta.membersMeta)
        return;
    Object.keys(cmpMeta.membersMeta).forEach(memberName => {
        const member = cmpMeta.membersMeta[memberName];
        if (member.ctrlId && member.memberType === 4 /* PropContext */) {
            cmpData.context = cmpData.context || [];
            cmpData.context.push({
                name: memberName,
                id: member.ctrlId
            });
        }
    });
}
function parseContextMember(cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.context)) {
        return;
    }
    cmpData.context.forEach(methodData => {
        if (methodData.id) {
            cmpMeta.membersMeta = cmpMeta.membersMeta || {};
            cmpMeta.membersMeta[methodData.name] = {
                memberType: 4 /* PropContext */,
                ctrlId: methodData.id
            };
        }
    });
}
function serializeConnectMember(cmpData, cmpMeta) {
    if (!cmpMeta.membersMeta)
        return;
    Object.keys(cmpMeta.membersMeta).forEach(memberName => {
        const member = cmpMeta.membersMeta[memberName];
        if (member.ctrlId && member.memberType === 8 /* PropConnect */) {
            cmpData.connect = cmpData.connect || [];
            cmpData.connect.push({
                name: memberName,
                tag: member.ctrlId
            });
        }
    });
}
function parseConnectMember(cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.connect)) {
        return;
    }
    cmpData.connect.forEach(methodData => {
        if (methodData.tag) {
            cmpMeta.membersMeta = cmpMeta.membersMeta || {};
            cmpMeta.membersMeta[methodData.name] = {
                memberType: 8 /* PropConnect */,
                ctrlId: methodData.tag
            };
        }
    });
}
function serializeHostElementMember(cmpData, cmpMeta) {
    if (!cmpMeta.membersMeta)
        return;
    Object.keys(cmpMeta.membersMeta).forEach(memberName => {
        const member = cmpMeta.membersMeta[memberName];
        if (member.memberType === 64 /* Element */) {
            cmpData.hostElement = {
                name: memberName
            };
        }
    });
}
function parseHostElementMember(cmpData, cmpMeta) {
    if (!cmpData.hostElement) {
        return;
    }
    cmpMeta.membersMeta = cmpMeta.membersMeta || {};
    cmpMeta.membersMeta[cmpData.hostElement.name] = {
        memberType: 64 /* Element */
    };
}
function serializeEvents(cmpData, cmpMeta) {
    if (invalidArrayData(cmpMeta.eventsMeta)) {
        return;
    }
    cmpData.events = cmpMeta.eventsMeta.map(eventMeta => {
        const eventData = {
            event: eventMeta.eventName
        };
        if (eventMeta.eventMethodName !== eventMeta.eventName) {
            eventData.method = eventMeta.eventMethodName;
        }
        if (eventMeta.eventBubbles === false) {
            eventData.bubbles = false;
        }
        if (eventMeta.eventCancelable === false) {
            eventData.cancelable = false;
        }
        if (eventMeta.eventComposed === false) {
            eventData.composed = false;
        }
        return eventData;
    }).sort((a, b) => {
        if (a.event.toLowerCase() < b.event.toLowerCase())
            return -1;
        if (a.event.toLowerCase() > b.event.toLowerCase())
            return 1;
        return 0;
    });
}
function parseEvents(cmpData, cmpMeta) {
    const eventsData = cmpData.events;
    if (invalidArrayData(eventsData)) {
        return;
    }
    cmpMeta.eventsMeta = eventsData.map(eventData => ({
        eventName: eventData.event,
        eventMethodName: (eventData.method) ? eventData.method : eventData.event,
        eventBubbles: (eventData.bubbles !== false),
        eventCancelable: (eventData.cancelable !== false),
        eventComposed: (eventData.composed !== false)
    }));
}
function serializeHost(cmpData, cmpMeta) {
    if (!cmpMeta.hostMeta || Array.isArray(cmpMeta.hostMeta) || !Object.keys(cmpMeta.hostMeta).length) {
        return;
    }
    cmpData.host = cmpMeta.hostMeta;
}
function parseHost(cmpData, cmpMeta) {
    if (!cmpData.host) {
        return;
    }
    cmpMeta.hostMeta = cmpData.host;
}
function serializeEncapsulation(cmpData, cmpMeta) {
    if (cmpMeta.encapsulationMeta === 1 /* ShadowDom */) {
        cmpData.shadow = true;
    }
    else if (cmpMeta.encapsulationMeta === 2 /* ScopedCss */) {
        cmpData.scoped = true;
    }
}
function parseEncapsulation(cmpData, cmpMeta) {
    if (cmpData.shadow === true) {
        cmpMeta.encapsulationMeta = 1 /* ShadowDom */;
    }
    else if (cmpData.scoped === true) {
        cmpMeta.encapsulationMeta = 2 /* ScopedCss */;
    }
    else {
        cmpMeta.encapsulationMeta = 0 /* NoEncapsulation */;
    }
}
function serializeAppGlobal(config, collectionDir, collectionData, globalModule) {
    if (!globalModule) {
        return;
    }
    // get the current absolute path to our built js file
    // and figure out the relative path from the src dir
    const relToSrc = normalizePath(config.sys.path.relative(config.srcDir, globalModule.jsFilePath));
    // figure out the absolute path when it's in the collection dir
    const compiledComponentAbsoluteFilePath = normalizePath(config.sys.path.join(collectionDir, relToSrc));
    // create a relative path from the collection file to the compiled output javascript file
    collectionData.global = normalizePath(config.sys.path.relative(collectionDir, compiledComponentAbsoluteFilePath));
}
function parseGlobal(config, collectionDir, collectionData, collection) {
    if (typeof collectionData.global !== 'string')
        return;
    collection.global = {
        sourceFilePath: normalizePath(config.sys.path.join(collectionDir, collectionData.global)),
        jsFilePath: normalizePath(config.sys.path.join(collectionDir, collectionData.global)),
        localImports: [],
        externalImports: [],
        potentialCmpRefs: []
    };
}
function serializeBundles(config, collectionData) {
    collectionData.bundles = config.bundles.map(b => {
        return {
            components: b.components.slice().sort()
        };
    });
}
function parseBundles(collectionData, collection) {
    if (invalidArrayData(collectionData.bundles)) {
        collection.bundles = [];
        return;
    }
    collection.bundles = collectionData.bundles.map(b => {
        return {
            components: b.components.slice().sort()
        };
    });
}
function invalidArrayData(arr) {
    return (!arr || !Array.isArray(arr) || arr.length === 0);
}
function nameSort(a, b) {
    if (a.toLowerCase() < b.toLowerCase())
        return -1;
    if (a.toLowerCase() > b.toLowerCase())
        return 1;
    return 0;
}
const BOOLEAN_KEY = 'Boolean';
const NUMBER_KEY = 'Number';
const STRING_KEY = 'String';
const ANY_KEY = 'Any';

function parseCollectionModule(config, compilerCtx, pkgJsonFilePath, pkgData) {
    // note this MUST be synchronous because this is used during transpile
    const collectionName = pkgData.name;
    let collection = compilerCtx.collections.find(c => c.collectionName === collectionName);
    if (collection) {
        // we've already cached the collection, no need for another resolve/readFile/parse
        // thought being that /node_modules/ isn't changing between watch builds
        return collection;
    }
    // get the root directory of the dependency
    const collectionPackageRootDir = config.sys.path.dirname(pkgJsonFilePath);
    // figure out the full path to the collection collection file
    const collectionFilePath = pathJoin(config, collectionPackageRootDir, pkgData.collection);
    const relPath = config.sys.path.relative(config.rootDir, collectionFilePath);
    config.logger.debug(`load collection: ${collectionName}, ${relPath}`);
    // we haven't cached the collection yet, let's read this file
    // sync on purpose :(
    const collectionJsonStr = compilerCtx.fs.readFileSync(collectionFilePath);
    // get the directory where the collection collection file is sitting
    const collectionDir = normalizePath(config.sys.path.dirname(collectionFilePath));
    // parse the json string into our collection data
    collection = parseCollectionData(config, collectionName, collectionDir, collectionJsonStr);
    if (pkgData.module && pkgData.module !== pkgData.main) {
        collection.hasExports = true;
    }
    // remember the source of this collection node_module
    collection.moduleDir = collectionPackageRootDir;
    // append any collection data
    collection.moduleFiles.forEach(collectionModuleFile => {
        if (!compilerCtx.moduleFiles[collectionModuleFile.jsFilePath]) {
            compilerCtx.moduleFiles[collectionModuleFile.jsFilePath] = collectionModuleFile;
        }
    });
    // cache it for later yo
    compilerCtx.collections.push(collection);
    return collection;
}

function getCollections(config, compilerCtx, collections, moduleFile, importNode) {
    if (!importNode.moduleSpecifier || !compilerCtx || !collections) {
        return;
    }
    const moduleId = importNode.moduleSpecifier.text;
    // see if we can add this collection dependency
    addCollection(config, compilerCtx, collections, moduleFile, config.rootDir, moduleId);
}
function addCollection(config, compilerCtx, collections, moduleFile, resolveFromDir, moduleId) {
    if (moduleId.startsWith('.') || moduleId.startsWith('/')) {
        // not a node module import, so don't bother
        return;
    }
    moduleFile.externalImports = moduleFile.externalImports || [];
    if (!moduleFile.externalImports.includes(moduleId)) {
        moduleFile.externalImports.push(moduleId);
        moduleFile.externalImports.sort();
    }
    if (compilerCtx.resolvedCollections.includes(moduleId)) {
        // we've already handled this collection moduleId before
        return;
    }
    // cache that we've already parsed this
    compilerCtx.resolvedCollections.push(moduleId);
    let pkgJsonFilePath;
    try {
        // get the full package.json file path
        pkgJsonFilePath = normalizePath(config.sys.resolveModule(resolveFromDir, moduleId));
    }
    catch (e) {
        // it's someone else's job to handle unresolvable paths
        return;
    }
    if (pkgJsonFilePath === 'package.json') {
        // the resolved package is actually this very same package, so whatever
        return;
    }
    // open up and parse the package.json
    // sync on purpose :(
    const pkgJsonStr = compilerCtx.fs.readFileSync(pkgJsonFilePath);
    const pkgData = JSON.parse(pkgJsonStr);
    if (!pkgData.collection || !pkgData.types) {
        // this import is not a stencil collection
        return;
    }
    // this import is a stencil collection
    // let's parse it and gather all the module data about it
    // internally it'll cached collection data if we've already done this
    const collection = parseCollectionModule(config, compilerCtx, pkgJsonFilePath, pkgData);
    // check if we already added this collection to the build context
    const alreadyHasCollection = collections.some(c => {
        return c.collectionName === collection.collectionName;
    });
    if (alreadyHasCollection) {
        // we already have this collection in our build context
        return;
    }
    // let's add the collection to the build context
    collections.push(collection);
    if (Array.isArray(collection.dependencies)) {
        // this collection has more collections
        // let's keep digging down and discover all of them
        collection.dependencies.forEach(dependencyModuleId => {
            const resolveFromDir = config.sys.path.dirname(pkgJsonFilePath);
            addCollection(config, compilerCtx, collections, moduleFile, resolveFromDir, dependencyModuleId);
        });
    }
}

/**
 * Ok, so formatting overkill, we know. But whatever, it makes for great
 * error reporting within a terminal. So, yeah, let's code it up, shall we?
 */
function loadTypeScriptDiagnostics(config, resultsDiagnostics, tsDiagnostics) {
    const maxErrors = Math.min(tsDiagnostics.length, MAX_ERRORS);
    for (let i = 0; i < maxErrors; i++) {
        resultsDiagnostics.push(loadTypeScriptDiagnostic(config, tsDiagnostics[i]));
    }
}
function loadTypeScriptDiagnostic(config, tsDiagnostic) {
    const d = {
        level: 'warn',
        type: 'typescript',
        language: 'typescript',
        header: 'TypeScript',
        code: tsDiagnostic.code.toString(),
        messageText: formatMessageText(tsDiagnostic),
        relFilePath: null,
        absFilePath: null,
        lines: []
    };
    if (tsDiagnostic.category === ts.DiagnosticCategory.Error) {
        d.level = 'error';
    }
    if (tsDiagnostic.file) {
        d.absFilePath = normalizePath(tsDiagnostic.file.fileName);
        if (config) {
            d.relFilePath = normalizePath(config.sys.path.relative(config.cwd, d.absFilePath));
            if (!d.relFilePath.includes('/')) {
                d.relFilePath = './' + d.relFilePath;
            }
        }
        const sourceText = tsDiagnostic.file.text;
        const srcLines = splitLineBreaks(sourceText);
        const posData = tsDiagnostic.file.getLineAndCharacterOfPosition(tsDiagnostic.start);
        const errorLine = {
            lineIndex: posData.line,
            lineNumber: posData.line + 1,
            text: srcLines[posData.line],
            errorCharStart: posData.character,
            errorLength: Math.max(tsDiagnostic.length, 1)
        };
        d.lineNumber = errorLine.lineNumber;
        d.columnNumber = errorLine.errorCharStart;
        d.lines.push(errorLine);
        if (errorLine.errorLength === 0 && errorLine.errorCharStart > 0) {
            errorLine.errorLength = 1;
            errorLine.errorCharStart--;
        }
        if (errorLine.lineIndex > 0) {
            const previousLine = {
                lineIndex: errorLine.lineIndex - 1,
                lineNumber: errorLine.lineNumber - 1,
                text: srcLines[errorLine.lineIndex - 1],
                errorCharStart: -1,
                errorLength: -1
            };
            d.lines.unshift(previousLine);
        }
        if (errorLine.lineIndex + 1 < srcLines.length) {
            const nextLine = {
                lineIndex: errorLine.lineIndex + 1,
                lineNumber: errorLine.lineNumber + 1,
                text: srcLines[errorLine.lineIndex + 1],
                errorCharStart: -1,
                errorLength: -1
            };
            d.lines.push(nextLine);
        }
    }
    return d;
}
function formatMessageText(tsDiagnostic) {
    let diagnosticChain = tsDiagnostic.messageText;
    if (typeof diagnosticChain === 'string') {
        return diagnosticChain;
    }
    const ignoreCodes = [];
    const isStencilConfig = tsDiagnostic.file.fileName.includes('stencil.config');
    if (isStencilConfig) {
        ignoreCodes.push(2322);
    }
    let result = '';
    while (diagnosticChain) {
        if (!ignoreCodes.includes(diagnosticChain.code)) {
            result += diagnosticChain.messageText + ' ';
        }
        diagnosticChain = diagnosticChain.next;
    }
    if (isStencilConfig) {
        result = result.replace(`type 'StencilConfig'`, `Stencil Config`);
        result = result.replace(`Object literal may only specify known properties, but `, ``);
        result = result.replace(`Object literal may only specify known properties, and `, ``);
    }
    return result.trim();
}

function getUserCompilerOptions(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (compilerCtx.compilerOptions) {
            return compilerCtx.compilerOptions;
        }
        let compilerOptions = Object.assign({}, DEFAULT_COMPILER_OPTIONS);
        try {
            const tsconfigFilePath = normalizePath(config.tsconfig);
            const tsconfigResults = ts.readConfigFile(tsconfigFilePath, ts.sys.readFile);
            if (tsconfigResults.error) {
                if (!config._isTesting) {
                    buildCtx.diagnostics.push(loadTypeScriptDiagnostic(config, tsconfigResults.error));
                }
            }
            else {
                const parseResult = ts.convertCompilerOptionsFromJson(tsconfigResults.config.compilerOptions, '.');
                if (parseResult.errors && parseResult.errors.length > 0) {
                    loadTypeScriptDiagnostics(config, buildCtx.diagnostics, parseResult.errors);
                }
                else {
                    compilerOptions = Object.assign({}, compilerOptions, parseResult.options);
                }
            }
        }
        catch (e) {
            config.logger.debug(`getUserCompilerOptions: ${e}`);
        }
        if (config._isTesting) {
            compilerOptions.module = ts.ModuleKind.CommonJS;
        }
        // apply user config to tsconfig
        compilerOptions.rootDir = config.srcDir;
        // during the transpile we'll write the output
        // to the correct location(s)
        compilerOptions.outDir = undefined;
        // generate .d.ts files when generating a distribution and in prod mode
        const typesOutputTarget = config.outputTargets.find(o => !!o.typesDir);
        if (typesOutputTarget) {
            compilerOptions.declaration = true;
            compilerOptions.declarationDir = typesOutputTarget.typesDir;
        }
        else {
            compilerOptions.declaration = false;
        }
        if (compilerOptions.module !== DEFAULT_COMPILER_OPTIONS.module) {
            config.logger.warn(`To improve bundling, it is always recommended to set the tsconfig.json “module” setting to “esnext”. Note that the compiler will automatically handle bundling both modern and legacy builds.`);
        }
        if (compilerOptions.target !== DEFAULT_COMPILER_OPTIONS.target) {
            config.logger.warn(`To improve bundling, it is always recommended to set the tsconfig.json “target” setting to "es2017". Note that the compiler will automatically handle transpilation for ES5-only browsers.`);
        }
        if (compilerOptions.esModuleInterop !== true) {
            config.logger.warn(`To improve module interoperability, it is highly recommend to set the tsconfig.json "esModuleInterop" setting to "true". This update allows star imports written as: import * as foo from "foo", to instead be written with the familiar default syntax of: import foo from "foo". For more info, please see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html`);
        }
        if (compilerOptions.allowSyntheticDefaultImports !== true) {
            config.logger.warn(`To standardize default imports, it is recommend to set the tsconfig.json "allowSyntheticDefaultImports" setting to "true".`);
        }
        validateCompilerOptions(compilerOptions);
        compilerCtx.compilerOptions = compilerOptions;
        return compilerOptions;
    });
}
function validateCompilerOptions(compilerOptions) {
    if (compilerOptions.allowJs && compilerOptions.declaration) {
        compilerOptions.allowJs = false;
    }
    // triple stamp a double stamp we've got the required settings
    compilerOptions.jsx = DEFAULT_COMPILER_OPTIONS.jsx;
    compilerOptions.jsxFactory = DEFAULT_COMPILER_OPTIONS.jsxFactory;
    compilerOptions.experimentalDecorators = DEFAULT_COMPILER_OPTIONS.experimentalDecorators;
    compilerOptions.noEmitOnError = DEFAULT_COMPILER_OPTIONS.noEmit;
    compilerOptions.suppressOutputPathCheck = DEFAULT_COMPILER_OPTIONS.suppressOutputPathCheck;
    compilerOptions.moduleResolution = DEFAULT_COMPILER_OPTIONS.moduleResolution;
    compilerOptions.module = DEFAULT_COMPILER_OPTIONS.module;
    compilerOptions.target = DEFAULT_COMPILER_OPTIONS.target;
}
const DEFAULT_COMPILER_OPTIONS = {
    // to allow jsx to work
    jsx: ts.JsxEmit.React,
    // the factory function to use
    jsxFactory: 'h',
    // transpileModule does not write anything to disk so there is no need
    // to verify that there are no conflicts between input and output paths.
    suppressOutputPathCheck: true,
    lib: [
        'lib.dom.d.ts',
        'lib.es5.d.ts',
        'lib.es2015.d.ts',
        'lib.es2016.d.ts',
        'lib.es2017.d.ts'
    ],
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    // must always allow decorators
    experimentalDecorators: true,
    // transpile down to es2017
    target: ts.ScriptTarget.ES2017,
    // create esNext modules
    module: ts.ModuleKind.ESNext,
    // resolve using NodeJs style
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    // ensure that we do emit something
    noEmitOnError: false
};

/**
 * Check if class has component decorator
 * @param classNode
 */
function isComponentClass(classNode) {
    if (!Array.isArray(classNode.decorators)) {
        return false;
    }
    const componentDecoratorIndex = classNode.decorators.findIndex(dec => (ts.isCallExpression(dec.expression) && ts.isIdentifier(dec.expression.expression) && dec.expression.expression.text === 'Component'));
    return (componentDecoratorIndex !== -1);
}
function isInstanceOfObjectMap(object) {
    return (!object.hasOwnProperty('kind') &&
        !object.hasOwnProperty('flags') &&
        !object.hasOwnProperty('pos') &&
        !object.hasOwnProperty('end'));
}
function getTextOfPropertyName(name) {
    switch (name.kind) {
        case ts.SyntaxKind.Identifier:
            return name.text;
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NumericLiteral:
            return name.text;
        case ts.SyntaxKind.ComputedPropertyName:
            const expression = name.expression;
            if (ts.isStringLiteral(expression) || ts.isNumericLiteral(expression)) {
                return name.expression.text;
            }
    }
    return undefined;
}
function objectLiteralToObjectMap(objectLiteral) {
    const attrs = objectLiteral.properties;
    return attrs.reduce((final, attr) => {
        const name = getTextOfPropertyName(attr.name);
        let val;
        switch (attr.initializer.kind) {
            case ts.SyntaxKind.ObjectLiteralExpression:
                val = objectLiteralToObjectMap(attr.initializer);
                break;
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.Identifier:
            case ts.SyntaxKind.PropertyAccessExpression:
            default:
                val = attr.initializer;
        }
        final[name] = val;
        return final;
    }, {});
}
function objectMapToObjectLiteral(objMap) {
    const newProperties = Object.keys(objMap).map((key) => {
        const value = objMap[key];
        if (!ts.isIdentifier(value) && isInstanceOfObjectMap(value)) {
            return ts.createPropertyAssignment(ts.createLiteral(key), objectMapToObjectLiteral(value));
        }
        return ts.createPropertyAssignment(ts.createLiteral(key), value);
    });
    return ts.createObjectLiteral(newProperties);
}
/**
 * Convert a js value into typescript AST
 * @param val array, object, string, boolean, or number
 * @returns Typescript Object Literal, Array Literal, String Literal, Boolean Literal, Numeric Literal
 */
function convertValueToLiteral(val) {
    if (val === String) {
        return ts.createIdentifier('String');
    }
    if (val === Number) {
        return ts.createIdentifier('Number');
    }
    if (val === Boolean) {
        return ts.createIdentifier('Boolean');
    }
    if (Array.isArray(val)) {
        return arrayToArrayLiteral(val);
    }
    if (typeof val === 'object') {
        return objectToObjectLiteral(val);
    }
    return ts.createLiteral(val);
}
/**
 * Convert a js object into typescript AST
 * @param obj key value object
 * @returns Typescript Object Literal Expression
 */
function objectToObjectLiteral(obj) {
    if (Object.keys(obj).length === 0) {
        return ts.createObjectLiteral([]);
    }
    const newProperties = Object.keys(obj).map((key) => {
        return ts.createPropertyAssignment(ts.createLiteral(key), convertValueToLiteral(obj[key]));
    });
    return ts.createObjectLiteral(newProperties, true);
}
/**
 * Convert a js array into typescript AST
 * @param list array
 * @returns Typescript Array Literal Expression
 */
function arrayToArrayLiteral(list) {
    const newList = list.map(convertValueToLiteral);
    return ts.createArrayLiteral(newList);
}
/**
 * Execute an array of transforms over a string containing typescript source
 * @param sourceText Typescript source as a string
 * @param transformers Array of transforms to run agains the source string
 * @returns a string
 */
function transformSourceString(fileName, sourceText, transformers) {
    return __awaiter(this, void 0, void 0, function* () {
        const transformed = ts.transform(ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.ES2017), transformers);
        const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }, {
            onEmitNode: transformed.emitNodeWithNotification,
            substituteNode: transformed.substituteNode
        });
        const result = printer.printBundle(ts.createBundle(transformed.transformed));
        transformed.dispose();
        return result;
    });
}

function formatBrowserLoaderComponentTagNames(cmpRegistry) {
    // ensure we've got a standard order of the component tagnames
    return Object.keys(cmpRegistry).sort();
}
function formatBrowserLoaderComponentRegistry(cmpRegistry) {
    // ensure we've got a standard order of the components
    return Object.keys(cmpRegistry).sort().map(tag => {
        const cmpMeta = cmpRegistry[tag];
        cmpMeta.tagNameMeta = tag.toLowerCase().trim();
        return formatBrowserLoaderComponent(cmpMeta);
    });
}
function formatBrowserLoaderComponent(cmpMeta) {
    const d = [
        /* 0 */ cmpMeta.tagNameMeta,
        /* 1 */ formatBrowserLoaderBundleIds(cmpMeta.bundleIds),
        /* 2 */ formatHasStyles(cmpMeta.stylesMeta),
        /* 3 */ formatMembers(cmpMeta.membersMeta),
        /* 4 */ formatEncapsulation(cmpMeta.encapsulationMeta),
        /* 5 */ formatListeners(cmpMeta.listenersMeta)
    ];
    return trimFalsyData(d);
}
function formatBrowserLoaderBundleIds(bundleIds) {
    if (!bundleIds) {
        return `invalid-bundle-id`;
    }
    if (typeof bundleIds === 'string') {
        return bundleIds;
    }
    const modes = Object.keys(bundleIds).sort();
    if (!modes.length) {
        return `invalid-bundle-id`;
    }
    if (modes.length === 1) {
        return bundleIds[modes[0]];
    }
    const bundleIdObj = {};
    modes.forEach(modeName => {
        bundleIdObj[modeName] = bundleIds[modeName];
    });
    return bundleIdObj;
}
function formatHasStyles(stylesMeta) {
    if (stylesMeta && Object.keys(stylesMeta).length > 0) {
        return 1;
    }
    return 0;
}
function formatMembers(membersMeta) {
    if (!membersMeta) {
        return 0;
    }
    const observeAttrs = [];
    const memberNames = Object.keys(membersMeta).sort();
    memberNames.forEach(memberName => {
        const memberMeta = membersMeta[memberName];
        const d = [
            memberName,
            memberMeta.memberType /* 1 - memberType */
        ];
        if (memberMeta.propType === 4 /* Boolean */ || memberMeta.propType === 8 /* Number */ || memberMeta.propType === 2 /* String */ || memberMeta.propType === 1 /* Any */) {
            // observe the attribute
            if (memberMeta.reflectToAttrib) {
                d.push(1); /* 2 - reflectToAttr */
            }
            else {
                d.push(0); /* 2 - reflectToAttr */
            }
            if (memberMeta.attribName !== memberName) {
                // property name and attribute name are different
                // ariaDisabled !== aria-disabled
                d.push(memberMeta.attribName); /* 3 - attribName */
            }
            else {
                // property name and attribute name are the exact same
                // checked === checked
                d.push(1); /* 3 - attribName */
            }
            d.push(memberMeta.propType); /* 4 - propType */
        }
        else {
            // do not observe the attribute
            d.push(0); /* 2 - reflectToAttr */
            d.push(0); /* 3 - attribName */
            d.push(0 /* Unknown */); /* 4 - propType */
        }
        if (memberMeta.ctrlId) {
            d.push(memberMeta.ctrlId); /* 5 - ctrlId */
        }
        observeAttrs.push(d);
    });
    if (!observeAttrs.length) {
        return 0;
    }
    return observeAttrs.map(p => {
        return trimFalsyData(p);
    });
}
function formatEncapsulation(val) {
    if (val === 1 /* ShadowDom */) {
        return 1 /* ShadowDom */;
    }
    if (val === 2 /* ScopedCss */) {
        return 2 /* ScopedCss */;
    }
    return 0 /* NoEncapsulation */;
}
function formatListeners(listeners) {
    if (!listeners || !listeners.length) {
        return 0;
    }
    return listeners.map(listener => {
        const d = [
            listener.eventName,
            listener.eventMethodName,
            listener.eventDisabled ? 1 : 0,
            listener.eventPassive ? 1 : 0,
            listener.eventCapture ? 1 : 0
        ];
        return trimFalsyData(d);
    });
}
function formatConstructorEncapsulation(encapsulation) {
    if (encapsulation) {
        if (encapsulation === 1 /* ShadowDom */) {
            return 'shadow';
        }
        else if (encapsulation === 2 /* ScopedCss */) {
            return 'scoped';
        }
    }
    return null;
}
function formatComponentConstructorProperties(membersMeta, stringify, excludeInternal) {
    if (!membersMeta) {
        return null;
    }
    const memberNames = Object.keys(membersMeta).sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase())
            return -1;
        if (a.toLowerCase() > b.toLowerCase())
            return 1;
        return 0;
    });
    if (!memberNames.length) {
        return null;
    }
    const properties = {};
    memberNames.forEach(memberName => {
        const prop = formatComponentConstructorProperty(membersMeta[memberName], stringify, excludeInternal);
        if (prop !== null) {
            properties[memberName] = prop;
        }
    });
    if (!Object.keys(properties).length) {
        return null;
    }
    if (stringify) {
        let str = JSON.stringify(properties);
        str = str.replace(`"TYPE_String"`, `String`);
        str = str.replace(`"TYPE_Boolean"`, `Boolean`);
        str = str.replace(`"TYPE_Number"`, `Number`);
        return str;
    }
    return properties;
}
function formatComponentConstructorProperty(memberMeta, stringify, excludeInternal) {
    const property = {};
    if (memberMeta.memberType === 16 /* State */) {
        if (excludeInternal)
            return null;
        property.state = true;
    }
    else if (memberMeta.memberType === 64 /* Element */) {
        if (excludeInternal)
            return null;
        property.elementRef = true;
    }
    else if (memberMeta.memberType === 32 /* Method */) {
        property.method = true;
    }
    else if (memberMeta.memberType === 8 /* PropConnect */) {
        if (excludeInternal)
            return null;
        property.connect = memberMeta.ctrlId;
    }
    else if (memberMeta.memberType === 4 /* PropContext */) {
        if (excludeInternal)
            return null;
        property.context = memberMeta.ctrlId;
    }
    else {
        if (memberMeta.propType === 2 /* String */) {
            if (stringify) {
                property.type = 'TYPE_String';
            }
            else {
                property.type = String;
            }
        }
        else if (memberMeta.propType === 4 /* Boolean */) {
            if (stringify) {
                property.type = 'TYPE_Boolean';
            }
            else {
                property.type = Boolean;
            }
        }
        else if (memberMeta.propType === 8 /* Number */) {
            if (stringify) {
                property.type = 'TYPE_Number';
            }
            else {
                property.type = Number;
            }
        }
        else {
            property.type = 'Any';
        }
        if (typeof memberMeta.attribName === 'string') {
            property.attr = memberMeta.attribName;
            if (memberMeta.reflectToAttrib) {
                property.reflectToAttr = true;
            }
        }
        if (memberMeta.memberType === 2 /* PropMutable */) {
            property.mutable = true;
        }
    }
    if (memberMeta.watchCallbacks && memberMeta.watchCallbacks.length > 0) {
        property.watchCallbacks = memberMeta.watchCallbacks.slice();
    }
    return property;
}
function formatComponentConstructorEvents(eventsMeta) {
    if (!eventsMeta || !eventsMeta.length) {
        return null;
    }
    return eventsMeta.map(ev => formatComponentConstructorEvent(ev));
}
function formatComponentConstructorEvent(eventMeta) {
    const constructorEvent = {
        name: eventMeta.eventName,
        method: eventMeta.eventMethodName,
        bubbles: true,
        cancelable: true,
        composed: true
    };
    // default bubbles true
    if (typeof eventMeta.eventBubbles === 'boolean') {
        constructorEvent.bubbles = eventMeta.eventBubbles;
    }
    // default cancelable true
    if (typeof eventMeta.eventCancelable === 'boolean') {
        constructorEvent.cancelable = eventMeta.eventCancelable;
    }
    // default composed true
    if (typeof eventMeta.eventComposed === 'boolean') {
        constructorEvent.composed = eventMeta.eventComposed;
    }
    return constructorEvent;
}
function formatComponentConstructorListeners(listenersMeta, stringify) {
    if (!listenersMeta || !listenersMeta.length) {
        return null;
    }
    const listeners = listenersMeta.map(ev => formatComponentConstructorListener(ev));
    if (stringify) {
        return JSON.stringify(listeners);
    }
    return listeners;
}
function formatComponentConstructorListener(listenMeta) {
    const constructorListener = {
        name: listenMeta.eventName,
        method: listenMeta.eventMethodName
    };
    // default capture falsy
    if (listenMeta.eventCapture === true) {
        constructorListener.capture = true;
    }
    // default disabled falsy
    if (listenMeta.eventDisabled === true) {
        constructorListener.disabled = true;
    }
    // default passive falsy
    if (listenMeta.eventPassive === true) {
        constructorListener.passive = true;
    }
    return constructorListener;
}
function trimFalsyData(d) {
    for (var i = d.length - 1; i >= 0; i--) {
        if (d[i]) {
            break;
        }
        // if falsy, safe to pop()
        d.pop();
    }
    return d;
}
function getStylePlaceholder(tagName) {
    return `/**style-placeholder:${tagName}:**/`;
}
function getStyleIdPlaceholder(tagName) {
    return `/**style-id-placeholder:${tagName}:**/`;
}
function getIntroPlaceholder() {
    return `/**:intro-placeholder:**/`;
}
function getBundleIdPlaceholder() {
    return `/**:bundle-id:**/`;
}
function replaceBundleIdPlaceholder(jsText, bundleId) {
    return jsText.replace(getBundleIdPlaceholder(), bundleId);
}

function addComponentMetadata(moduleFiles) {
    return (transformContext) => {
        function visitClass(classNode, cmpMeta) {
            const staticMembers = addStaticMeta(cmpMeta);
            const newMembers = Object.keys(staticMembers).map(memberName => {
                return createGetter(memberName, staticMembers[memberName]);
            });
            return ts.updateClassDeclaration(classNode, classNode.decorators, classNode.modifiers, classNode.name, classNode.typeParameters, classNode.heritageClauses, [...classNode.members, ...newMembers]);
        }
        function visit(node, cmpMeta) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    return visitClass(node, cmpMeta);
                default:
                    return ts.visitEachChild(node, (node) => {
                        return visit(node, cmpMeta);
                    }, transformContext);
            }
        }
        return (tsSourceFile) => {
            const moduleFile = moduleFiles[tsSourceFile.fileName];
            if (moduleFile && moduleFile.cmpMeta) {
                return visit(tsSourceFile, moduleFile.cmpMeta);
            }
            return tsSourceFile;
        };
    };
}
function addStaticMeta(cmpMeta) {
    const staticMembers = {};
    staticMembers.is = convertValueToLiteral(cmpMeta.tagNameMeta);
    const encapsulation = formatConstructorEncapsulation(cmpMeta.encapsulationMeta);
    if (encapsulation) {
        staticMembers.encapsulation = convertValueToLiteral(encapsulation);
    }
    if (cmpMeta.hostMeta && Object.keys(cmpMeta.hostMeta).length > 0) {
        staticMembers.host = convertValueToLiteral(cmpMeta.hostMeta);
    }
    const propertiesMeta = formatComponentConstructorProperties(cmpMeta.membersMeta);
    if (propertiesMeta && Object.keys(propertiesMeta).length > 0) {
        staticMembers.properties = convertValueToLiteral(propertiesMeta);
    }
    const eventsMeta = formatComponentConstructorEvents(cmpMeta.eventsMeta);
    if (eventsMeta && eventsMeta.length > 0) {
        staticMembers.events = convertValueToLiteral(eventsMeta);
    }
    const listenerMeta = formatComponentConstructorListeners(cmpMeta.listenersMeta);
    if (listenerMeta && listenerMeta.length > 0) {
        staticMembers.listeners = convertValueToLiteral(listenerMeta);
    }
    if (cmpMeta.stylesMeta) {
        const styleModes = Object.keys(cmpMeta.stylesMeta);
        if (styleModes.length > 0) {
            // awesome, we know we've got styles!
            // let's add the placeholder which we'll use later
            // after we generate the css
            staticMembers.style = convertValueToLiteral(getStylePlaceholder(cmpMeta.tagNameMeta));
            if (!cmpMeta.stylesMeta[DEFAULT_STYLE_MODE]) {
                // if there's only one style, then there's no need for styleId
                // but if there are numerous style modes, then we'll need to add this
                staticMembers.styleMode = convertValueToLiteral(getStyleIdPlaceholder(cmpMeta.tagNameMeta));
            }
        }
    }
    return staticMembers;
}
function createGetter(name, returnExpression) {
    return ts.createGetAccessor(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], name, undefined, undefined, ts.createBlock([
        ts.createReturn(returnExpression)
    ]));
}

function componentDependencies(compilerCtx) {
    return (transformContext) => {
        function visit(node, moduleFile) {
            if (node.kind === ts.SyntaxKind.CallExpression) {
                callExpression(moduleFile, node);
            }
            else if (node.kind === ts.SyntaxKind.StringLiteral) {
                stringLiteral(moduleFile, node);
            }
            return ts.visitEachChild(node, (node) => {
                return visit(node, moduleFile);
            }, transformContext);
        }
        return (tsSourceFile) => {
            const moduleFile = getModuleFile(compilerCtx, tsSourceFile.fileName);
            // reset since we're doing a full parse again
            moduleFile.potentialCmpRefs.length = 0;
            moduleFile.hasSlot = false;
            moduleFile.hasSvg = false;
            addPropConnects(compilerCtx, moduleFile);
            return visit(tsSourceFile, moduleFile);
        };
    };
}
function addPropConnects(compilerCtx, moduleFile) {
    if (!moduleFile.cmpMeta) {
        return;
    }
    if (moduleFile.cmpMeta.membersMeta) {
        Object.keys(moduleFile.cmpMeta.membersMeta).forEach(memberName => {
            const memberMeta = moduleFile.cmpMeta.membersMeta[memberName];
            if (memberMeta.memberType === 8 /* PropConnect */) {
                addPropConnect(compilerCtx, moduleFile, memberMeta.ctrlId);
            }
        });
    }
}
function addPropConnect(compilerCtx, moduleFile, tag) {
    if (!moduleFile.potentialCmpRefs.some(cr => cr.tag === tag)) {
        moduleFile.potentialCmpRefs.push({
            tag: tag
        });
    }
    compilerCtx.collections.forEach(collection => {
        collection.bundles.forEach(bundle => {
            if (bundle.components.includes(tag)) {
                bundle.components.forEach(bundleTag => {
                    if (bundleTag !== tag) {
                        if (!moduleFile.potentialCmpRefs.some(cr => cr.tag === bundleTag)) {
                            moduleFile.potentialCmpRefs.push({
                                tag: bundleTag
                            });
                        }
                    }
                });
            }
        });
    });
}
function callExpression(moduleFile, node) {
    if (node.arguments && node.arguments[0]) {
        if (node.expression.kind === ts.SyntaxKind.Identifier) {
            // h('tag')
            callExpressionArg(moduleFile, node.expression, node.arguments);
        }
        else if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            // document.createElement('tag')
            if (node.expression.name) {
                callExpressionArg(moduleFile, node.expression.name, node.arguments);
            }
        }
    }
}
function callExpressionArg(moduleFile, callExpressionName, args) {
    if (TAG_CALL_EXPRESSIONS.includes(callExpressionName.escapedText)) {
        if (args[0].kind === ts.SyntaxKind.StringLiteral) {
            let tag = args[0].text;
            if (typeof tag === 'string') {
                tag = tag.toLowerCase();
                if (tag.includes('-')) {
                    if (!moduleFile.potentialCmpRefs.some(cr => cr.tag === tag)) {
                        moduleFile.potentialCmpRefs.push({
                            tag: tag
                        });
                    }
                }
                else if (tag === 'slot') {
                    moduleFile.hasSlot = true;
                }
                else if (tag === 'svg') {
                    moduleFile.hasSvg = true;
                }
            }
        }
    }
}
function stringLiteral(moduleFile, node) {
    if (typeof node.text === 'string' && node.text.includes('</')) {
        if (node.text.includes('-')) {
            moduleFile.potentialCmpRefs.push({
                html: node.text
            });
        }
        if (!moduleFile.hasSlot && node.text.includes('<slot')) {
            moduleFile.hasSlot = true;
        }
        if (!moduleFile.hasSvg && node.text.includes('<svg')) {
            moduleFile.hasSvg = true;
        }
    }
}
const TAG_CALL_EXPRESSIONS = [
    'h',
    'createElement',
    'createElementNS'
];

function evalText(text) {
    const fnStr = `return ${text};`;
    return new Function(fnStr)();
}
const getDeclarationParameters = (decorator) => {
    if (!ts.isCallExpression(decorator.expression)) {
        return [];
    }
    return decorator.expression.arguments.map((arg) => {
        return evalText(arg.getText().trim());
    });
};
function isDecoratorNamed(name) {
    return (dec) => {
        return (ts.isCallExpression(dec.expression) && dec.expression.expression.getText() === name);
    };
}
function isPropertyWithDecorators(member) {
    return ts.isPropertyDeclaration(member)
        && Array.isArray(member.decorators)
        && member.decorators.length > 0;
}
function isMethodWithDecorators(member) {
    return ts.isMethodDeclaration(member)
        && Array.isArray(member.decorators)
        && member.decorators.length > 0;
}
function serializeSymbol(checker, symbol) {
    return {
        name: symbol.getName(),
        tags: symbol.getJsDocTags(),
        documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        type: serializeDocsSymbol(checker, symbol)
    };
}
function serializeDocsSymbol(checker, symbol) {
    const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    const set = new Set();
    parseDocsType(checker, type, set);
    // normalize booleans
    const hasTrue = set.delete('true');
    const hasFalse = set.delete('false');
    if (hasTrue || hasFalse) {
        set.add('boolean');
    }
    let parts = Array.from(set.keys()).sort();
    if (parts.length > 1) {
        parts = parts.map(p => (p.indexOf('=>') >= 0) ? `(${p})` : p);
    }
    if (parts.length > 20) {
        return typeToString(checker, type);
    }
    else {
        return parts.join(' | ');
    }
}
const TYPE_FORMAT_FLAGS = ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.InTypeAlias |
    ts.TypeFormatFlags.InElementType;
function typeToString(checker, type) {
    return checker.typeToString(type, undefined, TYPE_FORMAT_FLAGS);
}
function parseDocsType(checker, type, parts) {
    const text = typeToString(checker, type);
    if (type.isUnion()) {
        type.types.forEach(t => {
            parseDocsType(checker, t, parts);
        });
    }
    else {
        parts.add(text);
    }
}
function isMethod(member, methodName) {
    if (ts.isMethodDeclaration(member)) {
        return member.getFirstToken().getText() === methodName;
    }
    return false;
}
function getAttributeTypeInfo(baseNode, sourceFile) {
    return getAllTypeReferences(baseNode)
        .reduce((allReferences, rt) => {
        allReferences[rt] = getTypeReferenceLocation(rt, sourceFile);
        return allReferences;
    }, {});
}
function getAllTypeReferences(node) {
    const referencedTypes = [];
    function visit(node) {
        switch (node.kind) {
            case ts.SyntaxKind.TypeReference:
                const typeNode = node;
                if (ts.isIdentifier(typeNode.typeName)) {
                    const name = typeNode.typeName;
                    referencedTypes.push(name.escapedText.toString());
                }
                if (typeNode.typeArguments) {
                    typeNode.typeArguments
                        .filter(ta => ts.isTypeReferenceNode(ta))
                        .forEach((tr) => {
                        const name = tr.typeName;
                        referencedTypes.push(name.escapedText.toString());
                    });
                }
            /* tslint:disable */
            default:
                return ts.forEachChild(node, (node) => {
                    return visit(node);
                });
        }
        /* tslint:enable */
    }
    visit(node);
    return referencedTypes;
}
function getTypeReferenceLocation(typeName, sourceFile) {
    const sourceFileObj = sourceFile.getSourceFile();
    // Loop through all top level imports to find any reference to the type for 'import' reference location
    const importTypeDeclaration = sourceFileObj.statements.find(st => {
        const statement = ts.isImportDeclaration(st) &&
            st.importClause &&
            ts.isImportClause(st.importClause) &&
            st.importClause.namedBindings &&
            ts.isNamedImports(st.importClause.namedBindings) &&
            Array.isArray(st.importClause.namedBindings.elements) &&
            st.importClause.namedBindings.elements.find(nbe => nbe.name.getText() === typeName);
        if (!statement) {
            return false;
        }
        return true;
    });
    if (importTypeDeclaration) {
        const localImportPath = importTypeDeclaration.moduleSpecifier.text;
        return {
            referenceLocation: 'import',
            importReferenceLocation: localImportPath
        };
    }
    // Loop through all top level exports to find if any reference to the type for 'local' reference location
    const isExported = sourceFileObj.statements.some(st => {
        // Is the interface defined in the file and exported
        const isInterfaceDeclarationExported = ((ts.isInterfaceDeclaration(st) &&
            st.name.getText() === typeName) &&
            Array.isArray(st.modifiers) &&
            st.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword));
        const isTypeAliasDeclarationExported = ((ts.isTypeAliasDeclaration(st) &&
            st.name.getText() === typeName) &&
            Array.isArray(st.modifiers) &&
            st.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword));
        // Is the interface exported through a named export
        const isTypeInExportDeclaration = ts.isExportDeclaration(st) &&
            ts.isNamedExports(st.exportClause) &&
            st.exportClause.elements.some(nee => nee.name.getText() === typeName);
        return isInterfaceDeclarationExported || isTypeAliasDeclarationExported || isTypeInExportDeclaration;
    });
    if (isExported) {
        return {
            referenceLocation: 'local'
        };
    }
    // This is most likely a global type, if it is a local that is not exported then typescript will inform the dev
    return {
        referenceLocation: 'global',
    };
}

function getStylesMeta(componentOptions) {
    let stylesMeta = {};
    if (typeof componentOptions.styles === 'string') {
        // styles: 'div { padding: 10px }'
        componentOptions.styles = componentOptions.styles.trim();
        if (componentOptions.styles.length > 0) {
            stylesMeta = {
                [DEFAULT_STYLE_MODE]: {
                    styleStr: componentOptions.styles
                }
            };
        }
    }
    if (typeof componentOptions.styleUrl === 'string' && componentOptions.styleUrl.trim()) {
        // styleUrl: 'my-styles.css'
        stylesMeta = {
            [DEFAULT_STYLE_MODE]: {
                externalStyles: [{
                        originalComponentPath: componentOptions.styleUrl.trim()
                    }]
            }
        };
    }
    else if (Array.isArray(componentOptions.styleUrls)) {
        // styleUrls: ['my-styles.css', 'my-other-styles']
        stylesMeta = {
            [DEFAULT_STYLE_MODE]: {
                externalStyles: componentOptions.styleUrls.map(styleUrl => {
                    const externalStyle = {
                        originalComponentPath: styleUrl.trim()
                    };
                    return externalStyle;
                })
            }
        };
    }
    else {
        // styleUrls: {
        //   ios: 'badge.ios.css',
        //   md: 'badge.md.css',
        //   wp: 'badge.wp.css'
        // }
        Object.keys(componentOptions.styleUrls || {}).reduce((stylesMeta, styleType) => {
            const styleUrls = componentOptions.styleUrls;
            const sUrls = [].concat(styleUrls[styleType]);
            stylesMeta[styleType] = {
                externalStyles: sUrls.map(sUrl => {
                    const externalStyle = {
                        originalComponentPath: sUrl
                    };
                    return externalStyle;
                })
            };
            return stylesMeta;
        }, stylesMeta);
    }
    return stylesMeta;
}

function getComponentDecoratorMeta(diagnostics, checker, node) {
    if (!node.decorators) {
        return undefined;
    }
    const componentDecorator = node.decorators.find(isDecoratorNamed('Component'));
    if (!componentDecorator) {
        return undefined;
    }
    const [componentOptions] = getDeclarationParameters(componentDecorator);
    if (!componentOptions.tag || componentOptions.tag.trim() === '') {
        throw new Error(`tag missing in component decorator: ${JSON.stringify(componentOptions, null, 2)}`);
    }
    if (node.heritageClauses && node.heritageClauses.some(c => c.token === ts.SyntaxKind.ExtendsKeyword)) {
        throw new Error(`Classes decorated with @Component can not extend from a base class.
  Inherency is temporarily disabled for stencil components.`);
    }
    // check if class has more than one decorator
    if (node.decorators.length > 1) {
        throw new Error(`@Component({ tag: "${componentOptions.tag}" }) can not be decorated with more decorators at the same time`);
    }
    if (componentOptions.host) {
        const warn = buildWarn(diagnostics);
        warn.header = 'Host prop deprecated';
        warn.messageText = `The “host” property used in @Component({ tag: "${componentOptions.tag}" }) has been deprecated.
It will be removed in future versions. Please use the "hostData()" method instead. `;
    }
    const symbol = checker.getSymbolAtLocation(node.name);
    const cmpMeta = {
        tagNameMeta: componentOptions.tag,
        stylesMeta: getStylesMeta(componentOptions),
        assetsDirsMeta: [],
        hostMeta: getHostMeta(diagnostics, componentOptions.host),
        dependencies: [],
        jsdoc: serializeSymbol(checker, symbol)
    };
    // normalizeEncapsulation
    cmpMeta.encapsulationMeta =
        componentOptions.shadow ? 1 /* ShadowDom */ :
            componentOptions.scoped ? 2 /* ScopedCss */ :
                0 /* NoEncapsulation */;
    // assetsDir: './somedir'
    if (componentOptions.assetsDir) {
        const assetsMeta = {
            originalComponentPath: componentOptions.assetsDir
        };
        cmpMeta.assetsDirsMeta.push(assetsMeta);
    }
    // assetsDirs: ['./somedir', '../someotherdir']
    if (Array.isArray(componentOptions.assetsDirs)) {
        cmpMeta.assetsDirsMeta = cmpMeta.assetsDirsMeta.concat(componentOptions.assetsDirs.map(assetDir => ({ originalComponentPath: assetDir })));
    }
    return cmpMeta;
}
function getHostMeta(diagnostics, hostData) {
    hostData = hostData || {};
    Object.keys(hostData).forEach(key => {
        const type = typeof hostData[key];
        if (type !== 'string' && type !== 'number' && type !== 'boolean') {
            // invalid data
            delete hostData[key];
            let itsType = 'object';
            if (type === 'function') {
                itsType = 'function';
            }
            else if (Array.isArray(hostData[key])) {
                itsType = 'Array';
            }
            const diagnostic = buildWarn(diagnostics);
            diagnostic.messageText = [
                `The @Component decorator's host property "${key}" has a type of "${itsType}". `,
                `However, a @Component decorator's "host" can only take static data, `,
                `such as a string, number or boolean. `,
                `Please use the "hostData()" method instead `,
                `if attributes or properties need to be dynamically added to `,
                `the host element.`
            ].join('');
        }
    });
    return hostData;
}

function getElementDecoratorMeta(checker, classNode) {
    return classNode.members
        .filter(isPropertyWithDecorators)
        .reduce((membersMeta, member) => {
        const elementDecorator = member.decorators.find(isDecoratorNamed('Element'));
        if (elementDecorator) {
            membersMeta[member.name.getText()] = {
                memberType: 64 /* Element */
            };
        }
        return membersMeta;
    }, {});
}

function getEventDecoratorMeta(diagnostics, checker, classNode, sourceFile) {
    return classNode.members
        .filter(isPropertyWithDecorators)
        .reduce((membersMeta, member) => {
        const elementDecorator = member.decorators.find(isDecoratorNamed('Event'));
        if (elementDecorator == null) {
            return membersMeta;
        }
        const [eventOptions] = getDeclarationParameters(elementDecorator);
        const metadata = convertOptionsToMeta(diagnostics, eventOptions, member.name.getText());
        if (member.type) {
            const genericType = gatherEventEmitterGeneric(member.type);
            if (genericType) {
                metadata.eventType = {
                    text: genericType.getText(),
                    optional: false,
                    required: false,
                };
                if (ts.isTypeReferenceNode(genericType)) {
                    metadata.eventType.typeReferences = getAttributeTypeInfo(member, sourceFile);
                }
            }
        }
        if (metadata) {
            const symbol = checker.getSymbolAtLocation(member.name);
            metadata.jsdoc = serializeSymbol(checker, symbol);
            metadata.jsdoc.name = metadata.eventName;
            membersMeta.push(metadata);
        }
        return membersMeta;
    }, []);
}
function convertOptionsToMeta(diagnostics, rawEventOpts = {}, memberName) {
    if (!memberName) {
        return null;
    }
    return {
        eventMethodName: memberName,
        eventName: getEventName$1(diagnostics, rawEventOpts, memberName),
        eventBubbles: typeof rawEventOpts.bubbles === 'boolean' ? rawEventOpts.bubbles : true,
        eventCancelable: typeof rawEventOpts.cancelable === 'boolean' ? rawEventOpts.cancelable : true,
        eventComposed: typeof rawEventOpts.composed === 'boolean' ? rawEventOpts.composed : true
    };
}
function getEventName$1(diagnostics, rawEventOpts, memberName) {
    if (typeof rawEventOpts.eventName === 'string' && rawEventOpts.eventName.trim().length > 0) {
        // always use the event name if given
        return rawEventOpts.eventName.trim();
    }
    // event name wasn't provided
    // so let's default to use the member name
    validateEventEmitterMemeberName(diagnostics, memberName);
    return memberName;
}
function validateEventEmitterMemeberName(diagnostics, memberName) {
    const firstChar = memberName.charAt(0);
    if (/[A-Z]/.test(firstChar)) {
        const diagnostic = buildWarn(diagnostics);
        diagnostic.messageText = [
            `In order to be compatible with all event listeners on elements, the `,
            `@Event() "${memberName}" cannot start with a capital letter. `,
            `Please lowercase the first character for the event to best work with all listeners.`
        ].join('');
    }
}
function gatherEventEmitterGeneric(type) {
    if (ts.isTypeReferenceNode(type) &&
        ts.isIdentifier(type.typeName) &&
        type.typeName.text === 'EventEmitter' &&
        type.typeArguments &&
        type.typeArguments.length > 0) {
        const eeGen = type.typeArguments[0];
        return eeGen;
    }
    return null;
}

function getListenDecoratorMeta(checker, classNode) {
    const listeners = [];
    classNode.members
        .filter(isMethodWithDecorators)
        .forEach(member => {
        member.decorators
            .filter(isDecoratorNamed('Listen'))
            .map(dec => getDeclarationParameters(dec))
            .forEach(([listenText, listenOptions]) => {
            listenText.split(',').forEach(eventName => {
                const symbol = checker.getSymbolAtLocation(member.name);
                const jsdoc = serializeSymbol(checker, symbol);
                listeners.push(Object.assign({}, validateListener(eventName.trim(), listenOptions, member.name.getText()), { jsdoc }));
            });
        });
    });
    return listeners;
}
function validateListener(eventName, rawListenOpts = {}, methodName) {
    let rawEventName = eventName;
    let splt = eventName.split(':');
    if (splt.length > 2) {
        throw new Error(`@Listen can only contain one colon: ${eventName}`);
    }
    if (splt.length > 1) {
        const prefix = splt[0].toLowerCase().trim();
        if (!isValidElementRefPrefix(prefix)) {
            throw new Error(`invalid @Listen prefix "${prefix}" for "${eventName}"`);
        }
        rawEventName = splt[1].toLowerCase().trim();
    }
    splt = rawEventName.split('.');
    if (splt.length > 2) {
        throw new Error(`@Listen can only contain one period: ${eventName}`);
    }
    if (splt.length > 1) {
        const suffix = splt[1].toLowerCase().trim();
        if (!isValidKeycodeSuffix(suffix)) {
            throw new Error(`invalid @Listen suffix "${suffix}" for "${eventName}"`);
        }
        rawEventName = splt[0].toLowerCase().trim();
    }
    const listenMeta = {
        eventName: eventName,
        eventMethodName: methodName
    };
    listenMeta.eventCapture = (typeof rawListenOpts.capture === 'boolean') ? rawListenOpts.capture : false;
    listenMeta.eventPassive = (typeof rawListenOpts.passive === 'boolean') ? rawListenOpts.passive :
        // if the event name is kown to be a passive event then set it to true
        (PASSIVE_TRUE_DEFAULTS.indexOf(rawEventName.toLowerCase()) > -1);
    // default to enabled=true if it wasn't provided
    listenMeta.eventDisabled = (rawListenOpts.enabled === false);
    return listenMeta;
}
function isValidElementRefPrefix(prefix) {
    return (VALID_ELEMENT_REF_PREFIXES.indexOf(prefix) > -1);
}
function isValidKeycodeSuffix(prefix) {
    return (VALID_KEYCODE_SUFFIX.indexOf(prefix) > -1);
}
const PASSIVE_TRUE_DEFAULTS = [
    'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
    'mouseenter', 'mouseover', 'mousemove', 'mousedown', 'mouseup', 'mouseleave', 'mouseout', 'mousewheel',
    'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave',
    'resize',
    'scroll',
    'touchstart', 'touchmove', 'touchend', 'touchenter', 'touchleave', 'touchcancel',
    'wheel',
];
const VALID_ELEMENT_REF_PREFIXES = [
    'child', 'parent', 'body', 'document', 'window'
];
const VALID_KEYCODE_SUFFIX = [
    'enter', 'escape', 'space', 'tab', 'up', 'right', 'down', 'left'
];

function validatePublicName(diagnostics, componentClass, memberName, decorator, memberType) {
    if (isReservedMember(memberName)) {
        const diagnostic = buildWarn(diagnostics);
        diagnostic.messageText = [
            `The ${decorator} name "${memberName}" used within the "${componentClass}" class is a reserved public name. `,
            `Please rename the "${memberName}" ${memberType} so it does not conflict with an existing standardized prototype member. `,
            `Reusing ${memberType} names that are already defined on the element's prototype may cause `,
            `unexpected runtime errors or user-interface issues on various browsers, so it's best to avoid them entirely.`
        ].join('');
    }
}
const READ_ONLY_PROPERTIES = [
    'attributes',
    'baseURI',
    'childElementCount',
    'childNodes',
    'children',
    'classList',
    'clientHeight',
    'clientLeft',
    'clientTop',
    'clientWidth',
    'contentEditable',
    'dataset',
    'firstChild',
    'firstElementChild',
    'host',
    'is',
    'isConnected',
    'isContentEditable',
    'lastChild',
    'lastElementChild',
    'localName',
    'namespaceURI',
    'nextElementSibling',
    'nextSibling',
    'nodeName',
    'nodePrincipal',
    'nodeType',
    'nodeValue',
    'offsetHeight',
    'offsetLeft',
    'offsetParent',
    'offsetTop',
    'offsetWidth',
    'ownerDocument',
    'parentElement',
    'parentNode',
    'prefix',
    'previousElementSibling',
    'previousSibling',
    'rootNode',
    'runtimeStyle',
    'scrollHeight',
    'scrollLeft',
    'scrollLeftMax',
    'scrollTop',
    'scrollTopMax',
    'scrollWidth',
    'shadowRoot',
    'slot',
    'tagName',
    'title',
];
const METHODS = [
    'addEventListener',
    'after',
    'animate',
    'append',
    'appendChild',
    'attachEvent',
    'attachShadow',
    'before',
    'blur',
    'click',
    'cloneNode',
    'closest',
    'compareDocumentPosition',
    'contains',
    'detachEvent',
    'dispatchEvent',
    'fireEvent',
    'focus',
    'getAttribute',
    'getAttributeNames',
    'getAttributeNode',
    'getAttributeNodeNS',
    'getAttributeNS',
    'getBoundingClientRect',
    'getClientRects',
    'getElementsByClassName',
    'getElementsByTagName',
    'getElementsByTagNameNS',
    'getRootNode',
    'getUserData',
    'hasAttribute',
    'hasAttributeNS',
    'hasAttributes',
    'hasChildNodes',
    'insertAdjacentElement',
    'insertAdjacentHTML',
    'insertAdjacentText',
    'insertBefore',
    'isDefaultNamespace',
    'isEqualNode',
    'isSameNode',
    'isSupported',
    'lookupNamespaceURI',
    'lookupPrefix',
    'matches',
    'normalize',
    'prepend',
    'querySelector',
    'querySelectorAll',
    'querySelectorAll',
    'releasePointerCapture',
    'removeChild',
    'remove',
    'removeAttribute',
    'removeAttributeNode',
    'removeAttributeNS',
    'removeEventListener',
    'replaceChild',
    'replaceWith',
    'requestFullscreen',
    'requestPointerLock',
    'scrollIntoView',
    'scrollIntoViewIfNeeded',
    'setAttribute',
    'setAttributeNode',
    'setAttributeNodeNS',
    'setAttributeNS',
    'setCapture',
    'setPointerCapture',
];
const EVENT_HANDLERS = [
    'onabort',
    'onanimationend',
    'onanimationendcapture',
    'onanimationiteration',
    'onanimationiterationcapture',
    'onanimationstart',
    'onanimationstartcapture',
    'onauxclick',
    'onbeforecopy',
    'onbeforecut',
    'onbeforepaste',
    'onblur',
    'onblurcapture',
    'oncancel',
    'oncanplaythrough',
    'onchange',
    'onchangecapture',
    'onclick',
    'onclickcapture',
    'onclose',
    'oncompositionend',
    'oncompositionendcapture',
    'oncompositionstart',
    'oncompositionstartcapture',
    'oncompositionupdate',
    'oncompositionupdatecapture',
    'oncontextmenu',
    'oncontextmenucapture',
    'oncopy',
    'oncopycapture',
    'oncuechange',
    'oncut',
    'oncutcapture',
    'ondblclick',
    'ondblclickcapture',
    'ondrag',
    'ondragcapture',
    'ondragend',
    'ondragendcapture',
    'ondragenter',
    'ondragentercapture',
    'ondragexit',
    'ondragexitcapture',
    'ondragleave',
    'ondragleavecapture',
    'ondragover',
    'ondragovercapture',
    'ondragstart',
    'ondragstartcapture',
    'ondrop',
    'ondropcapture',
    'ondurationchange',
    'onemptied',
    'onended',
    'onerror',
    'onerrorcapture',
    'onfocus',
    'onfocuscapture',
    'onfullscreenchange',
    'onfullscreenerror',
    'ongotpointercapture',
    'oninput',
    'oninputcapture',
    'oninvalid',
    'oninvalidcapture',
    'onkeydown',
    'onkeydowncapture',
    'onkeypress',
    'onkeypresscapture',
    'onkeyup',
    'onkeyupcapture',
    'onload',
    'onloadcapture',
    'onloadeddata',
    'onloadedmetadata',
    'onloadstart',
    'onlostpointercapture',
    'onmousedown',
    'onmousedowncapture',
    'onmouseenter',
    'onmouseleave',
    'onmousemove',
    'onmousemovecapture',
    'onmouseout',
    'onmouseoutcapture',
    'onmouseover',
    'onmouseovercapture',
    'onmouseup',
    'onmouseupcapture',
    'onpaste',
    'onpastecapture',
    'onpause',
    'onplay',
    'onplaying',
    'onpointercancel',
    'onpointerdown',
    'onpointerenter',
    'onpointerleave',
    'onpointermove',
    'onpointerout',
    'onpointerover',
    'onpointerup',
    'onprogress',
    'onratechange',
    'onreset',
    'onresetcapture',
    'onresize',
    'onscroll',
    'onscrollcapture',
    'onsearch',
    'onseeked',
    'onseeking',
    'onselectstart',
    'onstalled',
    'onsubmit',
    'onsubmitcapture',
    'onsuspend',
    'ontimeupdate',
    'ontoggle',
    'ontouchcancel',
    'ontouchcancelcapture',
    'ontouchend',
    'ontouchendcapture',
    'ontouchmove',
    'ontouchmovecapture',
    'ontouchstart',
    'ontouchstartcapture',
    'ontransitionend',
    'ontransitionendcapture',
    'onvolumechange',
    'onwaiting',
    'onwebkitfullscreenchange',
    'onwebkitfullscreenerror',
    'onwheel',
    'onwheelcapture',
];
const RESERVED_PUBLIC_MEMBERS = [
    ...READ_ONLY_PROPERTIES,
    ...METHODS,
    ...EVENT_HANDLERS
].map(p => p.toLowerCase());
function isReservedMember(memberName) {
    memberName = memberName.toLowerCase();
    return RESERVED_PUBLIC_MEMBERS.includes(memberName);
}

function getMethodDecoratorMeta(config, diagnostics, checker, classNode, sourceFile, componentClass) {
    return classNode.members
        .filter(isMethodWithDecorators)
        .reduce((membersMeta, member) => {
        const methodDecorator = member.decorators.find(isDecoratorNamed('Method'));
        if (methodDecorator == null) {
            return membersMeta;
        }
        const symbol = checker.getSymbolAtLocation(member.name);
        const methodName = member.name.getText();
        const methodSignature = checker.getSignatureFromDeclaration(member);
        const flags = ts.TypeFormatFlags.WriteArrowStyleSignature | ts.TypeFormatFlags.NoTruncation;
        const returnType = checker.getReturnTypeOfSignature(methodSignature);
        const jsDocReturnTag = ts.getJSDocReturnTag(member);
        const typeString = checker.signatureToString(methodSignature, classNode, flags, ts.SignatureKind.Call);
        if (!config._isTesting && !isPromise(checker, returnType)) {
            const filePath = sourceFile.fileName;
            const warn = buildWarn(diagnostics);
            warn.header = '@Method requires async';
            warn.messageText = `External @Method() ${methodName}() should return a Promise or void.\n\n Consider prefixing the method with async, such as @Method async ${methodName}(). \n Next minor release will error.`;
            warn.absFilePath = normalizePath(filePath);
            warn.relFilePath = normalizePath(config.sys.path.relative(config.rootDir, filePath));
        }
        let methodReturnTypes = {};
        const returnTypeNode = checker.typeToTypeNode(returnType);
        if (returnTypeNode) {
            methodReturnTypes = getAttributeTypeInfo(returnTypeNode, sourceFile);
        }
        validatePublicName(diagnostics, componentClass, methodName, '@Method()', 'method');
        membersMeta[methodName] = {
            memberType: 32 /* Method */,
            attribType: {
                text: typeString,
                optional: false,
                required: false,
                typeReferences: Object.assign({}, methodReturnTypes, getAttributeTypeInfo(member, sourceFile))
            },
            jsdoc: Object.assign({}, serializeSymbol(checker, symbol), { returns: {
                    type: typeToString(checker, returnType),
                    documentation: jsDocReturnTag ? jsDocReturnTag.comment : ''
                }, parameters: methodSignature.parameters.map(parmSymbol => serializeSymbol(checker, parmSymbol)) })
        };
        return membersMeta;
    }, {});
}
function isPromise(checker, type) {
    if (type.isUnionOrIntersection()) {
        return false;
    }
    const typeText = typeToString(checker, type);
    return typeText === 'void' || typeText.startsWith('Promise<');
}

function getPropDecoratorMeta(diagnostics, checker, classNode, sourceFile, componentClass) {
    return classNode.members
        .filter(member => Array.isArray(member.decorators) && member.decorators.length > 0)
        .reduce((allMembers, prop) => {
        const memberData = {};
        const propDecorator = prop.decorators.find(isDecoratorNamed('Prop'));
        if (propDecorator == null) {
            return allMembers;
        }
        const propOptions = getPropOptions(propDecorator, diagnostics);
        const memberName = prop.name.text;
        const symbol = checker.getSymbolAtLocation(prop.name);
        if (propOptions && typeof propOptions.connect === 'string') {
            // @Prop({ connect: 'ion-alert-controller' })
            memberData.memberType = 8 /* PropConnect */;
            memberData.ctrlId = propOptions.connect;
        }
        else if (propOptions && typeof propOptions.context === 'string') {
            // @Prop({ context: 'config' })
            memberData.memberType = 4 /* PropContext */;
            memberData.ctrlId = propOptions.context;
        }
        else {
            // @Prop()
            const type = checker.getTypeAtLocation(prop);
            validatePublicName(diagnostics, componentClass, memberName, '@Prop()', 'property');
            memberData.memberType = getMemberType$1(propOptions);
            memberData.attribName = getAttributeName(propOptions, memberName);
            memberData.attribType = getAttribType(diagnostics, sourceFile, prop, memberName);
            memberData.reflectToAttrib = getReflectToAttr(propOptions);
            memberData.propType = propTypeFromTSType(type);
            memberData.jsdoc = serializeSymbol(checker, symbol);
            // extract default value
            const initializer = prop.initializer;
            if (initializer) {
                memberData.jsdoc.default = initializer.getText();
            }
        }
        allMembers[memberName] = memberData;
        return allMembers;
    }, {});
}
function getPropOptions(propDecorator, diagnostics) {
    const suppliedOptions = propDecorator.expression.arguments
        .map(arg => {
        try {
            const fnStr = `return ${arg.getText()};`;
            return new Function(fnStr)();
        }
        catch (e) {
            catchError(diagnostics, e, `parse prop options: ${e}`);
        }
    });
    const propOptions = suppliedOptions[0];
    return propOptions;
}
function getMemberType$1(propOptions) {
    if (propOptions && propOptions.mutable === true) {
        return 2 /* PropMutable */;
    }
    return 1 /* Prop */;
}
function getAttributeName(propOptions, memberName) {
    if (propOptions && typeof propOptions.attr === 'string' && propOptions.attr.trim().length > 0) {
        return propOptions.attr.trim();
    }
    return toDashCase(memberName);
}
function getReflectToAttr(propOptions) {
    if (propOptions && propOptions.reflectToAttr === true) {
        return true;
    }
    return false;
}
function getAttribType(diagnostics, sourceFile, prop, memberName) {
    let attribType;
    // If the @Prop() attribute does not have a defined type then infer it
    if (!prop.type) {
        let attribTypeText = inferPropType(prop.initializer);
        if (!attribTypeText) {
            attribTypeText = 'any';
            const diagnostic = buildWarn(diagnostics);
            diagnostic.messageText = `Prop type provided is not supported, defaulting to any: '${prop.getFullText()}'`;
        }
        attribType = {
            text: attribTypeText,
            required: prop.exclamationToken !== undefined && memberName !== 'mode',
            optional: prop.questionToken !== undefined
        };
    }
    else {
        attribType = {
            text: prop.type.getText(),
            required: prop.exclamationToken !== undefined && memberName !== 'mode',
            optional: prop.questionToken !== undefined,
            typeReferences: getAttributeTypeInfo(prop.type, sourceFile)
        };
    }
    return attribType;
}
function inferPropType(expression) {
    if (expression == null) {
        return undefined;
    }
    if (ts.isStringLiteral(expression)) {
        return 'string';
    }
    if (ts.isNumericLiteral(expression)) {
        return 'number';
    }
    if ([ts.SyntaxKind.BooleanKeyword, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].indexOf(expression.kind) !== -1) {
        return 'boolean';
    }
    if ((ts.SyntaxKind.NullKeyword === expression.kind) ||
        (ts.SyntaxKind.UndefinedKeyword === expression.kind) ||
        (ts.isRegularExpressionLiteral(expression)) ||
        (ts.isArrayLiteralExpression(expression)) ||
        (ts.isObjectLiteralExpression(expression))) {
        return 'any';
    }
    return undefined;
}
function propTypeFromTSType(type) {
    const isStr = checkType(type, isString);
    const isNu = checkType(type, isNumber);
    const isBool = checkType(type, isBoolean);
    const isAnyType = checkType(type, isAny);
    if (isAnyType) {
        return 1 /* Any */;
    }
    // if type is more than a primitive type at the same time, we mark it as any
    if (Number(isStr) + Number(isNu) + Number(isBool) > 1) {
        return 1 /* Any */;
    }
    // at this point we know the prop's type is NOT the mix of primitive types
    if (isStr) {
        return 2 /* String */;
    }
    if (isNu) {
        return 8 /* Number */;
    }
    if (isBool) {
        return 4 /* Boolean */;
    }
    return 0 /* Unknown */;
}
function checkType(type, check) {
    if (type.flags & ts.TypeFlags.Union) {
        const union = type;
        if (union.types.some(type => checkType(type, check))) {
            return true;
        }
    }
    return check(type);
}
function isBoolean(t) {
    if (t) {
        return !!(t.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLike | ts.TypeFlags.BooleanLike));
    }
    return false;
}
function isNumber(t) {
    if (t) {
        return !!(t.flags & (ts.TypeFlags.Number | ts.TypeFlags.NumberLike | ts.TypeFlags.NumberLiteral));
    }
    return false;
}
function isString(t) {
    if (t) {
        return !!(t.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLike | ts.TypeFlags.StringLiteral));
    }
    return false;
}
function isAny(t) {
    if (t) {
        return !!(t.flags & ts.TypeFlags.Any);
    }
    return false;
}

function getStateDecoratorMeta(classNode) {
    return classNode.members
        .filter(isPropertyWithDecorators)
        .reduce((membersMeta, member) => {
        const elementDecorator = member.decorators.find(isDecoratorNamed('State'));
        if (elementDecorator) {
            membersMeta[member.name.getText()] = {
                memberType: 16 /* State */
            };
        }
        return membersMeta;
    }, {});
}

function getWatchDecoratorMeta(diagnostics, classNode, cmpMeta) {
    const methods = classNode.members.filter(isMethodWithDecorators);
    getChangeMetaByName(diagnostics, methods, cmpMeta, 'Watch');
    getChangeMetaByName(diagnostics, methods, cmpMeta, 'PropWillChange');
    getChangeMetaByName(diagnostics, methods, cmpMeta, 'PropDidChange');
}
function getChangeMetaByName(diagnostics, methods, cmpMeta, decoratorName) {
    methods.forEach(({ decorators, name }) => {
        decorators
            .filter(isDecoratorNamed(decoratorName))
            .forEach(propChangeDecorator => {
            const [propName] = getDeclarationParameters(propChangeDecorator);
            if (propName) {
                updateWatchCallback(diagnostics, cmpMeta, propName, name, decoratorName);
            }
        });
    });
}
function updateWatchCallback(diagnostics, cmpMeta, propName, decoratorData, decoratorName) {
    if (!isPropWatchable(cmpMeta, propName)) {
        const error = buildError(diagnostics);
        error.messageText = `@Watch('${propName}') is trying to watch for changes in a property that does not exist.
Make sure only properties decorated with @State() or @Prop() are watched.`;
        return;
    }
    cmpMeta.membersMeta[propName].watchCallbacks = cmpMeta.membersMeta[propName].watchCallbacks || [];
    cmpMeta.membersMeta[propName].watchCallbacks.push(decoratorData.getText());
    if (decoratorName === 'PropWillChange' || decoratorName === 'PropDidChange') {
        const diagnostic = buildWarn(diagnostics);
        diagnostic.messageText = `@${decoratorName}('${propName}') decorator within "${cmpMeta.tagNameMeta}" component has been deprecated. Please update to @Watch('${propName}').`;
    }
}
function isPropWatchable(cmpMeta, propName) {
    const membersMeta = cmpMeta.membersMeta;
    if (!membersMeta) {
        return false;
    }
    const member = membersMeta[propName];
    if (!member) {
        return false;
    }
    const type = member.memberType;
    return type === 16 /* State */ || type === 1 /* Prop */ || type === 2 /* PropMutable */;
}

function normalizeAssetsDir(config, componentFilePath, assetsMetas) {
    return assetsMetas.map((assetMeta) => {
        return Object.assign({}, assetMeta, normalizeAssetDir(config, componentFilePath, assetMeta.originalComponentPath));
    });
}
function normalizeAssetDir(config, componentFilePath, assetsDir) {
    const assetsMeta = {};
    // get the absolute path of the directory which the component is sitting in
    const componentDir = normalizePath(config.sys.path.dirname(componentFilePath));
    // get the relative path from the component file to the assets directory
    assetsDir = normalizePath(assetsDir.trim());
    if (config.sys.path.isAbsolute(assetsDir)) {
        // this path is absolute already!
        // add as the absolute path
        assetsMeta.absolutePath = assetsDir;
        // if this is an absolute path already, let's convert it to be relative
        assetsMeta.cmpRelativePath = config.sys.path.relative(componentDir, assetsDir);
    }
    else {
        // this path is relative to the component
        assetsMeta.cmpRelativePath = assetsDir;
        // create the absolute path to the asset dir
        assetsMeta.absolutePath = pathJoin(config, componentDir, assetsDir);
    }
    return assetsMeta;
}

function normalizeStyles(config, componentFilePath, stylesMeta) {
    const newStylesMeta = {};
    Object.keys(stylesMeta).forEach((modeName) => {
        newStylesMeta[modeName] = {
            externalStyles: []
        };
        const externalStyles = stylesMeta[modeName].externalStyles || [];
        newStylesMeta[modeName].externalStyles = externalStyles.map(externalStyle => {
            const { cmpRelativePath, absolutePath } = normalizeModeStylePaths(config, componentFilePath, externalStyle.originalComponentPath);
            const normalizedExternalStyles = {
                absolutePath: absolutePath,
                cmpRelativePath: cmpRelativePath,
                originalComponentPath: externalStyle.originalComponentPath,
                originalCollectionPath: externalStyle.originalCollectionPath
            };
            return normalizedExternalStyles;
        });
        if (typeof stylesMeta[modeName].styleStr === 'string') {
            newStylesMeta[modeName].styleStr = stylesMeta[modeName].styleStr;
        }
    });
    return newStylesMeta;
}
function normalizeModeStylePaths(config, componentFilePath, stylePath) {
    let cmpRelativePath;
    let absolutePath;
    // get the absolute path of the directory which the component is sitting in
    const componentDir = normalizePath(config.sys.path.dirname(componentFilePath));
    // get the relative path from the component file to the style
    let componentRelativeStylePath = normalizePath(stylePath.trim());
    if (config.sys.path.isAbsolute(componentRelativeStylePath)) {
        // this path is absolute already!
        // add to our list of style absolute paths
        absolutePath = componentRelativeStylePath;
        // if this is an absolute path already, let's convert it to be relative
        componentRelativeStylePath = config.sys.path.relative(componentDir, componentRelativeStylePath);
        // add to our list of style relative paths
        cmpRelativePath = componentRelativeStylePath;
    }
    else {
        // this path is relative to the component
        // add to our list of style relative paths
        cmpRelativePath = componentRelativeStylePath;
        // create the absolute path to the style file
        const absoluteStylePath = normalizePath(config.sys.path.join(componentDir, componentRelativeStylePath));
        // add to our list of style absolute paths
        absolutePath = absoluteStylePath;
    }
    return {
        cmpRelativePath,
        absolutePath
    };
}

function validateComponentClass(diagnostics, cmpMeta, classNode) {
    requiresReturnStatement(diagnostics, cmpMeta, classNode, 'hostData');
    requiresReturnStatement(diagnostics, cmpMeta, classNode, 'render');
}
function requiresReturnStatement(diagnostics, cmpMeta, classNode, methodName) {
    const classElm = classNode.members.find(m => isMethod(m, methodName));
    if (!classElm)
        return;
    let hasReturn = false;
    function visitNode(node) {
        if (node.kind === ts.SyntaxKind.ReturnStatement) {
            hasReturn = true;
        }
        ts.forEachChild(node, visitNode);
    }
    ts.forEachChild(classElm, visitNode);
    if (!hasReturn) {
        const diagnostic = buildWarn(diagnostics);
        diagnostic.messageText = `The "${methodName}()" method within the "${cmpMeta.tagNameMeta}" component is missing a "return" statement.`;
    }
}

function gatherMetadata(config, compilerCtx, buildCtx, typeChecker) {
    return (transformContext) => {
        function visit(node, tsSourceFile, moduleFile) {
            try {
                if (node.kind === ts.SyntaxKind.ImportDeclaration) {
                    getCollections(config, compilerCtx, buildCtx.collections, moduleFile, node);
                }
                if (ts.isClassDeclaration(node)) {
                    const cmpMeta = visitClass(config, buildCtx.diagnostics, typeChecker, node, tsSourceFile);
                    if (cmpMeta) {
                        if (moduleFile.cmpMeta) {
                            throw new Error(`More than one @Component() class in a single file is not valid`);
                        }
                        moduleFile.cmpMeta = cmpMeta;
                        cmpMeta.stylesMeta = normalizeStyles(config, moduleFile.sourceFilePath, cmpMeta.stylesMeta);
                        cmpMeta.assetsDirsMeta = normalizeAssetsDir(config, moduleFile.sourceFilePath, cmpMeta.assetsDirsMeta);
                    }
                }
                return node;
            }
            catch ({ message }) {
                const error = buildError(buildCtx.diagnostics);
                error.messageText = message;
                error.relFilePath = tsSourceFile.fileName;
            }
            return undefined;
        }
        return (tsSourceFile) => {
            const moduleFile = getModuleFile(compilerCtx, tsSourceFile.fileName);
            moduleFile.externalImports.length = 0;
            moduleFile.localImports.length = 0;
            moduleFile.cmpMeta = undefined;
            const results = ts.visitEachChild(tsSourceFile, (node) => {
                return visit(node, tsSourceFile, moduleFile);
            }, transformContext);
            if (moduleFile.cmpMeta) {
                const fileSymbol = typeChecker.getSymbolAtLocation(tsSourceFile);
                const fileExports = (fileSymbol && typeChecker.getExportsOfModule(fileSymbol)) || [];
                if (fileExports.length > 1) {
                    const warn = buildWarn(buildCtx.diagnostics);
                    warn.messageText = `@Component() should be the only export of the module.
Numerous export statements within a component module may cause undesirable bundling output, leading to unoptimized lazy loading.
Create a new auxiliary \`.ts\` file in order to export shared functionality.`;
                    warn.relFilePath = tsSourceFile.fileName;
                }
                if (fileExports.length === 0 ||
                    !isComponentClass$1(fileExports[0])) {
                    const error = buildError(buildCtx.diagnostics);
                    error.messageText = `Missing export in @Component() class`;
                    error.relFilePath = tsSourceFile.fileName;
                }
            }
            return results;
        };
    };
}
function isComponentClass$1(symbol) {
    const decorators = symbol.valueDeclaration && symbol.valueDeclaration.decorators;
    if (!decorators) {
        return false;
    }
    return isDecoratorNamed('Component')(decorators[0]);
}
function visitClass(config, diagnostics, typeChecker, classNode, sourceFile) {
    const cmpMeta = getComponentDecoratorMeta(diagnostics, typeChecker, classNode);
    if (!cmpMeta) {
        return null;
    }
    const componentClass = classNode.name.getText().trim();
    cmpMeta.componentClass = componentClass;
    cmpMeta.membersMeta = Object.assign({}, getElementDecoratorMeta(typeChecker, classNode), getMethodDecoratorMeta(config, diagnostics, typeChecker, classNode, sourceFile, componentClass), getStateDecoratorMeta(classNode), getPropDecoratorMeta(diagnostics, typeChecker, classNode, sourceFile, componentClass));
    cmpMeta.eventsMeta = getEventDecoratorMeta(diagnostics, typeChecker, classNode, sourceFile);
    cmpMeta.listenersMeta = getListenDecoratorMeta(typeChecker, classNode);
    // watch meta collection MUST happen after prop/state decorator meta collection
    getWatchDecoratorMeta(diagnostics, classNode, cmpMeta);
    // validate the user's component class for any common errors
    validateComponentClass(diagnostics, cmpMeta, classNode);
    // Return Class Declaration with Decorator removed and as default export
    return cmpMeta;
}

function getModuleImports(config, compilerCtx) {
    return (transformContext) => {
        function visitImport(moduleFile, dirPath, importNode) {
            if (importNode.moduleSpecifier && ts.isStringLiteral(importNode.moduleSpecifier)) {
                let importPath = importNode.moduleSpecifier.text;
                if (config.sys.path.isAbsolute(importPath)) {
                    importPath = normalizePath(importPath);
                    moduleFile.localImports.push(importPath);
                }
                else if (importPath.startsWith('.')) {
                    importPath = normalizePath(config.sys.path.resolve(dirPath, importPath));
                    moduleFile.localImports.push(importPath);
                }
                else {
                    moduleFile.externalImports.push(importPath);
                }
            }
            return importNode;
        }
        function visit(moduleFile, dirPath, node) {
            switch (node.kind) {
                case ts.SyntaxKind.ImportDeclaration:
                    return visitImport(moduleFile, dirPath, node);
                default:
                    return ts.visitEachChild(node, (node) => {
                        return visit(moduleFile, dirPath, node);
                    }, transformContext);
            }
        }
        return (tsSourceFile) => {
            const moduleFile = getModuleFile(compilerCtx, tsSourceFile.fileName);
            const dirPath = config.sys.path.dirname(tsSourceFile.fileName);
            return visit(moduleFile, dirPath, tsSourceFile);
        };
    };
}

function removeCollectionImports(compilerCtx) {
    /*
  
      // remove side effect collection imports like:
      import 'ionicons';
  
      // do not remove collection imports with importClauses:
      import * as asdf 'ionicons';
      import { asdf } '@ionic/core';
  
    */
    return (transformContext) => {
        function visitImport(importNode) {
            if (!importNode.importClause && importNode.moduleSpecifier && ts.isStringLiteral(importNode.moduleSpecifier)) {
                // must not have an import clause
                // must have a module specifier and
                // the module specifier must be a string literal
                const moduleImport = importNode.moduleSpecifier.text;
                // test if this side effect import is a collection
                const isCollectionImport = compilerCtx.collections.some(c => {
                    return c.collectionName === moduleImport;
                });
                if (isCollectionImport) {
                    // turns out this is a side effect import is a collection,
                    // we actually don't want to include this in the JS output
                    // we've already gather the types we needed, kthxbai
                    return null;
                }
            }
            return importNode;
        }
        function visit(node) {
            switch (node.kind) {
                case ts.SyntaxKind.ImportDeclaration:
                    return visitImport(node);
                default:
                    return ts.visitEachChild(node, visit, transformContext);
            }
        }
        return (tsSourceFile) => {
            return visit(tsSourceFile);
        };
    };
}

const CLASS_DECORATORS_TO_REMOVE = new Set(['Component']);
// same as the "declare" variables in the root index.ts file
const DECORATORS_TO_REMOVE = new Set([
    'Element',
    'Event',
    'Listen',
    'Method',
    'Prop',
    'PropDidChange',
    'PropWillChange',
    'State',
    'Watch'
]);
/**
 * Remove all decorators that are for metadata purposes
 */
function removeDecorators() {
    return (transformContext) => {
        function visit(node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    if (!isComponentClass(node)) {
                        return node;
                    }
                    return visitComponentClass(node);
                default:
                    return ts.visitEachChild(node, visit, transformContext);
            }
        }
        return (tsSourceFile) => visit(tsSourceFile);
    };
}
/**
 * Visit the component class and remove decorators
 * @param classNode
 */
function visitComponentClass(classNode) {
    classNode.decorators = removeDecoratorsByName(classNode.decorators, CLASS_DECORATORS_TO_REMOVE);
    classNode.members.forEach((member) => {
        if (Array.isArray(member.decorators)) {
            member.decorators = removeDecoratorsByName(member.decorators, DECORATORS_TO_REMOVE);
        }
    });
    return classNode;
}
/**
 * Remove a decorator from the an array by name
 * @param decorators array of decorators
 * @param name name to remove
 */
function removeDecoratorsByName(decoratorList, names) {
    const updatedDecoratorList = decoratorList.filter(dec => {
        const toRemove = ts.isCallExpression(dec.expression) &&
            ts.isIdentifier(dec.expression.expression) &&
            names.has(dec.expression.expression.text);
        return !toRemove;
    });
    if (updatedDecoratorList.length === 0 && decoratorList.length > 0) {
        return undefined;
    }
    if (updatedDecoratorList.length !== decoratorList.length) {
        return ts.createNodeArray(updatedDecoratorList);
    }
    return decoratorList;
}

function removeStencilImports() {
    return (transformContext) => {
        function visitImport(importNode) {
            if (importNode.moduleSpecifier &&
                ts.isStringLiteral(importNode.moduleSpecifier) &&
                importNode.moduleSpecifier.text === '@stencil/core') {
                return null;
            }
            return importNode;
        }
        function visit(node) {
            switch (node.kind) {
                case ts.SyntaxKind.ImportDeclaration:
                    return visitImport(node);
                default:
                    return ts.visitEachChild(node, visit, transformContext);
            }
        }
        return (tsSourceFile) => {
            return visit(tsSourceFile);
        };
    };
}

function transpileService(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        let changedTsFiles;
        if (shouldScanForTsChanges(compilerCtx, buildCtx)) {
            // either we haven't figured out all the root ts files yet
            // or we already know we need to do a full rebuild
            // or new files were added or deleted
            // so let's scan the entire src directory looking for ts files to transpile
            // rootTsFiles always used as a way to know the active modules being used
            // basically so our cache knows which stuff we can forget about
            compilerCtx.rootTsFiles = yield scanDirForTsFiles(config, compilerCtx, buildCtx);
            changedTsFiles = compilerCtx.rootTsFiles.slice();
        }
        else {
            changedTsFiles = buildCtx.filesChanged.filter(filePath => {
                // do transpiling if one of the changed files is a ts file
                // and the changed file is not the components.d.ts file
                // when the components.d.ts file is written to disk it shouldn't cause a new build
                return isFileIncludePath(config, filePath);
            });
        }
        if (!compilerCtx.tsService) {
            // create the typescript language service
            const timeSpan = buildCtx.createTimeSpan(`buildTsService started`, true);
            compilerCtx.tsService = yield buildTsService(config, compilerCtx, buildCtx);
            timeSpan.finish(`buildTsService finished`);
        }
        const doTranspile = (changedTsFiles.length > 0);
        if (doTranspile) {
            // we've found ts files we need to tranpsile
            // or at least one ts file has changed
            const timeSpan = buildCtx.createTimeSpan(`transpile started`);
            // only use the file system cache when it's enabled and this is the first build
            const useFsCache = config.enableCache && !buildCtx.isRebuild;
            // go ahead and kick off the ts service
            yield compilerCtx.tsService(compilerCtx, buildCtx, changedTsFiles, true, useFsCache);
            timeSpan.finish(`transpile finished`);
        }
        return doTranspile;
    });
}
function buildTsService(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const transpileCtx = {
            compilerCtx: compilerCtx,
            buildCtx: buildCtx,
            configKey: null,
            snapshotVersions: new Map(),
            filesFromFsCache: [],
            hasQueuedTsServicePrime: false
        };
        const userCompilerOptions = yield getUserCompilerOptions(config, transpileCtx.compilerCtx, transpileCtx.buildCtx);
        const compilerOptions = Object.assign({}, userCompilerOptions);
        compilerOptions.isolatedModules = false;
        compilerOptions.suppressOutputPathCheck = true;
        compilerOptions.allowNonTsExtensions = true;
        compilerOptions.removeComments = !config.devMode;
        compilerOptions.sourceMap = false;
        compilerOptions.lib = undefined;
        compilerOptions.types = undefined;
        compilerOptions.noEmit = undefined;
        compilerOptions.noEmitOnError = undefined;
        compilerOptions.paths = undefined;
        compilerOptions.rootDirs = undefined;
        compilerOptions.declaration = undefined;
        compilerOptions.declarationDir = undefined;
        compilerOptions.out = undefined;
        compilerOptions.outFile = undefined;
        compilerOptions.outDir = undefined;
        // create a config key that will be used as part of the file's cache key
        transpileCtx.configKey = createConfiKey(config, compilerOptions);
        const servicesHost = {
            getScriptFileNames: () => transpileCtx.compilerCtx.rootTsFiles,
            getScriptVersion: (filePath) => transpileCtx.snapshotVersions.get(filePath),
            getScriptSnapshot: (filePath) => {
                try {
                    const sourceText = transpileCtx.compilerCtx.fs.readFileSync(filePath);
                    return ts.ScriptSnapshot.fromString(sourceText);
                }
                catch (e) { }
                return undefined;
            },
            getCurrentDirectory: () => config.cwd,
            getCompilationSettings: () => compilerOptions,
            getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
            fileExists: (filePath) => transpileCtx.compilerCtx.fs.accessSync(filePath),
            readFile: (filePath) => {
                try {
                    return transpileCtx.compilerCtx.fs.readFileSync(filePath);
                }
                catch (e) { }
                return undefined;
            },
            readDirectory: ts.sys.readDirectory,
            getCustomTransformers: () => {
                const typeChecker = services.getProgram().getTypeChecker();
                return {
                    before: [
                        gatherMetadata(config, transpileCtx.compilerCtx, transpileCtx.buildCtx, typeChecker),
                        removeDecorators(),
                        addComponentMetadata(transpileCtx.compilerCtx.moduleFiles),
                    ],
                    after: [
                        removeStencilImports(),
                        removeCollectionImports(transpileCtx.compilerCtx),
                        getModuleImports(config, transpileCtx.compilerCtx),
                        componentDependencies(transpileCtx.compilerCtx)
                    ]
                };
            }
        };
        // create our typescript language service to be reused
        const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
        // return the function we'll continually use on each rebuild
        return (compilerCtx, buildCtx, tsFilePaths, checkCacheKey, useFsCache) => __awaiter(this, void 0, void 0, function* () {
            transpileCtx.compilerCtx = compilerCtx;
            transpileCtx.buildCtx = buildCtx;
            // ensure components.d.ts isn't in the transpile (for now)
            const cmpDts = getComponentsDtsSrcFilePath(config);
            tsFilePaths = tsFilePaths.filter(tsFilePath => tsFilePath !== cmpDts);
            // loop through each ts file that has changed
            yield Promise.all(tsFilePaths.map((tsFilePath) => __awaiter(this, void 0, void 0, function* () {
                yield tranpsileTsFile(config, services, transpileCtx, tsFilePath, checkCacheKey, useFsCache);
            })));
            if (config.watch && !transpileCtx.hasQueuedTsServicePrime) {
                // prime the ts service cache for all the ts files pulled from the file system cache
                transpileCtx.hasQueuedTsServicePrime = true;
                primeTsServiceCache(transpileCtx);
            }
        });
    });
}
function tranpsileTsFile(config, services, ctx, tsFilePath, checkCacheKey, useFsCache) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.buildCtx.isActiveBuild) {
            ctx.buildCtx.debug(`tranpsileTsFile aborted, not active build: ${tsFilePath}`);
            return;
        }
        if (ctx.buildCtx.hasError) {
            ctx.buildCtx.debug(`tranpsileTsFile aborted: ${tsFilePath}`);
            return;
        }
        const hasWarning$$1 = ctx.buildCtx.hasWarning && !config._isTesting;
        // look up the old cache key using the ts file path
        const oldCacheKey = ctx.snapshotVersions.get(tsFilePath);
        // read the file content to be transpiled
        const content = yield ctx.compilerCtx.fs.readFile(tsFilePath);
        // create a cache key out of the content and compiler options
        const cacheKey = `transpileService_${config.sys.generateContentHash(content + tsFilePath + ctx.configKey, 32)}`;
        if (oldCacheKey === cacheKey && checkCacheKey && !hasWarning$$1) {
            // file is unchanged, thanks typescript caching!
            return;
        }
        // save the cache key for future lookups
        ctx.snapshotVersions.set(tsFilePath, cacheKey);
        let ensureExternalImports = null;
        if (useFsCache && !hasWarning$$1) {
            // let's check to see if we've already cached this in our filesystem
            // but only bother for the very first build
            const cachedStr = yield ctx.compilerCtx.cache.get(cacheKey);
            if (cachedStr != null) {
                // remember which files we were able to get from cached versions
                // so we can later fully prime the ts service cache
                ctx.filesFromFsCache.push(tsFilePath);
                // whoa cool, we found we already cached this in our filesystem
                const cachedModuleFile = JSON.parse(cachedStr);
                // and there you go, thanks fs cache!
                // put the cached module file data in our context
                ctx.compilerCtx.moduleFiles[tsFilePath] = cachedModuleFile.moduleFile;
                // add any collections to the context which this cached file may know about
                cachedModuleFile.moduleFile.externalImports.forEach(moduleId => {
                    addCollection(config, ctx.compilerCtx, ctx.compilerCtx.collections, cachedModuleFile.moduleFile, config.rootDir, moduleId);
                });
                // write the cached js output too
                yield outputFile(config, ctx, cachedModuleFile.moduleFile.jsFilePath, cachedModuleFile.jsText);
                return;
            }
        }
        else {
            // purposely not using the fs cache
            // this is probably when we want to prime the
            // in-memory ts cache after the first build has completed
            const existingModuleFile = ctx.compilerCtx.moduleFiles[tsFilePath];
            if (existingModuleFile && Array.isArray(existingModuleFile.externalImports)) {
                ensureExternalImports = existingModuleFile.externalImports.slice();
            }
        }
        // let's do this!
        const output = services.getEmitOutput(tsFilePath);
        // keep track of how many files we transpiled (great for debugging/testing)
        ctx.buildCtx.transpileBuildCount++;
        if (output.emitSkipped) {
            // oh no! we've got some typescript diagnostics for this file!
            const tsDiagnostics = services.getCompilerOptionsDiagnostics()
                .concat(services.getSyntacticDiagnostics(tsFilePath));
            loadTypeScriptDiagnostics(config, ctx.buildCtx.diagnostics, tsDiagnostics);
            return;
        }
        yield Promise.all(output.outputFiles.map((tsOutput) => __awaiter(this, void 0, void 0, function* () {
            const outputFilePath = normalizePath(tsOutput.name);
            if (!ctx.buildCtx.isActiveBuild) {
                ctx.buildCtx.debug(`tranpsileTsFile write aborted, not active build: ${tsFilePath}`);
                return;
            }
            if (ctx.buildCtx.hasError) {
                ctx.buildCtx.debug(`tranpsileTsFile write aborted: ${tsFilePath}`);
                return;
            }
            if (outputFilePath.endsWith('.js')) {
                // this is the JS output of the typescript file transpiling
                const moduleFile = getModuleFile(ctx.compilerCtx, tsFilePath);
                moduleFile.jsFilePath = outputFilePath;
                if (Array.isArray(ensureExternalImports)) {
                    ensureExternalImports.forEach(moduleId => {
                        addCollection(config, ctx.compilerCtx, ctx.compilerCtx.collections, moduleFile, config.rootDir, moduleId);
                    });
                }
                if (config.enableCache && !hasWarning$$1) {
                    // cache this module file and js text for later
                    const cacheModuleFile = {
                        moduleFile: moduleFile,
                        jsText: tsOutput.text
                    };
                    // let's turn our data into a string to be cached for later fs lookups
                    const cachedStr = JSON.stringify(cacheModuleFile);
                    yield ctx.compilerCtx.cache.put(cacheKey, cachedStr);
                }
            }
            // write the text to our in-memory fs and output targets
            yield outputFile(config, ctx, outputFilePath, tsOutput.text);
        })));
    });
}
function outputFile(config, ctx, outputFilePath, outputText) {
    return __awaiter(this, void 0, void 0, function* () {
        // the in-memory .js version is be virtually next to the source ts file
        // but it never actually gets written to disk, just there in spirit
        yield ctx.compilerCtx.fs.writeFile(outputFilePath, outputText, { inMemoryOnly: true });
        // also write the output to each of the output targets
        const outputTargets = config.outputTargets.filter(o => o.type === 'dist');
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            const relPath = config.sys.path.relative(config.srcDir, outputFilePath);
            const outputTargetFilePath = pathJoin(config, outputTarget.collectionDir, relPath);
            yield ctx.compilerCtx.fs.writeFile(outputTargetFilePath, outputText);
        })));
    });
}
function shouldScanForTsChanges(compilerCtx, buildCtx) {
    if (!compilerCtx.rootTsFiles) {
        return true;
    }
    if (buildCtx.requiresFullBuild) {
        return true;
    }
    if (buildCtx.filesAdded.length > 0 || buildCtx.filesDeleted.length > 0) {
        return true;
    }
    if (buildCtx.dirsAdded.length > 0 || buildCtx.dirsDeleted.length > 0) {
        return true;
    }
    return false;
}
function scanDirForTsFiles(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const scanDirTimeSpan = buildCtx.createTimeSpan(`scan ${config.srcDir} started`, true);
        // loop through this directory and sub directories looking for
        // files that need to be transpiled
        const dirItems = yield compilerCtx.fs.readdir(config.srcDir, { recursive: true });
        // filter down to only the ts files we should include
        const tsFileItems = dirItems.filter(item => {
            return item.isFile && isFileIncludePath(config, item.absPath);
        });
        const componentsDtsSrcFilePath = getComponentsDtsSrcFilePath(config);
        // return just the abs path
        // make sure it doesn't include components.d.ts
        const tsFilePaths = tsFileItems
            .map(tsFileItem => tsFileItem.absPath)
            .filter(tsFileAbsPath => tsFileAbsPath !== componentsDtsSrcFilePath);
        scanDirTimeSpan.finish(`scan for ts files finished: ${tsFilePaths.length}`);
        if (tsFilePaths.length === 0) {
            config.logger.warn(`No components found within: ${config.srcDir}`);
        }
        return tsFilePaths;
    });
}
function primeTsServiceCache(transpileCtx) {
    if (transpileCtx.filesFromFsCache.length === 0) {
        return;
    }
    // if this is a watch build and we have files that were pulled directly from the cache
    // let's go through and run the ts service on these files again again so
    // that the ts service cache is all updated and ready to go. But this can
    // happen after the first build since so far we're good to go w/ the fs cache
    const unsubscribe = transpileCtx.compilerCtx.events.subscribe('buildFinish', () => {
        unsubscribe();
        if (transpileCtx.buildCtx.hasError) {
            return;
        }
        // we can wait a bit and let things cool down on the main thread first
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            if (transpileCtx.buildCtx.hasError) {
                return;
            }
            const timeSpan = transpileCtx.buildCtx.createTimeSpan(`prime ts service cache started, ${transpileCtx.filesFromFsCache.length} file(s)`, true);
            // loop through each file system cached ts files and run the transpile again
            // so that we get the ts service's cache all up to speed
            yield transpileCtx.compilerCtx.tsService(transpileCtx.compilerCtx, transpileCtx.buildCtx, transpileCtx.filesFromFsCache, false, false);
            timeSpan.finish(`prime ts service cache finished`);
        }), PRIME_TS_CACHE_TIMEOUT);
    });
}
// how long we should wait after the first build
// to go ahead and prime the in-memory TS cache
const PRIME_TS_CACHE_TIMEOUT = 1000;
function isFileIncludePath(config, readPath) {
    for (var i = 0; i < config.excludeSrc.length; i++) {
        if (minimatch_1(readPath, config.excludeSrc[i])) {
            // this file is a file we want to exclude
            return false;
        }
    }
    for (i = 0; i < config.includeSrc.length; i++) {
        if (minimatch_1(readPath, config.includeSrc[i])) {
            // this file is a file we want to include
            return true;
        }
    }
    // not a file we want to include, let's not add it
    return false;
}
function createConfiKey(config, compilerOptions) {
    // create a unique config key with stuff that "might" matter for typescript builds
    // not using the entire config object
    // since not everything is a primitive and could have circular references
    return config.sys.generateContentHash(JSON.stringify([
        config.devMode,
        config.minifyCss,
        config.minifyJs,
        config.buildEs5,
        config.rootDir,
        config.srcDir,
        config.autoprefixCss,
        config.preamble,
        config.namespace,
        config.hashedFileNameLength,
        config.hashFileNames,
        config.outputTargets,
        config.enableCache,
        config.assetVersioning,
        config.buildAppCore,
        config.excludeSrc,
        config.includeSrc,
        compilerOptions,
        'typescript3.2.21'
    ]), 32);
}

function validateTypesMain(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.validateTypes === false) {
            // probably unit testing that doesn't
            // want to take time to validate the types
            return;
        }
        if (!buildCtx.isActiveBuild) {
            buildCtx.debug(`validateTypesMain aborted, not active build`);
            return;
        }
        if (buildCtx.hasError) {
            buildCtx.debug(`validateTypesMain aborted`);
            return;
        }
        // send data over to our worker process to validate types
        // don't let this block the main thread and we'll check
        // its response sometime later
        const timeSpan = buildCtx.createTimeSpan(`validateTypes started`, true);
        const componentsDtsSrcFilePath = getComponentsDtsSrcFilePath(config);
        const rootTsFiles = compilerCtx.rootTsFiles.slice();
        // ensure components.d.ts IS in the type validation transpile
        if (!rootTsFiles.includes(componentsDtsSrcFilePath)) {
            rootTsFiles.push(componentsDtsSrcFilePath);
        }
        const collectionNames = compilerCtx.collections.map(c => c.collectionName);
        buildCtx.validateTypesHandler = (results) => __awaiter(this, void 0, void 0, function* () {
            timeSpan.finish(`validateTypes finished`);
            compilerCtx.fs.cancelDeleteDirectoriesFromDisk(results.dirPaths);
            compilerCtx.fs.cancelDeleteFilesFromDisk(results.filePaths);
            if (results.diagnostics.length === 0) {
                // ┏(-_-)┛ ┗(-_-)┓ ┗(-_-)┛ ┏(-_-)┓
                // app successful validated
                // and types written to disk if it's a dist build
                // null it out so we know there's nothing to wait on
                buildCtx.validateTypesHandler = null;
                buildCtx.validateTypesPromise = null;
                return;
            }
            if (buildCtx.hasFinished) {
                // the build has already finished before the
                // type checking transpile finished, which is fine for watch
                // we'll need to create build to show the diagnostics
                if (buildCtx.isActiveBuild) {
                    buildCtx.debug(`validateTypesHandler, build already finished, creating a new build`);
                    const diagnosticsBuildCtx = new BuildContext(config, compilerCtx);
                    diagnosticsBuildCtx.start();
                    diagnosticsBuildCtx.diagnostics.push(...results.diagnostics);
                    diagnosticsBuildCtx.finish();
                }
            }
            else {
                // cool the build hasn't finished yet
                // so let's add the diagnostics to the build now
                // so that the current build will print these
                buildCtx.diagnostics.push(...results.diagnostics);
                // null out so we don't try this again
                buildCtx.validateTypesHandler = null;
                buildCtx.validateTypesPromise = null;
                yield buildCtx.finish();
            }
        });
        // get the typescript compiler options
        const compilerOptions = yield getUserCompilerOptions(config, compilerCtx, buildCtx);
        // only write dts files when we have an output target with a types directory
        const emitDtsFiles = config.outputTargets.some(o => !!o.typesDir);
        // kick off validating types by sending the data over to the worker process
        buildCtx.validateTypesPromise = config.sys.validateTypes(compilerOptions, emitDtsFiles, config.cwd, collectionNames, rootTsFiles);
        // when the validate types build finishes
        // let's run the handler we put on the build context
        buildCtx.validateTypesPromise.then(buildCtx.validateTypesHandler.bind(buildCtx));
    });
}

function transpileApp(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const doTranspile = yield transpileService(config, compilerCtx, buildCtx);
            yield processMetadata(config, compilerCtx, buildCtx, doTranspile);
        }
        catch (e) {
            // gah!!
            catchError(buildCtx.diagnostics, e);
        }
    });
}
function processMetadata(config, compilerCtx, buildCtx, doTranspile) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!buildCtx.isActiveBuild) {
            buildCtx.debug(`processMetadata aborted, not active build`);
            return;
        }
        if (buildCtx.hasError) {
            buildCtx.debug(`processMetadata aborted`);
            return;
        }
        // let's clean up the module file cache so we only
        // hold on to stuff we know is being used
        cleanModuleFileCache(compilerCtx);
        // get all the active module files
        const moduleFiles = Object.keys(compilerCtx.moduleFiles).map(key => compilerCtx.moduleFiles[key]);
        // see if any of the active modules are using slot or svg
        // useful for the build process later on
        // TODO: hasSlot and hasSvg does not account for dependencies
        buildCtx.hasSlot = moduleFiles.some(mf => mf.hasSlot);
        buildCtx.hasSvg = moduleFiles.some(mf => mf.hasSvg);
        if (doTranspile && !buildCtx.hasError) {
            // ts changes have happened!!
            // create the components.d.ts file and write to disk
            yield generateComponentTypes(config, compilerCtx, buildCtx);
            if (!config._isTesting) {
                // now that we've updated teh components.d.ts file
                // lets do a full typescript build (but in another thread)
                validateTypesMain(config, compilerCtx, buildCtx);
            }
        }
    });
}
function cleanModuleFileCache(compilerCtx) {
    // let's clean up the module file cache so we only
    // hold on to stuff we know is being used
    const foundSourcePaths = [];
    compilerCtx.rootTsFiles.forEach(rootTsFile => {
        const moduleFile = compilerCtx.moduleFiles[rootTsFile];
        addSourcePaths(compilerCtx, foundSourcePaths, moduleFile);
    });
    const cachedSourcePaths = Object.keys(compilerCtx.moduleFiles);
    cachedSourcePaths.forEach(sourcePath => {
        if (sourcePath.endsWith('.d.ts') || sourcePath.endsWith('.js')) {
            // don't bother cleaning up for .d.ts and .js modules files
            return;
        }
        if (!foundSourcePaths.includes(sourcePath)) {
            // this source path is a typescript file
            // but we never found it again, so let's forget it
            delete compilerCtx.moduleFiles[sourcePath];
        }
    });
}
function addSourcePaths(compilerCtx, foundSourcePaths, moduleFile) {
    if (moduleFile && !foundSourcePaths.includes(moduleFile.sourceFilePath)) {
        foundSourcePaths.push(moduleFile.sourceFilePath);
        moduleFile.localImports.forEach(localImport => {
            const moduleFile = compilerCtx.moduleFiles[localImport];
            if (moduleFile) {
                addSourcePaths(compilerCtx, foundSourcePaths, moduleFile);
            }
        });
    }
}

function docs(config, compilerCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        compilerCtx = getCompilerCtx(config, compilerCtx);
        const buildCtx = new BuildContext(config, compilerCtx);
        config.logger.info(config.logger.cyan(`${config.sys.compiler.name} v${config.sys.compiler.version}`));
        // keep track of how long the entire build process takes
        const timeSpan = config.logger.createTimeSpan(`generate docs, ${config.fsNamespace}, started`);
        try {
            // begin the build
            // async scan the src directory for ts files
            // then transpile them all in one go
            yield transpileApp(config, compilerCtx, buildCtx);
            // generate each of the docs
            yield generateDocs$1(config, compilerCtx, buildCtx);
        }
        catch (e) {
            // catch all phase
            catchError(buildCtx.diagnostics, e);
        }
        // finalize phase
        buildCtx.diagnostics = cleanDiagnostics(buildCtx.diagnostics);
        config.logger.printDiagnostics(buildCtx.diagnostics);
        // create a nice pretty message stating what happend
        let buildStatus = 'finished';
        let statusColor = 'green';
        if (hasError(buildCtx.diagnostics)) {
            buildStatus = 'failed';
            statusColor = 'red';
        }
        timeSpan.finish(`generate docs ${buildStatus}`, statusColor, true, true);
    });
}
function generateDocs$1(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.buildDocs) {
            return;
        }
        const distOutputTargets = config.outputTargets.filter(o => o.type === 'dist');
        const docsOutputTargets = config.outputTargets.filter(o => {
            return o.type === 'docs' || o.type === 'docs-json' || o.type === 'docs-custom';
        });
        const docsData = yield generateDocData(config, compilerCtx, buildCtx.diagnostics);
        const strictCheck = docsOutputTargets.some(o => !!o.strict);
        if (strictCheck) {
            strickCheckDocs(config, docsData);
        }
        // generate web-components.json
        yield generateWebComponentsJson(config, compilerCtx, distOutputTargets, docsData);
        // generate READMEs docs
        const readmeTargets = docsOutputTargets.filter(o => o.type === 'docs');
        if (readmeTargets.length > 0) {
            yield generateReadmeDocs(config, compilerCtx, readmeTargets, docsData);
        }
        // generate json docs
        const jsonTargets = docsOutputTargets.filter(o => o.type === 'docs-json');
        if (jsonTargets.length > 0) {
            yield generateJsonDocs(compilerCtx, jsonTargets, docsData);
        }
        // generate custom docs
        const customTargets = docsOutputTargets.filter(o => o.type === 'docs-custom');
        if (customTargets.length > 0) {
            yield generateCustomDocs(config, customTargets, docsData);
        }
    });
}

function generateServiceWorkers(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const wwwServiceOutputs = yield getServiceWorkerOutputs(config, compilerCtx, buildCtx);
        if (wwwServiceOutputs.length === 0) {
            // no output targets require service workers
            return;
        }
        // let's make sure they have what we need from workbox installed
        yield config.sys.lazyRequire.ensure(config.logger, config.rootDir, [WORKBOX_BUILD_MODULE_ID]);
        // we've ensure workbox is installed, so let's require it now
        const workbox = config.sys.lazyRequire.require(WORKBOX_BUILD_MODULE_ID);
        const promises = wwwServiceOutputs.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield generateServiceWorker(config, buildCtx, outputTarget, workbox);
        }));
        yield Promise.all(promises);
    });
}
function generateServiceWorker(config, buildCtx, outputTarget, workbox) {
    return __awaiter(this, void 0, void 0, function* () {
        ignoreLegacyBundles(config, outputTarget.serviceWorker);
        if (hasSrcConfig(outputTarget)) {
            yield Promise.all([
                copyLib(buildCtx, outputTarget, workbox),
                injectManifest(buildCtx, outputTarget, workbox)
            ]);
        }
        else {
            yield generateSW(buildCtx, outputTarget.serviceWorker, workbox);
        }
    });
}
function copyLib(buildCtx, outputTarget, workbox) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeSpan = buildCtx.createTimeSpan(`copy service worker library started`, true);
        try {
            yield workbox.copyWorkboxLibraries(outputTarget.dir);
        }
        catch (e) {
            // workaround for workbox issue in the latest alpha
            const d = buildWarn(buildCtx.diagnostics);
            d.messageText = 'Service worker library already exists';
        }
        timeSpan.finish(`copy service worker library finished`);
    });
}
function generateSW(buildCtx, serviceWorker, workbox) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeSpan = buildCtx.createTimeSpan(`generate service worker started`);
        try {
            yield workbox.generateSW(serviceWorker);
            timeSpan.finish(`generate service worker finished`);
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
    });
}
function injectManifest(buildCtx, outputTarget, workbox) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeSpan = buildCtx.createTimeSpan(`inject manifest into service worker started`);
        try {
            yield workbox.injectManifest(outputTarget.serviceWorker);
            timeSpan.finish('inject manifest into service worker finished');
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
    });
}
function ignoreLegacyBundles(config, serviceWorker) {
    const ignorePattern = `**/${config.fsNamespace}/*.es5.entry.js`;
    if (typeof serviceWorker.globIgnores === 'string') {
        serviceWorker.globIgnores = [serviceWorker.globIgnores];
    }
    serviceWorker.globIgnores = serviceWorker.globIgnores || [];
    if (!serviceWorker.globIgnores.includes(ignorePattern)) {
        serviceWorker.globIgnores.push(ignorePattern);
    }
}
function hasSrcConfig(outputTarget) {
    return !!outputTarget.serviceWorker.swSrc;
}
function getServiceWorkerOutputs(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputTargets = config.outputTargets.filter(o => o.type === 'www' && o.serviceWorker);
        const wwwServiceOutputs = [];
        for (let i = 0; i < outputTargets.length; i++) {
            const shouldSkipSW = yield canSkipGenerateSW(config, compilerCtx, buildCtx, outputTargets[i]);
            if (!shouldSkipSW) {
                wwwServiceOutputs.push(outputTargets[i]);
            }
        }
        return wwwServiceOutputs;
    });
}
function canSkipGenerateSW(config, compilerCtx, buildCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!outputTarget.serviceWorker) {
            return true;
        }
        if (!config.srcIndexHtml) {
            return true;
        }
        const hasServiceWorkerChanged = hasServiceWorkerChanges(config, buildCtx);
        if ((compilerCtx.hasSuccessfulBuild && buildCtx.appFileBuildCount === 0 && !hasServiceWorkerChanged) || hasError(buildCtx.diagnostics)) {
            // no need to rebuild index.html if there were no app file changes
            return true;
        }
        const hasSrcIndexHtml = yield compilerCtx.fs.access(config.srcIndexHtml);
        if (!hasSrcIndexHtml) {
            buildCtx.debug(`generateServiceWorker, no index.html, so skipping sw build`);
            return true;
        }
        // let's build us some service workerz
        return false;
    });
}
const WORKBOX_BUILD_MODULE_ID = 'workbox-build';

function copyComponentStyles(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputTargets = config.outputTargets.filter(o => o.collectionDir);
        if (outputTargets.length === 0) {
            return;
        }
        const timeSpan = buildCtx.createTimeSpan(`copyComponentStyles started`, true);
        try {
            const absSrcStylePaths = [];
            buildCtx.entryModules.forEach(entryModule => {
                const cmps = entryModule.moduleFiles.filter(m => m.cmpMeta.stylesMeta);
                cmps.forEach(c => {
                    if (c.isCollectionDependency) {
                        return;
                    }
                    Object.keys(c.cmpMeta.stylesMeta).forEach(modeName => {
                        const styleMeta = c.cmpMeta.stylesMeta[modeName];
                        if (styleMeta.externalStyles) {
                            styleMeta.externalStyles.forEach(externalStyle => {
                                absSrcStylePaths.push(externalStyle.absolutePath);
                            });
                        }
                    });
                });
            });
            yield Promise.all(absSrcStylePaths.map((absSrcStylePath) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
                    const relPath = config.sys.path.relative(config.srcDir, absSrcStylePath);
                    const absDestStylePath = config.sys.path.join(outputTarget.collectionDir, relPath);
                    const content = yield compilerCtx.fs.readFile(absSrcStylePath);
                    yield compilerCtx.fs.writeFile(absDestStylePath, content);
                })));
            })));
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
        timeSpan.finish(`copyComponentStyles finished`);
    });
}

function generateCommonJsIndex(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const cjs = [
            `// ${config.namespace}: CommonJS Main`
        ];
        const distIndexCjsPath = getDistCjsIndexPath(config, outputTarget);
        yield compilerCtx.fs.writeFile(distIndexCjsPath, cjs.join('\n'));
    });
}

function getAppBrowserCorePolyfills(config) {
    return __awaiter(this, void 0, void 0, function* () {
        // first load up all of the polyfill content
        const readFilePromises = INLINE_POLYFILLS.map(polyfillFile => {
            const staticName = config.sys.path.join('polyfills', 'es5', polyfillFile);
            return config.sys.getClientCoreFile({ staticName: staticName });
        });
        // read all the polyfill content, in this particular order
        const results = yield Promise.all(readFilePromises);
        // concat the polyfills
        return results.join('\n').trim();
    });
}
function copyEsmCorePolyfills(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const polyfillsBuildDir = getPolyfillsEsmBuildPath(config, outputTarget, 'es5');
        yield POLYFILLS.map((polyfillFile) => __awaiter(this, void 0, void 0, function* () {
            const staticName = config.sys.path.join('polyfills', 'esm', polyfillFile);
            const polyfillsContent = yield config.sys.getClientCoreFile({ staticName: staticName });
            const polyfillDst = pathJoin(config, polyfillsBuildDir, polyfillFile);
            yield compilerCtx.fs.writeFile(polyfillDst, polyfillsContent);
        }));
    });
}
// order of the polyfills matters!! test test test
// actual source of the polyfills are found in /src/client/polyfills/
const INLINE_POLYFILLS = [
    'dom.js',
    'array.js',
    'object.js',
    'string.js',
    'promise.js',
    'map.js',
    'fetch.js',
    'url.js'
];
const POLYFILLS = [
    ...INLINE_POLYFILLS,
    'css-shim.js',
    'tslib.js'
];

function generateEsmIndexes(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const targets = ['es5', 'es2017'];
        yield Promise.all([
            generateEsmIndexShortcut(config, compilerCtx, outputTarget),
            ...targets.map(sourceTarget => generateEsmIndex(config, compilerCtx, outputTarget, sourceTarget))
        ]);
    });
}
function generateEsmIndexShortcut(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const indexPath = getDistEsmIndexPath(config, outputTarget);
        const contentJs = config.buildEs5
            ? `export * from './es5/index.js';`
            : `export * from './es2017/index.js';`;
        yield compilerCtx.fs.writeFile(indexPath, contentJs);
    });
}
function generateEsmIndex(config, compilerCtx, outputTarget, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const esm = [
            `// ${config.namespace}: ES Module`
        ];
        const exportsIndexPath = pathJoin(config, getDistEsmComponentsDir(config, outputTarget, sourceTarget), 'index.js');
        const fileExists = yield compilerCtx.fs.access(exportsIndexPath);
        if (fileExists) {
            yield addExport(config, compilerCtx, outputTarget, sourceTarget, esm, exportsIndexPath);
        }
        const distIndexEsmPath = getDistEsmIndexPath(config, outputTarget, sourceTarget);
        yield Promise.all([
            compilerCtx.fs.writeFile(distIndexEsmPath, esm.join('\n')),
            copyEsmCorePolyfills(config, compilerCtx, outputTarget),
            patchCollection(config, compilerCtx, outputTarget)
        ]);
    });
}
function addExport(config, compilerCtx, outputTarget, sourceTarget, esm, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileExists = yield compilerCtx.fs.access(filePath);
        if (fileExists) {
            let relPath = normalizePath(config.sys.path.relative(getDistEsmDir(config, outputTarget, sourceTarget), filePath));
            if (!relPath.startsWith('.')) {
                relPath = './' + relPath;
            }
            esm.push(`export * from '${relPath}';`);
        }
    });
}
function generateEsmHosts(config, compilerCtx, cmpRegistry, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (outputTarget.type !== 'dist' || !config.buildEsm) {
            return;
        }
        const esmImports = Object.keys(cmpRegistry).sort().map(tagName => {
            const cmpMeta = cmpRegistry[tagName];
            const data = formatBrowserLoaderComponent(cmpMeta);
            return {
                name: dashToPascalCase(tagName),
                data,
            };
        });
        const hosts = [
            generateEsmLoader(config, compilerCtx, outputTarget),
            generateEsmHost(config, compilerCtx, outputTarget, 'es2017', esmImports),
        ];
        if (config.buildEs5) {
            hosts.push(generateEsmHost(config, compilerCtx, outputTarget, 'es5', esmImports));
        }
        yield Promise.all(hosts);
    });
}
function generateEsmHost(config, compilerCtx, outputTarget, sourceTarget, esmImports) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            generateEsm(config, compilerCtx, outputTarget, sourceTarget, esmImports),
            generateDefineCustomElements(config, compilerCtx, outputTarget, sourceTarget),
        ]);
    });
}
function generateDefineCustomElements(config, compilerCtx, outputTarget, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const componentsFileName = getComponentsEsmFileName(config);
        const c = `
// ${config.namespace}: Custom Elements Define Library, ES Module/${sourceTarget} Target

import { defineCustomElement } from './${getCoreEsmFileName(config)}';
import { COMPONENTS } from './${componentsFileName}';

export function defineCustomElements(win, opts) {
  return defineCustomElement(win, COMPONENTS, opts);
}
`;
        const defineFilePath = getDefineCustomElementsPath(config, outputTarget, sourceTarget);
        yield compilerCtx.fs.writeFile(defineFilePath, c);
    });
}
function generateEsm(config, compilerCtx, outputTarget, sourceTarget, esmImports) {
    return __awaiter(this, void 0, void 0, function* () {
        const VAR = sourceTarget === 'es5' ? 'var' : 'const';
        const indexContent = [
            `// ${config.namespace}: Host Data, ES Module/${sourceTarget} Target`,
            `export ${VAR} COMPONENTS = ${JSON.stringify(esmImports.map(({ data }) => data))}`
        ].join('\n');
        const componentsEsmFilePath = getComponentsEsmBuildPath(config, outputTarget, sourceTarget);
        yield compilerCtx.fs.writeFile(componentsEsmFilePath, indexContent);
    });
}
function generateEsmLoader(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const loaderPath = getLoaderEsmPath(config, outputTarget);
        const es5EntryPoint = getDefineCustomElementsPath(config, outputTarget, 'es5');
        const es2017EntryPoint = getDefineCustomElementsPath(config, outputTarget, 'es2017');
        const packageJsonContent = JSON.stringify({
            'name': 'loader',
            'typings': './index.d.ts',
            'module': './index.js',
            'jsnext:main': './index.es2017.js',
            'es2015': './index.es2017.js',
            'es2017': './index.es2017.js'
        }, null, 2);
        const indexPath = config.buildEs5 ? es5EntryPoint : es2017EntryPoint;
        const indexDtsContent = generateIndexDts();
        const indexContent = `export * from '${normalizePath(config.sys.path.relative(loaderPath, indexPath))}';`;
        const indexES2017Content = `export * from '${normalizePath(config.sys.path.relative(loaderPath, es2017EntryPoint))}';`;
        yield Promise.all([
            compilerCtx.fs.writeFile(pathJoin(config, loaderPath, 'package.json'), packageJsonContent),
            compilerCtx.fs.writeFile(pathJoin(config, loaderPath, 'index.d.ts'), indexDtsContent),
            compilerCtx.fs.writeFile(pathJoin(config, loaderPath, 'index.js'), indexContent),
            compilerCtx.fs.writeFile(pathJoin(config, loaderPath, 'index.es2017.js'), indexES2017Content)
        ]);
    });
}
function patchCollection(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        // it's possible a d.ts file was exported from the index.ts file
        // which is fine, except that messes with any raw JS exports
        // in the collection/index.js
        // so let's just make this work by putting in empty js files
        // and call it a day
        const collectionInterfacePath = pathJoin(config, outputTarget.collectionDir, 'interface.js');
        yield compilerCtx.fs.writeFile(collectionInterfacePath, '');
    });
}
function generateIndexDts() {
    return 'export declare function defineCustomElements(win: any, opts?: any): Promise<void>;';
}

function generateAngularProxies(config, compilerCtx, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        const angularOuputTargets = config.outputTargets
            .filter(o => o.type === 'angular' && o.directivesProxyFile);
        yield Promise.all(angularOuputTargets.map((angularOuputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield angularDirectiveProxyOutput(config, compilerCtx, angularOuputTarget, cmpRegistry);
        })));
    });
}
function angularDirectiveProxyOutput(config, compilerCtx, outputTarget, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        const components = getComponents$1(outputTarget.excludeComponents, cmpRegistry);
        yield Promise.all([
            generateProxies(config, compilerCtx, components, outputTarget),
            generateAngularArray(config, compilerCtx, components, outputTarget),
            generateAngularUtils(compilerCtx, outputTarget)
        ]);
        config.logger.debug(`generated angular directives: ${outputTarget.directivesProxyFile}`);
    });
}
function getComponents$1(excludeComponents, cmpRegistry) {
    return Object.keys(cmpRegistry)
        .map(key => cmpRegistry[key])
        .filter(c => !excludeComponents.includes(c.tagNameMeta) && isDocsPublic(c.jsdoc))
        .sort((a, b) => {
        if (a.tagNameMeta < b.tagNameMeta)
            return -1;
        if (a.tagNameMeta > b.tagNameMeta)
            return 1;
        return 0;
    });
}
function generateProxies(config, compilerCtx, components, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const proxies = getProxies(components);
        const imports = `/* tslint:disable */
/* auto-generated angular directive proxies */
import { Component, ElementRef, ChangeDetectorRef, EventEmitter } from '@angular/core';`;
        const sourceImports = !outputTarget.componentCorePackage ? ''
            : `type StencilComponents<T extends keyof StencilElementInterfaces> = StencilElementInterfaces[T];`;
        const final = [
            imports,
            getProxyUtils(config, outputTarget),
            sourceImports,
            proxies,
        ];
        const finalText = final.join('\n') + '\n';
        yield compilerCtx.fs.writeFile(outputTarget.directivesProxyFile, finalText);
    });
}
function getProxies(components) {
    return components
        .map(getProxy)
        .join('\n');
}
function getProxy(cmpMeta) {
    // Collect component meta
    const inputs = getInputs(cmpMeta);
    const outputs = getOutputs(cmpMeta);
    const methods = getMethods$1(cmpMeta);
    // Process meta
    const hasInputs = inputs.length > 0;
    const hasOutputs = outputs.length > 0;
    const hasMethods = methods.length > 0;
    // Generate Angular @Directive
    const directiveOpts = [
        `selector: \'${cmpMeta.tagNameMeta}\'`,
        `changeDetection: 0`,
        `template: '<ng-content></ng-content>'`
    ];
    if (inputs.length > 0) {
        directiveOpts.push(`inputs: ['${inputs.join(`', '`)}']`);
    }
    const tagNameAsPascal = dashToPascalCase(cmpMeta.tagNameMeta);
    const lines = [`
export declare interface ${tagNameAsPascal} extends StencilComponents<'${tagNameAsPascal}'> {}
@Component({ ${directiveOpts.join(', ')} })
export class ${tagNameAsPascal} {`];
    // Generate outputs
    outputs.forEach(output => {
        lines.push(`  ${output}!: EventEmitter<CustomEvent>;`);
    });
    lines.push('  protected el: HTMLElement;');
    lines.push(`  constructor(c: ChangeDetectorRef, r: ElementRef) {
    c.detach();
    this.el = r.nativeElement;`);
    if (hasOutputs) {
        lines.push(`    proxyOutputs(this, this.el, ['${outputs.join(`', '`)}']);`);
    }
    lines.push(`  }`);
    lines.push(`}`);
    if (hasMethods) {
        lines.push(`proxyMethods(${tagNameAsPascal}, ['${methods.join(`', '`)}']);`);
    }
    if (hasInputs) {
        lines.push(`proxyInputs(${tagNameAsPascal}, ['${inputs.join(`', '`)}']);`);
    }
    return lines.join('\n');
}
function getInputs(cmpMeta) {
    return Object.keys(cmpMeta.membersMeta || {}).filter(memberName => {
        const m = cmpMeta.membersMeta[memberName];
        return isDocsPublic(m.jsdoc) && (m.memberType === 1 /* Prop */ || m.memberType === 2 /* PropMutable */);
    });
}
function getOutputs(cmpMeta) {
    return (cmpMeta.eventsMeta || [])
        .filter(e => isDocsPublic(e.jsdoc))
        .map(eventMeta => eventMeta.eventName);
}
function getMethods$1(cmpMeta) {
    return Object.keys(cmpMeta.membersMeta || {}).filter(memberName => {
        const m = cmpMeta.membersMeta[memberName];
        return isDocsPublic(m.jsdoc) && m.memberType === 32 /* Method */;
    });
}
function getProxyUtils(config, outputTarget) {
    if (!outputTarget.directivesUtilsFile) {
        return PROXY_UTILS.replace(/export function/g, 'function');
    }
    else {
        const utilsPath = relativeImport(config, outputTarget.directivesProxyFile, outputTarget.directivesUtilsFile);
        return `import { proxyInputs, proxyMethods, proxyOutputs } from '${utilsPath}';\n`;
    }
}
function generateAngularArray(config, compilerCtx, components, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!outputTarget.directivesArrayFile) {
            return;
        }
        const proxyPath = relativeImport(config, outputTarget.directivesArrayFile, outputTarget.directivesProxyFile);
        const directives = components
            .map(cmpMeta => dashToPascalCase(cmpMeta.tagNameMeta))
            .map(className => `d.${className}`)
            .join(',\n  ');
        const c = `
import * as d from '${proxyPath}';

export const DIRECTIVES = [
${directives}
];
`;
        yield compilerCtx.fs.writeFile(outputTarget.directivesArrayFile, c);
    });
}
function generateAngularUtils(compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (outputTarget.directivesUtilsFile) {
            yield compilerCtx.fs.writeFile(outputTarget.directivesUtilsFile, '/* tslint:disable */\n' + PROXY_UTILS);
        }
    });
}
function relativeImport(config, pathFrom, pathTo) {
    let relativePath = config.sys.path.relative(config.sys.path.dirname(pathFrom), config.sys.path.dirname(pathTo));
    relativePath = relativePath === '' ? '.' : relativePath;
    return `${relativePath}/${config.sys.path.basename(pathTo, '.ts')}`;
}
const PROXY_UTILS = `import { fromEvent } from 'rxjs';

export function proxyInputs(Cmp: any, inputs: string[]) {
  const Prototype = Cmp.prototype;
  inputs.forEach(item => {
    Object.defineProperty(Prototype, item, {
      get() { return this.el[item]; },
      set(val: any) { this.el[item] = val; },
    });
  });
}

export function proxyMethods(Cmp: any, methods: string[]) {
  const Prototype = Cmp.prototype;
  methods.forEach(methodName => {
    Prototype[methodName] = function() {
      const args = arguments;
      return this.el.componentOnReady().then((el: any) => el[methodName].apply(el, args));
    };
  });
}

export function proxyOutputs(instance: any, el: any, events: string[]) {
  events.forEach(eventName => instance[eventName] = fromEvent(el, eventName));
}
`;

function validatePackageFiles(config, outputTarget, diagnostics, pkgData) {
    if (pkgData.files) {
        const actualDistDir = normalizePath(config.sys.path.relative(config.rootDir, outputTarget.dir));
        const validPaths = [
            `${actualDistDir}`,
            `${actualDistDir}/`,
            `./${actualDistDir}`,
            `./${actualDistDir}/`
        ];
        const containsDistDir = pkgData.files
            .some(userPath => validPaths.some(validPath => normalizePath(userPath) === validPath));
        if (!containsDistDir) {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "files" array must contain the distribution directory "${actualDistDir}/" when generating a distribution.`;
        }
    }
}
function validateModule(config, compilerCtx, outputTarget, diagnostics, pkgData) {
    return __awaiter(this, void 0, void 0, function* () {
        const moduleAbs = getDistEsmIndexPath(config, outputTarget, 'es5');
        const moduleRel = normalizePath(config.sys.path.relative(config.rootDir, moduleAbs));
        if (typeof pkgData.module !== 'string') {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "module" property is required when generating a distribution. It's recommended to set the "module" property to: ${moduleRel}`;
            return;
        }
        // Check for not recommended values
        if (pkgData.module.endsWith('collection/index.js')) {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "module" property is set to "${pkgData.module}" but it's not recommended since it might point to non-ES5 code. It's recommended to set the "module" property to: ${moduleRel}`;
            return;
        }
        const pkgFile = pathJoin(config, config.rootDir, pkgData.module);
        const fileExists = yield compilerCtx.fs.access(pkgFile);
        if (!fileExists) {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "module" property is set to "${pkgData.module}" but cannot be found. It's recommended to set the "module" property to: ${moduleRel}`;
            return;
        }
    });
}
function validateMain(config, compilerCtx, outputTarget, diagnostics, pkgData) {
    return __awaiter(this, void 0, void 0, function* () {
        const mainAbs = getDistCjsIndexPath(config, outputTarget);
        const mainRel = pathJoin(config, config.sys.path.relative(config.rootDir, mainAbs));
        if (typeof pkgData.main !== 'string' || pkgData.main === '') {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "main" property is required when generating a distribution. It's recommended to set the "main" property to: ${mainRel}`;
            return;
        }
        const pkgFile = pathJoin(config, config.rootDir, pkgData.main);
        const fileExists = yield compilerCtx.fs.access(pkgFile);
        if (!fileExists) {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "main" property is set to "${pkgData.main}" but cannot be found. It's recommended to set the "main" property to: ${mainRel}`;
            return;
        }
        const loaderAbs = getLoaderPath(config, outputTarget);
        const loaderRel = pathJoin(config, config.sys.path.relative(config.rootDir, loaderAbs));
        if (normalizePath(pkgData.main) === loaderRel) {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "main" property should not be set to "${pkgData.main}", which is the browser loader (this was a previous recommendation, but recently updated). Instead, please set the "main" property to: ${mainRel}`;
            return;
        }
    });
}
function validateTypes(config, outputTarget, diagnostics, pkgData) {
    if (typeof pkgData.types !== 'string' || pkgData.types === '') {
        const err = buildWarn(diagnostics);
        const recommendedPath = getRecommendedTypesPath(config, outputTarget);
        err.messageText = `package.json "types" property is required when generating a distribution. It's recommended to set the "types" property to: ${recommendedPath}`;
        return false;
    }
    if (!pkgData.types.endsWith('.d.ts')) {
        const err = buildWarn(diagnostics);
        err.messageText = `package.json "types" file must have a ".d.ts" extension: ${pkgData.types}`;
        return false;
    }
    return true;
}
function validateTypesExist(config, compilerCtx, outputTarget, diagnostics, pkgData) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgFile = pathJoin(config, config.rootDir, pkgData.types);
        const fileExists = yield compilerCtx.fs.access(pkgFile);
        if (!fileExists) {
            const err = buildWarn(diagnostics);
            const recommendedPath = getRecommendedTypesPath(config, outputTarget);
            err.messageText = `package.json "types" property is set to "${pkgData.types}" but cannot be found. It's recommended to set the "types" property to: ${recommendedPath}`;
            return false;
        }
        return true;
    });
}
function validateCollection(config, outputTarget, diagnostics, pkgData) {
    if (outputTarget.collectionDir) {
        const collectionRel = pathJoin(config, config.sys.path.relative(config.rootDir, outputTarget.collectionDir), COLLECTION_MANIFEST_FILE_NAME);
        if (!pkgData.collection || normalizePath(pkgData.collection) !== collectionRel) {
            const err = buildWarn(diagnostics);
            err.messageText = `package.json "collection" property is required when generating a distribution and must be set to: ${collectionRel}`;
        }
    }
}
function validateBrowser(diagnostics, pkgData) {
    if (typeof pkgData.browser === 'string') {
        const err = buildWarn(diagnostics);
        err.messageText = `package.json "browser" property is set to "${pkgData.browser}". However, for maximum compatibility with all bundlers it's recommended to not set the "browser" property and instead ensure both "module" and "main" properties are set.`;
        return;
    }
}
function validateNamespace(config, diagnostics) {
    if (typeof config.namespace !== 'string' || config.fsNamespace === 'app') {
        const err = buildWarn(diagnostics);
        err.messageText = `When generating a distribution it is recommended to choose a unique namespace rather than the default setting "App". Please updated the "namespace" config property within the stencil.config.js file.`;
    }
}
function getRecommendedTypesPath(config, outputTarget) {
    const typesAbs = getComponentsDtsTypesFilePath(config, outputTarget);
    return pathJoin(config, config.sys.path.relative(config.rootDir, typesAbs));
}

function generateTypes(config, compilerCtx, outputTarget, buildCtx, pkgData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Before generating the types, let's check if the package.json values are correct
        if (!validateTypes(config, outputTarget, buildCtx.diagnostics, pkgData)) {
            return;
        }
        const srcDirItems = yield compilerCtx.fs.readdir(config.srcDir, { recursive: false });
        const srcDtsFiles = srcDirItems.filter(srcItem => srcItem.isFile && isDtsFile(srcItem.absPath));
        const distTypesDir = config.sys.path.dirname(pkgData.types);
        // Copy .d.ts files from src to dist
        // In addition, all references to @stencil/core are replaced
        yield Promise.all(srcDtsFiles.map((srcDtsFile) => __awaiter(this, void 0, void 0, function* () {
            const relPath = config.sys.path.relative(config.srcDir, srcDtsFile.absPath);
            const distPath = pathJoin(config, config.rootDir, distTypesDir, relPath);
            const originalDtsContent = yield compilerCtx.fs.readFile(srcDtsFile.absPath);
            const distDtsContent = updateStencilTypesImports(config, outputTarget.typesDir, distPath, originalDtsContent);
            yield compilerCtx.fs.writeFile(distPath, distDtsContent);
        })));
        const distPath = pathJoin(config, config.rootDir, distTypesDir);
        yield generateComponentTypes(config, compilerCtx, buildCtx, distPath);
        // Final check, we make sure the generated types matches the path configured in the package.json
        const existsTypes = yield validateTypesExist(config, compilerCtx, outputTarget, buildCtx.diagnostics, pkgData);
        if (existsTypes) {
            yield copyStencilCoreDts(config, compilerCtx);
        }
    });
}

function generateProxies$1(config, compilerCtx, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.devMode) {
            return;
        }
        yield Promise.all([
            generateAngularProxies(config, compilerCtx, cmpRegistry)
        ]);
    });
}
function generateDistributions(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const distOutputs = config.outputTargets.filter(o => o.type === 'dist');
        if (distOutputs.length === 0) {
            // not doing any dist builds
            return;
        }
        if (buildCtx.validateTypesPromise) {
            // if we're doing a dist build and we've still
            // got a validate types build running then
            // we need to wait on it to finish first since the
            // validate types build is writing all the types to disk
            const timeSpan = buildCtx.createTimeSpan(`generateDistributions waiting on validateTypes`, true);
            yield buildCtx.validateTypesPromise;
            timeSpan.finish(`generateDistributions finished waiting on validateTypes`);
        }
        yield Promise.all(distOutputs.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield generateDistribution(config, compilerCtx, buildCtx, outputTarget);
        })));
    });
}
function generateDistribution(config, compilerCtx, buildCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgData = yield readPackageJson(config, compilerCtx);
        validatePackageFiles(config, outputTarget, buildCtx.diagnostics, pkgData);
        validateCollection(config, outputTarget, buildCtx.diagnostics, pkgData);
        validateNamespace(config, buildCtx.diagnostics);
        if (hasError(buildCtx.diagnostics)) {
            return;
        }
        yield Promise.all([
            generateCommonJsIndex(config, compilerCtx, outputTarget),
            generateEsmIndexes(config, compilerCtx, outputTarget),
            copyComponentStyles(config, compilerCtx, buildCtx),
            generateTypes(config, compilerCtx, outputTarget, buildCtx, pkgData)
        ]);
        yield validateModule(config, compilerCtx, outputTarget, buildCtx.diagnostics, pkgData);
        yield validateMain(config, compilerCtx, outputTarget, buildCtx.diagnostics, pkgData);
        validateBrowser(buildCtx.diagnostics, pkgData);
    });
}
function readPackageJson(config, compilerCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgJsonPath = config.sys.path.join(config.rootDir, 'package.json');
        let pkgJson;
        try {
            pkgJson = yield compilerCtx.fs.readFile(pkgJsonPath);
        }
        catch (e) {
            throw new Error(`Missing "package.json" file for distribution: ${pkgJsonPath}`);
        }
        let pkgData;
        try {
            pkgData = JSON.parse(pkgJson);
        }
        catch (e) {
            throw new Error(`Error parsing package.json: ${pkgJsonPath}, ${e}`);
        }
        return pkgData;
    });
}

function normalizePrerenderLocation(config, outputTarget, windowLocationHref, url) {
    let prerenderLocation = null;
    try {
        if (typeof url !== 'string') {
            return null;
        }
        // remove any quotes that somehow got in the href
        url = url.replace(/\'|\"/g, '');
        // parse the <a href> passed in
        const hrefParseUrl = config.sys.url.parse(url);
        // don't bother for basically empty <a> tags
        if (!hrefParseUrl.pathname) {
            return null;
        }
        // parse the window.location
        const windowLocationUrl = config.sys.url.parse(windowLocationHref);
        // urls must be on the same host
        // but only check they're the same host when the href has a host
        if (hrefParseUrl.hostname && hrefParseUrl.hostname !== windowLocationUrl.hostname) {
            return null;
        }
        // convert it back to a nice in pretty path
        prerenderLocation = {
            url: config.sys.url.resolve(windowLocationHref, url)
        };
        const normalizedUrl = config.sys.url.parse(prerenderLocation.url);
        normalizedUrl.hash = null;
        if (!outputTarget.prerenderPathQuery) {
            normalizedUrl.search = null;
        }
        prerenderLocation.url = config.sys.url.format(normalizedUrl);
        prerenderLocation.path = config.sys.url.parse(prerenderLocation.url).path;
        if (!prerenderLocation.path.startsWith(outputTarget.baseUrl)) {
            if (prerenderLocation.path !== outputTarget.baseUrl.substr(0, outputTarget.baseUrl.length - 1)) {
                return null;
            }
        }
        const filter = (typeof outputTarget.prerenderFilter === 'function') ? outputTarget.prerenderFilter : prerenderFilter;
        const isValidUrl = filter(hrefParseUrl);
        if (!isValidUrl) {
            return null;
        }
        if (hrefParseUrl.hash && outputTarget.prerenderPathHash) {
            prerenderLocation.url += hrefParseUrl.hash;
            prerenderLocation.path += hrefParseUrl.hash;
        }
    }
    catch (e) {
        config.logger.error(`normalizePrerenderLocation`, e);
        return null;
    }
    return prerenderLocation;
}
function prerenderFilter(url) {
    const parts = url.pathname.split('/');
    const basename = parts[parts.length - 1];
    return !basename.includes('.');
}
function crawlAnchorsForNextUrls(config, outputTarget, prerenderQueue, windowLocationHref, anchors) {
    anchors && anchors.forEach(anchor => {
        if (isValidCrawlableAnchor(anchor)) {
            addLocationToProcess(config, outputTarget, windowLocationHref, prerenderQueue, anchor.href);
        }
    });
}
function isValidCrawlableAnchor(anchor) {
    if (!anchor) {
        return false;
    }
    if (typeof anchor.href !== 'string' || anchor.href.trim() === '' || anchor.href.trim() === '#') {
        return false;
    }
    if (typeof anchor.target === 'string' && anchor.target.trim().toLowerCase() !== '_self') {
        return false;
    }
    return true;
}
function addLocationToProcess(config, outputTarget, windowLocationHref, prerenderQueue, locationUrl) {
    const prerenderLocation = normalizePrerenderLocation(config, outputTarget, windowLocationHref, locationUrl);
    if (!prerenderLocation || prerenderQueue.some(p => p.url === prerenderLocation.url)) {
        // either it's not a good location to prerender
        // or we've already got it in the queue
        return;
    }
    // set that this location is pending to be prerendered
    prerenderLocation.status = 'pending';
    // add this to our queue of locations to prerender
    prerenderQueue.push(prerenderLocation);
}
function getPrerenderQueue(config, outputTarget) {
    const prerenderHost = `http://prerender.stenciljs.com`;
    const prerenderQueue = [];
    if (Array.isArray(outputTarget.prerenderLocations)) {
        outputTarget.prerenderLocations.forEach(prerenderLocation => {
            addLocationToProcess(config, outputTarget, prerenderHost, prerenderQueue, prerenderLocation.path);
        });
    }
    return prerenderQueue;
}
function getWritePathFromUrl(config, outputTarget, url) {
    const parsedUrl = config.sys.url.parse(url);
    let pathName = parsedUrl.pathname;
    if (pathName.startsWith(outputTarget.baseUrl)) {
        pathName = pathName.substring(outputTarget.baseUrl.length);
    }
    else if (outputTarget.baseUrl === pathName + '/') {
        pathName = '/';
    }
    // figure out the directory where this file will be saved
    const dir = pathJoin(config, outputTarget.dir, pathName);
    // create the full path where this will be saved (normalize for windowz)
    let filePath;
    if (dir + '/' === outputTarget.dir + '/') {
        // this is the root of the output target directory
        // use the configured index.html
        const basename = outputTarget.indexHtml.substr(dir.length + 1);
        filePath = pathJoin(config, dir, basename);
    }
    else {
        filePath = pathJoin(config, dir, `index.html`);
    }
    return filePath;
}

function generateHostConfig(config, compilerCtx, outputTarget, entryModules, hydrateResultss) {
    return __awaiter(this, void 0, void 0, function* () {
        const hostConfig = {
            hosting: {
                rules: []
            }
        };
        hydrateResultss = hydrateResultss.sort((a, b) => {
            if (a.url.toLowerCase() < b.url.toLowerCase())
                return -1;
            if (a.url.toLowerCase() > b.url.toLowerCase())
                return 1;
            return 0;
        });
        hydrateResultss.forEach(hydrateResults => {
            const hostRule = generateHostRule(config, compilerCtx, outputTarget, entryModules, hydrateResults);
            if (hostRule) {
                hostConfig.hosting.rules.push(hostRule);
            }
        });
        addDefaults(config, outputTarget, hostConfig);
        const hostConfigFilePath = pathJoin(config, outputTarget.dir, HOST_CONFIG_FILENAME);
        yield mergeUserHostConfigFile(config, compilerCtx, hostConfig);
        yield compilerCtx.fs.writeFile(hostConfigFilePath, JSON.stringify(hostConfig, null, 2));
    });
}
function generateHostRule(config, compilerCtx, outputTarget, entryModules, hydrateResults) {
    const hostRule = {
        include: hydrateResults.path,
        headers: generateHostRuleHeaders(config, compilerCtx, outputTarget, entryModules, hydrateResults)
    };
    if (hostRule.headers.length === 0) {
        return null;
    }
    return hostRule;
}
function generateHostRuleHeaders(config, compilerCtx, outputTarget, entryModules, hydrateResults) {
    const hostRuleHeaders = [];
    addStyles(config, hostRuleHeaders, hydrateResults);
    addCoreJs(config, outputTarget, compilerCtx.appCoreWWWPath, hostRuleHeaders);
    addBundles(config, outputTarget, entryModules, hostRuleHeaders, hydrateResults.components);
    addScripts(config, hostRuleHeaders, hydrateResults);
    addImgs(config, hostRuleHeaders, hydrateResults);
    return hostRuleHeaders;
}
function addCoreJs(config, outputTarget, appCoreWWWPath, hostRuleHeaders) {
    const url = getUrlFromFilePath(config, outputTarget, appCoreWWWPath);
    hostRuleHeaders.push(formatLinkRelPreloadHeader(url));
}
function addBundles(config, outputTarget, entryModules, hostRuleHeaders, components) {
    components = sortComponents(components);
    const bundleIds = getBundleIds(entryModules, components);
    bundleIds.forEach(bundleId => {
        if (hostRuleHeaders.length < MAX_LINK_REL_PRELOAD_COUNT) {
            const bundleUrl = getBundleUrl(config, outputTarget, bundleId);
            hostRuleHeaders.push(formatLinkRelPreloadHeader(bundleUrl));
        }
    });
}
function getBundleIds(entryModules, components) {
    const bundleIds = [];
    components.forEach(cmp => {
        entryModules.forEach(mb => {
            const moduleFile = mb.moduleFiles.find(mf => mf.cmpMeta && mf.cmpMeta.tagNameMeta === cmp.tag);
            if (!moduleFile) {
                return;
            }
            let bundleId;
            if (typeof moduleFile.cmpMeta.bundleIds === 'string') {
                bundleId = moduleFile.cmpMeta.bundleIds;
            }
            else {
                bundleId = moduleFile.cmpMeta.bundleIds[DEFAULT_MODE];
                if (!bundleId) {
                    bundleId = moduleFile.cmpMeta.bundleIds[DEFAULT_STYLE_MODE];
                }
            }
            if (bundleId && bundleIds.indexOf(bundleId) === -1) {
                bundleIds.push(bundleId);
            }
        });
    });
    return bundleIds;
}
function getBundleUrl(config, outputTarget, bundleId) {
    const unscopedFileName = getBrowserFilename(bundleId, false);
    const unscopedWwwBuildPath = pathJoin(config, getAppBuildDir(config, outputTarget), unscopedFileName);
    return getUrlFromFilePath(config, outputTarget, unscopedWwwBuildPath);
}
function getUrlFromFilePath(config, outputTarget, filePath) {
    let url = pathJoin(config, '/', config.sys.path.relative(outputTarget.dir, filePath));
    url = outputTarget.baseUrl + url.substring(1);
    return url;
}
function sortComponents(components) {
    return components.sort((a, b) => {
        if (a.depth > b.depth)
            return -1;
        if (a.depth < b.depth)
            return 1;
        if (a.count > b.count)
            return -1;
        if (a.count < b.count)
            return 1;
        if (a.tag < b.tag)
            return -1;
        if (a.tag > b.tag)
            return 1;
        return 0;
    });
}
function addStyles(config, hostRuleHeaders, hydrateResults) {
    hydrateResults.styleUrls.forEach(styleUrl => {
        if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
            return;
        }
        const url = config.sys.url.parse(styleUrl);
        if (url.hostname === hydrateResults.hostname) {
            hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
        }
    });
}
function addScripts(config, hostRuleHeaders, hydrateResults) {
    hydrateResults.scriptUrls.forEach(scriptUrl => {
        if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
            return;
        }
        const url = config.sys.url.parse(scriptUrl);
        if (url.hostname === hydrateResults.hostname) {
            hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
        }
    });
}
function addImgs(config, hostRuleHeaders, hydrateResults) {
    hydrateResults.imgUrls.forEach(imgUrl => {
        if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
            return;
        }
        const url = config.sys.url.parse(imgUrl);
        if (url.hostname === hydrateResults.hostname) {
            hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
        }
    });
}
function formatLinkRelPreloadHeader(url) {
    const header = {
        name: 'Link',
        value: formatLinkRelPreloadValue(url)
    };
    return header;
}
function formatLinkRelPreloadValue(url) {
    const parts = [
        `<${url}>`,
        `rel=preload`
    ];
    const ext = url.split('.').pop().toLowerCase();
    if (ext === SCRIPT_EXT) {
        parts.push(`as=script`);
    }
    else if (ext === STYLE_EXT) {
        parts.push(`as=style`);
    }
    else if (IMG_EXTS.indexOf(ext) > -1) {
        parts.push(`as=image`);
    }
    return parts.join(';');
}
function addDefaults(config, outputTarget, hostConfig) {
    addBuildDirCacheControl(config, outputTarget, hostConfig);
    addServiceWorkerNoCacheControl(config, outputTarget, hostConfig);
}
function addBuildDirCacheControl(config, outputTarget, hostConfig) {
    const url = getUrlFromFilePath(config, outputTarget, getAppBuildDir(config, outputTarget));
    hostConfig.hosting.rules.push({
        include: pathJoin(config, url, '**'),
        headers: [
            {
                name: `Cache-Control`,
                value: `public, max-age=31536000`
            }
        ]
    });
}
function addServiceWorkerNoCacheControl(config, outputTarget, hostConfig) {
    if (!outputTarget.serviceWorker) {
        return;
    }
    const url = getUrlFromFilePath(config, outputTarget, outputTarget.serviceWorker.swDest);
    hostConfig.hosting.rules.push({
        include: url,
        headers: [
            {
                name: `Cache-Control`,
                value: `no-cache, no-store, must-revalidate`
            }
        ]
    });
}
function mergeUserHostConfigFile(config, compilerCtx, hostConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const hostConfigFilePath = pathJoin(config, config.srcDir, HOST_CONFIG_FILENAME);
        try {
            const userHostConfigStr = yield compilerCtx.fs.readFile(hostConfigFilePath);
            const userHostConfig = JSON.parse(userHostConfigStr);
            mergeUserHostConfig(userHostConfig, hostConfig);
        }
        catch (e) { }
    });
}
function mergeUserHostConfig(userHostConfig, hostConfig) {
    if (!userHostConfig || !userHostConfig.hosting) {
        return;
    }
    if (!Array.isArray(userHostConfig.hosting.rules)) {
        return;
    }
    const rules = userHostConfig.hosting.rules.concat(hostConfig.hosting.rules);
    hostConfig.hosting.rules = rules;
}
const DEFAULT_MODE = 'md';
const MAX_LINK_REL_PRELOAD_COUNT = 6;
const HOST_CONFIG_FILENAME = 'host.config.json';
const IMG_EXTS = ['png', 'gif', 'svg', 'jpg', 'jpeg', 'webp'];
const STYLE_EXT = 'css';
const SCRIPT_EXT = 'js';

function getFilePathFromUrl(config, outputTarget, windowLocationHref, url) {
    if (typeof url !== 'string' || url.trim() === '') {
        return null;
    }
    const location = normalizePrerenderLocation(config, outputTarget, windowLocationHref, url);
    if (!location) {
        return null;
    }
    return config.sys.path.join(outputTarget.dir, location.path);
}
function createHashedFileName(fileName, hash) {
    const parts = fileName.split('.');
    parts.splice(parts.length - 1, 0, hash);
    return parts.join('.');
}

function versionElementAssets(config, compilerCtx, outputTarget, windowLocationHref, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.assetVersioning.versionHtml) {
            return;
        }
        yield Promise.all(ELEMENT_TYPES.map((elmType) => __awaiter(this, void 0, void 0, function* () {
            yield versionElementTypeAssets(config, compilerCtx, outputTarget, windowLocationHref, doc, elmType.selector, elmType.selector);
        })));
    });
}
const ELEMENT_TYPES = [
    { selector: 'link[rel="apple-touch-icon"][href]', attr: 'href' },
    { selector: 'link[rel="icon"][href]', attr: 'href' },
    { selector: 'link[rel="manifest"][href]', attr: 'href' },
    { selector: 'link[rel="stylesheet"][href]', attr: 'href' }
];
function versionElementTypeAssets(config, compilerCtx, outputTarget, windowLocationHref, doc, selector, attrName) {
    return __awaiter(this, void 0, void 0, function* () {
        const elements = doc.querySelectorAll(selector);
        const promises = [];
        for (let i = 0; i < elements.length; i++) {
            promises.push(versionElementAsset(config, compilerCtx, outputTarget, windowLocationHref, elements[i], attrName));
        }
        yield Promise.all(promises);
    });
}
function versionElementAsset(config, compilerCtx, outputTarget, windowLocationHref, elm, attrName) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = elm.getAttribute(attrName);
        const versionedUrl = yield versionAsset(config, compilerCtx, outputTarget, windowLocationHref, url);
        if (versionedUrl) {
            elm.setAttribute(attrName, versionedUrl);
        }
    });
}
function versionAsset(config, compilerCtx, outputTarget, windowLocationHref, url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orgFilePath = getFilePathFromUrl(config, outputTarget, windowLocationHref, url);
            if (!orgFilePath) {
                return null;
            }
            if (hasFileExtension(orgFilePath, TXT_EXT$1)) {
                const content = yield compilerCtx.fs.readFile(orgFilePath);
                const hash = config.sys.generateContentHash(content, config.hashedFileNameLength);
                const dirName = config.sys.path.dirname(orgFilePath);
                const fileName = config.sys.path.basename(orgFilePath);
                const hashedFileName = createHashedFileName(fileName, hash);
                const hashedFilePath = config.sys.path.join(dirName, hashedFileName);
                yield compilerCtx.fs.writeFile(hashedFilePath, content);
                yield compilerCtx.fs.remove(orgFilePath);
                return hashedFileName;
            }
        }
        catch (e) { }
        return null;
    });
}
const TXT_EXT$1 = ['js', 'css', 'svg', 'json'];

function versionManifestAssets(config, compilerCtx, outputTarget, windowLocationHref, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.assetVersioning.versionManifest) {
            return;
        }
        const manifestLink = doc.querySelector('link[rel="manifest"][href]');
        if (!manifestLink) {
            return;
        }
        return versionManifest(config, compilerCtx, outputTarget, windowLocationHref, manifestLink);
    });
}
function versionManifest(config, compilerCtx, outputTarget, windowLocationHref, linkElm) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = linkElm.getAttribute('href');
        if (!url) {
            return;
        }
        const orgFilePath = getFilePathFromUrl(config, outputTarget, windowLocationHref, url);
        if (!orgFilePath) {
            return;
        }
        if (!hasFileExtension(orgFilePath, ['json'])) {
            return;
        }
        try {
            const jsonStr = yield compilerCtx.fs.readFile(orgFilePath);
            const manifest = JSON.parse(jsonStr);
            if (Array.isArray(manifest.icons)) {
                yield Promise.all(manifest.icons.map((manifestIcon) => __awaiter(this, void 0, void 0, function* () {
                    yield versionManifestIcon(config, compilerCtx, outputTarget, windowLocationHref, manifest, manifestIcon);
                })));
            }
            yield generateVersionedManifest(config, compilerCtx, linkElm, orgFilePath, manifest);
        }
        catch (e) {
            config.logger.error(`versionManifest: ${e}`);
        }
    });
}
function versionManifestIcon(config, compilerCtx, outputTarget, windowLocationHref, manifest, manifestIcon) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function generateVersionedManifest(config, compilerCtx, linkElm, orgFilePath, manifest) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonStr = JSON.stringify(manifest);
        const dir = config.sys.path.dirname(orgFilePath);
        const orgFileName = config.sys.path.basename(orgFilePath);
        const hash = config.sys.generateContentHash(jsonStr, config.hashedFileNameLength);
        const newFileName = orgFileName.toLowerCase().replace(`.json`, `.${hash}.json`);
        const newFilePath = config.sys.path.join(dir, newFileName);
        yield Promise.all([
            compilerCtx.fs.remove(orgFilePath),
            compilerCtx.fs.writeFile(newFilePath, jsonStr)
        ]);
        let url = linkElm.getAttribute('href');
        url = url.replace(orgFileName, newFileName);
        linkElm.setAttribute('href', url);
    });
}

function assetVersioning(config, compilerCtx, outputTarget, windowLocationHref, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        yield versionElementAssets(config, compilerCtx, outputTarget, windowLocationHref, doc);
        yield versionManifestAssets(config, compilerCtx, outputTarget, windowLocationHref, doc);
    });
}

function collapseHtmlWhitepace(node) {
    // this isn't about reducing HTML filesize (cuz it doesn't really matter after gzip)
    // this is more about having many less nodes for the client side to
    // have to climb through while it's creating vnodes from this HTML
    if (node.nodeType === 1 /* ElementNode */) {
        const attributes = node.attributes;
        for (let j = attributes.length - 1; j >= 0; j--) {
            const attr = attributes.item(j);
            if (!attr.value) {
                if (SAFE_TO_REMOVE_EMPTY_ATTRS.includes(attr.name)) {
                    node.removeAttribute(attr.name);
                }
            }
        }
    }
    if (WHITESPACE_SENSITIVE_TAGS.includes(node.nodeName)) {
        return;
    }
    let lastWhitespaceTextNode = null;
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const childNode = node.childNodes[i];
        if (childNode.nodeType === 3 /* TextNode */ || childNode.nodeType === 8 /* CommentNode */) {
            childNode.nodeValue = childNode.nodeValue.replace(REDUCE_WHITESPACE_REGEX, ' ');
            if (childNode.nodeValue === ' ') {
                if (lastWhitespaceTextNode === null) {
                    childNode.nodeValue = ' ';
                    lastWhitespaceTextNode = childNode;
                }
                else {
                    childNode.parentNode.removeChild(childNode);
                }
                continue;
            }
        }
        else if (childNode.childNodes) {
            collapseHtmlWhitepace(childNode);
        }
        lastWhitespaceTextNode = null;
    }
}
const REDUCE_WHITESPACE_REGEX = /\s\s+/g;
const WHITESPACE_SENSITIVE_TAGS = ['PRE', 'SCRIPT', 'STYLE', 'TEXTAREA'];
const SAFE_TO_REMOVE_EMPTY_ATTRS = [
    'class',
    'style',
];

function inlineExternalAssets(config, compilerCtx, outputTarget, windowLocationPath, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        const linkElements = doc.querySelectorAll('link[href][rel="stylesheet"]');
        for (var i = 0; i < linkElements.length; i++) {
            inlineStyle(config, compilerCtx, outputTarget, windowLocationPath, doc, linkElements[i]);
        }
        const scriptElements = doc.querySelectorAll('script[src]');
        for (i = 0; i < scriptElements.length; i++) {
            yield inlineScript(config, compilerCtx, outputTarget, windowLocationPath, scriptElements[i]);
        }
    });
}
function inlineStyle(config, compilerCtx, outputTarget, windowLocationPath, doc, linkElm) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield getAssetContent(config, compilerCtx, outputTarget, windowLocationPath, linkElm.href);
        if (!content) {
            return;
        }
        config.logger.debug(`optimize ${windowLocationPath}, inline style: ${config.sys.url.parse(linkElm.href).pathname}`);
        const styleElm = doc.createElement('style');
        styleElm.innerHTML = content;
        linkElm.parentNode.insertBefore(styleElm, linkElm);
        linkElm.parentNode.removeChild(linkElm);
    });
}
function inlineScript(config, compilerCtx, outputTarget, windowLocationPath, scriptElm) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield getAssetContent(config, compilerCtx, outputTarget, windowLocationPath, scriptElm.src);
        if (!content) {
            return;
        }
        config.logger.debug(`optimize ${windowLocationPath}, inline script: ${scriptElm.src}`);
        scriptElm.innerHTML = content;
        scriptElm.removeAttribute('src');
    });
}
function getAssetContent(config, ctx, outputTarget, windowLocationPath, assetUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof assetUrl !== 'string' || assetUrl.trim() === '') {
            return null;
        }
        // figure out the url's so we can check the hostnames
        const fromUrl = config.sys.url.parse(windowLocationPath);
        const toUrl = config.sys.url.parse(assetUrl);
        if (fromUrl.hostname !== toUrl.hostname) {
            // not the same hostname, so we wouldn't have the file content
            return null;
        }
        // figure out the local file path
        const filePath = getFilePathFromUrl$1(config, outputTarget, fromUrl, toUrl);
        // doesn't look like we've got it cached in app files
        try {
            // try looking it up directly
            const content = yield ctx.fs.readFile(filePath);
            // rough estimate of size
            const fileSize = content.length;
            if (fileSize > outputTarget.inlineAssetsMaxSize) {
                // welp, considered too big, don't inline
                return null;
            }
            return content;
        }
        catch (e) {
            // never found the content for this file
            return null;
        }
    });
}
function getFilePathFromUrl$1(config, outputTarget, fromUrl, toUrl) {
    const resolvedUrl = '.' + config.sys.url.resolve(fromUrl.pathname, toUrl.pathname);
    return pathJoin(config, outputTarget.dir, resolvedUrl);
}

function inlineLoaderScript(config, compilerCtx, outputTarget, windowLocationPath, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        // create the script url we'll be looking for
        const loaderFileName = getLoaderFileName(config);
        // find the external loader script
        // which is usually in the <head> and a pretty small external file
        // now that we're prerendering the html, and all the styles and html
        // will get hardcoded in the output, it's safe to now put the
        // loader script at the bottom of <body>
        const scriptElm = findExternalLoaderScript(doc, loaderFileName);
        if (scriptElm) {
            // append the loader script content to the bottom of <body>
            yield updateInlineLoaderScriptElement(config, compilerCtx, outputTarget, doc, windowLocationPath, scriptElm);
        }
    });
}
function findExternalLoaderScript(doc, loaderFileName) {
    const scriptElements = doc.getElementsByTagName('script');
    for (let i = 0; i < scriptElements.length; i++) {
        const src = scriptElements[i].getAttribute('src');
        if (isLoaderScriptSrc(loaderFileName, src)) {
            // this is a script element with a src attribute which is
            // pointing to the app's external loader script
            // remove the script from the document, be gone with you
            return scriptElements[i];
        }
    }
    return null;
}
function isLoaderScriptSrc(loaderFileName, scriptSrc) {
    try {
        if (typeof scriptSrc !== 'string' || scriptSrc.trim() === '') {
            return false;
        }
        scriptSrc = scriptSrc.toLowerCase();
        if (scriptSrc.startsWith('http') || scriptSrc.startsWith('file')) {
            return false;
        }
        scriptSrc = scriptSrc.split('?')[0].split('#')[0];
        loaderFileName = loaderFileName.split('?')[0].split('#')[0];
        if (scriptSrc === loaderFileName || scriptSrc.endsWith('/' + loaderFileName)) {
            return true;
        }
    }
    catch (e) { }
    return false;
}
function updateInlineLoaderScriptElement(config, compilerCtx, outputTarget, doc, windowLocationPath, scriptElm) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the file path
        const appLoaderPath = getLoaderPath(config, outputTarget);
        // get the loader content
        let content = null;
        try {
            // let's look it up directly
            content = yield compilerCtx.fs.readFile(appLoaderPath);
        }
        catch (e) {
            config.logger.debug(`unable to inline loader: ${appLoaderPath}`, e);
        }
        if (!content) {
            // didn't get good loader content, don't bother
            return;
        }
        config.logger.debug(`optimize ${windowLocationPath}, inline loader`);
        // remove the external src
        scriptElm.removeAttribute('src');
        // only add the data-resources-url attr if we don't already have one
        const existingResourcesUrlAttr = scriptElm.getAttribute('data-resources-url');
        if (!existingResourcesUrlAttr) {
            const resourcesUrl = setDataResourcesUrlAttr(config, outputTarget);
            // add the resource path data attribute
            scriptElm.setAttribute('data-resources-url', resourcesUrl);
        }
        // inline the js content
        scriptElm.innerHTML = content;
        if (outputTarget.hydrateComponents) {
            // remove the script element from where it's currently at in the dom
            scriptElm.parentNode.removeChild(scriptElm);
            // place it back in the dom, but at the bottom of the body
            doc.body.appendChild(scriptElm);
        }
    });
}
function setDataResourcesUrlAttr(config, outputTarget) {
    let resourcesUrl = outputTarget.resourcesUrl;
    if (!resourcesUrl) {
        resourcesUrl = config.sys.path.join(outputTarget.buildDir, config.fsNamespace);
        resourcesUrl = normalizePath(config.sys.path.relative(outputTarget.dir, resourcesUrl));
        if (!resourcesUrl.startsWith('/')) {
            resourcesUrl = '/' + resourcesUrl;
        }
        if (!resourcesUrl.endsWith('/')) {
            resourcesUrl = resourcesUrl + '/';
        }
        resourcesUrl = outputTarget.baseUrl + resourcesUrl.substring(1);
    }
    return resourcesUrl;
}

/**
 * Interal minifier, not exposed publicly.
 */
function minifyJs(config, compilerCtx, diagnostics, jsText, sourceTarget, preamble, buildTimestamp) {
    return __awaiter(this, void 0, void 0, function* () {
        const opts = {
            output: { beautify: false },
            compress: {},
            sourceMap: false,
            mangle: true
        };
        if (sourceTarget === 'es5') {
            opts.ecma = 5;
            opts.output.ecma = 5;
            opts.compress.ecma = 5;
            opts.compress.arrows = false;
            opts.compress.pure_getters = true;
        }
        else {
            opts.ecma = 7;
            opts.toplevel = true;
            opts.module = true;
            opts.output.ecma = 7;
            opts.compress.ecma = 7;
            opts.compress.arrows = true;
            opts.compress.module = true;
            opts.compress.pure_getters = true;
        }
        if (config.logLevel === 'debug') {
            opts.mangle = {};
            opts.mangle.keep_fnames = true;
            opts.compress.drop_console = false;
            opts.compress.drop_debugger = false;
            opts.output.beautify = true;
            opts.output.indent_level = 2;
            opts.output.comments = 'all';
        }
        else {
            opts.compress.pure_funcs = ['assert', 'console.debug'];
        }
        opts.compress.passes = 2;
        if (preamble) {
            opts.output.preamble = generatePreamble(config, { suffix: buildTimestamp });
        }
        let cacheKey;
        if (compilerCtx) {
            cacheKey = compilerCtx.cache.createKey('minifyJs', 'terser3.14.01', opts, jsText);
            const cachedContent = yield compilerCtx.cache.get(cacheKey);
            if (cachedContent != null) {
                return cachedContent;
            }
        }
        const r = yield config.sys.minifyJs(jsText, opts);
        if (r && r.diagnostics.length === 0 && typeof r.output === 'string') {
            r.output = auxMinify(r.output);
            if (compilerCtx) {
                yield compilerCtx.cache.put(cacheKey, r.output);
            }
        }
        if (r.diagnostics.length > 0) {
            diagnostics.push(...r.diagnostics);
            return jsText;
        }
        else {
            return r.output;
        }
    });
}
function auxMinify(jsText) {
    return jsText.replace(/^window;/, '');
}

function optimizeCss(config, compilerCtx, diagnostics, styleText, filePath, legacyBuild) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof styleText !== 'string' || !styleText.length) {
            //  don't bother with invalid data
            return styleText;
        }
        if ((config.autoprefixCss === false || config.autoprefixCss === null) && !config.minifyCss) {
            // don't wanna autoprefix or minify, so just skip this
            return styleText;
        }
        if (typeof filePath === 'string') {
            filePath = normalizePath(filePath);
        }
        const opts = {
            css: styleText,
            filePath: filePath,
            autoprefixer: config.autoprefixCss,
            minify: config.minifyCss,
            legecyBuild: legacyBuild
        };
        const cacheKey = compilerCtx.cache.createKey('optimizeCss', 'autoprefixer9.4.3_cssnano4.1.8_postcss7.0.11_1', opts);
        const cachedContent = yield compilerCtx.cache.get(cacheKey);
        if (cachedContent != null) {
            // let's use the cached data we already figured out
            return cachedContent;
        }
        const minifyResults = yield config.sys.optimizeCss(opts);
        minifyResults.diagnostics.forEach(d => {
            // collect up any diagnostics from minifying
            diagnostics.push(d);
        });
        if (typeof minifyResults.css === 'string' && !hasError(diagnostics)) {
            // cool, we got valid minified output
            // only cache if we got a cache key, if not it probably has an @import
            yield compilerCtx.cache.put(cacheKey, minifyResults.css);
            return minifyResults.css;
        }
        return styleText;
    });
}

function minifyInlineScripts(config, compilerCtx, doc, diagnostics) {
    return __awaiter(this, void 0, void 0, function* () {
        const scripts = doc.querySelectorAll('script');
        const promises = [];
        for (let i = 0; i < scripts.length; i++) {
            promises.push(minifyInlineScript(config, compilerCtx, diagnostics, scripts[i]));
        }
        yield Promise.all(promises);
    });
}
function canMinifyInlineScript(script) {
    if (script.hasAttribute('src')) {
        return false;
    }
    if (typeof script.innerHTML !== 'string') {
        return false;
    }
    script.innerHTML = script.innerHTML.trim();
    if (script.innerHTML.length === 0) {
        return false;
    }
    let type = script.getAttribute('type');
    if (typeof type === 'string') {
        type = type.trim().toLowerCase();
        if (!VALID_SCRIPT_TYPES.includes(type)) {
            return false;
        }
    }
    if (script.innerHTML.includes('  ')) {
        return true;
    }
    if (script.innerHTML.includes('\t')) {
        return true;
    }
    return false;
}
const VALID_SCRIPT_TYPES = ['application/javascript', 'application/ecmascript', ''];
function minifyInlineScript(config, compilerCtx, diagnostics, script) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!canMinifyInlineScript(script)) {
            return;
        }
        script.innerHTML = yield minifyJs(config, compilerCtx, diagnostics, script.innerHTML, 'es5', false);
    });
}
function minifyInlineStyles(config, compilerCtx, doc, diagnostics) {
    return __awaiter(this, void 0, void 0, function* () {
        const styles = doc.querySelectorAll('style');
        const promises = [];
        for (let i = 0; i < styles.length; i++) {
            promises.push(minifyInlineStyle(config, compilerCtx, diagnostics, styles[i]));
        }
        yield Promise.all(promises);
    });
}
function canMinifyInlineStyle(style) {
    if (typeof style.innerHTML !== 'string') {
        return false;
    }
    style.innerHTML = style.innerHTML.trim();
    if (style.innerHTML.length === 0) {
        return false;
    }
    if (style.innerHTML.includes('/*')) {
        return true;
    }
    if (style.innerHTML.includes('  ')) {
        return true;
    }
    if (style.innerHTML.includes('\t')) {
        return true;
    }
    return false;
}
function minifyInlineStyle(config, compilerCtx, diagnostics, style) {
    return __awaiter(this, void 0, void 0, function* () {
        if (canMinifyInlineStyle(style)) {
            style.innerHTML = yield optimizeCss(config, compilerCtx, diagnostics, style.innerHTML, null, true);
        }
    });
}

// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
const commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
function parseCss(_config, css, filePath) {
    /**
     * Positional.
     */
    var lineno = 1;
    var column = 1;
    var srcLines;
    /**
     * Update lineno and column based on `str`.
     */
    function updatePosition(str) {
        const lines = str.match(/\n/g);
        if (lines)
            lineno += lines.length;
        const i = str.lastIndexOf('\n');
        column = ~i ? str.length - i : column + str.length;
    }
    /**
     * Mark position and patch `node.position`.
     */
    function position() {
        const start = { line: lineno, column: column };
        return function (node) {
            node.position = new ParsePosition(start);
            whitespace();
            return node;
        };
    }
    /**
     * Store position information for a node
     */
    class ParsePosition {
        constructor(start) {
            this.start = start;
            this.end = { line: lineno, column: column };
            this.source = filePath;
        }
    }
    /**
     * Non-enumerable source string
     */
    ParsePosition.prototype.content = css;
    /**
     * Error `msg`.
     */
    const diagnostics = [];
    function error(msg) {
        if (!srcLines) {
            srcLines = css.split('\n');
        }
        const d = {
            level: 'error',
            type: 'css',
            language: 'css',
            header: 'CSS Parse',
            messageText: msg,
            absFilePath: filePath,
            lines: [{
                    lineIndex: lineno - 1,
                    lineNumber: lineno,
                    errorCharStart: column,
                    text: css[lineno - 1],
                }]
        };
        if (lineno > 1) {
            const previousLine = {
                lineIndex: lineno - 1,
                lineNumber: lineno - 1,
                text: css[lineno - 2],
                errorCharStart: -1,
                errorLength: -1
            };
            d.lines.unshift(previousLine);
        }
        if (lineno + 2 < srcLines.length) {
            const nextLine = {
                lineIndex: lineno,
                lineNumber: lineno + 1,
                text: srcLines[lineno],
                errorCharStart: -1,
                errorLength: -1
            };
            d.lines.push(nextLine);
        }
        diagnostics.push(d);
    }
    /**
     * Parse stylesheet.
     */
    function stylesheet() {
        const rulesList = rules();
        return {
            type: 'stylesheet',
            stylesheet: {
                source: filePath,
                rules: rulesList,
                diagnostics: diagnostics
            }
        };
    }
    /**
     * Opening brace.
     */
    function open() {
        return match(/^{\s*/);
    }
    /**
     * Closing brace.
     */
    function close() {
        return match(/^}/);
    }
    /**
     * Parse ruleset.
     */
    function rules() {
        var node;
        const rules = [];
        whitespace();
        comments(rules);
        while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
            if (node !== false) {
                rules.push(node);
                comments(rules);
            }
        }
        return rules;
    }
    /**
     * Match `re` and return captures.
     */
    function match(re) {
        const m = re.exec(css);
        if (!m)
            return;
        const str = m[0];
        updatePosition(str);
        css = css.slice(str.length);
        return m;
    }
    /**
     * Parse whitespace.
     */
    function whitespace() {
        match(/^\s*/);
    }
    /**
     * Parse comments;
     */
    function comments(rules) {
        var c;
        rules = rules || [];
        while (c = comment()) {
            if (c !== false) {
                rules.push(c);
            }
        }
        return rules;
    }
    /**
     * Parse comment.
     */
    function comment() {
        const pos = position();
        if ('/' !== css.charAt(0) || '*' !== css.charAt(1))
            return;
        var i = 2;
        while ('' !== css.charAt(i) && ('*' !== css.charAt(i) || '/' !== css.charAt(i + 1)))
            ++i;
        i += 2;
        if ('' === css.charAt(i - 1)) {
            return error('End of comment missing');
        }
        const str = css.slice(2, i - 2);
        column += 2;
        updatePosition(str);
        css = css.slice(i);
        column += 2;
        return pos({
            type: 'comment',
            comment: str
        });
    }
    /**
     * Parse selector.
     */
    function selector() {
        const m = match(/^([^{]+)/);
        if (!m)
            return;
        /* @fix Remove all comments from selectors
         * http://ostermiller.org/findcomment.html */
        return trim(m[0])
            .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
            .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function (m) {
            return m.replace(/,/g, '\u200C');
        })
            .split(/\s*(?![^(]*\)),\s*/)
            .map(function (s) {
            return s.replace(/\u200C/g, ',');
        });
    }
    /**
     * Parse declaration.
     */
    function declaration() {
        const pos = position();
        // prop
        var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
        if (!prop)
            return;
        prop = trim(prop[0]);
        // :
        if (!match(/^:\s*/))
            return error(`property missing ':'`);
        // val
        const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
        const ret = pos({
            type: 'declaration',
            property: prop.replace(commentre, ''),
            value: val ? trim(val[0]).replace(commentre, '') : ''
        });
        // ;
        match(/^[;\s]*/);
        return ret;
    }
    /**
     * Parse declarations.
     */
    function declarations() {
        const decls = [];
        if (!open())
            return error(`missing '{'`);
        comments(decls);
        // declarations
        var decl;
        while (decl = declaration()) {
            if (decl !== false) {
                decls.push(decl);
                comments(decls);
            }
        }
        if (!close())
            return error(`missing '}'`);
        return decls;
    }
    /**
     * Parse keyframe.
     */
    function keyframe() {
        var m;
        const vals = [];
        const pos = position();
        while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
            vals.push(m[1]);
            match(/^,\s*/);
        }
        if (!vals.length)
            return;
        return pos({
            type: 'keyframe',
            values: vals,
            declarations: declarations()
        });
    }
    /**
     * Parse keyframes.
     */
    function atkeyframes() {
        const pos = position();
        var m = match(/^@([-\w]+)?keyframes\s*/);
        if (!m)
            return;
        const vendor = m[1];
        // identifier
        m = match(/^([-\w]+)\s*/);
        if (!m)
            return error(`@keyframes missing name`);
        const name = m[1];
        if (!open())
            return error(`@keyframes missing '{'`);
        var frame;
        var frames = comments();
        while (frame = keyframe()) {
            frames.push(frame);
            frames = frames.concat(comments());
        }
        if (!close())
            return error(`@keyframes missing '}'`);
        return pos({
            type: 'keyframes',
            name: name,
            vendor: vendor,
            keyframes: frames
        });
    }
    /**
     * Parse supports.
     */
    function atsupports() {
        const pos = position();
        const m = match(/^@supports *([^{]+)/);
        if (!m)
            return;
        const supports = trim(m[1]);
        if (!open())
            return error(`@supports missing '{'`);
        const style = comments().concat(rules());
        if (!close())
            return error(`@supports missing '}'`);
        return pos({
            type: 'supports',
            supports: supports,
            rules: style
        });
    }
    /**
     * Parse host.
     */
    function athost() {
        const pos = position();
        const m = match(/^@host\s*/);
        if (!m)
            return;
        if (!open())
            return error(`@host missing '{'`);
        const style = comments().concat(rules());
        if (!close())
            return error(`@host missing '}'`);
        return pos({
            type: 'host',
            rules: style
        });
    }
    /**
     * Parse media.
     */
    function atmedia() {
        const pos = position();
        const m = match(/^@media *([^{]+)/);
        if (!m)
            return;
        const media = trim(m[1]);
        if (!open())
            return error(`@media missing '{'`);
        const style = comments().concat(rules());
        if (!close())
            return error(`@media missing '}'`);
        return pos({
            type: 'media',
            media: media,
            rules: style
        });
    }
    /**
     * Parse custom-media.
     */
    function atcustommedia() {
        const pos = position();
        const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
        if (!m)
            return;
        return pos({
            type: 'custom-media',
            name: trim(m[1]),
            media: trim(m[2])
        });
    }
    /**
     * Parse paged media.
     */
    function atpage() {
        const pos = position();
        const m = match(/^@page */);
        if (!m)
            return;
        const sel = selector() || [];
        if (!open())
            return error(`@page missing '{'`);
        var decls = comments();
        // declarations
        var decl;
        while (decl = declaration()) {
            decls.push(decl);
            decls = decls.concat(comments());
        }
        if (!close())
            return error(`@page missing '}'`);
        return pos({
            type: 'page',
            selectors: sel,
            declarations: decls
        });
    }
    /**
     * Parse document.
     */
    function atdocument() {
        const pos = position();
        const m = match(/^@([-\w]+)?document *([^{]+)/);
        if (!m)
            return;
        const vendor = trim(m[1]);
        const doc = trim(m[2]);
        if (!open())
            return error(`@document missing '{'`);
        const style = comments().concat(rules());
        if (!close())
            return error(`@document missing '}'`);
        return pos({
            type: 'document',
            document: doc,
            vendor: vendor,
            rules: style
        });
    }
    /**
     * Parse font-face.
     */
    function atfontface() {
        const pos = position();
        const m = match(/^@font-face\s*/);
        if (!m)
            return;
        if (!open())
            return error(`@font-face missing '{'`);
        var decls = comments();
        // declarations
        var decl;
        while (decl = declaration()) {
            decls.push(decl);
            decls = decls.concat(comments());
        }
        if (!close())
            return error(`@font-face missing '}'`);
        return pos({
            type: 'font-face',
            declarations: decls
        });
    }
    /**
     * Parse import
     */
    const atimport = _compileAtrule('import');
    /**
     * Parse charset
     */
    const atcharset = _compileAtrule('charset');
    /**
     * Parse namespace
     */
    const atnamespace = _compileAtrule('namespace');
    /**
     * Parse non-block at-rules
     */
    function _compileAtrule(name) {
        const re = new RegExp('^@' + name + '\\s*([^;]+);');
        return function () {
            const pos = position();
            const m = match(re);
            if (!m)
                return;
            const ret = { type: name };
            ret[name] = m[1].trim();
            return pos(ret);
        };
    }
    /**
     * Parse at rule.
     */
    function atrule() {
        if (css[0] !== '@')
            return;
        return atkeyframes()
            || atmedia()
            || atcustommedia()
            || atsupports()
            || atimport()
            || atcharset()
            || atnamespace()
            || atdocument()
            || atpage()
            || athost()
            || atfontface();
    }
    /**
     * Parse rule.
     */
    function rule() {
        const pos = position();
        const sel = selector();
        if (!sel)
            return error('selector missing');
        comments();
        return pos({
            type: 'rule',
            selectors: sel,
            declarations: declarations()
        });
    }
    return addParent(stylesheet());
}
/**
 * Trim `str`.
 */
function trim(str) {
    return str ? str.trim() : '';
}
/**
 * Adds non-enumerable parent node reference to each node.
 */
function addParent(obj, parent) {
    const isNode = obj && typeof obj.type === 'string';
    const childParent = isNode ? obj : parent;
    for (const k in obj) {
        const value = obj[k];
        if (Array.isArray(value)) {
            value.forEach(function (v) { addParent(v, childParent); });
        }
        else if (value && typeof value === 'object') {
            addParent(value, childParent);
        }
    }
    if (isNode) {
        Object.defineProperty(obj, 'parent', {
            configurable: true,
            writable: true,
            enumerable: false,
            value: parent || null
        });
    }
    return obj;
}

function getSelectors(sel) {
    // reusing global SELECTORS since this is a synchronous operation
    SELECTORS.all.length = SELECTORS.tags.length = SELECTORS.classNames.length = SELECTORS.ids.length = SELECTORS.attrs.length = 0;
    sel = sel.replace(/\./g, ' .')
        .replace(/\#/g, ' #')
        .replace(/\[/g, ' [')
        .replace(/\>/g, ' > ')
        .replace(/\+/g, ' + ')
        .replace(/\~/g, ' ~ ')
        .replace(/\*/g, ' * ')
        .replace(/\:not\((.*?)\)/g, ' ');
    const items = sel.split(' ');
    for (var i = 0; i < items.length; i++) {
        items[i] = items[i].split(':')[0];
        if (items[i].length === 0)
            continue;
        if (items[i].charAt(0) === '.') {
            SELECTORS.classNames.push(items[i].substr(1));
        }
        else if (items[i].charAt(0) === '#') {
            SELECTORS.ids.push(items[i].substr(1));
        }
        else if (items[i].charAt(0) === '[') {
            items[i] = items[i].substr(1).split('=')[0].split(']')[0].trim();
            SELECTORS.attrs.push(items[i].toLowerCase());
        }
        else if (/[a-z]/g.test(items[i].charAt(0))) {
            SELECTORS.tags.push(items[i].toLowerCase());
        }
    }
    SELECTORS.classNames = SELECTORS.classNames.sort((a, b) => {
        if (a.length < b.length)
            return -1;
        if (a.length > b.length)
            return 1;
        return 0;
    });
    return SELECTORS;
}
const SELECTORS = {
    all: [],
    tags: [],
    classNames: [],
    ids: [],
    attrs: []
};

/**
 * CSS stringify adopted from rework/css by
 * TJ Holowaychuk (@tj)
 * Licensed under the MIT License
 * https://github.com/reworkcss/css/blob/master/LICENSE
 */
class StringifyCss {
    constructor(opts) {
        this.usedSelectors = opts.usedSelectors;
    }
    /**
     * Visit `node`.
     */
    visit(node) {
        return this[node.type](node);
    }
    /**
     * Map visit over array of `nodes`, optionally using a `delim`
     */
    mapVisit(nodes, delim) {
        var buf = '';
        delim = delim || '';
        for (var i = 0, length = nodes.length; i < length; i++) {
            buf += this.visit(nodes[i]);
            if (delim && i < length - 1)
                buf += delim;
        }
        return buf;
    }
    /**
     * Compile `node`.
     */
    compile(node) {
        return node.stylesheet
            .rules.map(this.visit, this)
            .join('');
    }
    comment() {
        return '';
    }
    /**
     * Visit import node.
     */
    import(node) {
        return '@import ' + node.import + ';';
    }
    /**
     * Visit media node.
     */
    media(node) {
        const mediaCss = this.mapVisit(node.rules);
        if (mediaCss === '') {
            return '';
        }
        return '@media ' + node.media + '{' + this.mapVisit(node.rules) + '}';
    }
    /**
     * Visit document node.
     */
    document(node) {
        const documentCss = this.mapVisit(node.rules);
        if (documentCss === '') {
            return '';
        }
        const doc = '@' + (node.vendor || '') + 'document ' + node.document;
        return doc + '{' + documentCss + '}';
    }
    /**
     * Visit charset node.
     */
    charset(node) {
        return '@charset ' + node.charset + ';';
    }
    /**
     * Visit namespace node.
     */
    namespace(node) {
        return '@namespace ' + node.namespace + ';';
    }
    /**
     * Visit supports node.
     */
    supports(node) {
        const supportsCss = this.mapVisit(node.rules);
        if (supportsCss === '') {
            return '';
        }
        return '@supports ' + node.supports + '{' + supportsCss + '}';
    }
    /**
     * Visit keyframes node.
     */
    keyframes(node) {
        const keyframesCss = this.mapVisit(node.keyframes);
        if (keyframesCss === '') {
            return '';
        }
        return '@' + (node.vendor || '') + 'keyframes ' + node.name + '{' + keyframesCss + '}';
    }
    /**
     * Visit keyframe node.
     */
    keyframe(node) {
        const decls = node.declarations;
        return node.values.join(',') + '{' + this.mapVisit(decls) + '}';
    }
    /**
     * Visit page node.
     */
    page(node) {
        const sel = node.selectors.length
            ? node.selectors.join(', ')
            : '';
        return '@page ' + sel + '{' + this.mapVisit(node.declarations) + '}';
    }
    /**
     * Visit font-face node.
     */
    ['font-face'](node) {
        const fontCss = this.mapVisit(node.declarations);
        if (fontCss === '') {
            return '';
        }
        return '@font-face{' + fontCss + '}';
    }
    /**
     * Visit host node.
     */
    host(node) {
        return '@host{' + this.mapVisit(node.rules) + '}';
    }
    /**
     * Visit custom-media node.
     */
    ['custom-media'](node) {
        return '@custom-media ' + node.name + ' ' + node.media + ';';
    }
    /**
     * Visit rule node.
     */
    rule(node) {
        const decls = node.declarations;
        if (!decls.length)
            return '';
        var i, j;
        for (i = node.selectors.length - 1; i >= 0; i--) {
            const sel = getSelectors(node.selectors[i]);
            if (this.usedSelectors) {
                var include = true;
                // classes
                var jlen = sel.classNames.length;
                if (jlen > 0) {
                    for (j = 0; j < jlen; j++) {
                        if (this.usedSelectors.classNames.indexOf(sel.classNames[j]) === -1) {
                            include = false;
                            break;
                        }
                    }
                }
                // tags
                if (include) {
                    jlen = sel.tags.length;
                    if (jlen > 0) {
                        for (j = 0; j < jlen; j++) {
                            if (this.usedSelectors.tags.indexOf(sel.tags[j]) === -1) {
                                include = false;
                                break;
                            }
                        }
                    }
                }
                // attrs
                if (include) {
                    jlen = sel.attrs.length;
                    if (jlen > 0) {
                        for (j = 0; j < jlen; j++) {
                            if (this.usedSelectors.attrs.indexOf(sel.attrs[j]) === -1) {
                                include = false;
                                break;
                            }
                        }
                    }
                }
                // ids
                if (include) {
                    jlen = sel.ids.length;
                    if (jlen > 0) {
                        for (j = 0; j < jlen; j++) {
                            if (this.usedSelectors.ids.indexOf(sel.ids[j]) === -1) {
                                include = false;
                                break;
                            }
                        }
                    }
                }
                if (!include) {
                    node.selectors.splice(i, 1);
                }
            }
        }
        if (node.selectors.length === 0)
            return '';
        return `${node.selectors}{${this.mapVisit(decls)}}`;
    }
    /**
     * Visit declaration node.
     */
    declaration(node) {
        return node.property + ':' + node.value + ';';
    }
}

function removeUnusedStyles(config, usedSelectors, cssContent, diagnostics) {
    let cleanedCss = cssContent;
    try {
        // parse the css from being applied to the document
        const cssAst = parseCss(config, cssContent);
        if (cssAst.stylesheet.diagnostics.length) {
            cssAst.stylesheet.diagnostics.forEach(d => {
                diagnostics.push(d);
            });
            return cleanedCss;
        }
        try {
            // convert the parsed css back into a string
            // but only keeping what was found in our active selectors
            const stringify = new StringifyCss({ usedSelectors });
            cleanedCss = stringify.compile(cssAst);
        }
        catch (e) {
            diagnostics.push({
                level: 'error',
                type: 'css',
                header: 'CSS Stringify',
                messageText: e
            });
        }
    }
    catch (e) {
        diagnostics.push({
            level: 'error',
            type: 'css',
            header: 'CSS Parse',
            messageText: e
        });
    }
    return cleanedCss;
}

class UsedSelectors {
    constructor(elm) {
        this.tags = [];
        this.classNames = [];
        this.ids = [];
        this.attrs = [];
        this.collectSelectors(elm);
    }
    collectSelectors(elm) {
        var i;
        if (elm && elm.tagName) {
            // tags
            const tagName = elm.tagName.toLowerCase();
            if (!this.tags.includes(tagName)) {
                this.tags.push(tagName);
            }
            // classes
            const classList = elm.classList;
            for (i = 0; i < classList.length; i++) {
                const className = classList.item(i);
                if (!this.classNames.includes(className)) {
                    this.classNames.push(className);
                }
            }
            // attributes
            const attributes = elm.attributes;
            for (i = 0; i < attributes.length; i++) {
                const attr = attributes.item(i);
                const attrName = attr.name.toLowerCase();
                if (!attrName || attrName === 'class' || attrName === 'id' || attrName === 'style')
                    continue;
                if (!this.attrs.includes(attrName)) {
                    this.attrs.push(attrName);
                }
            }
            // ids
            var idValue = elm.getAttribute('id');
            if (idValue) {
                idValue = idValue.trim();
                if (idValue && !this.ids.includes(idValue)) {
                    this.ids.push(idValue);
                }
            }
            // drill down
            for (i = 0; i < elm.children.length; i++) {
                this.collectSelectors(elm.children[i]);
            }
        }
    }
}

function optimizeSsrStyles(config, outputTarget, doc, diagnostics) {
    const ssrStyleElm = mergeSsrStyles(doc);
    if (ssrStyleElm == null) {
        return;
    }
    if (outputTarget.removeUnusedStyles !== false) {
        // removeUnusedStyles is the default
        try {
            // pick out all of the selectors that are actually
            // being used in the html document
            const usedSelectors = new UsedSelectors(doc.documentElement);
            // remove any selectors that are not used in this document
            ssrStyleElm.innerHTML = removeUnusedStyles(config, usedSelectors, ssrStyleElm.innerHTML, diagnostics);
        }
        catch (e) {
            diagnostics.push({
                level: 'error',
                type: 'hydrate',
                header: 'HTML Selector Parse',
                messageText: e
            });
        }
    }
}
function mergeSsrStyles(doc) {
    // get all the styles that were added during prerendering
    const ssrStyleElms = doc.head.querySelectorAll(`style[data-styles]`);
    if (ssrStyleElms.length === 0) {
        // this doc doesn't have any ssr styles
        return null;
    }
    const styleText = [];
    let ssrStyleElm;
    for (let i = ssrStyleElms.length - 1; i >= 0; i--) {
        // iterate backwards for funzies
        ssrStyleElm = ssrStyleElms[i];
        // collect up all the style text from each style element
        styleText.push(ssrStyleElm.innerHTML);
        // remove this style element from the document
        ssrStyleElm.parentNode.removeChild(ssrStyleElm);
        if (i === 0) {
            // this is the first style element, let's use this
            // same element as the main one we'll load up
            // merge all of the styles we collected into one
            ssrStyleElm.innerHTML = styleText.reverse().join('').trim();
            if (ssrStyleElm.innerHTML.length > 0) {
                // let's keep the first style element
                // and make it the first element in the head
                doc.head.insertBefore(ssrStyleElm, doc.head.firstChild);
                // return the ssr style element we loaded up
                return ssrStyleElm;
            }
        }
    }
    return null;
}

function relocateMetaCharset(doc) {
    if (!doc || !doc.head) {
        return;
    }
    let charsetElm = doc.head.querySelector('meta[charset]');
    if (charsetElm == null) {
        // doesn't have <meta charset>, so create it
        charsetElm = doc.createElement('meta');
        charsetElm.setAttribute('charset', 'utf-8');
    }
    else {
        // take the current one out of its existing location
        charsetElm.remove();
    }
    // ensure the <meta charset> is the first node in <head>
    doc.head.insertBefore(charsetElm, doc.head.firstChild);
}

function updateCanonicalLink(config, doc, windowLocationPath) {
    // https://webmasters.googleblog.com/2009/02/specify-your-canonical.html
    // <link rel="canonical" href="http://www.example.com/product.php?item=swedish-fish" />
    if (typeof windowLocationPath !== 'string') {
        return;
    }
    const canonicalLink = doc.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        return;
    }
    const existingHref = canonicalLink.getAttribute('href');
    const updatedRref = updateCanonicalLinkHref(config, existingHref, windowLocationPath);
    canonicalLink.setAttribute('href', updatedRref);
}
function updateCanonicalLinkHref(config, href, windowLocationPath) {
    const parsedUrl = config.sys.url.parse(windowLocationPath);
    if (typeof href === 'string') {
        href = href.trim();
        if (href.endsWith('/')) {
            href = href.substr(0, href.length - 1);
        }
    }
    else {
        href = '';
    }
    return `${href}${parsedUrl.path}`;
}

function optimizeHtml(config, compilerCtx, hydrateTarget, windowLocationPath, doc, diagnostics) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        if (hydrateTarget.hydrateComponents) {
            doc.documentElement.setAttribute('data-ssr', (typeof hydrateTarget.timestamp === 'string' ? hydrateTarget.timestamp : ''));
        }
        if (hydrateTarget.canonicalLink) {
            try {
                updateCanonicalLink(config, doc, windowLocationPath);
            }
            catch (e) {
                diagnostics.push({
                    level: 'error',
                    type: 'hydrate',
                    header: 'Insert Canonical Link',
                    messageText: e
                });
            }
        }
        if (hydrateTarget.inlineStyles) {
            try {
                optimizeSsrStyles(config, hydrateTarget, doc, diagnostics);
            }
            catch (e) {
                diagnostics.push({
                    level: 'error',
                    type: 'hydrate',
                    header: 'Inline Component Styles',
                    messageText: e
                });
            }
        }
        if (hydrateTarget.inlineLoaderScript) {
            // remove the script to the external loader script request
            // inline the loader script at the bottom of the html
            promises.push(inlineLoaderScript(config, compilerCtx, hydrateTarget, windowLocationPath, doc));
        }
        if (hydrateTarget.inlineAssetsMaxSize > 0) {
            promises.push(inlineExternalAssets(config, compilerCtx, hydrateTarget, windowLocationPath, doc));
        }
        if (hydrateTarget.collapseWhitespace && !config.devMode && config.logLevel !== 'debug') {
            // collapseWhitespace is the default
            try {
                config.logger.debug(`optimize ${windowLocationPath}, collapse html whitespace`);
                collapseHtmlWhitepace(doc.documentElement);
            }
            catch (e) {
                diagnostics.push({
                    level: 'error',
                    type: 'hydrate',
                    header: 'Reduce HTML Whitespace',
                    messageText: e
                });
            }
        }
        // need to wait on to see if external files are inlined
        yield Promise.all(promises);
        // reset for new promises
        promises.length = 0;
        if (config.minifyCss) {
            promises.push(minifyInlineStyles(config, compilerCtx, doc, diagnostics));
        }
        if (config.minifyJs) {
            promises.push(minifyInlineScripts(config, compilerCtx, doc, diagnostics));
        }
        if (config.assetVersioning) {
            promises.push(assetVersioning(config, compilerCtx, hydrateTarget, windowLocationPath, doc));
        }
        relocateMetaCharset(doc);
        yield Promise.all(promises);
    });
}
function optimizeIndexHtml(config, compilerCtx, hydrateTarget, windowLocationPath, diagnostics) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            hydrateTarget.html = yield compilerCtx.fs.readFile(hydrateTarget.indexHtml);
            try {
                const dom = config.sys.createDom();
                const win = dom.parse(hydrateTarget);
                const doc = win.document;
                yield optimizeHtml(config, compilerCtx, hydrateTarget, windowLocationPath, doc, diagnostics);
                // serialize this dom back into a string
                yield compilerCtx.fs.writeFile(hydrateTarget.indexHtml, dom.serialize());
            }
            catch (e) {
                catchError(diagnostics, e);
            }
        }
        catch (e) {
            // index.html file doesn't exist, which is fine
        }
    });
}

/**
 * Production h() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */
const stack = [];
function h(nodeName, vnodeData) {
    let children = null;
    let lastSimple = false;
    let simple = false;
    let i = arguments.length;
    let vkey;
    let vname;
    for (; i-- > 2;) {
        stack.push(arguments[i]);
    }
    while (stack.length > 0) {
        let child = stack.pop();
        if (child && child.pop !== undefined) {
            for (i = child.length; i--;) {
                stack.push(child[i]);
            }
        }
        else {
            if (typeof child === 'boolean') {
                child = null;
            }
            if ((simple = typeof nodeName !== 'function')) {
                if (child == null) {
                    child = '';
                }
                else if (typeof child === 'number') {
                    child = String(child);
                }
                else if (typeof child !== 'string') {
                    simple = false;
                }
            }
            if (simple && lastSimple) {
                children[children.length - 1].vtext += child;
            }
            else if (children === null) {
                children = [simple ? { vtext: child } : child];
            }
            else {
                children.push(simple ? { vtext: child } : child);
            }
            lastSimple = simple;
        }
    }
    if (vnodeData != null) {
        // normalize class / classname attributes
        if (vnodeData['className']) {
            vnodeData['class'] = vnodeData['className'];
        }
        if (typeof vnodeData['class'] === 'object') {
            for (i in vnodeData['class']) {
                if (vnodeData['class'][i]) {
                    stack.push(i);
                }
            }
            vnodeData['class'] = stack.join(' ');
            stack.length = 0;
        }
        if (vnodeData.key != null) {
            vkey = vnodeData.key;
        }
        if (vnodeData.name != null) {
            vname = vnodeData.name;
        }
    }
    if (typeof nodeName === 'function') {
        // nodeName is a functional component
        return nodeName(vnodeData, children || [], utils);
    }
    return {
        vtag: nodeName,
        vchildren: children,
        vtext: undefined,
        vattrs: vnodeData,
        vkey: vkey,
        vname: vname,
        elm: undefined,
        ishost: false
    };
}
const utils = {
    'forEach': (children, cb) => children.forEach(cb),
    'map': (children, cb) => children.map(cb)
};

function normalizeHydrateOptions(wwwTarget, opts) {
    const hydrateTarget = Object.assign({}, wwwTarget);
    hydrateTarget.prerenderLocations = wwwTarget.prerenderLocations.map(p => Object.assign({}, p));
    hydrateTarget.hydrateComponents = true;
    const req = opts.req;
    if (req && typeof req.get === 'function') {
        // assuming node express request object
        // https://expressjs.com/
        if (!opts.url)
            opts.url = req.protocol + '://' + req.get('host') + req.originalUrl;
        if (!opts.referrer)
            opts.referrer = req.get('referrer');
        if (!opts.userAgent)
            opts.userAgent = req.get('user-agent');
        if (!opts.cookie)
            opts.cookie = req.get('cookie');
    }
    Object.assign(hydrateTarget, opts);
    return hydrateTarget;
}
function generateHydrateResults(config, hydrateTarget) {
    if (!hydrateTarget.url) {
        hydrateTarget.url = `https://hydrate.stenciljs.com/`;
    }
    // https://nodejs.org/api/url.html
    const urlParse = config.sys.url.parse(hydrateTarget.url);
    const hydrateResults = {
        diagnostics: [],
        url: hydrateTarget.url,
        host: urlParse.host,
        hostname: urlParse.hostname,
        port: urlParse.port,
        path: urlParse.path,
        pathname: urlParse.pathname,
        search: urlParse.search,
        query: urlParse.query,
        hash: urlParse.hash,
        html: hydrateTarget.html,
        styles: null,
        anchors: [],
        components: [],
        styleUrls: [],
        scriptUrls: [],
        imgUrls: []
    };
    createConsole(config, hydrateTarget, hydrateResults);
    return hydrateResults;
}
function createConsole(config, opts, results) {
    const pathname = results.pathname;
    opts.console = opts.console || {};
    if (typeof opts.console.error !== 'function') {
        opts.console.error = function (...args) {
            results.diagnostics.push({
                level: `error`,
                type: `hydrate`,
                header: `runtime console.error: ${pathname}`,
                messageText: args.join(', ')
            });
        };
    }
    if (config.logLevel === 'debug') {
        ['debug', 'info', 'log', 'warn'].forEach(level => {
            if (typeof opts.console[level] !== 'function') {
                opts.console[level] = function (...args) {
                    results.diagnostics.push({
                        level: level,
                        type: 'hydrate',
                        header: `runtime console.${level}: ${pathname}`,
                        messageText: args.join(', ')
                    });
                };
            }
        });
    }
}
function normalizeDirection(doc, hydrateTarget) {
    let dir = doc.body.getAttribute('dir');
    if (dir) {
        dir = dir.trim().toLowerCase();
        if (dir.trim().length > 0) {
            console.warn(`dir="${dir}" should be placed on the <html> instead of <body>`);
        }
    }
    if (hydrateTarget.direction) {
        dir = hydrateTarget.direction;
    }
    else {
        dir = doc.documentElement.getAttribute('dir');
    }
    if (dir) {
        dir = dir.trim().toLowerCase();
        if (dir !== 'ltr' && dir !== 'rtl') {
            console.warn(`only "ltr" and "rtl" are valid "dir" values on the <html> element`);
        }
    }
    if (dir !== 'ltr' && dir !== 'rtl') {
        dir = 'ltr';
    }
    doc.documentElement.dir = dir;
}
function normalizeLanguage(doc, hydrateTarget) {
    let lang = doc.body.getAttribute('lang');
    if (lang) {
        lang = lang.trim().toLowerCase();
        if (lang.trim().length > 0) {
            console.warn(`lang="${lang}" should be placed on <html> instead of <body>`);
        }
    }
    if (hydrateTarget.language) {
        lang = hydrateTarget.language;
    }
    else {
        lang = doc.documentElement.getAttribute('lang');
    }
    if (lang) {
        lang = lang.trim().toLowerCase();
        if (lang.length > 0) {
            doc.documentElement.lang = lang;
        }
    }
}
function collectAnchors(config, doc, results) {
    const anchorElements = doc.querySelectorAll('a');
    for (var i = 0; i < anchorElements.length; i++) {
        const attrs = {};
        const anchorAttrs = anchorElements[i].attributes;
        for (var j = 0; j < anchorAttrs.length; j++) {
            attrs[anchorAttrs[j].nodeName.toLowerCase()] = anchorAttrs[j].nodeValue;
        }
        results.anchors.push(attrs);
    }
    config.logger.debug(`optimize ${results.pathname}, collected anchors: ${results.anchors.length}`);
}
function generateFailureDiagnostic(diagnostic) {
    return `
    <div style="padding: 20px;">
      <div style="font-weight: bold;">${diagnostic.header}</div>
      <div>${diagnostic.messageText}</div>
    </div>
  `;
}

const initHostSnapshot = (domApi, cmpMeta, hostElm, hostSnapshot, attribName) => {
    // the host element has connected to the dom
    // and we've waited a tick to make sure all frameworks
    // have finished adding attributes and child nodes to the host
    // before we go all out and hydrate this beast
    // let's first take a snapshot of its original layout before render
    if (!hostElm.mode) {
        // looks like mode wasn't set as a property directly yet
        // first check if there's an attribute
        // next check the app's global
        hostElm.mode = domApi.$getMode(hostElm);
    }
    {
        // if the slot polyfill is required we'll need to put some nodes
        // in here to act as original content anchors as we move nodes around
        // host element has been connected to the DOM
        if (!hostElm['s-cr'] && !domApi.$getAttribute(hostElm, SSR_VNODE_ID) && (!domApi.$supportsShadowDom || cmpMeta.encapsulationMeta !== 1 /* ShadowDom */)) {
            // only required when we're NOT using native shadow dom (slot)
            // or this browser doesn't support native shadow dom
            // and this host element was NOT created with SSR
            // let's pick out the inner content for slot projection
            // create a node to represent where the original
            // content was first placed, which is useful later on
            hostElm['s-cr'] = domApi.$createTextNode('');
            hostElm['s-cr']['s-cn'] = true;
            domApi.$insertBefore(hostElm, hostElm['s-cr'], domApi.$childNodes(hostElm)[0]);
        }
        if (!domApi.$supportsShadowDom && cmpMeta.encapsulationMeta === 1 /* ShadowDom */) {
            // this component should use shadow dom
            // but this browser doesn't support it
            // so let's polyfill a few things for the user
            if (window.HTMLElement && !('shadowRoot' in window.HTMLElement.prototype)) {
                hostElm.shadowRoot = hostElm;
            }
        }
    }
    {
        if (cmpMeta.encapsulationMeta === 1 /* ShadowDom */ && domApi.$supportsShadowDom && !hostElm.shadowRoot) {
            // this component is using shadow dom
            // and this browser supports shadow dom
            // add the read-only property "shadowRoot" to the host element
            domApi.$attachShadow(hostElm, { mode: 'open' });
        }
    }
    // create a host snapshot object we'll
    // use to store all host data about to be read later
    hostSnapshot = {
        $attributes: {}
    };
    {
        // loop through and gather up all the original attributes on the host
        // this is useful later when we're creating the component instance
        cmpMeta.membersMeta && Object.keys(cmpMeta.membersMeta).forEach(memberName => {
            if (attribName = cmpMeta.membersMeta[memberName].attribName) {
                hostSnapshot.$attributes[attribName] = domApi.$getAttribute(hostElm, attribName);
            }
        });
    }
    return hostSnapshot;
};

function initElementListeners(plt, elm) {
    // so the element was just connected, which means it's in the DOM
    // however, the component instance hasn't been created yet
    // but what if an event it should be listening to get emitted right now??
    // let's add our listeners right now to our element, and if it happens
    // to receive events between now and the instance being created let's
    // queue up all of the event data and fire it off on the instance when it's ready
    const cmpMeta = plt.getComponentMeta(elm);
    if (cmpMeta.listenersMeta) {
        // we've got listens
        cmpMeta.listenersMeta.forEach(listenMeta => {
            // go through each listener
            if (!listenMeta.eventDisabled) {
                // only add ones that are not already disabled
                plt.domApi.$addEventListener(elm, listenMeta.eventName, createListenerCallback(plt, elm, listenMeta.eventMethodName), 1, listenMeta.eventCapture, listenMeta.eventPassive);
            }
        });
    }
}
function createListenerCallback(plt, elm, eventMethodName, val) {
    // create the function that gets called when the element receives
    // an event which it should be listening for
    return (ev) => {
        // get the instance if it exists
        val = plt.instanceMap.get(elm);
        if (val) {
            // instance is ready, let's call it's member method for this event
            val[eventMethodName](ev);
        }
        else {
            // instance is not ready!!
            // let's queue up this event data and replay it later
            // when the instance is ready
            val = (plt.queuedEvents.get(elm) || []);
            val.push(eventMethodName, ev);
            plt.queuedEvents.set(elm, val);
        }
    };
}
function enableEventListener(plt, instance, eventName, shouldEnable, attachTo, passive) {
    if (instance) {
        // cool, we've got an instance, it's get the element it's on
        const elm = plt.hostElementMap.get(instance);
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta && cmpMeta.listenersMeta) {
            // alrighty, so this cmp has listener meta
            if (shouldEnable) {
                // we want to enable this event
                // find which listen meta we're talking about
                const listenMeta = cmpMeta.listenersMeta.find(l => l.eventName === eventName);
                if (listenMeta) {
                    // found the listen meta, so let's add the listener
                    plt.domApi.$addEventListener(elm, eventName, (ev) => instance[listenMeta.eventMethodName](ev), 1, listenMeta.eventCapture, (passive === undefined) ? listenMeta.eventPassive : !!passive, attachTo);
                }
            }
            else {
                // we're disabling the event listener
                // so let's just remove it entirely
                plt.domApi.$removeEventListener(elm, eventName, 1);
            }
        }
    }
}

const connectedCallback = (plt, cmpMeta, elm, perf) => {
    {
        // initialize our event listeners on the host element
        // we do this now so that we can listening to events that may
        // have fired even before the instance is ready
        if (!plt.hasListenersMap.has(elm)) {
            // it's possible we've already connected
            // then disconnected
            // and the same element is reconnected again
            plt.hasListenersMap.set(elm, true);
            initElementListeners(plt, elm);
        }
    }
    // this element just connected, which may be re-connecting
    // ensure we remove it from our map of disconnected
    plt.isDisconnectedMap.delete(elm);
    if (!plt.hasConnectedMap.has(elm)) {
        plt.hasConnectedComponent = true;
        plt.processingCmp.add(elm);
        // first time we've connected
        plt.hasConnectedMap.set(elm, true);
        // register this component as an actively
        // loading child to its parent component
        registerWithParentComponent(plt, elm);
        // add to the queue to load the bundle
        // it's important to have an async tick in here so we can
        // ensure the "mode" attribute has been added to the element
        // place in high priority since it's not much work and we need
        // to know as fast as possible, but still an async tick in between
        plt.queue.tick(() => {
            // start loading this component mode's bundle
            // if it's already loaded then the callback will be synchronous
            plt.hostSnapshotMap.set(elm, initHostSnapshot(plt.domApi, cmpMeta, elm));
            plt.requestBundle(cmpMeta, elm);
        });
    }
};
const registerWithParentComponent = (plt, elm, ancestorHostElement) => {
    // find the first ancestor host element (if there is one) and register
    // this element as one of the actively loading child elements for its ancestor
    ancestorHostElement = elm;
    while (ancestorHostElement = plt.domApi.$parentElement(ancestorHostElement)) {
        // climb up the ancestors looking for the first registered component
        if (plt.isDefinedComponent(ancestorHostElement)) {
            // we found this elements the first ancestor host element
            // if the ancestor already loaded then do nothing, it's too late
            if (!plt.isCmpReady.has(elm)) {
                // keep a reference to this element's ancestor host element
                // elm._ancestorHostElement = ancestorHostElement;
                plt.ancestorHostElementMap.set(elm, ancestorHostElement);
                // ensure there is an array to contain a reference to each of the child elements
                // and set this element as one of the ancestor's child elements it should wait on
                (ancestorHostElement['s-ld'] = ancestorHostElement['s-ld'] || []).push(elm);
            }
            break;
        }
    }
};

function attributeChangedCallback(attrPropsMap, elm, attribName, newVal) {
    // look up to see if we have a property wired up to this attribute name
    const propName = attrPropsMap[toLowerCase(attribName)];
    if (propName) {
        // there is not need to cast the value since, it's already casted when
        // the prop is setted
        elm[propName] = newVal === null && typeof elm[propName] === 'boolean'
            ? false
            : newVal;
    }
}

function elementHasProperty(plt, elm, memberName) {
    // within the browser, the element's prototype
    // already has its getter/setter set, but on the
    // server the prototype is shared causing issues
    // so instead the server's elm has the getter/setter
    // directly on the actual element instance, not its prototype
    // so at the time of this function being called, the server
    // side element is unaware if the element has this property
    // name. So for server-side only, do this trick below
    // don't worry, this runtime code doesn't show on the client
    let hasOwnProperty = elm.hasOwnProperty(memberName);
    if (!hasOwnProperty) {
        // element doesn't
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta) {
            if (cmpMeta.componentConstructor && cmpMeta.componentConstructor.properties) {
                // if we have the constructor property data, let's check that
                const member = cmpMeta.componentConstructor.properties[memberName];
                hasOwnProperty = !!(member && member.type);
            }
            if (!hasOwnProperty && cmpMeta.membersMeta) {
                // if we have the component's metadata, let's check that
                const member = cmpMeta.membersMeta[memberName];
                hasOwnProperty = !!(member && member.propType);
            }
        }
    }
    return hasOwnProperty;
}

const updateAttribute = (elm, memberName, newValue, isBooleanAttr = typeof newValue === 'boolean', isXlinkNs) => {
    {
        isXlinkNs = (memberName !== (memberName = memberName.replace(/^xlink\:?/, '')));
    }
    if (newValue == null || (isBooleanAttr && (!newValue || newValue === 'false'))) {
        if (isXlinkNs) {
            elm.removeAttributeNS(XLINK_NS$1, toLowerCase(memberName));
        }
        else {
            elm.removeAttribute(memberName);
        }
    }
    else if (typeof newValue !== 'function') {
        if (isBooleanAttr) {
            newValue = '';
        }
        else {
            newValue = newValue.toString();
        }
        if (isXlinkNs) {
            elm.setAttributeNS(XLINK_NS$1, toLowerCase(memberName), newValue);
        }
        else {
            elm.setAttribute(memberName, newValue);
        }
    }
};
const XLINK_NS$1 = 'http://www.w3.org/1999/xlink';

const setAccessor = (plt, elm, memberName, oldValue, newValue, isSvg, isHostElement) => {
    if (memberName === 'class' && !isSvg) {
        // Class
        {
            if (oldValue !== newValue) {
                const oldList = parseClassList(oldValue);
                const newList = parseClassList(newValue);
                // remove classes in oldList, not included in newList
                const toRemove = oldList.filter(item => !newList.includes(item));
                const classList = parseClassList(elm.className)
                    .filter(item => !toRemove.includes(item));
                // add classes from newValue that are not in oldList or classList
                const toAdd = newList.filter(item => !oldList.includes(item) && !classList.includes(item));
                classList.push(...toAdd);
                elm.className = classList.join(' ');
            }
        }
    }
    else if (memberName === 'style') {
        // update style attribute, css properties and values
        {
            for (const prop in oldValue) {
                if (!newValue || newValue[prop] == null) {
                    if (/-/.test(prop)) {
                        elm.style.removeProperty(prop);
                    }
                    else {
                        elm.style[prop] = '';
                    }
                }
            }
        }
        for (const prop in newValue) {
            if (!oldValue || newValue[prop] !== oldValue[prop]) {
                if (/-/.test(prop)) {
                    elm.style.setProperty(prop, newValue[prop]);
                }
                else {
                    elm.style[prop] = newValue[prop];
                }
            }
        }
    }
    else if ((memberName[0] === 'o' && memberName[1] === 'n' && /[A-Z]/.test(memberName[2])) && (!(memberName in elm))) {
        // Event Handlers
        // so if the member name starts with "on" and the 3rd characters is
        // a capital letter, and it's not already a member on the element,
        // then we're assuming it's an event listener
        if (toLowerCase(memberName) in elm) {
            // standard event
            // the JSX attribute could have been "onMouseOver" and the
            // member name "onmouseover" is on the element's prototype
            // so let's add the listener "mouseover", which is all lowercased
            memberName = toLowerCase(memberName.substring(2));
        }
        else {
            // custom event
            // the JSX attribute could have been "onMyCustomEvent"
            // so let's trim off the "on" prefix and lowercase the first character
            // and add the listener "myCustomEvent"
            // except for the first character, we keep the event name case
            memberName = toLowerCase(memberName[2]) + memberName.substring(3);
        }
        if (newValue) {
            if (newValue !== oldValue) {
                // add listener
                plt.domApi.$addEventListener(elm, memberName, newValue, 0);
            }
        }
        else {
            // remove listener
            plt.domApi.$removeEventListener(elm, memberName, 0);
        }
    }
    else if (memberName !== 'list' && memberName !== 'type' && !isSvg &&
        (memberName in elm || (['object', 'function'].indexOf(typeof newValue) !== -1) && newValue !== null)
        || (elementHasProperty(plt, elm, memberName))) {
        // Properties
        // - list and type are attributes that get applied as values on the element
        // - all svgs get values as attributes not props
        // - check if elm contains name or if the value is array, object, or function
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta && cmpMeta.membersMeta && cmpMeta.membersMeta[memberName]) {
            // we know for a fact that this element is a known component
            // and this component has this member name as a property,
            // let's set the known @Prop on this element
            // set it directly as property on the element
            setProperty(elm, memberName, newValue);
            if (isHostElement && cmpMeta.membersMeta[memberName].reflectToAttrib) {
                // we also want to set this data to the attribute
                updateAttribute(elm, cmpMeta.membersMeta[memberName].attribName, newValue, cmpMeta.membersMeta[memberName].propType === 4 /* Boolean */);
            }
        }
        else if (memberName !== 'ref') {
            // this member name is a property on this element, but it's not a component
            // this is a native property like "value" or something
            // also we can ignore the "ref" member name at this point
            setProperty(elm, memberName, newValue == null ? '' : newValue);
            if (newValue == null || newValue === false) {
                plt.domApi.$removeAttribute(elm, memberName);
            }
        }
    }
    else if (newValue != null && memberName !== 'key') {
        if (memberName === 'htmlfor') {
            console.error(`Attribute "htmlfor" set on ${elm.tagName.toLowerCase()}, with the lower case "f" must be replaced with a "htmlFor" (capital "F")`);
        }
        // Element Attributes
        updateAttribute(elm, memberName, newValue);
    }
    else if (isSvg || plt.domApi.$hasAttribute(elm, memberName) && (newValue == null || newValue === false)) {
        // remove svg attribute
        plt.domApi.$removeAttribute(elm, memberName);
    }
};
const parseClassList = (value) => (value == null || value === '') ? [] : value.trim().split(/\s+/);
/**
 * Attempt to set a DOM property to the given value.
 * IE & FF throw for certain property-value combinations.
 */
const setProperty = (elm, name, value) => {
    try {
        elm[name] = value;
    }
    catch (e) { }
};

const updateElement = (plt, oldVnode, newVnode, isSvgMode, memberName) => {
    // if the element passed in is a shadow root, which is a document fragment
    // then we want to be adding attrs/props to the shadow root's "host" element
    // if it's not a shadow root, then we add attrs/props to the same element
    const elm = (newVnode.elm.nodeType === 11 /* DocumentFragment */ && newVnode.elm.host) ? newVnode.elm.host : newVnode.elm;
    const oldVnodeAttrs = (oldVnode && oldVnode.vattrs) || EMPTY_OBJ;
    const newVnodeAttrs = newVnode.vattrs || EMPTY_OBJ;
    {
        // remove attributes no longer present on the vnode by setting them to undefined
        for (memberName in oldVnodeAttrs) {
            if (!(newVnodeAttrs && newVnodeAttrs[memberName] != null) && oldVnodeAttrs[memberName] != null) {
                setAccessor(plt, elm, memberName, oldVnodeAttrs[memberName], undefined, isSvgMode, newVnode.ishost);
            }
        }
    }
    // add new & update changed attributes
    for (memberName in newVnodeAttrs) {
        if (!(memberName in oldVnodeAttrs) || newVnodeAttrs[memberName] !== (memberName === 'value' || memberName === 'checked' ? elm[memberName] : oldVnodeAttrs[memberName])) {
            setAccessor(plt, elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], isSvgMode, newVnode.ishost);
        }
    }
};

let isSvgMode = false;
const createRendererPatch = (plt, domApi) => {
    // createRenderer() is only created once per app
    // the patch() function which createRenderer() returned is the function
    // which gets called numerous times by each component
    // internal variables to be reused per patch() call
    let useNativeShadowDom, ssrId, scopeId, checkSlotFallbackVisibility, checkSlotRelocate, contentRef, hostTagName, hostElm;
    const createElm = (oldParentVNode, newParentVNode, childIndex, parentElm, i, elm, childNode, newVNode, oldVNode) => {
        newVNode = newParentVNode.vchildren[childIndex];
        if (!useNativeShadowDom) {
            // remember for later we need to check to relocate nodes
            checkSlotRelocate = true;
            if (newVNode.vtag === 'slot') {
                if (scopeId) {
                    // scoped css needs to add its scoped id to the parent element
                    domApi.$addClass(parentElm, scopeId + '-s');
                }
                if (!newVNode.vchildren) {
                    // slot element does not have fallback content
                    // create an html comment we'll use to always reference
                    // where actual slot content should sit next to
                    newVNode.isSlotReference = true;
                }
                else {
                    // slot element has fallback content
                    // still create an element that "mocks" the slot element
                    newVNode.isSlotFallback = true;
                }
            }
        }
        if (isDef(newVNode.vtext)) {
            // create text node
            newVNode.elm = domApi.$createTextNode(newVNode.vtext);
        }
        else if (newVNode.isSlotReference) {
            // create a slot reference html text node
            newVNode.elm = domApi.$createTextNode('');
        }
        else {
            // create element
            elm = newVNode.elm = ((isSvgMode || newVNode.vtag === 'svg') ?
                domApi.$createElementNS('http://www.w3.org/2000/svg', newVNode.vtag) :
                domApi.$createElement((newVNode.isSlotFallback) ? 'slot-fb' : newVNode.vtag));
            if (plt.isDefinedComponent(elm)) {
                plt.isCmpReady.delete(hostElm);
            }
            {
                isSvgMode = newVNode.vtag === 'svg' ? true : (newVNode.vtag === 'foreignObject' ? false : isSvgMode);
            }
            // add css classes, attrs, props, listeners, etc.
            updateElement(plt, null, newVNode, isSvgMode);
            if (isDef(scopeId) && elm['s-si'] !== scopeId) {
                // if there is a scopeId and this is the initial render
                // then let's add the scopeId as an attribute
                domApi.$addClass(elm, (elm['s-si'] = scopeId));
            }
            if (isDef(ssrId)) {
                // SSR ONLY: this is an SSR render and this
                // logic does not run on the client
                // give this element the SSR child id that can be read by the client
                domApi.$setAttribute(elm, SSR_CHILD_ID, ssrId + '.' + childIndex + (hasChildNodes(newVNode.vchildren) ? '' : '.'));
            }
            if (newVNode.vchildren) {
                for (i = 0; i < newVNode.vchildren.length; ++i) {
                    // create the node
                    childNode = createElm(oldParentVNode, newVNode, i, elm);
                    // return node could have been null
                    if (childNode) {
                        if (isDef(ssrId) && childNode.nodeType === 3 /* TextNode */ && !childNode['s-cr']) {
                            // SSR ONLY: add the text node's start comment
                            domApi.$appendChild(elm, domApi.$createComment('s.' + ssrId + '.' + i));
                        }
                        // append our new node
                        domApi.$appendChild(elm, childNode);
                        if (isDef(ssrId) && childNode.nodeType === 3 /* TextNode */ && !childNode['s-cr']) {
                            // SSR ONLY: add the text node's end comment
                            domApi.$appendChild(elm, domApi.$createComment('/'));
                            domApi.$appendChild(elm, domApi.$createTextNode(' '));
                        }
                    }
                }
            }
            if (newVNode.vtag === 'svg') {
                // Only reset the SVG context when we're exiting SVG element
                isSvgMode = false;
            }
        }
        {
            newVNode.elm['s-hn'] = hostTagName;
            if (newVNode.isSlotFallback || newVNode.isSlotReference) {
                // remember the content reference comment
                newVNode.elm['s-sr'] = true;
                // remember the content reference comment
                newVNode.elm['s-cr'] = contentRef;
                // remember the slot name, or empty string for default slot
                newVNode.elm['s-sn'] = newVNode.vname || '';
                // check if we've got an old vnode for this slot
                oldVNode = oldParentVNode && oldParentVNode.vchildren && oldParentVNode.vchildren[childIndex];
                if (oldVNode && oldVNode.vtag === newVNode.vtag && oldParentVNode.elm) {
                    // we've got an old slot vnode and the wrapper is being replaced
                    // so let's move the old slot content back to it's original location
                    putBackInOriginalLocation(oldParentVNode.elm);
                }
            }
        }
        return newVNode.elm;
    };
    const putBackInOriginalLocation = (parentElm, recursive, i, childNode) => {
        plt.tmpDisconnected = true;
        const oldSlotChildNodes = domApi.$childNodes(parentElm);
        for (i = oldSlotChildNodes.length - 1; i >= 0; i--) {
            childNode = oldSlotChildNodes[i];
            if (childNode['s-hn'] !== hostTagName && childNode['s-ol']) {
                // this child node in the old element is from another component
                // remove this node from the old slot's parent
                domApi.$remove(childNode);
                // and relocate it back to it's original location
                domApi.$insertBefore(parentReferenceNode(childNode), childNode, referenceNode(childNode));
                // remove the old original location comment entirely
                // later on the patch function will know what to do
                // and move this to the correct spot in need be
                domApi.$remove(childNode['s-ol']);
                childNode['s-ol'] = null;
                checkSlotRelocate = true;
            }
            if (recursive) {
                putBackInOriginalLocation(childNode, recursive);
            }
        }
        plt.tmpDisconnected = false;
    };
    const addVnodes = (parentElm, before, parentVNode, vnodes, startIdx, endIdx, containerElm, childNode) => {
        const contentRef = parentElm['s-cr'];
        containerElm = ((contentRef && domApi.$parentNode(contentRef)) || parentElm);
        if (containerElm.shadowRoot && domApi.$tagName(containerElm) === hostTagName) {
            containerElm = containerElm.shadowRoot;
        }
        for (; startIdx <= endIdx; ++startIdx) {
            if (vnodes[startIdx]) {
                childNode = isDef(vnodes[startIdx].vtext) ?
                    domApi.$createTextNode(vnodes[startIdx].vtext) :
                    createElm(null, parentVNode, startIdx, parentElm);
                if (childNode) {
                    vnodes[startIdx].elm = childNode;
                    domApi.$insertBefore(containerElm, childNode, referenceNode(before));
                }
            }
        }
    };
    const removeVnodes = (vnodes, startIdx, endIdx, node) => {
        for (; startIdx <= endIdx; ++startIdx) {
            if (isDef(vnodes[startIdx])) {
                node = vnodes[startIdx].elm;
                {
                    // we're removing this element
                    // so it's possible we need to show slot fallback content now
                    checkSlotFallbackVisibility = true;
                    if (node['s-ol']) {
                        // remove the original location comment
                        domApi.$remove(node['s-ol']);
                    }
                    else {
                        // it's possible that child nodes of the node
                        // that's being removed are slot nodes
                        putBackInOriginalLocation(node, true);
                    }
                }
                // remove the vnode's element from the dom
                domApi.$remove(node);
            }
        }
    };
    const updateChildren = (parentElm, oldCh, newVNode, newCh, idxInOld, i, node, elmToMove) => {
        let oldStartIdx = 0, newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                // Vnode might have been moved left
                oldStartVnode = oldCh[++oldStartIdx];
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldStartVnode, newStartVnode)) {
                patchVNode(oldStartVnode, newStartVnode);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (isSameVnode(oldEndVnode, newEndVnode)) {
                patchVNode(oldEndVnode, newEndVnode);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldStartVnode, newEndVnode)) {
                // Vnode moved right
                if (oldStartVnode.vtag === 'slot' || newEndVnode.vtag === 'slot') {
                    putBackInOriginalLocation(domApi.$parentNode(oldStartVnode.elm));
                }
                patchVNode(oldStartVnode, newEndVnode);
                domApi.$insertBefore(parentElm, oldStartVnode.elm, domApi.$nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
                if (oldStartVnode.vtag === 'slot' || newEndVnode.vtag === 'slot') {
                    putBackInOriginalLocation(domApi.$parentNode(oldEndVnode.elm));
                }
                patchVNode(oldEndVnode, newStartVnode);
                domApi.$insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                // createKeyToOldIdx
                idxInOld = null;
                for (i = oldStartIdx; i <= oldEndIdx; ++i) {
                    if (oldCh[i] && isDef(oldCh[i].vkey) && oldCh[i].vkey === newStartVnode.vkey) {
                        idxInOld = i;
                        break;
                    }
                }
                if (isDef(idxInOld)) {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.vtag !== newStartVnode.vtag) {
                        node = createElm(oldCh && oldCh[newStartIdx], newVNode, idxInOld, parentElm);
                    }
                    else {
                        patchVNode(elmToMove, newStartVnode);
                        oldCh[idxInOld] = undefined;
                        node = elmToMove.elm;
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    // new element
                    node = createElm(oldCh && oldCh[newStartIdx], newVNode, newStartIdx, parentElm);
                    newStartVnode = newCh[++newStartIdx];
                }
                if (node) {
                    {
                        domApi.$insertBefore(parentReferenceNode(oldStartVnode.elm), node, referenceNode(oldStartVnode.elm));
                    }
                }
            }
        }
        if (oldStartIdx > oldEndIdx) {
            addVnodes(parentElm, (newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm), newVNode, newCh, newStartIdx, newEndIdx);
        }
        else if (newStartIdx > newEndIdx) {
            removeVnodes(oldCh, oldStartIdx, oldEndIdx);
        }
    };
    const isSameVnode = (vnode1, vnode2) => {
        // compare if two vnode to see if they're "technically" the same
        // need to have the same element tag, and same key to be the same
        if (vnode1.vtag === vnode2.vtag && vnode1.vkey === vnode2.vkey) {
            {
                if (vnode1.vtag === 'slot') {
                    return vnode1.vname === vnode2.vname;
                }
            }
            return true;
        }
        return false;
    };
    const referenceNode = (node) => {
        if (node && node['s-ol']) {
            // this node was relocated to a new location in the dom
            // because of some other component's slot
            // but we still have an html comment in place of where
            // it's original location was according to it's original vdom
            return node['s-ol'];
        }
        return node;
    };
    const parentReferenceNode = (node) => {
        return domApi.$parentNode(node['s-ol'] ? node['s-ol'] : node);
    };
    const patchVNode = (oldVNode, newVNode, defaultHolder) => {
        const elm = newVNode.elm = oldVNode.elm;
        const oldChildren = oldVNode.vchildren;
        const newChildren = newVNode.vchildren;
        {
            // test if we're rendering an svg element, or still rendering nodes inside of one
            // only add this to the when the compiler sees we're using an svg somewhere
            isSvgMode = newVNode.elm &&
                isDef(domApi.$parentElement(newVNode.elm)) &&
                newVNode.elm.ownerSVGElement !== undefined;
            isSvgMode = newVNode.vtag === 'svg' ? true : (newVNode.vtag === 'foreignObject' ? false : isSvgMode);
        }
        if (!isDef(newVNode.vtext)) {
            // element node
            if (newVNode.vtag !== 'slot') {
                // either this is the first render of an element OR it's an update
                // AND we already know it's possible it could have changed
                // this updates the element's css classes, attrs, props, listeners, etc.
                updateElement(plt, oldVNode, newVNode, isSvgMode);
            }
            if (isDef(oldChildren) && isDef(newChildren)) {
                // looks like there's child vnodes for both the old and new vnodes
                updateChildren(elm, oldChildren, newVNode, newChildren);
            }
            else if (isDef(newChildren)) {
                // no old child vnodes, but there are new child vnodes to add
                if (isDef(oldVNode.vtext)) {
                    // the old vnode was text, so be sure to clear it out
                    domApi.$setTextContent(elm, '');
                }
                // add the new vnode children
                addVnodes(elm, null, newVNode, newChildren, 0, newChildren.length - 1);
            }
            else if (isDef(oldChildren)) {
                // no new child vnodes, but there are old child vnodes to remove
                removeVnodes(oldChildren, 0, oldChildren.length - 1);
            }
        }
        else if (defaultHolder = elm['s-cr']) {
            // this element has slotted content
            domApi.$setTextContent(domApi.$parentNode(defaultHolder), newVNode.vtext);
        }
        else if (oldVNode.vtext !== newVNode.vtext) {
            // update the text content for the text only vnode
            // and also only if the text is different than before
            domApi.$setTextContent(elm, newVNode.vtext);
        }
        {
            // reset svgMode when svg node is fully patched
            if (isSvgMode && 'svg' === newVNode.vtag) {
                isSvgMode = false;
            }
        }
    };
    const updateFallbackSlotVisibility = (elm, childNode, childNodes, i, ilen, j, slotNameAttr, nodeType) => {
        childNodes = domApi.$childNodes(elm);
        for (i = 0, ilen = childNodes.length; i < ilen; i++) {
            childNode = childNodes[i];
            if (domApi.$nodeType(childNode) === 1 /* ElementNode */) {
                if (childNode['s-sr']) {
                    // this is a slot fallback node
                    // get the slot name for this slot reference node
                    slotNameAttr = childNode['s-sn'];
                    // by default always show a fallback slot node
                    // then hide it if there are other slots in the light dom
                    childNode.hidden = false;
                    for (j = 0; j < ilen; j++) {
                        if (childNodes[j]['s-hn'] !== childNode['s-hn']) {
                            // this sibling node is from a different component
                            nodeType = domApi.$nodeType(childNodes[j]);
                            if (slotNameAttr !== '') {
                                // this is a named fallback slot node
                                if (nodeType === 1 /* ElementNode */ && slotNameAttr === domApi.$getAttribute(childNodes[j], 'slot')) {
                                    childNode.hidden = true;
                                    break;
                                }
                            }
                            else {
                                // this is a default fallback slot node
                                // any element or text node (with content)
                                // should hide the default fallback slot node
                                if (nodeType === 1 /* ElementNode */ || (nodeType === 3 /* TextNode */ && domApi.$getTextContent(childNodes[j]).trim() !== '')) {
                                    childNode.hidden = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                // keep drilling down
                updateFallbackSlotVisibility(childNode);
            }
        }
    };
    const relocateNodes = [];
    const relocateSlotContent = (elm, childNodes, childNode, node, i, ilen, j, hostContentNodes, slotNameAttr, nodeType) => {
        childNodes = domApi.$childNodes(elm);
        for (i = 0, ilen = childNodes.length; i < ilen; i++) {
            childNode = childNodes[i];
            if (childNode['s-sr'] && (node = childNode['s-cr'])) {
                // first got the content reference comment node
                // then we got it's parent, which is where all the host content is in now
                hostContentNodes = domApi.$childNodes(domApi.$parentNode(node));
                slotNameAttr = childNode['s-sn'];
                for (j = hostContentNodes.length - 1; j >= 0; j--) {
                    node = hostContentNodes[j];
                    if (!node['s-cn'] && !node['s-nr'] && node['s-hn'] !== childNode['s-hn']) {
                        // let's do some relocating to its new home
                        // but never relocate a content reference node
                        // that is suppose to always represent the original content location
                        nodeType = domApi.$nodeType(node);
                        if (((nodeType === 3 /* TextNode */ || nodeType === 8 /* CommentNode */) && slotNameAttr === '') ||
                            (nodeType === 1 /* ElementNode */ && domApi.$getAttribute(node, 'slot') === null && slotNameAttr === '') ||
                            (nodeType === 1 /* ElementNode */ && domApi.$getAttribute(node, 'slot') === slotNameAttr)) {
                            // it's possible we've already decided to relocate this node
                            if (!relocateNodes.some(r => r.nodeToRelocate === node)) {
                                // made some changes to slots
                                // let's make sure we also double check
                                // fallbacks are correctly hidden or shown
                                checkSlotFallbackVisibility = true;
                                node['s-sn'] = slotNameAttr;
                                // add to our list of nodes to relocate
                                relocateNodes.push({
                                    slotRefNode: childNode,
                                    nodeToRelocate: node
                                });
                            }
                        }
                    }
                }
            }
            if (domApi.$nodeType(childNode) === 1 /* ElementNode */) {
                relocateSlotContent(childNode);
            }
        }
    };
    return (hostElement, oldVNode, newVNode, useNativeShadowDomVal, encapsulation, ssrPatchId, i, relocateNode, orgLocationNode, refNode, parentNodeRef, insertBeforeNode) => {
        // patchVNode() is synchronous
        // so it is safe to set these variables and internally
        // the same patch() call will reference the same data
        hostElm = hostElement;
        hostTagName = domApi.$tagName(hostElm);
        contentRef = hostElm['s-cr'];
        useNativeShadowDom = useNativeShadowDomVal;
        {
            if (encapsulation !== 'shadow') {
                ssrId = ssrPatchId;
            }
            else {
                ssrId = null;
            }
        }
        {
            // get the scopeId
            scopeId = hostElm['s-sc'];
            // always reset
            checkSlotRelocate = checkSlotFallbackVisibility = false;
        }
        // synchronous patch
        patchVNode(oldVNode, newVNode);
        if (isDef(ssrId)) {
            // SSR ONLY: we've been given an SSR id, so the host element
            // should be given the ssr id attribute
            domApi.$setAttribute(oldVNode.elm, SSR_VNODE_ID, ssrId);
        }
        {
            if (checkSlotRelocate) {
                relocateSlotContent(newVNode.elm);
                for (i = 0; i < relocateNodes.length; i++) {
                    relocateNode = relocateNodes[i];
                    if (!relocateNode.nodeToRelocate['s-ol']) {
                        // add a reference node marking this node's original location
                        // keep a reference to this node for later lookups
                        orgLocationNode = domApi.$createTextNode('');
                        orgLocationNode['s-nr'] = relocateNode.nodeToRelocate;
                        domApi.$insertBefore(domApi.$parentNode(relocateNode.nodeToRelocate), (relocateNode.nodeToRelocate['s-ol'] = orgLocationNode), relocateNode.nodeToRelocate);
                    }
                }
                // while we're moving nodes around existing nodes, temporarily disable
                // the disconnectCallback from working
                plt.tmpDisconnected = true;
                for (i = 0; i < relocateNodes.length; i++) {
                    relocateNode = relocateNodes[i];
                    // by default we're just going to insert it directly
                    // after the slot reference node
                    parentNodeRef = domApi.$parentNode(relocateNode.slotRefNode);
                    insertBeforeNode = domApi.$nextSibling(relocateNode.slotRefNode);
                    orgLocationNode = relocateNode.nodeToRelocate['s-ol'];
                    while (orgLocationNode = domApi.$previousSibling(orgLocationNode)) {
                        if ((refNode = orgLocationNode['s-nr']) && refNode) {
                            if (refNode['s-sn'] === relocateNode.nodeToRelocate['s-sn']) {
                                if (parentNodeRef === domApi.$parentNode(refNode)) {
                                    if ((refNode = domApi.$nextSibling(refNode)) && refNode && !refNode['s-nr']) {
                                        insertBeforeNode = refNode;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if ((!insertBeforeNode && parentNodeRef !== domApi.$parentNode(relocateNode.nodeToRelocate)) ||
                        (domApi.$nextSibling(relocateNode.nodeToRelocate) !== insertBeforeNode)) {
                        // we've checked that it's worth while to relocate
                        // since that the node to relocate
                        // has a different next sibling or parent relocated
                        if (relocateNode.nodeToRelocate !== insertBeforeNode) {
                            // remove the node from the dom
                            domApi.$remove(relocateNode.nodeToRelocate);
                            // add it back to the dom but in its new home
                            domApi.$insertBefore(parentNodeRef, relocateNode.nodeToRelocate, insertBeforeNode);
                        }
                    }
                }
                // done moving nodes around
                // allow the disconnect callback to work again
                plt.tmpDisconnected = false;
            }
            if (checkSlotFallbackVisibility) {
                updateFallbackSlotVisibility(newVNode.elm);
            }
            // always reset
            relocateNodes.length = 0;
        }
        // return our new vnode
        return newVNode;
    };
};
const callNodeRefs = (vNode, isDestroy) => {
    if (vNode) {
        vNode.vattrs && vNode.vattrs.ref && vNode.vattrs.ref(isDestroy ? null : vNode.elm);
        vNode.vchildren && vNode.vchildren.forEach(vChild => {
            callNodeRefs(vChild, isDestroy);
        });
    }
};
const hasChildNodes = (children) => {
    // SSR ONLY: check if there are any more nested child elements
    // if there aren't, this info is useful so the client runtime
    // doesn't have to climb down and check so many elements
    if (children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].vtag !== 'slot' || hasChildNodes(children[i].vchildren)) {
                return true;
            }
        }
    }
    return false;
};

function initEventEmitters(plt, cmpEvents, instance) {
    if (cmpEvents) {
        const elm = plt.hostElementMap.get(instance);
        cmpEvents.forEach(eventMeta => {
            instance[eventMeta.method] = {
                emit: (data) => plt.emitEvent(elm, eventMeta.name, {
                    bubbles: eventMeta.bubbles,
                    composed: eventMeta.composed,
                    cancelable: eventMeta.cancelable,
                    detail: data
                })
            };
        });
    }
}

const parsePropertyValue = (propType, propValue) => {
    // ensure this value is of the correct prop type
    // we're testing both formats of the "propType" value because
    // we could have either gotten the data from the attribute changed callback,
    // which wouldn't have Constructor data yet, and because this method is reused
    // within proxy where we don't have meta data, but only constructor data
    if (isDef(propValue) && typeof propValue !== 'object' && typeof propValue !== 'function') {
        if (propType === Boolean || propType === 4 /* Boolean */) {
            // per the HTML spec, any string value means it is a boolean true value
            // but we'll cheat here and say that the string "false" is the boolean false
            return (propValue === 'false' ? false : propValue === '' || !!propValue);
        }
        if (propType === Number || propType === 8 /* Number */) {
            // force it to be a number
            return parseFloat(propValue);
        }
        if (propType === String || propType === 2 /* String */) {
            // could have been passed as a number or boolean
            // but we still want it as a string
            return propValue.toString();
        }
        // redundant return here for better minification
        return propValue;
    }
    // not sure exactly what type we want
    // so no need to change to a different type
    return propValue;
};

function getScopeId(cmpMeta, mode) {
    return ('sc-' + cmpMeta.tagNameMeta) + ((mode && mode !== DEFAULT_STYLE_MODE) ? '-' + mode : '');
}
function getElementScopeId(scopeId, isHostElement) {
    return scopeId + (isHostElement ? '-h' : '-s');
}

const render = (plt, cmpMeta, hostElm, instance, perf) => {
    try {
        // if this component has a render function, let's fire
        // it off and generate the child vnodes for this host element
        // note that we do not create the host element cuz it already exists
        const hostMeta = cmpMeta.componentConstructor.host;
        const encapsulation = cmpMeta.componentConstructor.encapsulation;
        // test if this component should be shadow dom
        // and if so does the browser supports it
        const useNativeShadowDom = (encapsulation === 'shadow' && plt.domApi.$supportsShadowDom);
        let reflectHostAttr;
        let rootElm = hostElm;
        {
            reflectHostAttr = reflectInstanceValuesToHostAttributes(cmpMeta.componentConstructor.properties, instance);
        }
        // this component SHOULD use native slot/shadow dom
        // this browser DOES support native shadow dom
        // and this is the first render
        // let's create that shadow root
        // test if this component should be shadow dom
        // and if so does the browser supports it
        if (useNativeShadowDom) {
            rootElm = hostElm.shadowRoot;
        }
        if (!hostElm['s-rn']) {
            // attach the styles this component needs, if any
            // this fn figures out if the styles should go in a
            // shadow root or if they should be global
            plt.attachStyles(plt, plt.domApi, cmpMeta, hostElm);
            const scopeId = hostElm['s-sc'];
            if (scopeId) {
                plt.domApi.$addClass(hostElm, getElementScopeId(scopeId, true));
                if (encapsulation === 'scoped') {
                    plt.domApi.$addClass(hostElm, getElementScopeId(scopeId));
                }
            }
        }
        if (instance.render || instance.hostData || hostMeta || reflectHostAttr) {
            // tell the platform we're actively rendering
            // if a value is changed within a render() then
            // this tells the platform not to queue the change
            plt.activeRender = true;
            const vnodeChildren = instance.render && instance.render();
            let vnodeHostData;
            {
                // user component provided a "hostData()" method
                // the returned data/attributes are used on the host element
                vnodeHostData = instance.hostData && instance.hostData();
                {
                    if (vnodeHostData && cmpMeta.membersMeta) {
                        const foundHostKeys = Object.keys(vnodeHostData).reduce((err, k) => {
                            if (cmpMeta.membersMeta[k]) {
                                return err.concat(k);
                            }
                            if (cmpMeta.membersMeta[dashToPascalCase(k)]) {
                                return err.concat(dashToPascalCase(k));
                            }
                            return err;
                        }, []);
                        if (foundHostKeys.length > 0) {
                            throw new Error(`The following keys were attempted to be set with hostData() from the ` +
                                `${cmpMeta.tagNameMeta} component: ${foundHostKeys.join(', ')}. ` +
                                `If you would like to modify these please set @Prop({ mutable: true, reflectToAttr: true}) ` +
                                `on the @Prop() decorator.`);
                        }
                    }
                }
            }
            if (reflectHostAttr) {
                vnodeHostData = vnodeHostData ? Object.assign(vnodeHostData, reflectHostAttr) : reflectHostAttr;
            }
            // tell the platform we're done rendering
            // now any changes will again queue
            plt.activeRender = false;
            if (hostMeta) {
                // component meta data has a "theme"
                // use this to automatically generate a good css class
                // from the mode and color to add to the host element
                vnodeHostData = applyComponentHostData(vnodeHostData, hostMeta, instance);
            }
            // looks like we've got child nodes to render into this host element
            // or we need to update the css class/attrs on the host element
            const hostVNode = h(null, vnodeHostData, vnodeChildren);
            // if we haven't already created a vnode, then we give the renderer the actual element
            // if this is a re-render, then give the renderer the last vnode we already created
            const oldVNode = plt.vnodeMap.get(hostElm) || {};
            oldVNode.elm = rootElm;
            {
                // only care if we're reflecting values to the host element
                hostVNode.ishost = true;
            }
            // each patch always gets a new vnode
            // the host element itself isn't patched because it already exists
            // kick off the actual render and any DOM updates
            plt.vnodeMap.set(hostElm, plt.render(hostElm, oldVNode, hostVNode, useNativeShadowDom, encapsulation));
        }
        // update styles!
        if (plt.customStyle) {
            plt.customStyle.updateHost(hostElm);
        }
        // it's official, this element has rendered
        hostElm['s-rn'] = true;
        if (hostElm['s-rc']) {
            // ok, so turns out there are some child host elements
            // waiting on this parent element to load
            // let's fire off all update callbacks waiting
            hostElm['s-rc'].forEach(cb => cb());
            hostElm['s-rc'] = null;
        }
    }
    catch (e) {
        plt.activeRender = false;
        plt.onError(e, 8 /* RenderError */, hostElm, true);
    }
};
const applyComponentHostData = (vnodeHostData, hostMeta, instance) => {
    vnodeHostData = vnodeHostData || {};
    // component meta data has a "theme"
    // use this to automatically generate a good css class
    // from the mode and color to add to the host element
    Object.keys(hostMeta).forEach(key => {
        if (key === 'theme') {
            // host: { theme: 'button' }
            // adds css classes w/ mode and color combinations
            // class="button button-md button-primary button-md-primary"
            convertCssNamesToObj(vnodeHostData['class'] = vnodeHostData['class'] || {}, hostMeta[key], instance.mode, instance.color);
        }
        else if (key === 'class') {
            // host: { class: 'multiple css-classes' }
            // class="multiple css-classes"
            convertCssNamesToObj(vnodeHostData[key] = vnodeHostData[key] || {}, hostMeta[key]);
        }
        else {
            // rando attribute/properties
            vnodeHostData[key] = hostMeta[key];
        }
    });
    return vnodeHostData;
};
const convertCssNamesToObj = (cssClassObj, className, mode, color) => {
    className.split(' ').forEach(cssClass => {
        cssClassObj[cssClass] = true;
        if (mode) {
            cssClassObj[`${cssClass}-${mode}`] = true;
            if (color) {
                cssClassObj[`${cssClass}-${mode}-${color}`] = cssClassObj[`${cssClass}-${color}`] = true;
            }
        }
    });
};
const reflectInstanceValuesToHostAttributes = (properties, instance, reflectHostAttr) => {
    if (properties) {
        Object.keys(properties).forEach(memberName => {
            if (properties[memberName].reflectToAttr) {
                reflectHostAttr = reflectHostAttr || {};
                reflectHostAttr[memberName] = instance[memberName];
            }
        });
    }
    return reflectHostAttr;
};

const queueUpdate = (plt, elm, perf) => {
    // we're actively processing this component
    plt.processingCmp.add(elm);
    // only run patch if it isn't queued already
    if (!plt.isQueuedForUpdate.has(elm)) {
        plt.isQueuedForUpdate.set(elm, true);
        // run the patch in the next tick
        // vdom diff and patch the host element for differences
        if (plt.isAppLoaded) {
            // app has already loaded
            // let's queue this work in the dom write phase
            plt.queue.write(() => update(plt, elm, perf));
        }
        else {
            // app hasn't finished loading yet
            // so let's use next tick to do everything
            // as fast as possible
            plt.queue.tick(() => update(plt, elm, perf));
        }
    }
};
const update = (plt, elm, perf, isInitialLoad, instance, ancestorHostElement) => __awaiter(undefined, void 0, void 0, function* () {
    {
        perf.mark(`update_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
    }
    // no longer queued for update
    plt.isQueuedForUpdate.delete(elm);
    // everything is async, so somehow we could have already disconnected
    // this node, so be sure to do nothing if we've already disconnected
    if (!plt.isDisconnectedMap.has(elm)) {
        instance = plt.instanceMap.get(elm);
        isInitialLoad = !instance;
        if (isInitialLoad) {
            ancestorHostElement = plt.ancestorHostElementMap.get(elm);
            if (ancestorHostElement && !ancestorHostElement['s-rn']) {
                // this is the intial load
                // this element has an ancestor host element
                // but the ancestor host element has NOT rendered yet
                // so let's just cool our jets and wait for the ancestor to render
                (ancestorHostElement['s-rc'] = ancestorHostElement['s-rc'] || []).push(() => {
                    // this will get fired off when the ancestor host element
                    // finally gets around to rendering its lazy self
                    update(plt, elm, perf);
                });
                return;
            }
            // haven't created a component instance for this host element yet!
            // create the instance from the user's component class
            // https://www.youtube.com/watch?v=olLxrojmvMg
            instance = initComponentInstance(plt, elm, plt.hostSnapshotMap.get(elm), perf);
            if (instance) {
                // this is the initial load and the instance was just created
                // fire off the user's componentWillLoad method (if one was provided)
                // componentWillLoad only runs ONCE, after instance's element has been
                // assigned as the host element, but BEFORE render() has been called
                try {
                    if (instance.componentWillLoad) {
                        yield instance.componentWillLoad();
                    }
                }
                catch (e) {
                    plt.onError(e, 3 /* WillLoadError */, elm);
                }
            }
        }
        else if (instance) {
            // component already initialized, this is an update
            // already created an instance and this is an update
            // fire off the user's componentWillUpdate method (if one was provided)
            // componentWillUpdate runs BEFORE render() has been called
            // but only BEFORE an UPDATE and not before the intial render
            // get the returned promise (if one was provided)
            try {
                if (instance.componentWillUpdate) {
                    yield instance.componentWillUpdate();
                }
            }
            catch (e) {
                plt.onError(e, 5 /* WillUpdateError */, elm);
            }
        }
        // if this component has a render function, let's fire
        // it off and generate a vnode for this
        render(plt, plt.getComponentMeta(elm), elm, instance, perf);
        {
            perf.mark(`update_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            perf.measure(`update:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `update_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `update_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        }
        elm['s-init']();
        {
            elm['s-hmr-load'] && elm['s-hmr-load']();
        }
    }
});

const defineMember = (plt, property, elm, instance, memberName, hostSnapshot, perf, hostAttributes, hostAttrValue) => {
    function getComponentProp(values) {
        // component instance prop/state getter
        // get the property value directly from our internal values
        values = plt.valuesMap.get(plt.hostElementMap.get(this));
        return values && values[memberName];
    }
    function setComponentProp(newValue, elm) {
        // component instance prop/state setter (cannot be arrow fn)
        elm = plt.hostElementMap.get(this);
        if (elm) {
            if ((property.state) || property.mutable) {
                setValue(plt, elm, memberName, newValue, perf);
            }
            else {
                console.warn(`@Prop() "${memberName}" on "${elm.tagName}" cannot be modified.`);
            }
        }
    }
    if ((property.type) || (property.state)) {
        const values = plt.valuesMap.get(elm);
        if ((!property.state) && (true)) {
            if (property.attr && (values[memberName] === undefined || values[memberName] === '')) {
                // check the prop value from the host element attribute
                if ((hostAttributes = hostSnapshot && hostSnapshot.$attributes) && isDef(hostAttrValue = hostAttributes[property.attr])) {
                    // looks like we've got an attribute value
                    // let's set it to our internal values
                    values[memberName] = parsePropertyValue(property.type, hostAttrValue);
                }
            }
            {
                // server-side
                // server-side elm has the getter/setter
                // on the actual element instance, not its prototype
                // on the server we cannot accurately use "hasOwnProperty"
                // instead we'll do a direct lookup to see if the
                // constructor has this property
                if (elementHasProperty(plt, elm, memberName)) {
                    // @Prop or @Prop({mutable:true})
                    // property values on the host element should override
                    // any default values on the component instance
                    if (values[memberName] === undefined) {
                        values[memberName] = elm[memberName];
                    }
                }
            }
        }
        if (instance.hasOwnProperty(memberName) && values[memberName] === undefined) {
            // @Prop() or @Prop({mutable:true}) or @State()
            // we haven't yet got a value from the above checks so let's
            // read any "own" property instance values already set
            // to our internal value as the source of getter data
            // we're about to define a property and it'll overwrite this "own" property
            values[memberName] = instance[memberName];
        }
        {
            if (property.watchCallbacks) {
                values[WATCH_CB_PREFIX + memberName] = property.watchCallbacks.slice();
            }
        }
        // add getter/setter to the component instance
        // these will be pointed to the internal data set from the above checks
        definePropertyGetterSetter(instance, memberName, getComponentProp, setComponentProp);
    }
    else if (property.elementRef) {
        // @Element()
        // add a getter to the element reference using
        // the member name the component meta provided
        definePropertyValue(instance, memberName, elm);
    }
    else if (property.method) {
        // @Method()
        // add a property "value" on the host element
        // which we'll bind to the instance's method
        definePropertyValue(elm, memberName, instance[memberName].bind(instance));
    }
    else if (property.context) {
        // @Prop({ context: 'config' })
        const contextObj = plt.getContextItem(property.context);
        if (contextObj !== undefined) {
            definePropertyValue(instance, memberName, (contextObj.getContext && contextObj.getContext(elm)) || contextObj);
        }
    }
    else if (property.connect) {
        // @Prop({ connect: 'ion-loading-ctrl' })
        definePropertyValue(instance, memberName, plt.propConnect(property.connect));
    }
};
const setValue = (plt, elm, memberName, newVal, perf, instance, values) => {
    // get the internal values object, which should always come from the host element instance
    // create the _values object if it doesn't already exist
    values = plt.valuesMap.get(elm);
    if (!values) {
        plt.valuesMap.set(elm, values = {});
    }
    const oldVal = values[memberName];
    // check our new property value against our internal value
    if (newVal !== oldVal) {
        // gadzooks! the property's value has changed!!
        // set our new value!
        // https://youtu.be/dFtLONl4cNc?t=22
        values[memberName] = newVal;
        instance = plt.instanceMap.get(elm);
        if (instance) {
            // get an array of method names of watch functions to call
            {
                const watchMethods = values[WATCH_CB_PREFIX + memberName];
                if (watchMethods) {
                    // this instance is watching for when this property changed
                    for (let i = 0; i < watchMethods.length; i++) {
                        try {
                            // fire off each of the watch methods that are watching this property
                            instance[watchMethods[i]].call(instance, newVal, oldVal, memberName);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
            if (!plt.activeRender && elm['s-rn']) {
                // looks like this value actually changed, so we've got work to do!
                // but only if we've already rendered, otherwise just chill out
                // queue that we need to do an update, but don't worry about queuing
                // up millions cuz this function ensures it only runs once
                queueUpdate(plt, elm, perf);
            }
        }
    }
};
const definePropertyValue = (obj, propertyKey, value) => {
    // minification shortcut
    Object.defineProperty(obj, propertyKey, {
        configurable: true,
        value
    });
};
const definePropertyGetterSetter = (obj, propertyKey, get, set) => {
    // minification shortcut
    Object.defineProperty(obj, propertyKey, {
        configurable: true,
        get,
        set
    });
};
const WATCH_CB_PREFIX = `wc-`;

const proxyComponentInstance = (plt, cmpConstructor, elm, instance, hostSnapshot, perf) => {
    // at this point we've got a specific node of a host element, and created a component class instance
    // and we've already created getters/setters on both the host element and component class prototypes
    // let's upgrade any data that might have been set on the host element already
    // and let's have the getters/setters kick in and do their jobs
    // let's automatically add a reference to the host element on the instance
    plt.hostElementMap.set(instance, elm);
    // create the values object if it doesn't already exist
    // this will hold all of the internal getter/setter values
    if (!plt.valuesMap.has(elm)) {
        plt.valuesMap.set(elm, {});
    }
    // get the properties from the constructor
    // and add default "mode" and "color" properties
    Object.entries(Object.assign({ color: { type: String } }, cmpConstructor.properties, { mode: { type: String } })).forEach(([memberName, property]) => {
        // define each of the members and initialize what their role is
        defineMember(plt, property, elm, instance, memberName, hostSnapshot, perf);
    });
};

const initComponentInstance = (plt, elm, hostSnapshot, perf, instance, componentConstructor, queuedEvents, i) => {
    try {
        // using the user's component class, let's create a new instance
        componentConstructor = plt.getComponentMeta(elm).componentConstructor;
        instance = new componentConstructor();
        // ok cool, we've got an host element now, and a actual instance
        // and there were no errors creating the instance
        // let's upgrade the data on the host element
        // and let the getters/setters do their jobs
        proxyComponentInstance(plt, componentConstructor, elm, instance, hostSnapshot, perf);
        {
            // add each of the event emitters which wire up instance methods
            // to fire off dom events from the host element
            initEventEmitters(plt, componentConstructor.events, instance);
        }
        {
            try {
                // replay any event listeners on the instance that
                // were queued up between the time the element was
                // connected and before the instance was ready
                queuedEvents = plt.queuedEvents.get(elm);
                if (queuedEvents) {
                    // events may have already fired before the instance was even ready
                    // now that the instance is ready, let's replay all of the events that
                    // we queued up earlier that were originally meant for the instance
                    for (i = 0; i < queuedEvents.length; i += 2) {
                        // data was added in sets of two
                        // first item the eventMethodName
                        // second item is the event data
                        // take a look at initElementListener()
                        instance[queuedEvents[i]](queuedEvents[i + 1]);
                    }
                    plt.queuedEvents.delete(elm);
                }
            }
            catch (e) {
                plt.onError(e, 2 /* QueueEventsError */, elm);
            }
        }
    }
    catch (e) {
        // something done went wrong trying to create a component instance
        // create a dumby instance so other stuff can load
        // but chances are the app isn't fully working cuz this component has issues
        instance = {};
        plt.onError(e, 7 /* InitInstanceError */, elm, true);
    }
    plt.instanceMap.set(elm, instance);
    return instance;
};
const initComponentLoaded = (plt, elm, hydratedCssClass, perf, instance, onReadyCallbacks, hasCmpLoaded) => {
    // all is good, this component has been told it's time to finish loading
    // it's possible that we've already decided to destroy this element
    // check if this element has any actively loading child elements
    if ((instance = plt.instanceMap.get(elm)) &&
        !plt.isDisconnectedMap.has(elm) &&
        (!elm['s-ld'] || !elm['s-ld'].length)) {
        // cool, so at this point this element isn't already being destroyed
        // and it does not have any child elements that are still loading
        // all of this element's children have loaded (if any)
        plt.isCmpReady.set(elm, true);
        if (!(hasCmpLoaded = plt.isCmpLoaded.has(elm))) {
            // remember that this component has loaded
            // isCmpLoaded map is useful to know if we should fire
            // the lifecycle componentDidLoad() or componentDidUpdate()
            plt.isCmpLoaded.set(elm, true);
            // ensure we remove any child references cuz it doesn't matter at this point
            elm['s-ld'] = undefined;
            // add the css class that this element has officially hydrated
            plt.domApi.$addClass(elm, hydratedCssClass);
        }
        try {
            // fire off the ref if it exists
            callNodeRefs(plt.vnodeMap.get(elm));
            // fire off the user's elm.componentOnReady() callbacks that were
            // put directly on the element (well before anything was ready)
            if (onReadyCallbacks = plt.onReadyCallbacksMap.get(elm)) {
                onReadyCallbacks.forEach(cb => cb(elm));
                plt.onReadyCallbacksMap.delete(elm);
            }
            if (!hasCmpLoaded && instance.componentDidLoad) {
                instance.componentDidLoad();
            }
            else if (hasCmpLoaded && instance.componentDidUpdate) {
                instance.componentDidUpdate();
            }
        }
        catch (e) {
            plt.onError(e, 4 /* DidLoadError */, elm);
        }
        // ( •_•)
        // ( •_•)>⌐■-■
        // (⌐■_■)
        // load events fire from bottom to top
        // the deepest elements load first then bubbles up
        propagateComponentReady(plt, elm);
    }
};
const propagateComponentReady = (plt, elm, index, ancestorsActivelyLoadingChildren, ancestorHostElement, cb) => {
    // we're no longer processing this component
    plt.processingCmp.delete(elm);
    // load events fire from bottom to top
    // the deepest elements load first then bubbles up
    if ((ancestorHostElement = plt.ancestorHostElementMap.get(elm))) {
        // ok so this element already has a known ancestor host element
        // let's make sure we remove this element from its ancestor's
        // known list of child elements which are actively loading
        ancestorsActivelyLoadingChildren = ancestorHostElement['s-ld'];
        if (ancestorsActivelyLoadingChildren) {
            index = ancestorsActivelyLoadingChildren.indexOf(elm);
            if (index > -1) {
                // yup, this element is in the list of child elements to wait on
                // remove it so we can work to get the length down to 0
                ancestorsActivelyLoadingChildren.splice(index, 1);
            }
            // the ancestor's initLoad method will do the actual checks
            // to see if the ancestor is actually loaded or not
            // then let's call the ancestor's initLoad method if there's no length
            // (which actually ends up as this method again but for the ancestor)
            if (!ancestorsActivelyLoadingChildren.length) {
                ancestorHostElement['s-init'] && ancestorHostElement['s-init']();
            }
        }
        plt.ancestorHostElementMap.delete(elm);
    }
    if (plt.onAppReadyCallbacks.length && !plt.processingCmp.size) {
        // we've got some promises waiting on the entire app to be done processing
        // so it should have an empty queue and no longer rendering
        while ((cb = plt.onAppReadyCallbacks.shift())) {
            cb();
        }
    }
};

const disconnectedCallback = (plt, elm, perf) => {
    // only disconnect if we're not temporarily disconnected
    // tmpDisconnected will happen when slot nodes are being relocated
    if (!plt.tmpDisconnected && isDisconnected(plt.domApi, elm)) {
        // ok, let's officially destroy this thing
        // set this to true so that any of our pending async stuff
        // doesn't continue since we already decided to destroy this node
        // elm._hasDestroyed = true;
        plt.isDisconnectedMap.set(elm, true);
        // double check that we've informed the ancestor host elements
        // that they're good to go and loaded (cuz this one is on its way out)
        propagateComponentReady(plt, elm);
        // since we're disconnecting, call all of the JSX ref's with null
        callNodeRefs(plt.vnodeMap.get(elm), true);
        {
            // call instance componentDidUnload
            // if we've created an instance for this
            const instance = plt.instanceMap.get(elm);
            if (instance && instance.componentDidUnload) {
                // call the user's componentDidUnload if there is one
                instance.componentDidUnload();
            }
        }
        // detatch any event listeners that may have been added
        // because we're not passing an exact event name it'll
        // remove all of this element's event, which is good
        plt.domApi.$removeEventListener(elm);
        plt.hasListenersMap.delete(elm);
        // clear CSS var-shim tracking
        if (plt.customStyle) {
            plt.customStyle.removeHost(elm);
        }
        // clear any references to other elements
        // more than likely we've already deleted these references
        // but let's double check there pal
        [
            plt.ancestorHostElementMap,
            plt.onReadyCallbacksMap,
            plt.hostSnapshotMap
        ].forEach(wm => wm.delete(elm));
    }
};
const isDisconnected = (domApi, elm) => {
    while (elm) {
        if (!domApi.$parentNode(elm)) {
            return domApi.$nodeType(elm) !== 9 /* DocumentNode */;
        }
        elm = domApi.$parentNode(elm);
    }
};

function hmrStart(plt, cmpMeta, elm, hmrVersionId) {
    // ¯\_(ツ)_/¯
    // keep the existing state
    // forget the constructor
    cmpMeta.componentConstructor = null;
    // no sir, this component has never loaded, not once, ever
    plt.isCmpLoaded.delete(elm);
    plt.isCmpReady.delete(elm);
    // forget the instance
    const instance = plt.instanceMap.get(elm);
    if (instance) {
        plt.hostElementMap.delete(instance);
        plt.instanceMap.delete(elm);
    }
    // detatch any event listeners that may have been added
    // because we're not passing an exact event name it'll
    // remove all of this element's event, which is good
    plt.domApi.$removeEventListener(elm);
    plt.hasListenersMap.delete(elm);
    cmpMeta.listenersMeta = null;
    // create a callback for when this component finishes hmr
    elm['s-hmr-load'] = () => {
        // finished hmr for this element
        delete elm['s-hmr-load'];
        hmrFinish(plt, cmpMeta, elm);
    };
    // create the new host snapshot from the element
    plt.hostSnapshotMap.set(elm, initHostSnapshot(plt.domApi, cmpMeta, elm));
    // request the bundle again
    plt.requestBundle(cmpMeta, elm, hmrVersionId);
}
function hmrFinish(plt, cmpMeta, elm) {
    if (!plt.hasListenersMap.has(elm)) {
        plt.hasListenersMap.set(elm, true);
        // initElementListeners works off of cmp metadata
        // but we just got new data from the constructor
        // so let's update the cmp metadata w/ constructor listener data
        if (cmpMeta.componentConstructor && cmpMeta.componentConstructor.listeners) {
            cmpMeta.listenersMeta = cmpMeta.componentConstructor.listeners.map(lstn => {
                const listenerMeta = {
                    eventMethodName: lstn.method,
                    eventName: lstn.name,
                    eventCapture: !!lstn.capture,
                    eventPassive: !!lstn.passive,
                    eventDisabled: !!lstn.disabled,
                };
                return listenerMeta;
            });
            initElementListeners(plt, elm);
        }
    }
}

const proxyHostElementPrototype = (plt, membersEntries, hostPrototype, perf) => {
    // create getters/setters on the host element prototype to represent the public API
    // the setters allows us to know when data has changed so we can re-render
    {
        // in just a server-side build
        // let's set the properties to the values immediately
        let values = plt.valuesMap.get(hostPrototype);
        if (!values) {
            plt.valuesMap.set(hostPrototype, values = {});
        }
        membersEntries.forEach(([memberName, member]) => {
            const memberType = member.memberType;
            if (memberType & (1 /* Prop */ | 2 /* PropMutable */)) {
                values[memberName] = hostPrototype[memberName];
            }
        });
    }
    membersEntries.forEach(([memberName, member]) => {
        // add getters/setters
        const memberType = member.memberType;
        if ((memberType & (1 /* Prop */ | 2 /* PropMutable */)) && (true)) {
            // @Prop() or @Prop({ mutable: true })
            definePropertyGetterSetter(hostPrototype, memberName, function getHostElementProp() {
                // host element getter (cannot be arrow fn)
                // yup, ugly, srynotsry
                return (plt.valuesMap.get(this) || {})[memberName];
            }, function setHostElementProp(newValue) {
                // host element setter (cannot be arrow fn)
                setValue(plt, this, memberName, parsePropertyValue(member.propType, newValue), perf);
            });
        }
        else if (memberType === 32 /* Method */) {
            // @Method()
            // add a placeholder noop value on the host element's prototype
            // incase this method gets called before setup
            definePropertyValue(hostPrototype, memberName, noop);
        }
    });
};

const initHostElement = (plt, cmpMeta, HostElementConstructor, hydratedCssClass, perf) => {
    // let's wire up our functions to the host element's prototype
    // we can also inject our platform into each one that needs that api
    // note: these cannot be arrow functions cuz "this" is important here hombre
    HostElementConstructor.connectedCallback = function () {
        // coolsville, our host element has just hit the DOM
        connectedCallback(plt, cmpMeta, this, perf);
    };
    HostElementConstructor.disconnectedCallback = function () {
        // the element has left the builing
        disconnectedCallback(plt, this, perf);
    };
    HostElementConstructor['s-init'] = function () {
        initComponentLoaded(plt, this, hydratedCssClass, perf);
    };
    HostElementConstructor.forceUpdate = function () {
        queueUpdate(plt, this, perf);
    };
    {
        HostElementConstructor['s-hmr'] = function (hmrVersionId) {
            hmrStart(plt, cmpMeta, this, hmrVersionId);
        };
    }
    if (cmpMeta.membersMeta) {
        const entries = Object.entries(cmpMeta.membersMeta);
        {
            let attrToProp = {};
            entries.forEach(([propName, { attribName }]) => {
                if (attribName) {
                    attrToProp[attribName] = propName;
                }
            });
            attrToProp = Object.assign({}, attrToProp);
            HostElementConstructor.attributeChangedCallback = function (attribName, _oldVal, newVal) {
                // the browser has just informed us that an attribute
                // on the host element has changed
                attributeChangedCallback(attrToProp, this, attribName, newVal);
            };
        }
        // add getters/setters to the host element members
        // these would come from the @Prop and @Method decorators that
        // should create the public API to this component
        proxyHostElementPrototype(plt, entries, HostElementConstructor, perf);
    }
};

function connectChildElements(config, plt, App, hydrateResults, parentElm, perf) {
    if (parentElm && parentElm.children) {
        for (let i = 0; i < parentElm.children.length; i++) {
            connectElement(config, plt, App, hydrateResults, parentElm.children[i], perf);
            connectChildElements(config, plt, App, hydrateResults, parentElm.children[i], perf);
        }
    }
}
function connectElement(config, plt, App, hydrateResults, elm, perf) {
    if (!plt.hasConnectedMap.has(elm)) {
        const tagName = elm.tagName.toLowerCase();
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta) {
            connectHostElement(config, plt, App, hydrateResults, elm, cmpMeta, perf);
        }
        else if (tagName === 'script') {
            connectScriptElement(hydrateResults, elm);
        }
        else if (tagName === 'link') {
            connectLinkElement(hydrateResults, elm);
        }
        else if (tagName === 'img') {
            connectImgElement(hydrateResults, elm);
        }
        plt.hasConnectedMap.set(elm, true);
    }
}
function connectHostElement(config, plt, App, hydrateResults, elm, cmpMeta, perf) {
    const hostSnapshot = initHostSnapshot(plt.domApi, cmpMeta, elm);
    plt.hostSnapshotMap.set(elm, hostSnapshot);
    if (!cmpMeta.componentConstructor) {
        plt.requestBundle(cmpMeta, elm);
    }
    if (cmpMeta.encapsulationMeta !== 1 /* ShadowDom */) {
        initHostElement(plt, cmpMeta, elm, config.hydratedCssClass, perf);
        connectedCallback(plt, cmpMeta, elm, perf);
    }
    connectComponentOnReady(App, elm);
    const depth = getNodeDepth(elm);
    const cmp = hydrateResults.components.find(c => c.tag === cmpMeta.tagNameMeta);
    if (cmp) {
        cmp.count++;
        if (depth > cmp.depth) {
            cmp.depth = depth;
        }
    }
    else {
        hydrateResults.components.push({
            tag: cmpMeta.tagNameMeta,
            count: 1,
            depth: depth
        });
    }
}
function connectComponentOnReady(App, elm) {
    elm.componentOnReady = function componentOnReady() {
        return new Promise(resolve => {
            App.componentOnReady(elm, resolve);
        });
    };
}
function connectScriptElement(hydrateResults, elm) {
    const src = elm.src;
    if (src && hydrateResults.scriptUrls.indexOf(src) === -1) {
        hydrateResults.scriptUrls.push(src);
    }
}
function connectLinkElement(hydrateResults, elm) {
    const href = elm.href;
    const rel = (elm.rel || '').toLowerCase();
    if (rel === 'stylesheet' && href && hydrateResults.styleUrls.indexOf(href) === -1) {
        hydrateResults.styleUrls.push(href);
    }
}
function connectImgElement(hydrateResults, elm) {
    const src = elm.src;
    if (src && hydrateResults.imgUrls.indexOf(src) === -1) {
        hydrateResults.imgUrls.push(src);
    }
}
function getNodeDepth(elm) {
    let depth = 0;
    while (elm.parentNode) {
        depth++;
        elm = elm.parentNode;
    }
    return depth;
}

const createDomApi = (App, win, doc) => {
    // using the $ prefix so that closure is
    // cool with property renaming each of these
    const unregisterListenerFns = new WeakMap();
    const domApi = {
        $doc: doc,
        $supportsShadowDom: !!doc.documentElement.attachShadow,
        $supportsEventOptions: false,
        $nodeType: (node) => node.nodeType,
        $createElement: (tagName) => doc.createElement(tagName),
        $createElementNS: (namespace, tagName) => doc.createElementNS(namespace, tagName),
        $createTextNode: (text) => doc.createTextNode(text),
        $createComment: (data) => doc.createComment(data),
        $insertBefore: (parentNode, childNode, referenceNode) => parentNode.insertBefore(childNode, referenceNode),
        // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
        // and it's polyfilled in es5 builds
        $remove: (node) => node.remove(),
        $appendChild: (parentNode, childNode) => parentNode.appendChild(childNode),
        $addClass: (elm, cssClass) => {
            {
                elm.classList.add(cssClass);
            }
        },
        $childNodes: (node) => node.childNodes,
        $parentNode: (node) => node.parentNode,
        $nextSibling: (node) => node.nextSibling,
        $previousSibling: (node) => node.previousSibling,
        $tagName: (elm) => toLowerCase(elm.nodeName),
        $getTextContent: (node) => node.textContent,
        $setTextContent: (node, text) => node.textContent = text,
        $getAttribute: (elm, key) => elm.getAttribute(key),
        $setAttribute: (elm, key, val) => elm.setAttribute(key, val),
        $removeAttribute: (elm, key) => elm.removeAttribute(key),
        $hasAttribute: (elm, key) => elm.hasAttribute(key),
        $getMode: (elm) => elm.getAttribute('mode') || (App.Context || {}).mode,
        $elementRef: (elm, referenceName) => {
            if (referenceName === 'child') {
                return elm.firstElementChild;
            }
            if (referenceName === 'parent') {
                return domApi.$parentElement(elm);
            }
            if (referenceName === 'body') {
                return doc.body;
            }
            if (referenceName === 'document') {
                return doc;
            }
            if (referenceName === 'window') {
                return win;
            }
            return elm;
        },
        $addEventListener: (assignerElm, eventName, listenerCallback, assignerId, useCapture, usePassive, attachTo, eventListenerOpts, splt, assignersEventName) => {
            // remember the original name before we possibly change it
            let attachToElm = assignerElm;
            let eventListener = listenerCallback;
            // get the existing unregister listeners for
            // this element from the unregister listeners weakmap
            let assignersUnregListeners = unregisterListenerFns.get(assignerElm);
            assignersEventName = eventName + assignerId;
            if (assignersUnregListeners && assignersUnregListeners[assignersEventName]) {
                // removed any existing listeners for this event for the assigner element
                // this element already has this listener, so let's unregister it now
                assignersUnregListeners[assignersEventName]();
            }
            if (typeof attachTo === 'string') {
                // attachTo is a string, and is probably something like
                // "parent", "window", or "document"
                // and the eventName would be like "mouseover" or "mousemove"
                attachToElm = domApi.$elementRef(assignerElm, attachTo);
            }
            else if (typeof attachTo === 'object') {
                // we were passed in an actual element to attach to
                attachToElm = attachTo;
            }
            else {
                // depending on the event name, we could actually be attaching
                // this element to something like the document or window
                splt = eventName.split(':');
                if (splt.length > 1) {
                    // document:mousemove
                    // parent:touchend
                    // body:keyup.enter
                    attachToElm = domApi.$elementRef(assignerElm, splt[0]);
                    eventName = splt[1];
                }
            }
            if (attachToElm) {
                // somehow we're referencing an element that doesn't exist
                // let's not continue
                {
                    // test to see if we're looking for an exact keycode
                    splt = eventName.split('.');
                    if (splt.length > 1) {
                        // looks like this listener is also looking for a keycode
                        // keyup.enter
                        eventName = splt[0];
                        eventListener = (ev) => {
                            // wrap the user's event listener with our own check to test
                            // if this keyboard event has the keycode they're looking for
                            if (ev.keyCode === KEY_CODE_MAP[splt[1]]) {
                                listenerCallback(ev);
                            }
                        };
                    }
                }
                // create the actual event listener options to use
                // this browser may not support event options
                eventListenerOpts = domApi.$supportsEventOptions ? {
                    capture: !!useCapture,
                    passive: !!usePassive
                } : !!useCapture;
                // ok, good to go, let's add the actual listener to the dom element
                App.ael(attachToElm, eventName, eventListener, eventListenerOpts);
                if (!assignersUnregListeners) {
                    // we don't already have a collection, let's create it
                    unregisterListenerFns.set(assignerElm, assignersUnregListeners = {});
                }
                // add the unregister listener to this element's collection
                assignersUnregListeners[assignersEventName] = () => {
                    // looks like it's time to say goodbye
                    attachToElm && App.rel(attachToElm, eventName, eventListener, eventListenerOpts);
                    assignersUnregListeners[assignersEventName] = null;
                };
            }
        },
        $removeEventListener: (elm, eventName, assignerId, assignersUnregListeners) => {
            // get the unregister listener functions for this element
            if ((assignersUnregListeners = unregisterListenerFns.get(elm))) {
                // this element has unregister listeners
                if (eventName) {
                    // passed in one specific event name to remove
                    assignersUnregListeners[eventName + assignerId] && assignersUnregListeners[eventName + assignerId]();
                }
                else {
                    // remove all event listeners
                    Object.keys(assignersUnregListeners).forEach(assignersEventName => {
                        assignersUnregListeners[assignersEventName] && assignersUnregListeners[assignersEventName]();
                    });
                }
            }
        },
        $dispatchEvent: (elm, eventName, data, e) => {
            // create and return the custom event, allows for cancel checks
            e = new win.CustomEvent(eventName, data);
            elm && elm.dispatchEvent(e);
            return e;
        },
        $parentElement: (elm, parentNode) => 
        // if the parent node is a document fragment (shadow root)
        // then use the "host" property on it
        // otherwise use the parent node
        ((parentNode = domApi.$parentNode(elm)) && domApi.$nodeType(parentNode) === 11 /* DocumentFragment */) ? parentNode.host : parentNode
    };
    {
        domApi.$setAttributeNS = (elm, namespaceURI, qualifiedName, val) => elm.setAttributeNS(namespaceURI, qualifiedName, val);
    }
    {
        domApi.$attachShadow = (elm, shadowRootInit) => elm.attachShadow(shadowRootInit);
    }
    {
        if (win.location.search.indexOf('shadow=false') > 0) {
            // by adding ?shadow=false it'll force the slot polyfill
            // only add this check when in dev mode
            domApi.$supportsShadowDom = false;
        }
    }
    if (!App.ael) {
        App.ael = (elm, eventName, cb, opts) => elm.addEventListener(eventName, cb, opts);
        App.rel = (elm, eventName, cb, opts) => elm.removeEventListener(eventName, cb, opts);
    }
    {
        // test if this browser supports event options or not
        try {
            win.addEventListener('e', null, Object.defineProperty({}, 'passive', {
                get: () => domApi.$supportsEventOptions = true
            }));
        }
        catch (e) { }
    }
    return domApi;
};

function createQueueServer() {
    const highPriority = [];
    const domReads = [];
    const domWrites = [];
    let queued = false;
    function flush(cb) {
        while (highPriority.length > 0) {
            highPriority.shift()(0);
        }
        while (domReads.length > 0) {
            domReads.shift()(0);
        }
        while (domWrites.length > 0) {
            domWrites.shift()(0);
        }
        queued = (highPriority.length > 0) || (domReads.length > 0) || (domWrites.length > 0);
        if (queued) {
            process.nextTick(flush);
        }
        cb && cb();
    }
    function clear() {
        highPriority.length = 0;
        domReads.length = 0;
        domWrites.length = 0;
    }
    return {
        tick: (cb) => {
            // queue high priority work to happen in next tick
            // uses Promise.resolve() for next tick
            highPriority.push(cb);
            if (!queued) {
                queued = true;
                process.nextTick(flush);
            }
        },
        read: (cb) => {
            // queue dom reads
            domReads.push(cb);
            if (!queued) {
                queued = true;
                process.nextTick(flush);
            }
        },
        write: (cb) => {
            // queue dom writes
            domWrites.push(cb);
            if (!queued) {
                queued = true;
                process.nextTick(flush);
            }
        },
        flush: flush,
        clear: clear
    };
}

function fillCmpMetaFromConstructor(cmp, cmpMeta) {
    if (!cmpMeta.tagNameMeta) {
        cmpMeta.tagNameMeta = cmp.is;
    }
    if (!cmpMeta.bundleIds) {
        cmpMeta.bundleIds = cmp.is;
    }
    cmpMeta.membersMeta = cmpMeta.membersMeta || {};
    if (!cmpMeta.membersMeta.color) {
        cmpMeta.membersMeta.color = {
            propType: 2 /* String */,
            attribName: 'color',
            memberType: 1 /* Prop */
        };
    }
    if (cmp.properties) {
        Object.keys(cmp.properties).forEach(memberName => {
            const property = cmp.properties[memberName];
            const memberMeta = cmpMeta.membersMeta[memberName] = {};
            if (property.state) {
                memberMeta.memberType = 16 /* State */;
            }
            else if (property.elementRef) {
                memberMeta.memberType = 64 /* Element */;
            }
            else if (property.method) {
                memberMeta.memberType = 32 /* Method */;
            }
            else if (property.connect) {
                memberMeta.memberType = 8 /* PropConnect */;
                memberMeta.ctrlId = property.connect;
            }
            else if (property.context) {
                memberMeta.memberType = 4 /* PropContext */;
                memberMeta.ctrlId = property.context;
            }
            else {
                if (property.type === String) {
                    memberMeta.propType = 2 /* String */;
                }
                else if (property.type === Boolean) {
                    memberMeta.propType = 4 /* Boolean */;
                }
                else if (property.type === Number) {
                    memberMeta.propType = 8 /* Number */;
                }
                else {
                    memberMeta.propType = 1 /* Any */;
                }
                if (property.attr) {
                    memberMeta.attribName = property.attr;
                }
                else {
                    memberMeta.attribName = memberName;
                }
                memberMeta.reflectToAttrib = !!property.reflectToAttr;
                if (property.mutable) {
                    memberMeta.memberType = 2 /* PropMutable */;
                }
                else {
                    memberMeta.memberType = 1 /* Prop */;
                }
            }
        });
    }
    if (cmp.listeners) {
        cmpMeta.listenersMeta = cmp.listeners.map(listener => {
            return {
                eventName: listener.name,
                eventMethodName: listener.method,
                eventCapture: listener.capture,
                eventDisabled: listener.disabled,
                eventPassive: listener.passive
            };
        });
    }
    return cmpMeta;
}

const initCoreComponentOnReady = (plt, App, win, apps, queuedComponentOnReadys, i) => {
    // add componentOnReady() to the App object
    // this also is used to know that the App's core is ready
    App.componentOnReady = (elm, resolve) => {
        if (!elm.nodeName.includes('-')) {
            resolve(null);
            return false;
        }
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta) {
            if (plt.isCmpReady.has(elm)) {
                // element has already loaded, pass the resolve the element component
                // so we know that the resolve knows it this element is an app component
                resolve(elm);
            }
            else {
                // element hasn't loaded yet or it has an update in progress
                // add this resolve specifically to this elements on ready queue
                const onReadyCallbacks = plt.onReadyCallbacksMap.get(elm) || [];
                onReadyCallbacks.push(resolve);
                plt.onReadyCallbacksMap.set(elm, onReadyCallbacks);
            }
        }
        // return a boolean if this app recognized this element or not
        return !!cmpMeta;
    };
    if (queuedComponentOnReadys) {
        // we've got some componentOnReadys in the queue before the app was ready
        for (i = queuedComponentOnReadys.length - 1; i >= 0; i--) {
            // go through each element and see if this app recongizes it
            if (App.componentOnReady(queuedComponentOnReadys[i][0], queuedComponentOnReadys[i][1])) {
                // turns out this element belongs to this app
                // remove the resolve from the queue so in the end
                // all that's left in the queue are elements not apart of any apps
                queuedComponentOnReadys.splice(i, 1);
            }
        }
        for (i = 0; i < apps.length; i++) {
            if (!win[apps[i]].componentOnReady) {
                // there is at least 1 apps that isn't ready yet
                // so let's stop here cuz there's still app cores loading
                return;
            }
        }
        // if we got to this point then that means all of the apps are ready
        // and they would have removed any of their elements from queuedComponentOnReadys
        // so let's do the cleanup of the  remaining queuedComponentOnReadys
        for (i = 0; i < queuedComponentOnReadys.length; i++) {
            // resolve any queued componentsOnReadys that are left over
            // since these elements were not apart of any apps
            // call the resolve fn, but pass null so it's know this wasn't a known app component
            queuedComponentOnReadys[i][1](null);
        }
        queuedComponentOnReadys.length = 0;
    }
};

function patchDomApi(config, plt, domApi, perf) {
    const orgCreateElement = domApi.$createElement;
    domApi.$createElement = (tagName) => {
        const elm = orgCreateElement(tagName);
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta && !cmpMeta.componentConstructor) {
            initHostElement(plt, cmpMeta, elm, config.namespace, perf);
            const hostSnapshot = initHostSnapshot(domApi, cmpMeta, elm);
            plt.hostSnapshotMap.set(elm, hostSnapshot);
            plt.requestBundle(cmpMeta, elm);
        }
        return elm;
    };
}

const proxyController = (domApi, controllerComponents, ctrlTag) => ({
    'create': proxyProp(domApi, controllerComponents, ctrlTag, 'create'),
    'componentOnReady': proxyProp(domApi, controllerComponents, ctrlTag, 'componentOnReady')
});
const proxyProp = (domApi, controllerComponents, ctrlTag, proxyMethodName) => function () {
    const args = arguments;
    return loadComponent(domApi, controllerComponents, ctrlTag)
        .then(ctrlElm => ctrlElm[proxyMethodName].apply(ctrlElm, args));
};
const loadComponent = (domApi, controllerComponents, ctrlTag, ctrlElm, body) => {
    ctrlElm = controllerComponents[ctrlTag];
    body = domApi.$doc.body;
    if (body) {
        if (!ctrlElm) {
            ctrlElm = body.querySelector(ctrlTag);
        }
        if (!ctrlElm) {
            ctrlElm = controllerComponents[ctrlTag] = domApi.$createElement(ctrlTag);
            domApi.$appendChild(body, ctrlElm);
        }
        return ctrlElm.componentOnReady();
    }
    return Promise.resolve();
};

function serverInitStyle(domApi, appliedStyleIds, cmpCtr) {
    if (!cmpCtr || !cmpCtr.style) {
        // no styles
        return;
    }
    const styleId = cmpCtr.is + (cmpCtr.styleMode || DEFAULT_STYLE_MODE);
    if (appliedStyleIds.has(styleId)) {
        // already initialized
        return;
    }
    appliedStyleIds.add(styleId);
    const styleElm = domApi.$createElement('style');
    styleElm.setAttribute('data-styles', '');
    styleElm.innerHTML = cmpCtr.style;
    domApi.$appendChild(domApi.$doc.head, styleElm);
}
function serverAttachStyles(plt, appliedStyleIds, cmpMeta, hostElm) {
    const shouldScopeCss = (cmpMeta.encapsulationMeta === 2 /* ScopedCss */ || (cmpMeta.encapsulationMeta === 1 /* ShadowDom */ && !plt.domApi.$supportsShadowDom));
    // create the style id w/ the host element's mode
    const styleModeId = cmpMeta.tagNameMeta + hostElm.mode;
    if (shouldScopeCss) {
        hostElm['s-sc'] = getScopeId(cmpMeta, hostElm.mode);
    }
    if (!appliedStyleIds.has(styleModeId)) {
        // doesn't look like there's a style template with the mode
        // create the style id using the default style mode and try again
        if (shouldScopeCss) {
            hostElm['s-sc'] = getScopeId(cmpMeta);
        }
    }
}

function createPlatformServer(config, outputTarget, win, doc, App, cmpRegistry, diagnostics, isPrerender, compilerCtx) {
    const loadedBundles = {};
    const appliedStyleIds = new Set();
    const controllerComponents = {};
    const domApi = createDomApi(App, win, doc);
    const perf = { mark: noop, measure: noop };
    // init build context
    compilerCtx = compilerCtx || {};
    // the root <html> element is always the top level registered component
    cmpRegistry = Object.assign({ 'html': {} }, cmpRegistry);
    // initialize Core global object
    const Context = {};
    Context.enableListener = (instance, eventName, enabled, attachTo, passive) => enableEventListener(plt, instance, eventName, enabled, attachTo, passive);
    Context.emit = (elm, eventName, data) => domApi.$dispatchEvent(elm, Context.eventNameFn ? Context.eventNameFn(eventName) : eventName, data);
    Context.isClient = false;
    Context.isServer = true;
    Context.isPrerender = isPrerender;
    Context.window = win;
    Context.location = win.location;
    Context.document = doc;
    // add the Core global to the window context
    // Note: "Core" is not on the window context on the client-side
    win.Context = Context;
    // add the h() fn to the app's global namespace
    App.h = h;
    App.Context = Context;
    // add the app's global to the window context
    win[config.namespace] = App;
    const appBuildDir = getAppBuildDir(config, outputTarget);
    Context.resourcesUrl = Context.publicPath = appBuildDir;
    // create the sandboxed context with a new instance of a V8 Context
    // V8 Context provides an isolated global environment
    config.sys.vm.createContext(compilerCtx, outputTarget, win);
    // execute the global scripts (if there are any)
    runGlobalScripts();
    // internal id increment for unique ids
    let ids = 0;
    // create the platform api which is used throughout common core code
    const plt = {
        attachStyles: noop,
        defineComponent,
        domApi,
        emitEvent: Context.emit,
        getComponentMeta,
        getContextItem,
        isDefinedComponent,
        onError,
        activeRender: false,
        isAppLoaded: false,
        nextId: () => config.namespace + (ids++),
        propConnect,
        queue: (Context.queue = createQueueServer()),
        requestBundle: requestBundle,
        tmpDisconnected: false,
        ancestorHostElementMap: new WeakMap(),
        componentAppliedStyles: new WeakMap(),
        hasConnectedMap: new WeakMap(),
        hasListenersMap: new WeakMap(),
        isCmpLoaded: new WeakMap(),
        isCmpReady: new WeakMap(),
        hostElementMap: new WeakMap(),
        hostSnapshotMap: new WeakMap(),
        instanceMap: new WeakMap(),
        isDisconnectedMap: new WeakMap(),
        isQueuedForUpdate: new WeakMap(),
        onReadyCallbacksMap: new WeakMap(),
        queuedEvents: new WeakMap(),
        vnodeMap: new WeakMap(),
        valuesMap: new WeakMap(),
        processingCmp: new Set(),
        onAppReadyCallbacks: []
    };
    // create a method that returns a promise
    // which gets resolved when the app's queue is empty
    // and app is idle, works for both initial load and updates
    App.onReady = () => new Promise(resolve => plt.queue.write(() => plt.processingCmp.size ? plt.onAppReadyCallbacks.push(resolve) : resolve()));
    // patch dom api like createElement()
    patchDomApi(config, plt, domApi, perf);
    // create the renderer which will be used to patch the vdom
    plt.render = createRendererPatch(plt, domApi);
    // patch the componentOnReady fn
    initCoreComponentOnReady(plt, App);
    // setup the root node of all things
    // which is the mighty <html> tag
    const rootElm = domApi.$doc.documentElement;
    rootElm['s-ld'] = [];
    rootElm['s-rn'] = true;
    rootElm['s-init'] = function appLoadedCallback() {
        plt.isCmpReady.set(rootElm, true);
        appLoaded();
    };
    function appLoaded(failureDiagnostic) {
        if (plt.isCmpReady.has(rootElm) || failureDiagnostic) {
            // the root node has loaded
            plt.onAppLoad && plt.onAppLoad(rootElm, failureDiagnostic);
        }
    }
    function getComponentMeta(elm) {
        // registry tags are always lower-case
        return cmpRegistry[elm.nodeName.toLowerCase()];
    }
    function defineComponent(cmpMeta) {
        // default mode and color props
        cmpRegistry[cmpMeta.tagNameMeta] = cmpMeta;
    }
    function setLoadedBundle(bundleId, value) {
        loadedBundles[bundleId] = value;
    }
    function getLoadedBundle(bundleId) {
        if (bundleId == null) {
            return null;
        }
        return loadedBundles[bundleId.replace(/^\.\//, '')];
    }
    function isLoadedBundle(id) {
        if (id === 'exports' || id === 'require') {
            return true;
        }
        return !!getLoadedBundle(id);
    }
    /**
     * Execute a bundle queue item
     * @param name
     * @param deps
     * @param callback
     */
    function execBundleCallback(name, deps, callback) {
        const bundleExports = {};
        try {
            callback.apply(null, deps.map(d => {
                if (d === 'exports')
                    return bundleExports;
                if (d === 'require')
                    return userRequire;
                return getLoadedBundle(d);
            }));
        }
        catch (e) {
            onError(e, 1 /* LoadBundleError */, null, true);
        }
        // If name is undefined then this callback was fired by component callback
        if (name === undefined) {
            return;
        }
        setLoadedBundle(name, bundleExports);
        // If name contains chunk then this callback was associated with a dependent bundle loading
        // let's add a reference to the constructors on each components metadata
        // each key in moduleImports is a PascalCased tag name
        if (!name.startsWith('chunk')) {
            Object.keys(bundleExports).forEach(pascalCasedTagName => {
                const normalizedTagName = pascalCasedTagName.replace(/-/g, '').toLowerCase();
                const registryTags = Object.keys(cmpRegistry);
                for (let i = 0; i < registryTags.length; i++) {
                    const normalizedRegistryTag = registryTags[i].replace(/-/g, '').toLowerCase();
                    if (normalizedRegistryTag === normalizedTagName) {
                        const cmpMeta = cmpRegistry[toDashCase(pascalCasedTagName)];
                        if (cmpMeta) {
                            // connect the component's constructor to its metadata
                            const componentConstructor = bundleExports[pascalCasedTagName];
                            if (!cmpMeta.componentConstructor) {
                                fillCmpMetaFromConstructor(componentConstructor, cmpMeta);
                                if (!cmpMeta.componentConstructor) {
                                    cmpMeta.componentConstructor = componentConstructor;
                                }
                            }
                            serverInitStyle(domApi, appliedStyleIds, componentConstructor);
                        }
                        break;
                    }
                }
            });
        }
    }
    /**
     * This function is called anytime a JS file is loaded
     */
    function loadBundle(bundleId, [...dependentsList], importer) {
        const missingDependents = dependentsList.filter(d => !isLoadedBundle(d));
        missingDependents.forEach(d => {
            const fileName = d.replace('.js', '.es5.js');
            loadFile(fileName);
        });
        execBundleCallback(bundleId, dependentsList, importer);
    }
    App.loadBundle = loadBundle;
    function isDefinedComponent(elm) {
        return !!(cmpRegistry[elm.tagName.toLowerCase()]);
    }
    function userRequire(ids, resolve) {
        loadBundle(undefined, ids, resolve);
    }
    plt.attachStyles = (plt, _domApi, cmpMeta, hostElm) => {
        serverAttachStyles(plt, appliedStyleIds, cmpMeta, hostElm);
    };
    // This is executed by the component's connected callback.
    function requestBundle(cmpMeta, elm) {
        // set the "mode" property
        if (!elm.mode) {
            // looks like mode wasn't set as a property directly yet
            // first check if there's an attribute
            // next check the app's global
            elm.mode = domApi.$getAttribute(elm, 'mode') || Context.mode;
        }
        // It is possible the data was loaded from an outside source like tests
        if (cmpRegistry[cmpMeta.tagNameMeta].componentConstructor) {
            serverInitStyle(domApi, appliedStyleIds, cmpRegistry[cmpMeta.tagNameMeta].componentConstructor);
            queueUpdate(plt, elm, perf);
        }
        else {
            const bundleId = (typeof cmpMeta.bundleIds === 'string') ?
                cmpMeta.bundleIds :
                cmpMeta.bundleIds[elm.mode];
            if (isLoadedBundle(bundleId)) {
                // sweet, we've already loaded this bundle
                queueUpdate(plt, elm, perf);
            }
            else {
                const fileName = getComponentBundleFilename(cmpMeta, elm.mode);
                loadFile(fileName);
            }
        }
    }
    function loadFile(fileName) {
        const jsFilePath = config.sys.path.join(appBuildDir, fileName);
        const jsCode = compilerCtx.fs.readFileSync(jsFilePath);
        config.sys.vm.runInContext(jsCode, win);
    }
    function runGlobalScripts() {
        if (!compilerCtx || !compilerCtx.appFiles || !compilerCtx.appFiles.global) {
            return;
        }
        config.sys.vm.runInContext(compilerCtx.appFiles.global, win);
    }
    function onError(err, type, elm, appFailure) {
        const diagnostic = {
            type: 'runtime',
            header: 'Runtime error detected',
            level: 'error',
            messageText: err ? err.message ? err.message : err.toString() : ''
        };
        if (err && err.stack) {
            diagnostic.messageText += '\n' + err.stack;
            diagnostic.messageText = diagnostic.messageText.trim();
        }
        switch (type) {
            case 1 /* LoadBundleError */:
                diagnostic.header += ' while loading bundle';
                break;
            case 2 /* QueueEventsError */:
                diagnostic.header += ' while running initial events';
                break;
            case 3 /* WillLoadError */:
                diagnostic.header += ' during componentWillLoad()';
                break;
            case 4 /* DidLoadError */:
                diagnostic.header += ' during componentDidLoad()';
                break;
            case 7 /* InitInstanceError */:
                diagnostic.header += ' while initializing instance';
                break;
            case 8 /* RenderError */:
                diagnostic.header += ' while rendering';
                break;
            case 6 /* DidUpdateError */:
                diagnostic.header += ' while updating';
                break;
        }
        if (elm && elm.tagName) {
            diagnostic.header += ': ' + elm.tagName.toLowerCase();
        }
        diagnostics.push(diagnostic);
        if (appFailure) {
            appLoaded(diagnostic);
        }
    }
    function propConnect(ctrlTag) {
        return proxyController(domApi, controllerComponents, ctrlTag);
    }
    function getContextItem(contextKey) {
        return Context[contextKey];
    }
    return plt;
}
function getComponentBundleFilename(cmpMeta, modeName) {
    let bundleId = (typeof cmpMeta.bundleIds === 'string') ?
        cmpMeta.bundleIds :
        (cmpMeta.bundleIds[modeName] || cmpMeta.bundleIds[DEFAULT_STYLE_MODE]);
    if (cmpMeta.encapsulationMeta === 2 /* ScopedCss */ || cmpMeta.encapsulationMeta === 1 /* ShadowDom */) {
        bundleId += '.sc';
    }
    // server-side always uses es5 and jsonp callback modules
    bundleId += '.es5.entry.js';
    return bundleId;
}

function hydrateHtml(config, compilerCtx, outputTarget, cmpRegistry, opts, perf) {
    return new Promise(resolve => {
        // validate the hydrate options and add any missing info
        const hydrateTarget = normalizeHydrateOptions(outputTarget, opts);
        // create the results object we're gonna return
        const hydrateResults = generateHydrateResults(config, hydrateTarget);
        // create a emulated window
        // attach data the request to the window
        const dom = config.sys.createDom();
        const win = dom.parse(hydrateTarget);
        const doc = win.document;
        // normalize dir and lang before connecting elements
        // so that the info is their incase they read it at runtime
        normalizeDirection(doc, hydrateTarget);
        normalizeLanguage(doc, hydrateTarget);
        // create the app global
        const App = {};
        // create the platform
        const plt = createPlatformServer(config, hydrateTarget, win, doc, App, cmpRegistry, hydrateResults.diagnostics, hydrateTarget.isPrerender, compilerCtx);
        // fire off this function when the app has finished loading
        // and all components have finished hydrating
        plt.onAppLoad = (rootElm, failureDiagnostic) => __awaiter(this, void 0, void 0, function* () {
            if (config._isTesting) {
                hydrateResults.__testPlatform = plt;
            }
            if (failureDiagnostic) {
                hydrateResults.html = generateFailureDiagnostic(failureDiagnostic);
                dom.destroy();
                resolve(hydrateResults);
                return;
            }
            // all synchronous operations next
            if (rootElm) {
                try {
                    // optimize this document!!
                    yield optimizeHtml(config, compilerCtx, hydrateTarget, hydrateResults.url, doc, hydrateResults.diagnostics);
                    // gather up all of the <a> tag information in the doc
                    if (hydrateTarget.isPrerender && hydrateTarget.hydrateComponents) {
                        collectAnchors(config, doc, hydrateResults);
                    }
                    // serialize this dom back into a string
                    if (hydrateTarget.serializeHtml !== false) {
                        hydrateResults.html = dom.serialize();
                    }
                }
                catch (e) {
                    // gahh, something's up
                    hydrateResults.diagnostics.push({
                        level: 'error',
                        type: 'hydrate',
                        header: 'DOM Serialize',
                        messageText: e
                    });
                    // idk, some error, just use the original html
                    hydrateResults.html = hydrateTarget.html;
                }
            }
            if (hydrateTarget.destroyDom !== false) {
                // always destroy the dom unless told otherwise
                dom.destroy();
            }
            else {
                // we didn't destroy the dom
                // so let's return the root element
                hydrateResults.root = rootElm;
            }
            // cool, all good here, even if there are errors
            // we're passing back the result object
            resolve(hydrateResults);
        });
        if (hydrateTarget.hydrateComponents === false) {
            plt.onAppLoad(win.document.body);
            return;
        }
        // patch the render function that we can add SSR ids
        // and to connect any elements it may have just appened to the DOM
        let ssrIds = 0;
        const pltRender = plt.render;
        plt.render = function render(hostElm, oldVNode, newVNode, useNativeShadowDom, encapsulation) {
            let ssrId;
            let existingSsrId;
            if (hydrateTarget.ssrIds !== false) {
                // this may have been patched more than once
                // so reuse the ssr id if it already has one
                if (oldVNode && oldVNode.elm) {
                    existingSsrId = oldVNode.elm.getAttribute(SSR_VNODE_ID);
                }
                if (existingSsrId) {
                    ssrId = parseInt(existingSsrId, 10);
                }
                else {
                    ssrId = ssrIds++;
                }
            }
            useNativeShadowDom = false;
            newVNode = pltRender(hostElm, oldVNode, newVNode, useNativeShadowDom, encapsulation, ssrId);
            connectChildElements(config, plt, App, hydrateResults, newVNode.elm, perf);
            return newVNode;
        };
        // loop through each node and start connecting/hydrating
        // any elements that are host elements to components
        // this kicks off all the async hydrating
        connectChildElements(config, plt, App, hydrateResults, win.document.body, perf);
        if (hydrateResults.components.length === 0) {
            // what gives, never found ANY host elements to connect!
            // ok we're just done i guess, idk
            hydrateResults.html = hydrateTarget.html;
            resolve(hydrateResults);
        }
    });
}

function createAppRegistry(config) {
    // create the shared app registry object
    const appRegistry = {
        namespace: config.namespace,
        fsNamespace: config.fsNamespace,
        loader: `../${getLoaderFileName(config)}`
    };
    return appRegistry;
}
function getAppRegistry(config, compilerCtx, outputTarget) {
    const registryJsonFilePath = getRegistryJson(config, outputTarget);
    let appRegistry;
    try {
        // open up the app registry json file
        const appRegistryJson = compilerCtx.fs.readFileSync(registryJsonFilePath);
        // parse the json into app registry data
        appRegistry = JSON.parse(appRegistryJson);
    }
    catch (e) {
        throw new Error(`Error parsing app registry, ${registryJsonFilePath}: ${e}`);
    }
    return appRegistry;
}
function serializeComponentRegistry(cmpRegistry) {
    const appRegistryComponents = {};
    Object.keys(cmpRegistry).sort().forEach(tagName => {
        const cmpMeta = cmpRegistry[tagName];
        appRegistryComponents[tagName] = {
            bundleIds: cmpMeta.bundleIds
        };
        if (cmpMeta.encapsulationMeta === 1 /* ShadowDom */) {
            appRegistryComponents[tagName].encapsulation = 'shadow';
        }
        else if (cmpMeta.encapsulationMeta === 2 /* ScopedCss */) {
            appRegistryComponents[tagName].encapsulation = 'scoped';
        }
    });
    return appRegistryComponents;
}
function writeAppRegistry(config, compilerCtx, buildCtx, outputTarget, appRegistry, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        if (outputTarget.type === 'www') {
            appRegistry.components = serializeComponentRegistry(cmpRegistry);
            const registryJson = JSON.stringify(appRegistry, null, 2);
            // cache so we can check if it changed on rebuilds
            compilerCtx.appFiles.registryJson = registryJson;
            const appRegistryWWW = getRegistryJson(config, outputTarget);
            yield compilerCtx.fs.writeFile(appRegistryWWW, registryJson);
            const relPath = config.sys.path.relative(config.rootDir, appRegistryWWW);
            buildCtx.debug(`writeAppRegistry: ${relPath}`);
        }
    });
}

function loadComponentRegistry(config, compilerCtx, outputTarget) {
    const appRegistry = getAppRegistry(config, compilerCtx, outputTarget);
    const cmpRegistry = {};
    const tagNames = Object.keys(appRegistry.components);
    tagNames.forEach(tagName => {
        const reg = appRegistry.components[tagName];
        cmpRegistry[tagName] = {
            tagNameMeta: tagName,
            bundleIds: reg.bundleIds
        };
        if (reg.encapsulation === 'shadow') {
            cmpRegistry[tagName].encapsulationMeta = 1 /* ShadowDom */;
        }
        else if (reg.encapsulation === 'scoped') {
            cmpRegistry[tagName].encapsulationMeta = 2 /* ScopedCss */;
        }
    });
    return cmpRegistry;
}

function setBooleanConfig(config, configName, flagName, defaultValue) {
    if (flagName) {
        if (typeof config.flags[flagName] === 'boolean') {
            config[configName] = config.flags[flagName];
        }
    }
    const userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = !!config[userConfigName]();
    }
    if (typeof config[userConfigName] === 'boolean') {
        config[configName] = config[userConfigName];
    }
    else {
        config[configName] = defaultValue;
    }
}
function setNumberConfig(config, configName, _flagName, defaultValue) {
    const userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = config[userConfigName]();
    }
    if (typeof config[userConfigName] === 'number') {
        config[configName] = config[userConfigName];
    }
    else {
        config[configName] = defaultValue;
    }
}
function setStringConfig(config, configName, defaultValue) {
    const userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = config[userConfigName]();
    }
    if (typeof config[userConfigName] === 'string') {
        config[configName] = config[userConfigName];
    }
    else {
        config[configName] = defaultValue;
    }
}
function setArrayConfig(config, configName, defaultValue) {
    const userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = config[userConfigName]();
    }
    if (!Array.isArray(config[configName])) {
        if (Array.isArray(defaultValue)) {
            config[configName] = defaultValue.slice();
        }
        else {
            config[configName] = [];
        }
    }
}
function getUserConfigName(config, correctConfigName) {
    const userConfigNames = Object.keys(config);
    for (const userConfigName of userConfigNames) {
        if (userConfigName.toLowerCase() === correctConfigName.toLowerCase()) {
            if (userConfigName !== correctConfigName) {
                config.logger.warn(`config "${userConfigName}" should be "${correctConfigName}"`);
                return userConfigName;
            }
            break;
        }
    }
    return correctConfigName;
}

function validateAssetVerioning(config) {
    if (!config.assetVersioning) {
        config.assetVersioning = null;
        return;
    }
    if ((config.assetVersioning) === true) {
        config.assetVersioning = {};
    }
    const hashLength = config.hashedFileNameLength > 3 ? config.hashedFileNameLength : DEFAULTS.hashLength;
    setArrayConfig(config.assetVersioning, 'cssProperties', DEFAULTS.cssProperties);
    setNumberConfig(config.assetVersioning, 'hashLength', null, hashLength);
    setBooleanConfig(config.assetVersioning, 'queryMode', null, DEFAULTS.queryMode);
    setStringConfig(config.assetVersioning, 'prefix', DEFAULTS.separator);
    setStringConfig(config.assetVersioning, 'separator', DEFAULTS.separator);
    setBooleanConfig(config.assetVersioning, 'versionHtml', null, DEFAULTS.versionHtml);
    setBooleanConfig(config.assetVersioning, 'versionManifest', null, DEFAULTS.versionManifest);
    setBooleanConfig(config.assetVersioning, 'versionCssProperties', null, DEFAULTS.versionCssProperties);
}
const DEFAULTS = {
    cssProperties: ['background', 'background-url', 'url'],
    hashLength: 8,
    queryMode: false,
    pattern: '**/*.{css,js,png,jpg,jpeg,gif,svg,json,woff,woff2,ttf,eot}',
    prefix: '',
    separator: '.',
    versionHtml: true,
    versionManifest: true,
    versionCssProperties: true,
};

function validateCopy(config) {
    if (config.copy === null || config.copy === false) {
        // manually forcing to skip the copy task
        config.copy = null;
        return;
    }
    if (!Array.isArray(config.copy)) {
        config.copy = [];
    }
    if (!config.copy.some(c => c.src === DEFAULT_ASSETS.src)) {
        config.copy.push(DEFAULT_ASSETS);
    }
    if (!config.copy.some(c => c.src === DEFAULT_MANIFEST.src)) {
        config.copy.push(DEFAULT_MANIFEST);
    }
}
const DEFAULT_ASSETS = { src: 'assets', warn: false };
const DEFAULT_MANIFEST = { src: 'manifest.json', warn: false };

function validateDevServer(config) {
    if (config.devServer === false || config.devServer === null) {
        return config.devServer = null;
    }
    config.devServer = config.devServer || {};
    if (typeof config.flags.address === 'string') {
        config.devServer.address = config.flags.address;
    }
    else {
        setStringConfig(config.devServer, 'address', '0.0.0.0');
    }
    if (typeof config.flags.port === 'number') {
        config.devServer.port = config.flags.port;
    }
    else {
        setNumberConfig(config.devServer, 'port', null, 3333);
    }
    setBooleanConfig(config.devServer, 'gzip', null, true);
    setBooleanConfig(config.devServer, 'hotReplacement', null, true);
    setBooleanConfig(config.devServer, 'openBrowser', null, true);
    validateProtocol(config.devServer);
    if (config.devServer.historyApiFallback !== null && config.devServer.historyApiFallback !== false) {
        config.devServer.historyApiFallback = config.devServer.historyApiFallback || {};
        if (typeof config.devServer.historyApiFallback.index !== 'string') {
            config.devServer.historyApiFallback.index = 'index.html';
        }
        if (typeof config.devServer.historyApiFallback.disableDotRule !== 'boolean') {
            config.devServer.historyApiFallback.disableDotRule = false;
        }
    }
    if (config.flags && config.flags.open === false) {
        config.devServer.openBrowser = false;
    }
    let serveDir = null;
    let baseUrl = null;
    const wwwOutputTarget = config.outputTargets.find(o => o.type === 'www');
    if (wwwOutputTarget) {
        serveDir = wwwOutputTarget.dir;
        baseUrl = wwwOutputTarget.baseUrl;
        config.logger.debug(`dev server www root: ${serveDir}, base url: ${baseUrl}`);
    }
    else {
        serveDir = config.rootDir;
        if (config.flags && config.flags.serve) {
            config.logger.debug(`dev server missing www output target, serving root directory: ${serveDir}`);
        }
    }
    if (typeof baseUrl !== 'string') {
        baseUrl = `/`;
    }
    baseUrl = normalizePath(baseUrl);
    if (!baseUrl.startsWith('/')) {
        baseUrl = '/' + baseUrl;
    }
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }
    setStringConfig(config.devServer, 'root', serveDir);
    setStringConfig(config.devServer, 'baseUrl', baseUrl);
    if (!config.sys.path.isAbsolute(config.devServer.root)) {
        config.devServer.root = pathJoin(config, config.rootDir, config.devServer.root);
    }
    if (config.devServer.excludeHmr) {
        if (!Array.isArray(config.devServer.excludeHmr)) {
            config.logger.error(`dev server excludeHmr must be an array of glob strings`);
        }
    }
    else {
        config.devServer.excludeHmr = [];
    }
    return config.devServer;
}
function validateProtocol(devServer) {
    if (typeof devServer.protocol === 'string') {
        let protocol = devServer.protocol.trim().toLowerCase();
        protocol = protocol.replace(':', '').replace('/', '');
        devServer.protocol = protocol;
    }
    if (devServer.protocol !== 'http' && devServer.protocol !== 'https') {
        devServer.protocol = 'http';
    }
}

function validateNamespace$1(config) {
    setStringConfig(config, 'namespace', DEFAULT_NAMESPACE);
    config.namespace = config.namespace.trim();
    const invalidNamespaceChars = config.namespace.replace(/(\w)|(\-)|(\$)/g, '');
    if (invalidNamespaceChars !== '') {
        throw new Error(`Namespace "${config.namespace}" contains invalid characters: ${invalidNamespaceChars}`);
    }
    if (config.namespace.length < 3) {
        throw new Error(`Namespace "${config.namespace}" must be at least 3 characters`);
    }
    if (/^\d+$/.test(config.namespace.charAt(0))) {
        throw new Error(`Namespace "${config.namespace}" cannot have a number for the first character`);
    }
    if (config.namespace.charAt(0) === '-') {
        throw new Error(`Namespace "${config.namespace}" cannot have a dash for the first character`);
    }
    if (config.namespace.charAt(config.namespace.length - 1) === '-') {
        throw new Error(`Namespace "${config.namespace}" cannot have a dash for the last character`);
    }
    // the file system namespace is the one
    // used in filenames and seen in the url
    setStringConfig(config, 'fsNamespace', config.namespace.toLowerCase());
    if (config.namespace.includes('-')) {
        // convert to PascalCase
        // this is the same namespace that gets put on "window"
        config.namespace = dashToPascalCase(config.namespace);
    }
}
const DEFAULT_NAMESPACE = 'App';

/**
 * DEPRECATED "docs"
 * since 0.16.0, 2018-11-16
 */
function _deprecatedDocsConfig(config) {
    if (!config.outputTargets) {
        return;
    }
    let jsonFile = null;
    config.outputTargets = config.outputTargets.filter((outputTarget) => {
        if (outputTarget.type === 'docs') {
            if (typeof outputTarget.jsonFile === 'string') {
                jsonFile = outputTarget.jsonFile;
                delete outputTarget.jsonFile;
                config.logger.warn(`Stencil config docs outputTarget using the "jsonFile" property has been refactored as a new outputTarget type "docs-json". Please see the stencil docs for more information.`);
                return false;
            }
            if (typeof outputTarget.readmeDir === 'string') {
                outputTarget.dir = outputTarget.readmeDir;
                delete outputTarget.readmeDir;
                config.logger.warn(`Stencil config docs outputTarget using the "readmeDir" property has been rename to "dir". Please see the stencil docs for more information.`);
            }
        }
        return true;
    });
    if (typeof jsonFile === 'string' && jsonFile) {
        config.outputTargets.push({
            type: 'docs-json',
            file: jsonFile
        });
    }
}

function validateDocs(config) {
    _deprecatedDocsConfig(config);
    config.outputTargets = config.outputTargets || [];
    let buildDocs = !config.devMode;
    // json docs flag
    if (typeof config.flags.docsJson === 'string') {
        buildDocs = true;
        config.outputTargets.push({
            type: 'docs-json',
            file: config.flags.docsJson
        });
    }
    const jsonDocsOutputs = config.outputTargets.filter(o => o.type === 'docs-json');
    jsonDocsOutputs.forEach(jsonDocsOutput => {
        validateJsonDocsOutputTarget(config, jsonDocsOutput);
    });
    // readme docs flag
    if (config.flags.docs) {
        buildDocs = true;
        if (!config.outputTargets.some(o => o.type === 'docs')) {
            // didn't provide a docs config, so let's add one
            config.outputTargets.push({ type: 'docs' });
        }
    }
    const readmeDocsOutputs = config.outputTargets.filter(o => o.type === 'docs');
    readmeDocsOutputs.forEach(readmeDocsOutput => {
        validateReadmeOutputTarget(config, readmeDocsOutput);
    });
    // custom docs
    const customDocsOutputs = config.outputTargets.filter(o => o.type === 'docs-custom');
    customDocsOutputs.forEach(jsonDocsOutput => {
        validateCustomDocsOutputTarget(jsonDocsOutput);
    });
    config.buildDocs = buildDocs;
}
function validateReadmeOutputTarget(config, outputTarget) {
    if (typeof outputTarget.dir !== 'string') {
        outputTarget.dir = config.srcDir;
    }
    if (!config.sys.path.isAbsolute(outputTarget.dir)) {
        outputTarget.dir = pathJoin(config, config.rootDir, outputTarget.dir);
    }
    outputTarget.strict = !!outputTarget.strict;
}
function validateJsonDocsOutputTarget(config, outputTarget) {
    if (typeof outputTarget.file !== 'string') {
        throw new Error(`docs-json outputTarget missing the "file" option`);
    }
    outputTarget.file = pathJoin(config, config.rootDir, outputTarget.file);
    outputTarget.strict = !!outputTarget.strict;
}
function validateCustomDocsOutputTarget(outputTarget) {
    if (typeof outputTarget.generator !== 'function') {
        throw new Error(`docs-custom outputTarget missing the "generator" function`);
    }
    outputTarget.strict = !!outputTarget.strict;
}

function validateOutputTargetAngular(config) {
    const path$$1 = config.sys.path;
    const distOutputTargets = config.outputTargets.filter(o => o.type === 'angular');
    distOutputTargets.forEach(outputTarget => {
        outputTarget.excludeComponents = outputTarget.excludeComponents || [];
        if (!path$$1.isAbsolute(outputTarget.directivesProxyFile)) {
            outputTarget.directivesProxyFile = normalizePath(path$$1.join(config.rootDir, outputTarget.directivesProxyFile));
        }
        if (outputTarget.directivesArrayFile && !path$$1.isAbsolute(outputTarget.directivesArrayFile)) {
            outputTarget.directivesArrayFile = normalizePath(path$$1.join(config.rootDir, outputTarget.directivesArrayFile));
        }
        if (outputTarget.directivesUtilsFile && !path$$1.isAbsolute(outputTarget.directivesUtilsFile)) {
            outputTarget.directivesUtilsFile = normalizePath(path$$1.join(config.rootDir, outputTarget.directivesUtilsFile));
        }
    });
}

function validateOutputTargetDist(config) {
    const path$$1 = config.sys.path;
    const distOutputTargets = config.outputTargets.filter(o => o.type === 'dist');
    distOutputTargets.forEach(outputTarget => {
        if (!outputTarget.dir) {
            outputTarget.dir = DEFAULT_DIR;
        }
        if (!path$$1.isAbsolute(outputTarget.dir)) {
            outputTarget.dir = normalizePath(path$$1.join(config.rootDir, outputTarget.dir));
        }
        if (!outputTarget.buildDir) {
            outputTarget.buildDir = DEFAULT_BUILD_DIR;
        }
        if (!path$$1.isAbsolute(outputTarget.buildDir)) {
            outputTarget.buildDir = normalizePath(path$$1.join(outputTarget.dir, outputTarget.buildDir));
        }
        if (!outputTarget.collectionDir) {
            outputTarget.collectionDir = DEFAULT_COLLECTION_DIR;
        }
        if (!path$$1.isAbsolute(outputTarget.collectionDir)) {
            outputTarget.collectionDir = normalizePath(path$$1.join(outputTarget.dir, outputTarget.collectionDir));
        }
        if (!outputTarget.esmLoaderPath) {
            outputTarget.esmLoaderPath = DEFAULT_ESM_LOADER_DIR;
        }
        if (!outputTarget.typesDir) {
            outputTarget.typesDir = DEFAULT_TYPES_DIR;
        }
        if (!path$$1.isAbsolute(outputTarget.typesDir)) {
            outputTarget.typesDir = normalizePath(path$$1.join(outputTarget.dir, outputTarget.typesDir));
        }
        if (typeof outputTarget.empty !== 'boolean') {
            outputTarget.empty = DEFAULT_EMPTY_DIR;
        }
        if (typeof outputTarget.appBuild !== 'boolean') {
            outputTarget.appBuild = true;
        }
    });
}
const DEFAULT_DIR = 'dist';
const DEFAULT_BUILD_DIR = '';
const DEFAULT_EMPTY_DIR = true;
const DEFAULT_COLLECTION_DIR = 'collection';
const DEFAULT_TYPES_DIR = 'types';
const DEFAULT_ESM_LOADER_DIR = 'loader';

function validatePrerender(config, outputTarget) {
    let defaults;
    if (config.flags.prerender) {
        // forcing a prerender build
        defaults = FULL_PRERENDER_DEFAULTS;
    }
    else if (config.flags.ssr) {
        // forcing a ssr build
        defaults = SSR_DEFAULTS;
    }
    else {
        // not forcing a prerender build
        if (config.devMode) {
            // not forcing a prerender build
            // but we're in dev mode
            defaults = DEV_MODE_DEFAULTS;
        }
        else {
            // not forcing a prerender build
            // but we're in prod mode
            defaults = PROD_NON_HYDRATE_DEFAULTS;
        }
    }
    setStringConfig(outputTarget, 'baseUrl', defaults.baseUrl);
    setBooleanConfig(outputTarget, 'canonicalLink', null, defaults.canonicalLink);
    setBooleanConfig(outputTarget, 'collapseWhitespace', null, defaults.collapseWhitespace);
    setBooleanConfig(outputTarget, 'hydrateComponents', null, defaults.hydrateComponents);
    setBooleanConfig(outputTarget, 'inlineStyles', null, defaults.inlineStyles);
    setBooleanConfig(outputTarget, 'inlineLoaderScript', null, defaults.inlineLoaderScript);
    setNumberConfig(outputTarget, 'inlineAssetsMaxSize', null, defaults.inlineAssetsMaxSize);
    setBooleanConfig(outputTarget, 'prerenderUrlCrawl', null, defaults.prerenderUrlCrawl);
    setArrayConfig(outputTarget, 'prerenderLocations', defaults.prerenderLocations);
    setBooleanConfig(outputTarget, 'prerenderPathHash', null, defaults.prerenderPathHash);
    setBooleanConfig(outputTarget, 'prerenderPathQuery', null, defaults.prerenderPathQuery);
    setNumberConfig(outputTarget, 'prerenderMaxConcurrent', null, defaults.prerenderMaxConcurrent);
    setBooleanConfig(outputTarget, 'removeUnusedStyles', null, defaults.removeUnusedStyles);
    defaults.baseUrl = normalizePath(defaults.baseUrl);
    if (!outputTarget.baseUrl.startsWith('/')) {
        throw new Error(`baseUrl "${outputTarget.baseUrl}" must start with a slash "/". This represents an absolute path to the root of the domain.`);
    }
    if (!outputTarget.baseUrl.endsWith('/')) {
        outputTarget.baseUrl += '/';
    }
    if (config.flags.prerender && outputTarget.prerenderLocations.length === 0) {
        outputTarget.prerenderLocations.push({
            path: outputTarget.baseUrl
        });
    }
    if (outputTarget.hydrateComponents) {
        config.buildEs5 = true;
    }
}
const FULL_PRERENDER_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: true,
    collapseWhitespace: true,
    hydrateComponents: true,
    inlineStyles: true,
    inlineLoaderScript: true,
    inlineAssetsMaxSize: 5000,
    prerenderUrlCrawl: true,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 4,
    removeUnusedStyles: true
};
const SSR_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: true,
    collapseWhitespace: true,
    hydrateComponents: true,
    inlineStyles: true,
    inlineLoaderScript: true,
    inlineAssetsMaxSize: 0,
    prerenderUrlCrawl: false,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 0,
    removeUnusedStyles: false
};
const PROD_NON_HYDRATE_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: false,
    collapseWhitespace: true,
    hydrateComponents: false,
    inlineStyles: false,
    inlineLoaderScript: true,
    inlineAssetsMaxSize: 0,
    prerenderUrlCrawl: false,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 0,
    removeUnusedStyles: false
};
const DEV_MODE_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: false,
    collapseWhitespace: false,
    hydrateComponents: false,
    inlineStyles: false,
    inlineLoaderScript: false,
    inlineAssetsMaxSize: 0,
    prerenderUrlCrawl: false,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 0,
    removeUnusedStyles: false
};

function validateOutputTargetWww(config) {
    if (!Array.isArray(config.outputTargets)) {
        config.outputTargets = [
            { type: 'www' }
        ];
    }
    const wwwOutputTargets = config.outputTargets.filter(o => o.type === 'www');
    wwwOutputTargets.forEach(outputTarget => {
        validateOutputTarget(config, outputTarget);
    });
}
function validateOutputTarget(config, outputTarget) {
    const path$$1 = config.sys.path;
    setStringConfig(outputTarget, 'dir', DEFAULT_DIR$1);
    if (!path$$1.isAbsolute(outputTarget.dir)) {
        outputTarget.dir = pathJoin(config, config.rootDir, outputTarget.dir);
    }
    setStringConfig(outputTarget, 'buildDir', DEFAULT_BUILD_DIR$1);
    if (!path$$1.isAbsolute(outputTarget.buildDir)) {
        outputTarget.buildDir = pathJoin(config, outputTarget.dir, outputTarget.buildDir);
    }
    setStringConfig(outputTarget, 'indexHtml', DEFAULT_INDEX_HTML);
    if (!path$$1.isAbsolute(outputTarget.indexHtml)) {
        outputTarget.indexHtml = pathJoin(config, outputTarget.dir, outputTarget.indexHtml);
    }
    setBooleanConfig(outputTarget, 'empty', null, DEFAULT_EMPTY_DIR$1);
    validatePrerender(config, outputTarget);
    if (typeof outputTarget.appBuild !== 'boolean') {
        outputTarget.appBuild = true;
    }
}
const DEFAULT_DIR$1 = 'www';
const DEFAULT_INDEX_HTML = 'index.html';
const DEFAULT_BUILD_DIR$1 = 'build';
const DEFAULT_EMPTY_DIR$1 = true;

function validateResourcesUrl(outputTarget) {
    if (typeof outputTarget.resourcesUrl === 'string') {
        outputTarget.resourcesUrl = normalizePath(outputTarget.resourcesUrl.trim());
        if (outputTarget.resourcesUrl.charAt(outputTarget.resourcesUrl.length - 1) !== '/') {
            // ensure there's a trailing /
            outputTarget.resourcesUrl += '/';
        }
    }
}

function validateServiceWorker(config, outputTarget) {
    if (config.devMode && !config.flags.serviceWorker) {
        outputTarget.serviceWorker = null;
        return;
    }
    if (outputTarget.serviceWorker === false || outputTarget.serviceWorker === null) {
        outputTarget.serviceWorker = null;
        return;
    }
    if (!outputTarget.serviceWorker && outputTarget.type !== 'www') {
        outputTarget.serviceWorker = null;
        return;
    }
    if (outputTarget.serviceWorker === true) {
        outputTarget.serviceWorker = {};
    }
    else if (!outputTarget.serviceWorker && config.devMode) {
        outputTarget.serviceWorker = null;
        return;
    }
    if (typeof outputTarget.serviceWorker !== 'object') {
        // what was passed in could have been a boolean
        // in that case let's just turn it into an empty obj so Object.assign doesn't crash
        outputTarget.serviceWorker = {};
    }
    if (!Array.isArray(outputTarget.serviceWorker.globPatterns)) {
        if (typeof outputTarget.serviceWorker.globPatterns === 'string') {
            outputTarget.serviceWorker.globPatterns = [outputTarget.serviceWorker.globPatterns];
        }
        else if (typeof outputTarget.serviceWorker.globPatterns !== 'string') {
            outputTarget.serviceWorker.globPatterns = [DEFAULT_GLOB_PATTERNS];
        }
    }
    if (typeof outputTarget.serviceWorker.globDirectory !== 'string') {
        outputTarget.serviceWorker.globDirectory = outputTarget.dir;
    }
    if (typeof outputTarget.serviceWorker.globIgnores === 'string') {
        outputTarget.serviceWorker.globIgnores = [outputTarget.serviceWorker.globIgnores];
    }
    outputTarget.serviceWorker.globIgnores = outputTarget.serviceWorker.globIgnores || [];
    addGlobIgnores(config, outputTarget.serviceWorker.globIgnores);
    if (!outputTarget.serviceWorker.swDest) {
        outputTarget.serviceWorker.swDest = config.sys.path.join(outputTarget.dir, DEFAULT_FILENAME);
    }
    if (!config.sys.path.isAbsolute(outputTarget.serviceWorker.swDest)) {
        outputTarget.serviceWorker.swDest = config.sys.path.join(outputTarget.dir, outputTarget.serviceWorker.swDest);
    }
}
function addGlobIgnores(config, globIgnores) {
    const appRegistry = `**/${getRegistryFileName(config)}`;
    globIgnores.push(appRegistry);
    const appGlobal = `**/${getGlobalFileName(config)}`;
    globIgnores.push(appGlobal);
    const hostConfigJson = `**/${HOST_CONFIG_FILENAME}`;
    globIgnores.push(hostConfigJson);
}
const DEFAULT_GLOB_PATTERNS = '**/*.{js,css,json,html}';
const DEFAULT_FILENAME = 'sw.js';

function validateStats(config) {
    if (config.flags.stats) {
        const hasOutputTarget = config.outputTargets.some(o => o.type === 'stats');
        if (!hasOutputTarget) {
            config.outputTargets.push({
                type: 'stats'
            });
        }
    }
    const outputTargets = config.outputTargets.filter(o => o.type === 'stats');
    outputTargets.forEach(outputTarget => {
        validateStatsOutputTarget(config, outputTarget);
    });
}
function validateStatsOutputTarget(config, outputTarget) {
    if (!outputTarget.file) {
        outputTarget.file = DEFAULT_JSON_FILE_NAME;
    }
    if (!config.sys.path.isAbsolute(outputTarget.file)) {
        outputTarget.file = pathJoin(config, config.rootDir, outputTarget.file);
    }
}
const DEFAULT_JSON_FILE_NAME = 'stencil-stats.json';

/**
 * DEPRECATED "config" generateWWW, wwwDir, emptyWWW, generateDistribution, distDir, emptyDist
 * since 0.7.0, 2018-03-02
 */
function _deprecatedToMultipleTarget(config) {
    const deprecatedConfigs = [];
    if (config.generateWWW !== undefined) {
        deprecatedConfigs.push('generateWWW');
        if (config.generateWWW) {
            config.outputTargets = config.outputTargets || [];
            let o = config.outputTargets.find(o => o.type === 'www');
            if (!o) {
                o = { type: 'www' };
                config.outputTargets.push(o);
            }
        }
        delete config.generateWWW;
    }
    if (config.emptyWWW !== undefined) {
        deprecatedConfigs.push('emptyWWW');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'www');
        if (!o) {
            o = { type: 'www' };
            config.outputTargets.push(o);
        }
        o.empty = !!config.emptyWWW;
        delete config.emptyWWW;
    }
    if (config.wwwDir !== undefined) {
        deprecatedConfigs.push('wwwDir');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'www');
        if (!o) {
            o = { type: 'www' };
            config.outputTargets.push(o);
        }
        o.dir = config.wwwDir;
        delete config.wwwDir;
    }
    if (config.buildDir !== undefined) {
        deprecatedConfigs.push('buildDir');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'www');
        if (!o) {
            o = { type: 'www' };
            config.outputTargets.push(o);
        }
        o.buildDir = config.buildDir;
        delete config.buildDir;
    }
    if (config.wwwIndexHtml !== undefined) {
        deprecatedConfigs.push('wwwIndexHtml');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'www');
        if (!o) {
            o = { type: 'www' };
            config.outputTargets.push(o);
        }
        o.indexHtml = config.wwwIndexHtml;
        delete config.wwwIndexHtml;
    }
    if (config.generateDistribution !== undefined) {
        deprecatedConfigs.push('generateDistribution');
        if (config.generateDistribution) {
            config.outputTargets = config.outputTargets || [];
            let o = config.outputTargets.find(o => o.type === 'dist');
            if (!o) {
                o = { type: 'dist' };
                config.outputTargets.push(o);
            }
        }
        delete config.generateDistribution;
    }
    if (config.distDir !== undefined) {
        deprecatedConfigs.push('distDir');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'dist');
        if (!o) {
            o = { type: 'dist' };
            config.outputTargets.push(o);
        }
        o.dir = config.distDir;
        delete config.distDir;
    }
    if (config.emptyDist !== undefined) {
        deprecatedConfigs.push('emptyDist');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'dist');
        if (!o) {
            o = { type: 'dist' };
            config.outputTargets.push(o);
        }
        o.empty = !!config.emptyDist;
        delete config.emptyDist;
    }
    if (config.collectionDir !== undefined) {
        deprecatedConfigs.push('collectionDir');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'dist');
        if (!o) {
            o = { type: 'dist' };
            config.outputTargets.push(o);
        }
        o.dir = config.collectionDir;
        delete config.collectionDir;
    }
    if (config.typesDir !== undefined) {
        deprecatedConfigs.push('typesDir');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'dist');
        if (!o) {
            o = { type: 'dist' };
            config.outputTargets.push(o);
        }
        o.dir = config.typesDir;
        delete config.typesDir;
    }
    if (config.publicPath !== undefined) {
        deprecatedConfigs.push('publicPath');
        config.outputTargets = config.outputTargets || [];
        const www = config.outputTargets.find(o => o.type === 'www');
        if (www) {
            www.resourcesUrl = config.publicPath;
        }
        delete config.publicPath;
    }
    if (config.serviceWorker !== undefined) {
        deprecatedConfigs.push('serviceWorker');
        config.outputTargets = config.outputTargets || [];
        let o = config.outputTargets.find(o => o.type === 'www');
        if (!o) {
            o = { type: 'www', serviceWorker: config.serviceWorker };
            config.outputTargets.push(o);
        }
        else {
            o.serviceWorker = config.serviceWorker;
        }
        delete config.serviceWorker;
    }
    if (config.prerender !== undefined) {
        deprecatedConfigs.push('prerender');
        delete config.prerender;
    }
    if (deprecatedConfigs.length > 0) {
        const warningMsg = [
            `As of v0.7.0, the config `,
            deprecatedConfigs.length > 1 ? `properties ` : `property `,
            `"${deprecatedConfigs.join(', ')}" `,
            deprecatedConfigs.length > 1 ? `have ` : `has `,
            `been deprecated in favor of a multiple output target configuration. `,
            `Please use the "outputTargets" config which `,
            `is an array of output targets. `,
            `Note that not having an "outputTarget" config will default `,
            `to have an { type: "www" } output target. `,
            `More information aobut the new format can be found here: https://stenciljs.com/docs/config`
        ];
        config.logger.warn(warningMsg.join(''));
    }
    return deprecatedConfigs;
}

function validateOutputTargets(config) {
    // setup outputTargets from deprecated config properties
    _deprecatedToMultipleTarget(config);
    if (Array.isArray(config.outputTargets)) {
        config.outputTargets.forEach(outputTarget => {
            if (typeof outputTarget.type !== 'string') {
                outputTarget.type = 'www';
            }
            outputTarget.type = outputTarget.type.trim().toLowerCase();
            if (!VALID_TYPES.includes(outputTarget.type)) {
                throw new Error(`invalid outputTarget type "${outputTarget.type}". Valid target types: ${VALID_TYPES.join(', ')}`);
            }
        });
    }
    validateOutputTargetWww(config);
    validateOutputTargetDist(config);
    validateOutputTargetAngular(config);
    validateDocs(config);
    validateStats(config);
    if (!config.outputTargets || config.outputTargets.length === 0) {
        throw new Error(`outputTarget required`);
    }
    config.outputTargets.forEach(outputTarget => {
        validateResourcesUrl(outputTarget);
        validateServiceWorker(config, outputTarget);
    });
}
const VALID_TYPES = [
    'angular',
    'dist',
    'docs',
    'docs-json',
    'docs-custom',
    'stats',
    'www'
];

function validatePaths(config) {
    const path$$1 = config.sys.path;
    if (typeof config.globalScript === 'string' && !path$$1.isAbsolute(config.globalScript)) {
        if (!path$$1.isAbsolute(config.globalScript)) {
            config.globalScript = path$$1.join(config.rootDir, config.globalScript);
        }
        config.globalScript = normalizePath(config.globalScript);
    }
    if (Array.isArray(config.globalStyle)) {
        // DEPRECATED 2018-05-31
        config.logger.warn(`"globalStyle" config no longer accepts an array. Please update to only use a single entry point for a global style css file.`);
        if (config.globalStyle.length > 0) {
            config.globalStyle = config.globalStyle[0];
        }
    }
    if (typeof config.globalStyle === 'string') {
        if (!path$$1.isAbsolute(config.globalStyle)) {
            config.globalStyle = path$$1.join(config.rootDir, config.globalStyle);
        }
        config.globalStyle = normalizePath(config.globalStyle);
    }
    setStringConfig(config, 'srcDir', DEFAULT_SRC_DIR);
    if (!path$$1.isAbsolute(config.srcDir)) {
        config.srcDir = path$$1.join(config.rootDir, config.srcDir);
    }
    config.srcDir = normalizePath(config.srcDir);
    setStringConfig(config, 'cacheDir', DEFAULT_CACHE_DIR);
    if (!path$$1.isAbsolute(config.cacheDir)) {
        config.cacheDir = path$$1.join(config.rootDir, config.cacheDir);
    }
    config.cacheDir = normalizePath(config.cacheDir);
    if (typeof config.tsconfig === 'string') {
        if (!path$$1.isAbsolute(config.tsconfig)) {
            config.tsconfig = path$$1.join(config.rootDir, config.tsconfig);
        }
    }
    else {
        config.tsconfig = ts.findConfigFile(config.rootDir, ts.sys.fileExists);
    }
    if (typeof config.tsconfig === 'string') {
        config.tsconfig = normalizePath(config.tsconfig);
    }
    setStringConfig(config, 'srcIndexHtml', normalizePath(path$$1.join(config.srcDir, DEFAULT_INDEX_HTML$1)));
    if (!path$$1.isAbsolute(config.srcIndexHtml)) {
        config.srcIndexHtml = path$$1.join(config.rootDir, config.srcIndexHtml);
    }
    config.srcIndexHtml = normalizePath(config.srcIndexHtml);
    if (config.writeLog) {
        setStringConfig(config, 'buildLogFilePath', DEFAULT_BUILD_LOG_FILE_NAME);
        if (!path$$1.isAbsolute(config.buildLogFilePath)) {
            config.buildLogFilePath = path$$1.join(config.rootDir, config.buildLogFilePath);
        }
        config.buildLogFilePath = normalizePath(config.buildLogFilePath);
        config.logger.buildLogFilePath = config.buildLogFilePath;
    }
}
const DEFAULT_BUILD_LOG_FILE_NAME = 'stencil-build.log';
const DEFAULT_CACHE_DIR = '.stencil';
const DEFAULT_INDEX_HTML$1 = 'index.html';
const DEFAULT_SRC_DIR = 'src';

function validatePlugins(config) {
    config.plugins = (config.plugins || []).filter(p => !!p);
}

function validateRollupConfig(config) {
    const cleanRollupConfig = getCleanRollupConfig(config.rollupConfig);
    config.rollupConfig = cleanRollupConfig;
}
function getCleanRollupConfig(rollupConfig) {
    let cleanRollupConfig = DEFAULT_ROLLUP_CONFIG;
    if (!rollupConfig || !isObject(rollupConfig)) {
        return cleanRollupConfig;
    }
    if (rollupConfig.inputOptions && isObject(rollupConfig.inputOptions)) {
        cleanRollupConfig = Object.assign({}, cleanRollupConfig, { inputOptions: pluck(rollupConfig.inputOptions, ['context', 'moduleContext']) });
    }
    if (rollupConfig.outputOptions && isObject(rollupConfig.outputOptions)) {
        cleanRollupConfig = Object.assign({}, cleanRollupConfig, { outputOptions: pluck(rollupConfig.outputOptions, ['globals']) });
    }
    return cleanRollupConfig;
}
const DEFAULT_ROLLUP_CONFIG = {
    inputOptions: {},
    outputOptions: {}
};

function validateTesting(config) {
    const testing = config.testing = config.testing || {};
    if (!config.flags || (!config.flags.e2e && !config.flags.spec)) {
        return;
    }
    if (typeof config.flags.headless === 'boolean') {
        testing.browserHeadless = config.flags.headless;
    }
    else if (typeof testing.browserHeadless !== 'boolean') {
        testing.browserHeadless = true;
    }
    testing.browserArgs = testing.browserArgs || [];
    addOption(testing.browserArgs, '--disable-gpu');
    addOption(testing.browserArgs, '--disable-canvas-aa');
    addOption(testing.browserArgs, '--disable-composited-antialiasing');
    addOption(testing.browserArgs, '--disable-composited-antialiasing');
    if (config.flags.ci) {
        addOption(testing.browserArgs, '--no-sandbox');
        addOption(testing.browserArgs, '--disable-setuid-sandbox');
        testing.browserHeadless = true;
    }
    const path$$1 = config.sys.path;
    if (typeof testing.rootDir === 'string') {
        if (!path$$1.isAbsolute(testing.rootDir)) {
            testing.rootDir = path$$1.join(config.rootDir, testing.rootDir);
        }
    }
    else {
        testing.rootDir = config.rootDir;
    }
    if (config.flags && typeof config.flags.screenshotConnector === 'string') {
        testing.screenshotConnector = config.flags.screenshotConnector;
    }
    if (typeof testing.screenshotConnector === 'string') {
        if (!path$$1.isAbsolute(testing.screenshotConnector)) {
            testing.screenshotConnector = path$$1.join(config.rootDir, testing.screenshotConnector);
        }
    }
    else {
        testing.screenshotConnector = config.sys.path.join(config.sys.compiler.packageDir, 'screenshot', 'local-connector.js');
    }
    if (!Array.isArray(testing.moduleFileExtensions)) {
        testing.moduleFileExtensions = DEFAULT_MODULE_FILE_EXTENSIONS;
    }
    if (!Array.isArray(testing.testPathIgnorePatterns)) {
        testing.testPathIgnorePatterns = DEFAULT_IGNORE_PATTERNS.map(ignorePattern => {
            return pathJoin(config, testing.rootDir, ignorePattern);
        });
        config.outputTargets.filter(o => (o.type === 'dist' || o.type === 'www') && o.dir).forEach((outputTarget) => {
            testing.testPathIgnorePatterns.push(outputTarget.dir);
        });
    }
    if (typeof testing.setupTestFrameworkScriptFile !== 'string') {
        testing.setupTestFrameworkScriptFile = path$$1.join(config.sys.compiler.packageDir, 'testing', 'jest.setuptestframework.js');
    }
    else if (!path$$1.isAbsolute(testing.setupTestFrameworkScriptFile)) {
        testing.setupTestFrameworkScriptFile = path$$1.join(config.configPath, testing.setupTestFrameworkScriptFile);
    }
    if (typeof testing.testEnvironment !== 'string') {
        testing.testEnvironment = path$$1.join(config.sys.compiler.packageDir, 'testing', 'jest.environment.js');
    }
    else if (!path$$1.isAbsolute(testing.testEnvironment)) {
        testing.testEnvironment = path$$1.join(config.configPath, testing.testEnvironment);
    }
    if (typeof testing.allowableMismatchedPixels === 'number') {
        if (testing.allowableMismatchedPixels < 0) {
            throw new Error(`allowableMismatchedPixels must be a value that is 0 or greater`);
        }
    }
    else {
        testing.allowableMismatchedPixels = DEFAULT_ALLOWABLE_MISMATCHED_PIXELS;
    }
    if (typeof testing.allowableMismatchedRatio === 'number') {
        if (testing.allowableMismatchedRatio < 0 || testing.allowableMismatchedRatio > 1) {
            throw new Error(`allowableMismatchedRatio must be a value ranging from 0 to 1`);
        }
    }
    if (typeof testing.pixelmatchThreshold === 'number') {
        if (testing.pixelmatchThreshold < 0 || testing.pixelmatchThreshold > 1) {
            throw new Error(`pixelmatchThreshold must be a value ranging from 0 to 1`);
        }
    }
    else {
        testing.pixelmatchThreshold = DEFAULT_PIXEL_MATCH_THRESHOLD;
    }
    if (Array.isArray(testing.testMatch)) {
        delete testing.testRegex;
    }
    else if (typeof testing.testRegex === 'string') {
        delete testing.testMatch;
    }
    else {
        testing.testMatch = [
            `**/*(*.)+(e2e|spec).+(ts)?(x)`
        ];
    }
    if (typeof testing.runner !== 'string') {
        testing.runner = path$$1.join(config.sys.compiler.packageDir, 'testing', 'jest.runner.js');
    }
    if (!Array.isArray(testing.emulate) || testing.emulate.length === 0) {
        testing.emulate = [
            {
                userAgent: 'default',
                viewport: {
                    width: 600,
                    height: 600,
                    deviceScaleFactor: 1,
                    isMobile: false,
                    hasTouch: false,
                    isLandscape: false,
                }
            }
        ];
    }
    testing.transform = testing.transform || {};
    if (typeof testing.transform[DEFAULT_TS_TRANSFORM] !== 'string') {
        testing.transform[DEFAULT_TS_TRANSFORM] = path$$1.join(config.sys.compiler.packageDir, 'testing', 'jest.preprocessor.js');
    }
    else if (!path$$1.isAbsolute(testing.transform[DEFAULT_TS_TRANSFORM])) {
        testing.transform[DEFAULT_TS_TRANSFORM] = path$$1.join(config.configPath, testing.transform[DEFAULT_TS_TRANSFORM]);
    }
}
const DEFAULT_TS_TRANSFORM = '^.+\\.(ts|tsx)$';
const DEFAULT_MODULE_FILE_EXTENSIONS = [
    'ts',
    'tsx',
    'js',
    'json'
];
const DEFAULT_IGNORE_PATTERNS = [
    '.vscode',
    '.stencil',
    'node_modules',
];
function addOption(setArray, option) {
    if (!setArray.includes(option)) {
        setArray.push(option);
    }
}
const DEFAULT_ALLOWABLE_MISMATCHED_PIXELS = 100;
const DEFAULT_PIXEL_MATCH_THRESHOLD = 0.1;

function validateWorkers(config) {
    let cpus = 1;
    if (config.sys && config.sys.details && typeof config.sys.details.cpus === 'number') {
        cpus = config.sys.details.cpus;
    }
    if (typeof config.maxConcurrentWorkers !== 'number') {
        config.maxConcurrentWorkers = cpus;
    }
    if (config.flags && typeof config.flags.maxWorkers === 'number') {
        config.maxConcurrentWorkers = config.flags.maxWorkers;
    }
    config.maxConcurrentWorkers = Math.max(Math.min(config.maxConcurrentWorkers, cpus), 1);
    if (typeof config.maxConcurrentTasksPerWorker !== 'number') {
        config.maxConcurrentTasksPerWorker = DEFAULT_MAX_TASKS_PER_WORKER;
    }
    config.maxConcurrentTasksPerWorker = Math.max(Math.min(config.maxConcurrentTasksPerWorker, 20), 1);
}
const DEFAULT_MAX_TASKS_PER_WORKER = 2;

/**
 * DEPRECATED "config.collections" since 0.6.0, 2018-02-13
 */
function _deprecatedValidateConfigCollections(config) {
    if (!Array.isArray(config.collections)) {
        return;
    }
    const deprecatedCollections = config.collections;
    if (deprecatedCollections.length > 0) {
        const errorMsg = [
            `As of v0.6.0, "config.collections" has been deprecated in favor of standard ES module imports. `,
            `Instead of listing collections within the stencil config, collections should now be `,
            `imported by the app's root component or module. The benefit of this is to not only simplify `,
            `the config by using a standards approach for imports, but to also automatically import the `,
            `collection's types to improve development. Please remove "config.collections" `,
            `from the "stencil.config.js" file, and add `,
            deprecatedCollections.length === 1 ? `this import ` : `these imports `,
            `to your root component or root module:  `
        ];
        deprecatedCollections.forEach(collection => {
            errorMsg.push(`import '${collection.name}';  `);
        });
        config.logger.error(errorMsg.join(''));
    }
}

function validateConfig(config, setEnvVariables) {
    if (!config) {
        throw new Error(`invalid build config`);
    }
    if (config._isValidated) {
        // don't bother if we've already validated this config
        return config;
    }
    if (!config.logger) {
        throw new Error(`config.logger required`);
    }
    if (!config.rootDir) {
        throw new Error('config.rootDir required');
    }
    if (!config.sys) {
        throw new Error('config.sys required');
    }
    config.flags = config.flags || {};
    if (config.flags.debug) {
        config.logLevel = 'debug';
    }
    else if (config.flags.logLevel) {
        config.logLevel = config.flags.logLevel;
    }
    else if (typeof config.logLevel !== 'string') {
        config.logLevel = 'info';
    }
    config.logger.level = config.logLevel;
    setBooleanConfig(config, 'writeLog', 'log', false);
    setBooleanConfig(config, 'buildAppCore', null, true);
    // default devMode false
    if (config.flags.prod) {
        config.devMode = false;
    }
    else if (config.flags.dev) {
        config.devMode = true;
    }
    else {
        setBooleanConfig(config, 'devMode', null, DEFAULT_DEV_MODE);
    }
    // get a good namespace
    validateNamespace$1(config);
    // figure out all of the config paths and absolute paths
    validatePaths(config);
    // setup the outputTargets
    validateOutputTargets(config);
    // validate how many workers we can use
    validateWorkers(config);
    // default devInspector to whatever devMode is
    setBooleanConfig(config, 'devInspector', null, config.devMode);
    // default watch false
    setBooleanConfig(config, 'watch', 'watch', false);
    setBooleanConfig(config, 'minifyCss', null, !config.devMode);
    setBooleanConfig(config, 'minifyJs', null, !config.devMode);
    setBooleanConfig(config, 'buildEs5', 'es5', !config.devMode);
    setBooleanConfig(config, 'buildEsm', 'esm', config.buildEs5);
    setBooleanConfig(config, 'buildScoped', null, config.buildEs5);
    if (typeof config.validateTypes !== 'boolean') {
        config.validateTypes = true;
    }
    setBooleanConfig(config, 'hashFileNames', null, !(config.devMode || config.watch));
    setNumberConfig(config, 'hashedFileNameLength', null, DEFAULT_HASHED_FILENAME_LENTH);
    if (config.hashFileNames) {
        if (config.hashedFileNameLength < MIN_HASHED_FILENAME_LENTH) {
            throw new Error(`config.hashedFileNameLength must be at least ${MIN_HASHED_FILENAME_LENTH} characters`);
        }
        if (config.hashedFileNameLength > MAX_HASHED_FILENAME_LENTH) {
            throw new Error(`config.hashedFileNameLength cannot be more than ${MAX_HASHED_FILENAME_LENTH} characters`);
        }
    }
    validateCopy(config);
    validatePlugins(config);
    validateAssetVerioning(config);
    validateDevServer(config);
    if (!config.watchIgnoredRegex) {
        config.watchIgnoredRegex = DEFAULT_WATCH_IGNORED_REGEX;
    }
    setStringConfig(config, 'hydratedCssClass', DEFAULT_HYDRATED_CSS_CLASS);
    setBooleanConfig(config, 'generateDocs', 'docs', false);
    setBooleanConfig(config, 'enableCache', 'cache', true);
    if (!Array.isArray(config.includeSrc)) {
        config.includeSrc = DEFAULT_INCLUDES.map(include => {
            return config.sys.path.join(config.srcDir, include);
        });
    }
    if (!Array.isArray(config.excludeSrc)) {
        config.excludeSrc = DEFAULT_EXCLUDES.slice();
    }
    /**
     * DEPRECATED "config.collections" since 0.6.0, 2018-02-13
     */
    _deprecatedValidateConfigCollections(config);
    setArrayConfig(config, 'plugins');
    setArrayConfig(config, 'bundles');
    // set to true so it doesn't bother going through all this again on rebuilds
    config._isValidated = true;
    if (setEnvVariables !== false) {
        setProcessEnvironment(config);
    }
    validateRollupConfig(config);
    validateTesting(config);
    return config;
}
function setProcessEnvironment(config) {
    process.env.NODE_ENV = config.devMode ? 'development' : 'production';
}
const DEFAULT_DEV_MODE = false;
const DEFAULT_HASHED_FILENAME_LENTH = 8;
const MIN_HASHED_FILENAME_LENTH = 4;
const MAX_HASHED_FILENAME_LENTH = 32;
const DEFAULT_INCLUDES = ['**/*.ts', '**/*.tsx'];
const DEFAULT_EXCLUDES = ['**/*.+(spec|e2e).*'];
const DEFAULT_WATCH_IGNORED_REGEX = /(?:^|[\\\/])(\.(?!\.)[^\\\/]+)$/i;
const DEFAULT_HYDRATED_CSS_CLASS = 'hydrated';

class Renderer {
    constructor(config, registry, ctx, outputTarget) {
        this.config = config;
        this.config = validateConfig(config);
        // do not allow more than one worker when prerendering
        config.sys.initWorkers(1, 1);
        // init the build context
        this.ctx = getCompilerCtx(config, ctx);
        this.outputTarget = outputTarget || config.outputTargets.find(o => o.type === 'www');
        // load the component registry from the registry.json file
        this.cmpRegistry = registry || loadComponentRegistry(config, this.ctx, this.outputTarget);
        if (Object.keys(this.cmpRegistry).length === 0) {
            throw new Error(`No registered components found: ${config.namespace}`);
        }
        // load the app global file into the context
        loadAppGlobal(config, this.ctx, this.outputTarget);
    }
    hydrate(hydrateOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            let hydrateResults;
            const perf = { mark: noop, measure: noop };
            // kick off hydrated, which is an async opertion
            try {
                hydrateResults = yield hydrateHtml(this.config, this.ctx, this.outputTarget, this.cmpRegistry, hydrateOpts, perf);
            }
            catch (e) {
                hydrateResults = {
                    url: hydrateOpts.path,
                    diagnostics: [],
                    html: hydrateOpts.html,
                    styles: null,
                    anchors: [],
                    components: [],
                    styleUrls: [],
                    scriptUrls: [],
                    imgUrls: []
                };
                catchError(hydrateResults.diagnostics, e);
            }
            return hydrateResults;
        });
    }
    get fs() {
        return this.ctx.fs;
    }
    destroy() {
        if (this.config && this.config.sys && this.config.sys.destroy) {
            this.config.sys.destroy();
        }
    }
}
function loadAppGlobal(config, compilerCtx, outputTarget) {
    compilerCtx.appFiles = compilerCtx.appFiles || {};
    if (compilerCtx.appFiles.global) {
        // already loaded the global js content
        return;
    }
    // let's load the app global js content
    const appGlobalPath = getGlobalJsBuildPath(config, outputTarget);
    try {
        compilerCtx.appFiles.global = compilerCtx.fs.readFileSync(appGlobalPath);
    }
    catch (e) {
        config.logger.debug(`missing app global: ${appGlobalPath}`);
    }
}

function prerenderPath(config, compilerCtx, buildCtx, outputTarget, indexSrcHtml, prerenderLocation) {
    return __awaiter(this, void 0, void 0, function* () {
        const msg = outputTarget.hydrateComponents ? 'prerender' : 'optimize html';
        const timeSpan = buildCtx.createTimeSpan(`${msg}, started: ${prerenderLocation.path}`);
        const results = {
            diagnostics: []
        };
        try {
            // create the renderer config
            const rendererConfig = Object.assign({}, config);
            // create the hydrate options from the prerender config
            const hydrateOpts = {};
            hydrateOpts.url = prerenderLocation.url;
            hydrateOpts.isPrerender = true;
            hydrateOpts.timestamp = buildCtx.timestamp;
            // set the input html which we just read from the src index html file
            hydrateOpts.html = indexSrcHtml;
            // create a server-side renderer
            const renderer = new Renderer(rendererConfig, null, compilerCtx, outputTarget);
            // parse the html to dom nodes, hydrate the components, then
            // serialize the hydrated dom nodes back to into html
            const hydratedResults = yield renderer.hydrate(hydrateOpts);
            // hydrating to string is done!!
            // let's use this updated html for the index content now
            Object.assign(results, hydratedResults);
            timeSpan.finish(`${msg}, finished: ${prerenderLocation.path}`);
        }
        catch (e) {
            // ahh man! what happened!
            timeSpan.finish(`${msg}, failed: ${prerenderLocation.path}`);
            catchError(buildCtx.diagnostics, e);
        }
        return results;
    });
}

function prerenderOutputTargets(config, compilerCtx, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.srcIndexHtml) {
            return;
        }
        const outputTargets = config.outputTargets.filter(o => {
            return o.type === 'www' && o.indexHtml;
        });
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            if (outputTarget.hydrateComponents && outputTarget.prerenderLocations && outputTarget.prerenderLocations.length > 0) {
                yield prerenderOutputTarget(config, compilerCtx, buildCtx, outputTarget, entryModules);
            }
            else {
                const windowLocationPath = outputTarget.baseUrl;
                yield optimizeIndexHtml(config, compilerCtx, outputTarget, windowLocationPath, buildCtx.diagnostics);
            }
        })));
    });
}
function shouldPrerender(config) {
    if (!config.srcIndexHtml) {
        return false;
    }
    const outputTargets = config.outputTargets.filter(o => {
        return o.type === 'www' && o.indexHtml && o.hydrateComponents && o.prerenderLocations && o.prerenderLocations.length > 0;
    });
    return (outputTargets.length > 0);
}
/**
 * shouldPrerenderExternal
 * @description Checks if the cli flag has been set that a external prerenderer will be used
 * @param config build config
 */
function shouldPrerenderExternal(config) {
    return config.flags && config.flags.prerenderExternal;
}
function prerenderOutputTarget(config, compilerCtx, buildCtx, outputTarget, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        // if there was src index.html file, then the process before this one
        // would have already loaded and updated the src index to its www path
        // get the www index html content for the template for all prerendered pages
        let indexHtml = null;
        try {
            indexHtml = yield compilerCtx.fs.readFile(outputTarget.indexHtml);
        }
        catch (e) { }
        if (typeof indexHtml !== 'string') {
            // looks like we don't have an index html file, which is fine
            buildCtx.debug(`prerenderApp, missing index.html for prerendering`);
            return [];
        }
        // get the prerender urls to queue up
        const prerenderQueue = getPrerenderQueue(config, outputTarget);
        if (!prerenderQueue.length) {
            const d = buildWarn(buildCtx.diagnostics);
            d.messageText = `No urls found in the prerender config`;
            return [];
        }
        return runPrerenderApp(config, compilerCtx, buildCtx, outputTarget, entryModules, prerenderQueue, indexHtml);
    });
}
function runPrerenderApp(config, compilerCtx, buildCtx, outputTarget, entryModules, prerenderQueue, indexHtml) {
    return __awaiter(this, void 0, void 0, function* () {
        // keep track of how long the entire build process takes
        const timeSpan = buildCtx.createTimeSpan(`prerendering started`, !outputTarget.hydrateComponents);
        const hydrateResults = [];
        try {
            yield new Promise(resolve => {
                drainPrerenderQueue(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexHtml, hydrateResults, resolve);
            });
            yield generateHostConfig(config, compilerCtx, outputTarget, entryModules, hydrateResults);
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
        hydrateResults.forEach(hydrateResult => {
            hydrateResult.diagnostics.forEach(diagnostic => {
                buildCtx.diagnostics.push(diagnostic);
            });
        });
        if (hasError(buildCtx.diagnostics)) {
            timeSpan.finish(`prerendering failed`);
        }
        else {
            timeSpan.finish(`prerendered urls: ${hydrateResults.length}`);
        }
        if (compilerCtx.localPrerenderServer) {
            compilerCtx.localPrerenderServer.close();
            delete compilerCtx.localPrerenderServer;
        }
        return hydrateResults;
    });
}
function drainPrerenderQueue(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexSrcHtml, hydrateResults, resolve) {
    for (var i = 0; i < outputTarget.prerenderMaxConcurrent; i++) {
        const activelyProcessingCount = prerenderQueue.filter(p => p.status === 'processing').length;
        if (activelyProcessingCount >= outputTarget.prerenderMaxConcurrent) {
            // whooaa, slow down there buddy, let's not get carried away
            break;
        }
        runNextPrerenderUrl(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexSrcHtml, hydrateResults, resolve);
    }
    const remaining = prerenderQueue.filter(p => {
        return p.status === 'processing' || p.status === 'pending';
    }).length;
    if (remaining === 0) {
        // we're not actively processing anything
        // and there aren't anymore urls in the queue to be prerendered
        // so looks like our job here is done, good work team
        resolve();
    }
}
function runNextPrerenderUrl(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexSrcHtml, hydrateResults, resolve) {
    return __awaiter(this, void 0, void 0, function* () {
        const p = prerenderQueue.find(p => p.status === 'pending');
        if (!p)
            return;
        // we've got a url that's pending
        // well guess what, it's go time
        p.status = 'processing';
        try {
            // prender this path and wait on the results
            const results = yield prerenderPath(config, compilerCtx, buildCtx, outputTarget, indexSrcHtml, p);
            // awesome!!
            if (outputTarget.prerenderUrlCrawl) {
                crawlAnchorsForNextUrls(config, outputTarget, prerenderQueue, results.url, results.anchors);
            }
            hydrateResults.push(results);
            yield writePrerenderDest(config, compilerCtx, outputTarget, results);
        }
        catch (e) {
            // darn, idk, bad news
            catchError(buildCtx.diagnostics, e);
        }
        // this job is not complete
        p.status = 'complete';
        // let's try to drain the queue again and let this
        // next call figure out if we're actually done or not
        drainPrerenderQueue(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexSrcHtml, hydrateResults, resolve);
    });
}
function writePrerenderDest(config, compilerCtx, outputTarget, results) {
    return __awaiter(this, void 0, void 0, function* () {
        // create the full path where this will be saved
        const filePath = getWritePathFromUrl(config, outputTarget, results.url);
        // add the prerender html content it to our collection of
        // files that need to be saved when we're all ready
        yield compilerCtx.fs.writeFile(filePath, results.html, { useCache: false });
        // write the files now
        // and since we're not using cache it'll free up its memory
        yield compilerCtx.fs.commit();
    });
}

function buildAuxiliaries(config, compilerCtx, buildCtx, entryModules, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        // let's prerender this first
        // and run service workers on top of this when it's done
        yield prerenderOutputTargets(config, compilerCtx, buildCtx, entryModules);
        // generate component docs
        // and service workers can run in parallel
        yield Promise.all([
            generateDocs$1(config, compilerCtx, buildCtx),
            generateServiceWorkers(config, compilerCtx, buildCtx),
            generateProxies$1(config, compilerCtx, cmpRegistry)
        ]);
        if (!buildCtx.hasError && buildCtx.isActiveBuild) {
            yield compilerCtx.fs.commit();
        }
    });
}

function getComponentAssetsCopyTasks(config, compilerCtx, buildCtx, entryModules, filesChanged) {
    const copyTasks = [];
    if (canSkipAssetsCopy(config, compilerCtx, entryModules, filesChanged)) {
        // no need to recopy all assets again
        return copyTasks;
    }
    const outputTargets = config.outputTargets.filter(outputTarget => {
        return outputTarget.appBuild;
    });
    if (outputTargets.length === 0) {
        return copyTasks;
    }
    // get a list of all the directories to copy
    // these paths should be absolute
    const copyToBuildDir = [];
    const copyToCollectionDir = [];
    entryModules.forEach(entryModule => {
        const moduleFiles = entryModule.moduleFiles.filter(m => {
            return m.cmpMeta.assetsDirsMeta && m.cmpMeta.assetsDirsMeta.length;
        });
        moduleFiles.forEach(moduleFile => {
            moduleFile.cmpMeta.assetsDirsMeta.forEach(assetsMeta => {
                copyToBuildDir.push(assetsMeta);
                if (!moduleFile.excludeFromCollection && !moduleFile.isCollectionDependency) {
                    copyToCollectionDir.push(assetsMeta);
                }
            });
        });
    });
    // copy all of the files in asset directories to the app's build and/or dist directory
    copyToBuildDir.forEach(assetsMeta => {
        // figure out what the path is to the component directory
        outputTargets.forEach(outputTarget => {
            const buildDirDestination = pathJoin(config, getAppBuildDir(config, outputTarget), assetsMeta.cmpRelativePath);
            copyTasks.push({
                src: assetsMeta.absolutePath,
                dest: buildDirDestination
            });
        });
    });
    outputTargets.forEach(outputTarget => {
        if (outputTarget.collectionDir) {
            // copy all of the files in asset directories to the app's collection directory
            copyToCollectionDir.forEach(assetsMeta => {
                // figure out what the path is to the component directory
                const collectionDirDestination = pathJoin(config, outputTarget.collectionDir, config.sys.path.relative(config.srcDir, assetsMeta.absolutePath));
                copyTasks.push({
                    src: assetsMeta.absolutePath,
                    dest: collectionDirDestination
                });
            });
        }
    });
    buildCtx.debug(`getComponentAssetsCopyTasks: ${copyTasks.length}`);
    return copyTasks;
}
function canSkipAssetsCopy(config, compilerCtx, entryModules, filesChanged) {
    if (!compilerCtx.hasSuccessfulBuild) {
        // always copy assets if we haven't had a successful build yet
        // cannot skip build
        return false;
    }
    // assume we want to skip copying assets again
    let shouldSkipAssetsCopy = true;
    // loop through each of the changed files
    filesChanged.forEach(changedFile => {
        // get the directory of where the changed file is in
        const changedFileDirPath = normalizePath(config.sys.path.dirname(changedFile));
        // loop through all the possible asset directories
        entryModules.forEach(entryModule => {
            entryModule.moduleFiles.forEach(moduleFile => {
                if (moduleFile.cmpMeta && moduleFile.cmpMeta.assetsDirsMeta) {
                    // loop through each of the asset directories of each component
                    moduleFile.cmpMeta.assetsDirsMeta.forEach(assetsDir => {
                        // get the absolute of the asset directory
                        const assetDirPath = normalizePath(assetsDir.absolutePath);
                        // if the changed file directory is this asset directory
                        // then we should recopy everything over again
                        if (changedFileDirPath === assetDirPath) {
                            shouldSkipAssetsCopy = false;
                            return;
                        }
                    });
                }
            });
        });
    });
    return shouldSkipAssetsCopy;
}

function getConfigCopyTasks(config, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const copyTasks = [];
        if (!Array.isArray(config.copy)) {
            return copyTasks;
        }
        if (buildCtx.isRebuild && !buildCtx.hasCopyChanges) {
            // don't bother copying if this was from a watch change
            // but the change didn't include any copy task files
            return copyTasks;
        }
        try {
            yield Promise.all(config.copy.map((copyTask) => __awaiter(this, void 0, void 0, function* () {
                yield processCopyTasks(config, copyTasks, copyTask);
            })));
        }
        catch (e) {
            const err = buildError(buildCtx.diagnostics);
            err.messageText = e.message;
        }
        buildCtx.debug(`getConfigCopyTasks: ${copyTasks.length}`);
        return copyTasks;
    });
}
function processCopyTasks(config, allCopyTasks, copyTask) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!copyTask) {
            // possible null was set, which is fine, just skip over this one
            return;
        }
        if (!copyTask.src) {
            throw new Error(`copy missing "src" property`);
        }
        if (copyTask.dest && isGlob(copyTask.dest)) {
            throw new Error(`copy "dest" property cannot be a glob: ${copyTask.dest}`);
        }
        const outputTargets = config.outputTargets.filter(outputTarget => {
            return outputTarget.appBuild;
        });
        if (isGlob(copyTask.src)) {
            const copyTasks = yield processGlob(config, outputTargets, copyTask);
            allCopyTasks.push(...copyTasks);
            return;
        }
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            if (outputTarget.collectionDir) {
                yield processCopyTaskDestDir(config, allCopyTasks, copyTask, outputTarget.collectionDir);
            }
            else {
                yield processCopyTaskDestDir(config, allCopyTasks, copyTask, outputTarget.dir);
            }
        })));
    });
}
function processCopyTaskDestDir(config, allCopyTasks, copyTask, destAbsDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const processedCopyTask = {
            src: getSrcAbsPath(config, copyTask.src),
            dest: getDestAbsPath(config, copyTask.src, destAbsDir, copyTask.dest)
        };
        if (typeof copyTask.warn === 'boolean') {
            processedCopyTask.warn = copyTask.warn;
        }
        allCopyTasks.push(processedCopyTask);
    });
}
function processGlob(config, outputTargets, copyTask) {
    return __awaiter(this, void 0, void 0, function* () {
        const globCopyTasks = [];
        const globOpts = {
            cwd: config.srcDir,
            nodir: true
        };
        const files = yield config.sys.glob(copyTask.src, globOpts);
        files.forEach(globRelPath => {
            outputTargets.forEach(outputTarget => {
                if (outputTarget.collectionDir) {
                    globCopyTasks.push(createGlobCopyTask(config, copyTask, outputTarget.collectionDir, globRelPath));
                }
                else {
                    globCopyTasks.push(createGlobCopyTask(config, copyTask, outputTarget.dir, globRelPath));
                }
            });
        });
        return globCopyTasks;
    });
}
function createGlobCopyTask(config, copyTask, destDir, globRelPath) {
    const processedCopyTask = {
        src: config.sys.path.join(config.srcDir, globRelPath),
    };
    if (copyTask.dest) {
        if (config.sys.path.isAbsolute(copyTask.dest)) {
            processedCopyTask.dest = config.sys.path.join(copyTask.dest, config.sys.path.basename(globRelPath));
        }
        else {
            processedCopyTask.dest = config.sys.path.join(destDir, copyTask.dest, config.sys.path.basename(globRelPath));
        }
    }
    else {
        processedCopyTask.dest = config.sys.path.join(destDir, globRelPath);
    }
    return processedCopyTask;
}
function getSrcAbsPath(config, src) {
    if (config.sys.path.isAbsolute(src)) {
        return src;
    }
    return config.sys.path.join(config.srcDir, src);
}
function getDestAbsPath(config, src, destAbsPath, destRelPath) {
    if (destRelPath) {
        if (config.sys.path.isAbsolute(destRelPath)) {
            return destRelPath;
        }
        else {
            return config.sys.path.join(destAbsPath, destRelPath);
        }
    }
    if (config.sys.path.isAbsolute(src)) {
        throw new Error(`copy task, "to" property must exist if "from" property is an absolute path: ${src}`);
    }
    return config.sys.path.join(destAbsPath, src);
}
function isCopyTaskFile(config, filePath) {
    if (!Array.isArray(config.copy)) {
        // there is no copy config
        return false;
    }
    filePath = normalizePath(filePath);
    // go through all the copy tasks and see if this path matches
    for (let i = 0; i < config.copy.length; i++) {
        var copySrc = config.copy[i].src;
        if (isGlob(copySrc)) {
            // test the glob
            copySrc = config.sys.path.join(config.srcDir, copySrc);
            if (minimatch_1(filePath, copySrc)) {
                return true;
            }
        }
        else {
            copySrc = normalizePath(getSrcAbsPath(config, copySrc));
            if (!config.sys.path.relative(copySrc, filePath).startsWith('.')) {
                return true;
            }
        }
    }
    return false;
}

function copyTasksMain(config, compilerCtx, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cmpAssetsCopyTasks = getComponentAssetsCopyTasks(config, compilerCtx, buildCtx, entryModules, buildCtx.filesChanged);
            const configCopyTasks = yield getConfigCopyTasks(config, buildCtx);
            const copyTasks = [
                ...configCopyTasks,
                ...cmpAssetsCopyTasks
            ];
            if (copyTasks.length > 0) {
                const timeSpan = buildCtx.createTimeSpan(`copyTasks started`, true);
                const copyResults = yield config.sys.copy(copyTasks);
                buildCtx.diagnostics.push(...copyResults.diagnostics);
                compilerCtx.fs.cancelDeleteDirectoriesFromDisk(copyResults.dirPaths);
                compilerCtx.fs.cancelDeleteFilesFromDisk(copyResults.filePaths);
                timeSpan.finish(`copyTasks finished`);
            }
        }
        catch (e) {
            const err = buildError(buildCtx.diagnostics);
            err.messageText = e.message;
        }
    });
}

function emptyOutputTargetDirs(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.isRebuild) {
            // only empty the directories on the first build
            return;
        }
        // let's empty out the build dest directory
        const outputTargets = config.outputTargets.filter(o => o.empty === true);
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            buildCtx.debug(`empty dir: ${outputTarget.dir}`);
            // Check if there is a .gitkeep file
            // We want to keep it so people don't have to readd manually
            // to their projects each time.
            const gitkeepPath = config.sys.path.join(outputTarget.dir, '.gitkeep');
            const existsGitkeep = yield compilerCtx.fs.access(gitkeepPath);
            yield compilerCtx.fs.emptyDir(outputTarget.dir);
            // If there was a .gitkeep file, add it again.
            if (existsGitkeep) {
                yield compilerCtx.fs.writeFile(gitkeepPath, '', { immediateWrite: true });
            }
        })));
    });
}

function loadRollupDiagnostics(config, compilerCtx, buildCtx, rollupError) {
    const d = {
        level: 'error',
        type: 'bundling',
        language: 'javascript',
        code: rollupError.code,
        header: `Rollup: ${formatErrorCode(rollupError.code)}`,
        messageText: rollupError.message,
        relFilePath: null,
        absFilePath: null,
        lines: []
    };
    if (rollupError.loc && rollupError.loc.file) {
        d.absFilePath = normalizePath(rollupError.loc.file);
        if (config) {
            d.relFilePath = normalizePath(config.sys.path.relative(config.cwd, d.absFilePath));
        }
        try {
            const sourceText = compilerCtx.fs.readFileSync(d.absFilePath);
            const srcLines = splitLineBreaks(sourceText);
            const errorLine = {
                lineIndex: rollupError.loc.line - 1,
                lineNumber: rollupError.loc.line,
                text: srcLines[rollupError.loc.line - 1],
                errorCharStart: rollupError.loc.column,
                errorLength: 0
            };
            d.lineNumber = errorLine.lineNumber;
            d.columnNumber = errorLine.errorCharStart;
            const highlightLine = errorLine.text.substr(rollupError.loc.column);
            for (var i = 0; i < highlightLine.length; i++) {
                if (charBreak.has(highlightLine.charAt(i))) {
                    break;
                }
                errorLine.errorLength++;
            }
            d.lines.push(errorLine);
            if (errorLine.errorLength === 0 && errorLine.errorCharStart > 0) {
                errorLine.errorLength = 1;
                errorLine.errorCharStart--;
            }
            if (errorLine.lineIndex > 0) {
                const previousLine = {
                    lineIndex: errorLine.lineIndex - 1,
                    lineNumber: errorLine.lineNumber - 1,
                    text: srcLines[errorLine.lineIndex - 1],
                    errorCharStart: -1,
                    errorLength: -1
                };
                d.lines.unshift(previousLine);
            }
            if (errorLine.lineIndex + 1 < srcLines.length) {
                const nextLine = {
                    lineIndex: errorLine.lineIndex + 1,
                    lineNumber: errorLine.lineNumber + 1,
                    text: srcLines[errorLine.lineIndex + 1],
                    errorCharStart: -1,
                    errorLength: -1
                };
                d.lines.push(nextLine);
            }
        }
        catch (e) {
            d.messageText = `Error parsing: ${rollupError.loc.file}, line: ${rollupError.loc.line}, column: ${rollupError.loc.column}`;
        }
    }
    buildCtx.diagnostics.push(d);
}
const charBreak = new Set([' ', '=', '.', ',', '?', ':', ';', '(', ')', '{', '}', '[', ']', '|', `'`, `"`, '`']);
function createOnWarnFn(config, diagnostics, bundleModulesFiles) {
    const previousWarns = new Set();
    return function onWarningMessage(warning) {
        if (!warning || previousWarns.has(warning.message)) {
            return;
        }
        previousWarns.add(warning.message);
        if (warning.code) {
            if (ignoreWarnCodes.has(warning.code)) {
                return;
            }
            if (suppressWarnCodes.has(warning.code)) {
                config.logger.debug(warning.message);
                return;
            }
        }
        let label = '';
        if (bundleModulesFiles) {
            label = bundleModulesFiles.map(moduleFile => moduleFile.cmpMeta.tagNameMeta).join(', ').trim();
            if (label.length) {
                label += ': ';
            }
        }
        const diagnostic = buildWarn(diagnostics);
        diagnostic.header = `Bundling Warning`;
        diagnostic.messageText = label + (warning.message || warning);
    };
}
const ignoreWarnCodes = new Set([
    `THIS_IS_UNDEFINED`, `NON_EXISTENT_EXPORT`
]);
const suppressWarnCodes = new Set([
    `CIRCULAR_DEPENDENCY`
]);
function formatErrorCode(errorCode) {
    if (typeof errorCode === 'string') {
        return errorCode.split('_').map(c => {
            return toTitleCase(c.toLowerCase());
        }).join(' ');
    }
    return errorCode;
}

var chars$1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function encode(decoded) {
    var sourceFileIndex = 0; // second field
    var sourceCodeLine = 0; // third field
    var sourceCodeColumn = 0; // fourth field
    var nameIndex = 0; // fifth field
    var mappings = '';
    for (var i = 0; i < decoded.length; i++) {
        var line = decoded[i];
        if (i > 0)
            mappings += ';';
        if (line.length === 0)
            continue;
        var generatedCodeColumn = 0; // first field
        var lineMappings = [];
        for (var _i = 0, line_1 = line; _i < line_1.length; _i++) {
            var segment = line_1[_i];
            var segmentMappings = encodeInteger(segment[0] - generatedCodeColumn);
            generatedCodeColumn = segment[0];
            if (segment.length > 1) {
                segmentMappings +=
                    encodeInteger(segment[1] - sourceFileIndex) +
                        encodeInteger(segment[2] - sourceCodeLine) +
                        encodeInteger(segment[3] - sourceCodeColumn);
                sourceFileIndex = segment[1];
                sourceCodeLine = segment[2];
                sourceCodeColumn = segment[3];
            }
            if (segment.length === 5) {
                segmentMappings += encodeInteger(segment[4] - nameIndex);
                nameIndex = segment[4];
            }
            lineMappings.push(segmentMappings);
        }
        mappings += lineMappings.join(',');
    }
    return mappings;
}
function encodeInteger(num) {
    var result = '';
    num = num < 0 ? (-num << 1) | 1 : num << 1;
    do {
        var clamped = num & 31;
        num >>= 5;
        if (num > 0) {
            clamped |= 32;
        }
        result += chars$1[clamped];
    } while (num > 0);
    return result;
}

var Chunk = function Chunk(start, end, content) {
	this.start = start;
	this.end = end;
	this.original = content;

	this.intro = '';
	this.outro = '';

	this.content = content;
	this.storeName = false;
	this.edited = false;

	// we make these non-enumerable, for sanity while debugging
	Object.defineProperties(this, {
		previous: { writable: true, value: null },
		next:     { writable: true, value: null }
	});
};

Chunk.prototype.appendLeft = function appendLeft (content) {
	this.outro += content;
};

Chunk.prototype.appendRight = function appendRight (content) {
	this.intro = this.intro + content;
};

Chunk.prototype.clone = function clone () {
	var chunk = new Chunk(this.start, this.end, this.original);

	chunk.intro = this.intro;
	chunk.outro = this.outro;
	chunk.content = this.content;
	chunk.storeName = this.storeName;
	chunk.edited = this.edited;

	return chunk;
};

Chunk.prototype.contains = function contains (index) {
	return this.start < index && index < this.end;
};

Chunk.prototype.eachNext = function eachNext (fn) {
	var chunk = this;
	while (chunk) {
		fn(chunk);
		chunk = chunk.next;
	}
};

Chunk.prototype.eachPrevious = function eachPrevious (fn) {
	var chunk = this;
	while (chunk) {
		fn(chunk);
		chunk = chunk.previous;
	}
};

Chunk.prototype.edit = function edit (content, storeName, contentOnly) {
	this.content = content;
	if (!contentOnly) {
		this.intro = '';
		this.outro = '';
	}
	this.storeName = storeName;

	this.edited = true;

	return this;
};

Chunk.prototype.prependLeft = function prependLeft (content) {
	this.outro = content + this.outro;
};

Chunk.prototype.prependRight = function prependRight (content) {
	this.intro = content + this.intro;
};

Chunk.prototype.split = function split (index) {
	var sliceIndex = index - this.start;

	var originalBefore = this.original.slice(0, sliceIndex);
	var originalAfter = this.original.slice(sliceIndex);

	this.original = originalBefore;

	var newChunk = new Chunk(index, this.end, originalAfter);
	newChunk.outro = this.outro;
	this.outro = '';

	this.end = index;

	if (this.edited) {
		// TODO is this block necessary?...
		newChunk.edit('', false);
		this.content = '';
	} else {
		this.content = originalBefore;
	}

	newChunk.next = this.next;
	if (newChunk.next) { newChunk.next.previous = newChunk; }
	newChunk.previous = this;
	this.next = newChunk;

	return newChunk;
};

Chunk.prototype.toString = function toString () {
	return this.intro + this.content + this.outro;
};

Chunk.prototype.trimEnd = function trimEnd (rx) {
	this.outro = this.outro.replace(rx, '');
	if (this.outro.length) { return true; }

	var trimmed = this.content.replace(rx, '');

	if (trimmed.length) {
		if (trimmed !== this.content) {
			this.split(this.start + trimmed.length).edit('', undefined, true);
		}
		return true;

	} else {
		this.edit('', undefined, true);

		this.intro = this.intro.replace(rx, '');
		if (this.intro.length) { return true; }
	}
};

Chunk.prototype.trimStart = function trimStart (rx) {
	this.intro = this.intro.replace(rx, '');
	if (this.intro.length) { return true; }

	var trimmed = this.content.replace(rx, '');

	if (trimmed.length) {
		if (trimmed !== this.content) {
			this.split(this.end - trimmed.length);
			this.edit('', undefined, true);
		}
		return true;

	} else {
		this.edit('', undefined, true);

		this.outro = this.outro.replace(rx, '');
		if (this.outro.length) { return true; }
	}
};

var btoa = function () {
	throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
};
if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
	btoa = window.btoa;
} else if (typeof Buffer === 'function') {
	btoa = function (str) { return new Buffer(str).toString('base64'); };
}

var SourceMap = function SourceMap(properties) {
	this.version = 3;
	this.file = properties.file;
	this.sources = properties.sources;
	this.sourcesContent = properties.sourcesContent;
	this.names = properties.names;
	this.mappings = encode(properties.mappings);
};

SourceMap.prototype.toString = function toString () {
	return JSON.stringify(this);
};

SourceMap.prototype.toUrl = function toUrl () {
	return 'data:application/json;charset=utf-8;base64,' + btoa(this.toString());
};

function guessIndent(code) {
	var lines = code.split('\n');

	var tabbed = lines.filter(function (line) { return /^\t+/.test(line); });
	var spaced = lines.filter(function (line) { return /^ {2,}/.test(line); });

	if (tabbed.length === 0 && spaced.length === 0) {
		return null;
	}

	// More lines tabbed than spaced? Assume tabs, and
	// default to tabs in the case of a tie (or nothing
	// to go on)
	if (tabbed.length >= spaced.length) {
		return '\t';
	}

	// Otherwise, we need to guess the multiple
	var min = spaced.reduce(function (previous, current) {
		var numSpaces = /^ +/.exec(current)[0].length;
		return Math.min(numSpaces, previous);
	}, Infinity);

	return new Array(min + 1).join(' ');
}

function getRelativePath(from, to) {
	var fromParts = from.split(/[/\\]/);
	var toParts = to.split(/[/\\]/);

	fromParts.pop(); // get dirname

	while (fromParts[0] === toParts[0]) {
		fromParts.shift();
		toParts.shift();
	}

	if (fromParts.length) {
		var i = fromParts.length;
		while (i--) { fromParts[i] = '..'; }
	}

	return fromParts.concat(toParts).join('/');
}

var toString = Object.prototype.toString;

function isObject$1(thing) {
	return toString.call(thing) === '[object Object]';
}

function getLocator(source) {
	var originalLines = source.split('\n');
	var lineOffsets = [];

	for (var i = 0, pos = 0; i < originalLines.length; i++) {
		lineOffsets.push(pos);
		pos += originalLines[i].length + 1;
	}

	return function locate(index) {
		var i = 0;
		var j = lineOffsets.length;
		while (i < j) {
			var m = (i + j) >> 1;
			if (index < lineOffsets[m]) {
				j = m;
			} else {
				i = m + 1;
			}
		}
		var line = i - 1;
		var column = index - lineOffsets[line];
		return { line: line, column: column };
	};
}

var Mappings = function Mappings(hires) {
	this.hires = hires;
	this.generatedCodeLine = 0;
	this.generatedCodeColumn = 0;
	this.raw = [];
	this.rawSegments = this.raw[this.generatedCodeLine] = [];
	this.pending = null;
};

Mappings.prototype.addEdit = function addEdit (sourceIndex, content, loc, nameIndex) {
	if (content.length) {
		var segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
		if (nameIndex >= 0) {
			segment.push(nameIndex);
		}
		this.rawSegments.push(segment);
	} else if (this.pending) {
		this.rawSegments.push(this.pending);
	}

	this.advance(content);
	this.pending = null;
};

Mappings.prototype.addUneditedChunk = function addUneditedChunk (sourceIndex, chunk, original, loc, sourcemapLocations) {
		var this$1 = this;

	var originalCharIndex = chunk.start;
	var first = true;

	while (originalCharIndex < chunk.end) {
		if (this$1.hires || first || sourcemapLocations[originalCharIndex]) {
			this$1.rawSegments.push([this$1.generatedCodeColumn, sourceIndex, loc.line, loc.column]);
		}

		if (original[originalCharIndex] === '\n') {
			loc.line += 1;
			loc.column = 0;
			this$1.generatedCodeLine += 1;
			this$1.raw[this$1.generatedCodeLine] = this$1.rawSegments = [];
			this$1.generatedCodeColumn = 0;
		} else {
			loc.column += 1;
			this$1.generatedCodeColumn += 1;
		}

		originalCharIndex += 1;
		first = false;
	}

	this.pending = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
};

Mappings.prototype.advance = function advance (str) {
		var this$1 = this;

	if (!str) { return; }

	var lines = str.split('\n');

	if (lines.length > 1) {
		for (var i = 0; i < lines.length - 1; i++) {
			this$1.generatedCodeLine++;
			this$1.raw[this$1.generatedCodeLine] = this$1.rawSegments = [];
		}
		this.generatedCodeColumn = 0;
	}

	this.generatedCodeColumn += lines[lines.length - 1].length;
};

var n = '\n';

var warned = {
	insertLeft: false,
	insertRight: false,
	storeName: false
};

var MagicString = function MagicString(string, options) {
	if ( options === void 0 ) options = {};

	var chunk = new Chunk(0, string.length, string);

	Object.defineProperties(this, {
		original:              { writable: true, value: string },
		outro:                 { writable: true, value: '' },
		intro:                 { writable: true, value: '' },
		firstChunk:            { writable: true, value: chunk },
		lastChunk:             { writable: true, value: chunk },
		lastSearchedChunk:     { writable: true, value: chunk },
		byStart:               { writable: true, value: {} },
		byEnd:                 { writable: true, value: {} },
		filename:              { writable: true, value: options.filename },
		indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
		sourcemapLocations:    { writable: true, value: {} },
		storedNames:           { writable: true, value: {} },
		indentStr:             { writable: true, value: guessIndent(string) }
	});

	this.byStart[0] = chunk;
	this.byEnd[string.length] = chunk;
};

MagicString.prototype.addSourcemapLocation = function addSourcemapLocation (char) {
	this.sourcemapLocations[char] = true;
};

MagicString.prototype.append = function append (content) {
	if (typeof content !== 'string') { throw new TypeError('outro content must be a string'); }

	this.outro += content;
	return this;
};

MagicString.prototype.appendLeft = function appendLeft (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byEnd[index];

	if (chunk) {
		chunk.appendLeft(content);
	} else {
		this.intro += content;
	}
	return this;
};

MagicString.prototype.appendRight = function appendRight (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byStart[index];

	if (chunk) {
		chunk.appendRight(content);
	} else {
		this.outro += content;
	}
	return this;
};

MagicString.prototype.clone = function clone () {
	var cloned = new MagicString(this.original, { filename: this.filename });

	var originalChunk = this.firstChunk;
	var clonedChunk = (cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone());

	while (originalChunk) {
		cloned.byStart[clonedChunk.start] = clonedChunk;
		cloned.byEnd[clonedChunk.end] = clonedChunk;

		var nextOriginalChunk = originalChunk.next;
		var nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

		if (nextClonedChunk) {
			clonedChunk.next = nextClonedChunk;
			nextClonedChunk.previous = clonedChunk;

			clonedChunk = nextClonedChunk;
		}

		originalChunk = nextOriginalChunk;
	}

	cloned.lastChunk = clonedChunk;

	if (this.indentExclusionRanges) {
		cloned.indentExclusionRanges = this.indentExclusionRanges.slice();
	}

	Object.keys(this.sourcemapLocations).forEach(function (loc) {
		cloned.sourcemapLocations[loc] = true;
	});

	return cloned;
};

MagicString.prototype.generateDecodedMap = function generateDecodedMap (options) {
		var this$1 = this;

	options = options || {};

	var sourceIndex = 0;
	var names = Object.keys(this.storedNames);
	var mappings = new Mappings(options.hires);

	var locate = getLocator(this.original);

	if (this.intro) {
		mappings.advance(this.intro);
	}

	this.firstChunk.eachNext(function (chunk) {
		var loc = locate(chunk.start);

		if (chunk.intro.length) { mappings.advance(chunk.intro); }

		if (chunk.edited) {
			mappings.addEdit(
				sourceIndex,
				chunk.content,
				loc,
				chunk.storeName ? names.indexOf(chunk.original) : -1
			);
		} else {
			mappings.addUneditedChunk(sourceIndex, chunk, this$1.original, loc, this$1.sourcemapLocations);
		}

		if (chunk.outro.length) { mappings.advance(chunk.outro); }
	});

	return {
		file: options.file ? options.file.split(/[/\\]/).pop() : null,
		sources: [options.source ? getRelativePath(options.file || '', options.source) : null],
		sourcesContent: options.includeContent ? [this.original] : [null],
		names: names,
		mappings: mappings.raw
	};
};

MagicString.prototype.generateMap = function generateMap (options) {
	return new SourceMap(this.generateDecodedMap(options));
};

MagicString.prototype.getIndentString = function getIndentString () {
	return this.indentStr === null ? '\t' : this.indentStr;
};

MagicString.prototype.indent = function indent (indentStr, options) {
		var this$1 = this;

	var pattern = /^[^\r\n]/gm;

	if (isObject$1(indentStr)) {
		options = indentStr;
		indentStr = undefined;
	}

	indentStr = indentStr !== undefined ? indentStr : this.indentStr || '\t';

	if (indentStr === '') { return this; } // noop

	options = options || {};

	// Process exclusion ranges
	var isExcluded = {};

	if (options.exclude) {
		var exclusions =
			typeof options.exclude[0] === 'number' ? [options.exclude] : options.exclude;
		exclusions.forEach(function (exclusion) {
			for (var i = exclusion[0]; i < exclusion[1]; i += 1) {
				isExcluded[i] = true;
			}
		});
	}

	var shouldIndentNextCharacter = options.indentStart !== false;
	var replacer = function (match) {
		if (shouldIndentNextCharacter) { return ("" + indentStr + match); }
		shouldIndentNextCharacter = true;
		return match;
	};

	this.intro = this.intro.replace(pattern, replacer);

	var charIndex = 0;
	var chunk = this.firstChunk;

	while (chunk) {
		var end = chunk.end;

		if (chunk.edited) {
			if (!isExcluded[charIndex]) {
				chunk.content = chunk.content.replace(pattern, replacer);

				if (chunk.content.length) {
					shouldIndentNextCharacter = chunk.content[chunk.content.length - 1] === '\n';
				}
			}
		} else {
			charIndex = chunk.start;

			while (charIndex < end) {
				if (!isExcluded[charIndex]) {
					var char = this$1.original[charIndex];

					if (char === '\n') {
						shouldIndentNextCharacter = true;
					} else if (char !== '\r' && shouldIndentNextCharacter) {
						shouldIndentNextCharacter = false;

						if (charIndex === chunk.start) {
							chunk.prependRight(indentStr);
						} else {
							this$1._splitChunk(chunk, charIndex);
							chunk = chunk.next;
							chunk.prependRight(indentStr);
						}
					}
				}

				charIndex += 1;
			}
		}

		charIndex = chunk.end;
		chunk = chunk.next;
	}

	this.outro = this.outro.replace(pattern, replacer);

	return this;
};

MagicString.prototype.insert = function insert () {
	throw new Error('magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)');
};

MagicString.prototype.insertLeft = function insertLeft (index, content) {
	if (!warned.insertLeft) {
		console.warn('magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead'); // eslint-disable-line no-console
		warned.insertLeft = true;
	}

	return this.appendLeft(index, content);
};

MagicString.prototype.insertRight = function insertRight (index, content) {
	if (!warned.insertRight) {
		console.warn('magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead'); // eslint-disable-line no-console
		warned.insertRight = true;
	}

	return this.prependRight(index, content);
};

MagicString.prototype.move = function move (start, end, index) {
	if (index >= start && index <= end) { throw new Error('Cannot move a selection inside itself'); }

	this._split(start);
	this._split(end);
	this._split(index);

	var first = this.byStart[start];
	var last = this.byEnd[end];

	var oldLeft = first.previous;
	var oldRight = last.next;

	var newRight = this.byStart[index];
	if (!newRight && last === this.lastChunk) { return this; }
	var newLeft = newRight ? newRight.previous : this.lastChunk;

	if (oldLeft) { oldLeft.next = oldRight; }
	if (oldRight) { oldRight.previous = oldLeft; }

	if (newLeft) { newLeft.next = first; }
	if (newRight) { newRight.previous = last; }

	if (!first.previous) { this.firstChunk = last.next; }
	if (!last.next) {
		this.lastChunk = first.previous;
		this.lastChunk.next = null;
	}

	first.previous = newLeft;
	last.next = newRight || null;

	if (!newLeft) { this.firstChunk = first; }
	if (!newRight) { this.lastChunk = last; }
	return this;
};

MagicString.prototype.overwrite = function overwrite (start, end, content, options) {
		var this$1 = this;

	if (typeof content !== 'string') { throw new TypeError('replacement content must be a string'); }

	while (start < 0) { start += this$1.original.length; }
	while (end < 0) { end += this$1.original.length; }

	if (end > this.original.length) { throw new Error('end is out of bounds'); }
	if (start === end)
		{ throw new Error('Cannot overwrite a zero-length range – use appendLeft or prependRight instead'); }

	this._split(start);
	this._split(end);

	if (options === true) {
		if (!warned.storeName) {
			console.warn('The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string'); // eslint-disable-line no-console
			warned.storeName = true;
		}

		options = { storeName: true };
	}
	var storeName = options !== undefined ? options.storeName : false;
	var contentOnly = options !== undefined ? options.contentOnly : false;

	if (storeName) {
		var original = this.original.slice(start, end);
		this.storedNames[original] = true;
	}

	var first = this.byStart[start];
	var last = this.byEnd[end];

	if (first) {
		if (end > first.end && first.next !== this.byStart[first.end]) {
			throw new Error('Cannot overwrite across a split point');
		}

		first.edit(content, storeName, contentOnly);

		if (first !== last) {
			var chunk = first.next;
			while (chunk !== last) {
				chunk.edit('', false);
				chunk = chunk.next;
			}

			chunk.edit('', false);
		}
	} else {
		// must be inserting at the end
		var newChunk = new Chunk(start, end, '').edit(content, storeName);

		// TODO last chunk in the array may not be the last chunk, if it's moved...
		last.next = newChunk;
		newChunk.previous = last;
	}
	return this;
};

MagicString.prototype.prepend = function prepend (content) {
	if (typeof content !== 'string') { throw new TypeError('outro content must be a string'); }

	this.intro = content + this.intro;
	return this;
};

MagicString.prototype.prependLeft = function prependLeft (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byEnd[index];

	if (chunk) {
		chunk.prependLeft(content);
	} else {
		this.intro = content + this.intro;
	}
	return this;
};

MagicString.prototype.prependRight = function prependRight (index, content) {
	if (typeof content !== 'string') { throw new TypeError('inserted content must be a string'); }

	this._split(index);

	var chunk = this.byStart[index];

	if (chunk) {
		chunk.prependRight(content);
	} else {
		this.outro = content + this.outro;
	}
	return this;
};

MagicString.prototype.remove = function remove (start, end) {
		var this$1 = this;

	while (start < 0) { start += this$1.original.length; }
	while (end < 0) { end += this$1.original.length; }

	if (start === end) { return this; }

	if (start < 0 || end > this.original.length) { throw new Error('Character is out of bounds'); }
	if (start > end) { throw new Error('end must be greater than start'); }

	this._split(start);
	this._split(end);

	var chunk = this.byStart[start];

	while (chunk) {
		chunk.intro = '';
		chunk.outro = '';
		chunk.edit('');

		chunk = end > chunk.end ? this$1.byStart[chunk.end] : null;
	}
	return this;
};

MagicString.prototype.lastChar = function lastChar () {
	if (this.outro.length)
		{ return this.outro[this.outro.length - 1]; }
	var chunk = this.lastChunk;
	do {
		if (chunk.outro.length)
			{ return chunk.outro[chunk.outro.length - 1]; }
		if (chunk.content.length)
			{ return chunk.content[chunk.content.length - 1]; }
		if (chunk.intro.length)
			{ return chunk.intro[chunk.intro.length - 1]; }
	} while (chunk = chunk.previous);
	if (this.intro.length)
		{ return this.intro[this.intro.length - 1]; }
	return '';
};

MagicString.prototype.lastLine = function lastLine () {
	var lineIndex = this.outro.lastIndexOf(n);
	if (lineIndex !== -1)
		{ return this.outro.substr(lineIndex + 1); }
	var lineStr = this.outro;
	var chunk = this.lastChunk;
	do {
		if (chunk.outro.length > 0) {
			lineIndex = chunk.outro.lastIndexOf(n);
			if (lineIndex !== -1)
				{ return chunk.outro.substr(lineIndex + 1) + lineStr; }
			lineStr = chunk.outro + lineStr;
		}

		if (chunk.content.length > 0) {
			lineIndex = chunk.content.lastIndexOf(n);
			if (lineIndex !== -1)
				{ return chunk.content.substr(lineIndex + 1) + lineStr; }
			lineStr = chunk.content + lineStr;
		}

		if (chunk.intro.length > 0) {
			lineIndex = chunk.intro.lastIndexOf(n);
			if (lineIndex !== -1)
				{ return chunk.intro.substr(lineIndex + 1) + lineStr; }
			lineStr = chunk.intro + lineStr;
		}
	} while (chunk = chunk.previous);
	lineIndex = this.intro.lastIndexOf(n);
	if (lineIndex !== -1)
		{ return this.intro.substr(lineIndex + 1) + lineStr; }
	return this.intro + lineStr;
};

MagicString.prototype.slice = function slice (start, end) {
		var this$1 = this;
		if ( start === void 0 ) start = 0;
		if ( end === void 0 ) end = this.original.length;

	while (start < 0) { start += this$1.original.length; }
	while (end < 0) { end += this$1.original.length; }

	var result = '';

	// find start chunk
	var chunk = this.firstChunk;
	while (chunk && (chunk.start > start || chunk.end <= start)) {
		// found end chunk before start
		if (chunk.start < end && chunk.end >= end) {
			return result;
		}

		chunk = chunk.next;
	}

	if (chunk && chunk.edited && chunk.start !== start)
		{ throw new Error(("Cannot use replaced character " + start + " as slice start anchor.")); }

	var startChunk = chunk;
	while (chunk) {
		if (chunk.intro && (startChunk !== chunk || chunk.start === start)) {
			result += chunk.intro;
		}

		var containsEnd = chunk.start < end && chunk.end >= end;
		if (containsEnd && chunk.edited && chunk.end !== end)
			{ throw new Error(("Cannot use replaced character " + end + " as slice end anchor.")); }

		var sliceStart = startChunk === chunk ? start - chunk.start : 0;
		var sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;

		result += chunk.content.slice(sliceStart, sliceEnd);

		if (chunk.outro && (!containsEnd || chunk.end === end)) {
			result += chunk.outro;
		}

		if (containsEnd) {
			break;
		}

		chunk = chunk.next;
	}

	return result;
};

// TODO deprecate this? not really very useful
MagicString.prototype.snip = function snip (start, end) {
	var clone = this.clone();
	clone.remove(0, start);
	clone.remove(end, clone.original.length);

	return clone;
};

MagicString.prototype._split = function _split (index) {
		var this$1 = this;

	if (this.byStart[index] || this.byEnd[index]) { return; }

	var chunk = this.lastSearchedChunk;
	var searchForward = index > chunk.end;

	while (chunk) {
		if (chunk.contains(index)) { return this$1._splitChunk(chunk, index); }

		chunk = searchForward ? this$1.byStart[chunk.end] : this$1.byEnd[chunk.start];
	}
};

MagicString.prototype._splitChunk = function _splitChunk (chunk, index) {
	if (chunk.edited && chunk.content.length) {
		// zero-length edited chunks are a special case (overlapping replacements)
		var loc = getLocator(this.original)(index);
		throw new Error(
			("Cannot split a chunk that has already been edited (" + (loc.line) + ":" + (loc.column) + " – \"" + (chunk.original) + "\")")
		);
	}

	var newChunk = chunk.split(index);

	this.byEnd[index] = chunk;
	this.byStart[index] = newChunk;
	this.byEnd[newChunk.end] = newChunk;

	if (chunk === this.lastChunk) { this.lastChunk = newChunk; }

	this.lastSearchedChunk = chunk;
	return true;
};

MagicString.prototype.toString = function toString () {
	var str = this.intro;

	var chunk = this.firstChunk;
	while (chunk) {
		str += chunk.toString();
		chunk = chunk.next;
	}

	return str + this.outro;
};

MagicString.prototype.isEmpty = function isEmpty () {
	var chunk = this.firstChunk;
	do {
		if (chunk.intro.length && chunk.intro.trim() ||
				chunk.content.length && chunk.content.trim() ||
				chunk.outro.length && chunk.outro.trim())
			{ return false; }
	} while (chunk = chunk.next);
	return true;
};

MagicString.prototype.length = function length () {
	var chunk = this.firstChunk;
	var length = 0;
	do {
		length += chunk.intro.length + chunk.content.length + chunk.outro.length;
	} while (chunk = chunk.next);
	return length;
};

MagicString.prototype.trimLines = function trimLines () {
	return this.trim('[\\r\\n]');
};

MagicString.prototype.trim = function trim (charType) {
	return this.trimStart(charType).trimEnd(charType);
};

MagicString.prototype.trimEndAborted = function trimEndAborted (charType) {
		var this$1 = this;

	var rx = new RegExp((charType || '\\s') + '+$');

	this.outro = this.outro.replace(rx, '');
	if (this.outro.length) { return true; }

	var chunk = this.lastChunk;

	do {
		var end = chunk.end;
		var aborted = chunk.trimEnd(rx);

		// if chunk was trimmed, we have a new lastChunk
		if (chunk.end !== end) {
			if (this$1.lastChunk === chunk) {
				this$1.lastChunk = chunk.next;
			}

			this$1.byEnd[chunk.end] = chunk;
			this$1.byStart[chunk.next.start] = chunk.next;
			this$1.byEnd[chunk.next.end] = chunk.next;
		}

		if (aborted) { return true; }
		chunk = chunk.previous;
	} while (chunk);

	return false;
};

MagicString.prototype.trimEnd = function trimEnd (charType) {
	this.trimEndAborted(charType);
	return this;
};
MagicString.prototype.trimStartAborted = function trimStartAborted (charType) {
		var this$1 = this;

	var rx = new RegExp('^' + (charType || '\\s') + '+');

	this.intro = this.intro.replace(rx, '');
	if (this.intro.length) { return true; }

	var chunk = this.firstChunk;

	do {
		var end = chunk.end;
		var aborted = chunk.trimStart(rx);

		if (chunk.end !== end) {
			// special case...
			if (chunk === this$1.lastChunk) { this$1.lastChunk = chunk.next; }

			this$1.byEnd[chunk.end] = chunk;
			this$1.byStart[chunk.next.start] = chunk.next;
			this$1.byEnd[chunk.next.end] = chunk.next;
		}

		if (aborted) { return true; }
		chunk = chunk.next;
	} while (chunk);

	return false;
};

MagicString.prototype.trimStart = function trimStart (charType) {
	this.trimStartAborted(charType);
	return this;
};

function escape(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
function ensureFunction(functionOrValue) {
    if (typeof functionOrValue === 'function')
        return functionOrValue;
    return () => functionOrValue;
}
function longest(a, b) {
    return b.length - a.length;
}
function getReplacements(options) {
    return Object.assign({}, options.values);
}
function mapToFunctions(object) {
    const functions = {};
    Object.keys(object).forEach(key => {
        functions[key] = ensureFunction(object[key]);
    });
    return functions;
}
function replace(options) {
    const { delimiters } = options;
    const functionValues = mapToFunctions(getReplacements(options));
    const keys = Object.keys(functionValues)
        .sort(longest)
        .map(escape);
    const pattern = delimiters
        ? new RegExp(`${escape(delimiters[0])}(${keys.join('|')})${escape(delimiters[1])}`, 'g')
        : new RegExp(`\\b(${keys.join('|')})\\b`, 'g');
    return {
        name: 'replace',
        transform(code, id) {
            const magicString = new MagicString(code);
            let hasReplacements = false;
            let match;
            let start;
            let end;
            let replacement;
            while ((match = pattern.exec(code))) {
                hasReplacements = true;
                start = match.index;
                end = start + match[0].length;
                replacement = String(functionValues[match[1]](id));
                magicString.overwrite(start, end, replacement);
            }
            if (!hasReplacements)
                return null;
            return { code: magicString.toString() };
        }
    };
}

function getComponentRefsFromSourceStrings(moduleFiles) {
    const componentRefs = [];
    const tags = moduleFiles
        .filter(moduleFile => !!moduleFile.cmpMeta)
        .map(moduleFile => moduleFile.cmpMeta.tagNameMeta);
    moduleFiles.forEach(moduleFile => {
        moduleFile.potentialCmpRefs.forEach(potentialCmpRef => {
            parsePotentialComponentRef(componentRefs, tags, moduleFile, potentialCmpRef);
        });
    });
    return componentRefs;
}
function parsePotentialComponentRef(componentRefs, tags, moduleFile, potentialCmpRef) {
    if (typeof potentialCmpRef.tag === 'string') {
        potentialCmpRef.tag = potentialCmpRef.tag.toLowerCase();
        if (tags.some(tag => potentialCmpRef.tag === tag)) {
            // exact match, we're good
            // probably something like h('ion-button') or
            // document.createElement('ion-toggle');
            componentRefs.push({
                tag: potentialCmpRef.tag,
                filePath: moduleFile.sourceFilePath
            });
        }
    }
    else if (typeof potentialCmpRef.html === 'string') {
        // string could be HTML
        // could be something like elm.innerHTML = '<ion-button>';
        // replace any whitespace with a ~ character
        // this is especially important for newlines and tabs
        // for tag with attributes and has a newline in the tag
        potentialCmpRef.html = potentialCmpRef.html.toLowerCase().replace(/\s/g, '~');
        const foundTags = tags.filter(tag => {
            return potentialCmpRef.html.includes('<' + tag + '>') ||
                potentialCmpRef.html.includes('</' + tag + '>') ||
                potentialCmpRef.html.includes('<' + tag + '~');
        });
        foundTags.forEach(foundTag => {
            componentRefs.push({
                tag: foundTag,
                filePath: moduleFile.sourceFilePath
            });
        });
    }
}

function calcComponentDependencies(moduleFiles) {
    // figure out all the component references seen in each file
    // these are all the the components found in the app, and which file it was found in
    const componentRefs = getComponentRefsFromSourceStrings(moduleFiles);
    // go through all the module files in the app
    moduleFiles.forEach(moduleFile => {
        if (moduleFile.cmpMeta) {
            // if this module file has component metadata
            // then let's figure out which dependencies it has
            getComponentDependencies(moduleFiles, componentRefs, moduleFile);
        }
    });
}
function getComponentDependencies(moduleFiles, componentRefs, moduleFile) {
    // build a list of all the component dependencies this has, using their tag as the key
    moduleFile.cmpMeta.dependencies = moduleFile.cmpMeta.dependencies || [];
    // figure out if this file has any components in it
    // get all the component references for this file path
    const componentRefsOfFile = componentRefs.filter(cr => cr.filePath === moduleFile.sourceFilePath);
    // get the tags for the component references with this file path
    const refTags = componentRefsOfFile.map(cr => cr.tag);
    // for each component ref of this file
    // go ahead and add the tag to the cmp metadata dependencies
    refTags.forEach(tag => {
        if (tag !== moduleFile.cmpMeta.tagNameMeta && !moduleFile.cmpMeta.dependencies.includes(tag)) {
            moduleFile.cmpMeta.dependencies.push(tag);
        }
    });
    const importsInspected = [];
    getComponentDepsFromImports(moduleFiles, componentRefs, importsInspected, moduleFile, moduleFile.cmpMeta);
    moduleFile.cmpMeta.dependencies.sort();
}
function getComponentDepsFromImports(moduleFiles, componentRefs, importsInspected, inspectModuleFile, cmpMeta) {
    inspectModuleFile.localImports.forEach(localImport => {
        if (importsInspected.includes(localImport)) {
            return;
        }
        importsInspected.push(localImport);
        const subModuleFile = moduleFiles.find(moduleFile => {
            return (moduleFile.sourceFilePath === localImport) ||
                (moduleFile.sourceFilePath === localImport + '.ts') ||
                (moduleFile.sourceFilePath === localImport + '.tsx') ||
                (moduleFile.sourceFilePath === localImport + '.js');
        });
        if (subModuleFile) {
            const tags = componentRefs.filter(cr => cr.filePath === subModuleFile.sourceFilePath).map(cr => cr.tag);
            tags.forEach(tag => {
                if (!cmpMeta.dependencies.includes(tag)) {
                    cmpMeta.dependencies.push(tag);
                }
            });
            getComponentDepsFromImports(moduleFiles, componentRefs, importsInspected, subModuleFile, cmpMeta);
        }
    });
}

function processAppGraph(buildCtx, allModules, entryTags) {
    const graph = getGraph(buildCtx, allModules, entryTags);
    const entryPoints = [];
    for (const graphEntry of graph) {
        if (entryPoints.some(en => en.some(ec => ec.tag === graphEntry.tag))) {
            // already handled this one
            continue;
        }
        const depsOf = graph.filter(d => d.dependencies.includes(graphEntry.tag));
        if (depsOf.length > 1) {
            const commonEntryCmps = [];
            depsOf.forEach(depOf => {
                depOf.dependencies.forEach(depTag => {
                    if (depsOf.every(d => d.dependencies.includes(depTag))) {
                        const existingCommonEntryCmp = commonEntryCmps.find(ec => {
                            return ec.tag === depTag;
                        });
                        if (existingCommonEntryCmp) {
                            existingCommonEntryCmp.dependencyOf.push(depOf.tag);
                        }
                        else {
                            commonEntryCmps.push({
                                tag: depTag,
                                dependencyOf: [depOf.tag]
                            });
                        }
                    }
                });
            });
            const existingEntryPoint = entryPoints.find(ep => {
                return ep.some(ec => commonEntryCmps.some(cec => cec.tag === ec.tag));
            });
            if (existingEntryPoint) {
                const depsOf = graph.filter(d => d.dependencies.includes(graphEntry.tag));
                if (depsOf.length > 0) {
                    const existingEntryPointDepOf = entryPoints.find(ep => ep.some(ec => depsOf.some(d => d.dependencies.includes(ec.tag))));
                    if (existingEntryPointDepOf) {
                        existingEntryPointDepOf.push({
                            tag: graphEntry.tag,
                            dependencyOf: depsOf.map(d => d.tag)
                        });
                    }
                    else {
                        entryPoints.push([
                            {
                                tag: graphEntry.tag,
                                dependencyOf: []
                            }
                        ]);
                    }
                }
                else {
                    entryPoints.push([
                        {
                            tag: graphEntry.tag,
                            dependencyOf: []
                        }
                    ]);
                }
            }
            else {
                entryPoints.push(commonEntryCmps);
            }
        }
        else if (depsOf.length === 1) {
            const existingEntryPoint = entryPoints.find(ep => ep.some(ec => ec.tag === depsOf[0].tag));
            if (existingEntryPoint) {
                existingEntryPoint.push({
                    tag: graphEntry.tag,
                    dependencyOf: [depsOf[0].tag]
                });
            }
            else {
                entryPoints.push([
                    {
                        tag: depsOf[0].tag,
                        dependencyOf: []
                    },
                    {
                        tag: graphEntry.tag,
                        dependencyOf: [depsOf[0].tag]
                    }
                ]);
            }
        }
        else {
            entryPoints.push([
                {
                    tag: graphEntry.tag,
                    dependencyOf: []
                }
            ]);
        }
    }
    entryPoints.forEach(entryPoint => {
        entryPoint.forEach(entryCmp => {
            entryCmp.dependencyOf.sort();
        });
        entryPoint.sort((a, b) => {
            if (a.tag < b.tag)
                return -1;
            if (a.tag > b.tag)
                return 1;
            return 0;
        });
    });
    entryPoints.sort((a, b) => {
        if (a[0].tag < b[0].tag)
            return -1;
        if (a[0].tag > b[0].tag)
            return 1;
        return 0;
    });
    return entryPoints;
}
function getGraph(buildCtx, allModules, entryTags) {
    const graph = [];
    function addDeps(tag) {
        if (graph.some(d => d.tag === tag)) {
            return;
        }
        const m = allModules.find(m => m.cmpMeta && m.cmpMeta.tagNameMeta === tag);
        if (!m) {
            const diagnostic = buildError(buildCtx.diagnostics);
            diagnostic.messageText = `unable to find tag "${tag}" while generating component graph`;
            return;
        }
        m.cmpMeta.dependencies = (m.cmpMeta.dependencies || []);
        const dependencies = m.cmpMeta.dependencies.filter(t => t !== tag).sort();
        graph.push({
            tag: tag,
            dependencies: dependencies
        });
        dependencies.forEach(addDeps);
    }
    entryTags.forEach(addDeps);
    return graph;
}

function generateComponentEntries(_config, buildCtx, allModules, userConfigEntryTags, appEntryTags) {
    // user config entry modules you leave as is
    // whatever the user put in the bundle is how it goes
    // get all the config.bundle entry tags the user may have manually configured
    const userConfigEntryPoints = processUserConfigBundles(userConfigEntryTags);
    // process all of the app's components not already found
    // in the config or the root html
    const appEntries = processAppComponentEntryTags(buildCtx, allModules, userConfigEntryPoints, appEntryTags);
    return [
        ...userConfigEntryPoints,
        ...appEntries
    ];
}
function processAppComponentEntryTags(buildCtx, allModules, entryPoints, appEntryTags) {
    // remove any tags already found in user config
    appEntryTags = appEntryTags.filter(tag => !entryPoints.some(ep => ep.some(em => em.tag === tag)));
    if (entryPoints.length > 0 && appEntryTags.length > 0) {
        appEntryTags.forEach(appEntryTag => {
            const warn = buildWarn(buildCtx.diagnostics);
            warn.header = `Stencil Config`;
            warn.messageText = `config.bundles does not include component tag "${appEntryTag}". When manually configurating config.bundles, all component tags used by this app must be listed in a component bundle.`;
        });
    }
    return processAppGraph(buildCtx, allModules, appEntryTags);
}
function processUserConfigBundles(userConfigEntryTags) {
    return userConfigEntryTags.map(entryTags => {
        return entryTags.map(entryTag => {
            const entryComponent = {
                tag: entryTag,
                dependencyOf: ['#config']
            };
            return entryComponent;
        });
    });
}

function validateComponentTag(tag) {
    if (typeof tag !== 'string') {
        throw new Error(`Tag "${tag}" must be a string type`);
    }
    tag = tag.trim().toLowerCase();
    if (tag.length === 0) {
        throw new Error(`Received empty tag value`);
    }
    if (tag.indexOf(' ') > -1) {
        throw new Error(`"${tag}" tag cannot contain a space`);
    }
    if (tag.indexOf(',') > -1) {
        throw new Error(`"${tag}" tag cannot be use for multiple tags`);
    }
    const invalidChars = tag.replace(/\w|-/g, '');
    if (invalidChars !== '') {
        throw new Error(`"${tag}" tag contains invalid characters: ${invalidChars}`);
    }
    if (tag.indexOf('-') === -1) {
        throw new Error(`"${tag}" tag must contain a dash (-) to work as a valid web component`);
    }
    if (tag.indexOf('--') > -1) {
        throw new Error(`"${tag}" tag cannot contain multiple dashes (--) next to each other`);
    }
    if (tag.indexOf('-') === 0) {
        throw new Error(`"${tag}" tag cannot start with a dash (-)`);
    }
    if (tag.lastIndexOf('-') === tag.length - 1) {
        throw new Error(`"${tag}" tag cannot end with a dash (-)`);
    }
    return tag;
}

function generateEntryModules(config, compilerCtx, buildCtx) {
    buildCtx.entryModules = [];
    const moduleFiles = Object.keys(compilerCtx.moduleFiles).map(filePath => {
        return compilerCtx.moduleFiles[filePath];
    });
    // figure out how modules and components connect
    calcComponentDependencies(moduleFiles);
    try {
        const allModules = validateComponentEntries(config, compilerCtx, buildCtx);
        const userConfigEntryModulesTags = getUserConfigEntryTags(buildCtx, config.bundles, allModules);
        const appEntryTags = getAppEntryTags(allModules);
        buildCtx.entryPoints = generateComponentEntries(config, buildCtx, allModules, userConfigEntryModulesTags, appEntryTags);
        const cleanedEntryModules = regroupEntryModules(allModules, buildCtx.entryPoints);
        buildCtx.entryModules = cleanedEntryModules
            .map(createEntryModule(config))
            .filter((entryModule, index, array) => {
            const firstIndex = array.findIndex(e => e.entryKey === entryModule.entryKey);
            return firstIndex === index;
        });
    }
    catch (e) {
        catchError(buildCtx.diagnostics, e);
    }
    buildCtx.debug(`generateEntryModules, ${buildCtx.entryModules.length} entryModules`);
    return buildCtx.entryModules;
}
function getEntryModes(moduleFiles) {
    const styleModeNames = [];
    moduleFiles.forEach(m => {
        const cmpStyleModes = getComponentStyleModes(m.cmpMeta);
        cmpStyleModes.forEach(modeName => {
            if (!styleModeNames.includes(modeName)) {
                styleModeNames.push(modeName);
            }
        });
    });
    if (styleModeNames.length === 0) {
        styleModeNames.push(DEFAULT_STYLE_MODE);
    }
    else if (styleModeNames.length > 1) {
        const index = (styleModeNames.indexOf(DEFAULT_STYLE_MODE));
        if (index > -1) {
            styleModeNames.splice(index, 1);
        }
    }
    return styleModeNames.sort();
}
function getComponentStyleModes(cmpMeta) {
    return (cmpMeta && cmpMeta.stylesMeta) ? Object.keys(cmpMeta.stylesMeta) : [];
}
function regroupEntryModules(allModules, entryPoints) {
    const cleanedEntryModules = entryPoints.map(entryPoint => {
        return allModules.filter(m => {
            return entryPoint.some(ep => m.cmpMeta && ep.tag === m.cmpMeta.tagNameMeta);
        });
    });
    return cleanedEntryModules
        .filter(m => m.length > 0)
        .sort((a, b) => {
        if (a[0].cmpMeta.tagNameMeta < b[0].cmpMeta.tagNameMeta)
            return -1;
        if (a[0].cmpMeta.tagNameMeta > b[0].cmpMeta.tagNameMeta)
            return 1;
        if (a.length < b.length)
            return -1;
        if (a.length > b.length)
            return 1;
        return 0;
    });
}
function createEntryModule(config) {
    return (moduleFiles) => {
        // generate a unique entry key based on the components within this entry module
        const entryKey = ENTRY_KEY_PREFIX + moduleFiles
            .sort(sortModuleFiles)
            .map(m => m.cmpMeta.tagNameMeta)
            .join('.');
        return {
            moduleFiles,
            entryKey,
            // generate a unique entry key based on the components within this entry module
            filePath: config.sys.path.join(config.srcDir, `${entryKey}.js`),
            // get the modes used in this bundle
            modeNames: getEntryModes(moduleFiles),
            // figure out if we'll need a scoped css build
            requiresScopedStyles: true
        };
    };
}
const ENTRY_KEY_PREFIX = 'entry.';
function getAppEntryTags(allModules) {
    return allModules
        .filter(m => m.cmpMeta && !m.isCollectionDependency)
        .map(m => m.cmpMeta.tagNameMeta)
        .sort((a, b) => {
        if (a.length < b.length)
            return 1;
        if (a.length > b.length)
            return -1;
        if (a[0] < b[0])
            return -1;
        if (a[0] > b[0])
            return 1;
        return 0;
    });
}
function getUserConfigEntryTags(buildCtx, configBundles, allModules) {
    configBundles = (configBundles || [])
        .filter(b => b.components && b.components.length > 0)
        .sort((a, b) => {
        if (a.components.length < b.components.length)
            return 1;
        if (a.components.length > b.components.length)
            return -1;
        return 0;
    });
    const definedTags = new Set();
    const entryTags = configBundles
        .map(b => {
        return b.components
            .map(tag => {
            tag = validateComponentTag(tag);
            const moduleFile = allModules.find(m => m.cmpMeta && m.cmpMeta.tagNameMeta === tag);
            if (!moduleFile) {
                const warn = buildWarn(buildCtx.diagnostics);
                warn.header = `Stencil Config`;
                warn.messageText = `Component tag "${tag}" is defined in a bundle but no matching component was found within this app or its collections.`;
            }
            if (definedTags.has(tag)) {
                const warn = buildWarn(buildCtx.diagnostics);
                warn.header = `Stencil Config`;
                warn.messageText = `Component tag "${tag}" has been defined multiple times in the "bundles" config.`;
            }
            definedTags.add(tag);
            return tag;
        })
            .sort();
    });
    return entryTags;
}
function validateComponentEntries(config, compilerCtx, buildCtx) {
    const definedTags = new Set();
    return Object.keys(compilerCtx.moduleFiles).map(filePath => {
        const moduleFile = compilerCtx.moduleFiles[filePath];
        if (moduleFile.cmpMeta) {
            const tag = moduleFile.cmpMeta.tagNameMeta;
            if (definedTags.has(tag)) {
                const error = buildError(buildCtx.diagnostics);
                error.messageText = `Component tag "${tag}" has been defined in multiple files: ${config.sys.path.relative(config.rootDir, moduleFile.sourceFilePath)}`;
            }
            else {
                definedTags.add(tag);
            }
        }
        return moduleFile;
    });
}
function sortModuleFiles(a, b) {
    if (a.isCollectionDependency && !b.isCollectionDependency) {
        return 1;
    }
    if (!a.isCollectionDependency && b.isCollectionDependency) {
        return -1;
    }
    if (a.cmpMeta.tagNameMeta < b.cmpMeta.tagNameMeta)
        return -1;
    if (a.cmpMeta.tagNameMeta > b.cmpMeta.tagNameMeta)
        return 1;
    return 0;
}

function inMemoryFsRead(config, compilerCtx, buildCtx, entryModules) {
    const path$$1 = config.sys.path;
    const assetsCache = {};
    let tsFileNames;
    return {
        name: 'inMemoryFsRead',
        resolveId(importee, importer) {
            return __awaiter(this, void 0, void 0, function* () {
                if (/\0/.test(importee)) {
                    // ignore IDs with null character, these belong to other plugins
                    return null;
                }
                // note: node-resolve plugin has already ran
                // we can assume the importee is a file path
                if (!buildCtx.isActiveBuild) {
                    return importee;
                }
                const orgImportee = importee;
                // Entry files live in inMemoryFs
                if (path$$1.basename(importee).startsWith(ENTRY_KEY_PREFIX) && entryModules) {
                    const bundle = entryModules.find(b => b.filePath === importee);
                    if (bundle) {
                        return bundle.filePath;
                    }
                    buildCtx.debug(`bundleEntryFilePlugin resolveId, unable to find entry key: ${importee}`);
                    buildCtx.debug(`entryModules entryKeys: ${entryModules.map(em => em.filePath).join(', ')}`);
                }
                if (!path$$1.isAbsolute(importee)) {
                    importee = path$$1.resolve(importer ? path$$1.dirname(importer) : path$$1.resolve(), importee);
                    if (!importee.endsWith('.js')) {
                        importee += '.js';
                    }
                }
                importee = normalizePath(importee);
                // it's possible the importee is a file pointing directly to the source ts file
                // if it is a ts file path, then we're good to go
                var moduleFile = compilerCtx.moduleFiles[importee];
                if (compilerCtx.moduleFiles[importee]) {
                    return moduleFile.jsFilePath;
                }
                if (!tsFileNames) {
                    // get all the module files as filenames
                    // caching the filenames so we don't have to keep doing this
                    tsFileNames = Object.keys(compilerCtx.moduleFiles);
                }
                for (let i = 0; i < tsFileNames.length; i++) {
                    // see if we can find by importeE
                    moduleFile = compilerCtx.moduleFiles[tsFileNames[i]];
                    const moduleJsFilePath = moduleFile.jsFilePath;
                    if (moduleJsFilePath === importee) {
                        // exact match
                        return importee;
                    }
                    if (!importee.endsWith('.js') && moduleJsFilePath === importee + '.js') {
                        // try by appending .js
                        return `${importee}.js`;
                    }
                    if (!importee.endsWith('/index.js') && moduleJsFilePath === importee + '/index.js') {
                        // try by appending /index.js
                        return `${importee}/index.js`;
                    }
                }
                if (typeof importer === 'string' && !path$$1.isAbsolute(orgImportee)) {
                    // no luck finding the path the importee
                    // try again by using the importers source path and original importee
                    // get the original ts source path importer from this js path importer
                    for (let i = 0; i < tsFileNames.length; i++) {
                        const tsFilePath = tsFileNames[i];
                        moduleFile = compilerCtx.moduleFiles[tsFilePath];
                        if (moduleFile.jsFilePath !== importer) {
                            continue;
                        }
                        // found the importer's module file using importer's jsFilePath
                        // create an importee path using the source of the importers original ts file path
                        const srcImportee = normalizePath(path$$1.resolve(path$$1.dirname(tsFilePath), orgImportee));
                        let accessData = yield compilerCtx.fs.accessData(srcImportee);
                        if (accessData.isFile) {
                            return srcImportee;
                        }
                        if (!srcImportee.endsWith('/index.js')) {
                            accessData = yield compilerCtx.fs.accessData(srcImportee + '/index.js');
                            if (accessData.isFile) {
                                return srcImportee + '/index.js';
                            }
                        }
                        if (!srcImportee.endsWith('.js')) {
                            accessData = yield compilerCtx.fs.accessData(srcImportee + '.js');
                            if (accessData.isFile) {
                                return srcImportee + '.js';
                            }
                        }
                        break;
                    }
                }
                // let's check all of the asset directories for this path
                // think slide's swiper dependency
                for (let i = 0; i < tsFileNames.length; i++) {
                    // see if we can find by importeR
                    moduleFile = compilerCtx.moduleFiles[tsFileNames[i]];
                    if (moduleFile.jsFilePath === importer) {
                        // awesome, there's a module file for this js file via importeR
                        // now let's check if this module has an assets directory
                        if (moduleFile.cmpMeta && moduleFile.cmpMeta.assetsDirsMeta) {
                            for (var j = 0; j < moduleFile.cmpMeta.assetsDirsMeta.length; j++) {
                                const assetsAbsPath = moduleFile.cmpMeta.assetsDirsMeta[j].absolutePath;
                                const importeeFileName = path$$1.basename(importee);
                                const assetsFilePath = normalizePath(path$$1.join(assetsAbsPath, importeeFileName));
                                // ok, we've got a potential absolute path where the file "could" be
                                try {
                                    // let's see if it actually exists, but with readFileSync :(
                                    assetsCache[assetsFilePath] = compilerCtx.fs.readFileSync(assetsFilePath);
                                    if (typeof assetsCache[assetsFilePath] === 'string') {
                                        return assetsFilePath;
                                    }
                                }
                                catch (e) {
                                    buildCtx.debug(`asset ${assetsFilePath} did not exist`);
                                }
                            }
                        }
                    }
                }
                return null;
            });
        },
        load(sourcePath) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!buildCtx.isActiveBuild) {
                    return `/* build aborted */`;
                }
                sourcePath = normalizePath(sourcePath);
                if (typeof assetsCache[sourcePath] === 'string') {
                    // awesome, this is one of the cached asset file we already read in resolveId
                    return assetsCache[sourcePath];
                }
                return compilerCtx.fs.readFile(sourcePath);
            });
        }
    };
}

function transpileToEs5Main(config, compilerCtx, input, inlineHelpers = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheKey = compilerCtx.cache.createKey('transpileToEs5', 'typescript3.2.21', input);
        const cachedContent = yield compilerCtx.cache.get(cacheKey);
        if (cachedContent != null) {
            const results = {
                code: cachedContent,
                diagnostics: []
            };
            return results;
        }
        const results = yield config.sys.transpileToEs5(config.cwd, input, inlineHelpers);
        if (results.diagnostics.length === 0) {
            yield compilerCtx.cache.put(cacheKey, results.code);
        }
        return results;
    });
}

function generateBrowserAppGlobalScript(config, compilerCtx, buildCtx, appRegistry, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalJsContents = yield generateAppGlobalContent(config, compilerCtx, buildCtx, sourceTarget);
        if (globalJsContents.length > 0) {
            appRegistry.global = getGlobalFileName(config);
            const globalJsContent = generateGlobalJs(config, globalJsContents);
            compilerCtx.appFiles.global = globalJsContent;
            if (sourceTarget !== 'es5') {
                const promises = config.outputTargets.filter(o => o.appBuild).map(outputTarget => {
                    const appGlobalFilePath = getGlobalJsBuildPath(config, outputTarget);
                    return compilerCtx.fs.writeFile(appGlobalFilePath, globalJsContent);
                });
                yield Promise.all(promises);
            }
        }
        return globalJsContents;
    });
}
function generateEsmAppGlobalScript(config, compilerCtx, buildCtx, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalJsContents = yield generateAppGlobalContent(config, compilerCtx, buildCtx, sourceTarget);
        if (globalJsContents.length > 0) {
            const globalEsmContent = generateGlobalEsm(config, globalJsContents);
            const promises = config.outputTargets.filter(o => o.type === 'dist').map(outputTarget => {
                const appGlobalFilePath = getGlobalEsmBuildPath(config, outputTarget, sourceTarget);
                return compilerCtx.fs.writeFile(appGlobalFilePath, globalEsmContent);
            });
            yield Promise.all(promises);
        }
        return globalJsContents;
    });
}
function generateAppGlobalContent(config, compilerCtx, buildCtx, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const [projectGlobalJsContent, dependentGlobalJsContents] = yield Promise.all([
            bundleProjectGlobal(config, compilerCtx, buildCtx, sourceTarget, config.namespace, config.globalScript),
            loadDependentGlobalJsContents(config, compilerCtx, buildCtx, sourceTarget),
        ]);
        return [
            projectGlobalJsContent,
            ...dependentGlobalJsContents
        ].join('\n').trim();
    });
}
function loadDependentGlobalJsContents(config, compilerCtx, buildCtx, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = compilerCtx.collections.filter(m => m.global && m.global.jsFilePath);
        const dependentGlobalJsContents = yield Promise.all(collections.map(collectionManifest => {
            return bundleProjectGlobal(config, compilerCtx, buildCtx, sourceTarget, collectionManifest.collectionName, collectionManifest.global.jsFilePath);
        }));
        return dependentGlobalJsContents;
    });
}
function bundleProjectGlobal(config, compilerCtx, buildCtx, sourceTarget, namespace, entry) {
    return __awaiter(this, void 0, void 0, function* () {
        // stencil by itself does not have a global file
        // however, other collections can provide a global js
        // which will bundle whatever is in the global, and then
        // prepend the output content on top of the core js
        // this way external collections can provide a shared global at runtime
        if (typeof entry !== 'string') {
            // looks like they never provided an entry file, which is fine, so let's skip this
            return '';
        }
        if (entry.toLowerCase().endsWith('.ts')) {
            entry = entry.substr(0, entry.length - 2) + 'js';
        }
        else if (entry.toLowerCase().endsWith('.tsx')) {
            entry = entry.substr(0, entry.length - 3) + 'js';
        }
        // ok, so the project also provided an entry file, so let's bundle it up and
        // the output from this can be tacked onto the top of the project's core file
        // start the bundler on our temporary file
        try {
            const replaceObj = {
                'process.env.NODE_ENV': config.devMode ? '"development"' : '"production"'
            };
            const rollup = yield config.sys.rollup.rollup({
                input: entry,
                plugins: [
                    config.sys.rollup.plugins.nodeResolve({
                        jsnext: true,
                        main: true
                    }),
                    config.sys.rollup.plugins.emptyJsResolver(),
                    config.sys.rollup.plugins.commonjs({
                        include: 'node_modules/**',
                        sourceMap: false
                    }),
                    replace({
                        values: replaceObj
                    }),
                    inMemoryFsRead(config, compilerCtx, buildCtx),
                    ...config.plugins
                ],
                onwarn: createOnWarnFn(config, buildCtx.diagnostics)
            });
            const results = yield rollup.generate({ format: 'es' });
            // cool, so we balled up all of the globals into one string
            buildCtx.global = compilerCtx.moduleFiles[config.globalScript];
            // wrap our globals code with our own iife
            return yield wrapGlobalJs(config, compilerCtx, buildCtx, sourceTarget, namespace, results.output[0].code);
        }
        catch (e) {
            loadRollupDiagnostics(config, compilerCtx, buildCtx, e);
        }
        return '';
    });
}
function wrapGlobalJs(config, compilerCtx, buildCtx, sourceTarget, globalJsName, jsContent) {
    return __awaiter(this, void 0, void 0, function* () {
        jsContent = (jsContent || '').trim();
        // just format it a touch better in dev mode
        jsContent = `\n/** ${globalJsName || ''} global **/\n\n${jsContent}`;
        jsContent = jsContent
            .split(/\r?\n/)
            .map(line => (line.length > 0) ? '    ' + line : line)
            .join('\n');
        if (sourceTarget === 'es5') {
            // global could already be in es2017
            // transpile it down to es5
            buildCtx.debug(`transpile global to es5: ${globalJsName}`);
            const transpileResults = yield transpileToEs5Main(config, compilerCtx, jsContent);
            if (transpileResults.diagnostics && transpileResults.diagnostics.length) {
                buildCtx.diagnostics.push(...transpileResults.diagnostics);
            }
            else {
                jsContent = transpileResults.code;
            }
        }
        if (config.minifyJs) {
            jsContent = yield minifyJs(config, compilerCtx, buildCtx.diagnostics, jsContent, sourceTarget, false);
        }
        return `\n(function(Context, resourcesUrl){${jsContent}\n})(x,r);\n`;
    });
}
function generateGlobalJs(config, globalJsContents) {
    const output = [
        generatePreamble(config) + '\n',
        `(function(namespace,resourcesUrl){`,
        `"use strict";\n`,
        globalJsContents,
        `\n})("${config.namespace}");`
    ].join('');
    return output;
}
function generateGlobalEsm(config, globalJsContents) {
    const output = [
        generatePreamble(config) + '\n',
        `export default function appGlobal(n, x, w, d, r, h) {`,
        globalJsContents,
        `\n}`
    ].join('');
    return output;
}

/**
 * Properties which must not be property renamed during minification
 */
const RESERVED_PROPERTIES = [
    'addListener',
    'applyPolyfill',
    'attr',
    'color',
    'Context',
    'dom',
    'emit',
    'enableListener',
    'eventNameFn',
    'h',
    'hydratedCssClass',
    'initialized',
    'isClient',
    'isPrerender',
    'isServer',
    'key',
    'loaded',
    'mode',
    'namespace',
    'onReady',
    'Promise',
    'publicPath',
    'queue',
    'ael',
    'rel',
    'raf',
    'asyncQueue',
    'read',
    'ref',
    'resourcesUrl',
    'tick',
    'write',
    /**
     * App Global - window.App
     * Properties which get added to the app's global
     */
    'components',
    'loadBundle',
    'loadStyles',
    /**
     * Host Element
     * Properties set on the host element
     */
    '$',
    'componentOnReady',
    /**
     * Component Constructor static properties
     */
    'attr',
    'capture',
    'connect',
    'context',
    'disabled',
    'elementRef',
    'encapsulation',
    'events',
    'host',
    'is',
    'listeners',
    'method',
    'mutable',
    'passive',
    'properties',
    'reflectToAttr',
    'scoped',
    'state',
    'style',
    'styleMode',
    'type',
    'watchCallbacks',
    /**
     * Component Instance
     * Methods set on the user's component
     */
    'componentWillLoad',
    'componentDidLoad',
    'componentWillUpdate',
    'componentDidUpdate',
    'componentDidUnload',
    'forceUpdate',
    'hostData',
    'render',
    /**
     * Functional Component Util
     */
    'getTag',
    'getChildren',
    'getText',
    'getAttributes',
    'replaceAttributes',
    /**
     * VDom
     */
    'vtag',
    'vchildren',
    'vtext',
    'vattrs',
    'vkey',
    'vname',
    /**
     * Web Standards / DOM
     */
    'add',
    'addEventListener',
    'appendChild',
    'async',
    'attachShadow',
    'attributeChangedCallback',
    'body',
    'bubbles',
    'cancelable',
    'capture',
    'characterData',
    'charset',
    'childNodes',
    'children',
    'class',
    'classList',
    'className',
    'clearMarks',
    'clearMeasures',
    'cloneNode',
    'closest',
    'composed',
    'configurable',
    'connectedCallback',
    'content',
    'createComment',
    'createElement',
    'createElementNS',
    'createEvent',
    'createTextNode',
    'CSS',
    'customElements',
    'CustomEvent',
    'data',
    'defaultView',
    'define',
    'detail',
    'didTimeout',
    'disconnect',
    'disconnectedCallback',
    'dispatchEvent',
    'document',
    'documentElement',
    'Element',
    'error',
    'Event',
    'fetch',
    'firstChild',
    'firstElementChild',
    'getAttribute',
    'getAttributeNS',
    'getRootNode',
    'getStyle',
    'hasAttribute',
    'head',
    'hidden',
    'host',
    'href',
    'id',
    'initCustomEvent',
    'innerHTML',
    'insertBefore',
    'location',
    'log',
    'keyCode',
    'mark',
    'measure',
    'match',
    'matches',
    'matchesSelector',
    'matchMedia',
    'mozMatchesSelector',
    'msMatchesSelector',
    'navigator',
    'nextSibling',
    'nodeName',
    'nodeType',
    'now',
    'observe',
    'observedAttributes',
    'onerror',
    'onload',
    'onmessage',
    'ownerDocument',
    'ownerSVGElement',
    'parentElement',
    'parentNode',
    'passive',
    'pathname',
    'performance',
    'postMessage',
    'previousSibling',
    'querySelector',
    'querySelectorAll',
    'remove',
    'removeAttribute',
    'removeAttributeNS',
    'removeChild',
    'removeEventListener',
    'removeProperty',
    'requestAnimationFrame',
    'requestIdleCallback',
    'search',
    'setAttribute',
    'setAttributeNS',
    'setProperty',
    'shadowRoot',
    'src',
    'style',
    'supports',
    'tagName',
    'text',
    'textContent',
    'timeRemaining',
    'value',
    'warn',
    'webkitMatchesSelector',
    'window',
    'HTMLElement',
    /** CSS Vars Shim */
    'createHostStyle',
    'customStyleShim',
    'initShim',
    'removeHost',
    'updateGlobal',
    'updateHost',
];

function transpileCoreBuild(config, compilerCtx, coreBuild, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = {
            code: null,
            diagnostics: null
        };
        let cacheKey;
        if (compilerCtx) {
            cacheKey = compilerCtx.cache.createKey('transpileCoreBuild', 'typescript3.2.21', coreBuild, input);
            const cachedContent = yield compilerCtx.cache.get(cacheKey);
            if (cachedContent != null) {
                results.code = cachedContent;
                results.diagnostics = [];
                return results;
            }
        }
        const diagnostics = [];
        const transpileOpts = {
            compilerOptions: {
                allowJs: true,
                declaration: false,
                target: ts.ScriptTarget.ES5,
                module: ts.ModuleKind.ESNext
            }
        };
        const tsResults = ts.transpileModule(input, transpileOpts);
        loadTypeScriptDiagnostics(config, diagnostics, tsResults.diagnostics);
        if (diagnostics.length) {
            results.diagnostics = diagnostics;
            results.code = input;
            return results;
        }
        results.code = tsResults.outputText;
        if (compilerCtx) {
            yield compilerCtx.cache.put(cacheKey, results.code);
        }
        return results;
    });
}

function replaceBuildString(code, values) {
    function escape(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
    function longest(a, b) {
        return b.length - a.length;
    }
    const keys = Object.keys(values).sort(longest).map(escape);
    const pattern = new RegExp(`\\b(${keys.join('|')})\\b`, 'g');
    const magicString = new MagicString(code);
    let start;
    let end;
    let replacement;
    let match;
    while ((match = pattern.exec(code))) {
        start = match.index;
        end = start + match[0].length;
        replacement = String(values[match[1]]);
        magicString.overwrite(start, end, replacement);
    }
    return magicString.toString();
}

function buildCoreContent(config, compilerCtx, buildCtx, coreBuild, coreContent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return '';
        }
        // Replace all _BUILD_ with the current coreBuild obj
        const replaceObj = Object.keys(coreBuild).reduce((all, key) => {
            all[`_BUILD_.${key}`] = coreBuild[key];
            return all;
        }, {});
        let replacedContent = replaceBuildString(coreContent, replaceObj);
        // If this is an es5 build then transpile the code down to es5 using Typescript.
        if (coreBuild.es5) {
            const transpileResults = yield transpileCoreBuild(config, compilerCtx, coreBuild, replacedContent);
            if (transpileResults.diagnostics && transpileResults.diagnostics.length > 0) {
                buildCtx.diagnostics.push(...transpileResults.diagnostics);
                return replacedContent;
            }
            replacedContent = transpileResults.code;
        }
        const sourceTarget = coreBuild.es5 ? 'es5' : 'es2017';
        const minifyResults = yield minifyCore(config, compilerCtx, sourceTarget, replacedContent);
        if (minifyResults.diagnostics.length > 0) {
            buildCtx.diagnostics.push(...minifyResults.diagnostics);
            return replacedContent;
        }
        return minifyResults.output;
    });
}
function minifyCore(config, compilerCtx, sourceTarget, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const opts = Object.assign({}, config.minifyJs ? PROD_MINIFY_OPTS : DEV_MINIFY_OPTS);
        if (sourceTarget === 'es5') {
            opts.ecma = 5;
            opts.output.ecma = 5;
            opts.compress.ecma = 5;
            opts.compress.arrows = false;
            opts.compress.module = false;
        }
        else {
            opts.ecma = 7;
            opts.output.ecma = 7;
            opts.compress.ecma = 7;
            opts.compress.module = true;
        }
        if (config.minifyJs) {
            if (sourceTarget !== 'es5') {
                opts.compress.arrows = true;
            }
            // reserved properties is a list of properties to NOT rename
            // if something works in dev, but a runtime error in prod
            // chances are we need to add a property to this list
            opts.mangle.properties.reserved = RESERVED_PROPERTIES.slice();
            if (config.logLevel === 'debug') {
                // if in debug mode, still mangle the property names
                // but at least make them readable of what the
                // properties originally were named
                opts.mangle.properties.debug = true;
                opts.mangle.keep_fnames = true;
                opts.compress.drop_console = false;
                opts.compress.drop_debugger = false;
                opts.output.beautify = true;
                opts.output.indent_level = 2;
                opts.output.comments = 'all';
            }
            else {
                opts.output.comments = '/webpack/';
            }
        }
        let cacheKey;
        if (compilerCtx) {
            cacheKey = compilerCtx.cache.createKey('minifyCore', '190031134759', opts, input);
            const cachedContent = yield compilerCtx.cache.get(cacheKey);
            if (cachedContent != null) {
                return {
                    output: cachedContent,
                    diagnostics: []
                };
            }
        }
        const results = yield config.sys.minifyJs(input, opts);
        if (results && results.diagnostics.length === 0 && compilerCtx) {
            yield compilerCtx.cache.put(cacheKey, results.output);
        }
        return results;
    });
}
// https://www.npmjs.com/package/terser
const DEV_MINIFY_OPTS = {
    compress: {
        arrows: false,
        booleans: false,
        collapse_vars: false,
        comparisons: false,
        conditionals: true,
        dead_code: true,
        drop_console: false,
        drop_debugger: false,
        evaluate: true,
        expression: false,
        hoist_funs: false,
        hoist_vars: false,
        ie8: false,
        if_return: false,
        inline: false,
        join_vars: false,
        keep_fargs: true,
        keep_fnames: true,
        keep_infinity: true,
        loops: false,
        negate_iife: false,
        passes: 1,
        properties: true,
        pure_funcs: null,
        pure_getters: false,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: false,
        toplevel: true,
        top_retain: false,
        typeofs: false,
        unsafe: false,
        unsafe_arrows: false,
        unsafe_comps: false,
        unsafe_Function: false,
        unsafe_math: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unused: true,
        warnings: false
    },
    mangle: false,
    output: {
        ascii_only: false,
        beautify: true,
        comments: 'all',
        ie8: false,
        indent_level: 2,
        indent_start: 0,
        inline_script: true,
        keep_quoted_props: true,
        max_line_len: false,
        preamble: null,
        quote_keys: false,
        quote_style: 1,
        semicolons: true,
        shebang: true,
        source_map: null,
        webkit: false,
        width: 80,
        wrap_iife: false
    }
};
const PROD_MINIFY_OPTS = {
    compress: {
        arrows: false,
        booleans: true,
        collapse_vars: true,
        comparisons: true,
        conditionals: true,
        dead_code: true,
        drop_console: false,
        drop_debugger: true,
        evaluate: true,
        expression: true,
        hoist_funs: true,
        hoist_vars: false,
        ie8: false,
        if_return: true,
        inline: true,
        join_vars: true,
        keep_fargs: false,
        keep_fnames: true,
        keep_infinity: true,
        loops: true,
        negate_iife: false,
        passes: 3,
        properties: true,
        pure_funcs: null,
        pure_getters: false,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        toplevel: true,
        typeofs: true,
        unsafe: false,
        unsafe_arrows: false,
        unsafe_comps: false,
        unsafe_Function: false,
        unsafe_math: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unused: true,
        warnings: false
    },
    mangle: {
        properties: {
            builtins: false,
            debug: false,
            keep_quoted: true
        },
        toplevel: true
    },
    output: {
        ascii_only: false,
        beautify: false,
        comments: false,
        ie8: false,
        indent_level: 0,
        indent_start: 0,
        inline_script: false,
        keep_quoted_props: false,
        max_line_len: false,
        preamble: null,
        quote_keys: false,
        quote_style: 0,
        semicolons: true,
        shebang: true,
        source_map: null,
        webkit: false,
        width: 80,
        wrap_iife: false
    }
};

function generateCoreBrowser(config, compilerCtx, buildCtx, outputTarget, cmpRegistry, staticName, globalJsContent, buildConditionals) {
    return __awaiter(this, void 0, void 0, function* () {
        const relPath = config.sys.path.relative(config.rootDir, getAppBuildDir(config, outputTarget));
        const timespan = buildCtx.createTimeSpan(`generateCoreBrowser ${buildConditionals.coreId} started, ${relPath}`, true);
        // mega-minify the core w/ property renaming, but not the user's globals
        // hardcode which features should and should not go in the core builds
        // process the transpiled code by removing unused code and minify when configured to do so
        let jsContent = yield config.sys.getClientCoreFile({ staticName: staticName });
        jsContent = yield buildCoreContent(config, compilerCtx, buildCtx, buildConditionals, jsContent);
        if (globalJsContent) {
            // we've got global js to put in the core build too
            // concat the global js and transpiled code together
            jsContent = `${globalJsContent}\n${jsContent}`;
        }
        // wrap the core js code together
        jsContent = wrapCoreJs(config, jsContent, cmpRegistry, buildConditionals);
        if (buildConditionals.polyfills) {
            // this build wants polyfills so let's
            // add the polyfills to the top of the core content
            // the polyfilled code is already es5/minified ready to go
            const polyfillsContent = yield getAppBrowserCorePolyfills(config);
            jsContent = polyfillsContent + '\n' + jsContent;
        }
        const coreFilename = getCoreFilename(config, buildConditionals.coreId, jsContent);
        // update the app core filename within the content
        jsContent = jsContent.replace(APP_NAMESPACE_PLACEHOLDER, config.fsNamespace);
        const appCorePath = pathJoin(config, getAppBuildDir(config, outputTarget), coreFilename);
        compilerCtx.appCoreWWWPath = appCorePath;
        yield compilerCtx.fs.writeFile(appCorePath, jsContent);
        timespan.finish(`generateCoreBrowser ${buildConditionals.coreId} finished, ${relPath}`);
        return coreFilename;
    });
}
function wrapCoreJs(config, jsContent, cmpRegistry, buildConditionals) {
    if (typeof jsContent !== 'string') {
        jsContent = '';
    }
    const cmpLoaderRegistry = formatBrowserLoaderComponentRegistry(cmpRegistry);
    const cmpLoaderRegistryStr = JSON.stringify(cmpLoaderRegistry);
    const output = [
        generatePreamble(config, { defaultBanner: true }) + '\n',
        `(${buildConditionals.es5 ? 'function' : ''}(w,d,x,n,h,c,r)${buildConditionals.es5 ? '' : '=>'}{`,
        buildConditionals.es5 ? `"use strict";\n` : ``,
        `(${buildConditionals.es5 ? 'function' : ''}(s)${buildConditionals.es5 ? '' : '=>'}{s&&(r=s.getAttribute('data-resources-url'))})(d.querySelector("script[data-namespace='${config.fsNamespace}']"));\n`,
        jsContent.trim(),
        `\n})(window,document,{},"${config.namespace}","${config.hydratedCssClass}",${cmpLoaderRegistryStr});`
    ].join('');
    return output;
}
const APP_NAMESPACE_PLACEHOLDER = '__APPNAMESPACE__';

function setBuildConditionals(config, compilerCtx, coreId, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingCoreBuild = getLastBuildConditionals(compilerCtx, coreId, buildCtx);
        if (existingCoreBuild) {
            // cool we can use the last build conditionals
            // because it's a rebuild, and was probably only a css or html change
            // if it was a typescript change we need to do a full rebuild again
            return existingCoreBuild;
        }
        // figure out which sections of the core code this build doesn't even need
        const coreBuild = {
            coreId: coreId,
            clientSide: true,
            isDev: !!config.devMode,
            isProd: !config.devMode,
            profile: !!(config.flags && config.flags.profile),
            hasSlot: !!buildCtx.hasSlot,
            hasSvg: !!buildCtx.hasSvg,
            devInspector: config.devInspector,
            hotModuleReplacement: config.devMode,
            verboseError: config.devMode,
            externalModuleLoader: false,
            browserModuleLoader: false,
            polyfills: false,
            es5: false,
            cssVarShim: false,
            ssrServerSide: false,
            prerenderClientSide: false,
            prerenderExternal: false,
            shadowDom: false,
            scoped: false,
            slotPolyfill: false,
            hasMode: false,
            event: false,
            listener: false,
            styles: false,
            hostTheme: false,
            observeAttr: false,
            prop: false,
            propMutable: false,
            propConnect: false,
            propContext: false,
            state: false,
            hasMembers: false,
            updatable: false,
            method: false,
            element: false,
            watchCallback: false,
            reflectToAttr: false,
            cmpWillLoad: false,
            cmpDidLoad: false,
            cmpWillUpdate: false,
            cmpDidUpdate: false,
            cmpDidUnload: false,
            hostData: false
        };
        const promises = [];
        entryModules.forEach(bundle => {
            bundle.moduleFiles.forEach(moduleFile => {
                if (moduleFile.cmpMeta) {
                    promises.push(setBuildFromComponent(config, compilerCtx, coreBuild, moduleFile));
                }
            });
        });
        yield Promise.all(promises);
        if (coreId === 'core') {
            // modern build
            coreBuild.browserModuleLoader = true;
            coreBuild.prerenderClientSide = shouldPrerender(config);
            coreBuild.prerenderExternal = shouldPrerenderExternal(config);
            compilerCtx.lastBuildConditionalsBrowserEsm = coreBuild;
        }
        else if (coreId === 'core.pf') {
            // polyfilled build
            coreBuild.browserModuleLoader = true;
            coreBuild.es5 = true;
            coreBuild.polyfills = true;
            coreBuild.cssVarShim = true;
            coreBuild.prerenderClientSide = shouldPrerender(config);
            coreBuild.prerenderExternal = shouldPrerenderExternal(config);
            compilerCtx.lastBuildConditionalsBrowserEs5 = coreBuild;
        }
        else if (coreId === 'esm.es5') {
            // es5 build to be imported by bundlers
            coreBuild.es5 = true;
            coreBuild.externalModuleLoader = true;
            coreBuild.cssVarShim = true;
            coreBuild.polyfills = true;
            coreBuild.slotPolyfill = true;
            compilerCtx.lastBuildConditionalsEsmEs5 = coreBuild;
        }
        else if (coreId === 'esm.es2017') {
            // es2017 build to be imported by bundlers
            coreBuild.externalModuleLoader = true;
            coreBuild.slotPolyfill = (coreBuild.scoped && buildCtx.hasSlot);
            compilerCtx.lastBuildConditionalsEsmEs2017 = coreBuild;
        }
        // TODO: hasSlot does not account for dependencies
        coreBuild.slotPolyfill = true;
        // TODO: hasSvg does not account for dependencies
        coreBuild.hasSvg = true;
        return coreBuild;
    });
}
function getLastBuildConditionals(compilerCtx, coreId, buildCtx) {
    if (buildCtx.isRebuild && Array.isArray(buildCtx.filesChanged)) {
        // this is a rebuild and we do have lastBuildConditionals already
        const hasChangedTsFile = buildCtx.filesChanged.some(filePath => {
            return isTsFile(filePath);
        });
        if (!hasChangedTsFile) {
            // we didn't have a typescript change
            // so it's ok to use the lastBuildConditionals
            if (coreId === 'core' && compilerCtx.lastBuildConditionalsBrowserEsm) {
                return compilerCtx.lastBuildConditionalsBrowserEsm;
            }
            if (coreId === 'core.pf' && compilerCtx.lastBuildConditionalsBrowserEs5) {
                return compilerCtx.lastBuildConditionalsBrowserEs5;
            }
            if (coreId === 'esm.es5' && compilerCtx.lastBuildConditionalsEsmEs5) {
                return compilerCtx.lastBuildConditionalsEsmEs5;
            }
            if (coreId === 'esm.es2017' && compilerCtx.lastBuildConditionalsEsmEs2017) {
                return compilerCtx.lastBuildConditionalsEsmEs2017;
            }
        }
    }
    // we've gotta do a full rebuild of the build conditionals object again
    return null;
}
function setBuildFromComponent(config, compilerCtx, coreBuild, moduleFile) {
    return __awaiter(this, void 0, void 0, function* () {
        setBuildFromComponentMeta(coreBuild, moduleFile.cmpMeta);
        if (moduleFile.jsFilePath) {
            try {
                const jsText = yield compilerCtx.fs.readFile(moduleFile.jsFilePath);
                setBuildFromComponentContent(coreBuild, jsText);
            }
            catch (e) {
                config.logger.debug(`setBuildFromComponent: ${moduleFile.jsFilePath}: ${e}`);
            }
        }
    });
}
function setBuildFromComponentMeta(coreBuild, cmpMeta) {
    if (!cmpMeta) {
        return;
    }
    coreBuild.shadowDom = coreBuild.shadowDom || cmpMeta.encapsulationMeta === 1 /* ShadowDom */;
    coreBuild.scoped = coreBuild.scoped || cmpMeta.encapsulationMeta === 2 /* ScopedCss */;
    coreBuild.event = coreBuild.event || !!(cmpMeta.eventsMeta && cmpMeta.eventsMeta.length > 0);
    coreBuild.listener = coreBuild.listener || !!(cmpMeta.listenersMeta && cmpMeta.listenersMeta.length > 0);
    coreBuild.hostTheme = coreBuild.hostTheme || !!(cmpMeta.hostMeta && cmpMeta.hostMeta.theme);
    if (cmpMeta.stylesMeta) {
        const modeNames = Object.keys(cmpMeta.stylesMeta);
        if (modeNames.length > 0) {
            coreBuild.styles = true;
            if (!coreBuild.hasMode) {
                coreBuild.hasMode = modeNames.filter(m => m !== DEFAULT_STYLE_MODE).length > 0;
            }
        }
    }
    if (cmpMeta.membersMeta) {
        const memberNames = Object.keys(cmpMeta.membersMeta);
        coreBuild.hasMembers = coreBuild.hasMembers || (memberNames.length > 0);
        memberNames.forEach(memberName => {
            const memberMeta = cmpMeta.membersMeta[memberName];
            const memberType = memberMeta.memberType;
            const propType = memberMeta.propType;
            if (memberType === 1 /* Prop */ || memberType === 2 /* PropMutable */) {
                coreBuild.prop = true;
                if (memberType === 2 /* PropMutable */) {
                    coreBuild.propMutable = true;
                }
                if (propType === 2 /* String */ || propType === 8 /* Number */ || propType === 4 /* Boolean */ || propType === 1 /* Any */) {
                    coreBuild.observeAttr = true;
                }
            }
            else if (memberType === 16 /* State */) {
                coreBuild.state = true;
            }
            else if (memberType === 8 /* PropConnect */) {
                coreBuild.propConnect = true;
            }
            else if (memberType === 4 /* PropContext */) {
                coreBuild.propContext = true;
            }
            else if (memberType === 32 /* Method */) {
                coreBuild.method = true;
            }
            else if (memberType === 64 /* Element */) {
                coreBuild.element = true;
            }
            if (memberMeta.watchCallbacks && memberMeta.watchCallbacks.length > 0) {
                coreBuild.watchCallback = true;
            }
            if (memberMeta.reflectToAttrib) {
                coreBuild.reflectToAttr = true;
            }
        });
    }
    coreBuild.updatable = (coreBuild.updatable || !!(coreBuild.prop || coreBuild.state));
}
function setBuildFromComponentContent(coreBuild, jsText) {
    if (typeof jsText !== 'string') {
        return;
    }
    // hacky to do it this way...yeah
    // but with collections the components may have been
    // built many moons ago, so we don't want to lock ourselves
    // into a very certain way that components can be parsed
    // so here we're just doing raw string checks, and there
    // wouldn't be any harm if a build section was included when it
    // wasn't needed, but these keywords are all pretty unique already
    coreBuild.cmpWillLoad = coreBuild.cmpWillLoad || jsText.includes('componentWillLoad');
    coreBuild.cmpDidLoad = coreBuild.cmpDidLoad || jsText.includes('componentDidLoad');
    coreBuild.cmpWillUpdate = coreBuild.cmpWillUpdate || jsText.includes('componentWillUpdate');
    coreBuild.cmpDidUpdate = coreBuild.cmpDidUpdate || jsText.includes('componentDidUpdate');
    coreBuild.cmpDidUnload = coreBuild.cmpDidUnload || jsText.includes('componentDidUnload');
    coreBuild.hostData = coreBuild.hostData || jsText.includes('hostData');
}

function generateEsmCores(config, compilerCtx, buildCtx, outputTarget, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (outputTarget.type === 'dist' && config.buildEsm) {
            // mega-minify the core w/ property renaming, but not the user's globals
            // hardcode which features should and should not go in the core builds
            // process the transpiled code by removing unused code and minify when configured to do so
            const cores = [
                generateEsmCore(config, compilerCtx, buildCtx, outputTarget, entryModules, 'es2017', 'esm.es2017')
            ];
            if (config.buildEs5) {
                cores.push(generateEsmCore(config, compilerCtx, buildCtx, outputTarget, entryModules, 'es5', 'esm.es5'));
            }
            yield Promise.all(cores);
        }
    });
}
function generateEsmCore(config, compilerCtx, buildCtx, outputTarget, entryModules, sourceTarget, coreId) {
    return __awaiter(this, void 0, void 0, function* () {
        let jsContent = yield config.sys.getClientCoreFile({ staticName: 'core.esm.js' });
        // browser esm core build
        const globalJsContentsEsm = yield generateEsmAppGlobalScript(config, compilerCtx, buildCtx, sourceTarget);
        const hasAppGlobalImport = !!(globalJsContentsEsm && globalJsContentsEsm.length);
        if (hasAppGlobalImport) {
            jsContent = `import appGlobal from './${getGlobalEsmFileName(config)}';\n${jsContent}`;
        }
        else {
            jsContent = `var appGlobal = function(){};\n${jsContent}`;
        }
        // figure out which sections should be included in the core build
        const buildConditionals = yield setBuildConditionals(config, compilerCtx, coreId, buildCtx, entryModules);
        yield writeEsmCore(config, compilerCtx, buildCtx, outputTarget, buildConditionals, jsContent, sourceTarget);
    });
}
function writeEsmCore(config, compilerCtx, buildCtx, outputTarget, buildConditionals, jsContent, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const coreEsm = getCoreEsmBuildPath(config, outputTarget, sourceTarget);
        const relPath = config.sys.path.relative(config.rootDir, coreEsm);
        const timespan = buildCtx.createTimeSpan(`generateEsmCoreEs5 started, ${relPath}`, true);
        jsContent = yield buildCoreContent(config, compilerCtx, buildCtx, buildConditionals, jsContent);
        // fighting with typescript/webpack/es5 builds too much
        // #dealwithit
        jsContent = jsContent.replace('export function applyPolyfills', 'function applyPolyfills');
        jsContent = jsContent.replace('__APP__NAMESPACE__PLACEHOLDER__', config.namespace);
        jsContent = jsContent.replace('__APP__HYDRATED__CSS__PLACEHOLDER__', config.hydratedCssClass);
        jsContent = generatePreamble(config, { prefix: `${config.namespace}: Core, ${sourceTarget}`, defaultBanner: true }) + '\n' + jsContent;
        yield compilerCtx.fs.writeFile(coreEsm, jsContent);
        timespan.finish(`writeEsmCore ${sourceTarget} finished, ${relPath}`);
    });
}

function generateEs5DisabledMessage(config, compilerCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        // not doing an es5 right now
        // but it's possible during development the user
        // tests on a browser that doesn't support es2017
        const fileName = 'es5-build-disabled.js';
        const filePath = pathJoin(config, getAppBuildDir(config, outputTarget), fileName);
        yield compilerCtx.fs.writeFile(filePath, getDisabledMessageScript());
        return fileName;
    });
}
function getDisabledMessageScript() {
    const html = `
  <style>
  body {
    font-family: sans-serif;
    padding: 20px;
    line-height:22px;
  }
  h1 {
    font-size: 18px;
  }
  h2 {
    font-size: 14px;
    margin-top: 40px;
  }
  </style>

  <h1>This Stencil app is disabled for this browser.</h1>

  <h2>Developers:</h2>
  <ul>
    <li>ES5 builds are disabled <strong>during development</strong> to take advantage of 2x faster build times.</li>
    <li>Please see the example below or our <a href="https://stenciljs.com/docs/stencil-config" target="_blank">config docs</a> if you would like to develop on a browser that does not fully support ES2017 and custom elements.</li>
    <li>Note that by default, ES5 builds and polyfills are enabled during production builds.</li>
    <li>When testing browsers it is recommended to always test in production mode, and ES5 builds should always be enabled during production builds.</li>
    <li><em>This is only an experiement and if it slows down app development then we will revert this and enable ES5 builds during dev.</em></li>
  </ul>


  <h2>Enabling ES5 builds during development:</h2>
  <pre>
    <code>npm run dev --es5</code>
  </pre>
  <p>For stencil-component-starter, use:</p>
  <pre>
    <code>npm start --es5</code>
  </pre>


  <h2>Enabling full production builds during development:</h2>
  <pre>
    <code>npm run dev --prod</code>
  </pre>
  <p>For stencil-component-starter, use:</p>
  <pre>
    <code>npm start --prod</code>
  </pre>

  <h2>Current Browser's Support:</h2>
  <ul>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import">ES Module Imports</a>: <span id="es-modules-test"></span></li>
    <li><a href="http://2ality.com/2017/01/import-operator.html">ES Dynamic Imports</a>: <span id="es-dynamic-modules-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements">Custom Elements</a>: <span id="custom-elements-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM">Shadow DOM</a>: <span id="shadow-dom-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">fetch</a>: <span id="fetch-test"></span></li>
    <li><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables">CSS Variables</a>: <span id="css-variables-test"></span></li>
  </ul>

  <h2>Current Browser:</h2>
  <pre>
    <code id="current-browser-output"></code>
  </pre>
  `;
    const script = `
    function supportsDynamicImports() {
      try {
        new Function('import("")');
        return true;
      } catch (e) {}
      return false;
    }
    document.body.innerHTML = '${html.replace(/\r\n|\r|\n/g, '').replace(/\'/g, `\\'`).trim()}';

    document.getElementById('current-browser-output').textContent = window.navigator.userAgent;
    document.getElementById('es-modules-test').textContent = !!('noModule' in document.createElement('script'));
    document.getElementById('es-dynamic-modules-test').textContent = supportsDynamicImports();
    document.getElementById('shadow-dom-test').textContent = !!(document.head.attachShadow);
    document.getElementById('custom-elements-test').textContent = !!(window.customElements);
    document.getElementById('css-variables-test').textContent = !!(window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--c)'));
    document.getElementById('fetch-test').textContent = !!(window.fetch);
  `;
    // timeout just to ensure <body> is ready
    return `setTimeout(function(){ ${script} }, 10)`;
}

function generateLoader(config, compilerCtx, buildCtx, outputTarget, appRegistry, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return null;
        }
        const appLoaderPath = getLoaderPath(config, outputTarget);
        const relPath = config.sys.path.relative(config.rootDir, appLoaderPath);
        const timeSpan = buildCtx.createTimeSpan(`generateLoader started, ${relPath}`, true);
        let loaderContent = yield config.sys.getClientCoreFile({ staticName: CLIENT_LOADER_SOURCE });
        loaderContent = injectAppIntoLoader(config, outputTarget, appRegistry.core, appRegistry.corePolyfilled, config.hydratedCssClass, cmpRegistry, loaderContent);
        if (config.minifyJs) {
            // minify the loader which should always be es5
            loaderContent = yield minifyJs(config, compilerCtx, buildCtx.diagnostics, loaderContent, 'es5', true, buildCtx.timestamp);
        }
        else {
            // dev
            loaderContent = generatePreamble(config, { suffix: buildCtx.timestamp }) + '\n' + loaderContent;
        }
        yield compilerCtx.fs.writeFile(appLoaderPath, loaderContent);
        timeSpan.finish(`generateLoader finished, ${relPath}`);
        return loaderContent;
    });
}
const CLIENT_LOADER_SOURCE = `loader.js`;
function injectAppIntoLoader(config, outputTarget, appCoreFileName, appCorePolyfilledFileName, hydratedCssClass, cmpRegistry, loaderContent) {
    const cmpTags = formatBrowserLoaderComponentTagNames(cmpRegistry);
    const resourcesUrl = outputTarget.resourcesUrl ? `"${outputTarget.resourcesUrl}"` : 0;
    const loaderArgs = [
        `"${config.namespace}"`,
        `"${config.fsNamespace}"`,
        `${resourcesUrl}`,
        `"${appCoreFileName}"`,
        `"${appCorePolyfilledFileName}"`,
        `"${hydratedCssClass}"`,
        `"${cmpTags.join(',')}"`,
        'HTMLElement.prototype'
    ].join(',');
    return loaderContent.replace(APP_NAMESPACE_REGEX, loaderArgs);
}

function generateAppFiles(config, compilerCtx, buildCtx, entryModules, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (canSkipAppFiles(buildCtx, cmpRegistry)) {
            return;
        }
        const outputTargets = config.outputTargets.filter(outputTarget => {
            return outputTarget.appBuild;
        });
        if (outputTargets.length === 0) {
            return;
        }
        const timespan = buildCtx.createTimeSpan(`generate app files started`);
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield generateAppFilesOutputTarget(config, compilerCtx, buildCtx, outputTarget, entryModules, cmpRegistry);
        })));
        timespan.finish(`generate app files finished`);
    });
}
function generateAppFilesOutputTarget(config, compilerCtx, buildCtx, outputTarget, entryModules, cmpRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.buildAppCore) {
            return;
        }
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        try {
            // generate the shared app registry object
            const appRegistry = createAppRegistry(config);
            yield Promise.all([
                // browser core esm build
                generateBrowserCore(config, compilerCtx, buildCtx, outputTarget, entryModules, cmpRegistry, appRegistry),
                // browser core es5 build
                generateBrowserCoreEs5(config, compilerCtx, buildCtx, outputTarget, entryModules, cmpRegistry, appRegistry),
                // core esm
                generateEsmCores(config, compilerCtx, buildCtx, outputTarget, entryModules)
            ]);
            yield Promise.all([
                // create a json file for the app registry
                writeAppRegistry(config, compilerCtx, buildCtx, outputTarget, appRegistry, cmpRegistry),
                // create the loader(s) after creating the loader file name
                generateLoader(config, compilerCtx, buildCtx, outputTarget, appRegistry, cmpRegistry),
                // create the custom elements file
                generateEsmHosts(config, compilerCtx, cmpRegistry, outputTarget)
            ]);
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
    });
}
function generateBrowserCore(config, compilerCtx, buildCtx, outputTarget, entryModules, cmpRegistry, appRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        // browser esm core build
        const globalJsContentsEsm = yield generateBrowserAppGlobalScript(config, compilerCtx, buildCtx, appRegistry, 'es2017');
        // figure out which sections should be included in the core build
        const buildConditionals = yield setBuildConditionals(config, compilerCtx, 'core', buildCtx, entryModules);
        const staticName = 'core.browser.js';
        const coreFilename = yield generateCoreBrowser(config, compilerCtx, buildCtx, outputTarget, cmpRegistry, staticName, globalJsContentsEsm, buildConditionals);
        appRegistry.core = coreFilename;
    });
}
function generateBrowserCoreEs5(config, compilerCtx, buildCtx, outputTarget, entryModules, cmpRegistry, appRegistry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.buildEs5) {
            // browser core es5 build
            const globalJsContentsEs5 = yield generateBrowserAppGlobalScript(config, compilerCtx, buildCtx, appRegistry, 'es5');
            const buildConditionalsEs5 = yield setBuildConditionals(config, compilerCtx, 'core.pf', buildCtx, entryModules);
            const staticName = 'core.browser.legacy.js';
            const coreFilenameEs5 = yield generateCoreBrowser(config, compilerCtx, buildCtx, outputTarget, cmpRegistry, staticName, globalJsContentsEs5, buildConditionalsEs5);
            appRegistry.corePolyfilled = coreFilenameEs5;
        }
        else {
            // not doing an es5, probably in dev mode
            appRegistry.corePolyfilled = yield generateEs5DisabledMessage(config, compilerCtx, outputTarget);
        }
    });
}
function canSkipAppFiles(buildCtx, cmpRegistry) {
    if (buildCtx.hasError || !cmpRegistry) {
        return true;
    }
    if (buildCtx.requiresFullBuild) {
        return false;
    }
    if (buildCtx.isRebuild) {
        if (buildCtx.hasScriptChanges) {
            return false;
        }
        return true;
    }
    return false;
}

function parseStyleDocs(styleDocs, styleText) {
    if (typeof styleText !== 'string') {
        return;
    }
    let startIndex;
    while ((startIndex = styleText.indexOf(CSS_DOC_START)) > -1) {
        styleText = styleText.substring(startIndex + CSS_DOC_START.length);
        const endIndex = styleText.indexOf(CSS_DOC_END);
        if (endIndex === -1) {
            break;
        }
        const comment = styleText.substring(0, endIndex);
        parseCssComment(styleDocs, comment);
        styleText = styleText.substring(endIndex + CSS_DOC_END.length);
    }
}
function parseCssComment(styleDocs, comment) {
    /**
     * @prop --max-width: Max width of the alert
     */
    const lines = comment.split(/\r?\n/).map(line => {
        line = line.trim();
        while (line.startsWith('*')) {
            line = line.substring(1).trim();
        }
        return line;
    });
    comment = lines.join(' ').replace(/\t/g, ' ').trim();
    while (comment.includes('  ')) {
        comment = comment.replace('  ', ' ');
    }
    const docs = comment.split(CSS_PROP_ANNOTATION);
    docs.forEach(d => {
        const doc = d.trim();
        if (!doc.startsWith(`--`)) {
            return;
        }
        const splt = doc.split(`:`);
        const cssDoc = {
            name: splt[0].trim(),
            docs: (splt.shift() && splt.join(`:`)).trim(),
            annotation: 'prop'
        };
        if (!styleDocs.some(c => c.name === cssDoc.name && c.annotation === 'prop')) {
            styleDocs.push(cssDoc);
        }
    });
    return styleDocs;
}
const CSS_DOC_START = `/**`;
const CSS_DOC_END = `*/`;
const CSS_PROP_ANNOTATION = `@prop`;

function parseCssImports(config, compilerCtx, buildCtx, srcFilePath, resolvedFilePath, styleText, styleDocs) {
    return __awaiter(this, void 0, void 0, function* () {
        const isCssEntry = resolvedFilePath.toLowerCase().endsWith('.css');
        return cssImports(config, compilerCtx, buildCtx, isCssEntry, srcFilePath, resolvedFilePath, styleText, [], styleDocs);
    });
}
function cssImports(config, compilerCtx, buildCtx, isCssEntry, srcFilePath, resolvedFilePath, styleText, noLoop, styleDocs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (noLoop.includes(resolvedFilePath)) {
            return styleText;
        }
        noLoop.push(resolvedFilePath);
        if (styleDocs) {
            parseStyleDocs(styleDocs, styleText);
        }
        const cssImports = getCssImports(config, buildCtx, resolvedFilePath, styleText);
        if (cssImports.length === 0) {
            return styleText;
        }
        yield Promise.all(cssImports.map((cssImportData) => __awaiter(this, void 0, void 0, function* () {
            yield concatCssImport(config, compilerCtx, buildCtx, isCssEntry, srcFilePath, cssImportData, noLoop, styleDocs);
        })));
        return replaceImportDeclarations(styleText, cssImports, isCssEntry);
    });
}
function concatCssImport(config, compilerCtx, buildCtx, isCssEntry, srcFilePath, cssImportData, noLoop, styleDocs) {
    return __awaiter(this, void 0, void 0, function* () {
        cssImportData.styleText = yield loadStyleText(compilerCtx, cssImportData);
        if (typeof cssImportData.styleText === 'string') {
            cssImportData.styleText = yield cssImports(config, compilerCtx, buildCtx, isCssEntry, cssImportData.filePath, cssImportData.filePath, cssImportData.styleText, noLoop, styleDocs);
        }
        else {
            const err = buildError(buildCtx.diagnostics);
            err.messageText = `Unable to read css import: ${cssImportData.srcImport}`;
            err.absFilePath = normalizePath(srcFilePath);
            err.relFilePath = normalizePath(config.sys.path.relative(config.rootDir, srcFilePath));
        }
    });
}
function loadStyleText(compilerCtx, cssImportData) {
    return __awaiter(this, void 0, void 0, function* () {
        let styleText = null;
        try {
            styleText = yield compilerCtx.fs.readFile(cssImportData.filePath);
        }
        catch (e) {
            if (cssImportData.altFilePath) {
                try {
                    styleText = yield compilerCtx.fs.readFile(cssImportData.filePath);
                }
                catch (e) { }
            }
        }
        return styleText;
    });
}
function getCssImports(config, buildCtx, filePath, styleText) {
    const imports = [];
    if (!styleText.includes('@import')) {
        // no @import at all, so don't bother
        return imports;
    }
    styleText = stripComments(styleText);
    const dir = config.sys.path.dirname(filePath);
    const importeeExt = filePath.split('.').pop().toLowerCase();
    let r;
    while (r = IMPORT_RE.exec(styleText)) {
        const cssImportData = {
            srcImport: r[0],
            url: r[4].replace(/[\"\'\)]/g, '')
        };
        if (!isLocalCssImport(cssImportData.srcImport)) {
            // do nothing for @import url(http://external.css)
            config.logger.debug(`did not resolve external css @import: ${cssImportData.srcImport}`);
            continue;
        }
        if (isCssNodeModule(cssImportData.url)) {
            // node resolve this path cuz it starts with ~
            resolveCssNodeModule(config, buildCtx.diagnostics, filePath, cssImportData);
        }
        else if (config.sys.path.isAbsolute(cssImportData.url)) {
            // absolute path already
            cssImportData.filePath = normalizePath(cssImportData.url);
        }
        else {
            // relative path
            cssImportData.filePath = normalizePath(config.sys.path.join(dir, cssImportData.url));
        }
        if (importeeExt !== 'css' && !cssImportData.filePath.toLowerCase().endsWith('.css')) {
            cssImportData.filePath += `.${importeeExt}`;
            if (importeeExt === 'scss') {
                const fileName = '_' + config.sys.path.basename(cssImportData.filePath);
                const dirPath = config.sys.path.dirname(cssImportData.filePath);
                cssImportData.altFilePath = pathJoin(config, dirPath, fileName);
            }
        }
        if (typeof cssImportData.filePath === 'string') {
            imports.push(cssImportData);
        }
    }
    return imports;
}
const IMPORT_RE = /(@import)\s+(url\()?\s?(.*?)\s?\)?([^;]*);?/gi;
function isCssNodeModule(url) {
    return url.startsWith('~');
}
function resolveCssNodeModule(config, diagnostics, filePath, cssImportData) {
    try {
        const dir = config.sys.path.dirname(filePath);
        const moduleId = getModuleId(cssImportData.url);
        cssImportData.filePath = config.sys.resolveModule(dir, moduleId, { manuallyResolve: true });
        cssImportData.filePath = config.sys.path.dirname(cssImportData.filePath);
        cssImportData.filePath += normalizePath(cssImportData.url.substring(moduleId.length + 1));
        cssImportData.updatedImport = `@import "${cssImportData.filePath}";`;
    }
    catch (e) {
        const d = buildError(diagnostics);
        d.messageText = `Unable to resolve node module for CSS @import: ${cssImportData.url}`;
        d.absFilePath = normalizePath(filePath);
        d.relFilePath = normalizePath(config.sys.path.relative(config.rootDir, filePath));
    }
}
function isLocalCssImport(srcImport) {
    srcImport = srcImport.toLowerCase();
    if (srcImport.includes('url(')) {
        srcImport = srcImport.replace(/\"/g, '');
        srcImport = srcImport.replace(/\'/g, '');
        srcImport = srcImport.replace(/\s/g, '');
        if (srcImport.includes('url(http') || srcImport.includes('url(//')) {
            return false;
        }
    }
    return true;
}
function getModuleId(orgImport) {
    if (orgImport.startsWith('~')) {
        orgImport = orgImport.substring(1);
    }
    const splt = orgImport.split('/');
    if (orgImport.startsWith('@')) {
        if (splt.length > 1) {
            return splt.slice(0, 2).join('/');
        }
    }
    return splt[0];
}
function replaceImportDeclarations(styleText, cssImports, isCssEntry) {
    cssImports.forEach(cssImportData => {
        if (isCssEntry) {
            if (typeof cssImportData.styleText === 'string') {
                styleText = styleText.replace(cssImportData.srcImport, cssImportData.styleText);
            }
        }
        else if (typeof cssImportData.updatedImport === 'string') {
            styleText = styleText.replace(cssImportData.srcImport, cssImportData.updatedImport);
        }
    });
    return styleText;
}
function stripComments(input) {
    let isInsideString = null;
    let currentCharacter = '';
    let returnValue = '';
    for (let i = 0; i < input.length; i++) {
        currentCharacter = input[i];
        if (input[i - 1] !== '\\') {
            if (currentCharacter === '"' || currentCharacter === '\'') {
                if (isInsideString === currentCharacter) {
                    isInsideString = null;
                }
                else if (!isInsideString) {
                    isInsideString = currentCharacter;
                }
            }
        }
        // Find beginning of /* type comment
        if (!isInsideString && currentCharacter === '/' && input[i + 1] === '*') {
            // Ignore important comment when configured to preserve comments using important syntax: /*!
            let j = i + 2;
            // Iterate over comment
            for (; j < input.length; j++) {
                // Find end of comment
                if (input[j] === '*' && input[j + 1] === '/') {
                    break;
                }
            }
            // Resume iteration over CSS string from the end of the comment
            i = j + 1;
            continue;
        }
        returnValue += currentCharacter;
    }
    return returnValue;
}

function getComponentStylesCache(config, compilerCtx, buildCtx, moduleFile, styleMeta, modeName) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheKey = getComponentStylesCacheKey(moduleFile, modeName);
        const cachedStyleMeta = compilerCtx.cachedStyleMeta.get(cacheKey);
        if (!cachedStyleMeta) {
            // don't have the cache to begin with, so can't continue
            return null;
        }
        if (isChangedTsFile(moduleFile, buildCtx) && hasDecoratorStyleChanges(compilerCtx, moduleFile, cacheKey)) {
            // this module is one of the changed ts files
            // and the changed ts file has different
            // styleUrls or styleStr in the component decorator
            return null;
        }
        if (!buildCtx.hasStyleChanges) {
            // doesn't look like there was any style changes to begin with
            // just return our cached data
            return cachedStyleMeta;
        }
        if (isChangedStyleEntryFile(buildCtx, styleMeta)) {
            // one of the files that's this components style url was one that changed
            return null;
        }
        const hasChangedImport = yield isChangedStyleEntryImport(config, compilerCtx, buildCtx, styleMeta);
        if (hasChangedImport) {
            // one of the files that's imported by the style url changed
            return null;
        }
        // woot! let's use the cached data we already compiled
        return cachedStyleMeta;
    });
}
function isChangedTsFile(moduleFile, buildCtx) {
    return (buildCtx.filesChanged.includes(moduleFile.sourceFilePath));
}
function hasDecoratorStyleChanges(compilerCtx, moduleFile, cacheKey) {
    const lastStyleInput = compilerCtx.lastComponentStyleInput.get(cacheKey);
    if (!lastStyleInput) {
        return true;
    }
    return (lastStyleInput !== getComponentStyleInputKey(moduleFile));
}
function isChangedStyleEntryFile(buildCtx, styleMeta) {
    if (!styleMeta.externalStyles) {
        return false;
    }
    return (buildCtx.filesChanged.some(f => {
        return styleMeta.externalStyles.some(s => s.absolutePath === f);
    }));
}
function isChangedStyleEntryImport(config, compilerCtx, buildCtx, styleMeta) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!styleMeta.externalStyles) {
            return false;
        }
        const checkedFiles = [];
        const promises = styleMeta.externalStyles.map(externalStyle => {
            return hasChangedImportFile(config, compilerCtx, buildCtx, externalStyle.absolutePath, checkedFiles);
        });
        const results = yield Promise.all(promises);
        return results.includes(true);
    });
}
function hasChangedImportFile(config, compilerCtx, buildCtx, filePath, checkedFiles) {
    return __awaiter(this, void 0, void 0, function* () {
        if (checkedFiles.includes(filePath)) {
            // already checked
            return false;
        }
        checkedFiles.push(filePath);
        let rtn = false;
        try {
            const content = yield compilerCtx.fs.readFile(filePath);
            rtn = yield hasChangedImportContent(config, compilerCtx, buildCtx, filePath, content, checkedFiles);
        }
        catch (e) { }
        return rtn;
    });
}
function hasChangedImportContent(config, compilerCtx, buildCtx, filePath, content, checkedFiles) {
    return __awaiter(this, void 0, void 0, function* () {
        const cssImports = getCssImports(config, buildCtx, filePath, content);
        if (cssImports.length === 0) {
            // don't bother
            return false;
        }
        const isChangedImport = buildCtx.filesChanged.some(changedFilePath => {
            return cssImports.some(c => c.filePath === changedFilePath || c.altFilePath === changedFilePath);
        });
        if (isChangedImport) {
            // one of the changed files is an import of this file
            return true;
        }
        // keep diggin'
        const promises = cssImports.map((cssImportData) => __awaiter(this, void 0, void 0, function* () {
            let hasChanged = yield hasChangedImportFile(config, compilerCtx, buildCtx, cssImportData.filePath, checkedFiles);
            if (!hasChanged && typeof cssImportData.altFilePath === 'string') {
                hasChanged = yield hasChangedImportFile(config, compilerCtx, buildCtx, cssImportData.altFilePath, checkedFiles);
            }
            return hasChanged;
        }));
        const results = yield Promise.all(promises);
        return results.includes(true);
    });
}
function getComponentStyleInputKey(moduleFile) {
    const input = [];
    if (moduleFile.cmpMeta.stylesMeta) {
        Object.keys(moduleFile.cmpMeta.stylesMeta).forEach(modeName => {
            input.push(modeName);
            const styleMeta = moduleFile.cmpMeta.stylesMeta[modeName];
            if (styleMeta.styleStr) {
                input.push(styleMeta.styleStr);
            }
            if (styleMeta.externalStyles) {
                styleMeta.externalStyles.forEach(s => {
                    input.push(s.absolutePath);
                });
            }
        });
    }
    return input.join(',');
}
function setComponentStylesCache(compilerCtx, moduleFile, modeName, styleMeta) {
    const cacheKey = getComponentStylesCacheKey(moduleFile, modeName);
    compilerCtx.cachedStyleMeta.set(cacheKey, styleMeta);
    const styleInput = getComponentStyleInputKey(moduleFile);
    compilerCtx.lastComponentStyleInput.set(cacheKey, styleInput);
}
function getComponentStylesCacheKey(moduleFile, modeName) {
    return `${moduleFile.sourceFilePath}#${modeName}`;
}

function runPluginResolveId(pluginCtx, importee) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const plugin of pluginCtx.config.plugins) {
            if (typeof plugin.resolveId === 'function') {
                try {
                    const results = plugin.resolveId(importee, null, pluginCtx);
                    if (results != null) {
                        if (typeof results.then === 'function') {
                            const promiseResults = yield results;
                            if (promiseResults != null) {
                                return promiseResults;
                            }
                        }
                        else if (typeof results === 'string') {
                            return results;
                        }
                    }
                }
                catch (e) {
                    catchError(pluginCtx.diagnostics, e);
                }
            }
        }
        // default resolvedId
        return importee;
    });
}
function runPluginLoad(pluginCtx, id) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const plugin of pluginCtx.config.plugins) {
            if (typeof plugin.load === 'function') {
                try {
                    const results = plugin.load(id, pluginCtx);
                    if (results != null) {
                        if (typeof results.then === 'function') {
                            const promiseResults = yield results;
                            if (promiseResults != null) {
                                return promiseResults;
                            }
                        }
                        else if (typeof results === 'string') {
                            return results;
                        }
                    }
                }
                catch (e) {
                    catchError(pluginCtx.diagnostics, e);
                }
            }
        }
        // default load()
        return pluginCtx.fs.readFile(id);
    });
}
function runPluginTransforms(config, compilerCtx, buildCtx, id, moduleFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginCtx = {
            config: config,
            sys: config.sys,
            fs: compilerCtx.fs,
            cache: compilerCtx.cache,
            diagnostics: []
        };
        const resolvedId = yield runPluginResolveId(pluginCtx, id);
        const sourceText = yield runPluginLoad(pluginCtx, resolvedId);
        const transformResults = {
            code: sourceText,
            id: id
        };
        const isRawCssFile = transformResults.id.toLowerCase().endsWith('.css');
        if (isRawCssFile) {
            // concat all css @imports into one file
            // when the entry file is a .css file (not .scss)
            // do this BEFORE transformations on css files
            const shouldParseCssDocs = (!!moduleFile && config.outputTargets.some(o => {
                return o.type === 'docs' || o.type === 'docs-json' || o.type === 'docs-custom';
            }));
            if (shouldParseCssDocs && moduleFile.cmpMeta) {
                moduleFile.cmpMeta.styleDocs = moduleFile.cmpMeta.styleDocs || [];
                transformResults.code = yield parseCssImports(config, compilerCtx, buildCtx, id, id, transformResults.code, moduleFile.cmpMeta.styleDocs);
            }
            else {
                transformResults.code = yield parseCssImports(config, compilerCtx, buildCtx, id, id, transformResults.code);
            }
        }
        for (const plugin of pluginCtx.config.plugins) {
            if (typeof plugin.transform === 'function') {
                try {
                    let pluginTransformResults;
                    const results = plugin.transform(transformResults.code, transformResults.id, pluginCtx);
                    if (results != null) {
                        if (typeof results.then === 'function') {
                            pluginTransformResults = yield results;
                        }
                        else {
                            pluginTransformResults = results;
                        }
                        if (pluginTransformResults != null) {
                            if (typeof pluginTransformResults === 'string') {
                                transformResults.code = pluginTransformResults;
                            }
                            else {
                                if (typeof pluginTransformResults.code === 'string') {
                                    transformResults.code = pluginTransformResults.code;
                                }
                                if (typeof pluginTransformResults.id === 'string') {
                                    transformResults.id = pluginTransformResults.id;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    catchError(buildCtx.diagnostics, e);
                }
            }
        }
        buildCtx.diagnostics.push(...pluginCtx.diagnostics);
        if (!isRawCssFile) {
            // sass precompiler just ran and converted @import "my.css" into @import url("my.css")
            // because of the ".css" extension. Sass did NOT concat the ".css" files into the output
            // but only updated it to use url() instead. Let's go ahead and concat the url() css
            // files into one file like we did for raw .css files.
            // do this AFTER transformations on non-css files
            const shouldParseCssDocs = (!!moduleFile && config.outputTargets.some(o => {
                return o.type === 'docs' || o.type === 'docs-json' || o.type === 'docs-custom';
            }));
            if (shouldParseCssDocs && moduleFile.cmpMeta) {
                moduleFile.cmpMeta.styleDocs = moduleFile.cmpMeta.styleDocs || [];
                transformResults.code = yield parseCssImports(config, compilerCtx, buildCtx, id, transformResults.id, transformResults.code, moduleFile.cmpMeta.styleDocs);
            }
            else {
                transformResults.code = yield parseCssImports(config, compilerCtx, buildCtx, id, transformResults.id, transformResults.code);
            }
        }
        return transformResults;
    });
}

function scopeComponentCss(config, buildCtx, cmpMeta, mode, cssText) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const scopeId = getScopeId(cmpMeta, mode);
            const hostScopeId = getElementScopeId(scopeId, true);
            const slotScopeId = getElementScopeId(scopeId);
            cssText = yield config.sys.scopeCss(cssText, scopeId, hostScopeId, slotScopeId);
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
        return cssText;
    });
}

function generateComponentStylesMode(config, compilerCtx, buildCtx, moduleFile, styleMeta, modeName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        if (buildCtx.isRebuild) {
            const cachedCompiledStyles = yield getComponentStylesCache(config, compilerCtx, buildCtx, moduleFile, styleMeta, modeName);
            if (cachedCompiledStyles) {
                styleMeta.compiledStyleText = cachedCompiledStyles.compiledStyleText;
                styleMeta.compiledStyleTextScoped = cachedCompiledStyles.compiledStyleTextScoped;
                return;
            }
        }
        // compile each mode style
        const compiledStyles = yield compileStyles(config, compilerCtx, buildCtx, moduleFile, styleMeta);
        // format and set the styles for use later
        const compiledStyleMeta = yield setStyleText(config, compilerCtx, buildCtx, moduleFile.cmpMeta, modeName, styleMeta.externalStyles, compiledStyles);
        styleMeta.compiledStyleText = compiledStyleMeta.compiledStyleText;
        styleMeta.compiledStyleTextScoped = compiledStyleMeta.compiledStyleTextScoped;
        if (config.watch) {
            // since this is a watch and we'll be checking this again
            // let's cache what we've learned today
            setComponentStylesCache(compilerCtx, moduleFile, modeName, styleMeta);
        }
    });
}
function compileStyles(config, compilerCtx, buildCtx, moduleFile, styleMeta) {
    return __awaiter(this, void 0, void 0, function* () {
        // get all the absolute paths for each style
        const extStylePaths = styleMeta.externalStyles.map(extStyle => extStyle.absolutePath);
        if (typeof styleMeta.styleStr === 'string') {
            // plain styles just in a string
            // let's put these file in an in-memory file
            const inlineAbsPath = moduleFile.jsFilePath + '.css';
            extStylePaths.push(inlineAbsPath);
            yield compilerCtx.fs.writeFile(inlineAbsPath, styleMeta.styleStr, { inMemoryOnly: true });
        }
        // build an array of style strings
        const compiledStyles = yield Promise.all(extStylePaths.map(extStylePath => {
            return compileExternalStyle(config, compilerCtx, buildCtx, moduleFile, extStylePath);
        }));
        return compiledStyles;
    });
}
function compileExternalStyle(config, compilerCtx, buildCtx, moduleFile, extStylePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return '/* build aborted */';
        }
        extStylePath = normalizePath(extStylePath);
        // see if we can used a cached style first
        let styleText;
        if (moduleFile.isCollectionDependency) {
            // if it's a collection dependency and it's a preprocessor file like sass
            // AND we have the correct plugin then let's compile it
            const hasPlugin = hasPluginInstalled(config, extStylePath);
            if (!hasPlugin) {
                // the collection has this style as a preprocessor file, like sass
                // however the user doesn't have this plugin installed, which is file
                // instead of using the preprocessor file (sass) use the vanilla css file
                const parts = extStylePath.split('.');
                parts[parts.length - 1] = 'css';
                extStylePath = parts.join('.');
            }
        }
        else {
            // not a collection dependency
            // check known extensions just for a helpful message
            checkPluginHelpers(config, buildCtx, extStylePath);
        }
        try {
            const transformResults = yield runPluginTransforms(config, compilerCtx, buildCtx, extStylePath, moduleFile);
            if (!moduleFile.isCollectionDependency) {
                const collectionDirs = config.outputTargets.filter(o => o.collectionDir);
                const relPath = config.sys.path.relative(config.srcDir, transformResults.id);
                yield Promise.all(collectionDirs.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
                    const collectionPath = config.sys.path.join(outputTarget.collectionDir, relPath);
                    yield compilerCtx.fs.writeFile(collectionPath, transformResults.code);
                })));
            }
            styleText = transformResults.code;
            buildCtx.styleBuildCount++;
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                const d = buildError(buildCtx.diagnostics);
                const relExtStyle = config.sys.path.relative(config.cwd, extStylePath);
                const relSrc = config.sys.path.relative(config.cwd, moduleFile.sourceFilePath);
                d.messageText = `Unable to load style ${relExtStyle} from ${relSrc}`;
            }
            else {
                catchError(buildCtx.diagnostics, e);
            }
            styleText = '';
        }
        return styleText;
    });
}
function checkPluginHelpers(config, buildCtx, externalStylePath) {
    PLUGIN_HELPERS.forEach(p => {
        checkPluginHelper(config, buildCtx, externalStylePath, p.pluginExts, p.pluginId, p.pluginName);
    });
}
function checkPluginHelper(config, buildCtx, externalStylePath, pluginExts, pluginId, pluginName) {
    if (!hasFileExtension(externalStylePath, pluginExts)) {
        return;
    }
    if (config.plugins.some(p => p.name === pluginId)) {
        return;
    }
    const errorKey = 'styleError' + pluginId;
    if (buildCtx.data[errorKey]) {
        // already added this key
        return;
    }
    buildCtx.data[errorKey] = true;
    const relPath = config.sys.path.relative(config.rootDir, externalStylePath);
    const msg = [
        `Style "${relPath}" is a ${pluginName} file, however the "${pluginId}" `,
        `plugin has not been installed. Please install the "@stencil/${pluginId}" `,
        `plugin and add it to "config.plugins" within the project's stencil.config.js `,
        `file. For more info please see: https://www.npmjs.com/package/@stencil/${pluginId}`
    ].join('');
    const d = buildError(buildCtx.diagnostics);
    d.header = 'style error';
    d.messageText = msg;
}
function hasPluginInstalled(config, filePath) {
    // TODO: don't hard these
    const plugin = PLUGIN_HELPERS.find(p => hasFileExtension(filePath, p.pluginExts));
    if (plugin) {
        return config.plugins.some(p => p.name === plugin.pluginId);
    }
    return false;
}
function setStyleText(config, compilerCtx, buildCtx, cmpMeta, modeName, externalStyles, compiledStyles) {
    return __awaiter(this, void 0, void 0, function* () {
        const styleMeta = {};
        // join all the component's styles for this mode together into one line
        styleMeta.compiledStyleText = compiledStyles.join('\n\n').trim();
        let filePath = null;
        const externalStyle = externalStyles && externalStyles.length && externalStyles[0];
        if (externalStyle && externalStyle.absolutePath) {
            filePath = externalStyle.absolutePath;
        }
        // auto add css prefixes and minifies when configured
        styleMeta.compiledStyleText = yield optimizeCss(config, compilerCtx, buildCtx.diagnostics, styleMeta.compiledStyleText, filePath, true);
        if (requiresScopedStyles(cmpMeta.encapsulationMeta, config)) {
            // only create scoped styles if we need to
            const compiledStyleTextScoped = yield scopeComponentCss(config, buildCtx, cmpMeta, modeName, styleMeta.compiledStyleText);
            styleMeta.compiledStyleTextScoped = compiledStyleTextScoped;
            if (cmpMeta.encapsulationMeta === 2 /* ScopedCss */) {
                styleMeta.compiledStyleText = compiledStyleTextScoped;
            }
        }
        // by default the compiledTextScoped === compiledStyleText
        if (!styleMeta.compiledStyleTextScoped) {
            styleMeta.compiledStyleTextScoped = styleMeta.compiledStyleText;
        }
        let addStylesUpdate = false;
        let addScopedStylesUpdate = false;
        // test to see if the last styles are different
        const styleId = getStyleId(cmpMeta, modeName, false);
        if (compilerCtx.lastBuildStyles.get(styleId) !== styleMeta.compiledStyleText) {
            compilerCtx.lastBuildStyles.set(styleId, styleMeta.compiledStyleText);
            if (buildCtx.isRebuild) {
                addStylesUpdate = true;
            }
        }
        const scopedStyleId = getStyleId(cmpMeta, modeName, true);
        if (compilerCtx.lastBuildStyles.get(scopedStyleId) !== styleMeta.compiledStyleTextScoped) {
            compilerCtx.lastBuildStyles.set(scopedStyleId, styleMeta.compiledStyleTextScoped);
            if (buildCtx.isRebuild) {
                addScopedStylesUpdate = true;
            }
        }
        const styleMode = (modeName === DEFAULT_STYLE_MODE ? null : modeName);
        if (addStylesUpdate) {
            buildCtx.stylesUpdated = buildCtx.stylesUpdated || [];
            buildCtx.stylesUpdated.push({
                styleTag: cmpMeta.tagNameMeta,
                styleMode: styleMode,
                styleText: styleMeta.compiledStyleText,
                isScoped: false
            });
        }
        if (addScopedStylesUpdate) {
            buildCtx.stylesUpdated.push({
                styleTag: cmpMeta.tagNameMeta,
                styleMode: styleMode,
                styleText: styleMeta.compiledStyleTextScoped,
                isScoped: true
            });
        }
        styleMeta.compiledStyleText = escapeCssForJs(styleMeta.compiledStyleText);
        styleMeta.compiledStyleTextScoped = escapeCssForJs(styleMeta.compiledStyleTextScoped);
        return styleMeta;
    });
}
function getStyleId(cmpMeta, modeName, isScopedStyles) {
    return `${cmpMeta.tagNameMeta}${modeName}${isScopedStyles ? '.sc' : ''}`;
}
function escapeCssForJs(style) {
    if (typeof style === 'string') {
        return style
            .replace(/\\[\D0-7]/g, (v) => '\\' + v)
            .replace(/\r\n|\r|\n/g, `\\n`)
            .replace(/\"/g, `\\"`)
            .replace(/\@/g, `\\@`);
    }
    return style;
}
function requiresScopedStyles(encapsulation, config) {
    return ((encapsulation === 1 /* ShadowDom */ && config.buildScoped) ||
        (encapsulation === 2 /* ScopedCss */));
}
const PLUGIN_HELPERS = [
    {
        pluginName: 'PostCSS',
        pluginId: 'postcss',
        pluginExts: ['pcss']
    },
    {
        pluginName: 'Sass',
        pluginId: 'sass',
        pluginExts: ['scss', 'sass']
    },
    {
        pluginName: 'Stylus',
        pluginId: 'stylus',
        pluginExts: ['styl', 'stylus']
    }, {
        pluginName: 'Less',
        pluginId: 'less',
        pluginExts: ['less']
    }
];

function generateBundles(config, compilerCtx, buildCtx, entryModules, rawModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!rawModules || canSkipGenerateBundles(buildCtx)) {
            return {};
        }
        // both styles and modules are done bundling
        // combine the styles and modules together
        // generate the actual files to write
        const timeSpan = buildCtx.createTimeSpan(`generate bundles started`);
        const entryModulesMap = new Map();
        entryModules.forEach(e => entryModulesMap.set(e.entryKey, e));
        buildCtx.bundleBuildCount += rawModules[0].list.length;
        yield Promise.all([
            // Generate entry points for components. Each entry-point might emit several files
            // All different modes + scoped
            ...entryModules.map(entry => generateBundleModesEntryModule(config, compilerCtx, rawModules, entry)),
            // Generate chunk files, ie, not entry points for components: chunk-[hash].js
            ...rawModules.map(mod => generateChunkFiles(config, compilerCtx, buildCtx, mod, entryModulesMap))
        ]);
        // create the registry of all the components
        const cmpRegistry = createComponentRegistry(entryModules);
        timeSpan.finish(`generate bundles finished`);
        return cmpRegistry;
    });
}
function generateChunkFiles(config, compilerCtx, buildCtx, module, entryModulesMap) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        const timeSpan = buildCtx.createTimeSpan(`generateBrowserEsm started`, true);
        const esmPromises = module.list
            .filter(chunk => !entryModulesMap.has(chunk.entryKey))
            .map((chunk) => __awaiter(this, void 0, void 0, function* () {
            // chunk asset, not a entry point, just write to the final destination
            if (module.isBrowser) {
                const fileName = `${chunk.entryKey}${module.sourceTarget === 'es5' ? '.es5' : ''}.js`;
                const jsText = replaceBundleIdPlaceholder(chunk.code, chunk.filename);
                yield writeBrowserJSFile(config, compilerCtx, fileName, jsText);
            }
            else {
                yield writeEsmJSFile(config, compilerCtx, module.sourceTarget, chunk.filename, chunk.code);
            }
        }));
        yield Promise.all(esmPromises);
        timeSpan.finish(`generateBrowserEsm finished`);
    });
}
function writeBrowserJSFile(config, compilerCtx, fileName, jsText) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputTargets = config.outputTargets.filter(outputTarget => outputTarget.appBuild);
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            // get the absolute path to where it'll be saved in www
            const buildPath = pathJoin(config, getAppBuildDir(config, outputTarget), fileName);
            // write to the build dir
            yield compilerCtx.fs.writeFile(buildPath, jsText);
        })));
    });
}
function writeEsmJSFile(config, compilerCtx, sourceTarget, fileName, jsText) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputTargets = config.outputTargets.filter(outputTarget => outputTarget.type === 'dist');
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            // get the absolute path to where it'll be saved in www
            const buildPath = pathJoin(config, getDistEsmComponentsDir(config, outputTarget, sourceTarget), fileName);
            // write to the build dir
            yield compilerCtx.fs.writeFile(buildPath, jsText);
        })));
    });
}
function generateBundleModesEntryModule(config, compilerCtx, rawModules, entryModule) {
    return __awaiter(this, void 0, void 0, function* () {
        const mainModule = rawModules[0];
        const entryKey = entryModule.entryKey;
        const chunkIndex = mainModule.list.findIndex(c => c.entryKey === entryKey);
        if (chunkIndex >= 0) {
            entryModule.modeNames = entryModule.modeNames || [];
            yield Promise.all(entryModule.modeNames.map(modeName => (generateBundleMode(config, compilerCtx, entryModule, modeName, rawModules, chunkIndex))));
        }
    });
}
function generateBundleMode(config, compilerCtx, entryModule, modeName, rawModules, chunkIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        let bundleId;
        const promises = rawModules.map((module) => __awaiter(this, void 0, void 0, function* () {
            const chunk = module.list[chunkIndex];
            const jsText = injectStyleMode(entryModule.moduleFiles, chunk.code, modeName, false);
            if (!bundleId) {
                // the only bundle id comes from mode, no scoped styles and esm
                bundleId = getBundleId(config, entryModule, modeName, jsText);
                // assign the bundle id build from the
                // mode, no scoped styles and esm to each of the components
                entryModule.moduleFiles.forEach(moduleFile => {
                    moduleFile.cmpMeta.bundleIds = moduleFile.cmpMeta.bundleIds || {};
                    if (typeof moduleFile.cmpMeta.bundleIds === 'object') {
                        moduleFile.cmpMeta.bundleIds[modeName] = bundleId;
                    }
                });
            }
            // generate the bundle build for mode, no scoped styles, and esm
            if (module.isBrowser) {
                yield generateBundleBrowserBuild(config, compilerCtx, entryModule, jsText, bundleId, modeName, false, module.sourceTarget);
            }
            else {
                yield generateBundleEsmBuild(config, compilerCtx, entryModule, jsText, bundleId, modeName, false, module.sourceTarget);
            }
            if (entryModule.requiresScopedStyles && config.buildScoped) {
                // create js text for: mode, scoped styles, esm
                const scopedJsText = yield injectStyleMode(entryModule.moduleFiles, chunk.code, modeName, true);
                // generate the bundle build for: mode, esm and scoped styles
                if (module.isBrowser) {
                    yield generateBundleBrowserBuild(config, compilerCtx, entryModule, scopedJsText, bundleId, modeName, true, module.sourceTarget);
                }
                else {
                    yield generateBundleEsmBuild(config, compilerCtx, entryModule, scopedJsText, bundleId, modeName, true, module.sourceTarget);
                }
            }
        }));
        yield Promise.all(promises);
    });
}
function generateBundleBrowserBuild(config, compilerCtx, entryModule, jsText, bundleId, modeName, isScopedStyles, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        // create the file name
        const fileName = getBrowserFilename(bundleId, isScopedStyles, sourceTarget);
        // update the bundle id placeholder with the actual bundle id
        // this is used by jsonp callbacks to know which bundle loaded
        jsText = replaceBundleIdPlaceholder(jsText, bundleId);
        const entryBundle = {
            fileName: fileName,
            text: jsText,
            outputs: [],
            modeName: modeName,
            sourceTarget: sourceTarget,
            isScopedStyles: isScopedStyles
        };
        entryModule.entryBundles = entryModule.entryBundles || [];
        entryModule.entryBundles.push(entryBundle);
        const outputTargets = config.outputTargets.filter(outputTarget => {
            return outputTarget.appBuild;
        });
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            // get the absolute path to where it'll be saved
            const wwwBuildPath = pathJoin(config, getAppBuildDir(config, outputTarget), fileName);
            // write to the build
            yield compilerCtx.fs.writeFile(wwwBuildPath, jsText);
            entryBundle.outputs.push(wwwBuildPath);
        })));
    });
}
function generateBundleEsmBuild(config, compilerCtx, entryModule, jsText, bundleId, modeName, isScopedStyles, sourceTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        // create the file name
        const fileName = getEsmFilename(bundleId, isScopedStyles);
        // update the bundle id placeholder with the actual bundle id
        // this is used by jsonp callbacks to know which bundle loaded
        jsText = replaceBundleIdPlaceholder(jsText, bundleId);
        const entryBundle = {
            fileName: fileName,
            text: jsText,
            outputs: [],
            modeName: modeName,
            sourceTarget: sourceTarget,
            isScopedStyles: isScopedStyles
        };
        entryModule.entryBundles = entryModule.entryBundles || [];
        entryModule.entryBundles.push(entryBundle);
        const outputTargets = config.outputTargets.filter(o => o.type === 'dist');
        yield Promise.all(outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            // get the absolute path to where it'll be saved
            const esmBuildPath = pathJoin(config, getDistEsmComponentsDir(config, outputTarget, sourceTarget), fileName);
            // write to the build
            yield compilerCtx.fs.writeFile(esmBuildPath, jsText);
            entryBundle.outputs.push(esmBuildPath);
        })));
    });
}
function injectStyleMode(moduleFiles, jsText, modeName, isScopedStyles) {
    moduleFiles.forEach(moduleFile => {
        jsText = injectComponentStyleMode(moduleFile.cmpMeta, modeName, jsText, isScopedStyles);
    });
    return jsText;
}
function injectComponentStyleMode(cmpMeta, modeName, jsText, isScopedStyles) {
    if (typeof jsText !== 'string') {
        return '';
    }
    const stylePlaceholder = getStylePlaceholder(cmpMeta.tagNameMeta);
    const stylePlaceholderId = getStyleIdPlaceholder(cmpMeta.tagNameMeta);
    let styleText = '';
    if (cmpMeta.stylesMeta) {
        let modeStyles = cmpMeta.stylesMeta[modeName];
        if (modeStyles) {
            if (isScopedStyles) {
                // we specifically want scoped css
                styleText = modeStyles.compiledStyleTextScoped;
            }
            if (!styleText) {
                // either we don't want scoped css
                // or we DO want scoped css, but we don't have any
                // use the un-scoped css
                styleText = modeStyles.compiledStyleText || '';
            }
        }
        else {
            modeStyles = cmpMeta.stylesMeta[DEFAULT_STYLE_MODE];
            if (modeStyles) {
                if (isScopedStyles) {
                    // we specifically want scoped css
                    styleText = modeStyles.compiledStyleTextScoped;
                }
                if (!styleText) {
                    // either we don't want scoped css
                    // or we DO want scoped css, but we don't have any
                    // use the un-scoped css
                    styleText = modeStyles.compiledStyleText || '';
                }
            }
        }
    }
    // replace the style placeholder string that's already in the js text
    jsText = jsText.replace(stylePlaceholder, styleText);
    // replace the style id placeholder string that's already in the js text
    jsText = jsText.replace(stylePlaceholderId, modeName);
    // return the js text with the newly inject style
    return jsText;
}
function getBundleId(config, entryModule, modeName, jsText) {
    if (config.hashFileNames) {
        // create style id from hashing the content
        return getBundleIdHashed(config, jsText);
    }
    return getBundleIdDev(entryModule, modeName);
}
function getBundleIdHashed(config, jsText) {
    return config.sys.generateContentHash(jsText, config.hashedFileNameLength);
}
function getBundleIdDev(entryModule, modeName) {
    const tags = entryModule.moduleFiles
        .sort((a, b) => {
        if (a.isCollectionDependency && !b.isCollectionDependency) {
            return 1;
        }
        if (!a.isCollectionDependency && b.isCollectionDependency) {
            return -1;
        }
        if (a.cmpMeta.tagNameMeta < b.cmpMeta.tagNameMeta)
            return -1;
        if (a.cmpMeta.tagNameMeta > b.cmpMeta.tagNameMeta)
            return 1;
        return 0;
    })
        .map(m => m.cmpMeta.tagNameMeta);
    if (modeName === DEFAULT_STYLE_MODE || !modeName) {
        return tags[0];
    }
    return `${tags[0]}.${modeName}`;
}
function createComponentRegistry(entryModules) {
    const registryComponents = [];
    const cmpRegistry = {};
    return entryModules
        .reduce((rcs, bundle) => {
        const cmpMetas = bundle.moduleFiles
            .filter(m => m.cmpMeta)
            .map(moduleFile => moduleFile.cmpMeta);
        return rcs.concat(cmpMetas);
    }, registryComponents)
        .sort((a, b) => {
        if (a.tagNameMeta < b.tagNameMeta)
            return -1;
        if (a.tagNameMeta > b.tagNameMeta)
            return 1;
        return 0;
    })
        .reduce((registry, cmpMeta) => {
        return Object.assign({}, registry, { [cmpMeta.tagNameMeta]: cmpMeta });
    }, cmpRegistry);
}
function canSkipGenerateBundles(buildCtx) {
    if (buildCtx.hasError || !buildCtx.isActiveBuild) {
        return true;
    }
    if (buildCtx.requiresFullBuild) {
        return false;
    }
    if (buildCtx.isRebuild) {
        if (buildCtx.hasScriptChanges || buildCtx.hasStyleChanges) {
            return false;
        }
        return true;
    }
    return false;
}
const EXTS = ['tsx', 'ts', 'js', 'css'];
PLUGIN_HELPERS.forEach(p => p.pluginExts.forEach(pe => EXTS.push(pe)));

function generateServiceWorkerUrl(config, outputTarget) {
    let swUrl = normalizePath(config.sys.path.relative(outputTarget.dir, outputTarget.serviceWorker.swDest));
    if (swUrl.charAt(0) !== '/') {
        swUrl = '/' + swUrl;
    }
    swUrl = outputTarget.baseUrl + swUrl.substring(1);
    return swUrl;
}
function appendSwScript(indexHtml, htmlToAppend) {
    const match = indexHtml.match(BODY_CLOSE_REG);
    if (match) {
        indexHtml = indexHtml.replace(match[0], `${htmlToAppend}\n${match[0]}`);
    }
    else {
        indexHtml += '\n' + htmlToAppend;
    }
    return indexHtml;
}
const BODY_CLOSE_REG = /<\/body>/i;

function updateIndexHtmlServiceWorker(config, buildCtx, outputTarget, indexHtml) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!outputTarget.serviceWorker && config.devMode) {
            // if we're not generating a sw, and this is a dev build
            // then let's inject a script that always unregisters any service workers
            indexHtml = injectUnregisterServiceWorker(indexHtml);
        }
        else if (outputTarget.serviceWorker) {
            // we have a valid sw config, so we'll need to inject the register sw script
            indexHtml = yield injectRegisterServiceWorker(config, buildCtx, outputTarget, indexHtml);
        }
        return indexHtml;
    });
}
function injectRegisterServiceWorker(config, buildCtx, outputTarget, indexHtml) {
    return __awaiter(this, void 0, void 0, function* () {
        const swUrl = generateServiceWorkerUrl(config, outputTarget);
        const serviceWorker = getRegisterSwScript(swUrl);
        const swHtml = `<script data-build="${buildCtx.timestamp}">${serviceWorker}</script>`;
        return appendSwScript(indexHtml, swHtml);
    });
}
function injectUnregisterServiceWorker(indexHtml) {
    return appendSwScript(indexHtml, UNREGSITER_SW);
}
function getRegisterSwScript(swUrl) {
    return `
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('${swUrl}')
          .then(function(reg) {
            reg.onupdatefound = function() {
              var installingWorker = reg.installing;
              installingWorker.onstatechange = function() {
                if (installingWorker.state === 'installed') {
                  window.dispatchEvent(new Event('swUpdate'))
                }
              }
            }
          })
          .catch(function(err) { console.error('service worker error', err) });
      });
    }
`;
}
const UNREGSITER_SW = `
  <script>
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      // auto-unregister service worker during dev mode
      navigator.serviceWorker.getRegistration().then(function(registration) {
        if (registration) {
          registration.unregister().then(function() { location.reload(true) });
        }
      });
    }
  </script>
`;

function generateIndexHtmls(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        const indexHtmlOutputs = config.outputTargets.filter(o => o.indexHtml);
        yield Promise.all(indexHtmlOutputs.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield generateIndexHtml(config, compilerCtx, buildCtx, outputTarget);
        })));
    });
}
function generateIndexHtml(config, compilerCtx, buildCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!outputTarget.indexHtml || !config.srcIndexHtml) {
            return;
        }
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        if (compilerCtx.hasSuccessfulBuild && buildCtx.appFileBuildCount === 0 && !buildCtx.hasIndexHtmlChanges) {
            // no need to rebuild index.html if there were no app file changes
            return;
        }
        // get the source index html content
        try {
            let indexSrcHtml = yield compilerCtx.fs.readFile(config.srcIndexHtml);
            try {
                indexSrcHtml = yield updateIndexHtmlServiceWorker(config, buildCtx, outputTarget, indexSrcHtml);
                // add the prerendered html to our list of files to write
                yield compilerCtx.fs.writeFile(outputTarget.indexHtml, indexSrcHtml);
                buildCtx.debug(`optimizeHtml, write: ${config.sys.path.relative(config.rootDir, outputTarget.indexHtml)}`);
            }
            catch (e) {
                catchError(buildCtx.diagnostics, e);
            }
        }
        catch (e) {
            // it's ok if there's no index file
            buildCtx.debug(`no index html: ${config.srcIndexHtml}`);
        }
    });
}

function deriveModules(config, compilerCtx, buildCtx, moduleFormats) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!moduleFormats) {
            return undefined;
        }
        const modules = yield Promise.all([
            deriveModule(config, compilerCtx, buildCtx, 'es2017', true, true, moduleFormats.esm),
            deriveModule(config, compilerCtx, buildCtx, 'es2017', false, false, moduleFormats.esm),
            deriveModule(config, compilerCtx, buildCtx, 'es5', false, true, moduleFormats.esm),
            deriveModule(config, compilerCtx, buildCtx, 'es5', true, true, moduleFormats.amd),
        ]);
        const rawModules = modules.filter(m => !!m);
        if (rawModules.length === 0) {
            return undefined;
        }
        return rawModules;
    });
}
function deriveModule(config, compilerCtx, buildCtx, sourceTarget, isBrowser, mightMinify, moduleList) {
    return __awaiter(this, void 0, void 0, function* () {
        // skip if moduleList is not defined
        if (!moduleList) {
            return undefined;
        }
        // skip if es5 build is disabled
        if (sourceTarget === 'es5' && !config.buildEs5) {
            return undefined;
        }
        // skip non-browser builds if ESM is disabled
        if (!isBrowser && !config.buildEsm) {
            return undefined;
        }
        const module = createModule(moduleList, sourceTarget, isBrowser);
        yield Promise.all(module.list.map(chunk => deriveChunk(config, compilerCtx, buildCtx, sourceTarget, isBrowser, mightMinify, chunk)));
        return module;
    });
}
function createModule(moduleList, sourceTarget, isBrowser) {
    const list = Object.keys(moduleList).map(chunkKey => ({
        entryKey: chunkKey.replace('.js', ''),
        filename: chunkKey,
        code: moduleList[chunkKey].code
    }));
    return {
        list,
        sourceTarget,
        isBrowser
    };
}
function deriveChunk(config, compilerCtx, buildCtx, sourceTarget, isBrowser, mightMinify, chunk) {
    return __awaiter(this, void 0, void 0, function* () {
        // replace intro placeholder with an actual intro statement
        chunk.code = chunk.code.replace(getIntroPlaceholder(), generateIntro(config, isBrowser));
        // transpile
        if (sourceTarget === 'es5') {
            chunk.code = yield transpileEs5Bundle(config, compilerCtx, buildCtx, isBrowser, chunk.code);
            if (!isBrowser) {
                chunk.code = chunk.code.replace(`from "tslib";`, `from '../polyfills/tslib.js';`);
            }
        }
        // only minify browser build when minifyJs is enabled
        if (mightMinify && config.minifyJs) {
            chunk.code = yield minifyJs(config, compilerCtx, buildCtx.diagnostics, chunk.code, sourceTarget, true);
        }
    });
}
function transpileEs5Bundle(config, compilerCtx, buildCtx, isBrowser, jsText) {
    return __awaiter(this, void 0, void 0, function* () {
        // use typescript to convert this js text into es5
        const transpileResults = yield transpileToEs5Main(config, compilerCtx, jsText, isBrowser);
        if (transpileResults.diagnostics && transpileResults.diagnostics.length > 0) {
            buildCtx.diagnostics.push(...transpileResults.diagnostics);
            if (hasError(transpileResults.diagnostics)) {
                return jsText;
            }
        }
        return transpileResults.code;
    });
}
function generateIntro(config, isBrowser) {
    return isBrowser
        ? `const h = window.${config.namespace}.h;`
        : `import { h } from '../${getCoreEsmFileName(config)}';`;
}

function abortPlugin(buildCtx) {
    // this plugin is only used to ensure we're not trying to bundle
    // when it's no longer the active build. So in a way we're canceling
    // any bundling for previous builds still running since everything is async.
    return {
        name: 'abortPlugin',
        resolveId() {
            if (!buildCtx.isActiveBuild) {
                return `_not_active_build.js`;
            }
            return null;
        },
        load() {
            if (!buildCtx.isActiveBuild) {
                return `/* build aborted */`;
            }
            return null;
        }
    };
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/*!
 * filename-regex <https://github.com/regexps/filename-regex>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert
 * Licensed under the MIT license.
 */

var filenameRegex = function filenameRegex() {
  return /([^\\\/]+)$/;
};

/*!
 * arr-flatten <https://github.com/jonschlinkert/arr-flatten>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var arrFlatten = function (arr) {
  return flat(arr, []);
};

function flat(arr, res) {
  var i = 0, cur;
  var len = arr.length;
  for (; i < len; i++) {
    cur = arr[i];
    Array.isArray(cur) ? flat(cur, res) : res.push(cur);
  }
  return res;
}

var slice = [].slice;

/**
 * Return the difference between the first array and
 * additional arrays.
 *
 * ```js
 * var diff = require('{%= name %}');
 *
 * var a = ['a', 'b', 'c', 'd'];
 * var b = ['b', 'c'];
 *
 * console.log(diff(a, b))
 * //=> ['a', 'd']
 * ```
 *
 * @param  {Array} `a`
 * @param  {Array} `b`
 * @return {Array}
 * @api public
 */

function diff(arr, arrays) {
  var argsLen = arguments.length;
  var len = arr.length, i = -1;
  var res = [], arrays;

  if (argsLen === 1) {
    return arr;
  }

  if (argsLen > 2) {
    arrays = arrFlatten(slice.call(arguments, 1));
  }

  while (++i < len) {
    if (!~arrays.indexOf(arr[i])) {
      res.push(arr[i]);
    }
  }
  return res;
}

/**
 * Expose `diff`
 */

var arrDiff = diff;

/*!
 * array-unique <https://github.com/jonschlinkert/array-unique>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var arrayUnique = function unique(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }

  var len = arr.length;
  var i = -1;

  while (i++ < len) {
    var j = i + 1;

    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1);
      }
    }
  }
  return arr;
};

var toString$2 = {}.toString;

var isarray = Array.isArray || function (arr) {
  return toString$2.call(arr) == '[object Array]';
};

var isobject = function isObject(val) {
  return val != null && typeof val === 'object' && isarray(val) === false;
};

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var isBuffer_1 = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
};

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

var toString$3 = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

var kindOf = function kindOf(val) {
  // primitivies
  if (typeof val === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val === 'string' || val instanceof String) {
    return 'string';
  }
  if (typeof val === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (typeof val === 'function' || val instanceof Function) {
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  var type = toString$3.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }
  if (type === '[object Error]') {
    return 'error';
  }

  // buffer
  if (isBuffer_1(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }

  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

var isNumber$1 = function isNumber(num) {
  var type = kindOf(num);
  if (type !== 'number' && type !== 'string') {
    return false;
  }
  var n = +num;
  return (n - n + 1) >= 0 && num !== '';
};

/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isNumber$2 = function isNumber(num) {
  var type = typeof num;

  if (type === 'string' || num instanceof String) {
    // an empty string would be coerced to true with the below logic
    if (!num.trim()) return false;
  } else if (type !== 'number' && !(num instanceof Number)) {
    return false;
  }

  return (num - num + 1) >= 0;
};

var toString$4 = Object.prototype.toString;

var kindOf$1 = function kindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';

  var type = typeof val;
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'symbol') return 'symbol';
  if (type === 'function') {
    return isGeneratorFn(val) ? 'generatorfunction' : 'function';
  }

  if (isArray$2(val)) return 'array';
  if (isBuffer$1(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  if (isRegexp(val)) return 'regexp';

  switch (ctorName(val)) {
    case 'Symbol': return 'symbol';
    case 'Promise': return 'promise';

    // Set, Map, WeakSet, WeakMap
    case 'WeakMap': return 'weakmap';
    case 'WeakSet': return 'weakset';
    case 'Map': return 'map';
    case 'Set': return 'set';

    // 8-bit typed arrays
    case 'Int8Array': return 'int8array';
    case 'Uint8Array': return 'uint8array';
    case 'Uint8ClampedArray': return 'uint8clampedarray';

    // 16-bit typed arrays
    case 'Int16Array': return 'int16array';
    case 'Uint16Array': return 'uint16array';

    // 32-bit typed arrays
    case 'Int32Array': return 'int32array';
    case 'Uint32Array': return 'uint32array';
    case 'Float32Array': return 'float32array';
    case 'Float64Array': return 'float64array';
  }

  if (isGeneratorObj(val)) {
    return 'generator';
  }

  // Non-plain objects
  type = toString$4.call(val);
  switch (type) {
    case '[object Object]': return 'object';
    // iterators
    case '[object Map Iterator]': return 'mapiterator';
    case '[object Set Iterator]': return 'setiterator';
    case '[object String Iterator]': return 'stringiterator';
    case '[object Array Iterator]': return 'arrayiterator';
  }

  // other
  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
};

function ctorName(val) {
  return val.constructor ? val.constructor.name : null;
}

function isArray$2(val) {
  if (Array.isArray) return Array.isArray(val);
  return val instanceof Array;
}

function isError(val) {
  return val instanceof Error || (typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number');
}

function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === 'function'
    && typeof val.getDate === 'function'
    && typeof val.setDate === 'function';
}

function isRegexp(val) {
  if (val instanceof RegExp) return true;
  return typeof val.flags === 'string'
    && typeof val.ignoreCase === 'boolean'
    && typeof val.multiline === 'boolean'
    && typeof val.global === 'boolean';
}

function isGeneratorFn(name, val) {
  return ctorName(name) === 'GeneratorFunction';
}

function isGeneratorObj(val) {
  return typeof val.throw === 'function'
    && typeof val.return === 'function'
    && typeof val.next === 'function';
}

function isArguments(val) {
  try {
    if (typeof val.length === 'number' && typeof val.callee === 'function') {
      return true;
    }
  } catch (err) {
    if (err.message.indexOf('callee') !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * If you need to support Safari 5-7 (8-10 yr-old browser),
 * take a look at https://github.com/feross/is-buffer
 */

function isBuffer$1(val) {
  if (val.constructor && typeof val.constructor.isBuffer === 'function') {
    return val.constructor.isBuffer(val);
  }
  return false;
}

var max = Math.pow(2, 32);

var node = random;
var cryptographic = true;

function random () {
  var buf = crypto
    .randomBytes(4)
    .readUInt32BE(0);

  return buf / max
}
node.cryptographic = cryptographic;

/**
 * Expose `randomatic`
 */

var randomatic_1 = randomatic;
var isCrypto = !!node.cryptographic;

/**
 * Available mask characters
 */

var type = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  number: '0123456789',
  special: '~!@#$%^&()_+-={}[];\',.'
};

type.all = type.lower + type.upper + type.number + type.special;

/**
 * Generate random character sequences of a specified `length`,
 * based on the given `pattern`.
 *
 * @param {String} `pattern` The pattern to use for generating the random string.
 * @param {String} `length` The length of the string to generate.
 * @param {String} `options`
 * @return {String}
 * @api public
 */

function randomatic(pattern, length, options) {
  if (typeof pattern === 'undefined') {
    throw new Error('randomatic expects a string or number.');
  }

  var custom = false;
  if (arguments.length === 1) {
    if (typeof pattern === 'string') {
      length = pattern.length;

    } else if (isNumber$2(pattern)) {
      options = {};
      length = pattern;
      pattern = '*';
    }
  }

  if (kindOf$1(length) === 'object' && length.hasOwnProperty('chars')) {
    options = length;
    pattern = options.chars;
    length = pattern.length;
    custom = true;
  }

  var opts = options || {};
  var mask = '';
  var res = '';

  // Characters to be used
  if (pattern.indexOf('?') !== -1) mask += opts.chars;
  if (pattern.indexOf('a') !== -1) mask += type.lower;
  if (pattern.indexOf('A') !== -1) mask += type.upper;
  if (pattern.indexOf('0') !== -1) mask += type.number;
  if (pattern.indexOf('!') !== -1) mask += type.special;
  if (pattern.indexOf('*') !== -1) mask += type.all;
  if (custom) mask += pattern;

  // Characters to exclude
  if (opts.exclude) {
    var exclude = kindOf$1(opts.exclude) === 'string' ? opts.exclude : opts.exclude.join('');
    exclude = exclude.replace(new RegExp('[\\]]+', 'g'), '');
    mask = mask.replace(new RegExp('[' + exclude + ']+', 'g'), '');
    
    if(opts.exclude.indexOf(']') !== -1) mask = mask.replace(new RegExp('[\\]]+', 'g'), '');
  }

  while (length--) {
    res += mask.charAt(parseInt(node() * mask.length, 10));
  }
  return res;
}randomatic_1.isCrypto = isCrypto;

/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

/**
 * Results cache
 */

var res = '';
var cache;

/**
 * Expose `repeat`
 */

var repeatString = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // cover common, quick use cases
  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  } else if (res.length >= max) {
    return res.substr(0, max);
  }

  while (max > res.length && num > 1) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    str += str;
  }

  res += str;
  res = res.substr(0, max);
  return res;
}

/*!
 * repeat-element <https://github.com/jonschlinkert/repeat-element>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Licensed under the MIT license.
 */

var repeatElement = function repeat(ele, num) {
  var arr = new Array(num);

  for (var i = 0; i < num; i++) {
    arr[i] = ele;
  }

  return arr;
};

/**
 * Expose `fillRange`
 */

var fillRange_1 = fillRange;

/**
 * Return a range of numbers or letters.
 *
 * @param  {String} `a` Start of the range
 * @param  {String} `b` End of the range
 * @param  {String} `step` Increment or decrement to use.
 * @param  {Function} `fn` Custom function to modify each element in the range.
 * @return {Array}
 */

function fillRange(a, b, step, options, fn) {
  if (a == null || b == null) {
    throw new Error('fill-range expects the first and second args to be strings.');
  }

  if (typeof step === 'function') {
    fn = step; options = {}; step = null;
  }

  if (typeof options === 'function') {
    fn = options; options = {};
  }

  if (isobject(step)) {
    options = step; step = '';
  }

  var expand, regex = false, sep = '';
  var opts = options || {};

  if (typeof opts.silent === 'undefined') {
    opts.silent = true;
  }

  step = step || opts.step;

  // store a ref to unmodified arg
  var origA = a, origB = b;

  b = (b.toString() === '-0') ? 0 : b;

  if (opts.optimize || opts.makeRe) {
    step = step ? (step += '~') : step;
    expand = true;
    regex = true;
    sep = '~';
  }

  // handle special step characters
  if (typeof step === 'string') {
    var match = stepRe().exec(step);

    if (match) {
      var i = match.index;
      var m = match[0];

      // repeat string
      if (m === '+') {
        return repeatElement(a, b);

      // randomize a, `b` times
      } else if (m === '?') {
        return [randomatic_1(a, b)];

      // expand right, no regex reduction
      } else if (m === '>') {
        step = step.substr(0, i) + step.substr(i + 1);
        expand = true;

      // expand to an array, or if valid create a reduced
      // string for a regex logic `or`
      } else if (m === '|') {
        step = step.substr(0, i) + step.substr(i + 1);
        expand = true;
        regex = true;
        sep = m;

      // expand to an array, or if valid create a reduced
      // string for a regex range
      } else if (m === '~') {
        step = step.substr(0, i) + step.substr(i + 1);
        expand = true;
        regex = true;
        sep = m;
      }
    } else if (!isNumber$1(step)) {
      if (!opts.silent) {
        throw new TypeError('fill-range: invalid step.');
      }
      return null;
    }
  }

  if (/[.&*()[\]^%$#@!]/.test(a) || /[.&*()[\]^%$#@!]/.test(b)) {
    if (!opts.silent) {
      throw new RangeError('fill-range: invalid range arguments.');
    }
    return null;
  }

  // has neither a letter nor number, or has both letters and numbers
  // this needs to be after the step logic
  if (!noAlphaNum(a) || !noAlphaNum(b) || hasBoth(a) || hasBoth(b)) {
    if (!opts.silent) {
      throw new RangeError('fill-range: invalid range arguments.');
    }
    return null;
  }

  // validate arguments
  var isNumA = isNumber$1(zeros(a));
  var isNumB = isNumber$1(zeros(b));

  if ((!isNumA && isNumB) || (isNumA && !isNumB)) {
    if (!opts.silent) {
      throw new TypeError('fill-range: first range argument is incompatible with second.');
    }
    return null;
  }

  // by this point both are the same, so we
  // can use A to check going forward.
  var isNum = isNumA;
  var num = formatStep(step);

  // is the range alphabetical? or numeric?
  if (isNum) {
    // if numeric, coerce to an integer
    a = +a; b = +b;
  } else {
    // otherwise, get the charCode to expand alpha ranges
    a = a.charCodeAt(0);
    b = b.charCodeAt(0);
  }

  // is the pattern descending?
  var isDescending = a > b;

  // don't create a character class if the args are < 0
  if (a < 0 || b < 0) {
    expand = false;
    regex = false;
  }

  // detect padding
  var padding = isPadded$1(origA, origB);
  var res, pad, arr = [];
  var ii = 0;

  // character classes, ranges and logical `or`
  if (regex) {
    if (shouldExpand(a, b, num, isNum, padding, opts)) {
      // make sure the correct separator is used
      if (sep === '|' || sep === '~') {
        sep = detectSeparator(a, b, num, isNum, isDescending);
      }
      return wrap([origA, origB], sep, opts);
    }
  }

  while (isDescending ? (a >= b) : (a <= b)) {
    if (padding && isNum) {
      pad = padding(a);
    }

    // custom function
    if (typeof fn === 'function') {
      res = fn(a, isNum, pad, ii++);

    // letters
    } else if (!isNum) {
      if (regex && isInvalidChar(a)) {
        res = null;
      } else {
        res = String.fromCharCode(a);
      }

    // numbers
    } else {
      res = formatPadding(a, pad);
    }

    // add result to the array, filtering any nulled values
    if (res !== null) arr.push(res);

    // increment or decrement
    if (isDescending) {
      a -= num;
    } else {
      a += num;
    }
  }

  // now that the array is expanded, we need to handle regex
  // character classes, ranges or logical `or` that wasn't
  // already handled before the loop
  if ((regex || expand) && !opts.noexpand) {
    // make sure the correct separator is used
    if (sep === '|' || sep === '~') {
      sep = detectSeparator(a, b, num, isNum, isDescending);
    }
    if (arr.length === 1 || a < 0 || b < 0) { return arr; }
    return wrap(arr, sep, opts);
  }

  return arr;
}

/**
 * Wrap the string with the correct regex
 * syntax.
 */

function wrap(arr, sep, opts) {
  if (sep === '~') { sep = '-'; }
  var str = arr.join(sep);
  var pre = opts && opts.regexPrefix;

  // regex logical `or`
  if (sep === '|') {
    str = pre ? pre + str : str;
    str = '(' + str + ')';
  }

  // regex character class
  if (sep === '-') {
    str = (pre && pre === '^')
      ? pre + str
      : str;
    str = '[' + str + ']';
  }
  return [str];
}

/**
 * Check for invalid characters
 */

function isCharClass(a, b, step, isNum, isDescending) {
  if (isDescending) { return false; }
  if (isNum) { return a <= 9 && b <= 9; }
  if (a < b) { return step === 1; }
  return false;
}

/**
 * Detect the correct separator to use
 */

function shouldExpand(a, b, num, isNum, padding, opts) {
  if (isNum && (a > 9 || b > 9)) { return false; }
  return !padding && num === 1 && a < b;
}

/**
 * Detect the correct separator to use
 */

function detectSeparator(a, b, step, isNum, isDescending) {
  var isChar = isCharClass(a, b, step, isNum, isDescending);
  if (!isChar) {
    return '|';
  }
  return '~';
}

/**
 * Correctly format the step based on type
 */

function formatStep(step) {
  return Math.abs(step >> 0) || 1;
}

/**
 * Format padding, taking leading `-` into account
 */

function formatPadding(ch, pad) {
  var res = pad ? pad + ch : ch;
  if (pad && ch.toString().charAt(0) === '-') {
    res = '-' + pad + ch.toString().substr(1);
  }
  return res.toString();
}

/**
 * Check for invalid characters
 */

function isInvalidChar(str) {
  var ch = toStr(str);
  return ch === '\\'
    || ch === '['
    || ch === ']'
    || ch === '^'
    || ch === '('
    || ch === ')'
    || ch === '`';
}

/**
 * Convert to a string from a charCode
 */

function toStr(ch) {
  return String.fromCharCode(ch);
}


/**
 * Step regex
 */

function stepRe() {
  return /\?|>|\||\+|\~/g;
}

/**
 * Return true if `val` has either a letter
 * or a number
 */

function noAlphaNum(val) {
  return /[a-z0-9]/i.test(val);
}

/**
 * Return true if `val` has both a letter and
 * a number (invalid)
 */

function hasBoth(val) {
  return /[a-z][0-9]|[0-9][a-z]/i.test(val);
}

/**
 * Normalize zeros for checks
 */

function zeros(val) {
  if (/^-*0+$/.test(val.toString())) {
    return '0';
  }
  return val;
}

/**
 * Return true if `val` has leading zeros,
 * or a similar valid pattern.
 */

function hasZeros(val) {
  return /[^.]\.|^-*0+[0-9]/.test(val);
}

/**
 * If the string is padded, returns a curried function with
 * the a cached padding string, or `false` if no padding.
 *
 * @param  {*} `origA` String or number.
 * @return {String|Boolean}
 */

function isPadded$1(origA, origB) {
  if (hasZeros(origA) || hasZeros(origB)) {
    var alen = length(origA);
    var blen = length(origB);

    var len = alen >= blen
      ? alen
      : blen;

    return function (a) {
      return repeatString('0', len - length(a));
    };
  }
  return false;
}

/**
 * Get the string length of `val`
 */

function length(val) {
  return val.toString().length;
}

var expandRange = function expandRange(str, options, fn) {
  if (typeof str !== 'string') {
    throw new TypeError('expand-range expects a string.');
  }

  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  if (typeof options === 'boolean') {
    options = {};
    options.makeRe = true;
  }

  // create arguments to pass to fill-range
  var opts = options || {};
  var args = str.split('..');
  var len = args.length;
  if (len > 3) { return str; }

  // if only one argument, it can't expand so return it
  if (len === 1) { return args; }

  // if `true`, tell fill-range to regexify the string
  if (typeof fn === 'boolean' && fn === true) {
    opts.makeRe = true;
  }

  args.push(opts);
  return fillRange_1.apply(null, args.concat(fn));
};

/*!
 * preserve <https://github.com/jonschlinkert/preserve>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT license.
 */

/**
 * Replace tokens in `str` with a temporary, heuristic placeholder.
 *
 * ```js
 * tokens.before('{a\\,b}');
 * //=> '{__ID1__}'
 * ```
 *
 * @param  {String} `str`
 * @return {String} String with placeholders.
 * @api public
 */

var before = function before(str, re) {
  return str.replace(re, function (match) {
    var id = randomize();
    cache$1[id] = match;
    return '__ID' + id + '__';
  });
};

/**
 * Replace placeholders in `str` with original tokens.
 *
 * ```js
 * tokens.after('{__ID1__}');
 * //=> '{a\\,b}'
 * ```
 *
 * @param  {String} `str` String with placeholders
 * @return {String} `str` String with original tokens.
 * @api public
 */

var after = function after(str) {
  return str.replace(/__ID(.{5})__/g, function (_, id) {
    return cache$1[id];
  });
};

function randomize() {
  return Math.random().toString().slice(2, 7);
}

var cache$1 = {};

var preserve = {
	before: before,
	after: after
};

/**
 * Module dependencies
 */





/**
 * Expose `braces`
 */

var braces_1 = function(str, options) {
  if (typeof str !== 'string') {
    throw new Error('braces expects a string');
  }
  return braces(str, options);
};

/**
 * Expand `{foo,bar}` or `{1..5}` braces in the
 * given `string`.
 *
 * @param  {String} `str`
 * @param  {Array} `arr`
 * @param  {Object} `options`
 * @return {Array}
 */

function braces(str, arr, options) {
  if (str === '') {
    return [];
  }

  if (!Array.isArray(arr)) {
    options = arr;
    arr = [];
  }

  var opts = options || {};
  arr = arr || [];

  if (typeof opts.nodupes === 'undefined') {
    opts.nodupes = true;
  }

  var fn = opts.fn;
  var es6;

  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  if (!(patternRe instanceof RegExp)) {
    patternRe = patternRegex();
  }

  var matches = str.match(patternRe) || [];
  var m = matches[0];

  switch(m) {
    case '\\,':
      return escapeCommas(str, arr, opts);
    case '\\.':
      return escapeDots(str, arr, opts);
    case '\/.':
      return escapePaths(str, arr, opts);
    case ' ':
      return splitWhitespace(str);
    case '{,}':
      return exponential(str, opts, braces);
    case '{}':
      return emptyBraces(str, arr, opts);
    case '\\{':
    case '\\}':
      return escapeBraces$1(str, arr, opts);
    case '${':
      if (!/\{[^{]+\{/.test(str)) {
        return arr.concat(str);
      } else {
        es6 = true;
        str = preserve.before(str, es6Regex());
      }
  }

  if (!(braceRe instanceof RegExp)) {
    braceRe = braceRegex();
  }

  var match = braceRe.exec(str);
  if (match == null) {
    return [str];
  }

  var outter = match[1];
  var inner = match[2];
  if (inner === '') { return [str]; }

  var segs, segsLength;

  if (inner.indexOf('..') !== -1) {
    segs = expandRange(inner, opts, fn) || inner.split(',');
    segsLength = segs.length;

  } else if (inner[0] === '"' || inner[0] === '\'') {
    return arr.concat(str.split(/['"]/).join(''));

  } else {
    segs = inner.split(',');
    if (opts.makeRe) {
      return braces(str.replace(outter, wrap$1(segs, '|')), opts);
    }

    segsLength = segs.length;
    if (segsLength === 1 && opts.bash) {
      segs[0] = wrap$1(segs[0], '\\');
    }
  }

  var len = segs.length;
  var i = 0, val;

  while (len--) {
    var path$$1 = segs[i++];

    if (/(\.[^.\/])/.test(path$$1)) {
      if (segsLength > 1) {
        return segs;
      } else {
        return [str];
      }
    }

    val = splice(str, outter, path$$1);

    if (/\{[^{}]+?\}/.test(val)) {
      arr = braces(val, arr, opts);
    } else if (val !== '') {
      if (opts.nodupes && arr.indexOf(val) !== -1) { continue; }
      arr.push(es6 ? preserve.after(val) : val);
    }
  }

  if (opts.strict) { return filter$1(arr, filterEmpty); }
  return arr;
}

/**
 * Expand exponential ranges
 *
 *   `a{,}{,}` => ['a', 'a', 'a', 'a']
 */

function exponential(str, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = null;
  }

  var opts = options || {};
  var esc = '__ESC_EXP__';
  var exp = 0;
  var res;

  var parts = str.split('{,}');
  if (opts.nodupes) {
    return fn(parts.join(''), opts);
  }

  exp = parts.length - 1;
  res = fn(parts.join(esc), opts);
  var len = res.length;
  var arr = [];
  var i = 0;

  while (len--) {
    var ele = res[i++];
    var idx = ele.indexOf(esc);

    if (idx === -1) {
      arr.push(ele);

    } else {
      ele = ele.split('__ESC_EXP__').join('');
      if (!!ele && opts.nodupes !== false) {
        arr.push(ele);

      } else {
        var num = Math.pow(2, exp);
        arr.push.apply(arr, repeatElement(ele, num));
      }
    }
  }
  return arr;
}

/**
 * Wrap a value with parens, brackets or braces,
 * based on the given character/separator.
 *
 * @param  {String|Array} `val`
 * @param  {String} `ch`
 * @return {String}
 */

function wrap$1(val, ch) {
  if (ch === '|') {
    return '(' + val.join(ch) + ')';
  }
  if (ch === ',') {
    return '{' + val.join(ch) + '}';
  }
  if (ch === '-') {
    return '[' + val.join(ch) + ']';
  }
  if (ch === '\\') {
    return '\\{' + val + '\\}';
  }
}

/**
 * Handle empty braces: `{}`
 */

function emptyBraces(str, arr, opts) {
  return braces(str.split('{}').join('\\{\\}'), arr, opts);
}

/**
 * Filter out empty-ish values
 */

function filterEmpty(ele) {
  return !!ele && ele !== '\\';
}

/**
 * Handle patterns with whitespace
 */

function splitWhitespace(str) {
  var segs = str.split(' ');
  var len = segs.length;
  var res = [];
  var i = 0;

  while (len--) {
    res.push.apply(res, braces(segs[i++]));
  }
  return res;
}

/**
 * Handle escaped braces: `\\{foo,bar}`
 */

function escapeBraces$1(str, arr, opts) {
  if (!/\{[^{]+\{/.test(str)) {
    return arr.concat(str.split('\\').join(''));
  } else {
    str = str.split('\\{').join('__LT_BRACE__');
    str = str.split('\\}').join('__RT_BRACE__');
    return map(braces(str, arr, opts), function(ele) {
      ele = ele.split('__LT_BRACE__').join('{');
      return ele.split('__RT_BRACE__').join('}');
    });
  }
}

/**
 * Handle escaped dots: `{1\\.2}`
 */

function escapeDots(str, arr, opts) {
  if (!/[^\\]\..+\\\./.test(str)) {
    return arr.concat(str.split('\\').join(''));
  } else {
    str = str.split('\\.').join('__ESC_DOT__');
    return map(braces(str, arr, opts), function(ele) {
      return ele.split('__ESC_DOT__').join('.');
    });
  }
}

/**
 * Handle escaped dots: `{1\\.2}`
 */

function escapePaths(str, arr, opts) {
  str = str.split('\/.').join('__ESC_PATH__');
  return map(braces(str, arr, opts), function(ele) {
    return ele.split('__ESC_PATH__').join('\/.');
  });
}

/**
 * Handle escaped commas: `{a\\,b}`
 */

function escapeCommas(str, arr, opts) {
  if (!/\w,/.test(str)) {
    return arr.concat(str.split('\\').join(''));
  } else {
    str = str.split('\\,').join('__ESC_COMMA__');
    return map(braces(str, arr, opts), function(ele) {
      return ele.split('__ESC_COMMA__').join(',');
    });
  }
}

/**
 * Regex for common patterns
 */

function patternRegex() {
  return /\${|( (?=[{,}])|(?=[{,}]) )|{}|{,}|\\,(?=.*[{}])|\/\.(?=.*[{}])|\\\.(?={)|\\{|\\}/;
}

/**
 * Braces regex.
 */

function braceRegex() {
  return /.*(\\?\{([^}]+)\})/;
}

/**
 * es6 delimiter regex.
 */

function es6Regex() {
  return /\$\{([^}]+)\}/;
}

var braceRe;
var patternRe;

/**
 * Faster alternative to `String.replace()` when the
 * index of the token to be replaces can't be supplied
 */

function splice(str, token, replacement) {
  var i = str.indexOf(token);
  return str.substr(0, i) + replacement
    + str.substr(i + token.length);
}

/**
 * Fast array map
 */

function map(arr, fn) {
  if (arr == null) {
    return [];
  }

  var len = arr.length;
  var res = new Array(len);
  var i = -1;

  while (++i < len) {
    res[i] = fn(arr[i], i, arr);
  }

  return res;
}

/**
 * Fast array filter
 */

function filter$1(arr, cb) {
  if (arr == null) return [];
  if (typeof cb !== 'function') {
    throw new TypeError('braces: filter expects a callback function.');
  }

  var len = arr.length;
  var res = arr.slice();
  var i = 0;

  while (len--) {
    if (!cb(arr[len], i++)) {
      res.splice(len, 1);
    }
  }
  return res;
}

/*!
 * is-posix-bracket <https://github.com/jonschlinkert/is-posix-bracket>
 *
 * Copyright (c) 2015-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isPosixBracket = function isPosixBracket(str) {
  return typeof str === 'string' && /\[([:.=+])(?:[^\[\]]|)+\1\]/.test(str);
};

/**
 * POSIX character classes
 */

var POSIX = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E',
  punct: '-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word:  'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9',
};

/**
 * Expose `brackets`
 */

var expandBrackets = brackets;

function brackets(str) {
  if (!isPosixBracket(str)) {
    return str;
  }

  var negated = false;
  if (str.indexOf('[^') !== -1) {
    negated = true;
    str = str.split('[^').join('[');
  }
  if (str.indexOf('[!') !== -1) {
    negated = true;
    str = str.split('[!').join('[');
  }

  var a = str.split('[');
  var b = str.split(']');
  var imbalanced = a.length !== b.length;

  var parts = str.split(/(?::\]\[:|\[?\[:|:\]\]?)/);
  var len = parts.length, i = 0;
  var end = '', beg = '';
  var res = [];

  // start at the end (innermost) first
  while (len--) {
    var inner = parts[i++];
    if (inner === '^[!' || inner === '[!') {
      inner = '';
      negated = true;
    }

    var prefix = negated ? '^' : '';
    var ch = POSIX[inner];

    if (ch) {
      res.push('[' + prefix + ch + ']');
    } else if (inner) {
      if (/^\[?\w-\w\]?$/.test(inner)) {
        if (i === parts.length) {
          res.push('[' + prefix + inner);
        } else if (i === 1) {
          res.push(prefix + inner + ']');
        } else {
          res.push(prefix + inner);
        }
      } else {
        if (i === 1) {
          beg += inner;
        } else if (i === parts.length) {
          end += inner;
        } else {
          res.push('[' + prefix + inner + ']');
        }
      }
    }
  }

  var result = res.join('|');
  var rlen = res.length || 1;
  if (rlen > 1) {
    result = '(?:' + result + ')';
    rlen = 1;
  }
  if (beg) {
    rlen++;
    if (beg.charAt(0) === '[') {
      if (imbalanced) {
        beg = '\\[' + beg.slice(1);
      } else {
        beg += ']';
      }
    }
    result = beg + result;
  }
  if (end) {
    rlen++;
    if (end.slice(-1) === ']') {
      if (imbalanced) {
        end = end.slice(0, end.length - 1) + '\\]';
      } else {
        end = '[' + end;
      }
    }
    result += end;
  }

  if (rlen > 1) {
    result = result.split('][').join(']|[');
    if (result.indexOf('|') !== -1 && !/\(\?/.test(result)) {
      result = '(?:' + result + ')';
    }
  }

  result = result.replace(/\[+=|=\]+/g, '\\b');
  return result;
}

brackets.makeRe = function(pattern) {
  try {
    return new RegExp(brackets(pattern));
  } catch (err) {}
};

brackets.isMatch = function(str, pattern) {
  try {
    return brackets.makeRe(pattern).test(str);
  } catch (err) {
    return false;
  }
};

brackets.match = function(arr, pattern) {
  var len = arr.length, i = 0;
  var res = arr.slice();

  var re = brackets.makeRe(pattern);
  while (i < len) {
    var ele = arr[i++];
    if (!re.test(ele)) {
      continue;
    }
    res.splice(i, 1);
  }
  return res;
};

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob$1 = function isExtglob(str) {
  return typeof str === 'string'
    && /[@?!+*]\(/.test(str);
};

/**
 * Module dependencies
 */


var re, cache$2 = {};

/**
 * Expose `extglob`
 */

var extglob_1 = extglob;

/**
 * Convert the given extglob `string` to a regex-compatible
 * string.
 *
 * ```js
 * var extglob = require('extglob');
 * extglob('!(a?(b))');
 * //=> '(?!a(?:b)?)[^/]*?'
 * ```
 *
 * @param {String} `str` The string to convert.
 * @param {Object} `options`
 *   @option {Boolean} [options] `esc` If `false` special characters will not be escaped. Defaults to `true`.
 *   @option {Boolean} [options] `regex` If `true` a regular expression is returned instead of a string.
 * @return {String}
 * @api public
 */


function extglob(str, opts) {
  opts = opts || {};
  var o = {}, i = 0;

  // fix common character reversals
  // '*!(.js)' => '*.!(js)'
  str = str.replace(/!\(([^\w*()])/g, '$1!(');

  // support file extension negation
  str = str.replace(/([*\/])\.!\([*]\)/g, function (m, ch) {
    if (ch === '/') {
      return escape$1('\\/[^.]+');
    }
    return escape$1('[^.]+');
  });

  // create a unique key for caching by
  // combining the string and options
  var key = str
    + String(!!opts.regex)
    + String(!!opts.contains)
    + String(!!opts.escape);

  if (cache$2.hasOwnProperty(key)) {
    return cache$2[key];
  }

  if (!(re instanceof RegExp)) {
    re = regex();
  }

  opts.negate = false;
  var m;

  while (m = re.exec(str)) {
    var prefix = m[1];
    var inner = m[3];
    if (prefix === '!') {
      opts.negate = true;
    }

    var id = '__EXTGLOB_' + (i++) + '__';
    // use the prefix of the _last_ (outtermost) pattern
    o[id] = wrap$2(inner, prefix, opts.escape);
    str = str.split(m[0]).join(id);
  }

  var keys = Object.keys(o);
  var len = keys.length;

  // we have to loop again to allow us to convert
  // patterns in reverse order (starting with the
  // innermost/last pattern first)
  while (len--) {
    var prop = keys[len];
    str = str.split(prop).join(o[prop]);
  }

  var result = opts.regex
    ? toRegex(str, opts.contains, opts.negate)
    : str;

  result = result.split('.').join('\\.');

  // cache the result and return it
  return (cache$2[key] = result);
}

/**
 * Convert `string` to a regex string.
 *
 * @param  {String} `str`
 * @param  {String} `prefix` Character that determines how to wrap the string.
 * @param  {Boolean} `esc` If `false` special characters will not be escaped. Defaults to `true`.
 * @return {String}
 */

function wrap$2(inner, prefix, esc) {
  if (esc) inner = escape$1(inner);

  switch (prefix) {
    case '!':
      return '(?!' + inner + ')[^/]' + (esc ? '%%%~' : '*?');
    case '@':
      return '(?:' + inner + ')';
    case '+':
      return '(?:' + inner + ')+';
    case '*':
      return '(?:' + inner + ')' + (esc ? '%%' : '*')
    case '?':
      return '(?:' + inner + '|)';
    default:
      return inner;
  }
}

function escape$1(str) {
  str = str.split('*').join('[^/]%%%~');
  str = str.split('.').join('\\.');
  return str;
}

/**
 * extglob regex.
 */

function regex() {
  return /(\\?[@?!+*$]\\?)(\(([^()]*?)\))/;
}

/**
 * Negation regex
 */

function negate(str) {
  return '(?!^' + str + ').*$';
}

/**
 * Create the regex to do the matching. If
 * the leading character in the `pattern` is `!`
 * a negation regex is returned.
 *
 * @param {String} `pattern`
 * @param {Boolean} `contains` Allow loose matching.
 * @param {Boolean} `isNegated` True if the pattern is a negation pattern.
 */

function toRegex(pattern, contains, isNegated) {
  var prefix = contains ? '^' : '';
  var after = contains ? '$' : '';
  pattern = ('(?:' + pattern + ')' + after);
  if (isNegated) {
    pattern = prefix + negate(pattern);
  }
  return new RegExp(prefix + pattern);
}

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */



var isGlob$1 = function isGlob(str) {
  return typeof str === 'string'
    && (/[*!?{}(|)[\]]/.test(str)
     || isExtglob$1(str));
};

var toString$5 = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

var kindOf$2 = function kindOf(val) {
  // primitivies
  if (typeof val === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val === 'string' || val instanceof String) {
    return 'string';
  }
  if (typeof val === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (typeof val === 'function' || val instanceof Function) {
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  var type = toString$5.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }
  if (type === '[object Error]') {
    return 'error';
  }

  // buffer
  if (isBuffer_1(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }

  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

var isWin = process.platform === 'win32';

var removeTrailingSeparator = function (str) {
	var i = str.length - 1;
	if (i < 2) {
		return str;
	}
	while (isSeparator(str, i)) {
		i--;
	}
	return str.substr(0, i + 1);
};

function isSeparator(str, i) {
	var char = str[i];
	return i > 0 && (char === '/' || (isWin && char === '\\'));
}

/*!
 * normalize-path <https://github.com/jonschlinkert/normalize-path>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var normalizePath$1 = function normalizePath(str, stripTrailing) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }
  str = str.replace(/[\\\/]+/g, '/');
  if (stripTrailing !== false) {
    str = removeTrailingSeparator(str);
  }
  return str;
};

/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtendable = function isExtendable(val) {
  return typeof val !== 'undefined' && val !== null
    && (typeof val === 'object' || typeof val === 'function');
};

/*!
 * for-in <https://github.com/jonschlinkert/for-in>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var forIn = function forIn(obj, fn, thisArg) {
  for (var key in obj) {
    if (fn.call(thisArg, obj[key], key, obj) === false) {
      break;
    }
  }
};

var hasOwn = Object.prototype.hasOwnProperty;

var forOwn = function forOwn(obj, fn, thisArg) {
  forIn(obj, function(val, key) {
    if (hasOwn.call(obj, key)) {
      return fn.call(thisArg, obj[key], key, obj);
    }
  });
};

var object_omit = function omit(obj, keys) {
  if (!isExtendable(obj)) return {};

  keys = [].concat.apply([], [].slice.call(arguments, 1));
  var last = keys[keys.length - 1];
  var res = {}, fn;

  if (typeof last === 'function') {
    fn = keys.pop();
  }

  var isFunction = typeof fn === 'function';
  if (!keys.length && !isFunction) {
    return obj;
  }

  forOwn(obj, function(value, key) {
    if (keys.indexOf(key) === -1) {

      if (!isFunction) {
        res[key] = value;
      } else if (fn(value, key, obj)) {
        res[key] = value;
      }
    }
  });
  return res;
};

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob$2 = function isExtglob(str) {
  return typeof str === 'string'
    && /[@?!+*]\(/.test(str);
};

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */



var isGlob$2 = function isGlob(str) {
  return typeof str === 'string'
    && (/[*!?{}(|)[\]]/.test(str)
     || isExtglob$2(str));
};

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob$3 = function isExtglob(str) {
  return typeof str === 'string'
    && /[@?!+*]\(/.test(str);
};

/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */



var isGlob$3 = function isGlob(str) {
  return typeof str === 'string'
    && (/[*!?{}(|)[\]]/.test(str)
     || isExtglob$3(str));
};

var globParent = function globParent(str) {
	str += 'a'; // preserves full path in case of trailing path separator
	do {str = path__default.dirname(str);} while (isGlob$3(str));
	return str;
};

var globBase = function globBase(pattern) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob-base expects a string.');
  }

  var res = {};
  res.base = globParent(pattern);
  res.isGlob = isGlob$3(pattern);

  if (res.base !== '.') {
    res.glob = pattern.substr(res.base.length);
    if (res.glob.charAt(0) === '/') {
      res.glob = res.glob.substr(1);
    }
  } else {
    res.glob = pattern;
  }

  if (!res.isGlob) {
    res.base = dirname(pattern);
    res.glob = res.base !== '.'
      ? pattern.substr(res.base.length)
      : pattern;
  }

  if (res.glob.substr(0, 2) === './') {
    res.glob = res.glob.substr(2);
  }
  if (res.glob.charAt(0) === '/') {
    res.glob = res.glob.substr(1);
  }
  return res;
};

function dirname(glob) {
  if (glob.slice(-1) === '/') return glob;
  return path__default.dirname(glob);
}

/*!
 * is-dotfile <https://github.com/jonschlinkert/is-dotfile>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isDotfile = function(str) {
  if (str.charCodeAt(0) === 46 /* . */ && str.indexOf('/', 1) === -1) {
    return true;
  }
  var slash = str.lastIndexOf('/');
  return slash !== -1 ? str.charCodeAt(slash + 1) === 46  /* . */ : false;
};

var parseGlob = createCommonjsModule(function (module) {






/**
 * Expose `cache`
 */

var cache = module.exports.cache = {};

/**
 * Parse a glob pattern into tokens.
 *
 * When no paths or '**' are in the glob, we use a
 * different strategy for parsing the filename, since
 * file names can contain braces and other difficult
 * patterns. such as:
 *
 *  - `*.{a,b}`
 *  - `(**|*.js)`
 */

module.exports = function parseGlob(glob) {
  if (cache.hasOwnProperty(glob)) {
    return cache[glob];
  }

  var tok = {};
  tok.orig = glob;
  tok.is = {};

  // unescape dots and slashes in braces/brackets
  glob = escape(glob);

  var parsed = globBase(glob);
  tok.is.glob = parsed.isGlob;

  tok.glob = parsed.glob;
  tok.base = parsed.base;
  var segs = /([^\/]*)$/.exec(glob);

  tok.path = {};
  tok.path.dirname = '';
  tok.path.basename = segs[1] || '';
  tok.path.dirname = glob.split(tok.path.basename).join('') || '';
  var basename = (tok.path.basename || '').split('.') || '';
  tok.path.filename = basename[0] || '';
  tok.path.extname = basename.slice(1).join('.') || '';
  tok.path.ext = '';

  if (isGlob$2(tok.path.dirname) && !tok.path.basename) {
    if (!/\/$/.test(tok.glob)) {
      tok.path.basename = tok.glob;
    }
    tok.path.dirname = tok.base;
  }

  if (glob.indexOf('/') === -1 && !tok.is.globstar) {
    tok.path.dirname = '';
    tok.path.basename = tok.orig;
  }

  var dot = tok.path.basename.indexOf('.');
  if (dot !== -1) {
    tok.path.filename = tok.path.basename.slice(0, dot);
    tok.path.extname = tok.path.basename.slice(dot);
  }

  if (tok.path.extname.charAt(0) === '.') {
    var exts = tok.path.extname.split('.');
    tok.path.ext = exts[exts.length - 1];
  }

  // unescape dots and slashes in braces/brackets
  tok.glob = unescape(tok.glob);
  tok.path.dirname = unescape(tok.path.dirname);
  tok.path.basename = unescape(tok.path.basename);
  tok.path.filename = unescape(tok.path.filename);
  tok.path.extname = unescape(tok.path.extname);

  // Booleans
  var is = (glob && tok.is.glob);
  tok.is.negated  = glob && glob.charAt(0) === '!';
  tok.is.extglob  = glob && isExtglob$2(glob);
  tok.is.braces   = has(is, glob, '{');
  tok.is.brackets = has(is, glob, '[:');
  tok.is.globstar = has(is, glob, '**');
  tok.is.dotfile  = isDotfile(tok.path.basename) || isDotfile(tok.path.filename);
  tok.is.dotdir   = dotdir(tok.path.dirname);
  return (cache[glob] = tok);
};

/**
 * Returns true if the glob matches dot-directories.
 *
 * @param  {Object} `tok` The tokens object
 * @param  {Object} `path` The path object
 * @return {Object}
 */

function dotdir(base) {
  if (base.indexOf('/.') !== -1) {
    return true;
  }
  if (base.charAt(0) === '.' && base.charAt(1) !== '/') {
    return true;
  }
  return false;
}

/**
 * Returns true if the pattern has the given `ch`aracter(s)
 *
 * @param  {Object} `glob` The glob pattern.
 * @param  {Object} `ch` The character to test for
 * @return {Object}
 */

function has(is, glob, ch) {
  return is && glob.indexOf(ch) !== -1;
}

/**
 * Escape/unescape utils
 */

function escape(str) {
  var re = /\{([^{}]*?)}|\(([^()]*?)\)|\[([^\[\]]*?)\]/g;
  return str.replace(re, function (outter, braces, parens, brackets) {
    var inner = braces || parens || brackets;
    if (!inner) { return outter; }
    return outter.split(inner).join(esc(inner));
  });
}

function esc(str) {
  str = str.split('/').join('__SLASH__');
  str = str.split('.').join('__DOT__');
  return str;
}

function unescape(str) {
  str = str.split('__SLASH__').join('/');
  str = str.split('__DOT__').join('.');
  return str;
}
});
var parseGlob_1 = parseGlob.cache;

/*!
 * is-primitive <https://github.com/jonschlinkert/is-primitive>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

// see http://jsperf.com/testing-value-is-primitive/7
var isPrimitive = function isPrimitive(value) {
  return value == null || (typeof value !== 'function' && typeof value !== 'object');
};

var isEqualShallow = function isEqual(a, b) {
  if (!a && !b) { return true; }
  if (!a && b || a && !b) { return false; }

  var numKeysA = 0, numKeysB = 0, key;
  for (key in b) {
    numKeysB++;
    if (!isPrimitive(b[key]) || !a.hasOwnProperty(key) || (a[key] !== b[key])) {
      return false;
    }
  }
  for (key in a) {
    numKeysA++;
  }
  return numKeysA === numKeysB;
};

var basic = {};
var cache$3 = {};

/**
 * Expose `regexCache`
 */

var regexCache_1 = regexCache;

/**
 * Memoize the results of a call to the new RegExp constructor.
 *
 * @param  {Function} fn [description]
 * @param  {String} str [description]
 * @param  {Options} options [description]
 * @param  {Boolean} nocompare [description]
 * @return {RegExp}
 */

function regexCache(fn, str, opts) {
  var key = '_default_', regex, cached;

  if (!str && !opts) {
    if (typeof fn !== 'function') {
      return fn;
    }
    return basic[key] || (basic[key] = fn(str));
  }

  var isString = typeof str === 'string';
  if (isString) {
    if (!opts) {
      return basic[str] || (basic[str] = fn(str));
    }
    key = str;
  } else {
    opts = str;
  }

  cached = cache$3[key];
  if (cached && isEqualShallow(cached.opts, opts)) {
    return cached.regex;
  }

  memo(key, opts, (regex = fn(str, opts)));
  return regex;
}

function memo(key, opts, regex) {
  cache$3[key] = {regex: regex, opts: opts};
}

/**
 * Expose `cache`
 */

var cache_1 = cache$3;
var basic_1 = basic;
regexCache_1.cache = cache_1;
regexCache_1.basic = basic_1;

var utils_1 = createCommonjsModule(function (module) {

var win32 = process && process.platform === 'win32';


var utils = module.exports;

/**
 * Module dependencies
 */

utils.diff = arrDiff;
utils.unique = arrayUnique;
utils.braces = braces_1;
utils.brackets = expandBrackets;
utils.extglob = extglob_1;
utils.isExtglob = isExtglob$1;
utils.isGlob = isGlob$1;
utils.typeOf = kindOf$2;
utils.normalize = normalizePath$1;
utils.omit = object_omit;
utils.parseGlob = parseGlob;
utils.cache = regexCache_1;

/**
 * Get the filename of a filepath
 *
 * @param {String} `string`
 * @return {String}
 */

utils.filename = function filename(fp) {
  var seg = fp.match(filenameRegex());
  return seg && seg[0];
};

/**
 * Returns a function that returns true if the given
 * pattern is the same as a given `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.isPath = function isPath(pattern, opts) {
  opts = opts || {};
  return function(fp) {
    var unixified = utils.unixify(fp, opts);
    if(opts.nocase){
      return pattern.toLowerCase() === unixified.toLowerCase();
    }
    return pattern === unixified;
  };
};

/**
 * Returns a function that returns true if the given
 * pattern contains a `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.hasPath = function hasPath(pattern, opts) {
  return function(fp) {
    return utils.unixify(pattern, opts).indexOf(fp) !== -1;
  };
};

/**
 * Returns a function that returns true if the given
 * pattern matches or contains a `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.matchPath = function matchPath(pattern, opts) {
  var fn = (opts && opts.contains)
    ? utils.hasPath(pattern, opts)
    : utils.isPath(pattern, opts);
  return fn;
};

/**
 * Returns a function that returns true if the given
 * regex matches the `filename` of a file path.
 *
 * @param {RegExp} `re`
 * @return {Boolean}
 */

utils.hasFilename = function hasFilename(re) {
  return function(fp) {
    var name = utils.filename(fp);
    return name && re.test(name);
  };
};

/**
 * Coerce `val` to an array
 *
 * @param  {*} val
 * @return {Array}
 */

utils.arrayify = function arrayify(val) {
  return !Array.isArray(val)
    ? [val]
    : val;
};

/**
 * Normalize all slashes in a file path or glob pattern to
 * forward slashes.
 */

utils.unixify = function unixify(fp, opts) {
  if (opts && opts.unixify === false) return fp;
  if (opts && opts.unixify === true || win32 || path__default.sep === '\\') {
    return utils.normalize(fp, false);
  }
  if (opts && opts.unescape === true) {
    return fp ? fp.toString().replace(/\\(\w)/g, '$1') : '';
  }
  return fp;
};

/**
 * Escape/unescape utils
 */

utils.escapePath = function escapePath(fp) {
  return fp.replace(/[\\.]/g, '\\$&');
};

utils.unescapeGlob = function unescapeGlob(fp) {
  return fp.replace(/[\\"']/g, '');
};

utils.escapeRe = function escapeRe(str) {
  return str.replace(/[-[\\$*+?.#^\s{}(|)\]]/g, '\\$&');
};

/**
 * Expose `utils`
 */

module.exports = utils;
});

var chars$2 = {}, unesc, temp;

function reverse(object, prepender) {
  return Object.keys(object).reduce(function(reversed, key) {
    var newKey = prepender ? prepender + key : key; // Optionally prepend a string to key.
    reversed[object[key]] = newKey; // Swap key and value.
    return reversed; // Return the result.
  }, {});
}

/**
 * Regex for common characters
 */

chars$2.escapeRegex = {
  '?': /\?/g,
  '@': /\@/g,
  '!': /\!/g,
  '+': /\+/g,
  '*': /\*/g,
  '(': /\(/g,
  ')': /\)/g,
  '[': /\[/g,
  ']': /\]/g
};

/**
 * Escape characters
 */

chars$2.ESC = {
  '?': '__UNESC_QMRK__',
  '@': '__UNESC_AMPE__',
  '!': '__UNESC_EXCL__',
  '+': '__UNESC_PLUS__',
  '*': '__UNESC_STAR__',
  ',': '__UNESC_COMMA__',
  '(': '__UNESC_LTPAREN__',
  ')': '__UNESC_RTPAREN__',
  '[': '__UNESC_LTBRACK__',
  ']': '__UNESC_RTBRACK__'
};

/**
 * Unescape characters
 */

chars$2.UNESC = unesc || (unesc = reverse(chars$2.ESC, '\\'));

chars$2.ESC_TEMP = {
  '?': '__TEMP_QMRK__',
  '@': '__TEMP_AMPE__',
  '!': '__TEMP_EXCL__',
  '*': '__TEMP_STAR__',
  '+': '__TEMP_PLUS__',
  ',': '__TEMP_COMMA__',
  '(': '__TEMP_LTPAREN__',
  ')': '__TEMP_RTPAREN__',
  '[': '__TEMP_LTBRACK__',
  ']': '__TEMP_RTBRACK__'
};

chars$2.TEMP = temp || (temp = reverse(chars$2.ESC_TEMP));

var chars_1 = chars$2;

var glob = createCommonjsModule(function (module) {




/**
 * Expose `Glob`
 */

var Glob = module.exports = function Glob(pattern, options) {
  if (!(this instanceof Glob)) {
    return new Glob(pattern, options);
  }
  this.options = options || {};
  this.pattern = pattern;
  this.history = [];
  this.tokens = {};
  this.init(pattern);
};

/**
 * Initialize defaults
 */

Glob.prototype.init = function(pattern) {
  this.orig = pattern;
  this.negated = this.isNegated();
  this.options.track = this.options.track || false;
  this.options.makeRe = true;
};

/**
 * Push a change into `glob.history`. Useful
 * for debugging.
 */

Glob.prototype.track = function(msg) {
  if (this.options.track) {
    this.history.push({msg: msg, pattern: this.pattern});
  }
};

/**
 * Return true if `glob.pattern` was negated
 * with `!`, also remove the `!` from the pattern.
 *
 * @return {Boolean}
 */

Glob.prototype.isNegated = function() {
  if (this.pattern.charCodeAt(0) === 33 /* '!' */) {
    this.pattern = this.pattern.slice(1);
    return true;
  }
  return false;
};

/**
 * Expand braces in the given glob pattern.
 *
 * We only need to use the [braces] lib when
 * patterns are nested.
 */

Glob.prototype.braces = function() {
  if (this.options.nobraces !== true && this.options.nobrace !== true) {
    // naive/fast check for imbalanced characters
    var a = this.pattern.match(/[\{\(\[]/g);
    var b = this.pattern.match(/[\}\)\]]/g);

    // if imbalanced, don't optimize the pattern
    if (a && b && (a.length !== b.length)) {
      this.options.makeRe = false;
    }

    // expand brace patterns and join the resulting array
    var expanded = utils_1.braces(this.pattern, this.options);
    this.pattern = expanded.join('|');
  }
};

/**
 * Expand bracket expressions in `glob.pattern`
 */

Glob.prototype.brackets = function() {
  if (this.options.nobrackets !== true) {
    this.pattern = utils_1.brackets(this.pattern);
  }
};

/**
 * Expand bracket expressions in `glob.pattern`
 */

Glob.prototype.extglob = function() {
  if (this.options.noextglob === true) return;

  if (utils_1.isExtglob(this.pattern)) {
    this.pattern = utils_1.extglob(this.pattern, {escape: true});
  }
};

/**
 * Parse the given pattern
 */

Glob.prototype.parse = function(pattern) {
  this.tokens = utils_1.parseGlob(pattern || this.pattern, true);
  return this.tokens;
};

/**
 * Replace `a` with `b`. Also tracks the change before and
 * after each replacement. This is disabled by default, but
 * can be enabled by setting `options.track` to true.
 *
 * Also, when the pattern is a string, `.split()` is used,
 * because it's much faster than replace.
 *
 * @param  {RegExp|String} `a`
 * @param  {String} `b`
 * @param  {Boolean} `escape` When `true`, escapes `*` and `?` in the replacement.
 * @return {String}
 */

Glob.prototype._replace = function(a, b, escape) {
  this.track('before (find): "' + a + '" (replace with): "' + b + '"');
  if (escape) b = esc(b);
  if (a && b && typeof a === 'string') {
    this.pattern = this.pattern.split(a).join(b);
  } else {
    this.pattern = this.pattern.replace(a, b);
  }
  this.track('after');
};

/**
 * Escape special characters in the given string.
 *
 * @param  {String} `str` Glob pattern
 * @return {String}
 */

Glob.prototype.escape = function(str) {
  this.track('before escape: ');
  var re = /["\\](['"]?[^"'\\]['"]?)/g;

  this.pattern = str.replace(re, function($0, $1) {
    var o = chars_1.ESC;
    var ch = o && o[$1];
    if (ch) {
      return ch;
    }
    if (/[a-z]/i.test($0)) {
      return $0.split('\\').join('');
    }
    return $0;
  });

  this.track('after escape: ');
};

/**
 * Unescape special characters in the given string.
 *
 * @param  {String} `str`
 * @return {String}
 */

Glob.prototype.unescape = function(str) {
  var re = /__([A-Z]+)_([A-Z]+)__/g;
  this.pattern = str.replace(re, function($0, $1) {
    return chars_1[$1][$0];
  });
  this.pattern = unesc(this.pattern);
};

/**
 * Escape/unescape utils
 */

function esc(str) {
  str = str.split('?').join('%~');
  str = str.split('*').join('%%');
  return str;
}

function unesc(str) {
  str = str.split('%~').join('?');
  str = str.split('%%').join('*');
  return str;
}
});

/**
 * Expose `expand`
 */

var expand_1 = expand$1;

/**
 * Expand a glob pattern to resolve braces and
 * similar patterns before converting to regex.
 *
 * @param  {String|Array} `pattern`
 * @param  {Array} `files`
 * @param  {Options} `opts`
 * @return {Array}
 */

function expand$1(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('micromatch.expand(): argument should be a string.');
  }

  var glob$$1 = new glob(pattern, options || {});
  var opts = glob$$1.options;

  if (!utils_1.isGlob(pattern)) {
    glob$$1.pattern = glob$$1.pattern.replace(/([\/.])/g, '\\$1');
    return glob$$1;
  }

  glob$$1.pattern = glob$$1.pattern.replace(/(\+)(?!\()/g, '\\$1');
  glob$$1.pattern = glob$$1.pattern.split('$').join('\\$');

  if (typeof opts.braces !== 'boolean' && typeof opts.nobraces !== 'boolean') {
    opts.braces = true;
  }

  if (glob$$1.pattern === '.*') {
    return {
      pattern: '\\.' + star$1,
      tokens: tok,
      options: opts
    };
  }

  if (glob$$1.pattern === '*') {
    return {
      pattern: oneStar(opts.dot),
      tokens: tok,
      options: opts
    };
  }

  // parse the glob pattern into tokens
  glob$$1.parse();
  var tok = glob$$1.tokens;
  tok.is.negated = opts.negated;

  // dotfile handling
  if ((opts.dotfiles === true || tok.is.dotfile) && opts.dot !== false) {
    opts.dotfiles = true;
    opts.dot = true;
  }

  if ((opts.dotdirs === true || tok.is.dotdir) && opts.dot !== false) {
    opts.dotdirs = true;
    opts.dot = true;
  }

  // check for braces with a dotfile pattern
  if (/[{,]\./.test(glob$$1.pattern)) {
    opts.makeRe = false;
    opts.dot = true;
  }

  if (opts.nonegate !== true) {
    opts.negated = glob$$1.negated;
  }

  // if the leading character is a dot or a slash, escape it
  if (glob$$1.pattern.charAt(0) === '.' && glob$$1.pattern.charAt(1) !== '/') {
    glob$$1.pattern = '\\' + glob$$1.pattern;
  }

  /**
   * Extended globs
   */

  // expand braces, e.g `{1..5}`
  glob$$1.track('before braces');
  if (tok.is.braces) {
    glob$$1.braces();
  }
  glob$$1.track('after braces');

  // expand extglobs, e.g `foo/!(a|b)`
  glob$$1.track('before extglob');
  if (tok.is.extglob) {
    glob$$1.extglob();
  }
  glob$$1.track('after extglob');

  // expand brackets, e.g `[[:alpha:]]`
  glob$$1.track('before brackets');
  if (tok.is.brackets) {
    glob$$1.brackets();
  }
  glob$$1.track('after brackets');

  // special patterns
  glob$$1._replace('[!', '[^');
  glob$$1._replace('(?', '(%~');
  glob$$1._replace(/\[\]/, '\\[\\]');
  glob$$1._replace('/[', '/' + (opts.dot ? dotfiles : nodot) + '[', true);
  glob$$1._replace('/?', '/' + (opts.dot ? dotfiles : nodot) + '[^/]', true);
  glob$$1._replace('/.', '/(?=.)\\.', true);

  // windows drives
  glob$$1._replace(/^(\w):([\\\/]+?)/gi, '(?=.)$1:$2', true);

  // negate slashes in exclusion ranges
  if (glob$$1.pattern.indexOf('[^') !== -1) {
    glob$$1.pattern = negateSlash(glob$$1.pattern);
  }

  if (opts.globstar !== false && glob$$1.pattern === '**') {
    glob$$1.pattern = globstar(opts.dot);

  } else {
    glob$$1.pattern = balance(glob$$1.pattern, '[', ']');
    glob$$1.escape(glob$$1.pattern);

    // if the pattern has `**`
    if (tok.is.globstar) {
      glob$$1.pattern = collapse(glob$$1.pattern, '/**');
      glob$$1.pattern = collapse(glob$$1.pattern, '**/');
      glob$$1._replace('/**/', '(?:/' + globstar(opts.dot) + '/|/)', true);
      glob$$1._replace(/\*{2,}/g, '**');

      // 'foo/*'
      glob$$1._replace(/(\w+)\*(?!\/)/g, '$1[^/]*?', true);
      glob$$1._replace(/\*\*\/\*(\w)/g, globstar(opts.dot) + '\\/' + (opts.dot ? dotfiles : nodot) + '[^/]*?$1', true);

      if (opts.dot !== true) {
        glob$$1._replace(/\*\*\/(.)/g, '(?:**\\/|)$1');
      }

      // 'foo/**' or '{**,*}', but not 'foo**'
      if (tok.path.dirname !== '' || /,\*\*|\*\*,/.test(glob$$1.orig)) {
        glob$$1._replace('**', globstar(opts.dot), true);
      }
    }

    // ends with /*
    glob$$1._replace(/\/\*$/, '\\/' + oneStar(opts.dot), true);
    // ends with *, no slashes
    glob$$1._replace(/(?!\/)\*$/, star$1, true);
    // has 'n*.' (partial wildcard w/ file extension)
    glob$$1._replace(/([^\/]+)\*/, '$1' + oneStar(true), true);
    // has '*'
    glob$$1._replace('*', oneStar(opts.dot), true);
    glob$$1._replace('?.', '?\\.', true);
    glob$$1._replace('?:', '?:', true);

    glob$$1._replace(/\?+/g, function(match) {
      var len = match.length;
      if (len === 1) {
        return qmark$1;
      }
      return qmark$1 + '{' + len + '}';
    });

    // escape '.abc' => '\\.abc'
    glob$$1._replace(/\.([*\w]+)/g, '\\.$1');
    // fix '[^\\\\/]'
    glob$$1._replace(/\[\^[\\\/]+\]/g, qmark$1);
    // '///' => '\/'
    glob$$1._replace(/\/+/g, '\\/');
    // '\\\\\\' => '\\'
    glob$$1._replace(/\\{2,}/g, '\\');
  }

  // unescape previously escaped patterns
  glob$$1.unescape(glob$$1.pattern);
  glob$$1._replace('__UNESC_STAR__', '*');

  // escape dots that follow qmarks
  glob$$1._replace('?.', '?\\.');

  // remove unnecessary slashes in character classes
  glob$$1._replace('[^\\/]', qmark$1);

  if (glob$$1.pattern.length > 1) {
    if (/^[\[?*]/.test(glob$$1.pattern)) {
      // only prepend the string if we don't want to match dotfiles
      glob$$1.pattern = (opts.dot ? dotfiles : nodot) + glob$$1.pattern;
    }
  }

  return glob$$1;
}

/**
 * Collapse repeated character sequences.
 *
 * ```js
 * collapse('a/../../../b', '../');
 * //=> 'a/../b'
 * ```
 *
 * @param  {String} `str`
 * @param  {String} `ch` Character sequence to collapse
 * @return {String}
 */

function collapse(str, ch) {
  var res = str.split(ch);
  var isFirst = res[0] === '';
  var isLast = res[res.length - 1] === '';
  res = res.filter(Boolean);
  if (isFirst) res.unshift('');
  if (isLast) res.push('');
  return res.join(ch);
}

/**
 * Negate slashes in exclusion ranges, per glob spec:
 *
 * ```js
 * negateSlash('[^foo]');
 * //=> '[^\\/foo]'
 * ```
 *
 * @param  {String} `str` glob pattern
 * @return {String}
 */

function negateSlash(str) {
  return str.replace(/\[\^([^\]]*?)\]/g, function(match, inner) {
    if (inner.indexOf('/') === -1) {
      inner = '\\/' + inner;
    }
    return '[^' + inner + ']';
  });
}

/**
 * Escape imbalanced braces/bracket. This is a very
 * basic, naive implementation that only does enough
 * to serve the purpose.
 */

function balance(str, a, b) {
  var aarr = str.split(a);
  var alen = aarr.join('').length;
  var blen = str.split(b).join('').length;

  if (alen !== blen) {
    str = aarr.join('\\' + a);
    return str.split(b).join('\\' + b);
  }
  return str;
}

/**
 * Special patterns to be converted to regex.
 * Heuristics are used to simplify patterns
 * and speed up processing.
 */

/* eslint no-multi-spaces: 0 */
var qmark$1       = '[^/]';
var star$1        = qmark$1 + '*?';
var nodot       = '(?!\\.)(?=.)';
var dotfileGlob = '(?:\\/|^)\\.{1,2}($|\\/)';
var dotfiles    = '(?!' + dotfileGlob + ')(?=.)';
var twoStarDot$1  = '(?:(?!' + dotfileGlob + ').)*?';

/**
 * Create a regex for `*`.
 *
 * If `dot` is true, or the pattern does not begin with
 * a leading star, then return the simpler regex.
 */

function oneStar(dotfile) {
  return dotfile ? '(?!' + dotfileGlob + ')(?=.)' + star$1 : (nodot + star$1);
}

function globstar(dotfile) {
  if (dotfile) { return twoStarDot$1; }
  return '(?:(?!(?:\\/|^)\\.).)*?';
}

/**
 * The main function. Pass an array of filepaths,
 * and a string or array of glob patterns
 *
 * @param  {Array|String} `files`
 * @param  {Array|String} `patterns`
 * @param  {Object} `opts`
 * @return {Array} Array of matches
 */

function micromatch(files, patterns, opts) {
  if (!files || !patterns) return [];
  opts = opts || {};

  if (typeof opts.cache === 'undefined') {
    opts.cache = true;
  }

  if (!Array.isArray(patterns)) {
    return match$1(files, patterns, opts);
  }

  var len = patterns.length, i = 0;
  var omit = [], keep = [];

  while (len--) {
    var glob = patterns[i++];
    if (typeof glob === 'string' && glob.charCodeAt(0) === 33 /* ! */) {
      omit.push.apply(omit, match$1(files, glob.slice(1), opts));
    } else {
      keep.push.apply(keep, match$1(files, glob, opts));
    }
  }
  return utils_1.diff(keep, omit);
}

/**
 * Return an array of files that match the given glob pattern.
 *
 * This function is called by the main `micromatch` function If you only
 * need to pass a single pattern you might get very minor speed improvements
 * using this function.
 *
 * @param  {Array} `files`
 * @param  {String} `pattern`
 * @param  {Object} `options`
 * @return {Array}
 */

function match$1(files, pattern, opts) {
  if (utils_1.typeOf(files) !== 'string' && !Array.isArray(files)) {
    throw new Error(msg('match', 'files', 'a string or array'));
  }

  files = utils_1.arrayify(files);
  opts = opts || {};

  var negate = opts.negate || false;
  var orig = pattern;

  if (typeof pattern === 'string') {
    negate = pattern.charAt(0) === '!';
    if (negate) {
      pattern = pattern.slice(1);
    }

    // we need to remove the character regardless,
    // so the above logic is still needed
    if (opts.nonegate === true) {
      negate = false;
    }
  }

  var _isMatch = matcher(pattern, opts);
  var len = files.length, i = 0;
  var res = [];

  while (i < len) {
    var file = files[i++];
    var fp = utils_1.unixify(file, opts);

    if (!_isMatch(fp)) { continue; }
    res.push(fp);
  }

  if (res.length === 0) {
    if (opts.failglob === true) {
      throw new Error('micromatch.match() found no matches for: "' + orig + '".');
    }

    if (opts.nonull || opts.nullglob) {
      res.push(utils_1.unescapeGlob(orig));
    }
  }

  // if `negate` was defined, diff negated files
  if (negate) { res = utils_1.diff(files, res); }

  // if `ignore` was defined, diff ignored filed
  if (opts.ignore && opts.ignore.length) {
    pattern = opts.ignore;
    opts = utils_1.omit(opts, ['ignore']);
    res = utils_1.diff(res, micromatch(res, pattern, opts));
  }

  if (opts.nodupes) {
    return utils_1.unique(res);
  }
  return res;
}

/**
 * Returns a function that takes a glob pattern or array of glob patterns
 * to be used with `Array#filter()`. (Internally this function generates
 * the matching function using the [matcher] method).
 *
 * ```js
 * var fn = mm.filter('[a-c]');
 * ['a', 'b', 'c', 'd', 'e'].filter(fn);
 * //=> ['a', 'b', 'c']
 * ```
 * @param  {String|Array} `patterns` Can be a glob or array of globs.
 * @param  {Options} `opts` Options to pass to the [matcher] method.
 * @return {Function} Filter function to be passed to `Array#filter()`.
 */

function filter$2(patterns, opts) {
  if (!Array.isArray(patterns) && typeof patterns !== 'string') {
    throw new TypeError(msg('filter', 'patterns', 'a string or array'));
  }

  patterns = utils_1.arrayify(patterns);
  var len = patterns.length, i = 0;
  var patternMatchers = Array(len);
  while (i < len) {
    patternMatchers[i] = matcher(patterns[i++], opts);
  }

  return function(fp) {
    if (fp == null) return [];
    var len = patternMatchers.length, i = 0;
    var res = true;

    fp = utils_1.unixify(fp, opts);
    while (i < len) {
      var fn = patternMatchers[i++];
      if (!fn(fp)) {
        res = false;
        break;
      }
    }
    return res;
  };
}

/**
 * Returns true if the filepath contains the given
 * pattern. Can also return a function for matching.
 *
 * ```js
 * isMatch('foo.md', '*.md', {});
 * //=> true
 *
 * isMatch('*.md', {})('foo.md')
 * //=> true
 * ```
 * @param  {String} `fp`
 * @param  {String} `pattern`
 * @param  {Object} `opts`
 * @return {Boolean}
 */

function isMatch(fp, pattern, opts) {
  if (typeof fp !== 'string') {
    throw new TypeError(msg('isMatch', 'filepath', 'a string'));
  }

  fp = utils_1.unixify(fp, opts);
  if (utils_1.typeOf(pattern) === 'object') {
    return matcher(fp, pattern);
  }
  return matcher(pattern, opts)(fp);
}

/**
 * Returns true if the filepath matches the
 * given pattern.
 */

function contains(fp, pattern, opts) {
  if (typeof fp !== 'string') {
    throw new TypeError(msg('contains', 'pattern', 'a string'));
  }

  opts = opts || {};
  opts.contains = (pattern !== '');
  fp = utils_1.unixify(fp, opts);

  if (opts.contains && !utils_1.isGlob(pattern)) {
    return fp.indexOf(pattern) !== -1;
  }
  return matcher(pattern, opts)(fp);
}

/**
 * Returns true if a file path matches any of the
 * given patterns.
 *
 * @param  {String} `fp` The filepath to test.
 * @param  {String|Array} `patterns` Glob patterns to use.
 * @param  {Object} `opts` Options to pass to the `matcher()` function.
 * @return {String}
 */

function any(fp, patterns, opts) {
  if (!Array.isArray(patterns) && typeof patterns !== 'string') {
    throw new TypeError(msg('any', 'patterns', 'a string or array'));
  }

  patterns = utils_1.arrayify(patterns);
  var len = patterns.length;

  fp = utils_1.unixify(fp, opts);
  while (len--) {
    var isMatch = matcher(patterns[len], opts);
    if (isMatch(fp)) {
      return true;
    }
  }
  return false;
}

/**
 * Filter the keys of an object with the given `glob` pattern
 * and `options`
 *
 * @param  {Object} `object`
 * @param  {Pattern} `object`
 * @return {Array}
 */

function matchKeys(obj, glob, options) {
  if (utils_1.typeOf(obj) !== 'object') {
    throw new TypeError(msg('matchKeys', 'first argument', 'an object'));
  }

  var fn = matcher(glob, options);
  var res = {};

  for (var key in obj) {
    if (obj.hasOwnProperty(key) && fn(key)) {
      res[key] = obj[key];
    }
  }
  return res;
}

/**
 * Return a function for matching based on the
 * given `pattern` and `options`.
 *
 * @param  {String} `pattern`
 * @param  {Object} `options`
 * @return {Function}
 */

function matcher(pattern, opts) {
  // pattern is a function
  if (typeof pattern === 'function') {
    return pattern;
  }
  // pattern is a regex
  if (pattern instanceof RegExp) {
    return function(fp) {
      return pattern.test(fp);
    };
  }

  if (typeof pattern !== 'string') {
    throw new TypeError(msg('matcher', 'pattern', 'a string, regex, or function'));
  }

  // strings, all the way down...
  pattern = utils_1.unixify(pattern, opts);

  // pattern is a non-glob string
  if (!utils_1.isGlob(pattern)) {
    return utils_1.matchPath(pattern, opts);
  }
  // pattern is a glob string
  var re = makeRe$1(pattern, opts);

  // `matchBase` is defined
  if (opts && opts.matchBase) {
    return utils_1.hasFilename(re, opts);
  }
  // `matchBase` is not defined
  return function(fp) {
    fp = utils_1.unixify(fp, opts);
    return re.test(fp);
  };
}

/**
 * Create and cache a regular expression for matching
 * file paths.
 *
 * If the leading character in the `glob` is `!`, a negation
 * regex is returned.
 *
 * @param  {String} `glob`
 * @param  {Object} `options`
 * @return {RegExp}
 */

function toRegex$1(glob, options) {
  // clone options to prevent  mutating the original object
  var opts = Object.create(options || {});
  var flags = opts.flags || '';
  if (opts.nocase && flags.indexOf('i') === -1) {
    flags += 'i';
  }

  var parsed = expand_1(glob, opts);

  // pass in tokens to avoid parsing more than once
  opts.negated = opts.negated || parsed.negated;
  opts.negate = opts.negated;
  glob = wrapGlob(parsed.pattern, opts);
  var re;

  try {
    re = new RegExp(glob, flags);
    return re;
  } catch (err) {
    err.reason = 'micromatch invalid regex: (' + re + ')';
    if (opts.strict) throw new SyntaxError(err);
  }

  // we're only here if a bad pattern was used and the user
  // passed `options.silent`, so match nothing
  return /$^/;
}

/**
 * Create the regex to do the matching. If the leading
 * character in the `glob` is `!` a negation regex is returned.
 *
 * @param {String} `glob`
 * @param {Boolean} `negate`
 */

function wrapGlob(glob, opts) {
  var prefix = (opts && !opts.contains) ? '^' : '';
  var after = (opts && !opts.contains) ? '$' : '';
  glob = ('(?:' + glob + ')' + after);
  if (opts && opts.negate) {
    return prefix + ('(?!^' + glob + ').*$');
  }
  return prefix + glob;
}

/**
 * Create and cache a regular expression for matching file paths.
 * If the leading character in the `glob` is `!`, a negation
 * regex is returned.
 *
 * @param  {String} `glob`
 * @param  {Object} `options`
 * @return {RegExp}
 */

function makeRe$1(glob, opts) {
  if (utils_1.typeOf(glob) !== 'string') {
    throw new Error(msg('makeRe', 'glob', 'a string'));
  }
  return utils_1.cache(toRegex$1, glob, opts);
}

/**
 * Make error messages consistent. Follows this format:
 *
 * ```js
 * msg(methodName, argNumber, nativeType);
 * // example:
 * msg('matchKeys', 'first', 'an object');
 * ```
 *
 * @param  {String} `method`
 * @param  {String} `num`
 * @param  {String} `type`
 * @return {String}
 */

function msg(method, what, type) {
  return 'micromatch.' + method + '(): ' + what + ' should be ' + type + '.';
}

/**
 * Public methods
 */

/* eslint no-multi-spaces: 0 */
micromatch.any       = any;
micromatch.braces    = micromatch.braceExpand = utils_1.braces;
micromatch.contains  = contains;
micromatch.expand    = expand_1;
micromatch.filter    = filter$2;
micromatch.isMatch   = isMatch;
micromatch.makeRe    = makeRe$1;
micromatch.match     = match$1;
micromatch.matcher   = matcher;
micromatch.matchKeys = matchKeys;

/**
 * Expose `micromatch`
 */

var micromatch_1 = micromatch;

function ensureArray ( thing ) {
	if ( Array.isArray( thing ) ) { return thing; }
	if ( thing == undefined ) { return []; }
	return [ thing ];
}

function createFilter ( include, exclude ) {
	var getMatcher = function (id) { return ( isRegexp$1( id ) ? id : { test: micromatch_1.matcher( path.resolve( id ).split ( path.sep ).join( '/' ) ) } ); };
	include = ensureArray( include ).map( getMatcher );
	exclude = ensureArray( exclude ).map( getMatcher );

	return function ( id ) {

		if ( typeof id !== 'string' ) { return false; }
		if ( /\0/.test( id ) ) { return false; }

		id = id.split( path.sep ).join( '/' );

		for ( var i = 0; i < exclude.length; ++i ) {
			var matcher = exclude[i];
			if ( matcher.test( id ) ) { return false; }
		}

		for ( var i$1 = 0; i$1 < include.length; ++i$1 ) {
			var matcher$1 = include[i$1];
			if ( matcher$1.test( id ) ) { return true; }
		}

		return !include.length;
	};
}

function isRegexp$1 ( val ) {
	return val instanceof RegExp;
}

var reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public'.split( ' ' );
var builtins = 'arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl'.split( ' ' );

var blacklisted = Object.create( null );
reservedWords.concat( builtins ).forEach( function (word) { return blacklisted[ word ] = true; } );

function makeLegalIdentifier ( str ) {
	str = str
		.replace( /-(\w)/g, function ( _, letter ) { return letter.toUpperCase(); } )
		.replace( /[^$_a-zA-Z0-9]/g, '_' );

	if ( /\d/.test( str[0] ) || blacklisted[ str ] ) { str = "_" + str; }

	return str;
}

function bundleJson(config, options = {}) {
    const path$$1 = config.sys.path;
    const filter = createFilter(options.include, options.exclude);
    const collectionDirs = config.outputTargets.filter(o => o.collectionDir).map(o => o.collectionDir);
    return {
        name: 'json',
        resolveId(importee, importer) {
            if (importer && importee.endsWith('.json')) {
                const collectionDir = collectionDirs.find(cd => importer.startsWith(cd));
                if (collectionDir) {
                    return path$$1.resolve(path$$1.dirname(importer).replace(collectionDir, config.srcDir), importee);
                }
            }
            return null;
        },
        transform(json, id) {
            if (id.slice(-5) !== '.json')
                return null;
            if (!filter(id))
                return null;
            const data = JSON.parse(json);
            let code = '';
            const ast = {
                type: 'Program',
                sourceType: 'module',
                start: 0,
                end: null,
                body: []
            };
            if (Object.prototype.toString.call(data) !== '[object Object]') {
                code = `export default ${json};`;
                ast.body.push({
                    type: 'ExportDefaultDeclaration',
                    start: 0,
                    end: code.length,
                    declaration: {
                        type: 'Literal',
                        start: 15,
                        end: code.length - 1,
                        value: null,
                        raw: 'null'
                    }
                });
            }
            else {
                const indent = 'indent' in options ? options.indent : '\t';
                const validKeys = [];
                const invalidKeys = [];
                Object.keys(data).forEach(key => {
                    if (key === makeLegalIdentifier(key)) {
                        validKeys.push(key);
                    }
                    else {
                        invalidKeys.push(key);
                    }
                });
                let char = 0;
                validKeys.forEach(key => {
                    const declarationType = options.preferConst ? 'const' : 'var';
                    const declaration = `export ${declarationType} ${key} = ${JSON.stringify(data[key])};`;
                    const start = char;
                    const end = start + declaration.length;
                    // generate fake AST node while we're here
                    ast.body.push({
                        type: 'ExportNamedDeclaration',
                        start: char,
                        end: char + declaration.length,
                        declaration: {
                            type: 'VariableDeclaration',
                            start: start + 7,
                            end,
                            declarations: [
                                {
                                    type: 'VariableDeclarator',
                                    start: start + 7 + declarationType.length + 1,
                                    end: end - 1,
                                    id: {
                                        type: 'Identifier',
                                        start: start + 7 + declarationType.length + 1,
                                        end: start + 7 + declarationType.length + 1 + key.length,
                                        name: key
                                    },
                                    init: {
                                        type: 'Literal',
                                        start: start +
                                            7 +
                                            declarationType.length +
                                            1 +
                                            key.length +
                                            3,
                                        end: end - 1,
                                        value: null,
                                        raw: 'null'
                                    }
                                }
                            ],
                            kind: declarationType
                        },
                        specifiers: [],
                        source: null
                    });
                    char = end + 1;
                    code += `${declaration}\n`;
                });
                const defaultExportNode = {
                    type: 'ExportDefaultDeclaration',
                    start: char,
                    end: null,
                    declaration: {
                        type: 'ObjectExpression',
                        start: char + 15,
                        end: null,
                        properties: []
                    }
                };
                char += 17 + indent.length; // 'export default {\n\t'.length'
                const defaultExportRows = validKeys
                    .map(key => {
                    const row = `${key}: ${key}`;
                    const start = char;
                    const end = start + row.length;
                    defaultExportNode.declaration.properties.push({
                        type: 'Property',
                        start,
                        end,
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: {
                            type: 'Identifier',
                            start,
                            end: start + key.length,
                            name: key
                        },
                        value: {
                            type: 'Identifier',
                            start: start + key.length + 2,
                            end,
                            name: key
                        },
                        kind: 'init'
                    });
                    char += row.length + (2 + indent.length); // ',\n\t'.length
                    return row;
                })
                    .concat(invalidKeys.map(key => `"${key}": ${JSON.stringify(data[key])}`));
                code += `export default {\n${indent}${defaultExportRows.join(`,\n${indent}`)}\n};`;
                ast.body.push(defaultExportNode);
                const end = code.length;
                defaultExportNode.declaration.end = end - 1;
                defaultExportNode.end = end;
            }
            ast.end = code.length;
            return { ast, code, map: { mappings: '' } };
        }
    };
}

function localResolution(config, compilerCtx) {
    return {
        name: 'localResolution',
        resolveId(importee, importer) {
            return __awaiter(this, void 0, void 0, function* () {
                if (/\0/.test(importee)) {
                    // ignore IDs with null character, these belong to other plugins
                    return null;
                }
                importee = normalizePath(importee);
                if (importee.indexOf('./') === -1) {
                    return null;
                }
                if (!importer) {
                    return null;
                }
                importer = normalizePath(importer);
                if (importee.endsWith('.js')) {
                    return null;
                }
                const basename = config.sys.path.basename(importer);
                const directory = importer.split(basename)[0];
                const dirIndexFile = config.sys.path.join(directory + importee, 'index.js');
                let stats;
                try {
                    stats = yield compilerCtx.fs.stat(dirIndexFile);
                }
                catch (e) {
                    return null;
                }
                if (stats.isFile) {
                    return dirIndexFile;
                }
                return null;
            });
        }
    };
}

function pathsResolver(config, compilerCtx, tsCompilerOptions) {
    const extensions = [
        'ts',
        'tsx'
    ];
    return {
        name: 'pathsResolverPlugin',
        resolveId(importee, importer) {
            if (!importer || /\0/.test(importee)) {
                // ignore IDs with null character, these belong to other plugins
                return null;
            }
            importee = normalizePath(importee);
            importer = normalizePath(importer);
            const paths = tsCompilerOptions.paths || {};
            // Parse each rule from tsconfig
            for (const rule in paths) {
                const normalizedRule = normalizePath(rule);
                // The rule without the wildcard
                const standaloneRule = normalizedRule.replace(/\*$/, '');
                if (importee.indexOf(standaloneRule) === 0) {
                    // Get the wildcard part from importee
                    const wildcard = importee.slice(standaloneRule.length);
                    // Parse each sub-rule of a rule
                    for (const subrule of paths[rule]) {
                        const normalizedSubrule = normalizePath(subrule);
                        // Build the subrule replacing the wildcard with actual path
                        const enrichedSubrule = normalizePath(normalizedSubrule.replace(/\*$/, wildcard));
                        const finalPath = normalizePath(config.sys.path.join(config.rootDir, enrichedSubrule));
                        const moduleFiles = compilerCtx.moduleFiles;
                        for (let i = 0; i < extensions.length; i++) {
                            const moduleFile = moduleFiles[`${finalPath}.${extensions[i]}`];
                            if (moduleFile) {
                                return moduleFile.jsFilePath;
                            }
                        }
                    }
                }
            }
            return null;
        },
    };
}

function rollupPluginHelper(config, compilerCtx, builtCtx) {
    return {
        name: 'pluginHelper',
        resolveId(importee, importer) {
            return __awaiter(this, void 0, void 0, function* () {
                if (importee) {
                    if (/\0/.test(importee)) {
                        // ignore IDs with null character, these belong to other plugins
                        return null;
                    }
                    if (importee.slice(-1) === '/') {
                        importee === importee.slice(0, -1);
                    }
                    if (builtIns.has(importee) || globals.has(importee)) {
                        let fromMsg = '';
                        if (importer) {
                            if (importer.endsWith('.js')) {
                                const tsxFile = importer.substr(0, importer.length - 2) + 'tsx';
                                const tsxFileExists = yield compilerCtx.fs.access(tsxFile);
                                if (tsxFileExists) {
                                    importer = tsxFile;
                                }
                                else {
                                    const tsFile = importer.substr(0, importer.length - 2) + 'ts';
                                    const tsFileExists = yield compilerCtx.fs.access(tsFile);
                                    if (tsFileExists) {
                                        importer = tsFile;
                                    }
                                }
                            }
                            fromMsg = ` from ${config.sys.path.relative(config.rootDir, importer)}`;
                        }
                        const diagnostic = buildError(builtCtx.diagnostics);
                        diagnostic.header = `Bundling Node Builtin${globals.has(importee) ? ` and Global` : ``}`;
                        diagnostic.messageText = `For the import "${importee}" to be bundled${fromMsg}, ensure the "rollup-plugin-node-builtins" plugin${globals.has(importee) ? ` and "rollup-plugin-node-globals" plugin` : ``} is installed and added to the stencil config plugins. Please see the bundling docs for more information.`;
                    }
                }
                return null;
            });
        }
    };
}
const builtIns = new Set([
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'module',
    'net',
    'readline',
    'repl',
    'tls',
    'assert',
    'console',
    'constants',
    'domain',
    'events',
    'path',
    'punycode',
    'querystring',
    '_stream_duplex',
    '_stream_passthrough',
    '_stream_readable',
    '_stream_writable',
    '_stream_transform',
    'string_decoder',
    'sys',
    'tty',
    'crypto',
    'fs',
]);
const globals = new Set([
    'assert',
    'Buffer',
    'buffer',
    'global',
    'http',
    'https',
    'os',
    'process',
    'stream',
    'timers',
    'url',
    'util',
    'vm',
    'zlib'
]);

function sortBundles(a, b) {
    if (a.isEntry && !b.isEntry) {
        return -1;
    }
    if (b.isEntry) {
        return 1;
    }
    const nameA = a.fileName.toUpperCase();
    const nameB = b.fileName.toUpperCase();
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    return 0;
}
function statsPlugin(buildCtx) {
    const plugin = {
        name: 'stats-plugin',
        generateBundle(options, bundle) {
            const modules = Object.keys(bundle)
                .map(b => bundle[b])
                .sort(sortBundles)
                .map((b) => {
                return {
                    id: b.fileName,
                    isEntry: b.isEntry,
                    imports: b.imports.filter(i => !!i),
                    exports: b.exports,
                    modules: Object.keys(b.modules).map(m => ({
                        filename: m,
                        exports: b.modules[m].renderedExports
                    }))
                };
            });
            buildCtx.rollupResults = {
                modules: modules
            };
        }
    };
    return plugin;
}

function createBundle(config, compilerCtx, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!buildCtx.isActiveBuild) {
            buildCtx.debug(`createBundle aborted, not active build`);
        }
        const timeSpan = buildCtx.createTimeSpan(`createBundle started`, true);
        const replaceObj = {
            'Build.isDev': !!config.devMode,
            'process.env.NODE_ENV': config.devMode ? '"development"' : '"production"'
        };
        const commonjsConfig = Object.assign({ include: 'node_modules/**', sourceMap: false }, config.commonjs);
        const nodeResolveConfig = Object.assign({ jsnext: true, main: true }, config.nodeResolve);
        const tsCompilerOptions = yield getUserCompilerOptions(config, compilerCtx, buildCtx);
        const rollupConfig = Object.assign({}, config.rollupConfig.inputOptions, { input: entryModules.map(b => b.filePath), preserveSymlinks: false, treeshake: !config.devMode, cache: config.enableCache ? compilerCtx.rollupCache : undefined, plugins: [
                abortPlugin(buildCtx),
                config.sys.rollup.plugins.nodeResolve(nodeResolveConfig),
                config.sys.rollup.plugins.emptyJsResolver(),
                config.sys.rollup.plugins.commonjs(commonjsConfig),
                bundleJson(config),
                inMemoryFsRead(config, compilerCtx, buildCtx, entryModules),
                pathsResolver(config, compilerCtx, tsCompilerOptions),
                localResolution(config, compilerCtx),
                replace({
                    values: replaceObj
                }),
                ...config.plugins,
                statsPlugin(buildCtx),
                rollupPluginHelper(config, compilerCtx, buildCtx),
                abortPlugin(buildCtx)
            ], onwarn: createOnWarnFn(config, buildCtx.diagnostics) });
        let rollupBundle;
        try {
            rollupBundle = yield config.sys.rollup.rollup(rollupConfig);
            compilerCtx.rollupCache = rollupBundle ? rollupBundle.cache : undefined;
        }
        catch (err) {
            // clean rollup cache if error
            compilerCtx.rollupCache = undefined;
            // looks like there was an error bundling!
            if (buildCtx.isActiveBuild) {
                loadRollupDiagnostics(config, compilerCtx, buildCtx, err);
            }
            else {
                buildCtx.debug(`createBundle errors ignored, not active build`);
            }
        }
        timeSpan.finish(`createBundle finished`);
        return rollupBundle;
    });
}

function writeEntryModules(config, compilerCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        const path$$1 = config.sys.path;
        yield Promise.all(entryModules.map((entryModule) => __awaiter(this, void 0, void 0, function* () {
            const fileContents = entryModule.moduleFiles
                .map(moduleFile => {
                const originalClassName = moduleFile.cmpMeta.componentClass;
                const pascalCasedClassName = dashToPascalCase(moduleFile.cmpMeta.tagNameMeta);
                const filePath = normalizePath(path$$1.relative(path$$1.dirname(entryModule.filePath), moduleFile.jsFilePath));
                return `export { ${originalClassName} as ${pascalCasedClassName} } from './${filePath}';`;
            })
                .join('\n');
            yield compilerCtx.fs.writeFile(entryModule.filePath, fileContents, { inMemoryOnly: true });
        })));
    });
}
function writeEsmModules(config, rollupBundle) {
    return __awaiter(this, void 0, void 0, function* () {
        const { output } = yield rollupBundle.generate(Object.assign({}, config.rollupConfig.outputOptions, { format: 'es', banner: generatePreamble(config), intro: getIntroPlaceholder(), strict: false }));
        return output
            .map(({ fileName, code }) => ({ [fileName]: { code } }))
            .reduce((acc, val) => (Object.assign({}, acc, val)));
    });
}
function writeAmdModules(config, rollupBundle, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.buildEs5) {
            // only create legacy modules when generating es5 fallbacks
            return undefined;
        }
        rollupBundle.cache.modules.forEach(module => {
            const key = module.id;
            const entryModule = entryModules.find(b => b.entryKey === `./${key}.js`);
            if (entryModule) {
                entryModule.dependencies = module.dependencies.slice();
            }
        });
        const { output } = yield rollupBundle.generate(Object.assign({}, config.rollupConfig.outputOptions, { format: 'amd', amd: {
                id: getBundleIdPlaceholder(),
                define: `${config.namespace}.loadBundle`
            }, banner: generatePreamble(config), intro: getIntroPlaceholder(), strict: false }));
        return output
            .map(({ fileName, code }) => ({ [fileName]: { code } }))
            .reduce((acc, val) => (Object.assign({}, acc, val)));
    });
}

function generateBundleModules(config, compilerCtx, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (entryModules.length === 0) {
            // no entry modules, so don't bother
            return undefined;
        }
        yield writeEntryModules(config, compilerCtx, entryModules);
        // Check for index.js file. This file is used for stencil project exports
        // usually this contains utility exports.
        // If it exists then add it as an entry point.
        const exportedFile = pathJoin(config, config.srcDir, 'index.js');
        const fileExists = yield compilerCtx.fs.access(exportedFile);
        if (fileExists) {
            buildCtx.entryModules.push({
                entryKey: 'exportedFile',
                filePath: exportedFile,
                moduleFiles: []
            });
        }
        try {
            // run rollup, but don't generate yet
            // returned rollup bundle can be reused for es module and legacy
            const rollupBundle = yield createBundle(config, compilerCtx, buildCtx, entryModules);
            if (buildCtx.hasError || !buildCtx.isActiveBuild) {
                // rollup errored, so let's not continue
                return undefined;
            }
            const [esm, amd] = yield Promise.all([
                // [0] bundle using only es modules and dynamic imports
                yield writeEsmModules(config, rollupBundle),
                // [1] bundle using commonjs using jsonp callback
                yield writeAmdModules(config, rollupBundle, entryModules),
            ]);
            if (buildCtx.hasError || !buildCtx.isActiveBuild) {
                // someone could have errored
                return undefined;
            }
            return {
                esm,
                amd
            };
        }
        catch (err) {
            catchError(buildCtx.diagnostics, err);
        }
        return undefined;
    });
}

function generateModuleMap(config, compilerCtx, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return null;
        }
        if (buildCtx.isRebuild && !buildCtx.requiresFullBuild && !buildCtx.hasScriptChanges && compilerCtx.lastRawModules) {
            // this is a rebuild, it doesn't require a full build
            // there were no script changes, and we've got a good cache of the last js modules
            // let's skip this
            buildCtx.debug(`generateModuleMap, using lastRawModules cache`);
            return compilerCtx.lastRawModules;
        }
        const moduleMapTimespan = buildCtx.createTimeSpan(`module map started`);
        let moduleFormats;
        try {
            moduleFormats = yield generateBundleModules(config, compilerCtx, buildCtx, entryModules);
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
        const moduleDeriveTimespan = buildCtx.createTimeSpan(`module derive started`, true);
        const derivesModules = yield deriveModules(config, compilerCtx, buildCtx, moduleFormats);
        moduleDeriveTimespan.finish(`module derive finished`);
        // remember for next time incase we change just a css file or something
        compilerCtx.lastRawModules = derivesModules;
        moduleMapTimespan.finish(`module map finished`);
        return derivesModules;
    });
}

function generateGlobalStyles(config, compilerCtx, buildCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const canSkip = yield canSkipGlobalStyles(config, compilerCtx, buildCtx, outputTarget);
        if (canSkip) {
            return;
        }
        const timeSpan = buildCtx.createTimeSpan(`compile global style start`);
        try {
            const styleText = yield loadGlobalStyle(config, compilerCtx, buildCtx, config.globalStyle);
            const fileName = getGlobalStyleFilename(config);
            const filePath = pathJoin(config, outputTarget.buildDir, fileName);
            buildCtx.debug(`global style: ${config.sys.path.relative(config.rootDir, filePath)}`);
            yield compilerCtx.fs.writeFile(filePath, styleText);
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
        timeSpan.finish(`compile global style finish`);
    });
}
function loadGlobalStyle(config, compilerCtx, buildCtx, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        let styleText = '';
        try {
            filePath = normalizePath(filePath);
            const transformResults = yield runPluginTransforms(config, compilerCtx, buildCtx, filePath);
            styleText = yield optimizeCss(config, compilerCtx, buildCtx.diagnostics, transformResults.code, filePath, true);
        }
        catch (e) {
            const d = buildError(buildCtx.diagnostics);
            d.messageText = e + '';
            d.absFilePath = normalizePath(filePath);
            d.relFilePath = normalizePath(config.sys.path.relative(config.rootDir, filePath));
        }
        return styleText;
    });
}
function canSkipGlobalStyles(config, compilerCtx, buildCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof config.globalStyle !== 'string') {
            return true;
        }
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return true;
        }
        if (!outputTarget.buildDir) {
            return true;
        }
        if (buildCtx.requiresFullBuild) {
            return false;
        }
        if (buildCtx.isRebuild && !buildCtx.hasStyleChanges) {
            return true;
        }
        if (buildCtx.filesChanged.includes(config.globalStyle)) {
            // changed file IS the global entry style
            return false;
        }
        const hasChangedImports = yield hasChangedImportFile$1(config, compilerCtx, buildCtx, config.globalStyle, []);
        if (hasChangedImports) {
            return false;
        }
        return true;
    });
}
function hasChangedImportFile$1(config, compilerCtx, buildCtx, filePath, noLoop) {
    return __awaiter(this, void 0, void 0, function* () {
        if (noLoop.includes(filePath)) {
            return false;
        }
        noLoop.push(filePath);
        let rtn = false;
        try {
            const content = yield compilerCtx.fs.readFile(filePath);
            rtn = yield hasChangedImportContent$1(config, compilerCtx, buildCtx, filePath, content, noLoop);
        }
        catch (e) { }
        return rtn;
    });
}
function hasChangedImportContent$1(config, compilerCtx, buildCtx, filePath, content, checkedFiles) {
    return __awaiter(this, void 0, void 0, function* () {
        const cssImports = getCssImports(config, buildCtx, filePath, content);
        if (cssImports.length === 0) {
            // don't bother
            return false;
        }
        const isChangedImport = buildCtx.filesChanged.some(changedFilePath => {
            return cssImports.some(c => c.filePath === changedFilePath);
        });
        if (isChangedImport) {
            // one of the changed files is an import of this file
            return true;
        }
        // keep diggin'
        const promises = cssImports.map(cssImportData => {
            return hasChangedImportFile$1(config, compilerCtx, buildCtx, cssImportData.filePath, checkedFiles);
        });
        const results = yield Promise.all(promises);
        return results.includes(true);
    });
}

function generateStyles(config, compilerCtx, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (canSkipGenerateStyles(buildCtx)) {
            return;
        }
        const timeSpan = buildCtx.createTimeSpan(`generate styles started`);
        const componentStyles = yield Promise.all(entryModules.map((bundle) => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(bundle.moduleFiles.map((moduleFile) => __awaiter(this, void 0, void 0, function* () {
                yield generateComponentStyles(config, compilerCtx, buildCtx, moduleFile);
            })));
        })));
        // create the global styles
        const globalStyles = yield Promise.all(config.outputTargets
            .filter(outputTarget => outputTarget.type !== 'stats')
            .map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield generateGlobalStyles(config, compilerCtx, buildCtx, outputTarget);
        })));
        yield Promise.all([
            componentStyles,
            globalStyles
        ]);
        timeSpan.finish(`generate styles finished`);
    });
}
function generateComponentStyles(config, compilerCtx, buildCtx, moduleFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const stylesMeta = moduleFile.cmpMeta.stylesMeta = moduleFile.cmpMeta.stylesMeta || {};
        yield Promise.all(Object.keys(stylesMeta).map((modeName) => __awaiter(this, void 0, void 0, function* () {
            yield generateComponentStylesMode(config, compilerCtx, buildCtx, moduleFile, stylesMeta[modeName], modeName);
        })));
    });
}
function canSkipGenerateStyles(buildCtx) {
    if (buildCtx.hasError || !buildCtx.isActiveBuild) {
        return true;
    }
    if (buildCtx.requiresFullBuild) {
        return false;
    }
    if (buildCtx.isRebuild) {
        if (buildCtx.hasScriptChanges || buildCtx.hasStyleChanges) {
            return false;
        }
        return true;
    }
    return false;
}

/* tslint:disable */
function upgradeJsxProps(transformContext) {
    return (tsSourceFile) => {
        return visit(tsSourceFile);
        function visit(node) {
            switch (node.kind) {
                case ts.SyntaxKind.CallExpression:
                    const callNode = node;
                    if (callNode.expression.text === 'h') {
                        const tag = callNode.arguments[0];
                        if (tag && typeof tag.text === 'string') {
                            node = upgradeCall(callNode);
                        }
                    }
                default:
                    return ts.visitEachChild(node, (node) => {
                        return visit(node);
                    }, transformContext);
            }
        }
    };
}
function upgradeCall(callNode) {
    const [tag, props, ...children] = callNode.arguments;
    let newArgs = [];
    newArgs.push(upgradeTagName(tag));
    newArgs.push(upgradeProps(props));
    if (children != null) {
        newArgs = newArgs.concat(upgradeChildren(children));
    }
    return ts.updateCall(callNode, callNode.expression, undefined, newArgs);
}
function upgradeTagName(tagName) {
    if (ts.isNumericLiteral(tagName) &&
        tagName.text === '0') {
        return ts.createLiteral('slot');
    }
    return tagName;
}
function upgradeProps(props) {
    let upgradedProps = {};
    let propHackValue;
    if (!ts.isObjectLiteralExpression(props)) {
        return ts.createNull();
    }
    const objectProps = objectLiteralToObjectMap(props);
    upgradedProps = Object.keys(objectProps).reduce((newProps, propName) => {
        const propValue = objectProps[propName];
        // If the propname is c, s, or k then map to proper name
        if (propName === 'c') {
            return Object.assign({}, newProps, { 'class': propValue });
        }
        if (propName === 's') {
            return Object.assign({}, newProps, { 'style': propValue });
        }
        if (propName === 'k') {
            return Object.assign({}, newProps, { 'key': propValue });
        }
        // If the propname is p or a then spread the value into props
        if (propName === 'a') {
            return Object.assign({}, newProps, propValue);
        }
        if (propName === 'p') {
            if (isInstanceOfObjectMap(propValue)) {
                return Object.assign({}, newProps, propValue);
            }
            else {
                propHackValue = propValue;
            }
        }
        // If the propname is o then we need to update names and then spread into props
        if (propName === 'o') {
            const eventListeners = Object.keys(propValue).reduce((newValue, eventName) => {
                return Object.assign({}, newValue, { [`on${eventName}`]: propValue[eventName] });
            }, {});
            return Object.assign({}, newProps, eventListeners);
        }
        return newProps;
    }, upgradedProps);
    try {
    }
    catch (e) {
        console.log(upgradedProps);
        console.log(objectProps);
        console.log(props);
        throw e;
    }
    const response = objectMapToObjectLiteral(upgradedProps);
    // Looks like someone used the props hack. So we need to create the following code:
    // Object.assign({}, upgradedProps, propHackValue);
    if (propHackValue) {
        const emptyObjectLiteral = ts.createObjectLiteral();
        return ts.createCall(ts.createPropertyAccess(ts.createIdentifier('Object'), ts.createIdentifier('assign')), undefined, [emptyObjectLiteral, response, propHackValue]);
    }
    return response;
}
function upgradeChildren(children) {
    return children.map(upgradeChild);
}
function upgradeChild(child) {
    if (ts.isCallExpression(child) && child.expression.text === 't') {
        return child.arguments[0];
    }
    return child;
}

function upgradeFromMetadata(moduleFiles) {
    const allModuleFiles = Object.keys(moduleFiles).map(filePath => {
        return moduleFiles[filePath];
    });
    return (tsSourceFile) => {
        const tsFilePath = normalizePath(tsSourceFile.fileName);
        let moduleFile = moduleFiles[tsFilePath];
        if (!moduleFile || !moduleFile.cmpMeta) {
            moduleFile = allModuleFiles.find(m => m.jsFilePath === tsFilePath);
        }
        if (moduleFile) {
            tsSourceFile = upgradeModuleFile(tsSourceFile, moduleFile.cmpMeta);
        }
        return tsSourceFile;
    };
}
function upgradeModuleFile(tsSourceFile, cmpMeta) {
    const staticMembers = addStaticMeta(cmpMeta);
    const newStatements = Object.keys(staticMembers).map(memberName => {
        return ts.createBinary(ts.createPropertyAccess(ts.createIdentifier(cmpMeta.componentClass), memberName), ts.createToken(ts.SyntaxKind.EqualsToken), staticMembers[memberName]);
    });
    return ts.updateSourceFileNode(tsSourceFile, [
        ...tsSourceFile.statements,
        ...newStatements
    ]);
}

function upgradeCollection(config, compilerCtx, buildCtx, collection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const upgradeTransforms = validateCollectionCompatibility(config, collection);
            if (upgradeTransforms.length === 0) {
                return;
            }
            const timeSpan = buildCtx.createTimeSpan(`upgrade ${collection.collectionName} started`, true);
            const doUpgrade = createDoUpgrade(compilerCtx, buildCtx);
            yield doUpgrade(collection, upgradeTransforms);
            timeSpan.finish(`upgrade ${collection.collectionName} finished`);
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
    });
}
function createDoUpgrade(compilerCtx, buildCtx) {
    return (collection, upgrades) => __awaiter(this, void 0, void 0, function* () {
        const upgradeTransforms = (upgrades.map((upgrade) => {
            switch (upgrade) {
                case 0 /* JSX_Upgrade_From_0_0_5 */:
                    buildCtx.debug(`JSX_Upgrade_From_0_0_5, ${collection.collectionName}, compiled by v${collection.compiler.version}`);
                    return upgradeJsxProps;
                case 1 /* Metadata_Upgrade_From_0_1_0 */:
                    buildCtx.debug(`Metadata_Upgrade_From_0_1_0, ${collection.collectionName}, compiled by v${collection.compiler.version}`);
                    return () => {
                        return upgradeFromMetadata(compilerCtx.moduleFiles);
                    };
                case 2 /* Remove_Stencil_Imports */:
                    buildCtx.debug(`Remove_Stencil_Imports, ${collection.collectionName}, compiled by v${collection.compiler.version}`);
                    return (transformContext) => {
                        return removeStencilImports()(transformContext);
                    };
                case 3 /* Add_Component_Dependencies */:
                    buildCtx.debug(`Add_Component_Dependencies, ${collection.collectionName}, compiled by v${collection.compiler.version}`);
                    return (transformContext) => {
                        return componentDependencies(compilerCtx)(transformContext);
                    };
            }
            return () => (tsSourceFile) => (tsSourceFile);
        }));
        yield Promise.all(collection.moduleFiles.map((moduleFile) => __awaiter(this, void 0, void 0, function* () {
            try {
                const source = yield compilerCtx.fs.readFile(moduleFile.jsFilePath);
                const output = yield transformSourceString(moduleFile.jsFilePath, source, upgradeTransforms);
                yield compilerCtx.fs.writeFile(moduleFile.jsFilePath, output, { inMemoryOnly: true });
            }
            catch (e) {
                catchError(buildCtx.diagnostics, e, `error performing compiler upgrade on ${moduleFile.jsFilePath}: ${e}`);
            }
        })));
    });
}

function initCollections(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const uninitialized = compilerCtx.collections.filter(c => !c.isInitialized);
        yield Promise.all(uninitialized.map((collection) => __awaiter(this, void 0, void 0, function* () {
            // Look at all dependent components from outside collections and
            // upgrade the components to be compatible with this version if need be
            yield upgradeCollection(config, compilerCtx, buildCtx, collection);
            collection.isInitialized = true;
        })));
    });
}

function initIndexHtmls(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(config.outputTargets.map((outputTarget) => __awaiter(this, void 0, void 0, function* () {
            yield initIndexHtml(config, compilerCtx, buildCtx, outputTarget);
        })));
    });
}
function initIndexHtml(config, compilerCtx, buildCtx, outputTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        // if there isn't an index.html yet
        // let's generate a slim one quick so that
        // on the first build the user sees a loading indicator
        // this is synchronous on purpose so that it's saved
        // before the dev server fires up and loads the index.html page
        if (outputTarget.type === 'www') {
            // only worry about this when generating www directory
            // check if there's even a src index.html file
            const hasSrcIndexHtml = yield compilerCtx.fs.access(config.srcIndexHtml);
            if (!hasSrcIndexHtml) {
                // there is no src index.html file in the config, which is fine
                // since there is no src index file at all, don't bother
                // this isn't actually an error, don't worry about it
                return;
            }
            if (compilerCtx.hasSuccessfulBuild) {
                // we've already had a successful build, we're good
                // always recopy index.html (it's all cached if it didn't actually change, all good)
                const srcIndexHtmlContent = yield compilerCtx.fs.readFile(config.srcIndexHtml);
                yield compilerCtx.fs.writeFile(outputTarget.indexHtml, srcIndexHtmlContent);
                return;
            }
            try {
                // ok, so we haven't written an index.html build file yet
                // and we do know they have a src one, so let's write a
                // filler index.html file that shows while the first build is happening
                yield compilerCtx.fs.writeFile(outputTarget.indexHtml, APP_LOADING_HTML);
                yield compilerCtx.fs.commit();
            }
            catch (e) {
                catchError(buildCtx.diagnostics, e);
            }
        }
    });
}
const APP_LOADING_HTML = `
<!DOCTYPE html>
<html dir="ltr" lang="en" data-init="app-dev-first-build-loader">
<head>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function(registration) {
        registration.unregister();
      });
    }
  </script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="x-ua-compatible" content="IE=Edge">
  <title>Initializing First Build...</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      position: absolute;
      padding: 0;
      margin: 0;
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
    .toast {
      position: absolute;
      top: 10px;
      right: 10px;
      left: 10px;
      margin: auto;
      max-width: 700px;
      border-radius: 3px;
      background: rgba(0,0,0,.9);
      -webkit-transform: translate3d(0px, -60px, 0px);
      transform: translate3d(0px, -60px, 0px);
      -webkit-transition: -webkit-transform 75ms ease-out;
      transition: transform 75ms ease-out;
      pointer-events: none;
    }

    .active {
      -webkit-transform: translate3d(0px, 0px, 0px);
      transform: translate3d(0px, 0px, 0px);
    }

    .content {
      display: flex;
      -webkit-align-items: center;
      -ms-flex-align: center;
      align-items: center;
      pointer-events: auto;
    }

    .message {
      -webkit-flex: 1;
      -ms-flex: 1;
      flex: 1;
      padding: 15px;
      font-size: 14px;
      color: #fff;
    }

    .spinner {
      position: relative;
      display: inline-block;
      width: 56px;
      height: 28px;
    }

    svg:not(:root) {
      overflow: hidden;
    }

    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-animation: rotate 600ms linear infinite;
      animation: rotate 600ms linear infinite;
    }

    @-webkit-keyframes rotate {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }

    @keyframes rotate {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }

    svg circle {
      fill: transparent;
      stroke: white;
      stroke-width: 4px;
      stroke-dasharray: 128px;
      stroke-dashoffset: 82px;
    }
  </style>
</head>
<body>

  <div class="toast">
    <div class="content">
      <div class="message">Initializing First Build...</div>
      <div class="spinner">
        <svg viewBox="0 0 64 64"><circle transform="translate(32,32)" r="26"></circle></svg>
      </div>
    </div>
  </div>

  <script>
    setTimeout(function() {
      document.querySelector('.toast').classList.add('active');
    }, 100);

    setInterval(function() {
      try {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function() {
          try {
            if (this.responseText.indexOf('app-dev-first-build-loader') === -1) {
              window.location.reload(true);
            }
          } catch (e) {
            console.error(e);
          }
        });
        var url = window.location.pathname + '?' + Math.random();
        xhr.open('GET', url);
        xhr.send();
      } catch (e) {
        console.error(e);
      }
    }, 1000);
  </script>

</body>
</html>
`;

function writeBuildFiles(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (buildCtx.hasError || !buildCtx.isActiveBuild) {
            return;
        }
        // serialize and write the manifest file if need be
        yield writeAppCollections(config, compilerCtx, buildCtx);
        const timeSpan = buildCtx.createTimeSpan(`writeBuildFiles started`, true);
        let totalFilesWrote = 0;
        let distributionPromise = null;
        try {
            // copy www/build to dist/ if generateDistribution is enabled
            distributionPromise = generateDistributions(config, compilerCtx, buildCtx);
            if (!buildCtx.isRebuild) {
                // if this is the initial build then we need to wait on
                // the distributions to finish, otherwise we can let it
                // finish when it finishes
                yield distributionPromise;
                distributionPromise = null;
            }
            // commit all the writeFiles, mkdirs, rmdirs and unlinks to disk
            const commitResults = yield compilerCtx.fs.commit();
            // get the results from the write to disk commit
            buildCtx.filesWritten = commitResults.filesWritten;
            buildCtx.filesDeleted = commitResults.filesDeleted;
            buildCtx.dirsDeleted = commitResults.dirsDeleted;
            buildCtx.dirsAdded = commitResults.dirsAdded;
            totalFilesWrote = commitResults.filesWritten.length;
            if (buildCtx.isActiveBuild) {
                // successful write
                // kick off writing the cached file stuff
                yield compilerCtx.cache.commit();
                buildCtx.debug(`in-memory-fs: ${compilerCtx.fs.getMemoryStats()}`);
                buildCtx.debug(`cache: ${compilerCtx.cache.getMemoryStats()}`);
            }
            else {
                buildCtx.debug(`commit cache aborted, not active build`);
            }
        }
        catch (e) {
            catchError(buildCtx.diagnostics, e);
        }
        timeSpan.finish(`writeBuildFiles finished, files wrote: ${totalFilesWrote}`);
        if (distributionPromise != null) {
            // build didn't need to wait on this finishing
            // let it just do its thing and finish when it gets to it
            distributionPromise.then(() => {
                compilerCtx.fs.commit();
                compilerCtx.cache.commit();
            });
        }
    });
}

function build(config, compilerCtx, buildCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // ensure any existing worker tasks are not running
            // and we've got a clean slate
            config.sys.cancelWorkerTasks();
            if (!config.devServer || !config.flags.serve) {
                // create an initial index.html file if one doesn't already exist
                yield initIndexHtmls(config, compilerCtx, buildCtx);
                if (buildCtx.hasError || !buildCtx.isActiveBuild)
                    return buildCtx.abort();
            }
            // empty the directories on the first build
            yield emptyOutputTargetDirs(config, compilerCtx, buildCtx);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // async scan the src directory for ts files
            // then transpile them all in one go
            yield transpileApp(config, compilerCtx, buildCtx);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // initialize all the collections we found when transpiling
            // async copy collection files and upgrade collections as needed
            yield initCollections(config, compilerCtx, buildCtx);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // we've got the compiler context filled with app modules and collection dependency modules
            // figure out how all these components should be connected
            const entryModules = generateEntryModules(config, compilerCtx, buildCtx);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // start copy tasks from the config.copy and component assets
            // but don't wait right now (running in worker)
            const copyTaskPromise = copyTasksMain(config, compilerCtx, buildCtx, entryModules);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // bundle js modules and create each of the components's styles
            // these can run in parallel
            const [rawModules] = yield Promise.all([
                generateModuleMap(config, compilerCtx, buildCtx, entryModules),
                generateStyles(config, compilerCtx, buildCtx, entryModules)
            ]);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // both styles and modules are done bundling
            // inject the styles into the modules and
            // generate each of the output bundles
            const cmpRegistry = yield generateBundles(config, compilerCtx, buildCtx, entryModules, rawModules);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // generate the app files, such as app.js, app.core.js
            yield generateAppFiles(config, compilerCtx, buildCtx, entryModules, cmpRegistry);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // build index file and service worker
            yield generateIndexHtmls(config, compilerCtx, buildCtx);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            if (buildCtx.isActiveBuild) {
                // await on the validate types build to finish
                // do this before we attempt to write build files
                yield buildCtx.validateTypesBuild();
                // we started the copy tasks long ago
                // i'm sure it's done by now, but let's double check
                // make sure this finishes before the write build files
                // so they're not stepping on each other writing files
                yield copyTaskPromise;
                if (buildCtx.hasError || !buildCtx.isActiveBuild)
                    return buildCtx.abort();
            }
            // write all the files and copy asset files
            yield writeBuildFiles(config, compilerCtx, buildCtx);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
            // await on our other optional stuff like docs, service workers, etc.
            yield buildAuxiliaries(config, compilerCtx, buildCtx, entryModules, cmpRegistry);
            if (buildCtx.hasError || !buildCtx.isActiveBuild)
                return buildCtx.abort();
        }
        catch (e) {
            // ¯\_(ツ)_/¯
            catchError(buildCtx.diagnostics, e);
        }
        // return what we've learned today
        return buildCtx.finish();
    });
}

function configFileReload(config, compilerCtx) {
    try {
        const updatedConfig = config.sys.loadConfigFile(config.configPath);
        configReload(config, updatedConfig);
        // reset the compiler context cache
        resetCompilerCtx(compilerCtx);
    }
    catch (e) {
        config.logger.error(e);
    }
}
function configReload(config, updatedConfig) {
    const keepers = {};
    // empty it out cuz we're gonna use the same object
    // but don't remove our keepers, we still need them
    for (const key in config) {
        if (CONFIG_RELOAD_KEEPER_KEYS.includes(key)) {
            keepers[key] = config[key];
        }
        else {
            delete config[key];
        }
    }
    // fill it up with the newly loaded config
    // but don't touch our "keepers"
    for (const key in updatedConfig) {
        if (!CONFIG_RELOAD_KEEPER_KEYS.includes(key)) {
            config[key] = updatedConfig[key];
        }
    }
    config._isValidated = false;
    // validate our new config data
    validateConfig(config);
    // ensure we're using the correct original config data
    for (const key in keepers) {
        config[key] = keepers[key];
    }
}
// stuff that should be constant between config updates
// implementing the Config interface to make sure we're
// using the correct keys, but the value doesn't matter here
const CONFIG_RELOAD_KEEPERS = {
    flags: null,
    sys: null,
    logger: null,
    cwd: null,
    rootDir: null,
    watch: null
};
const CONFIG_RELOAD_KEEPER_KEYS = Object.keys(CONFIG_RELOAD_KEEPERS);

function generateBuildFromFsWatch(config, compilerCtx, fsWatchResults) {
    const buildCtx = new BuildContext(config, compilerCtx);
    // copy watch results over to build ctx data
    buildCtx.filesUpdated.push(...fsWatchResults.filesUpdated);
    buildCtx.filesAdded.push(...fsWatchResults.filesAdded);
    buildCtx.filesDeleted.push(...fsWatchResults.filesDeleted);
    buildCtx.dirsDeleted.push(...fsWatchResults.dirsDeleted);
    buildCtx.dirsAdded.push(...fsWatchResults.dirsAdded);
    // recursively drill down through any directories added and fill up more data
    buildCtx.dirsAdded.forEach(dirAdded => {
        addDir(config, compilerCtx, buildCtx, dirAdded);
    });
    // files changed include updated, added and deleted
    buildCtx.filesChanged = filesChanged(buildCtx);
    // see if any of the changed files/directories are copy tasks
    buildCtx.hasCopyChanges = hasCopyChanges(config, buildCtx);
    // see if we should rebuild or not
    if (!shouldRebuild(buildCtx)) {
        // nothing actually changed!!!
        if (compilerCtx.events) {
            compilerCtx.events.emit('buildNoChange', { noChange: true });
        }
        return null;
    }
    // collect all the scripts that were added/deleted
    buildCtx.scriptsAdded = scriptsAdded(config, buildCtx);
    buildCtx.scriptsDeleted = scriptsDeleted(config, buildCtx);
    buildCtx.hasScriptChanges = hasScriptChanges(buildCtx);
    // collect all the styles that were added/deleted
    buildCtx.hasStyleChanges = hasStyleChanges(buildCtx);
    // figure out if any changed files were index.html files
    buildCtx.hasIndexHtmlChanges = hasIndexHtmlChanges(config, buildCtx);
    buildCtx.hasServiceWorkerChanges = hasServiceWorkerChanges(config, buildCtx);
    // we've got watch results, which means this is a rebuild!!
    buildCtx.isRebuild = true;
    // always require a full rebuild if we've never had a successful build
    buildCtx.requiresFullBuild = !compilerCtx.hasSuccessfulBuild;
    // figure out if one of the changed files is the config
    checkForConfigUpdates(config, compilerCtx, buildCtx);
    // return our new build context that'll be used for the next build
    return buildCtx;
}
function addDir(config, compilerCtx, buildCtx, dir) {
    dir = normalizePath(dir);
    if (!buildCtx.dirsAdded.includes(dir)) {
        buildCtx.dirsAdded.push(dir);
    }
    const items = compilerCtx.fs.disk.readdirSync(dir);
    items.forEach(dirItem => {
        const itemPath = pathJoin(config, dir, dirItem);
        const stat = compilerCtx.fs.disk.statSync(itemPath);
        if (stat.isDirectory()) {
            addDir(config, compilerCtx, buildCtx, itemPath);
        }
        else if (stat.isFile()) {
            if (!buildCtx.filesAdded.includes(itemPath)) {
                buildCtx.filesAdded.push(itemPath);
            }
        }
    });
}
function filesChanged(buildCtx) {
    // files changed include updated, added and deleted
    return buildCtx.filesUpdated.concat(buildCtx.filesAdded, buildCtx.filesDeleted).reduce((filesChanged, filePath) => {
        if (!filesChanged.includes(filePath)) {
            filesChanged.push(filePath);
        }
        return filesChanged;
    }, []).sort();
}
function hasCopyChanges(config, buildCtx) {
    return buildCtx.filesUpdated.some(f => isCopyTaskFile(config, f)) ||
        buildCtx.filesAdded.some(f => isCopyTaskFile(config, f)) ||
        buildCtx.dirsAdded.some(f => isCopyTaskFile(config, f));
}
function shouldRebuild(buildCtx) {
    return buildCtx.hasCopyChanges ||
        buildCtx.dirsAdded.length > 0 ||
        buildCtx.dirsDeleted.length > 0 ||
        buildCtx.filesAdded.length > 0 ||
        buildCtx.filesDeleted.length > 0 ||
        buildCtx.filesUpdated.length > 0;
}
function scriptsAdded(config, buildCtx) {
    // collect all the scripts that were added
    return buildCtx.filesAdded.filter(f => {
        return SCRIPT_EXT$1.some(ext => f.endsWith(ext.toLowerCase()));
    }).map(f => config.sys.path.basename(f));
}
function scriptsDeleted(config, buildCtx) {
    // collect all the scripts that were deleted
    return buildCtx.filesDeleted.filter(f => {
        return SCRIPT_EXT$1.some(ext => f.endsWith(ext.toLowerCase()));
    }).map(f => config.sys.path.basename(f));
}
function hasScriptChanges(buildCtx) {
    return buildCtx.filesChanged.some(f => {
        const ext = getExt(f);
        return SCRIPT_EXT$1.includes(ext);
    });
}
function hasStyleChanges(buildCtx) {
    return buildCtx.filesChanged.some(f => {
        const ext = getExt(f);
        return STYLE_EXT$1.includes(ext);
    });
}
function getExt(filePath) {
    return filePath.split('.').pop().toLowerCase();
}
const SCRIPT_EXT$1 = ['ts', 'tsx', 'js', 'jsx'];
const STYLE_EXT$1 = ['css', 'scss', 'sass', 'pcss', 'styl', 'stylus', 'less'];
function hasIndexHtmlChanges(config, buildCtx) {
    const anyIndexHtmlChanged = buildCtx.filesChanged.some(fileChanged => config.sys.path.basename(fileChanged).toLowerCase() === 'index.html');
    if (anyIndexHtmlChanged) {
        // any index.html in any directory that changes counts too
        return true;
    }
    const srcIndexHtmlChanged = buildCtx.filesChanged.some(fileChanged => {
        // the src index index.html file has changed
        // this file name could be something other than index.html
        return fileChanged === config.srcIndexHtml;
    });
    return srcIndexHtmlChanged;
}
function checkForConfigUpdates(config, compilerCtx, buildCtx) {
    // figure out if one of the changed files is the config
    if (buildCtx.filesChanged.some(f => f === config.configPath)) {
        buildCtx.debug(`reload config file: ${config.sys.path.relative(config.rootDir, config.configPath)}`);
        configFileReload(config, compilerCtx);
        buildCtx.requiresFullBuild = true;
    }
}
function updateCacheFromRebuild(compilerCtx, buildCtx) {
    buildCtx.filesChanged.forEach(filePath => {
        compilerCtx.fs.clearFileCache(filePath);
    });
    buildCtx.dirsAdded.forEach(dirAdded => {
        compilerCtx.fs.clearDirCache(dirAdded);
    });
    buildCtx.dirsDeleted.forEach(dirDeleted => {
        compilerCtx.fs.clearDirCache(dirDeleted);
    });
}

function logFsWatchMessage(config, buildCtx) {
    const msg = getMessage(config, buildCtx);
    if (msg.length > 0) {
        config.logger.info(config.logger.cyan(msg.join(', ')));
    }
}
function getMessage(config, buildCtx) {
    const msgs = [];
    const filesChanged = buildCtx.filesChanged;
    if (filesChanged.length > MAX_FILE_PRINT) {
        const trimmedChangedFiles = filesChanged.slice(0, MAX_FILE_PRINT - 1);
        const otherFilesTotal = filesChanged.length - trimmedChangedFiles.length;
        let msg = `changed files: ${getBaseName(config, trimmedChangedFiles)}`;
        if (otherFilesTotal > 0) {
            msg += `, +${otherFilesTotal} other${otherFilesTotal > 1 ? 's' : ''}`;
        }
        msgs.push(msg);
    }
    else if (filesChanged.length > 1) {
        msgs.push(`changed files: ${getBaseName(config, filesChanged)}`);
    }
    else if (filesChanged.length > 0) {
        msgs.push(`changed file: ${getBaseName(config, filesChanged)}`);
    }
    if (buildCtx.dirsAdded.length > 1) {
        msgs.push(`added directories: ${getBaseName(config, buildCtx.dirsAdded)}`);
    }
    else if (buildCtx.dirsAdded.length > 0) {
        msgs.push(`added directory: ${getBaseName(config, buildCtx.dirsAdded)}`);
    }
    if (buildCtx.dirsDeleted.length > 1) {
        msgs.push(`deleted directories: ${getBaseName(config, buildCtx.dirsDeleted)}`);
    }
    else if (buildCtx.dirsDeleted.length > 0) {
        msgs.push(`deleted directory: ${getBaseName(config, buildCtx.dirsDeleted)}`);
    }
    return msgs;
}
function getBaseName(config, items) {
    return items.map(f => config.sys.path.basename(f)).join(', ');
}
const MAX_FILE_PRINT = 5;

function sendMsg(process, msg) {
    process.send(msg);
}

/**
 * NODE ONLY!
 * NOTE! this method is still apart of the main bundle
 * it is not apart of the dev-server/index.js bundle
 */
function startDevServerMain(config, compilerCtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const fork = require('child_process').fork;
        // using the path stuff below because after the the bundles are created
        // then these files are no longer relative to how they are in the src directory
        config.devServer.devServerDir = config.sys.path.join(__dirname, '..', 'dev-server');
        // get the path of the dev server module
        const program = require.resolve(config.sys.path.join(config.devServer.devServerDir, 'index.js'));
        const args = [];
        const filteredExecArgs = process.execArgv.filter(v => !/^--(debug|inspect)/.test(v));
        const options = {
            execArgv: filteredExecArgs,
            env: process.env,
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        };
        // start a new child process of the CLI process
        // for the http and web socket server
        const serverProcess = fork(program, args, options);
        const devServerConfig = yield startServer(config, compilerCtx, serverProcess);
        const devServer = {
            browserUrl: devServerConfig.browserUrl,
            close: () => {
                try {
                    serverProcess.kill('SIGINT');
                    config.logger.debug(`dev server closed`);
                }
                catch (e) { }
                return Promise.resolve();
            }
        };
        return devServer;
    });
}
function startServer(config, compilerCtx, serverProcess) {
    return new Promise((resolve, reject) => {
        serverProcess.stdout.on('data', (data) => {
            // the child server process has console logged data
            config.logger.debug(`dev server: ${data}`);
        });
        serverProcess.stderr.on('data', (data) => {
            // the child server process has console logged an error
            reject(`dev server error: ${data}`);
        });
        serverProcess.on('message', (msg) => {
            // main process has received a message from the child server process
            mainReceivedMessageFromWorker(config, compilerCtx, serverProcess, msg, resolve);
        });
        compilerCtx.events.subscribe('buildFinish', buildResults => {
            // a compiler build has finished
            // send the build results to the child server process
            const msg = {
                buildResults: Object.assign({}, buildResults)
            };
            delete msg.buildResults.entries;
            delete msg.buildResults.components;
            sendMsg(serverProcess, msg);
        });
        compilerCtx.events.subscribe('buildLog', buildLog => {
            const msg = {
                buildLog: Object.assign({}, buildLog)
            };
            sendMsg(serverProcess, msg);
        });
        // have the main process send a message to the child server process
        // to start the http and web socket server
        sendMsg(serverProcess, {
            startServer: config.devServer
        });
        return config.devServer;
    });
}
function mainReceivedMessageFromWorker(config, compilerCtx, serverProcess, msg, resolve) {
    if (msg.serverStated) {
        // received a message from the child process that the server has successfully started
        if (config.devServer.openBrowser && msg.serverStated.initialLoadUrl) {
            config.sys.open(msg.serverStated.initialLoadUrl);
        }
        // resolve that everything is good to go
        resolve(msg.serverStated);
        return;
    }
    if (msg.requestBuildResults) {
        // we received a request to send up the latest build results
        if (compilerCtx.lastBuildResults) {
            // we do have build results, so let's send them to the child process
            // but don't send any previous live reload data
            const msg = {
                buildResults: Object.assign({}, compilerCtx.lastBuildResults),
                isActivelyBuilding: compilerCtx.isActivelyBuilding
            };
            delete msg.buildResults.hmr;
            delete msg.buildResults.entries;
            delete msg.buildResults.components;
            serverProcess.send(msg);
        }
        else {
            const msg = {
                isActivelyBuilding: compilerCtx.isActivelyBuilding
            };
            serverProcess.send(msg);
        }
        return;
    }
    if (msg.error) {
        // received a message from the child process that is an error
        config.logger.error(msg.error.message);
        config.logger.debug(msg.error);
        return;
    }
}

class Compiler {
    constructor(rawConfig) {
        [this.isValid, this.config] = isValid(rawConfig);
        const config = this.config;
        if (this.isValid) {
            const details = config.sys.details;
            let startupMsg = `${config.sys.compiler.name} v${config.sys.compiler.version} `;
            if (details.platform !== 'win32') {
                startupMsg += `💎`;
            }
            config.logger.info(config.logger.cyan(startupMsg));
            if (config.sys.semver.prerelease(config.sys.compiler.version)) {
                config.logger.warn(config.sys.color.yellow(`This is a prerelease build, undocumented changes might happen at any time. Technical support is not available for prereleases, but any assistance testing is appreciated.`));
            }
            if (config.devMode && config.buildEs5) {
                config.logger.warn(`Generating ES5 during development is a very task expensive, initial and incremental builds will be much slower. Drop the '--es5' flag and use a modern browser for development.
        If you need ESM output, use the '--esm' flag instead.`);
            }
            if (config.devMode && !config.enableCache) {
                config.logger.warn(`Disabling cache during development will slow down incremental builds.`);
            }
            config.logger.debug(`${details.platform}, ${details.cpuModel}, cpus: ${details.cpus}`);
            config.logger.debug(`${details.runtime} ${details.runtimeVersion}`);
            config.logger.debug(`compiler runtime: ${config.sys.compiler.runtime}`);
            config.logger.debug(`compiler build: 190031134759`);
            const workerOpts = config.sys.initWorkers(config.maxConcurrentWorkers, config.maxConcurrentTasksPerWorker);
            config.logger.debug(`compiler workers: ${workerOpts.maxConcurrentWorkers}, tasks per worker: ${workerOpts.maxConcurrentTasksPerWorker}`);
            config.logger.debug(`minifyJs: ${config.minifyJs}, minifyCss: ${config.minifyCss}, buildEs5: ${config.buildEs5}`);
            this.ctx = getCompilerCtx(config);
            this.on('fsChange', fsWatchResults => {
                this.rebuild(fsWatchResults);
            });
        }
    }
    build() {
        const buildCtx = new BuildContext(this.config, this.ctx);
        buildCtx.start();
        return build(this.config, this.ctx, buildCtx);
    }
    rebuild(fsWatchResults) {
        const buildCtx = generateBuildFromFsWatch(this.config, this.ctx, fsWatchResults);
        if (buildCtx) {
            logFsWatchMessage(this.config, buildCtx);
            buildCtx.start();
            updateCacheFromRebuild(this.ctx, buildCtx);
            build(this.config, this.ctx, buildCtx);
        }
    }
    startDevServer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.sys.details.runtime !== 'node') {
                throw new Error(`Dev Server only availabe in node`);
            }
            // start up the dev server
            const devServer = yield startDevServerMain(this.config, this.ctx);
            if (devServer) {
                // get the browser url to be logged out at the end of the build
                this.config.devServer.browserUrl = devServer.browserUrl;
                this.config.logger.debug(`dev server started: ${devServer.browserUrl}`);
            }
            return devServer;
        });
    }
    on(eventName, cb) {
        return this.ctx.events.subscribe(eventName, cb);
    }
    once(eventName) {
        return new Promise(resolve => {
            const off = this.ctx.events.subscribe(eventName, (...args) => {
                off();
                resolve.apply(this, args);
            });
        });
    }
    off(eventName, cb) {
        this.ctx.events.unsubscribe(eventName, cb);
    }
    trigger(eventName, ...args) {
        args.unshift(eventName);
        this.ctx.events.emit.apply(this.ctx.events, args);
    }
    docs() {
        return docs(this.config, this.ctx);
    }
    get fs() {
        return this.ctx.fs;
    }
    get name() {
        return this.config.sys.compiler.name;
    }
    get version() {
        return this.config.sys.compiler.version;
    }
}
function isValid(config) {
    try {
        // validate the build config
        validateConfig(config, true);
        return [true, config];
    }
    catch (e) {
        if (config.logger) {
            const diagnostics = [];
            catchError(diagnostics, e);
            config.logger.printDiagnostics(diagnostics);
        }
        else {
            console.error(e);
        }
        return [false, null];
    }
}

exports.Compiler = Compiler;
