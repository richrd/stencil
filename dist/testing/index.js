'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vm = _interopDefault(require('vm'));
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');
var fs__default = _interopDefault(fs);
var assert = _interopDefault(require('assert'));
var console$1 = _interopDefault(require('console'));
var util = _interopDefault(require('util'));
var os = _interopDefault(require('os'));
var constants = _interopDefault(require('constants'));
var stream = _interopDefault(require('stream'));
var crypto = require('crypto');
var crypto__default = _interopDefault(crypto);
var process$1 = _interopDefault(require('process'));
var ts = _interopDefault(require('typescript'));
var mockDoc = require('../mock-doc');
var child_process = require('child_process');

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

function startPuppeteerBrowser(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.flags.e2e) {
            return null;
        }
        const env = process.env;
        const puppeteerModulePath = config.sys.lazyRequire.getModulePath('puppeteer');
        const puppeteer = require(puppeteerModulePath);
        env.__STENCIL_PUPPETEER_MODULE__ = puppeteerModulePath;
        config.logger.debug(`puppeteer: ${puppeteerModulePath}`);
        config.logger.debug(`puppeteer headless: ${config.testing.browserHeadless}`);
        if (Array.isArray(config.testing.browserArgs)) {
            config.logger.debug(`puppeteer args: ${config.testing.browserArgs.join(' ')}`);
        }
        if (typeof config.testing.browserSlowMo === 'number') {
            config.logger.debug(`puppeteer slowMo: ${config.testing.browserSlowMo}`);
        }
        const launchOpts = {
            ignoreHTTPSErrors: true,
            args: config.testing.browserArgs,
            headless: config.testing.browserHeadless,
            slowMo: config.testing.browserSlowMo
        };
        if (config.testing.browserExecutablePath) {
            launchOpts.executablePath = config.testing.browserExecutablePath;
        }
        let browser;
        if (config.testing.browserWSEndpoint) {
            let connectOpts = launchOpts;
            connectOpts.browserWSEndpoint = config.testing.browserWSEndpoint;
            browser = yield puppeteer.connect(connectOpts);
        }
        else {
            browser = yield puppeteer.launch(launchOpts);
        }
        env.__STENCIL_BROWSER_WS_ENDPOINT__ = browser.wsEndpoint();
        config.logger.debug(`puppeteer browser wsEndpoint: ${env.__STENCIL_BROWSER_WS_ENDPOINT__}`);
        return browser;
    });
}
function connectBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        // the reason we're connecting to the browser from
        // a web socket is because jest probably has us
        // in a different thread, this is also why this
        // uses process.env for data
        const env = process.env;
        const wsEndpoint = env.__STENCIL_BROWSER_WS_ENDPOINT__;
        if (!wsEndpoint) {
            return null;
        }
        const connectOpts = {
            browserWSEndpoint: wsEndpoint,
            ignoreHTTPSErrors: true
        };
        const puppeteer = require(env.__STENCIL_PUPPETEER_MODULE__);
        return yield puppeteer.connect(connectOpts);
    });
}
function disconnectBrowser(browser, pages) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(pages)) {
            yield Promise.all(pages.map(closePage));
            pages.length = 0;
        }
        if (browser) {
            try {
                browser.disconnect();
            }
            catch (e) { }
        }
    });
}
function newBrowserPage(browser) {
    return browser.newPage();
}
function closePage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (Array.isArray(page._e2eElements)) {
                const disposes = page._e2eElements.map((elmHande) => __awaiter(this, void 0, void 0, function* () {
                    if (typeof elmHande.e2eDispose === 'function') {
                        yield elmHande.e2eDispose();
                    }
                }));
                yield Promise.all(disposes);
            }
        }
        catch (e) { }
        page._e2eElements = null;
        page._e2eEvents = null;
        page._e2eGoto = null;
        page.find = null;
        page.findAll = null;
        page.compareScreenshot = null;
        page.setContent = null;
        page.spyOnEvent = null;
        page.waitForChanges = null;
        page.waitForEvent = null;
        try {
            if (!page.isClosed()) {
                yield page.close();
            }
        }
        catch (e) { }
    });
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n.default || n;
}

var _0777 = parseInt('0777', 8);

var mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs__default;
    
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    
    var cb = f || function () {};
    p = path__default.resolve(p);
    
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path__default.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made);
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs__default;
    
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    p = path__default.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path__default.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var escapeStringRegexp = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

var colorName = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

var conversions = createCommonjsModule(function (module) {
/* MIT license */


// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in colorName) {
	if (colorName.hasOwnProperty(key)) {
		reverseKeywords[colorName[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var rdif;
	var gdif;
	var bdif;
	var h;
	var s;

	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);
	var diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in colorName) {
		if (colorName.hasOwnProperty(keyword)) {
			var value = colorName[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return colorName[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};
});
var conversions_1 = conversions.rgb;
var conversions_2 = conversions.hsl;
var conversions_3 = conversions.hsv;
var conversions_4 = conversions.hwb;
var conversions_5 = conversions.cmyk;
var conversions_6 = conversions.xyz;
var conversions_7 = conversions.lab;
var conversions_8 = conversions.lch;
var conversions_9 = conversions.hex;
var conversions_10 = conversions.keyword;
var conversions_11 = conversions.ansi16;
var conversions_12 = conversions.ansi256;
var conversions_13 = conversions.hcg;
var conversions_14 = conversions.apple;
var conversions_15 = conversions.gray;

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path$$1 = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path$$1.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path$$1;
	return fn;
}

var route = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

var colorConvert = convert;

var ansiStyles = createCommonjsModule(function (module) {


const wrapAnsi16 = (fn, offset) => function () {
	const code = fn.apply(colorConvert, arguments);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => function () {
	const code = fn.apply(colorConvert, arguments);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => function () {
	const rgb = fn.apply(colorConvert, arguments);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39],

			// Bright color
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Fix humans
	styles.color.grey = styles.color.gray;

	for (const groupName of Object.keys(styles)) {
		const group = styles[groupName];

		for (const styleName of Object.keys(group)) {
			const style = group[styleName];

			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});

		Object.defineProperty(styles, 'codes', {
			value: codes,
			enumerable: false
		});
	}

	const ansi2ansi = n => n;
	const rgb2rgb = (r, g, b) => [r, g, b];

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = {
		ansi: wrapAnsi16(ansi2ansi, 0)
	};
	styles.color.ansi256 = {
		ansi256: wrapAnsi256(ansi2ansi, 0)
	};
	styles.color.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 0)
	};

	styles.bgColor.ansi = {
		ansi: wrapAnsi16(ansi2ansi, 10)
	};
	styles.bgColor.ansi256 = {
		ansi256: wrapAnsi256(ansi2ansi, 10)
	};
	styles.bgColor.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 10)
	};

	for (let key of Object.keys(colorConvert)) {
		if (typeof colorConvert[key] !== 'object') {
			continue;
		}

		const suite = colorConvert[key];

		if (key === 'ansi16') {
			key = 'ansi';
		}

		if ('ansi16' in suite) {
			styles.color.ansi[key] = wrapAnsi16(suite.ansi16, 0);
			styles.bgColor.ansi[key] = wrapAnsi16(suite.ansi16, 10);
		}

		if ('ansi256' in suite) {
			styles.color.ansi256[key] = wrapAnsi256(suite.ansi256, 0);
			styles.bgColor.ansi256[key] = wrapAnsi256(suite.ansi256, 10);
		}

		if ('rgb' in suite) {
			styles.color.ansi16m[key] = wrapAnsi16m(suite.rgb, 0);
			styles.bgColor.ansi16m[key] = wrapAnsi16m(suite.rgb, 10);
		}
	}

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
});

var hasFlag = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream$$1) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream$$1 && !stream$$1.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream$$1) {
	const level = supportsColor(stream$$1);
	return translateLevel(level);
}

var supportsColor_1 = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};

const TEMPLATE_REGEX = /(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	if ((c[0] === 'u' && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, args) {
	const results = [];
	const chunks = args.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		if (!isNaN(chunk)) {
			results.push(Number(chunk));
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, chr) => escape ? unescape(escape) : chr));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const styleName of Object.keys(enabled)) {
		if (Array.isArray(enabled[styleName])) {
			if (!(styleName in current)) {
				throw new Error(`Unknown Chalk style: ${styleName}`);
			}

			if (enabled[styleName].length > 0) {
				current = current[styleName].apply(current, enabled[styleName]);
			} else {
				current = current[styleName];
			}
		}
	}

	return current;
}

var templates = (chalk, tmp) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	tmp.replace(TEMPLATE_REGEX, (m, escapeChar, inverse, style, close, chr) => {
		if (escapeChar) {
			chunk.push(unescape(escapeChar));
		} else if (style) {
			const str = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? str : buildStyle(chalk, styles)(str));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(chr);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMsg = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMsg);
	}

	return chunks.join('');
};

var chalk = createCommonjsModule(function (module) {


const stdoutColor = supportsColor_1.stdout;



const isSimpleWindowsTerm = process.platform === 'win32' && !(process.env.TERM || '').toLowerCase().startsWith('xterm');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = ['ansi', 'ansi', 'ansi256', 'ansi16m'];

// `color-convert` models to exclude from the Chalk API due to conflicts and such
const skipModels = new Set(['gray']);

const styles = Object.create(null);

function applyOptions(obj, options) {
	options = options || {};

	// Detect level if not set manually
	const scLevel = stdoutColor ? stdoutColor.level : 0;
	obj.level = options.level === undefined ? scLevel : options.level;
	obj.enabled = 'enabled' in options ? options.enabled : obj.level > 0;
}

function Chalk(options) {
	// We check for this.template here since calling `chalk.constructor()`
	// by itself will have a `this` of a previously constructed chalk object
	if (!this || !(this instanceof Chalk) || this.template) {
		const chalk = {};
		applyOptions(chalk, options);

		chalk.template = function () {
			const args = [].slice.call(arguments);
			return chalkTag.apply(null, [chalk.template].concat(args));
		};

		Object.setPrototypeOf(chalk, Chalk.prototype);
		Object.setPrototypeOf(chalk.template, chalk);

		chalk.template.constructor = Chalk;

		return chalk.template;
	}

	applyOptions(this, options);
}

// Use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001B[94m';
}

for (const key of Object.keys(ansiStyles)) {
	ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

	styles[key] = {
		get() {
			const codes = ansiStyles[key];
			return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, key);
		}
	};
}

styles.visible = {
	get() {
		return build.call(this, this._styles || [], true, 'visible');
	}
};

ansiStyles.color.closeRe = new RegExp(escapeStringRegexp(ansiStyles.color.close), 'g');
for (const model of Object.keys(ansiStyles.color.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	styles[model] = {
		get() {
			const level = this.level;
			return function () {
				const open = ansiStyles.color[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: ansiStyles.color.close,
					closeRe: ansiStyles.color.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
			};
		}
	};
}

ansiStyles.bgColor.closeRe = new RegExp(escapeStringRegexp(ansiStyles.bgColor.close), 'g');
for (const model of Object.keys(ansiStyles.bgColor.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const level = this.level;
			return function () {
				const open = ansiStyles.bgColor[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: ansiStyles.bgColor.close,
					closeRe: ansiStyles.bgColor.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, styles);

function build(_styles, _empty, key) {
	const builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder._empty = _empty;

	const self = this;

	Object.defineProperty(builder, 'level', {
		enumerable: true,
		get() {
			return self.level;
		},
		set(level) {
			self.level = level;
		}
	});

	Object.defineProperty(builder, 'enabled', {
		enumerable: true,
		get() {
			return self.enabled;
		},
		set(enabled) {
			self.enabled = enabled;
		}
	});

	// See below for fix regarding invisible grey/dim combination on Windows
	builder.hasGrey = this.hasGrey || key === 'gray' || key === 'grey';

	// `__proto__` is used because we must return a function, but there is
	// no way to create a function with a different prototype
	builder.__proto__ = proto; // eslint-disable-line no-proto

	return builder;
}

function applyStyle() {
	// Support varags, but simply cast to string in case there's only one arg
	const args = arguments;
	const argsLen = args.length;
	let str = String(arguments[0]);

	if (argsLen === 0) {
		return '';
	}

	if (argsLen > 1) {
		// Don't slice `arguments`, it prevents V8 optimizations
		for (let a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || this.level <= 0 || !str) {
		return this._empty ? '' : str;
	}

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	const originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && this.hasGrey) {
		ansiStyles.dim.open = '';
	}

	for (const code of this._styles.slice().reverse()) {
		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;

		// Close the styling before a linebreak and reopen
		// after next line to fix a bleed issue on macOS
		// https://github.com/chalk/chalk/pull/92
		str = str.replace(/\r?\n/g, `${code.close}$&${code.open}`);
	}

	// Reset the original `dim` if we changed it to work around the Windows dimmed gray issue
	ansiStyles.dim.open = originalDim;

	return str;
}

function chalkTag(chalk, strings) {
	if (!Array.isArray(strings)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return [].slice.call(arguments, 1).join(' ');
	}

	const args = [].slice.call(arguments, 2);
	const parts = [strings.raw[0]];

	for (let i = 1; i < strings.length; i++) {
		parts.push(String(args[i - 1]).replace(/[{}\\]/g, '\\$&'));
		parts.push(String(strings.raw[i]));
	}

	return templates(chalk, parts.join(''));
}

Object.defineProperties(Chalk.prototype, styles);

module.exports = Chalk(); // eslint-disable-line new-cap
module.exports.supportsColor = stdoutColor;
module.exports.default = module.exports; // For TypeScript
});
var chalk_1 = chalk.supportsColor;

var origCwd = process.cwd;
var cwd = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd
};
try {
  process.cwd();
} catch (er) {}

var chdir = process.chdir;
process.chdir = function(d) {
  cwd = null;
  chdir.call(process, d);
};

var polyfills = patch;

function patch (fs$$1) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs$$1);
  }

  // lutimes implementation, or no-op
  if (!fs$$1.lutimes) {
    patchLutimes(fs$$1);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs$$1.chown = chownFix(fs$$1.chown);
  fs$$1.fchown = chownFix(fs$$1.fchown);
  fs$$1.lchown = chownFix(fs$$1.lchown);

  fs$$1.chmod = chmodFix(fs$$1.chmod);
  fs$$1.fchmod = chmodFix(fs$$1.fchmod);
  fs$$1.lchmod = chmodFix(fs$$1.lchmod);

  fs$$1.chownSync = chownFixSync(fs$$1.chownSync);
  fs$$1.fchownSync = chownFixSync(fs$$1.fchownSync);
  fs$$1.lchownSync = chownFixSync(fs$$1.lchownSync);

  fs$$1.chmodSync = chmodFixSync(fs$$1.chmodSync);
  fs$$1.fchmodSync = chmodFixSync(fs$$1.fchmodSync);
  fs$$1.lchmodSync = chmodFixSync(fs$$1.lchmodSync);

  fs$$1.stat = statFix(fs$$1.stat);
  fs$$1.fstat = statFix(fs$$1.fstat);
  fs$$1.lstat = statFix(fs$$1.lstat);

  fs$$1.statSync = statFixSync(fs$$1.statSync);
  fs$$1.fstatSync = statFixSync(fs$$1.fstatSync);
  fs$$1.lstatSync = statFixSync(fs$$1.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs$$1.lchmod) {
    fs$$1.lchmod = function (path$$1, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs$$1.lchmodSync = function () {};
  }
  if (!fs$$1.lchown) {
    fs$$1.lchown = function (path$$1, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs$$1.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs$$1.rename = (function (fs$rename) { return function (from, to, cb) {
      var start = Date.now();
      var backoff = 0;
      fs$rename(from, to, function CB (er) {
        if (er
            && (er.code === "EACCES" || er.code === "EPERM")
            && Date.now() - start < 60000) {
          setTimeout(function() {
            fs$$1.stat(to, function (stater, st) {
              if (stater && stater.code === "ENOENT")
                fs$rename(from, to, CB);
              else
                cb(er);
            });
          }, backoff);
          if (backoff < 100)
            backoff += 10;
          return;
        }
        if (cb) cb(er);
      });
    }})(fs$$1.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs$$1.read = (function (fs$read) { return function (fd, buffer, offset, length, position, callback_) {
    var callback;
    if (callback_ && typeof callback_ === 'function') {
      var eagCounter = 0;
      callback = function (er, _, __) {
        if (er && er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          return fs$read.call(fs$$1, fd, buffer, offset, length, position, callback)
        }
        callback_.apply(this, arguments);
      };
    }
    return fs$read.call(fs$$1, fd, buffer, offset, length, position, callback)
  }})(fs$$1.read);

  fs$$1.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs$$1, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs$$1.readSync);

  function patchLchmod (fs$$1) {
    fs$$1.lchmod = function (path$$1, mode, callback) {
      fs$$1.open( path$$1
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err);
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs$$1.fchmod(fd, mode, function (err) {
          fs$$1.close(fd, function(err2) {
            if (callback) callback(err || err2);
          });
        });
      });
    };

    fs$$1.lchmodSync = function (path$$1, mode) {
      var fd = fs$$1.openSync(path$$1, constants.O_WRONLY | constants.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs$$1.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs$$1.closeSync(fd);
          } catch (er) {}
        } else {
          fs$$1.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs$$1) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs$$1.lutimes = function (path$$1, at, mt, cb) {
        fs$$1.open(path$$1, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er);
            return
          }
          fs$$1.futimes(fd, at, mt, function (er) {
            fs$$1.close(fd, function (er2) {
              if (cb) cb(er || er2);
            });
          });
        });
      };

      fs$$1.lutimesSync = function (path$$1, at, mt) {
        var fd = fs$$1.openSync(path$$1, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs$$1.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs$$1.closeSync(fd);
            } catch (er) {}
          } else {
            fs$$1.closeSync(fd);
          }
        }
        return ret
      };

    } else {
      fs$$1.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb); };
      fs$$1.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs$$1, target, mode, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs$$1, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs$$1, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs$$1, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, cb) {
      return orig.call(fs$$1, target, function (er, stats) {
        if (!stats) return cb.apply(this, arguments)
        if (stats.uid < 0) stats.uid += 0x100000000;
        if (stats.gid < 0) stats.gid += 0x100000000;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target) {
      var stats = orig.call(fs$$1, target);
      if (stats.uid < 0) stats.uid += 0x100000000;
      if (stats.gid < 0) stats.gid += 0x100000000;
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}

var Stream = stream.Stream;

var legacyStreams = legacy;

function legacy (fs$$1) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path$$1, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path$$1, options);

    Stream.call(this);

    var self = this;

    this.path = path$$1;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs$$1.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path$$1, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path$$1, options);

    Stream.call(this);

    this.path = path$$1;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs$$1.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone;

function clone (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: obj.__proto__ };
  else
    var copy = Object.create(null);

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var gracefulFs = createCommonjsModule(function (module) {
var queue = [];



function noop () {}

var debug = noop;
if (util.debuglog)
  debug = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  };

if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  process.on('exit', function() {
    debug(queue);
    assert.equal(queue.length, 0);
  });
}

module.exports = patch(clone_1(fs__default));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs__default.__patched) {
    module.exports = patch(fs__default);
    fs__default.__patched = true;
}

// Always patch fs.close/closeSync, because we want to
// retry() whenever a close happens *anywhere* in the program.
// This is essential when multiple graceful-fs instances are
// in play at the same time.
module.exports.close = (function (fs$close) { return function (fd, cb) {
  return fs$close.call(fs__default, fd, function (err) {
    if (!err)
      retry();

    if (typeof cb === 'function')
      cb.apply(this, arguments);
  })
}})(fs__default.close);

module.exports.closeSync = (function (fs$closeSync) { return function (fd) {
  // Note that graceful-fs also retries when fs.closeSync() fails.
  // Looks like a bug to me, although it's probably a harmless one.
  var rval = fs$closeSync.apply(fs__default, arguments);
  retry();
  return rval
}})(fs__default.closeSync);

// Only patch fs once, otherwise we'll run into a memory leak if
// graceful-fs is loaded multiple times, such as in test environments that
// reset the loaded modules between tests.
// We look for the string `graceful-fs` from the comment above. This
// way we are not adding any extra properties and it will detect if older
// versions of graceful-fs are installed.
if (!/\bgraceful-fs\b/.test(fs__default.closeSync.toString())) {
  fs__default.closeSync = module.exports.closeSync;
  fs__default.close = module.exports.close;
}

function patch (fs$$1) {
  // Everything that references the open() function needs to be in here
  polyfills(fs$$1);
  fs$$1.gracefulify = patch;
  fs$$1.FileReadStream = ReadStream;  // Legacy name.
  fs$$1.FileWriteStream = WriteStream;  // Legacy name.
  fs$$1.createReadStream = createReadStream;
  fs$$1.createWriteStream = createWriteStream;
  var fs$readFile = fs$$1.readFile;
  fs$$1.readFile = readFile;
  function readFile (path$$1, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readFile(path$$1, options, cb)

    function go$readFile (path$$1, options, cb) {
      return fs$readFile(path$$1, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path$$1, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$writeFile = fs$$1.writeFile;
  fs$$1.writeFile = writeFile;
  function writeFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$writeFile(path$$1, data, options, cb)

    function go$writeFile (path$$1, data, options, cb) {
      return fs$writeFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path$$1, data, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$appendFile = fs$$1.appendFile;
  if (fs$appendFile)
    fs$$1.appendFile = appendFile;
  function appendFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$appendFile(path$$1, data, options, cb)

    function go$appendFile (path$$1, data, options, cb) {
      return fs$appendFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path$$1, data, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$readdir = fs$$1.readdir;
  fs$$1.readdir = readdir;
  function readdir (path$$1, options, cb) {
    var args = [path$$1];
    if (typeof options !== 'function') {
      args.push(options);
    } else {
      cb = options;
    }
    args.push(go$readdir$cb);

    return go$readdir(args)

    function go$readdir$cb (err, files) {
      if (files && files.sort)
        files.sort();

      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        enqueue([go$readdir, [args]]);

      else {
        if (typeof cb === 'function')
          cb.apply(this, arguments);
        retry();
      }
    }
  }

  function go$readdir (args) {
    return fs$readdir.apply(fs$$1, args)
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacyStreams(fs$$1);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs$$1.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs$$1.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  fs$$1.ReadStream = ReadStream;
  fs$$1.WriteStream = WriteStream;

  function ReadStream (path$$1, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path$$1, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path$$1, options) {
    return new ReadStream(path$$1, options)
  }

  function createWriteStream (path$$1, options) {
    return new WriteStream(path$$1, options)
  }

  var fs$open = fs$$1.open;
  fs$$1.open = open;
  function open (path$$1, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null;

    return go$open(path$$1, flags, mode, cb)

    function go$open (path$$1, flags, mode, cb) {
      return fs$open(path$$1, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path$$1, flags, mode, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  return fs$$1
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  queue.push(elem);
}

function retry () {
  var elem = queue.shift();
  if (elem) {
    debug('RETRY', elem[0].name, elem[1]);
    elem[0].apply(null, elem[1]);
  }
}
});
var gracefulFs_1 = gracefulFs.close;
var gracefulFs_2 = gracefulFs.closeSync;

var callsites = () => {
	const _ = Error.prepareStackTrace;
	Error.prepareStackTrace = (_, stack) => stack;
	const stack = new Error().stack.slice(1);
	Error.prepareStackTrace = _;
	return stack;
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
var encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

var base64 = {
	encode: encode,
	decode: decode
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode$1 = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode$1 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var base64Vlq = {
	encode: encode$1,
	decode: decode$1
};

var util$1 = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path$$1 = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path$$1 = url.path;
  }
  var isAbsolute = exports.isAbsolute(path$$1);

  var parts = path$$1.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path$$1 = parts.join('/');

  if (path$$1 === '') {
    path$$1 = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path$$1;
    return urlGenerate(url);
  }
  return path$$1;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
});
var util_1 = util$1.getArg;
var util_2 = util$1.urlParse;
var util_3 = util$1.urlGenerate;
var util_4 = util$1.normalize;
var util_5 = util$1.join;
var util_6 = util$1.isAbsolute;
var util_7 = util$1.relative;
var util_8 = util$1.toSetString;
var util_9 = util$1.fromSetString;
var util_10 = util$1.compareByOriginalPositions;
var util_11 = util$1.compareByGeneratedPositionsDeflated;
var util_12 = util$1.compareByGeneratedPositionsInflated;
var util_13 = util$1.parseSourceMapInput;
var util_14 = util$1.computeSourceURL;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util$1.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util$1.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util$1.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet;

var arraySet = {
	ArraySet: ArraySet_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util$1.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util$1.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

var MappingList_1 = MappingList;

var mappingList = {
	MappingList: MappingList_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$1 = arraySet.ArraySet;
var MappingList$1 = mappingList.MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util$1.getArg(aArgs, 'file', null);
  this._sourceRoot = util$1.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util$1.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();
  this._mappings = new MappingList$1();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util$1.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util$1.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util$1.getArg(aArgs, 'generated');
    var original = util$1.getArg(aArgs, 'original', null);
    var source = util$1.getArg(aArgs, 'source', null);
    var name = util$1.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util$1.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util$1.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util$1.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util$1.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet$1();
    var newNames = new ArraySet$1();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util$1.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util$1.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util$1.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util$1.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = '';

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util$1.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64Vlq.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64Vlq.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64Vlq.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64Vlq.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64Vlq.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util$1.relative(aSourceRoot, source);
      }
      var key = util$1.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

var SourceMapGenerator_1 = SourceMapGenerator;

var sourceMapGenerator = {
	SourceMapGenerator: SourceMapGenerator_1
};

var binarySearch = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
});
var binarySearch_1 = binarySearch.GREATEST_LOWER_BOUND;
var binarySearch_2 = binarySearch.LEAST_UPPER_BOUND;
var binarySearch_3 = binarySearch.search;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var quickSort = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$2 = arraySet.ArraySet;

var quickSort$1 = quickSort.quickSort;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util$1.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util$1.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util$1.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util$1.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util$1.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

var SourceMapConsumer_1 = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sources = util$1.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util$1.getArg(sourceMap, 'names', []);
  var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util$1.getArg(sourceMap, 'mappings');
  var file = util$1.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util$1.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util$1.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source)
        ? util$1.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet$2.fromArray(names.map(String), true);
  this._sources = ArraySet$2.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util$1.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util$1.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet$2.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet$2.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util$1.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort$1(smc.__originalMappings, util$1.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64Vlq.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort$1(generatedMappings, util$1.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort$1(originalMappings, util$1.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util$1.compareByGeneratedPositionsDeflated,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util$1.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util$1.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util$1.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util$1.getArg(mapping, 'originalLine', null),
          column: util$1.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util$1.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util$1.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util$1.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util$1.getArg(aArgs, 'line'),
      originalColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util$1.compareByOriginalPositions,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util$1.getArg(mapping, 'generatedLine', null),
          column: util$1.getArg(mapping, 'generatedColumn', null),
          lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sections = util$1.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet$2();
  this._names = new ArraySet$2();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util$1.getArg(s, 'offset');
    var offsetLine = util$1.getArg(offset, 'line');
    var offsetColumn = util$1.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util$1.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util$1.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util$1.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort$1(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
    quickSort$1(this.__originalMappings, util$1.compareByOriginalPositions);
  };

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator$1 = sourceMapGenerator.SourceMapGenerator;


// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex] || '';
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || '';
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util$1.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util$1.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util$1.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util$1.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator$1(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

var SourceNode_1 = SourceNode;

var sourceNode = {
	SourceNode: SourceNode_1
};

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
var SourceMapGenerator$2 = sourceMapGenerator.SourceMapGenerator;
var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;
var SourceNode$1 = sourceNode.SourceNode;

var sourceMap = {
	SourceMapGenerator: SourceMapGenerator$2,
	SourceMapConsumer: SourceMapConsumer$1,
	SourceNode: SourceNode$1
};

var get_callsite = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _gracefulFs;

function _load_gracefulFs() {
  return (_gracefulFs = _interopRequireDefault(gracefulFs));
}

var _callsites;

function _load_callsites() {
  return (_callsites = _interopRequireDefault(callsites));
}

var _sourceMap;

function _load_sourceMap() {
  return (_sourceMap = sourceMap);
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

// Copied from https://github.com/rexxars/sourcemap-decorate-callsites/blob/5b9735a156964973a75dc62fd2c7f0c1975458e8/lib/index.js#L113-L158
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const addSourceMapConsumer = (callsite, consumer) => {
  const getLineNumber = callsite.getLineNumber;
  const getColumnNumber = callsite.getColumnNumber;
  let position = null;

  function getPosition() {
    if (!position) {
      position = consumer.originalPositionFor({
        column: getColumnNumber.call(callsite),
        line: getLineNumber.call(callsite)
      });
    }

    return position;
  }

  Object.defineProperties(callsite, {
    getColumnNumber: {
      value: function() {
        return getPosition().column || getColumnNumber.call(callsite);
      },

      writable: false
    },
    getLineNumber: {
      value: function() {
        return getPosition().line || getLineNumber.call(callsite);
      },

      writable: false
    }
  });
};

exports.default = (level, sourceMaps) => {
  const levelAfterThisCall = level + 1;
  const stack = (0, (_callsites || _load_callsites()).default)()[
    levelAfterThisCall
  ];
  const sourceMapFileName = sourceMaps && sourceMaps[stack.getFileName()];

  if (sourceMapFileName) {
    try {
      const sourceMap$$1 = (
        _gracefulFs || _load_gracefulFs()
      ).default.readFileSync(sourceMapFileName, 'utf8');
      addSourceMapConsumer(
        stack,
        new (_sourceMap || _load_sourceMap()).SourceMapConsumer(sourceMap$$1)
      );
    } catch (e) {
      // ignore
    }
  }

  return stack;
};
});

unwrapExports(get_callsite);

var buffered_console = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _assert;

function _load_assert() {
  return (_assert = _interopRequireDefault(assert));
}

var _console;

function _load_console() {
  return (_console = console$1);
}

var _util;

function _load_util() {
  return (_util = util);
}

var _chalk;

function _load_chalk() {
  return (_chalk = _interopRequireDefault(chalk));
}

var _get_callsite;

function _load_get_callsite() {
  return (_get_callsite = _interopRequireDefault(get_callsite));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

class BufferedConsole extends (_console || _load_console()).Console {
  constructor(getSourceMaps) {
    const buffer = [];
    super({
      write: message =>
        BufferedConsole.write(buffer, 'log', message, null, getSourceMaps())
    });
    this._getSourceMaps = getSourceMaps;
    this._buffer = buffer;
    this._counters = {};
    this._timers = {};
    this._groupDepth = 0;
  }

  static write(buffer, type, message, level, sourceMaps) {
    const callsite = (0, (_get_callsite || _load_get_callsite()).default)(
      level != null ? level : 2,
      sourceMaps
    );
    const origin = callsite.getFileName() + ':' + callsite.getLineNumber();

    buffer.push({
      message: message,
      origin: origin,
      type: type
    });

    return buffer;
  }

  _log(type, message) {
    BufferedConsole.write(
      this._buffer,
      type,
      '  '.repeat(this._groupDepth) + message,
      3,
      this._getSourceMaps()
    );
  }

  assert() {
    try {
      (_assert || _load_assert()).default.apply(undefined, arguments);
    } catch (error) {
      this._log('assert', error.toString());
    }
  }

  count() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    if (!this._counters[label]) {
      this._counters[label] = 0;
    }

    this._log(
      'count',
      (0, (_util || _load_util()).format)(
        `${label}: ${++this._counters[label]}`
      )
    );
  }

  countReset() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    this._counters[label] = 0;
  }

  debug() {
    this._log(
      'debug',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  dir() {
    this._log(
      'dir',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  dirxml() {
    this._log(
      'dirxml',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  error() {
    this._log(
      'error',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  group() {
    this._groupDepth++;

    if (arguments.length > 0) {
      this._log(
        'group',
        (_chalk || _load_chalk()).default.bold(
          (_util || _load_util()).format.apply(undefined, arguments)
        )
      );
    }
  }

  groupCollapsed() {
    this._groupDepth++;

    if (arguments.length > 0) {
      this._log(
        'groupCollapsed',
        (_chalk || _load_chalk()).default.bold(
          (_util || _load_util()).format.apply(undefined, arguments)
        )
      );
    }
  }

  groupEnd() {
    if (this._groupDepth > 0) {
      this._groupDepth--;
    }
  }

  info() {
    this._log(
      'info',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  log() {
    this._log(
      'log',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  time() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    if (this._timers[label]) {
      return;
    }

    this._timers[label] = new Date();
  }

  timeEnd() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    const startTime = this._timers[label];

    if (startTime) {
      const endTime = new Date();
      const time = endTime - startTime;
      this._log(
        'time',
        (0, (_util || _load_util()).format)(`${label}: ${time}ms`)
      );
      delete this._timers[label];
    }
  }

  warn() {
    this._log(
      'warn',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  getBuffer() {
    return this._buffer;
  }
}
exports.default = BufferedConsole;
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
});

unwrapExports(buffered_console);

var clear_line = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
/* global stream$Writable */

exports.default = stream$$1 => {
  if (process.stdout.isTTY) {
    stream$$1.write('\x1b[999D\x1b[K');
  }
};
});

unwrapExports(clear_line);

var Console = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _assert;

function _load_assert() {
  return (_assert = _interopRequireDefault(assert));
}

var _util;

function _load_util() {
  return (_util = util);
}

var _console;

function _load_console() {
  return (_console = console$1);
}

var _chalk;

function _load_chalk() {
  return (_chalk = _interopRequireDefault(chalk));
}

var _clear_line;

function _load_clear_line() {
  return (_clear_line = _interopRequireDefault(clear_line));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
/* global stream$Writable */

class CustomConsole extends (_console || _load_console()).Console {
  constructor(stdout, stderr, formatBuffer) {
    super(stdout, stderr);
    this._formatBuffer = formatBuffer || ((type, message) => message);
    this._counters = {};
    this._timers = {};
    this._groupDepth = 0;
  }

  _logToParentConsole(message) {
    super.log(message);
  }

  _log(type, message) {
    (0, (_clear_line || _load_clear_line()).default)(this._stdout);
    this._logToParentConsole(
      this._formatBuffer(type, '  '.repeat(this._groupDepth) + message)
    );
  }

  assert() {
    try {
      (_assert || _load_assert()).default.apply(undefined, arguments);
    } catch (error) {
      this._log('assert', error.toString());
    }
  }

  count() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    if (!this._counters[label]) {
      this._counters[label] = 0;
    }

    this._log(
      'count',
      (0, (_util || _load_util()).format)(
        `${label}: ${++this._counters[label]}`
      )
    );
  }

  countReset() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    this._counters[label] = 0;
  }

  debug() {
    this._log(
      'debug',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  dir() {
    this._log(
      'dir',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  dirxml() {
    this._log(
      'dirxml',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  error() {
    this._log(
      'error',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  group() {
    this._groupDepth++;

    if (arguments.length > 0) {
      this._log(
        'group',
        (_chalk || _load_chalk()).default.bold(
          (_util || _load_util()).format.apply(undefined, arguments)
        )
      );
    }
  }

  groupCollapsed() {
    this._groupDepth++;

    if (arguments.length > 0) {
      this._log(
        'groupCollapsed',
        (_chalk || _load_chalk()).default.bold(
          (_util || _load_util()).format.apply(undefined, arguments)
        )
      );
    }
  }

  groupEnd() {
    if (this._groupDepth > 0) {
      this._groupDepth--;
    }
  }

  info() {
    this._log(
      'info',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  log() {
    this._log(
      'log',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  time() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    if (this._timers[label]) {
      return;
    }

    this._timers[label] = new Date();
  }

  timeEnd() {
    let label =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : 'default';

    const startTime = this._timers[label];

    if (startTime) {
      const endTime = new Date();
      const time = endTime - startTime;
      this._log(
        'time',
        (0, (_util || _load_util()).format)(`${label}: ${time}ms`)
      );
      delete this._timers[label];
    }
  }

  warn() {
    this._log(
      'warn',
      (_util || _load_util()).format.apply(undefined, arguments)
    );
  }

  getBuffer() {
    return null;
  }
}
exports.default = CustomConsole;
});

unwrapExports(Console);

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

var toString = {}.toString;

var isarray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
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

var toString$1 = Object.prototype.toString;

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
  var type = toString$1.call(val);

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

var isNumber = function isNumber(num) {
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

var isNumber$1 = function isNumber(num) {
  var type = typeof num;

  if (type === 'string' || num instanceof String) {
    // an empty string would be coerced to true with the below logic
    if (!num.trim()) return false;
  } else if (type !== 'number' && !(num instanceof Number)) {
    return false;
  }

  return (num - num + 1) >= 0;
};

var toString$2 = Object.prototype.toString;

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

  if (isArray(val)) return 'array';
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
  type = toString$2.call(val);
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

function isArray(val) {
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
  var buf = crypto__default
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

    } else if (isNumber$1(pattern)) {
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
    } else if (!isNumber(step)) {
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
  var isNumA = isNumber(zeros(a));
  var isNumB = isNumber(zeros(b));

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
  var padding = isPadded(origA, origB);
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

function isPadded(origA, origB) {
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
      return escapeBraces(str, arr, opts);
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

  if (opts.strict) { return filter(arr, filterEmpty); }
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

function escapeBraces(str, arr, opts) {
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

function filter(arr, cb) {
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

var isExtglob = function isExtglob(str) {
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
      return escape('\\/[^.]+');
    }
    return escape('[^.]+');
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
  if (esc) inner = escape(inner);

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

function escape(str) {
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



var isGlob = function isGlob(str) {
  return typeof str === 'string'
    && (/[*!?{}(|)[\]]/.test(str)
     || isExtglob(str));
};

var toString$3 = Object.prototype.toString;

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



var normalizePath = function normalizePath(str, stripTrailing) {
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

var isExtglob$1 = function isExtglob(str) {
  return typeof str === 'string'
    && /[@?!+*]\(/.test(str);
};

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

var globParent = function globParent(str) {
	str += 'a'; // preserves full path in case of trailing path separator
	do {str = path__default.dirname(str);} while (isGlob$2(str));
	return str;
};

var globBase = function globBase(pattern) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob-base expects a string.');
  }

  var res = {};
  res.base = globParent(pattern);
  res.isGlob = isGlob$2(pattern);

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

  if (isGlob$1(tok.path.dirname) && !tok.path.basename) {
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
  tok.is.extglob  = glob && isExtglob$1(glob);
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
utils.isExtglob = isExtglob;
utils.isGlob = isGlob;
utils.typeOf = kindOf$2;
utils.normalize = normalizePath;
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

var chars = {}, unesc, temp;

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

chars.escapeRegex = {
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

chars.ESC = {
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

chars.UNESC = unesc || (unesc = reverse(chars.ESC, '\\'));

chars.ESC_TEMP = {
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

chars.TEMP = temp || (temp = reverse(chars.ESC_TEMP));

var chars_1 = chars;

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

var expand_1 = expand;

/**
 * Expand a glob pattern to resolve braces and
 * similar patterns before converting to regex.
 *
 * @param  {String|Array} `pattern`
 * @param  {Array} `files`
 * @param  {Options} `opts`
 * @return {Array}
 */

function expand(pattern, options) {
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
      pattern: '\\.' + star,
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
    glob$$1._replace(/(?!\/)\*$/, star, true);
    // has 'n*.' (partial wildcard w/ file extension)
    glob$$1._replace(/([^\/]+)\*/, '$1' + oneStar(true), true);
    // has '*'
    glob$$1._replace('*', oneStar(opts.dot), true);
    glob$$1._replace('?.', '?\\.', true);
    glob$$1._replace('?:', '?:', true);

    glob$$1._replace(/\?+/g, function(match) {
      var len = match.length;
      if (len === 1) {
        return qmark;
      }
      return qmark + '{' + len + '}';
    });

    // escape '.abc' => '\\.abc'
    glob$$1._replace(/\.([*\w]+)/g, '\\.$1');
    // fix '[^\\\\/]'
    glob$$1._replace(/\[\^[\\\/]+\]/g, qmark);
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
  glob$$1._replace('[^\\/]', qmark);

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
var qmark       = '[^/]';
var star        = qmark + '*?';
var nodot       = '(?!\\.)(?=.)';
var dotfileGlob = '(?:\\/|^)\\.{1,2}($|\\/)';
var dotfiles    = '(?!' + dotfileGlob + ')(?=.)';
var twoStarDot  = '(?:(?!' + dotfileGlob + ').)*?';

/**
 * Create a regex for `*`.
 *
 * If `dot` is true, or the pattern does not begin with
 * a leading star, then return the simpler regex.
 */

function oneStar(dotfile) {
  return dotfile ? '(?!' + dotfileGlob + ')(?=.)' + star : (nodot + star);
}

function globstar(dotfile) {
  if (dotfile) { return twoStarDot; }
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
    return match(files, patterns, opts);
  }

  var len = patterns.length, i = 0;
  var omit = [], keep = [];

  while (len--) {
    var glob = patterns[i++];
    if (typeof glob === 'string' && glob.charCodeAt(0) === 33 /* ! */) {
      omit.push.apply(omit, match(files, glob.slice(1), opts));
    } else {
      keep.push.apply(keep, match(files, glob, opts));
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

function match(files, pattern, opts) {
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

function filter$1(patterns, opts) {
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
  var re = makeRe(pattern, opts);

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

function makeRe(glob, opts) {
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
micromatch.filter    = filter$1;
micromatch.isMatch   = isMatch;
micromatch.makeRe    = makeRe;
micromatch.match     = match;
micromatch.matcher   = matcher;
micromatch.matchKeys = matchKeys;

/**
 * Expose `micromatch`
 */

var micromatch_1 = micromatch;

var slash = function (str) {
	var isExtendedLengthPath = /^\\\\\?\\/.test(str);
	var hasNonAscii = /[^\x00-\x80]+/.test(str);

	if (isExtendedLengthPath || hasNonAscii) {
		return str;
	}

	return str.replace(/\\/g, '/');
};

var jsTokens = createCommonjsModule(function (module, exports) {
// Copyright 2014, 2015, 2016, 2017, 2018 Simon Lydell
// License: MIT. (See LICENSE.)

Object.defineProperty(exports, "__esModule", {
  value: true
});

// This regex comes from regex.coffee, and is inserted here by generate-index.js
// (run `npm run build`).
exports.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyus]{1,6}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g;

exports.matchToToken = function(match) {
  var token = {type: "invalid", value: match[0], closed: undefined};
       if (match[ 1]) token.type = "string" , token.closed = !!(match[3] || match[4]);
  else if (match[ 5]) token.type = "comment";
  else if (match[ 6]) token.type = "comment", token.closed = !!match[7];
  else if (match[ 8]) token.type = "regex";
  else if (match[ 9]) token.type = "number";
  else if (match[10]) token.type = "name";
  else if (match[11]) token.type = "punctuator";
  else if (match[12]) token.type = "whitespace";
  return token
};
});

unwrapExports(jsTokens);
var jsTokens_1 = jsTokens.matchToToken;

var ast = createCommonjsModule(function (module) {
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {

    function isExpression(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'ArrayExpression':
            case 'AssignmentExpression':
            case 'BinaryExpression':
            case 'CallExpression':
            case 'ConditionalExpression':
            case 'FunctionExpression':
            case 'Identifier':
            case 'Literal':
            case 'LogicalExpression':
            case 'MemberExpression':
            case 'NewExpression':
            case 'ObjectExpression':
            case 'SequenceExpression':
            case 'ThisExpression':
            case 'UnaryExpression':
            case 'UpdateExpression':
                return true;
        }
        return false;
    }

    function isIterationStatement(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'DoWhileStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'WhileStatement':
                return true;
        }
        return false;
    }

    function isStatement(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'BlockStatement':
            case 'BreakStatement':
            case 'ContinueStatement':
            case 'DebuggerStatement':
            case 'DoWhileStatement':
            case 'EmptyStatement':
            case 'ExpressionStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'IfStatement':
            case 'LabeledStatement':
            case 'ReturnStatement':
            case 'SwitchStatement':
            case 'ThrowStatement':
            case 'TryStatement':
            case 'VariableDeclaration':
            case 'WhileStatement':
            case 'WithStatement':
                return true;
        }
        return false;
    }

    function isSourceElement(node) {
      return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
    }

    function trailingStatement(node) {
        switch (node.type) {
        case 'IfStatement':
            if (node.alternate != null) {
                return node.alternate;
            }
            return node.consequent;

        case 'LabeledStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'WhileStatement':
        case 'WithStatement':
            return node.body;
        }
        return null;
    }

    function isProblematicIfStatement(node) {
        var current;

        if (node.type !== 'IfStatement') {
            return false;
        }
        if (node.alternate == null) {
            return false;
        }
        current = node.consequent;
        do {
            if (current.type === 'IfStatement') {
                if (current.alternate == null)  {
                    return true;
                }
            }
            current = trailingStatement(current);
        } while (current);

        return false;
    }

    module.exports = {
        isExpression: isExpression,
        isStatement: isStatement,
        isIterationStatement: isIterationStatement,
        isSourceElement: isSourceElement,
        isProblematicIfStatement: isProblematicIfStatement,

        trailingStatement: trailingStatement
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */
});
var ast_1 = ast.isExpression;
var ast_2 = ast.isStatement;
var ast_3 = ast.isIterationStatement;
var ast_4 = ast.isSourceElement;
var ast_5 = ast.isProblematicIfStatement;
var ast_6 = ast.trailingStatement;

var code = createCommonjsModule(function (module) {
/*
  Copyright (C) 2013-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {

    var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch;

    // See `tools/generate-identifier-regex.js`.
    ES5Regex = {
        // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
        // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
    };

    ES6Regex = {
        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };

    function isDecimalDigit(ch) {
        return 0x30 <= ch && ch <= 0x39;  // 0..9
    }

    function isHexDigit(ch) {
        return 0x30 <= ch && ch <= 0x39 ||  // 0..9
            0x61 <= ch && ch <= 0x66 ||     // a..f
            0x41 <= ch && ch <= 0x46;       // A..F
    }

    function isOctalDigit(ch) {
        return ch >= 0x30 && ch <= 0x37;  // 0..7
    }

    // 7.2 White Space

    NON_ASCII_WHITESPACES = [
        0x1680, 0x180E,
        0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A,
        0x202F, 0x205F,
        0x3000,
        0xFEFF
    ];

    function isWhiteSpace(ch) {
        return ch === 0x20 || ch === 0x09 || ch === 0x0B || ch === 0x0C || ch === 0xA0 ||
            ch >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return ch === 0x0A || ch === 0x0D || ch === 0x2028 || ch === 0x2029;
    }

    // 7.6 Identifier Names and Identifiers

    function fromCodePoint(cp) {
        if (cp <= 0xFFFF) { return String.fromCharCode(cp); }
        var cu1 = String.fromCharCode(Math.floor((cp - 0x10000) / 0x400) + 0xD800);
        var cu2 = String.fromCharCode(((cp - 0x10000) % 0x400) + 0xDC00);
        return cu1 + cu2;
    }

    IDENTIFIER_START = new Array(0x80);
    for(ch = 0; ch < 0x80; ++ch) {
        IDENTIFIER_START[ch] =
            ch >= 0x61 && ch <= 0x7A ||  // a..z
            ch >= 0x41 && ch <= 0x5A ||  // A..Z
            ch === 0x24 || ch === 0x5F;  // $ (dollar) and _ (underscore)
    }

    IDENTIFIER_PART = new Array(0x80);
    for(ch = 0; ch < 0x80; ++ch) {
        IDENTIFIER_PART[ch] =
            ch >= 0x61 && ch <= 0x7A ||  // a..z
            ch >= 0x41 && ch <= 0x5A ||  // A..Z
            ch >= 0x30 && ch <= 0x39 ||  // 0..9
            ch === 0x24 || ch === 0x5F;  // $ (dollar) and _ (underscore)
    }

    function isIdentifierStartES5(ch) {
        return ch < 0x80 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES5(ch) {
        return ch < 0x80 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    function isIdentifierStartES6(ch) {
        return ch < 0x80 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES6(ch) {
        return ch < 0x80 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    module.exports = {
        isDecimalDigit: isDecimalDigit,
        isHexDigit: isHexDigit,
        isOctalDigit: isOctalDigit,
        isWhiteSpace: isWhiteSpace,
        isLineTerminator: isLineTerminator,
        isIdentifierStartES5: isIdentifierStartES5,
        isIdentifierPartES5: isIdentifierPartES5,
        isIdentifierStartES6: isIdentifierStartES6,
        isIdentifierPartES6: isIdentifierPartES6
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */
});
var code_1 = code.isDecimalDigit;
var code_2 = code.isHexDigit;
var code_3 = code.isOctalDigit;
var code_4 = code.isWhiteSpace;
var code_5 = code.isLineTerminator;
var code_6 = code.isIdentifierStartES5;
var code_7 = code.isIdentifierPartES5;
var code_8 = code.isIdentifierStartES6;
var code_9 = code.isIdentifierPartES6;

var keyword = createCommonjsModule(function (module) {
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {

    var code$$1 = code;

    function isStrictModeReservedWordES6(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isKeywordES5(id, strict) {
        // yield should not be treated as keyword under non-strict mode.
        if (!strict && id === 'yield') {
            return false;
        }
        return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
        if (strict && isStrictModeReservedWordES6(id)) {
            return true;
        }

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    function isReservedWordES5(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
    }

    function isReservedWordES6(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    function isIdentifierNameES5(id) {
        var i, iz, ch;

        if (id.length === 0) { return false; }

        ch = id.charCodeAt(0);
        if (!code$$1.isIdentifierStartES5(ch)) {
            return false;
        }

        for (i = 1, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (!code$$1.isIdentifierPartES5(ch)) {
                return false;
            }
        }
        return true;
    }

    function decodeUtf16(lead, trail) {
        return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
    }

    function isIdentifierNameES6(id) {
        var i, iz, ch, lowCh, check;

        if (id.length === 0) { return false; }

        check = code$$1.isIdentifierStartES6;
        for (i = 0, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (0xD800 <= ch && ch <= 0xDBFF) {
                ++i;
                if (i >= iz) { return false; }
                lowCh = id.charCodeAt(i);
                if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) {
                    return false;
                }
                ch = decodeUtf16(ch, lowCh);
            }
            if (!check(ch)) {
                return false;
            }
            check = code$$1.isIdentifierPartES6;
        }
        return true;
    }

    function isIdentifierES5(id, strict) {
        return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
    }

    function isIdentifierES6(id, strict) {
        return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
    }

    module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isReservedWordES5: isReservedWordES5,
        isReservedWordES6: isReservedWordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierNameES5: isIdentifierNameES5,
        isIdentifierNameES6: isIdentifierNameES6,
        isIdentifierES5: isIdentifierES5,
        isIdentifierES6: isIdentifierES6
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */
});
var keyword_1 = keyword.isKeywordES5;
var keyword_2 = keyword.isKeywordES6;
var keyword_3 = keyword.isReservedWordES5;
var keyword_4 = keyword.isReservedWordES6;
var keyword_5 = keyword.isRestrictedWord;
var keyword_6 = keyword.isIdentifierNameES5;
var keyword_7 = keyword.isIdentifierNameES6;
var keyword_8 = keyword.isIdentifierES5;
var keyword_9 = keyword.isIdentifierES6;

var utils = createCommonjsModule(function (module, exports) {
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function () {

    exports.ast = ast;
    exports.code = code;
    exports.keyword = keyword;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
});
var utils_1$1 = utils.ast;
var utils_2 = utils.code;
var utils_3 = utils.keyword;

var lib = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shouldHighlight = shouldHighlight;
exports.getChalk = getChalk;
exports.default = highlight;

function _jsTokens() {
  const data = _interopRequireWildcard(jsTokens);

  _jsTokens = function () {
    return data;
  };

  return data;
}

function _esutils() {
  const data = _interopRequireDefault(utils);

  _esutils = function () {
    return data;
  };

  return data;
}

function _chalk() {
  const data = _interopRequireDefault(chalk);

  _chalk = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function getDefs(chalk$$1) {
  return {
    keyword: chalk$$1.cyan,
    capitalized: chalk$$1.yellow,
    jsx_tag: chalk$$1.yellow,
    punctuator: chalk$$1.yellow,
    number: chalk$$1.magenta,
    string: chalk$$1.green,
    regex: chalk$$1.magenta,
    comment: chalk$$1.grey,
    invalid: chalk$$1.white.bgRed.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const JSX_TAG = /^[a-z][\w-]*$/i;
const BRACKET = /^[()[\]{}]$/;

function getTokenType(match) {
  const [offset, text] = match.slice(-2);
  const token = (0, _jsTokens().matchToToken)(match);

  if (token.type === "name") {
    if (_esutils().default.keyword.isReservedWordES6(token.value)) {
      return "keyword";
    }

    if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")) {
      return "jsx_tag";
    }

    if (token.value[0] !== token.value[0].toLowerCase()) {
      return "capitalized";
    }
  }

  if (token.type === "punctuator" && BRACKET.test(token.value)) {
    return "bracket";
  }

  if (token.type === "invalid" && (token.value === "@" || token.value === "#")) {
    return "punctuator";
  }

  return token.type;
}

function highlightTokens(defs, text) {
  return text.replace(_jsTokens().default, function (...args) {
    const type = getTokenType(args);
    const colorize = defs[type];

    if (colorize) {
      return args[0].split(NEWLINE).map(str => colorize(str)).join("\n");
    } else {
      return args[0];
    }
  });
}

function shouldHighlight(options) {
  return _chalk().default.supportsColor || options.forceColor;
}

function getChalk(options) {
  let chalk$$1 = _chalk().default;

  if (options.forceColor) {
    chalk$$1 = new (_chalk().default.constructor)({
      enabled: true,
      level: 1
    });
  }

  return chalk$$1;
}

function highlight(code, options = {}) {
  if (shouldHighlight(options)) {
    const chalk$$1 = getChalk(options);
    const defs = getDefs(chalk$$1);
    return highlightTokens(defs, code);
  } else {
    return code;
  }
}
});

unwrapExports(lib);
var lib_1 = lib.shouldHighlight;
var lib_2 = lib.getChalk;

var lib$1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.codeFrameColumns = codeFrameColumns;
exports.default = _default;

function _highlight() {
  const data = _interopRequireWildcard(lib);

  _highlight = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

let deprecationWarningShown = false;

function getDefs(chalk) {
  return {
    gutter: chalk.grey,
    marker: chalk.red.bold,
    message: chalk.red.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

function getMarkerLines(loc, source, opts) {
  const startLoc = Object.assign({
    column: 0,
    line: -1
  }, loc.start);
  const endLoc = Object.assign({}, startLoc, loc.end);
  const {
    linesAbove = 2,
    linesBelow = 3
  } = opts || {};
  const startLine = startLoc.line;
  const startColumn = startLoc.column;
  const endLine = endLoc.line;
  const endColumn = endLoc.column;
  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) {
    start = 0;
  }

  if (endLine === -1) {
    end = source.length;
  }

  const lineDiff = endLine - startLine;
  const markerLines = {};

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;

      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;
        markerLines[lineNumber] = [startColumn, sourceLength - startColumn];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i].length;
        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startColumn === endColumn) {
      if (startColumn) {
        markerLines[startLine] = [startColumn, 0];
      } else {
        markerLines[startLine] = true;
      }
    } else {
      markerLines[startLine] = [startColumn, endColumn - startColumn];
    }
  }

  return {
    start,
    end,
    markerLines
  };
}

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && (0, _highlight().shouldHighlight)(opts);
  const chalk = (0, _highlight().getChalk)(opts);
  const defs = getDefs(chalk);

  const maybeHighlight = (chalkFn, string) => {
    return highlighted ? chalkFn(string) : string;
  };

  if (highlighted) rawLines = (0, _highlight().default)(rawLines, opts);
  const lines = rawLines.split(NEWLINE);
  const {
    start,
    end,
    markerLines
  } = getMarkerLines(loc, lines, opts);
  const hasColumns = loc.start && typeof loc.start.column === "number";
  const numberMaxWidth = String(end).length;
  let frame = lines.slice(start, end).map((line, index) => {
    const number = start + 1 + index;
    const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
    const gutter = ` ${paddedNumber} | `;
    const hasMarker = markerLines[number];
    const lastMarkerLine = !markerLines[number + 1];

    if (hasMarker) {
      let markerLine = "";

      if (Array.isArray(hasMarker)) {
        const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
        const numberOfMarkers = hasMarker[1] || 1;
        markerLine = ["\n ", maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")), markerSpacing, maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)].join("");

        if (lastMarkerLine && opts.message) {
          markerLine += " " + maybeHighlight(defs.message, opts.message);
        }
      }

      return [maybeHighlight(defs.marker, ">"), maybeHighlight(defs.gutter, gutter), line, markerLine].join("");
    } else {
      return ` ${maybeHighlight(defs.gutter, gutter)}${line}`;
    }
  }).join("\n");

  if (opts.message && !hasColumns) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  if (highlighted) {
    return chalk.reset(frame);
  } else {
    return frame;
  }
}

function _default(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";

    if (process.emitWarning) {
      process.emitWarning(message, "DeprecationWarning");
    } else {
      const deprecationError = new Error(message);
      deprecationError.name = "DeprecationWarning";
      console.warn(new Error(message));
    }
  }

  colNumber = Math.max(colNumber, 0);
  const location = {
    start: {
      column: colNumber,
      line: lineNumber
    }
  };
  return codeFrameColumns(rawLines, location, opts);
}
});

unwrapExports(lib$1);
var lib_1$1 = lib$1.codeFrameColumns;

var stackUtils = createCommonjsModule(function (module) {
module.exports = StackUtils;

function StackUtils(opts) {
  if (!(this instanceof StackUtils)) {
    throw new Error('StackUtils constructor must be called with new');
  }
  opts = opts || {};
  this._cwd = (opts.cwd || process.cwd()).replace(/\\/g, '/');
  this._internals = opts.internals || [];
  this._wrapCallSite = opts.wrapCallSite || false;
}

module.exports.nodeInternals = nodeInternals;

function nodeInternals() {
  if (!module.exports.natives) {
    module.exports.natives = Object.keys(process.binding('natives'));
    module.exports.natives.push('bootstrap_node', 'node',
                                'internal/bootstrap/node');
  }

  return module.exports.natives.map(function (n) {
    return new RegExp('\\(' + n + '\\.js:\\d+:\\d+\\)$');
  }).concat([
    /\s*at (bootstrap_)?node\.js:\d+:\d+?$/,
    /\(internal\/[^:]+:\d+:\d+\)$/,
    /\/\.node-spawn-wrap-\w+-\w+\/node:\d+:\d+\)?$/
  ]);
}

StackUtils.prototype.clean = function (stack) {
  if (!Array.isArray(stack)) {
    stack = stack.split('\n');
  }

  if (!(/^\s*at /.test(stack[0])) &&
    (/^\s*at /.test(stack[1]))) {
    stack = stack.slice(1);
  }

  var outdent = false;
  var lastNonAtLine = null;
  var result = [];

  stack.forEach(function (st) {
    st = st.replace(/\\/g, '/');
    var isInternal = this._internals.some(function (internal) {
      return internal.test(st);
    });

    if (isInternal) {
      return null;
    }

    var isAtLine = /^\s*at /.test(st);

    if (outdent) {
      st = st.replace(/\s+$/, '').replace(/^(\s+)at /, '$1');
    } else {
      st = st.trim();
      if (isAtLine) {
        st = st.substring(3);
      }
    }

    st = st.replace(this._cwd + '/', '');

    if (st) {
      if (isAtLine) {
        if (lastNonAtLine) {
          result.push(lastNonAtLine);
          lastNonAtLine = null;
        }
        result.push(st);
      } else {
        outdent = true;
        lastNonAtLine = st;
      }
    }
  }, this);

  stack = result.join('\n').trim();

  if (stack) {
    return stack + '\n';
  }
  return '';
};

StackUtils.prototype.captureString = function (limit, fn) {
  if (typeof limit === 'function') {
    fn = limit;
    limit = Infinity;
  }
  if (!fn) {
    fn = this.captureString;
  }

  var limitBefore = Error.stackTraceLimit;
  if (limit) {
    Error.stackTraceLimit = limit;
  }

  var obj = {};

  Error.captureStackTrace(obj, fn);
  var stack = obj.stack;
  Error.stackTraceLimit = limitBefore;

  return this.clean(stack);
};

StackUtils.prototype.capture = function (limit, fn) {
  if (typeof limit === 'function') {
    fn = limit;
    limit = Infinity;
  }
  if (!fn) {
    fn = this.capture;
  }
  var prepBefore = Error.prepareStackTrace;
  var limitBefore = Error.stackTraceLimit;
  var wrapCallSite = this._wrapCallSite;

  Error.prepareStackTrace = function (obj, site) {
    if (wrapCallSite) {
      return site.map(wrapCallSite);
    }
    return site;
  };

  if (limit) {
    Error.stackTraceLimit = limit;
  }

  var obj = {};
  Error.captureStackTrace(obj, fn);
  var stack = obj.stack;
  Error.prepareStackTrace = prepBefore;
  Error.stackTraceLimit = limitBefore;

  return stack;
};

StackUtils.prototype.at = function at(fn) {
  if (!fn) {
    fn = at;
  }

  var site = this.capture(1, fn)[0];

  if (!site) {
    return {};
  }

  var res = {
    line: site.getLineNumber(),
    column: site.getColumnNumber()
  };

  this._setFile(res, site.getFileName());

  if (site.isConstructor()) {
    res.constructor = true;
  }

  if (site.isEval()) {
    res.evalOrigin = site.getEvalOrigin();
  }

  // Node v10 stopped with the isNative() on callsites, apparently
  /* istanbul ignore next */
  if (site.isNative()) {
    res.native = true;
  }

  var typename = null;
  try {
    typename = site.getTypeName();
  } catch (er) {}

  if (typename &&
    typename !== 'Object' &&
    typename !== '[object Object]') {
    res.type = typename;
  }

  var fname = site.getFunctionName();
  if (fname) {
    res.function = fname;
  }

  var meth = site.getMethodName();
  if (meth && fname !== meth) {
    res.method = meth;
  }

  return res;
};

StackUtils.prototype._setFile = function (result, filename) {
  if (filename) {
    filename = filename.replace(/\\/g, '/');
    if ((filename.indexOf(this._cwd + '/') === 0)) {
      filename = filename.substr(this._cwd.length + 1);
    }
    result.file = filename;
  }
};

var re = new RegExp(
  '^' +
    // Sometimes we strip out the '    at' because it's noisy
  '(?:\\s*at )?' +
    // $1 = ctor if 'new'
  '(?:(new) )?' +
    // $2 = function name (can be literally anything)
    // May contain method at the end as [as xyz]
  '(?:(.*?) \\()?' +
    // (eval at <anonymous> (file.js:1:1),
    // $3 = eval origin
    // $4:$5:$6 are eval file/line/col, but not normally reported
  '(?:eval at ([^ ]+) \\((.+?):(\\d+):(\\d+)\\), )?' +
    // file:line:col
    // $7:$8:$9
    // $10 = 'native' if native
  '(?:(.+?):(\\d+):(\\d+)|(native))' +
    // maybe close the paren, then end
    // if $11 is ), then we only allow balanced parens in the filename
    // any imbalance is placed on the fname.  This is a heuristic, and
    // bound to be incorrect in some edge cases.  The bet is that
    // having weird characters in method names is more common than
    // having weird characters in filenames, which seems reasonable.
  '(\\)?)$'
);

var methodRe = /^(.*?) \[as (.*?)\]$/;

StackUtils.prototype.parseLine = function parseLine(line) {
  var match = line && line.match(re);
  if (!match) {
    return null;
  }

  var ctor = match[1] === 'new';
  var fname = match[2];
  var evalOrigin = match[3];
  var evalFile = match[4];
  var evalLine = Number(match[5]);
  var evalCol = Number(match[6]);
  var file = match[7];
  var lnum = match[8];
  var col = match[9];
  var native = match[10] === 'native';
  var closeParen = match[11] === ')';

  var res = {};

  if (lnum) {
    res.line = Number(lnum);
  }

  if (col) {
    res.column = Number(col);
  }

  if (closeParen && file) {
    // make sure parens are balanced
    // if we have a file like "asdf) [as foo] (xyz.js", then odds are
    // that the fname should be += " (asdf) [as foo]" and the file
    // should be just "xyz.js"
    // walk backwards from the end to find the last unbalanced (
    var closes = 0;
    for (var i = file.length - 1; i > 0; i--) {
      if (file.charAt(i) === ')') {
        closes ++;
      } else if (file.charAt(i) === '(' && file.charAt(i - 1) === ' ') {
        closes --;
        if (closes === -1 && file.charAt(i - 1) === ' ') {
          var before = file.substr(0, i - 1);
          var after = file.substr(i + 1);
          file = after;
          fname += ' (' + before;
          break;
        }
      }
    }
  }

  if (fname) {
    var methodMatch = fname.match(methodRe);
    if (methodMatch) {
      fname = methodMatch[1];
      var meth = methodMatch[2];
    }
  }

  this._setFile(res, file);

  if (ctor) {
    res.constructor = true;
  }

  if (evalOrigin) {
    res.evalOrigin = evalOrigin;
    res.evalLine = evalLine;
    res.evalColumn = evalCol;
    res.evalFile = evalFile && evalFile.replace(/\\/g, '/');
  }

  if (native) {
    res.native = true;
  }

  if (fname) {
    res.function = fname;
  }

  if (meth && fname !== meth) {
    res.method = meth;
  }

  return res;
};

var bound = new StackUtils();

Object.keys(StackUtils.prototype).forEach(function (key) {
  StackUtils[key] = bound[key].bind(bound);
});
});
var stackUtils_1 = stackUtils.nodeInternals;
var stackUtils_2 = stackUtils.natives;

var build = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.separateMessageFromStack = exports.formatResultsErrors = exports.formatStackTrace = exports.getTopFrame = exports.getStackTraceLines = exports.formatExecError = undefined;



var _fs2 = _interopRequireDefault(fs__default);



var _path2 = _interopRequireDefault(path__default);



var _chalk2 = _interopRequireDefault(chalk);



var _micromatch2 = _interopRequireDefault(micromatch_1);



var _slash2 = _interopRequireDefault(slash);





var _stackUtils2 = _interopRequireDefault(stackUtils);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

// stack utils tries to create pretty stack by making paths relative.
const stackUtils$$1 = new _stackUtils2.default({
  cwd: 'something which does not exist'
});
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

let nodeInternals = [];

try {
  nodeInternals = _stackUtils2.default
    .nodeInternals()
    // this is to have the tests be the same in node 4 and node 6.
    // TODO: Remove when we drop support for node 4
    .concat(new RegExp('internal/process/next_tick.js'));
} catch (e) {
  // `StackUtils.nodeInternals()` fails in browsers. We don't need to remove
  // node internals in the browser though, so no issue.
}

const PATH_NODE_MODULES = `${_path2.default.sep}node_modules${
  _path2.default.sep
}`;
const PATH_JEST_PACKAGES = `${_path2.default.sep}jest${
  _path2.default.sep
}packages${_path2.default.sep}`;

// filter for noisy stack trace lines
const JASMINE_IGNORE = /^\s+at(?:(?:.jasmine\-)|\s+jasmine\.buildExpectationResult)/;
const JEST_INTERNALS_IGNORE = /^\s+at.*?jest(-.*?)?(\/|\\)(build|node_modules|packages)(\/|\\)/;
const ANONYMOUS_FN_IGNORE = /^\s+at <anonymous>.*$/;
const ANONYMOUS_PROMISE_IGNORE = /^\s+at (new )?Promise \(<anonymous>\).*$/;
const ANONYMOUS_GENERATOR_IGNORE = /^\s+at Generator.next \(<anonymous>\).*$/;
const NATIVE_NEXT_IGNORE = /^\s+at next \(native\).*$/;
const TITLE_INDENT = '  ';
const MESSAGE_INDENT = '    ';
const STACK_INDENT = '      ';
const ANCESTRY_SEPARATOR = ' \u203A ';
const TITLE_BULLET = _chalk2.default.bold('\u25cf ');
const STACK_TRACE_COLOR = _chalk2.default.dim;
const STACK_PATH_REGEXP = /\s*at.*\(?(\:\d*\:\d*|native)\)?/;
const EXEC_ERROR_MESSAGE = 'Test suite failed to run';
const ERROR_TEXT = 'Error: ';

const indentAllLines = (lines, indent) =>
  lines
    .split('\n')
    .map(line => (line ? indent + line : line))
    .join('\n');

const trim = string => (string || '').trim();

// Some errors contain not only line numbers in stack traces
// e.g. SyntaxErrors can contain snippets of code, and we don't
// want to trim those, because they may have pointers to the column/character
// which will get misaligned.
const trimPaths = string =>
  string.match(STACK_PATH_REGEXP) ? trim(string) : string;

const getRenderedCallsite = (fileContent, line, column) => {
  let renderedCallsite = (0, lib$1.codeFrameColumns)(
    fileContent,
    {start: {column: column, line: line}},
    {highlightCode: true}
  );

  renderedCallsite = indentAllLines(renderedCallsite, MESSAGE_INDENT);

  renderedCallsite = `\n${renderedCallsite}\n`;
  return renderedCallsite;
};

// ExecError is an error thrown outside of the test suite (not inside an `it` or
// `before/after each` hooks). If it's thrown, none of the tests in the file
// are executed.
const formatExecError = (exports.formatExecError = (
  error,
  config,
  options,
  testPath,
  reuseMessage
) => {
  if (!error || typeof error === 'number') {
    error = new Error(`Expected an Error, but "${String(error)}" was thrown`);
    error.stack = '';
  }

  let message, stack;

  if (typeof error === 'string' || !error) {
    error || (error = 'EMPTY ERROR');
    message = '';
    stack = error;
  } else {
    message = error.message;
    stack = error.stack;
  }

  const separated = separateMessageFromStack(stack || '');
  stack = separated.stack;

  if (separated.message.indexOf(trim(message)) !== -1) {
    // Often stack trace already contains the duplicate of the message
    message = separated.message;
  }

  message = indentAllLines(message, MESSAGE_INDENT);

  stack =
    stack && !options.noStackTrace
      ? '\n' + formatStackTrace(stack, config, options, testPath)
      : '';

  if (message.match(/^\s*$/) && stack.match(/^\s*$/)) {
    // this can happen if an empty object is thrown.
    message = MESSAGE_INDENT + 'Error: No message was provided';
  }

  let messageToUse;

  if (reuseMessage) {
    messageToUse = ` ${message.trim()}`;
  } else {
    messageToUse = `${EXEC_ERROR_MESSAGE}\n\n${message}`;
  }

  return TITLE_INDENT + TITLE_BULLET + messageToUse + stack + '\n';
});

const removeInternalStackEntries = (lines, options) => {
  let pathCounter = 0;

  return lines.filter(line => {
    if (ANONYMOUS_FN_IGNORE.test(line)) {
      return false;
    }

    if (ANONYMOUS_PROMISE_IGNORE.test(line)) {
      return false;
    }

    if (ANONYMOUS_GENERATOR_IGNORE.test(line)) {
      return false;
    }

    if (NATIVE_NEXT_IGNORE.test(line)) {
      return false;
    }

    if (nodeInternals.some(internal => internal.test(line))) {
      return false;
    }

    if (!STACK_PATH_REGEXP.test(line)) {
      return true;
    }

    if (JASMINE_IGNORE.test(line)) {
      return false;
    }

    if (++pathCounter === 1) {
      return true; // always keep the first line even if it's from Jest
    }

    if (options.noStackTrace) {
      return false;
    }

    if (JEST_INTERNALS_IGNORE.test(line)) {
      return false;
    }

    return true;
  });
};

const formatPaths = (config, relativeTestPath, line) => {
  // Extract the file path from the trace line.
  const match = line.match(/(^\s*at .*?\(?)([^()]+)(:[0-9]+:[0-9]+\)?.*$)/);
  if (!match) {
    return line;
  }

  let filePath = (0, _slash2.default)(
    _path2.default.relative(config.rootDir, match[2])
  );
  // highlight paths from the current test file
  if (
    (config.testMatch &&
      config.testMatch.length &&
      (0, _micromatch2.default)(filePath, config.testMatch)) ||
    filePath === relativeTestPath
  ) {
    filePath = _chalk2.default.reset.cyan(filePath);
  }
  return STACK_TRACE_COLOR(match[1]) + filePath + STACK_TRACE_COLOR(match[3]);
};

const getStackTraceLines = (exports.getStackTraceLines = function(stack) {
  let options =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : {noStackTrace: false};
  return removeInternalStackEntries(stack.split(/\n/), options);
});

const getTopFrame = (exports.getTopFrame = lines => {
  for (const line of lines) {
    if (line.includes(PATH_NODE_MODULES) || line.includes(PATH_JEST_PACKAGES)) {
      continue;
    }

    const parsedFrame = stackUtils$$1.parseLine(line.trim());

    if (parsedFrame && parsedFrame.file) {
      return parsedFrame;
    }
  }

  return null;
});

const formatStackTrace = (exports.formatStackTrace = (
  stack,
  config,
  options,
  testPath
) => {
  const lines = getStackTraceLines(stack, options);
  const topFrame = getTopFrame(lines);
  let renderedCallsite = '';
  const relativeTestPath = testPath
    ? (0, _slash2.default)(_path2.default.relative(config.rootDir, testPath))
    : null;

  if (topFrame) {
    const filename = topFrame.file;

    if (_path2.default.isAbsolute(filename)) {
      let fileContent;
      try {
        // TODO: check & read HasteFS instead of reading the filesystem:
        // see: https://github.com/facebook/jest/pull/5405#discussion_r164281696
        fileContent = _fs2.default.readFileSync(filename, 'utf8');
        renderedCallsite = getRenderedCallsite(
          fileContent,
          topFrame.line,
          topFrame.column
        );
      } catch (e) {
        // the file does not exist or is inaccessible, we ignore
      }
    }
  }

  const stacktrace = lines
    .filter(Boolean)
    .map(
      line =>
        STACK_INDENT + formatPaths(config, relativeTestPath, trimPaths(line))
    )
    .join('\n');

  return `${renderedCallsite}\n${stacktrace}`;
});

const formatResultsErrors = (exports.formatResultsErrors = (
  testResults,
  config,
  options,
  testPath
) => {
  const failedResults = testResults.reduce((errors, result) => {
    result.failureMessages.forEach(content =>
      errors.push({content: content, result: result})
    );
    return errors;
  }, []);

  if (!failedResults.length) {
    return null;
  }

  return failedResults
    .map(_ref => {
      let result = _ref.result,
        content = _ref.content;

      var _separateMessageFromS = separateMessageFromStack(content);

      let message = _separateMessageFromS.message,
        stack = _separateMessageFromS.stack;

      stack = options.noStackTrace
        ? ''
        : STACK_TRACE_COLOR(
            formatStackTrace(stack, config, options, testPath)
          ) + '\n';

      message = indentAllLines(message, MESSAGE_INDENT);

      const title =
        _chalk2.default.bold.red(
          TITLE_INDENT +
            TITLE_BULLET +
            result.ancestorTitles.join(ANCESTRY_SEPARATOR) +
            (result.ancestorTitles.length ? ANCESTRY_SEPARATOR : '') +
            result.title
        ) + '\n';

      return title + '\n' + message + '\n' + stack;
    })
    .join('\n');
});

// jasmine and worker farm sometimes don't give us access to the actual
// Error object, so we have to regexp out the message from the stack string
// to format it.
const separateMessageFromStack = (exports.separateMessageFromStack = content => {
  if (!content) {
    return {message: '', stack: ''};
  }

  const messageMatch = content.match(/(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/);
  let message = messageMatch ? messageMatch[0] : 'Error';
  const stack = messageMatch ? content.slice(message.length) : content;
  // If the error is a plain error instead of a SyntaxError or TypeError
  // we remove it from the message because it is generally not useful.
  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }
  return {message: message, stack: stack};
});
});

unwrapExports(build);
var build_1 = build.separateMessageFromStack;
var build_2 = build.formatResultsErrors;
var build_3 = build.formatStackTrace;
var build_4 = build.getTopFrame;
var build_5 = build.getStackTraceLines;
var build_6 = build.formatExecError;

var set_global = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.default = (global, key, value) => (global[key] = value);
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
});

unwrapExports(set_global);

var fake_timers = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _jestMessageUtil;

function _load_jestMessageUtil() {
  return (_jestMessageUtil = build);
}

var _set_global;

function _load_set_global() {
  return (_set_global = _interopRequireDefault(set_global));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * We don't know the type of arguments for a callback ahead of time which is why
 * we are disabling the flowtype/no-weak-types rule here.
 */

/* eslint-disable flowtype/no-weak-types */

/* eslint-enable flowtype/no-weak-types */

const MS_IN_A_YEAR = 31536000000;
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

class FakeTimers {
  constructor(_ref) {
    let global = _ref.global,
      moduleMocker = _ref.moduleMocker,
      timerConfig = _ref.timerConfig,
      config = _ref.config,
      maxLoops = _ref.maxLoops;

    this._global = global;
    this._timerConfig = timerConfig;
    this._config = config;
    this._maxLoops = maxLoops || 100000;
    this._uuidCounter = 1;
    this._moduleMocker = moduleMocker;

    // Store original timer APIs for future reference
    this._timerAPIs = {
      clearImmediate: global.clearImmediate,
      clearInterval: global.clearInterval,
      clearTimeout: global.clearTimeout,
      nextTick: global.process && global.process.nextTick,
      setImmediate: global.setImmediate,
      setInterval: global.setInterval,
      setTimeout: global.setTimeout
    };

    this.reset();
    this._createMocks();

    // These globally-accessible function are now deprecated!
    // They will go away very soon, so do not use them!
    // Instead, use the versions available on the `jest` object
    global.mockRunTicksRepeatedly = this.runAllTicks.bind(this);
    global.mockRunTimersOnce = this.runOnlyPendingTimers.bind(this);
    global.mockAdvanceTimersByTime = this.advanceTimersByTime.bind(this);
    global.mockRunTimersRepeatedly = this.runAllTimers.bind(this);
    global.mockClearTimers = this.clearAllTimers.bind(this);
    global.mockGetTimersCount = () => Object.keys(this._timers).length;
  }

  clearAllTimers() {
    this._immediates.forEach(immediate =>
      this._fakeClearImmediate(immediate.uuid)
    );
    for (const uuid in this._timers) {
      delete this._timers[uuid];
    }
  }

  dispose() {
    this._disposed = true;
    this.clearAllTimers();
  }

  reset() {
    this._cancelledTicks = {};
    this._cancelledImmediates = {};
    this._now = 0;
    this._ticks = [];
    this._immediates = [];
    this._timers = {};
  }

  runAllTicks() {
    this._checkFakeTimers();
    // Only run a generous number of ticks and then bail.
    // This is just to help avoid recursive loops
    let i;
    for (i = 0; i < this._maxLoops; i++) {
      const tick = this._ticks.shift();

      if (tick === undefined) {
        break;
      }

      if (!this._cancelledTicks.hasOwnProperty(tick.uuid)) {
        // Callback may throw, so update the map prior calling.
        this._cancelledTicks[tick.uuid] = true;
        tick.callback();
      }
    }

    if (i === this._maxLoops) {
      throw new Error(
        'Ran ' +
          this._maxLoops +
          ' ticks, and there are still more! ' +
          "Assuming we've hit an infinite recursion and bailing out..."
      );
    }
  }

  runAllImmediates() {
    this._checkFakeTimers();
    // Only run a generous number of immediates and then bail.
    let i;
    for (i = 0; i < this._maxLoops; i++) {
      const immediate = this._immediates.shift();
      if (immediate === undefined) {
        break;
      }
      this._runImmediate(immediate);
    }

    if (i === this._maxLoops) {
      throw new Error(
        'Ran ' +
          this._maxLoops +
          ' immediates, and there are still more! Assuming ' +
          "we've hit an infinite recursion and bailing out..."
      );
    }
  }

  _runImmediate(immediate) {
    if (!this._cancelledImmediates.hasOwnProperty(immediate.uuid)) {
      // Callback may throw, so update the map prior calling.
      this._cancelledImmediates[immediate.uuid] = true;
      immediate.callback();
    }
  }

  runAllTimers() {
    this._checkFakeTimers();
    this.runAllTicks();
    this.runAllImmediates();

    // Only run a generous number of timers and then bail.
    // This is just to help avoid recursive loops
    let i;
    for (i = 0; i < this._maxLoops; i++) {
      const nextTimerHandle = this._getNextTimerHandle();

      // If there are no more timer handles, stop!
      if (nextTimerHandle === null) {
        break;
      }

      this._runTimerHandle(nextTimerHandle);

      // Some of the immediate calls could be enqueued
      // during the previous handling of the timers, we should
      // run them as well.
      if (this._immediates.length) {
        this.runAllImmediates();
      }

      if (this._ticks.length) {
        this.runAllTicks();
      }
    }

    if (i === this._maxLoops) {
      throw new Error(
        'Ran ' +
          this._maxLoops +
          ' timers, and there are still more! ' +
          "Assuming we've hit an infinite recursion and bailing out..."
      );
    }
  }

  runOnlyPendingTimers() {
    const timers = Object.assign({}, this._timers);
    this._checkFakeTimers();
    this._immediates.forEach(this._runImmediate, this);
    Object.keys(timers)
      .sort((left, right) => timers[left].expiry - timers[right].expiry)
      .forEach(this._runTimerHandle, this);
  }

  advanceTimersByTime(msToRun) {
    this._checkFakeTimers();
    // Only run a generous number of timers and then bail.
    // This is just to help avoid recursive loops
    let i;
    for (i = 0; i < this._maxLoops; i++) {
      const timerHandle = this._getNextTimerHandle();

      // If there are no more timer handles, stop!
      if (timerHandle === null) {
        break;
      }

      const nextTimerExpiry = this._timers[timerHandle].expiry;
      if (this._now + msToRun < nextTimerExpiry) {
        // There are no timers between now and the target we're running to, so
        // adjust our time cursor and quit
        this._now += msToRun;
        break;
      } else {
        msToRun -= nextTimerExpiry - this._now;
        this._now = nextTimerExpiry;
        this._runTimerHandle(timerHandle);
      }
    }

    if (i === this._maxLoops) {
      throw new Error(
        'Ran ' +
          this._maxLoops +
          ' timers, and there are still more! ' +
          "Assuming we've hit an infinite recursion and bailing out..."
      );
    }
  }

  runWithRealTimers(cb) {
    const prevClearImmediate = this._global.clearImmediate;
    const prevClearInterval = this._global.clearInterval;
    const prevClearTimeout = this._global.clearTimeout;
    const prevNextTick = this._global.process.nextTick;
    const prevSetImmediate = this._global.setImmediate;
    const prevSetInterval = this._global.setInterval;
    const prevSetTimeout = this._global.setTimeout;

    this.useRealTimers();

    let cbErr = null;
    let errThrown = false;
    try {
      cb();
    } catch (e) {
      errThrown = true;
      cbErr = e;
    }

    this._global.clearImmediate = prevClearImmediate;
    this._global.clearInterval = prevClearInterval;
    this._global.clearTimeout = prevClearTimeout;
    this._global.process.nextTick = prevNextTick;
    this._global.setImmediate = prevSetImmediate;
    this._global.setInterval = prevSetInterval;
    this._global.setTimeout = prevSetTimeout;

    if (errThrown) {
      throw cbErr;
    }
  }

  useRealTimers() {
    const global = this._global;
    (0, (_set_global || _load_set_global()).default)(
      global,
      'clearImmediate',
      this._timerAPIs.clearImmediate
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'clearInterval',
      this._timerAPIs.clearInterval
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'clearTimeout',
      this._timerAPIs.clearTimeout
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'setImmediate',
      this._timerAPIs.setImmediate
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'setInterval',
      this._timerAPIs.setInterval
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'setTimeout',
      this._timerAPIs.setTimeout
    );

    global.process.nextTick = this._timerAPIs.nextTick;
  }

  useFakeTimers() {
    this._createMocks();

    const global = this._global;
    (0, (_set_global || _load_set_global()).default)(
      global,
      'clearImmediate',
      this._fakeTimerAPIs.clearImmediate
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'clearInterval',
      this._fakeTimerAPIs.clearInterval
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'clearTimeout',
      this._fakeTimerAPIs.clearTimeout
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'setImmediate',
      this._fakeTimerAPIs.setImmediate
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'setInterval',
      this._fakeTimerAPIs.setInterval
    );
    (0, (_set_global || _load_set_global()).default)(
      global,
      'setTimeout',
      this._fakeTimerAPIs.setTimeout
    );

    global.process.nextTick = this._fakeTimerAPIs.nextTick;
  }

  _checkFakeTimers() {
    if (this._global.setTimeout !== this._fakeTimerAPIs.setTimeout) {
      this._global.console.warn(
        `A function to advance timers was called but the timers API is not ` +
          `mocked with fake timers. Call \`jest.useFakeTimers()\` in this ` +
          `test or enable fake timers globally by setting ` +
          `\`"timers": "fake"\` in ` +
          `the configuration file. This warning is likely a result of a ` +
          `default configuration change in Jest 15.\n\n` +
          `Release Blog Post: https://jestjs.io/blog/2016/09/01/jest-15.html\n` +
          `Stack Trace:\n` +
          (0, (_jestMessageUtil || _load_jestMessageUtil()).formatStackTrace)(
            new Error().stack,
            this._config,
            {
              noStackTrace: false
            }
          )
      );
    }
  }

  _createMocks() {
    const fn = impl => this._moduleMocker.fn().mockImplementation(impl);

    this._fakeTimerAPIs = {
      clearImmediate: fn(this._fakeClearImmediate.bind(this)),
      clearInterval: fn(this._fakeClearTimer.bind(this)),
      clearTimeout: fn(this._fakeClearTimer.bind(this)),
      nextTick: fn(this._fakeNextTick.bind(this)),
      setImmediate: fn(this._fakeSetImmediate.bind(this)),
      setInterval: fn(this._fakeSetInterval.bind(this)),
      setTimeout: fn(this._fakeSetTimeout.bind(this))
    };
  }

  _fakeClearTimer(timerRef) {
    const uuid = this._timerConfig.refToId(timerRef);

    if (uuid && this._timers.hasOwnProperty(uuid)) {
      delete this._timers[String(uuid)];
    }
  }

  _fakeClearImmediate(uuid) {
    this._cancelledImmediates[uuid] = true;
  }

  _fakeNextTick(callback) {
    if (this._disposed) {
      return;
    }

    const args = [];
    for (let ii = 1, ll = arguments.length; ii < ll; ii++) {
      args.push(arguments[ii]);
    }

    const uuid = String(this._uuidCounter++);

    this._ticks.push({
      callback: () => callback.apply(null, args),
      uuid: uuid
    });

    const cancelledTicks = this._cancelledTicks;
    this._timerAPIs.nextTick(() => {
      if (!cancelledTicks.hasOwnProperty(uuid)) {
        // Callback may throw, so update the map prior calling.
        cancelledTicks[uuid] = true;
        callback.apply(null, args);
      }
    });
  }

  _fakeSetImmediate(callback) {
    if (this._disposed) {
      return null;
    }

    const args = [];
    for (let ii = 1, ll = arguments.length; ii < ll; ii++) {
      args.push(arguments[ii]);
    }

    const uuid = this._uuidCounter++;

    this._immediates.push({
      callback: () => callback.apply(null, args),
      uuid: String(uuid)
    });

    const cancelledImmediates = this._cancelledImmediates;
    this._timerAPIs.setImmediate(() => {
      if (!cancelledImmediates.hasOwnProperty(uuid)) {
        // Callback may throw, so update the map prior calling.
        cancelledImmediates[String(uuid)] = true;
        callback.apply(null, args);
      }
    });

    return uuid;
  }

  _fakeSetInterval(callback, intervalDelay) {
    if (this._disposed) {
      return null;
    }

    if (intervalDelay == null) {
      intervalDelay = 0;
    }

    const args = [];
    for (let ii = 2, ll = arguments.length; ii < ll; ii++) {
      args.push(arguments[ii]);
    }

    const uuid = this._uuidCounter++;

    this._timers[String(uuid)] = {
      callback: () => callback.apply(null, args),
      expiry: this._now + intervalDelay,
      interval: intervalDelay,
      type: 'interval'
    };

    return this._timerConfig.idToRef(uuid);
  }

  _fakeSetTimeout(callback, delay) {
    if (this._disposed) {
      return null;
    }

    // eslint-disable-next-line no-bitwise
    delay = Number(delay) | 0;

    const args = [];
    for (let ii = 2, ll = arguments.length; ii < ll; ii++) {
      args.push(arguments[ii]);
    }

    const uuid = this._uuidCounter++;

    this._timers[String(uuid)] = {
      callback: () => callback.apply(null, args),
      expiry: this._now + delay,
      interval: null,
      type: 'timeout'
    };

    return this._timerConfig.idToRef(uuid);
  }

  _getNextTimerHandle() {
    let nextTimerHandle = null;
    let uuid;
    let soonestTime = MS_IN_A_YEAR;
    let timer;
    for (uuid in this._timers) {
      timer = this._timers[uuid];
      if (timer.expiry < soonestTime) {
        soonestTime = timer.expiry;
        nextTimerHandle = uuid;
      }
    }

    return nextTimerHandle;
  }

  _runTimerHandle(timerHandle) {
    const timer = this._timers[timerHandle];

    if (!timer) {
      return;
    }

    switch (timer.type) {
      case 'timeout':
        const callback = timer.callback;
        delete this._timers[timerHandle];
        callback();
        break;

      case 'interval':
        timer.expiry = this._now + timer.interval;
        timer.callback();
        break;

      default:
        throw new Error('Unexpected timer type: ' + timer.type);
    }
  }
}
exports.default = FakeTimers;
});

unwrapExports(fake_timers);

var format_test_results = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = formatTestResults;

const formatResult = (testResult, codeCoverageFormatter, reporter) => {
  const now = Date.now();
  const output = {
    assertionResults: [],
    coverage: {},
    endTime: now,
    message: '',
    name: testResult.testFilePath,
    startTime: now,
    status: 'failed',
    summary: ''
  };

  if (testResult.testExecError) {
    output.message = testResult.testExecError.message;
    output.coverage = {};
  } else {
    const allTestsPassed = testResult.numFailingTests === 0;
    output.status = allTestsPassed ? 'passed' : 'failed';
    output.startTime = testResult.perfStats.start;
    output.endTime = testResult.perfStats.end;
    output.coverage = codeCoverageFormatter(testResult.coverage, reporter);
  }

  output.assertionResults = testResult.testResults.map(formatTestAssertion);

  if (testResult.failureMessage) {
    output.message = testResult.failureMessage;
  }

  return output;
};
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

function formatTestAssertion(assertion) {
  const result = {
    ancestorTitles: assertion.ancestorTitles,
    failureMessages: null,
    fullName: assertion.fullName,
    location: assertion.location,
    status: assertion.status,
    title: assertion.title
  };
  if (assertion.failureMessages) {
    result.failureMessages = assertion.failureMessages;
  }
  return result;
}

function formatTestResults(results, codeCoverageFormatter, reporter) {
  const formatter = codeCoverageFormatter || (coverage => coverage);

  const testResults = results.testResults.map(testResult =>
    formatResult(testResult, formatter, reporter)
  );

  return Object.assign(Object.create(null), results, {
    testResults: testResults
  });
}
});

unwrapExports(format_test_results);

var get_failed_snapshot_tests = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

function getFailedSnapshotTests(testResults) {
  const failedTestPaths = [];
  if (testResults.numFailedTests === 0 || !testResults.testResults) {
    return failedTestPaths;
  }

  testResults.testResults.forEach(testResult => {
    if (testResult.snapshot && testResult.snapshot.unmatched) {
      failedTestPaths.push(testResult.testFilePath);
    }
  });

  return failedTestPaths;
}

exports.default = getFailedSnapshotTests;
});

unwrapExports(get_failed_snapshot_tests);

var get_console_output = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _path;

function _load_path() {
  return (_path = _interopRequireDefault(path__default));
}

var _chalk;

function _load_chalk() {
  return (_chalk = _interopRequireDefault(chalk));
}

var _slash;

function _load_slash() {
  return (_slash = _interopRequireDefault(slash));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

exports.default = (root, verbose, buffer) => {
  const TITLE_INDENT = verbose ? '  ' : '    ';
  const CONSOLE_INDENT = TITLE_INDENT + '  ';

  return buffer.reduce((output, _ref) => {
    let type = _ref.type,
      message = _ref.message,
      origin = _ref.origin;

    origin = (0, (_slash || _load_slash()).default)(
      (_path || _load_path()).default.relative(root, origin)
    );
    message = message
      .split(/\n/)
      .map(line => CONSOLE_INDENT + line)
      .join('\n');

    let typeMessage = 'console.' + type;
    if (type === 'warn') {
      message = (_chalk || _load_chalk()).default.yellow(message);
      typeMessage = (_chalk || _load_chalk()).default.yellow(typeMessage);
    } else if (type === 'error') {
      message = (_chalk || _load_chalk()).default.red(message);
      typeMessage = (_chalk || _load_chalk()).default.red(typeMessage);
    }

    return (
      output +
      TITLE_INDENT +
      (_chalk || _load_chalk()).default.dim(typeMessage) +
      ' ' +
      (_chalk || _load_chalk()).default.dim(origin) +
      '\n' +
      message +
      '\n'
    );
  }, '');
};
});

unwrapExports(get_console_output);

var deep_cyclic_copy = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = deepCyclicCopy;
/**
 * Copyright (c) 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const EMPTY = new Set();

// $FlowFixMe: Node 6 does not have gOPDs, so we define a simple polyfill for it.
if (!Object.getOwnPropertyDescriptors) {
  // $FlowFixMe: polyfill
  Object.getOwnPropertyDescriptors = obj => {
    const list = {};

    Object.getOwnPropertyNames(obj)
      .concat(Object.getOwnPropertySymbols(obj))
      // $FlowFixMe: assignment with a Symbol is OK.
      .forEach(key => (list[key] = Object.getOwnPropertyDescriptor(obj, key)));

    return list;
  };
}

function deepCyclicCopy(value) {
  let options =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : {blacklist: EMPTY, keepPrototype: false};
  let cycles =
    arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : new WeakMap();

  if (typeof value !== 'object' || value === null) {
    return value;
  } else if (cycles.has(value)) {
    return cycles.get(value);
  } else if (Array.isArray(value)) {
    return deepCyclicCopyArray(value, options, cycles);
  } else {
    return deepCyclicCopyObject(value, options, cycles);
  }
}

function deepCyclicCopyObject(object, options, cycles) {
  const newObject = options.keepPrototype
    ? Object.create(Object.getPrototypeOf(object))
    : {};

  // $FlowFixMe: Object.getOwnPropertyDescriptors is polyfilled above.
  const descriptors = Object.getOwnPropertyDescriptors(object);

  cycles.set(object, newObject);

  Object.keys(descriptors).forEach(key => {
    if (options.blacklist && options.blacklist.has(key)) {
      delete descriptors[key];
      return;
    }

    const descriptor = descriptors[key];
    if (typeof descriptor.value !== 'undefined') {
      descriptor.value = deepCyclicCopy(
        descriptor.value,
        {blacklist: EMPTY, keepPrototype: options.keepPrototype},
        cycles
      );
    }

    descriptor.configurable = true;
  });

  return Object.defineProperties(newObject, descriptors);
}

function deepCyclicCopyArray(array, options, cycles) {
  const newArray = options.keepPrototype // $FlowFixMe: getPrototypeOf an array is OK.
    ? new (Object.getPrototypeOf(array)).constructor(array.length)
    : [];
  const length = array.length;

  cycles.set(array, newArray);

  for (let i = 0; i < length; i++) {
    newArray[i] = deepCyclicCopy(
      array[i],
      {blacklist: EMPTY, keepPrototype: options.keepPrototype},
      cycles
    );
  }

  return newArray;
}
});

unwrapExports(deep_cyclic_copy);

var create_process_object = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.default = function() {
  const process = process$1;
  const newProcess = (0, (_deep_cyclic_copy || _load_deep_cyclic_copy()).default)(process, {
    blacklist: BLACKLIST,
    keepPrototype: true
  });

  newProcess[Symbol.toStringTag] = 'process';

  // Sequentially execute all constructors over the object.
  let proto = process;

  while ((proto = Object.getPrototypeOf(proto))) {
    if (typeof proto.constructor === 'function') {
      proto.constructor.call(newProcess);
    }
  }

  newProcess.env = createProcessEnv();
  newProcess.send = () => {};

  return newProcess;
};

var _deep_cyclic_copy;

function _load_deep_cyclic_copy() {
  return (_deep_cyclic_copy = _interopRequireDefault(
    deep_cyclic_copy
  ));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const BLACKLIST = new Set(['env', 'mainModule', '_events']);

// The "process.env" object has a bunch of particularities: first, it does not
// directly extend from Object; second, it converts any assigned value to a
// string; and third, it is case-insensitive in Windows. We use a proxy here to
// mimic it (see https://nodejs.org/api/process.html#process_process_env).

/**
 * Copyright (c) 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

function createProcessEnv() {
  if (typeof Proxy === 'undefined') {
    return (0, (_deep_cyclic_copy || _load_deep_cyclic_copy()).default)(
      process.env
    );
  }

  // $FlowFixMe: Apparently Flow does not understand that this is a prototype.
  const proto = Object.getPrototypeOf(process.env);
  const real = Object.create(proto);
  const lookup = {};

  const proxy = new Proxy(real, {
    deleteProperty: function(target, key) {
      for (const name in real) {
        if (real.hasOwnProperty(name)) {
          if (typeof key === 'string' && process.platform === 'win32') {
            if (name.toLowerCase() === key.toLowerCase()) {
              delete real[name];
              delete lookup[name.toLowerCase()];
            }
          } else {
            if (key === name) {
              delete real[name];
              delete lookup[name];
            }
          }
        }
      }

      return true;
    },
    get: function(target, key) {
      if (typeof key === 'string' && process.platform === 'win32') {
        return lookup[key in proto ? key : key.toLowerCase()];
      } else {
        return real[key];
      }
    },
    set: function(target, key, value) {
      const strValue = '' + value;

      if (typeof key === 'string') {
        lookup[key.toLowerCase()] = strValue;
      }

      real[key] = strValue;

      return true;
    }
  });

  return Object.assign(proxy, process.env);
}
});

unwrapExports(create_process_object);

var install_common_globals = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.default = function(globalObject, globals) {
  globalObject.process = (0, (_create_process_object || _load_create_process_object()).default)();

  // Keep a reference to "Promise", since "jasmine_light.js" needs it.
  globalObject[globalObject.Symbol.for('jest-native-promise')] = Promise;

  // Forward some APIs.
  DTRACE.forEach(dtrace => {
    globalObject[dtrace] = function() {
      for (
        var _len = arguments.length, args = Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key];
      }

      return commonjsGlobal[dtrace].apply(this, args);
    };
  });

  // Forward some others (this breaks the sandbox but for now it's OK).
  globalObject.Buffer = commonjsGlobal.Buffer;
  globalObject.setImmediate = commonjsGlobal.setImmediate;
  globalObject.clearImmediate = commonjsGlobal.clearImmediate;

  return Object.assign(
    globalObject,
    (0, (_deep_cyclic_copy || _load_deep_cyclic_copy()).default)(globals)
  );
};

var _create_process_object;

function _load_create_process_object() {
  return (_create_process_object = _interopRequireDefault(
    create_process_object
  ));
}

var _deep_cyclic_copy;

function _load_deep_cyclic_copy() {
  return (_deep_cyclic_copy = _interopRequireDefault(
    deep_cyclic_copy
  ));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const DTRACE = Object.keys(commonjsGlobal).filter(key => key.startsWith('DTRACE'));
});

unwrapExports(install_common_globals);

var null_console = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Console;

function _load_Console() {
  return (_Console = _interopRequireDefault(Console));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

class NullConsole extends (_Console || _load_Console()).default {
  assert() {}
  debug() {}
  dir() {}
  error() {}
  info() {}
  log() {}
  time() {}
  timeEnd() {}
  trace() {}
  warn() {}
}
exports.default = NullConsole;
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
});

unwrapExports(null_console);

var vendors = [
  {
    "name": "AppVeyor",
    "constant": "APPVEYOR",
    "env": "APPVEYOR",
    "pr": "APPVEYOR_PULL_REQUEST_NUMBER"
  },
  {
    "name": "Bamboo",
    "constant": "BAMBOO",
    "env": "bamboo_planKey"
  },
  {
    "name": "Bitbucket Pipelines",
    "constant": "BITBUCKET",
    "env": "BITBUCKET_COMMIT"
  },
  {
    "name": "Bitrise",
    "constant": "BITRISE",
    "env": "BITRISE_IO",
    "pr": "BITRISE_PULL_REQUEST"
  },
  {
    "name": "Buddy",
    "constant": "BUDDY",
    "env": "BUDDY_WORKSPACE_ID",
    "pr": "BUDDY_EXECUTION_PULL_REQUEST_ID"
  },
  {
    "name": "Buildkite",
    "constant": "BUILDKITE",
    "env": "BUILDKITE",
    "pr": { "env": "BUILDKITE_PULL_REQUEST", "ne": "false" }
  },
  {
    "name": "CircleCI",
    "constant": "CIRCLE",
    "env": "CIRCLECI",
    "pr": "CIRCLE_PULL_REQUEST"
  },
  {
    "name": "Cirrus CI",
    "constant": "CIRRUS",
    "env": "CIRRUS_CI",
    "pr": "CIRRUS_PR"
  },
  {
    "name": "AWS CodeBuild",
    "constant": "CODEBUILD",
    "env": "CODEBUILD_BUILD_ARN"
  },
  {
    "name": "Codeship",
    "constant": "CODESHIP",
    "env": { "CI_NAME": "codeship" }
  },
  {
    "name": "Drone",
    "constant": "DRONE",
    "env": "DRONE",
    "pr": { "DRONE_BUILD_EVENT": "pull_request" }
  },
  {
    "name": "dsari",
    "constant": "DSARI",
    "env": "DSARI"
  },
  {
    "name": "GitLab CI",
    "constant": "GITLAB",
    "env": "GITLAB_CI"
  },
  {
    "name": "GoCD",
    "constant": "GOCD",
    "env": "GO_PIPELINE_LABEL"
  },
  {
    "name": "Hudson",
    "constant": "HUDSON",
    "env": "HUDSON_URL"
  },
  {
    "name": "Jenkins",
    "constant": "JENKINS",
    "env": ["JENKINS_URL", "BUILD_ID"],
    "pr": { "any": ["ghprbPullId", "CHANGE_ID"] }
  },
  {
    "name": "Magnum CI",
    "constant": "MAGNUM",
    "env": "MAGNUM"
  },
  {
    "name": "Sail CI",
    "constant": "SAIL",
    "env": "SAILCI",
    "pr": "SAIL_PULL_REQUEST_NUMBER"
  },
  {
    "name": "Semaphore",
    "constant": "SEMAPHORE",
    "env": "SEMAPHORE",
    "pr": "PULL_REQUEST_NUMBER"
  },
  {
    "name": "Shippable",
    "constant": "SHIPPABLE",
    "env": "SHIPPABLE",
    "pr": { "IS_PULL_REQUEST": "true" }
  },
  {
    "name": "Solano CI",
    "constant": "SOLANO",
    "env": "TDDIUM",
    "pr": "TDDIUM_PR_ID"
  },
  {
    "name": "Strider CD",
    "constant": "STRIDER",
    "env": "STRIDER"
  },
  {
    "name": "TaskCluster",
    "constant": "TASKCLUSTER",
    "env": ["TASK_ID", "RUN_ID"]
  },
  {
    "name": "Solano CI",
    "constant": "TDDIUM",
    "env": "TDDIUM",
    "pr": "TDDIUM_PR_ID",
    "deprecated": true
  },
  {
    "name": "TeamCity",
    "constant": "TEAMCITY",
    "env": "TEAMCITY_VERSION"
  },
  {
    "name": "Team Foundation Server",
    "constant": "TFS",
    "env": "TF_BUILD"
  },
  {
    "name": "Travis CI",
    "constant": "TRAVIS",
    "env": "TRAVIS",
    "pr": { "env": "TRAVIS_PULL_REQUEST", "ne": "false" }
  }
]
;

var vendors$1 = /*#__PURE__*/Object.freeze({
    default: vendors
});

var vendors$2 = getCjsExportFromNamespace(vendors$1);

var ciInfo = createCommonjsModule(function (module, exports) {



var env = process.env;

// Used for testinging only
Object.defineProperty(exports, '_vendors', {
  value: vendors$2.map(function (v) { return v.constant })
});

exports.name = null;
exports.isPR = null;

vendors$2.forEach(function (vendor) {
  var envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  var isCI = envs.every(function (obj) {
    return checkEnv(obj)
  });

  exports[vendor.constant] = isCI;

  if (isCI) {
    exports.name = vendor.name;

    switch (typeof vendor.pr) {
      case 'string':
        // "pr": "CIRRUS_PR"
        exports.isPR = !!env[vendor.pr];
        break
      case 'object':
        if ('env' in vendor.pr) {
          // "pr": { "env": "BUILDKITE_PULL_REQUEST", "ne": "false" }
          exports.isPR = vendor.pr.env in env && env[vendor.pr.env] !== vendor.pr.ne;
        } else if ('any' in vendor.pr) {
          // "pr": { "any": ["ghprbPullId", "CHANGE_ID"] }
          exports.isPR = vendor.pr.any.some(function (key) {
            return !!env[key]
          });
        } else {
          // "pr": { "DRONE_BUILD_EVENT": "pull_request" }
          exports.isPR = checkEnv(vendor.pr);
        }
        break
      default:
        // PR detection not supported for this vendor
        exports.isPR = null;
    }
  }
});

exports.isCI = !!(
  env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari
  env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
  env.BUILD_NUMBER || // Jenkins, TeamCity
  env.RUN_ID || // TaskCluster, dsari
  exports.name ||
  false
);

function checkEnv (obj) {
  if (typeof obj === 'string') return !!env[obj]
  return Object.keys(obj).every(function (k) {
    return env[k] === obj[k]
  })
}
});
var ciInfo_1 = ciInfo.name;
var ciInfo_2 = ciInfo.isPR;
var ciInfo_3 = ciInfo.isCI;

var isCi = ciInfo.isCI;

var is_interative = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _isCi;

function _load_isCi() {
  return (_isCi = _interopRequireDefault(isCi));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

exports.default =
  process.stdout.isTTY &&
  process.env.TERM !== 'dumb' &&
  !(_isCi || _load_isCi()).default;
});

unwrapExports(is_interative);

var convert_descriptor_to_string = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = convertDescriptorToString;
/**
 * Copyright (c) 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

// See: https://github.com/facebook/jest/pull/5154
function convertDescriptorToString(descriptor) {
  if (
    typeof descriptor === 'string' ||
    typeof descriptor === 'number' ||
    descriptor === undefined
  ) {
    return descriptor;
  }

  if (typeof descriptor !== 'function') {
    throw new Error('describe expects a class, function, number, or string.');
  }

  if (descriptor.name !== undefined) {
    return descriptor.name;
  }

  // Fallback for old browsers, pardon Flow
  const stringified = descriptor.toString();
  const typeDescriptorMatch = stringified.match(/class|function/);
  const indexOfNameSpace =
    // $FlowFixMe
    typeDescriptorMatch.index + typeDescriptorMatch[0].length;
  // $FlowFixMe
  const indexOfNameAfterSpace = stringified.search(/\(|\{/, indexOfNameSpace);
  const name = stringified.substring(indexOfNameSpace, indexOfNameAfterSpace);
  return name.trim();
}
});

unwrapExports(convert_descriptor_to_string);

var build$1 = createCommonjsModule(function (module) {

var _mkdirp;

function _load_mkdirp() {
  return (_mkdirp = _interopRequireDefault(mkdirp));
}

var _buffered_console;

function _load_buffered_console() {
  return (_buffered_console = _interopRequireDefault(
    buffered_console
  ));
}

var _clear_line;

function _load_clear_line() {
  return (_clear_line = _interopRequireDefault(clear_line));
}

var _Console;

function _load_Console() {
  return (_Console = _interopRequireDefault(Console));
}

var _fake_timers;

function _load_fake_timers() {
  return (_fake_timers = _interopRequireDefault(fake_timers));
}

var _format_test_results;

function _load_format_test_results() {
  return (_format_test_results = _interopRequireDefault(
    format_test_results
  ));
}

var _get_failed_snapshot_tests;

function _load_get_failed_snapshot_tests() {
  return (_get_failed_snapshot_tests = _interopRequireDefault(
    get_failed_snapshot_tests
  ));
}

var _get_console_output;

function _load_get_console_output() {
  return (_get_console_output = _interopRequireDefault(
    get_console_output
  ));
}

var _install_common_globals;

function _load_install_common_globals() {
  return (_install_common_globals = _interopRequireDefault(
    install_common_globals
  ));
}

var _null_console;

function _load_null_console() {
  return (_null_console = _interopRequireDefault(null_console));
}

var _is_interative;

function _load_is_interative() {
  return (_is_interative = _interopRequireDefault(is_interative));
}

var _get_callsite;

function _load_get_callsite() {
  return (_get_callsite = _interopRequireDefault(get_callsite));
}

var _set_global;

function _load_set_global() {
  return (_set_global = _interopRequireDefault(set_global));
}

var _deep_cyclic_copy;

function _load_deep_cyclic_copy() {
  return (_deep_cyclic_copy = _interopRequireDefault(
    deep_cyclic_copy
  ));
}

var _convert_descriptor_to_string;

function _load_convert_descriptor_to_string() {
  return (_convert_descriptor_to_string = _interopRequireDefault(
    convert_descriptor_to_string
  ));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const createDirectory = path$$1 => {
  try {
    (_mkdirp || _load_mkdirp()).default.sync(path$$1, '777');
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }
};
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

module.exports = {
  BufferedConsole: (_buffered_console || _load_buffered_console()).default,
  Console: (_Console || _load_Console()).default,
  FakeTimers: (_fake_timers || _load_fake_timers()).default,
  NullConsole: (_null_console || _load_null_console()).default,
  clearLine: (_clear_line || _load_clear_line()).default,
  convertDescriptorToString: (
    _convert_descriptor_to_string || _load_convert_descriptor_to_string()
  ).default,
  createDirectory: createDirectory,
  deepCyclicCopy: (_deep_cyclic_copy || _load_deep_cyclic_copy()).default,
  formatTestResults: (_format_test_results || _load_format_test_results())
    .default,
  getCallsite: (_get_callsite || _load_get_callsite()).default,
  getConsoleOutput: (_get_console_output || _load_get_console_output()).default,
  getFailedSnapshotTests: (
    _get_failed_snapshot_tests || _load_get_failed_snapshot_tests()
  ).default,
  installCommonGlobals: (
    _install_common_globals || _load_install_common_globals()
  ).default,
  isInteractive: (_is_interative || _load_is_interative()).default,
  setGlobal: (_set_global || _load_set_global()).default
};
});

unwrapExports(build$1);
var build_1$1 = build$1.BufferedConsole;
var build_2$1 = build$1.Console;
var build_3$1 = build$1.FakeTimers;
var build_4$1 = build$1.NullConsole;
var build_5$1 = build$1.clearLine;
var build_6$1 = build$1.convertDescriptorToString;
var build_7 = build$1.createDirectory;
var build_8 = build$1.deepCyclicCopy;
var build_9 = build$1.formatTestResults;
var build_10 = build$1.getCallsite;
var build_11 = build$1.getConsoleOutput;
var build_12 = build$1.getFailedSnapshotTests;
var build_13 = build$1.installCommonGlobals;
var build_14 = build$1.isInteractive;
var build_15 = build$1.setGlobal;

var build$2 = createCommonjsModule(function (module) {

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const MOCK_CONSTRUCTOR_NAME = 'mockConstructor';

/**
 * Represents the result of a single call to a mock function.
 */

const FUNCTION_NAME_RESERVED_PATTERN = /[\s!-\/:-@\[-`{-~]/;
const FUNCTION_NAME_RESERVED_REPLACE = new RegExp(
  FUNCTION_NAME_RESERVED_PATTERN.source,
  'g'
);

const RESERVED_KEYWORDS = Object.assign(Object.create(null), {
  arguments: true,
  await: true,
  break: true,
  case: true,
  catch: true,
  class: true,
  const: true,
  continue: true,
  debugger: true,
  default: true,
  delete: true,
  do: true,
  else: true,
  enum: true,
  eval: true,
  export: true,
  extends: true,
  false: true,
  finally: true,
  for: true,
  function: true,
  if: true,
  implements: true,
  import: true,
  in: true,
  instanceof: true,
  interface: true,
  let: true,
  new: true,
  null: true,
  package: true,
  private: true,
  protected: true,
  public: true,
  return: true,
  static: true,
  super: true,
  switch: true,
  this: true,
  throw: true,
  true: true,
  try: true,
  typeof: true,
  var: true,
  void: true,
  while: true,
  with: true,
  yield: true
});

function matchArity(fn, length) {
  let mockConstructor;

  switch (length) {
    case 1:
      mockConstructor = function(a) {
        return fn.apply(this, arguments);
      };
      break;
    case 2:
      mockConstructor = function(a, b) {
        return fn.apply(this, arguments);
      };
      break;
    case 3:
      mockConstructor = function(a, b, c) {
        return fn.apply(this, arguments);
      };
      break;
    case 4:
      mockConstructor = function(a, b, c, d) {
        return fn.apply(this, arguments);
      };
      break;
    case 5:
      mockConstructor = function(a, b, c, d, e) {
        return fn.apply(this, arguments);
      };
      break;
    case 6:
      mockConstructor = function(a, b, c, d, e, f) {
        return fn.apply(this, arguments);
      };
      break;
    case 7:
      mockConstructor = function(a, b, c, d, e, f, g) {
        return fn.apply(this, arguments);
      };
      break;
    case 8:
      mockConstructor = function(a, b, c, d, e, f, g, h) {
        return fn.apply(this, arguments);
      };
      break;
    case 9:
      mockConstructor = function(a, b, c, d, e, f, g, h, i) {
        return fn.apply(this, arguments);
      };
      break;
    default:
      mockConstructor = function() {
        return fn.apply(this, arguments);
      };
      break;
  }

  return mockConstructor;
}

function isA(typeName, value) {
  return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
}

function getType(ref) {
  if (
    isA('Function', ref) ||
    isA('AsyncFunction', ref) ||
    isA('GeneratorFunction', ref)
  ) {
    return 'function';
  } else if (Array.isArray(ref)) {
    return 'array';
  } else if (isA('Object', ref)) {
    return 'object';
  } else if (
    isA('Number', ref) ||
    isA('String', ref) ||
    isA('Boolean', ref) ||
    isA('Symbol', ref)
  ) {
    return 'constant';
  } else if (isA('Map', ref) || isA('WeakMap', ref) || isA('Set', ref)) {
    return 'collection';
  } else if (isA('RegExp', ref)) {
    return 'regexp';
  } else if (ref === undefined) {
    return 'undefined';
  } else if (ref === null) {
    return 'null';
  } else {
    return null;
  }
}

function isReadonlyProp(object, prop) {
  return (
    ((prop === 'arguments' ||
      prop === 'caller' ||
      prop === 'callee' ||
      prop === 'name' ||
      prop === 'length') &&
      (isA('Function', object) ||
        isA('AsyncFunction', object) ||
        isA('GeneratorFunction', object))) ||
    ((prop === 'source' ||
      prop === 'global' ||
      prop === 'ignoreCase' ||
      prop === 'multiline') &&
      isA('RegExp', object))
  );
}

function getSlots(object) {
  const slots = {};
  if (!object) {
    return [];
  }

  let parent = Object.getPrototypeOf(object);
  do {
    if (object === Object.getPrototypeOf(Function)) {
      break;
    }
    const ownNames = Object.getOwnPropertyNames(object);
    for (let i = 0; i < ownNames.length; i++) {
      const prop = ownNames[i];
      if (!isReadonlyProp(object, prop)) {
        const propDesc = Object.getOwnPropertyDescriptor(object, prop);
        if ((propDesc !== undefined && !propDesc.get) || object.__esModule) {
          slots[prop] = true;
        }
      }
    }
    object = parent;
  } while (object && (parent = Object.getPrototypeOf(object)) !== null);
  return Object.keys(slots);
}

class ModuleMockerClass {
  /**
   * @see README.md
   * @param global Global object of the test environment, used to create
   * mocks
   */
  constructor(global) {
    this._environmentGlobal = global;
    this._mockState = new WeakMap();
    this._mockConfigRegistry = new WeakMap();
    this._spyState = new Set();
    this.ModuleMocker = ModuleMockerClass;
    this._invocationCallCounter = 1;
  }

  _ensureMockConfig(f) {
    let config = this._mockConfigRegistry.get(f);
    if (!config) {
      config = this._defaultMockConfig();
      this._mockConfigRegistry.set(f, config);
    }
    return config;
  }

  _ensureMockState(f) {
    let state = this._mockState.get(f);
    if (!state) {
      state = this._defaultMockState();
      this._mockState.set(f, state);
    }
    return state;
  }

  _defaultMockConfig() {
    return {
      defaultReturnValue: undefined,
      isReturnValueLastSet: false,
      mockImpl: undefined,
      mockName: 'jest.fn()',
      specificMockImpls: [],
      specificReturnValues: []
    };
  }

  _defaultMockState() {
    return {
      calls: [],
      instances: [],
      invocationCallOrder: [],
      results: []
    };
  }

  _makeComponent(metadata, restore) {
    if (metadata.type === 'object') {
      return new this._environmentGlobal.Object();
    } else if (metadata.type === 'array') {
      return new this._environmentGlobal.Array();
    } else if (metadata.type === 'regexp') {
      return new this._environmentGlobal.RegExp('');
    } else if (
      metadata.type === 'constant' ||
      metadata.type === 'collection' ||
      metadata.type === 'null' ||
      metadata.type === 'undefined'
    ) {
      return metadata.value;
    } else if (metadata.type === 'function') {
      /* eslint-disable prefer-const */
      let f;
      /* eslint-enable prefer-const */

      const prototype =
        (metadata.members &&
          metadata.members.prototype &&
          metadata.members.prototype.members) ||
        {};
      const prototypeSlots = getSlots(prototype);
      const mocker = this;
      const mockConstructor = matchArity(function() {
        const mockState = mocker._ensureMockState(f);
        const mockConfig = mocker._ensureMockConfig(f);
        mockState.instances.push(this);
        mockState.calls.push(Array.prototype.slice.call(arguments));
        mockState.invocationCallOrder.push(mocker._invocationCallCounter++);

        // Will be set to the return value of the mock if an error is not thrown
        let finalReturnValue;
        // Will be set to the error that is thrown by the mock (if it throws)
        let thrownError;
        // Will be set to true if the mock throws an error. The presence of a
        // value in `thrownError` is not a 100% reliable indicator because a
        // function could throw a value of undefined.
        let callDidThrowError = false;

        try {
          // The bulk of the implementation is wrapped in an immediately
          // executed arrow function so the return value of the mock function
          // can be easily captured and recorded, despite the many separate
          // return points within the logic.
          finalReturnValue = (() => {
            if (this instanceof f) {
              // This is probably being called as a constructor
              prototypeSlots.forEach(slot => {
                // Copy prototype methods to the instance to make
                // it easier to interact with mock instance call and
                // return values
                if (prototype[slot].type === 'function') {
                  const protoImpl = this[slot];
                  this[slot] = mocker.generateFromMetadata(prototype[slot]);
                  this[slot]._protoImpl = protoImpl;
                }
              });

              // Run the mock constructor implementation
              const mockImpl = mockConfig.specificMockImpls.length
                ? mockConfig.specificMockImpls.shift()
                : mockConfig.mockImpl;
              return mockImpl && mockImpl.apply(this, arguments);
            }

            const returnValue = mockConfig.defaultReturnValue;
            // If return value is last set, either specific or default, i.e.
            // mockReturnValueOnce()/mockReturnValue() is called and no
            // mockImplementationOnce()/mockImplementation() is called after
            // that.
            // use the set return value.
            if (mockConfig.specificReturnValues.length) {
              return mockConfig.specificReturnValues.shift();
            }

            if (mockConfig.isReturnValueLastSet) {
              return mockConfig.defaultReturnValue;
            }

            // If mockImplementationOnce()/mockImplementation() is last set,
            // or specific return values are used up, use the mock
            // implementation.
            let specificMockImpl;
            if (returnValue === undefined) {
              specificMockImpl = mockConfig.specificMockImpls.shift();
              if (specificMockImpl === undefined) {
                specificMockImpl = mockConfig.mockImpl;
              }
              if (specificMockImpl) {
                return specificMockImpl.apply(this, arguments);
              }
            }

            // Otherwise use prototype implementation
            if (returnValue === undefined && f._protoImpl) {
              return f._protoImpl.apply(this, arguments);
            }

            return returnValue;
          })();
        } catch (error) {
          // Store the thrown error so we can record it, then re-throw it.
          thrownError = error;
          callDidThrowError = true;
          throw error;
        } finally {
          // Record the result of the function
          mockState.results.push({
            isThrow: callDidThrowError,
            value: callDidThrowError ? thrownError : finalReturnValue
          });
        }

        return finalReturnValue;
      }, metadata.length || 0);

      f = this._createMockFunction(metadata, mockConstructor);
      f._isMockFunction = true;
      f.getMockImplementation = () => this._ensureMockConfig(f).mockImpl;

      if (typeof restore === 'function') {
        this._spyState.add(restore);
      }

      this._mockState.set(f, this._defaultMockState());
      this._mockConfigRegistry.set(f, this._defaultMockConfig());

      // $FlowFixMe - defineProperty getters not supported
      Object.defineProperty(f, 'mock', {
        configurable: false,
        enumerable: true,
        get: () => this._ensureMockState(f),
        set: val => this._mockState.set(f, val)
      });

      f.mockClear = () => {
        this._mockState.delete(f);
        return f;
      };

      f.mockReset = () => {
        f.mockClear();
        this._mockConfigRegistry.delete(f);
        return f;
      };

      f.mockRestore = () => {
        f.mockReset();
        return restore ? restore() : undefined;
      };

      f.mockReturnValueOnce = value => {
        // next function call will return this value or default return value
        const mockConfig = this._ensureMockConfig(f);
        mockConfig.specificReturnValues.push(value);
        return f;
      };

      f.mockResolvedValueOnce = value =>
        f.mockImplementationOnce(() => Promise.resolve(value));

      f.mockRejectedValueOnce = value =>
        f.mockImplementationOnce(() => Promise.reject(value));

      f.mockReturnValue = value => {
        // next function call will return specified return value or this one
        const mockConfig = this._ensureMockConfig(f);
        mockConfig.isReturnValueLastSet = true;
        mockConfig.defaultReturnValue = value;
        return f;
      };

      f.mockResolvedValue = value =>
        f.mockImplementation(() => Promise.resolve(value));

      f.mockRejectedValue = value =>
        f.mockImplementation(() => Promise.reject(value));

      f.mockImplementationOnce = fn => {
        // next function call will use this mock implementation return value
        // or default mock implementation return value
        const mockConfig = this._ensureMockConfig(f);
        mockConfig.isReturnValueLastSet = false;
        mockConfig.specificMockImpls.push(fn);
        return f;
      };

      f.mockImplementation = fn => {
        // next function call will use mock implementation return value
        const mockConfig = this._ensureMockConfig(f);
        mockConfig.isReturnValueLastSet = false;
        mockConfig.defaultReturnValue = undefined;
        mockConfig.mockImpl = fn;
        return f;
      };

      f.mockReturnThis = () =>
        f.mockImplementation(function() {
          return this;
        });

      f.mockName = name => {
        if (name) {
          const mockConfig = this._ensureMockConfig(f);
          mockConfig.mockName = name;
        }
        return f;
      };

      f.getMockName = () => {
        const mockConfig = this._ensureMockConfig(f);
        return mockConfig.mockName || 'jest.fn()';
      };

      if (metadata.mockImpl) {
        f.mockImplementation(metadata.mockImpl);
      }

      return f;
    } else {
      const unknownType = metadata.type || 'undefined type';
      throw new Error('Unrecognized type ' + unknownType);
    }
  }

  _createMockFunction(metadata, mockConstructor) {
    let name = metadata.name;
    if (!name) {
      return mockConstructor;
    }

    // Preserve `name` property of mocked function.
    const boundFunctionPrefix = 'bound ';
    let bindCall = '';
    // if-do-while for perf reasons. The common case is for the if to fail.
    if (name && name.startsWith(boundFunctionPrefix)) {
      do {
        name = name.substring(boundFunctionPrefix.length);
        // Call bind() just to alter the function name.
        bindCall = '.bind(null)';
      } while (name && name.startsWith(boundFunctionPrefix));
    }

    // Special case functions named `mockConstructor` to guard for infinite
    // loops.
    if (name === MOCK_CONSTRUCTOR_NAME) {
      return mockConstructor;
    }

    // It's a syntax error to define functions with a reserved keyword
    // as name.
    if (RESERVED_KEYWORDS[name]) {
      name = '$' + name;
    }

    // It's also a syntax error to define a function with a reserved character
    // as part of it's name.
    if (FUNCTION_NAME_RESERVED_PATTERN.test(name)) {
      name = name.replace(FUNCTION_NAME_RESERVED_REPLACE, '$');
    }

    const body =
      'return function ' +
      name +
      '() {' +
      'return ' +
      MOCK_CONSTRUCTOR_NAME +
      '.apply(this,arguments);' +
      '}' +
      bindCall;
    const createConstructor = new this._environmentGlobal.Function(
      MOCK_CONSTRUCTOR_NAME,
      body
    );

    return createConstructor(mockConstructor);
  }

  _generateMock(metadata, callbacks, refs) {
    const mock = this._makeComponent(metadata);
    if (metadata.refID != null) {
      refs[metadata.refID] = mock;
    }

    getSlots(metadata.members).forEach(slot => {
      const slotMetadata = (metadata.members && metadata.members[slot]) || {};
      if (slotMetadata.ref != null) {
        callbacks.push(() => (mock[slot] = refs[slotMetadata.ref]));
      } else {
        mock[slot] = this._generateMock(slotMetadata, callbacks, refs);
      }
    });

    if (
      metadata.type !== 'undefined' &&
      metadata.type !== 'null' &&
      mock.prototype
    ) {
      mock.prototype.constructor = mock;
    }

    return mock;
  }

  /**
   * @see README.md
   * @param metadata Metadata for the mock in the schema returned by the
   * getMetadata method of this module.
   */
  generateFromMetadata(_metadata) {
    const callbacks = [];
    const refs = {};
    const mock = this._generateMock(_metadata, callbacks, refs);
    callbacks.forEach(setter => setter());
    return mock;
  }

  /**
   * @see README.md
   * @param component The component for which to retrieve metadata.
   */
  getMetadata(component, _refs) {
    const refs = _refs || new Map();
    const ref = refs.get(component);
    if (ref != null) {
      return {ref};
    }

    const type = getType(component);
    if (!type) {
      return null;
    }

    const metadata = {type};
    if (
      type === 'constant' ||
      type === 'collection' ||
      type === 'undefined' ||
      type === 'null'
    ) {
      metadata.value = component;
      return metadata;
    } else if (type === 'function') {
      metadata.name = component.name;
      if (component._isMockFunction) {
        metadata.mockImpl = component.getMockImplementation();
      }
    }

    metadata.refID = refs.size;
    refs.set(component, metadata.refID);

    let members = null;
    // Leave arrays alone
    if (type !== 'array') {
      if (type !== 'undefined') {
        getSlots(component).forEach(slot => {
          if (
            type === 'function' &&
            component._isMockFunction &&
            slot.match(/^mock/)
          ) {
            return;
          }

          if (
            (!component.hasOwnProperty && component[slot] !== undefined) ||
            (component.hasOwnProperty && component.hasOwnProperty(slot)) ||
            (type === 'object' && component[slot] != Object.prototype[slot])
          ) {
            const slotMetadata = this.getMetadata(component[slot], refs);
            if (slotMetadata) {
              if (!members) {
                members = {};
              }
              members[slot] = slotMetadata;
            }
          }
        });
      }

      // If component is native code function, prototype might be undefined
      if (type === 'function' && component.prototype) {
        const prototype = this.getMetadata(component.prototype, refs);
        if (prototype && prototype.members) {
          if (!members) {
            members = {};
          }
          members.prototype = prototype;
        }
      }
    }

    if (members) {
      metadata.members = members;
    }

    return metadata;
  }

  isMockFunction(fn) {
    return !!(fn && fn._isMockFunction);
  }

  fn(implementation) {
    const length = implementation ? implementation.length : 0;
    const fn = this._makeComponent({length, type: 'function'});
    if (implementation) {
      fn.mockImplementation(implementation);
    }
    return fn;
  }

  spyOn(object, methodName, accessType) {
    if (accessType) {
      return this._spyOnProperty(object, methodName, accessType);
    }

    if (typeof object !== 'object' && typeof object !== 'function') {
      throw new Error(
        'Cannot spyOn on a primitive value; ' + this._typeOf(object) + ' given'
      );
    }

    const original = object[methodName];

    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(
          'Cannot spy the ' +
            methodName +
            ' property because it is not a function; ' +
            this._typeOf(original) +
            ' given instead'
        );
      }

      object[methodName] = this._makeComponent({type: 'function'}, () => {
        object[methodName] = original;
      });

      object[methodName].mockImplementation(function() {
        return original.apply(this, arguments);
      });
    }

    return object[methodName];
  }

  _spyOnProperty(obj, propertyName) {
    let accessType =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'get';

    if (typeof obj !== 'object' && typeof obj !== 'function') {
      throw new Error(
        'Cannot spyOn on a primitive value; ' + this._typeOf(obj) + ' given'
      );
    }

    if (!obj) {
      throw new Error(
        'spyOn could not find an object to spy upon for ' + propertyName + ''
      );
    }

    if (!propertyName) {
      throw new Error('No property name supplied');
    }

    let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
    let proto = Object.getPrototypeOf(obj);

    while (!descriptor && proto !== null) {
      descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
      proto = Object.getPrototypeOf(proto);
    }

    if (!descriptor) {
      throw new Error(propertyName + ' property does not exist');
    }

    if (!descriptor.configurable) {
      throw new Error(propertyName + ' is not declared configurable');
    }

    if (!descriptor[accessType]) {
      throw new Error(
        'Property ' + propertyName + ' does not have access type ' + accessType
      );
    }

    const original = descriptor[accessType];

    if (!this.isMockFunction(original)) {
      if (typeof original !== 'function') {
        throw new Error(
          'Cannot spy the ' +
            propertyName +
            ' property because it is not a function; ' +
            this._typeOf(original) +
            ' given instead'
        );
      }

      descriptor[accessType] = this._makeComponent({type: 'function'}, () => {
        // $FlowFixMe
        descriptor[accessType] = original;
        // $FlowFixMe
        Object.defineProperty(obj, propertyName, descriptor);
      });

      descriptor[accessType].mockImplementation(function() {
        return original.apply(this, arguments);
      });
    }

    Object.defineProperty(obj, propertyName, descriptor);
    return descriptor[accessType];
  }

  clearAllMocks() {
    this._mockState = new WeakMap();
  }

  resetAllMocks() {
    this._mockConfigRegistry = new WeakMap();
    this._mockState = new WeakMap();
  }

  restoreAllMocks() {
    this._spyState.forEach(restore => restore());
    this._spyState = new Set();
  }

  _typeOf(value) {
    return value == null ? '' + value : typeof value;
  }
}

module.exports = new ModuleMockerClass(commonjsGlobal);
});

unwrapExports(build$2);

var build$3 = createCommonjsModule(function (module) {

var _vm;

function _load_vm() {
  return (_vm = _interopRequireDefault(vm));
}

var _jestUtil;

function _load_jestUtil() {
  return (_jestUtil = build$1);
}

var _jestMock;

function _load_jestMock() {
  return (_jestMock = _interopRequireDefault(build$2));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

class NodeEnvironment {
  constructor(config) {
    this.context = (_vm || _load_vm()).default.createContext();
    const global = (this.global = (_vm || _load_vm()).default.runInContext(
      'this',
      Object.assign(this.context, config.testEnvironmentOptions)
    ));
    global.global = global;
    global.clearInterval = clearInterval;
    global.clearTimeout = clearTimeout;
    global.setInterval = setInterval;
    global.setTimeout = setTimeout;
    // URL and URLSearchParams are global in Node >= 10
    if (typeof URL !== 'undefined' && typeof URLSearchParams !== 'undefined') {
      /* global URL, URLSearchParams */
      global.URL = URL;
      global.URLSearchParams = URLSearchParams;
    }
    (0, (_jestUtil || _load_jestUtil()).installCommonGlobals)(
      global,
      config.globals
    );
    this.moduleMocker = new (
      _jestMock || _load_jestMock()
    ).default.ModuleMocker(global);

    const timerIdToRef = id => ({
      id: id,
      ref: function() {
        return this;
      },
      unref: function() {
        return this;
      }
    });

    const timerRefToId = timer => (timer && timer.id) || null;

    const timerConfig = {
      idToRef: timerIdToRef,
      refToId: timerRefToId
    };

    this.fakeTimers = new (_jestUtil || _load_jestUtil()).FakeTimers({
      config: config,
      global: global,
      moduleMocker: this.moduleMocker,
      timerConfig: timerConfig
    });
  }

  setup() {
    return Promise.resolve();
  }

  teardown() {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }
    this.context = null;
    this.fakeTimers = null;
    return Promise.resolve();
  }

  // Disabling rule as return type depends on script's return type.
  /* eslint-disable flowtype/no-weak-types */
  runScript(script) {
    /* eslint-enable flowtype/no-weak-types */
    if (this.context) {
      return script.runInContext(this.context);
    }
    return null;
  }
}
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

module.exports = NodeEnvironment;
});

var NodeEnvironment = unwrapExports(build$3);

function createJestPuppeteerEnvironment() {
    const JestEnvironment = class extends NodeEnvironment {
        constructor(config) {
            super(config);
            this.browser = null;
            this.pages = [];
        }
        setup() {
            return __awaiter(this, void 0, void 0, function* () {
                if (process.env.__STENCIL_E2E_TESTS__ === 'true') {
                    this.global.__NEW_TEST_PAGE__ = this.newPuppeteerPage.bind(this);
                }
            });
        }
        newPuppeteerPage() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.browser) {
                    // load the browser and page on demand
                    this.browser = yield connectBrowser();
                }
                if (!this.browser) {
                    return null;
                }
                const page = yield newBrowserPage(this.browser);
                this.pages.push(page);
                return page;
            });
        }
        teardown() {
            const _super = Object.create(null, {
                teardown: { get: () => super.teardown }
            });
            return __awaiter(this, void 0, void 0, function* () {
                yield _super.teardown.call(this);
                yield disconnectBrowser(this.browser, this.pages);
                this.pages.length = 0;
                this.browser = null;
            });
        }
    };
    return JestEnvironment;
}

function buildJestArgv(config) {
    const yargs = require('yargs');
    const args = [
        ...config.flags.unknownArgs.slice(),
        ...config.flags.knownArgs.slice()
    ];
    if (config.flags.e2e && config.flags.ci && !args.some(a => a.startsWith('--maxWorkers'))) {
        args.push('--maxWorkers=4');
    }
    config.logger.debug(`jest args: ${args.join(' ')}`);
    const { options } = require('jest-cli/build/cli/args');
    const jestArgv = yargs(args).options(options).argv;
    jestArgv.config = buildJestConfig(config);
    return jestArgv;
}
function buildJestConfig(config) {
    const jestDefaults = require('jest-config').defaults;
    const validJestConfigKeys = Object.keys(jestDefaults);
    const jestConfig = {};
    Object.keys(config.testing).forEach(key => {
        if (validJestConfigKeys.includes(key)) {
            jestConfig[key] = config.testing[key];
        }
    });
    jestConfig.rootDir = config.rootDir;
    if (Array.isArray(config.testing.reporters)) {
        jestConfig.reporters = config.testing.reporters;
    }
    return JSON.stringify(jestConfig);
}
function getProjectListFromCLIArgs(config, argv) {
    const projects = argv.projects ? argv.projects : [];
    projects.push(config.rootDir);
    return projects;
}

function setScreenshotEmulateData(userEmulateConfig, env) {
    const screenshotEmulate = {
        userAgent: 'default',
        viewport: {
            width: 800,
            height: 600,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: false
        }
    };
    if (typeof userEmulateConfig.device === 'string') {
        try {
            const deviceDescriptors = require(env.__STENCIL_PUPPETEER_MODULE__ + '/DeviceDescriptors');
            const puppeteerEmulateOpts = deviceDescriptors[userEmulateConfig.device];
            if (!puppeteerEmulateOpts) {
                console.error(`invalid emulate device: ${userEmulateConfig.device}`);
                return;
            }
            screenshotEmulate.device = userEmulateConfig.device;
            screenshotEmulate.userAgent = puppeteerEmulateOpts.userAgent;
            screenshotEmulate.viewport = puppeteerEmulateOpts.viewport;
        }
        catch (e) {
            console.error('error loading puppeteer DeviceDescriptors', e);
            return;
        }
    }
    if (userEmulateConfig.viewport) {
        if (typeof userEmulateConfig.viewport.width === 'number') {
            screenshotEmulate.viewport.width = userEmulateConfig.viewport.width;
        }
        if (typeof userEmulateConfig.viewport.height === 'number') {
            screenshotEmulate.viewport.height = userEmulateConfig.viewport.height;
        }
        if (typeof userEmulateConfig.viewport.deviceScaleFactor === 'number') {
            screenshotEmulate.viewport.deviceScaleFactor = userEmulateConfig.viewport.deviceScaleFactor;
        }
        if (typeof userEmulateConfig.viewport.hasTouch === 'boolean') {
            screenshotEmulate.viewport.hasTouch = userEmulateConfig.viewport.hasTouch;
        }
        if (typeof userEmulateConfig.viewport.isLandscape === 'boolean') {
            screenshotEmulate.viewport.isLandscape = userEmulateConfig.viewport.isLandscape;
        }
        if (typeof userEmulateConfig.viewport.isMobile === 'boolean') {
            screenshotEmulate.viewport.isMobile = userEmulateConfig.viewport.isMobile;
        }
        if (typeof userEmulateConfig.userAgent === 'string') {
            screenshotEmulate.userAgent = userEmulateConfig.userAgent;
        }
    }
    env.__STENCIL_EMULATE__ = JSON.stringify(screenshotEmulate);
}

function runJest(config, env) {
    return __awaiter(this, void 0, void 0, function* () {
        let success = false;
        try {
            // set all of the emulate configs to the process.env to be read later on
            const emulateConfigs = getEmulateConfigs(config.testing, config.flags);
            env.__STENCIL_EMULATE_CONFIGS__ = JSON.stringify(emulateConfigs);
            if (config.flags.ci || config.flags.e2e) {
                env.__STENCIL_DEFAULT_TIMEOUT__ = '30000';
            }
            else {
                env.__STENCIL_DEFAULT_TIMEOUT__ = '15000';
            }
            // build up our args from our already know list of args in the config
            const jestArgv = buildJestArgv(config);
            // build up the project paths, which is basically the app's root dir
            const projects = getProjectListFromCLIArgs(config, jestArgv);
            // run the jest-cli with our data rather than letting the
            // jest-cli parse the args itself
            const { runCLI } = require('jest-cli');
            const cliResults = yield runCLI(jestArgv, projects);
            success = !!cliResults.results.success;
        }
        catch (e) {
            config.logger.error(`runJest: ${e}`);
        }
        return success;
    });
}
function createTestRunner() {
    const TestRunner = require('jest-runner');
    class StencilTestRunner extends TestRunner {
        runTests(tests, watcher, onStart, onResult, onFailure, options) {
            const _super = Object.create(null, {
                runTests: { get: () => super.runTests }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const env = process.env;
                // filter out only the tests the flags said we should run
                tests = tests.filter(t => includeTestFile(t.path, env));
                if (env.__STENCIL_SCREENSHOT__ === 'true') {
                    // we're doing e2e screenshots, so let's loop through
                    // each of the emulate configs for each test
                    // get the emulate configs from the process env
                    // and parse the emulate config data
                    const emulateConfigs = JSON.parse(env.__STENCIL_EMULATE_CONFIGS__);
                    // loop through each emulate config to re-run the tests per config
                    for (let i = 0; i < emulateConfigs.length; i++) {
                        const emulateConfig = emulateConfigs[i];
                        // reset the environment for each emulate config
                        setScreenshotEmulateData(emulateConfig, env);
                        // run the test for each emulate config
                        yield _super.runTests.call(this, tests, watcher, onStart, onResult, onFailure, options);
                    }
                }
                else {
                    // not doing e2e screenshot tests
                    // so just run each test once
                    yield _super.runTests.call(this, tests, watcher, onStart, onResult, onFailure, options);
                }
            });
        }
    }
    return StencilTestRunner;
}
function includeTestFile(testPath, env) {
    testPath = testPath.toLowerCase().replace(/\\/g, '/');
    if (!(testPath.endsWith('.ts') || testPath.endsWith('.tsx'))) {
        return false;
    }
    if ((testPath.includes('.e2e.') || testPath.includes('/e2e.')) && env.__STENCIL_E2E_TESTS__ === 'true') {
        // keep this test if it's an e2e file and we should be testing e2e
        return true;
    }
    if ((testPath.includes('.spec.') || testPath.includes('/spec.')) && env.__STENCIL_SPEC_TESTS__ === 'true') {
        // keep this test if it's a spec file and we should be testing unit tests
        return true;
    }
    return false;
}
function getEmulateConfigs(testing, flags) {
    let emulateConfigs = testing.emulate.slice();
    if (typeof flags.emulate === 'string') {
        const emulateFlag = flags.emulate.toLowerCase();
        emulateConfigs = emulateConfigs.filter(emulateConfig => {
            if (typeof emulateConfig.device === 'string' && emulateConfig.device.toLowerCase() === emulateFlag) {
                return true;
            }
            if (typeof emulateConfig.userAgent === 'string' && emulateConfig.userAgent.toLowerCase().includes(emulateFlag)) {
                return true;
            }
            return false;
        });
    }
    return emulateConfigs;
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
        return nodeName(vnodeData, children || [], utils$1);
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
const utils$1 = {
    'forEach': (children, cb) => children.forEach(cb),
    'map': (children, cb) => children.map(cb)
};

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
/**
 * Default style mode id
 */
const DEFAULT_STYLE_MODE = '$';

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
    return normalizePath$1(config.sys.path.join.apply(config.sys.path, paths));
}
function normalizePath$1(str) {
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
const EXTENDED_PATH_REGEX = /^\\\\\?\\/;
const NON_ASCII_REGEX = /[^\x00-\x80]+/;
const SLASH_REGEX = /\\/g;

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
        d.absFilePath = normalizePath$1(tsDiagnostic.file.fileName);
        if (config) {
            d.relFilePath = normalizePath$1(config.sys.path.relative(config.cwd, d.absFilePath));
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

/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

var isExtglob$3 = function isExtglob(str) {
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


var chars$1 = { '{': '}', '(': ')', '[': ']'};

var isGlob$3 = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  if (isExtglob$3(str)) {
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
    var close = open ? chars$1[open] : null;
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
        if (isArray$1(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray$1 = Array.isArray || function (xs) {
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

function escapeBraces$1(str) {
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

  return expand$1(escapeBraces$1(str), true).map(unescapeBraces);
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded$1(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand$1(str, isTop) {
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
      return expand$1(str);
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
      n = expand$1(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand$1(m.post, false)
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
    ? expand$1(m.post, false)
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
    var pad = n.some(isPadded$1);

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
    N = concatMap(n, function(el) { return expand$1(el, false) });
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
var qmark$1 = '[^/]';

// * => any number of characters
var star$1 = qmark$1 + '*?';

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot$1 = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

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

minimatch.filter = filter$2;
function filter$2 (pattern, options) {
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
          re += star$1;
          hasMagic = true;
        break
        case '?':
          re += qmark$1;
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
    var t = pl.type === '*' ? star$1
      : pl.type === '?' ? qmark$1
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

Minimatch.prototype.makeRe = makeRe$1;
function makeRe$1 () {
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

  var twoStar = options.noglobstar ? star$1
    : options.dot ? twoStarDot$1
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

Minimatch.prototype.match = match$1;
function match$1 (f, partial) {
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
            if (isGlob$3(excludeHmr)) {
                shouldExclude = minimatch_1(fileChanged, excludeHmr);
            }
            else {
                shouldExclude = (normalizePath$1(excludeHmr) === normalizePath$1(fileChanged));
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
            return normalizePath$1(config.sys.path.relative(config.rootDir, m.jsFilePath));
        }).sort(),
        encapsulations: []
    };
    return buildEntry;
}
function getBuildBundle(config, entryBundle) {
    const buildBundle = {
        fileName: entryBundle.fileName,
        outputs: entryBundle.outputs.map(filePath => {
            return normalizePath$1(config.sys.path.relative(config.rootDir, filePath));
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
                            source: normalizePath$1(config.sys.path.relative(config.rootDir, c.moduleDir)),
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
                    const key = normalizePath$1(config.sys.path.relative(config.rootDir, moduleFile.sourceFilePath));
                    stats.sourceGraph[key] = moduleFile.localImports.map(localImport => {
                        return normalizePath$1(config.sys.path.relative(config.rootDir, localImport));
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

function getRegistryFileName(config) {
    return `${config.fsNamespace}.registry.json`;
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
        filePath = normalizePath$1(filePath);
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
        filePath = normalizePath$1(filePath);
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
        filePath = normalizePath$1(filePath);
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
        dirPath = normalizePath$1(dirPath);
        if (!this.dirsAdded.includes(dirPath)) {
            this.log('directory added', dirPath);
            this.dirsAdded.push(dirPath);
            this.queue();
        }
    }
    dirDelete(dirPath) {
        dirPath = normalizePath$1(dirPath);
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
            config.configPath = normalizePath$1(config.configPath);
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

const toLowerCase = (str) => str.toLowerCase();
const toDashCase = (str) => toLowerCase(str.replace(/([A-Z0-9])/g, g => ' ' + g[0]).trim().replace(/ /g, '-'));
const dashToPascalCase = (str) => toLowerCase(str).split('-').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
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

class TestingFs {
    constructor() {
        this.data = {};
        this.diskWrites = 0;
        this.diskReads = 0;
    }
    copyFile(srcPath, destPath) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.diskReads++;
                if (!this.data[srcPath]) {
                    reject(`copyFile, srcPath doesn't exists: ${srcPath}`);
                }
                else {
                    this.diskWrites++;
                    this.data[destPath] = this.data[srcPath];
                    resolve();
                }
            }, this.resolveTime);
        });
    }
    exists(filePath) {
        return new Promise(resolve => {
            resolve(!!this.data[filePath]);
        });
    }
    existsSync(filePath) {
        return !!this.data[filePath];
    }
    createReadStream(_filePath) {
        return {};
    }
    mkdir(dirPath) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                dirPath = normalizePath$1(dirPath);
                this.diskWrites++;
                if (this.data[dirPath]) {
                    reject(`mkdir, dir already exists: ${dirPath}`);
                }
                else {
                    this.data[dirPath] = {
                        isDirectory: true,
                        isFile: false
                    };
                    resolve();
                }
            }, this.resolveTime);
        });
    }
    mkdirSync(dirPath) {
        dirPath = normalizePath$1(dirPath);
        this.diskWrites++;
        if (this.data[dirPath]) {
            throw new Error(`mkdir, dir already exists: ${dirPath}`);
        }
        else {
            this.data[dirPath] = {
                isDirectory: true,
                isFile: false
            };
        }
    }
    readdir(dirPath) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const dirs = this.readdirSync(dirPath);
                    resolve(dirs.sort());
                }
                catch (e) {
                    reject(e);
                }
            }, this.resolveTime);
        });
    }
    readdirSync(dirPath) {
        dirPath = normalizePath$1(dirPath);
        this.diskReads++;
        if (!this.data[dirPath]) {
            throw new Error(`readdir, dir doesn't exists: ${dirPath}`);
        }
        const filePaths = Object.keys(this.data);
        const dirs = [];
        filePaths.forEach(f => {
            const pathRelative = path.relative(dirPath, f);
            // Windows: pathRelative =  ..\dir2\dir3\dir4\file2.js
            const dirItem = normalizePath$1(pathRelative).split('/')[0];
            if (!dirItem.startsWith('.') && !dirItem.startsWith('/')) {
                if (dirItem !== '' && !dirs.includes(dirItem)) {
                    dirs.push(dirItem);
                }
            }
        });
        return dirs;
    }
    readFile(filePath) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(this.readFileSync(filePath));
                }
                catch (e) {
                    reject(e);
                }
            }, this.resolveTime);
        });
    }
    readFileSync(filePath) {
        filePath = normalizePath$1(filePath);
        this.diskReads++;
        if (this.data[filePath] && typeof this.data[filePath].content === 'string') {
            return this.data[filePath].content;
        }
        throw new Error(`readFile, path doesn't exist: ${filePath}`);
    }
    rmdir(dirPath) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                dirPath = normalizePath$1(dirPath);
                if (!this.data[dirPath]) {
                    reject(`rmdir, dir doesn't exists: ${dirPath}`);
                }
                else {
                    Object.keys(this.data).forEach(item => {
                        if (item.startsWith(dirPath + '/') || item === dirPath) {
                            this.diskWrites++;
                            delete this.data[item];
                        }
                    });
                    resolve();
                }
            }, this.resolveTime);
        });
    }
    stat(itemPath) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(this.statSync(itemPath));
                }
                catch (e) {
                    reject(e);
                }
            }, this.resolveTime);
        });
    }
    statSync(itemPath) {
        itemPath = normalizePath$1(itemPath);
        this.diskReads++;
        if (this.data[itemPath]) {
            const isDirectory = this.data[itemPath].isDirectory;
            const isFile = this.data[itemPath].isFile;
            return {
                isDirectory: () => isDirectory,
                isFile: () => isFile,
                size: this.data[itemPath].content ? this.data[itemPath].content.length : 0
            };
        }
        throw new Error(`stat, path doesn't exist: ${itemPath}`);
    }
    unlink(filePath) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                filePath = normalizePath$1(filePath);
                this.diskWrites++;
                if (!this.data[filePath]) {
                    reject(`unlink, file doesn't exists: ${filePath}`);
                }
                else {
                    delete this.data[filePath];
                    resolve();
                }
            }, this.resolveTime);
        });
    }
    writeFile(filePath, content) {
        filePath = normalizePath$1(filePath);
        return new Promise(resolve => {
            setTimeout(() => {
                this.diskWrites++;
                this.data[filePath] = {
                    isDirectory: false,
                    isFile: true,
                    content: content
                };
                resolve();
            }, this.resolveTime);
        });
    }
    writeFileSync(filePath, content) {
        filePath = normalizePath$1(filePath);
        this.diskWrites++;
        this.data[filePath] = {
            isDirectory: false,
            isFile: true,
            content: content
        };
    }
    writeFiles(files) {
        return Promise.all(Object.keys(files).map(filePath => {
            return this.writeFile(filePath, files[filePath]);
        }));
    }
    get resolveTime() {
        return (Math.random() * 6);
    }
}

const relDistPath = path.join(__dirname, '..', '..', 'dist');
const nodeSys = require('../sys/node/index');
const NodeSystem = nodeSys.NodeSystem;
class TestingSystem extends NodeSystem {
    constructor() {
        const fs$$1 = new TestingFs();
        super(fs$$1);
        this.createFsWatcher = null;
        this.initWorkers(1, 1);
    }
    get compiler() {
        const compiler = super.compiler;
        compiler.name = 'test';
        compiler.version += '-test';
        return compiler;
    }
    getClientCoreFile(opts) {
        const filePath = path.join(relDistPath, 'client', opts.staticName);
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    tmpdir() {
        return path.join(path.resolve('/'), 'tmp', 'testing');
    }
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
    baseUrl = normalizePath$1(baseUrl);
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

function validateNamespace(config) {
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
            outputTarget.directivesProxyFile = normalizePath$1(path$$1.join(config.rootDir, outputTarget.directivesProxyFile));
        }
        if (outputTarget.directivesArrayFile && !path$$1.isAbsolute(outputTarget.directivesArrayFile)) {
            outputTarget.directivesArrayFile = normalizePath$1(path$$1.join(config.rootDir, outputTarget.directivesArrayFile));
        }
        if (outputTarget.directivesUtilsFile && !path$$1.isAbsolute(outputTarget.directivesUtilsFile)) {
            outputTarget.directivesUtilsFile = normalizePath$1(path$$1.join(config.rootDir, outputTarget.directivesUtilsFile));
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
            outputTarget.dir = normalizePath$1(path$$1.join(config.rootDir, outputTarget.dir));
        }
        if (!outputTarget.buildDir) {
            outputTarget.buildDir = DEFAULT_BUILD_DIR;
        }
        if (!path$$1.isAbsolute(outputTarget.buildDir)) {
            outputTarget.buildDir = normalizePath$1(path$$1.join(outputTarget.dir, outputTarget.buildDir));
        }
        if (!outputTarget.collectionDir) {
            outputTarget.collectionDir = DEFAULT_COLLECTION_DIR;
        }
        if (!path$$1.isAbsolute(outputTarget.collectionDir)) {
            outputTarget.collectionDir = normalizePath$1(path$$1.join(outputTarget.dir, outputTarget.collectionDir));
        }
        if (!outputTarget.esmLoaderPath) {
            outputTarget.esmLoaderPath = DEFAULT_ESM_LOADER_DIR;
        }
        if (!outputTarget.typesDir) {
            outputTarget.typesDir = DEFAULT_TYPES_DIR;
        }
        if (!path$$1.isAbsolute(outputTarget.typesDir)) {
            outputTarget.typesDir = normalizePath$1(path$$1.join(outputTarget.dir, outputTarget.typesDir));
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
    defaults.baseUrl = normalizePath$1(defaults.baseUrl);
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
        outputTarget.resourcesUrl = normalizePath$1(outputTarget.resourcesUrl.trim());
        if (outputTarget.resourcesUrl.charAt(outputTarget.resourcesUrl.length - 1) !== '/') {
            // ensure there's a trailing /
            outputTarget.resourcesUrl += '/';
        }
    }
}

const HOST_CONFIG_FILENAME = 'host.config.json';

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
        config.globalScript = normalizePath$1(config.globalScript);
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
        config.globalStyle = normalizePath$1(config.globalStyle);
    }
    setStringConfig(config, 'srcDir', DEFAULT_SRC_DIR);
    if (!path$$1.isAbsolute(config.srcDir)) {
        config.srcDir = path$$1.join(config.rootDir, config.srcDir);
    }
    config.srcDir = normalizePath$1(config.srcDir);
    setStringConfig(config, 'cacheDir', DEFAULT_CACHE_DIR);
    if (!path$$1.isAbsolute(config.cacheDir)) {
        config.cacheDir = path$$1.join(config.rootDir, config.cacheDir);
    }
    config.cacheDir = normalizePath$1(config.cacheDir);
    if (typeof config.tsconfig === 'string') {
        if (!path$$1.isAbsolute(config.tsconfig)) {
            config.tsconfig = path$$1.join(config.rootDir, config.tsconfig);
        }
    }
    else {
        config.tsconfig = ts.findConfigFile(config.rootDir, ts.sys.fileExists);
    }
    if (typeof config.tsconfig === 'string') {
        config.tsconfig = normalizePath$1(config.tsconfig);
    }
    setStringConfig(config, 'srcIndexHtml', normalizePath$1(path$$1.join(config.srcDir, DEFAULT_INDEX_HTML$1)));
    if (!path$$1.isAbsolute(config.srcIndexHtml)) {
        config.srcIndexHtml = path$$1.join(config.rootDir, config.srcIndexHtml);
    }
    config.srcIndexHtml = normalizePath$1(config.srcIndexHtml);
    if (config.writeLog) {
        setStringConfig(config, 'buildLogFilePath', DEFAULT_BUILD_LOG_FILE_NAME);
        if (!path$$1.isAbsolute(config.buildLogFilePath)) {
            config.buildLogFilePath = path$$1.join(config.rootDir, config.buildLogFilePath);
        }
        config.buildLogFilePath = normalizePath$1(config.buildLogFilePath);
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
    validateNamespace(config);
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

function mockStencilSystem() {
    return new TestingSystem();
}

class TestLogger {
    constructor() {
        this.logs = [];
        this.buildLogFilePath = null;
    }
    printLogs() {
        this.logs.forEach(log => {
            console[log.level].apply(console, log.msgs);
        });
        this.logs.length = 0;
    }
    info(...msgs) {
        this.logs.push({
            level: 'info',
            msgs: msgs
        });
    }
    error(...msgs) {
        this.logs.push({
            level: 'error',
            msgs: msgs
        });
    }
    warn(...msgs) {
        this.logs.push({
            level: 'warn',
            msgs: msgs
        });
    }
    debug() { }
    createTimeSpan(_startMsg) {
        return {
            finish: () => { }
        };
    }
    printDiagnostics(_diagnostics) { }
    green(v) {
        return v;
    }
    yellow(v) {
        return v;
    }
    red(v) {
        return v;
    }
    blue(v) {
        return v;
    }
    magenta(v) {
        return v;
    }
    cyan(v) {
        return v;
    }
    gray(v) {
        return v;
    }
    bold(v) {
        return v;
    }
    dim(v) {
        return v;
    }
    writeLogs(_append) { }
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
function getStylePlaceholder(tagName) {
    return `/**style-placeholder:${tagName}:**/`;
}
function getStyleIdPlaceholder(tagName) {
    return `/**style-id-placeholder:${tagName}:**/`;
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
function parseComponentDataToModuleFile(config, collection, collectionDir, cmpData) {
    const moduleFile = {
        sourceFilePath: normalizePath$1(config.sys.path.join(collectionDir, cmpData.componentPath)),
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
function parseTag(cmpData, cmpMeta) {
    cmpMeta.tagNameMeta = cmpData.tag;
}
function parseModuleJsFilePath(config, collectionDir, cmpData, moduleFile) {
    // convert the path that's relative to the collection file
    // into an absolute path to the component's js file path
    if (typeof cmpData.componentPath !== 'string') {
        throw new Error(`parseModuleJsFilePath, "componentPath" missing on cmpData: ${cmpData.tag}`);
    }
    moduleFile.jsFilePath = normalizePath$1(config.sys.path.join(collectionDir, cmpData.componentPath));
    // remember the original component path from its collection
    moduleFile.originalCollectionComponentPath = cmpData.componentPath;
}
function parseComponentDependencies(cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.dependencies)) {
        cmpMeta.dependencies = [];
    }
    else {
        cmpMeta.dependencies = cmpData.dependencies.sort();
    }
}
function parseComponentClass(cmpData, cmpMeta) {
    cmpMeta.componentClass = cmpData.componentClass;
}
function parseStyles(config, collectionDir, cmpData, cmpMeta) {
    const stylesData = cmpData.styles;
    cmpMeta.stylesMeta = {};
    if (stylesData) {
        Object.keys(stylesData).forEach(modeName => {
            modeName = modeName.toLowerCase();
            cmpMeta.stylesMeta[modeName] = parseStyle$1(config, collectionDir, cmpData, stylesData[modeName]);
        });
    }
}
function parseStyle$1(config, collectionDir, cmpData, modeStyleData) {
    const modeStyle = {
        styleStr: modeStyleData.style
    };
    if (modeStyleData.stylePaths) {
        modeStyle.externalStyles = modeStyleData.stylePaths.map(stylePath => {
            const externalStyle = {};
            externalStyle.absolutePath = normalizePath$1(config.sys.path.join(collectionDir, stylePath));
            externalStyle.cmpRelativePath = normalizePath$1(config.sys.path.relative(config.sys.path.dirname(cmpData.componentPath), stylePath));
            externalStyle.originalCollectionPath = normalizePath$1(stylePath);
            return externalStyle;
        });
    }
    return modeStyle;
}
function parseAssetsDir(config, collectionDir, cmpData, cmpMeta) {
    if (invalidArrayData(cmpData.assetPaths)) {
        return;
    }
    cmpMeta.assetsDirsMeta = cmpData.assetPaths.map(assetsPath => {
        const assetsMeta = {
            absolutePath: normalizePath$1(config.sys.path.join(collectionDir, assetsPath)),
            cmpRelativePath: normalizePath$1(config.sys.path.relative(config.sys.path.dirname(cmpData.componentPath), assetsPath)),
            originalCollectionPath: normalizePath$1(assetsPath)
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
function parseHostElementMember(cmpData, cmpMeta) {
    if (!cmpData.hostElement) {
        return;
    }
    cmpMeta.membersMeta = cmpMeta.membersMeta || {};
    cmpMeta.membersMeta[cmpData.hostElement.name] = {
        memberType: 64 /* Element */
    };
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
function parseHost(cmpData, cmpMeta) {
    if (!cmpData.host) {
        return;
    }
    cmpMeta.hostMeta = cmpData.host;
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
function parseGlobal(config, collectionDir, collectionData, collection) {
    if (typeof collectionData.global !== 'string')
        return;
    collection.global = {
        sourceFilePath: normalizePath$1(config.sys.path.join(collectionDir, collectionData.global)),
        jsFilePath: normalizePath$1(config.sys.path.join(collectionDir, collectionData.global)),
        localImports: [],
        externalImports: [],
        potentialCmpRefs: []
    };
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
    const collectionDir = normalizePath$1(config.sys.path.dirname(collectionFilePath));
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
        pkgJsonFilePath = normalizePath$1(config.sys.resolveModule(resolveFromDir, moduleId));
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
        eventName: getEventName(diagnostics, rawEventOpts, memberName),
        eventBubbles: typeof rawEventOpts.bubbles === 'boolean' ? rawEventOpts.bubbles : true,
        eventCancelable: typeof rawEventOpts.cancelable === 'boolean' ? rawEventOpts.cancelable : true,
        eventComposed: typeof rawEventOpts.composed === 'boolean' ? rawEventOpts.composed : true
    };
}
function getEventName(diagnostics, rawEventOpts, memberName) {
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
            warn.absFilePath = normalizePath$1(filePath);
            warn.relFilePath = normalizePath$1(config.sys.path.relative(config.rootDir, filePath));
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

function getModuleFile(compilerCtx, sourceFilePath) {
    sourceFilePath = normalizePath$1(sourceFilePath);
    return compilerCtx.moduleFiles[sourceFilePath] = compilerCtx.moduleFiles[sourceFilePath] || {
        sourceFilePath: sourceFilePath,
        localImports: [],
        externalImports: [],
        potentialCmpRefs: []
    };
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
            memberData.memberType = getMemberType(propOptions);
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
function getMemberType(propOptions) {
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
    const isNu = checkType(type, isNumber$2);
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
function isNumber$2(t) {
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
    const componentDir = normalizePath$1(config.sys.path.dirname(componentFilePath));
    // get the relative path from the component file to the assets directory
    assetsDir = normalizePath$1(assetsDir.trim());
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
    const componentDir = normalizePath$1(config.sys.path.dirname(componentFilePath));
    // get the relative path from the component file to the style
    let componentRelativeStylePath = normalizePath$1(stylePath.trim());
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
        const absoluteStylePath = normalizePath$1(config.sys.path.join(componentDir, componentRelativeStylePath));
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

/**
 * Mainly used as the typescript preprocessor for unit tests
 */
function transpileModule(config, input, opts = {}, sourceFilePath) {
    config = validateConfig(config);
    if (typeof sourceFilePath === 'string') {
        sourceFilePath = normalizePath$1(sourceFilePath);
    }
    else {
        sourceFilePath = (opts.jsx ? `module.tsx` : `module.ts`);
    }
    const results = {
        sourceFilePath: sourceFilePath,
        code: null,
        map: null,
        diagnostics: [],
        cmpMeta: null
    };
    const compilerCtx = {
        collections: [],
        moduleFiles: {},
        resolvedCollections: [],
        events: {
            emit: noop,
            subscribe: noop,
            unsubscribe: noop,
            unsubscribeAll: noop
        }
    };
    const buildCtx = new BuildContext(config, compilerCtx);
    if (sourceFilePath.endsWith('.tsx')) {
        // ensure we're setup for JSX in typescript
        opts.jsx = ts.JsxEmit.React;
        opts.jsxFactory = 'h';
    }
    const sourceFile = ts.createSourceFile(sourceFilePath, input, opts.target);
    // Create a compilerHost object to allow the compiler to read and write files
    const compilerHost = {
        getSourceFile: (fileName) => normalizePath$1(fileName) === normalizePath$1(sourceFilePath) ? sourceFile : undefined,
        writeFile: function (name, text) {
            if (name.endsWith('.map')) {
                results.map = text;
            }
            else {
                results.code = text;
            }
        },
        getDefaultLibFileName: () => `lib.d.ts`,
        useCaseSensitiveFileNames: () => false,
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => '',
        getNewLine: () => ts.sys.newLine,
        fileExists: (fileName) => normalizePath$1(fileName) === normalizePath$1(sourceFilePath),
        readFile: () => '',
        directoryExists: () => true,
        getDirectories: () => []
    };
    const program = ts.createProgram([sourceFilePath], opts, compilerHost);
    const typeChecker = program.getTypeChecker();
    // Emit
    program.emit(undefined, undefined, undefined, false, {
        before: [
            gatherMetadata(config, compilerCtx, buildCtx, typeChecker),
            removeDecorators(),
            addComponentMetadata(compilerCtx.moduleFiles)
        ],
        after: [
            removeStencilImports(),
            removeCollectionImports(compilerCtx)
        ]
    });
    const tsDiagnostics = [...program.getSyntacticDiagnostics()];
    if (config.validateTypes) {
        tsDiagnostics.push(...program.getOptionsDiagnostics());
    }
    loadTypeScriptDiagnostics(config, buildCtx.diagnostics, tsDiagnostics);
    results.diagnostics.push(...buildCtx.diagnostics);
    const moduleFile = compilerCtx.moduleFiles[results.sourceFilePath];
    results.cmpMeta = moduleFile ? moduleFile.cmpMeta : null;
    return results;
}

const sys = mockStencilSystem();
function transpile(input, opts = {}, sourceFilePath) {
    const logger = new TestLogger();
    const config = {
        sys: sys,
        logger: logger,
        cwd: process.cwd(),
        rootDir: '/',
        srcDir: '/',
        devMode: true,
        _isTesting: true,
        validateTypes: false
    };
    const results = transpileModule(config, input, opts, sourceFilePath);
    logger.printLogs();
    return results;
}
function getCompilerOptions(rootDir) {
    const opts = getUserCompilerOptions$1(rootDir) || {};
    if (typeof opts.allowSyntheticDefaultImports !== 'boolean') {
        // best we always set this to true
        opts.allowSyntheticDefaultImports = true;
    }
    if (typeof opts.esModuleInterop !== 'boolean') {
        // best we always set this to true
        opts.esModuleInterop = true;
    }
    // always get source maps
    opts.sourceMap = true;
    // isolated per file transpiling
    opts.isolatedModules = true;
    // transpileModule does not write anything to disk so there is no need to verify that there are no conflicts between input and output paths.
    opts.suppressOutputPathCheck = true;
    // Filename can be non-ts file.
    opts.allowNonTsExtensions = true;
    // We are not returning a sourceFile for lib file when asked by the program,
    // so pass --noLib to avoid reporting a file not found error.
    opts.noLib = true;
    // Clear out other settings that would not be used in transpiling this module
    opts.lib = undefined;
    opts.types = undefined;
    opts.noEmit = undefined;
    opts.noEmitOnError = undefined;
    opts.paths = undefined;
    opts.rootDirs = undefined;
    opts.declaration = undefined;
    opts.declarationDir = undefined;
    opts.out = undefined;
    opts.outFile = undefined;
    // We are not doing a full typecheck, we are not resolving the whole context,
    // so pass --noResolve to avoid reporting missing file errors.
    opts.noResolve = true;
    // always use commonjs since we're in a node environment
    opts.module = ts.ModuleKind.CommonJS;
    // default to es2015
    opts.target = ts.ScriptTarget.ES2015;
    try {
        const v = process.version.replace('v', '').split('.');
        if (parseInt(v[0], 10) >= 10) {
            // let's go with ES2017 for node 10 and above
            opts.target = ts.ScriptTarget.ES2017;
        }
    }
    catch (e) { }
    return opts;
}
function getUserCompilerOptions$1(rootDir) {
    if (typeof rootDir !== 'string') {
        return null;
    }
    rootDir = normalizePath$1(rootDir);
    const tsconfigFilePath = ts.findConfigFile(rootDir, ts.sys.fileExists);
    if (!tsconfigFilePath) {
        return null;
    }
    const tsconfigResults = ts.readConfigFile(tsconfigFilePath, ts.sys.readFile);
    if (tsconfigResults.error) {
        throw new Error(formatDiagnostic(loadTypeScriptDiagnostic(null, tsconfigResults.error)));
    }
    const parseResult = ts.parseJsonConfigFileContent(tsconfigResults.config, ts.sys, rootDir, undefined, tsconfigFilePath);
    return parseResult.options;
}
function formatDiagnostic(diagnostic) {
    let m = '';
    if (diagnostic.relFilePath) {
        m += diagnostic.relFilePath;
        if (typeof diagnostic.lineNumber === 'number') {
            m += ':' + diagnostic.lineNumber + 1;
            if (typeof diagnostic.columnNumber === 'number') {
                m += ':' + diagnostic.columnNumber;
            }
        }
        m += '\n';
    }
    m += diagnostic.messageText;
    return m;
}

const jestPreprocessor = {
    process(sourceText, filePath, jestConfig) {
        if (filePath.endsWith('.d.ts')) {
            // .d.ts file doesn't need to be transpiled for testing
            return '';
        }
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            const opts = Object.assign({}, this.getCompilerOptions(jestConfig.rootDir));
            const results = transpile(sourceText, opts, filePath);
            if (results.diagnostics && results.diagnostics.length > 0) {
                const msg = results.diagnostics.map(formatDiagnostic).join('\n\n');
                throw new Error(msg);
            }
            return {
                code: results.code,
                map: results.map
            };
        }
        return sourceText;
    },
    getCompilerOptions(rootDir) {
        if (!this._tsCompilerOptions) {
            this._tsCompilerOptions = getCompilerOptions(rootDir);
        }
        return this._tsCompilerOptions;
    },
    getCacheKey(code, filePath, jestConfigStr, transformOptions) {
        // https://github.com/facebook/jest/blob/v23.6.0/packages/jest-runtime/src/script_transformer.js#L61-L90
        if (!this._tsCompilerOptionsKey) {
            const opts = this.getCompilerOptions(transformOptions.rootDir);
            this._compilerOptionsKey = JSON.stringify(opts);
        }
        const key = [
            process.version,
            CACHE_BUSTER,
            this._tsCompilerOptionsKey,
            code,
            filePath,
            jestConfigStr,
            !!transformOptions.instrument
        ];
        return key.join(':');
    }
};
const CACHE_BUSTER = 0;

function toEqualAttribute(elm, expectAttrName, expectAttrValue) {
    if (!elm) {
        throw new Error(`expect toMatchAttribute value is null`);
    }
    if (typeof elm.then === 'function') {
        throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
    }
    if (elm.nodeType !== 1 /* ELEMENT_NODE */) {
        throw new Error(`expect toMatchAttribute value is not an element`);
    }
    let receivedAttrValue = elm.getAttribute(expectAttrName);
    if (expectAttrValue != null) {
        expectAttrValue = String(expectAttrValue);
    }
    if (receivedAttrValue != null) {
        receivedAttrValue = String(receivedAttrValue);
    }
    const pass = (expectAttrValue === receivedAttrValue);
    return {
        message: () => `expected attribute ${expectAttrName} "${expectAttrValue}" to ${pass ? 'not ' : ''}equal "${receivedAttrValue}"`,
        pass: pass,
    };
}
function toEqualAttributes(elm, expectAttrs) {
    if (!elm) {
        throw new Error(`expect toEqualAttributes value is null`);
    }
    if (typeof elm.then === 'function') {
        throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
    }
    if (elm.nodeType !== 1 /* ELEMENT_NODE */) {
        throw new Error(`expect toEqualAttributes value is not an element`);
    }
    const attrNames = Object.keys(expectAttrs);
    const pass = attrNames.every(attrName => {
        let expectAttrValue = expectAttrs[attrName];
        if (expectAttrValue != null) {
            expectAttrValue = String(expectAttrValue);
        }
        return elm.getAttribute(attrName) === expectAttrValue;
    });
    return {
        message: () => `expected attributes to ${pass ? 'not ' : ''}equal ${attrNames.map(a => `[${a}="${expectAttrs[a]}"]`).join(', ')}`,
        pass: pass,
    };
}
function toHaveAttribute(elm, expectAttrName) {
    if (!elm) {
        throw new Error(`expect toHaveAttribute value is null`);
    }
    if (typeof elm.then === 'function') {
        throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
    }
    if (elm.nodeType !== 1 /* ELEMENT_NODE */) {
        throw new Error(`expect toHaveAttribute value is not an element`);
    }
    const pass = elm.hasAttribute(expectAttrName);
    return {
        message: () => `expected to ${pass ? 'not ' : ''}have the attribute "${expectAttrName}"`,
        pass: pass,
    };
}

var isArray$2 = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;

var fastDeepEqual = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray$2(a)
      , arrB = isArray$2(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a!==a && b!==b;
};

function toHaveReceivedEvent(eventSpy) {
    if (!eventSpy) {
        throw new Error(`toHaveReceivedEvent event spy is null`);
    }
    if (typeof eventSpy.then === 'function') {
        throw new Error(`event spy must be a resolved value, not a promise, before it can be tested`);
    }
    if (!eventSpy.eventName) {
        throw new Error(`toHaveReceivedEvent did not receive an event spy`);
    }
    const pass = (eventSpy.events.length > 0);
    return {
        message: () => `expected to have ${pass ? 'not ' : ''}called "${eventSpy.eventName}" event`,
        pass: pass,
    };
}
function toHaveReceivedEventTimes(eventSpy, count) {
    if (!eventSpy) {
        throw new Error(`toHaveReceivedEventTimes event spy is null`);
    }
    if (typeof eventSpy.then === 'function') {
        throw new Error(`event spy must be a resolved value, not a promise, before it can be tested`);
    }
    if (!eventSpy.eventName) {
        throw new Error(`toHaveReceivedEventTimes did not receive an event spy`);
    }
    const pass = (eventSpy.length === count);
    return {
        message: () => `expected event "${eventSpy.eventName}" to have been called ${count} times, but was called ${eventSpy.events.length} time${eventSpy.events.length > 1 ? 's' : ''}`,
        pass: pass,
    };
}
function toHaveReceivedEventDetail(eventSpy, eventDetail) {
    if (!eventSpy) {
        throw new Error(`toHaveReceivedEventDetail event spy is null`);
    }
    if (typeof eventSpy.then === 'function') {
        throw new Error(`event spy must be a resolved value, not a promise, before it can be tested`);
    }
    if (!eventSpy.eventName) {
        throw new Error(`toHaveReceivedEventDetail did not receive an event spy`);
    }
    if (!eventSpy.lastEvent) {
        throw new Error(`event "${eventSpy.eventName}" was not received`);
    }
    const pass = fastDeepEqual(eventSpy.lastEvent.detail, eventDetail);
    expect(eventSpy.lastEvent.detail).toEqual(eventDetail);
    return {
        message: () => `expected event "${eventSpy.eventName}" detail to ${pass ? 'not ' : ''}equal`,
        pass: pass,
    };
}

function toEqualHtml(input, shouldEqual) {
    if (input == null) {
        throw new Error(`expect toEqualHtml value is null`);
    }
    let serializeA;
    if (input.nodeType === 1 /* ELEMENT_NODE */) {
        serializeA = mockDoc.serializeNodeToHtml(input, {
            pretty: true,
            outerHTML: true
        });
    }
    else if (input.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        serializeA = mockDoc.serializeNodeToHtml(input, {
            pretty: true,
            excludeTags: ['style'],
            excludeTagContent: ['style']
        });
    }
    else if (typeof input === 'string') {
        const parseA = mockDoc.parseHtmlToFragment(input);
        serializeA = mockDoc.serializeNodeToHtml(parseA, {
            pretty: true
        });
    }
    else {
        throw new Error(`expect toEqualHtml value should be an element, shadow root or string`);
    }
    const parseB = mockDoc.parseHtmlToFragment(shouldEqual);
    const serializeB = mockDoc.serializeNodeToHtml(parseB, {
        pretty: true
    });
    if (serializeA !== serializeB) {
        expect(serializeA).toBe(serializeB);
        return {
            message: () => 'HTML does not match',
            pass: false,
        };
    }
    return {
        message: () => 'expect HTML to match',
        pass: true,
    };
}

function toEqualText(input, expectTextContent) {
    if (!input) {
        throw new Error(`expect toEqualText value is null`);
    }
    if (typeof input.then === 'function') {
        throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
    }
    let textContent;
    if (input.nodeType === 1 /* ELEMENT_NODE */) {
        textContent = input.textContent.replace(/\s\s+/g, ' ').trim();
    }
    else if (input != null) {
        textContent = String(input).replace(/\s\s+/g, ' ').trim();
    }
    if (typeof expectTextContent === 'string') {
        expectTextContent = expectTextContent.replace(/\s\s+/g, ' ').trim();
    }
    const pass = (textContent === expectTextContent);
    return {
        message: () => `expected textContent "${expectTextContent}" to ${pass ? 'not ' : ''}equal "${textContent}"`,
        pass: pass,
    };
}

function toHaveClass(elm, expectClassName) {
    if (!elm) {
        throw new Error(`expect toHaveClass value is null`);
    }
    if (typeof elm.then === 'function') {
        throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
    }
    if (elm.nodeType !== 1) {
        throw new Error(`expect toHaveClass value is not an element`);
    }
    const pass = elm.classList.contains(expectClassName);
    return {
        message: () => `expected to ${pass ? 'not ' : ''}have css class "${expectClassName}"`,
        pass: pass,
    };
}
function toHaveClasses(elm, expectClassNames) {
    if (!elm) {
        throw new Error(`expect toHaveClasses value is null`);
    }
    if (typeof elm.then === 'function') {
        throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
    }
    if (elm.nodeType !== 1) {
        throw new Error(`expect toHaveClasses value is not an element`);
    }
    const pass = expectClassNames.every(expectClassName => {
        return elm.classList.contains(expectClassName);
    });
    return {
        message: () => `expected to ${pass ? 'not ' : ''}have css classes "${expectClassNames.join(' ')}", but className is "${elm.className}"`,
        pass: pass,
    };
}
function toMatchClasses(elm, expectClassNames) {
    let { pass } = toHaveClasses(elm, expectClassNames);
    if (pass) {
        pass = expectClassNames.length === elm.classList.length;
    }
    return {
        message: () => `expected to ${pass ? 'not ' : ''}match css classes "${expectClassNames.join(' ')}", but className is "${elm.className}"`,
        pass: pass,
    };
}

function toMatchScreenshot(compare, opts = {}) {
    if (!compare) {
        throw new Error(`expect toMatchScreenshot value is null`);
    }
    if (typeof compare.then === 'function') {
        throw new Error(`expect(compare).toMatchScreenshot() must be a resolved value, not a promise, before it can be tested`);
    }
    if (typeof compare.mismatchedPixels !== 'number') {
        throw new Error(`expect toMatchScreenshot() value is not a screenshot compare`);
    }
    const device = compare.device || compare.userAgent;
    if (typeof opts.allowableMismatchedRatio === 'number') {
        if (opts.allowableMismatchedRatio < 0 || opts.allowableMismatchedRatio > 1) {
            throw new Error(`expect toMatchScreenshot() allowableMismatchedRatio must be a value ranging from 0 to 1`);
        }
        const mismatchedRatio = (compare.mismatchedPixels / ((compare.width * compare.deviceScaleFactor) * (compare.height * compare.deviceScaleFactor)));
        return {
            message: () => `${device}: screenshot has a mismatch ratio of "${mismatchedRatio}" for "${compare.desc}", but expected ratio to be less than "${opts.allowableMismatchedRatio}"`,
            pass: (mismatchedRatio <= opts.allowableMismatchedRatio),
        };
    }
    if (typeof opts.allowableMismatchedPixels === 'number') {
        if (opts.allowableMismatchedPixels < 0) {
            throw new Error(`expect toMatchScreenshot() allowableMismatchedPixels value must be a value that is 0 or greater`);
        }
        return {
            message: () => `${device}: screenshot has "${compare.mismatchedPixels}" mismatched pixels for "${compare.desc}", but expected less than "${opts.allowableMismatchedPixels}" mismatched pixels`,
            pass: (compare.mismatchedPixels <= opts.allowableMismatchedPixels),
        };
    }
    if (typeof compare.allowableMismatchedRatio === 'number') {
        const mismatchedRatio = (compare.mismatchedPixels / ((compare.width * compare.deviceScaleFactor) * (compare.height * compare.deviceScaleFactor)));
        return {
            message: () => `${device}: screenshot has a mismatch ratio of "${mismatchedRatio}" for "${compare.desc}", but expected ratio to be less than "${compare.allowableMismatchedRatio}"`,
            pass: (mismatchedRatio <= compare.allowableMismatchedRatio),
        };
    }
    if (typeof compare.allowableMismatchedPixels === 'number') {
        return {
            message: () => `${device}: screenshot has "${compare.mismatchedPixels}" mismatched pixels for "${compare.desc}", but expected less than "${compare.allowableMismatchedPixels}" mismatched pixels`,
            pass: (compare.mismatchedPixels <= compare.allowableMismatchedPixels),
        };
    }
    throw new Error(`expect toMatchScreenshot() missing allowableMismatchedPixels in testing config`);
}

const expectExtend = {
    toEqualAttribute,
    toEqualAttributes,
    toEqualHtml,
    toEqualText,
    toHaveAttribute,
    toHaveClass,
    toHaveClasses,
    toMatchClasses,
    toHaveReceivedEvent,
    toHaveReceivedEventDetail,
    toHaveReceivedEventTimes,
    toMatchScreenshot
};

// http://www.w3.org/TR/CSS21/grammar.html

/**
 * CSS stringify adopted from rework/css by
 * TJ Holowaychuk (@tj)
 * Licensed under the MIT License
 * https://github.com/reworkcss/css/blob/master/LICENSE
 */

function getDefaultBuildConditionals() {
    return {
        coreId: 'core',
        polyfills: false,
        cssVarShim: true,
        shadowDom: true,
        scoped: true,
        slotPolyfill: true,
        ssrServerSide: true,
        prerenderClientSide: true,
        prerenderExternal: false,
        devInspector: true,
        hotModuleReplacement: true,
        verboseError: true,
        styles: true,
        hostData: true,
        hostTheme: true,
        reflectToAttr: true,
        hasSlot: true,
        hasSvg: true,
        hasMode: true,
        observeAttr: true,
        isDev: true,
        isProd: false,
        profile: false,
        element: true,
        event: true,
        listener: true,
        method: true,
        prop: true,
        propMutable: true,
        propConnect: true,
        propContext: true,
        state: true,
        hasMembers: true,
        updatable: true,
        watchCallback: true,
        cmpDidLoad: true,
        cmpWillLoad: true,
        cmpDidUpdate: true,
        cmpWillUpdate: true,
        cmpDidUnload: true,
        clientSide: false,
        externalModuleLoader: false,
        browserModuleLoader: false,
        es5: false
    };
}

var btoa = function () {
	throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
};
if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
	btoa = window.btoa;
} else if (typeof Buffer === 'function') {
	btoa = function (str) { return new Buffer(str).toString('base64'); };
}

function jestSetupTestFramework() {
    global._BUILD_ = getDefaultBuildConditionals();
    global.Context = {};
    global.h = h;
    global.resourcesUrl = '/build';
    mockDoc.applyWindowToGlobal(global);
    expect.extend(expectExtend);
    const jasmineEnv = jasmine.getEnv();
    if (jasmineEnv) {
        jasmineEnv.addReporter({
            specStarted: (spec) => {
                global.currentSpec = spec;
            }
        });
    }
    global.screenshotDescriptions = new Set();
    const env = process.env;
    if (typeof env.__STENCIL_DEFAULT_TIMEOUT__ === 'string') {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = parseInt(env.__STENCIL_DEFAULT_TIMEOUT__, 10);
    }
}

function initPageEvents(page) {
    return __awaiter(this, void 0, void 0, function* () {
        page._e2eEvents = [];
        page._e2eEventIds = 0;
        yield page.exposeFunction('stencilOnEvent', (browserEvent) => {
            // NODE CONTEXT
            nodeContextEvents(page._e2eEvents, browserEvent);
        });
        yield page.evaluateOnNewDocument(browserContextEvents);
        page.spyOnEvent = pageSpyOnEvent.bind(page, page);
        page.waitForEvent = pageWaitForEvent.bind(page, page);
    });
}
function pageSpyOnEvent(page, eventName, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventSpy = new EventSpy(eventName);
        if (selector !== 'document') {
            selector = 'window';
        }
        const handle = yield page.evaluateHandle(selector);
        yield addE2EListener(page, handle, eventName, (ev) => {
            eventSpy.events.push(ev);
        });
        return eventSpy;
    });
}
function pageWaitForEvent(page, eventName, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        if (selector !== 'document') {
            selector = 'window';
        }
        const ev = yield page.evaluate((selector, eventName) => {
            return new Promise((resolve, reject) => {
                const tmr = setTimeout(() => {
                    reject(`page.waitForEvent() timeout, eventName: ${eventName}, selector: ${selector}`);
                }, 10000);
                function listener(ev) {
                    clearTimeout(tmr);
                    window[selector].removeEventListener(eventName, listener);
                    resolve(window.stencilSerializeEvent(ev));
                }
                window[selector].addEventListener(eventName, listener);
            });
        }, selector, eventName);
        yield page.waitForChanges();
        return ev;
    });
}
class EventSpy {
    constructor(eventName) {
        this.eventName = eventName;
        this.events = [];
    }
    get length() {
        return this.events.length;
    }
    get firstEvent() {
        return this.events[0] || null;
    }
    get lastEvent() {
        return this.events[this.events.length - 1] || null;
    }
}
function addE2EListener(page, elmHandle, eventName, resolve, cancelRejectId) {
    return __awaiter(this, void 0, void 0, function* () {
        // NODE CONTEXT
        const id = page._e2eEventIds++;
        page._e2eEvents.push({
            id: id,
            eventName: eventName,
            resolve: resolve,
            cancelRejectId: cancelRejectId
        });
        const executionContext = elmHandle.executionContext();
        // add element event listener
        yield executionContext.evaluate((elm, id, eventName) => {
            elm.addEventListener(eventName, (ev) => {
                window.stencilOnEvent({
                    id: id,
                    event: window.stencilSerializeEvent(ev)
                });
            });
        }, elmHandle, id, eventName);
    });
}
function nodeContextEvents(waitForEvents, browserEvent) {
    // NODE CONTEXT
    const waitForEventData = waitForEvents.find(waitData => {
        return waitData.id === browserEvent.id;
    });
    if (waitForEventData) {
        if (waitForEventData.cancelRejectId != null) {
            clearTimeout(waitForEventData.cancelRejectId);
        }
        waitForEventData.resolve(browserEvent.event);
    }
}
function browserContextEvents() {
    // BROWSER CONTEXT
    window.addEventListener('appload', () => {
        // BROWSER CONTEXT
        window.stencilAppLoaded = true;
    });
    window.stencilSerializeEventTarget = (target) => {
        // BROWSER CONTEXT
        if (!target) {
            return null;
        }
        if (target === window) {
            return { serializedWindow: true };
        }
        if (target === document) {
            return { serializedDocument: true };
        }
        if (target.nodeType != null) {
            const serializedElement = {
                serializedElement: true,
                nodeName: target.nodeName,
                nodeValue: target.nodeValue,
                nodeType: target.nodeType,
                tagName: target.tagName,
                className: target.className,
                id: target.id,
            };
            return serializedElement;
        }
        return null;
    };
    window.stencilSerializeEvent = (orgEv) => {
        // BROWSER CONTEXT
        const serializedEvent = {
            bubbles: orgEv.bubbles,
            cancelBubble: orgEv.cancelBubble,
            cancelable: orgEv.cancelable,
            composed: orgEv.composed,
            currentTarget: window.stencilSerializeEventTarget(orgEv.currentTarget),
            defaultPrevented: orgEv.defaultPrevented,
            detail: orgEv.detail,
            eventPhase: orgEv.eventPhase,
            isTrusted: orgEv.isTrusted,
            returnValue: orgEv.returnValue,
            srcElement: window.stencilSerializeEventTarget(orgEv.srcElement),
            target: window.stencilSerializeEventTarget(orgEv.target),
            timeStamp: orgEv.timeStamp,
            type: orgEv.type,
            isSerializedEvent: true
        };
        return serializedEvent;
    };
}

class E2EElement extends mockDoc.MockElement {
    constructor(_page, _elmHandle) {
        super(null, null);
        this._page = _page;
        this._elmHandle = _elmHandle;
        this._queuedActions = [];
        this._shadowRoot = null;
        _page._e2eElements.push(this);
    }
    find(selector) {
        return find(this._page, this._elmHandle, selector);
    }
    findAll(selector) {
        return findAll(this._page, this._elmHandle, selector);
    }
    callMethod(methodName, ...methodArgs) {
        this._queuedActions.push({
            methodName: methodName,
            methodArgs: methodArgs
        });
        return this.e2eRunActions();
    }
    triggerEvent(eventName, eventInitDict) {
        this._queuedActions.push({
            eventName: eventName,
            eventInitDict: eventInitDict
        });
    }
    spyOnEvent(eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventSpy = new EventSpy(eventName);
            yield addE2EListener(this._page, this._elmHandle, eventName, (ev) => {
                eventSpy.events.push(ev);
            });
            return eventSpy;
        });
    }
    click(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._elmHandle.click(options);
            yield this._page.waitForChanges();
        });
    }
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._elmHandle.focus();
            yield this._page.waitForChanges();
        });
    }
    hover() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._elmHandle.hover();
            yield this._page.waitForChanges();
        });
    }
    isVisible() {
        return __awaiter(this, void 0, void 0, function* () {
            this._validate();
            let isVisible = false;
            try {
                const executionContext = this._elmHandle.executionContext();
                isVisible = yield executionContext.evaluate((elm) => {
                    return new Promise(resolve => {
                        window.requestAnimationFrame(() => {
                            if (elm.isConnected) {
                                const style = window.getComputedStyle(elm);
                                const isVisible = !!style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                                if (isVisible) {
                                    window.requestAnimationFrame(() => {
                                        elm.clientWidth;
                                        resolve(true);
                                    });
                                }
                                else {
                                    resolve(false);
                                }
                            }
                            else {
                                resolve(false);
                            }
                        });
                    });
                }, this._elmHandle);
            }
            catch (e) { }
            return isVisible;
        });
    }
    waitForVisible() {
        return new Promise((resolve, reject) => {
            let resolveTmr;
            const timeout = 30000;
            const rejectTmr = setTimeout(() => {
                clearTimeout(resolveTmr);
                reject(`waitForVisible timed out: ${timeout}ms`);
            }, timeout);
            const checkVisible = () => __awaiter(this, void 0, void 0, function* () {
                const isVisible = yield this.isVisible();
                if (isVisible) {
                    clearTimeout(rejectTmr);
                    resolve();
                }
                else {
                    resolveTmr = setTimeout(checkVisible, 10);
                }
            });
            checkVisible();
        });
    }
    waitForNotVisible() {
        return new Promise((resolve, reject) => {
            let resolveTmr;
            const timeout = 30000;
            const rejectTmr = setTimeout(() => {
                clearTimeout(resolveTmr);
                reject(`waitForNotVisible timed out: ${timeout}ms`);
            }, timeout);
            const checkVisible = () => __awaiter(this, void 0, void 0, function* () {
                const isVisible = yield this.isVisible();
                if (isVisible) {
                    resolveTmr = setTimeout(checkVisible, 10);
                }
                else {
                    clearTimeout(rejectTmr);
                    resolve();
                }
            });
            checkVisible();
        });
    }
    isIntersectingViewport() {
        return this._elmHandle.isIntersectingViewport();
    }
    press(key, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._elmHandle.press(key, options);
            yield this._page.waitForChanges();
        });
    }
    tap() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._elmHandle.tap();
            yield this._page.waitForChanges();
        });
    }
    type(text, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._elmHandle.type(text, options);
            yield this._page.waitForChanges();
        });
    }
    getProperty(propertyName) {
        return __awaiter(this, void 0, void 0, function* () {
            this._validate();
            const executionContext = this._elmHandle.executionContext();
            const propValue = yield executionContext.evaluate((elm, propertyName) => {
                return elm[propertyName];
            }, this._elmHandle, propertyName);
            return propValue;
        });
    }
    setProperty(propertyName, value) {
        this._queuedActions.push({
            setPropertyName: propertyName,
            setPropertyValue: value
        });
    }
    getAttribute(name) {
        this._validate();
        return super.getAttribute(name);
    }
    setAttribute(name, value) {
        this._queuedActions.push({
            setAttributeName: name,
            setAttributeValue: value
        });
    }
    get classList() {
        const api = {
            add: (...classNames) => {
                classNames.forEach(className => {
                    this._queuedActions.push({
                        classAdd: className
                    });
                });
            },
            remove: (...classNames) => {
                classNames.forEach(className => {
                    this._queuedActions.push({
                        classRemove: className
                    });
                });
            },
            toggle: (className) => {
                this._queuedActions.push({
                    classToggle: className
                });
            },
            contains: (className) => {
                this._validate();
                return this.className.split(' ').includes(className);
            }
        };
        return api;
    }
    get className() {
        this._validate();
        return super.className;
    }
    set className(value) {
        this._queuedActions.push({
            setPropertyName: 'className',
            setPropertyValue: value
        });
    }
    get id() {
        this._validate();
        return super.id;
    }
    set id(value) {
        this._queuedActions.push({
            setPropertyName: 'id',
            setPropertyValue: value
        });
    }
    get innerHTML() {
        this._validate();
        return super.innerHTML;
    }
    set innerHTML(value) {
        this._queuedActions.push({
            setPropertyName: 'innerHTML',
            setPropertyValue: value
        });
    }
    get innerText() {
        this._validate();
        return super.innerText;
    }
    set innerText(value) {
        this._queuedActions.push({
            setPropertyName: 'innerText',
            setPropertyValue: value
        });
    }
    get nodeValue() {
        this._validate();
        return super.nodeValue;
    }
    set nodeValue(value) {
        this._queuedActions.push({
            setPropertyName: 'nodeValue',
            setPropertyValue: value
        });
    }
    get outerHTML() {
        this._validate();
        return super.outerHTML;
    }
    set outerHTML(_) {
        throw new Error(`outerHTML is read-only`);
    }
    get shadowRoot() {
        this._validate();
        return this._shadowRoot;
    }
    set shadowRoot(_) {
        throw new Error(`shadowRoot is read-only`);
    }
    get tabIndex() {
        this._validate();
        return super.tabIndex;
    }
    set tabIndex(value) {
        this._queuedActions.push({
            setPropertyName: 'tabIndex',
            setPropertyValue: value
        });
    }
    get textContent() {
        this._validate();
        return super.textContent;
    }
    set textContent(value) {
        this._queuedActions.push({
            setPropertyName: 'textContent',
            setPropertyValue: value
        });
    }
    get title() {
        this._validate();
        return super.title;
    }
    set title(value) {
        this._queuedActions.push({
            setPropertyName: 'title',
            setPropertyValue: value
        });
    }
    getComputedStyle(pseudoElt) {
        return __awaiter(this, void 0, void 0, function* () {
            const style = yield this._page.evaluate((elm, pseudoElt) => {
                const rtn = {};
                const computedStyle = window.getComputedStyle(elm, pseudoElt);
                const keys = Object.keys(computedStyle);
                keys.forEach(key => {
                    if (isNaN(key)) {
                        const value = computedStyle[key];
                        if (value != null) {
                            rtn[key] = value;
                        }
                    }
                    else {
                        const dashProp = computedStyle[key];
                        if (dashProp.includes('-')) {
                            const value = computedStyle.getPropertyValue(dashProp);
                            if (value != null) {
                                rtn[dashProp] = value;
                            }
                        }
                    }
                });
                return rtn;
            }, this._elmHandle, pseudoElt);
            style.getPropertyValue = (propName) => {
                return style[propName];
            };
            return style;
        });
    }
    e2eRunActions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._queuedActions.length === 0) {
                return;
            }
            const executionContext = this._elmHandle.executionContext();
            const rtn = yield executionContext.evaluate((elm, queuedActions) => {
                // BROWSER CONTEXT
                // cannot use async/await in here cuz typescript transpiles it in the node context
                return elm.componentOnReady().then(() => {
                    let rtn = null;
                    queuedActions.forEach(queuedAction => {
                        if (queuedAction.methodName) {
                            rtn = elm[queuedAction.methodName].apply(elm, queuedAction.methodArgs);
                        }
                        else if (queuedAction.setPropertyName) {
                            elm[queuedAction.setPropertyName] = queuedAction.setPropertyValue;
                        }
                        else if (queuedAction.setAttributeName) {
                            elm.setAttribute(queuedAction.setAttributeName, queuedAction.setAttributeValue);
                        }
                        else if (queuedAction.classAdd) {
                            elm.classList.add(queuedAction.classAdd);
                        }
                        else if (queuedAction.classRemove) {
                            elm.classList.remove(queuedAction.classRemove);
                        }
                        else if (queuedAction.classToggle) {
                            elm.classList.toggle(queuedAction.classToggle);
                        }
                        else if (queuedAction.eventName) {
                            const eventInitDict = queuedAction.eventInitDict || {};
                            if (typeof eventInitDict.bubbles !== 'boolean') {
                                eventInitDict.bubbles = true;
                            }
                            if (typeof eventInitDict.cancelable !== 'boolean') {
                                eventInitDict.cancelable = true;
                            }
                            if (typeof eventInitDict.composed !== 'boolean') {
                                eventInitDict.composed = true;
                            }
                            const ev = new CustomEvent(queuedAction.eventName, eventInitDict);
                            elm.dispatchEvent(ev);
                        }
                    });
                    if (rtn && typeof rtn.then === 'function') {
                        return rtn.then((value) => {
                            return value;
                        });
                    }
                    return rtn;
                });
            }, this._elmHandle, this._queuedActions);
            this._queuedActions.length = 0;
            return rtn;
        });
    }
    e2eSync() {
        return __awaiter(this, void 0, void 0, function* () {
            const executionContext = this._elmHandle.executionContext();
            const { outerHTML, shadowRootHTML } = yield executionContext.evaluate((elm) => {
                return {
                    outerHTML: elm.outerHTML,
                    shadowRootHTML: elm.shadowRoot ? elm.shadowRoot.innerHTML : null
                };
            }, this._elmHandle);
            if (shadowRootHTML) {
                this._shadowRoot = mockDoc.parseHtmlToFragment(shadowRootHTML);
                this._shadowRoot.host = this;
            }
            else {
                this._shadowRoot = null;
            }
            const frag = mockDoc.parseHtmlToFragment(outerHTML);
            const rootElm = frag.firstElementChild;
            this.nodeName = rootElm.nodeName;
            this.attributes = rootElm.attributes.cloneAttributes();
            for (let i = this.childNodes.length - 1; i >= 0; i--) {
                this.removeChild(this.childNodes[i]);
            }
            while (rootElm.childNodes.length > 0) {
                this.appendChild(rootElm.childNodes[0]);
            }
        });
    }
    _validate() {
        if (this._queuedActions.length > 0) {
            throw new Error(`await page.waitForChanges() must be called before reading element information`);
        }
    }
    e2eDispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._elmHandle) {
                yield this._elmHandle.dispose();
                this._elmHandle = null;
            }
            const index = this._page._e2eElements.indexOf(this);
            if (index > -1) {
                this._page._e2eElements.splice(index, 1);
            }
            this._page = null;
        });
    }
}

function find(page, rootHandle, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        const { lightSelector, shadowSelector, text, contains } = getSelector(selector);
        let elmHandle;
        if (typeof lightSelector === 'string') {
            elmHandle = yield findWithCssSelector(page, rootHandle, lightSelector, shadowSelector);
        }
        else {
            elmHandle = yield findWithText(page, rootHandle, text, contains);
        }
        if (!elmHandle) {
            return null;
        }
        const elm = new E2EElement(page, elmHandle);
        yield elm.e2eSync();
        return elm;
    });
}
function findWithCssSelector(page, rootHandle, lightSelector, shadowSelector) {
    return __awaiter(this, void 0, void 0, function* () {
        let elmHandle = yield rootHandle.$(lightSelector);
        if (!elmHandle) {
            return null;
        }
        if (shadowSelector) {
            const shadowHandle = yield page.evaluateHandle((elm, shadowSelector) => {
                if (!elm.shadowRoot) {
                    throw new Error(`shadow root does not exist for element: ${elm.tagName.toLowerCase()}`);
                }
                return elm.shadowRoot.querySelector(shadowSelector);
            }, elmHandle, shadowSelector);
            yield elmHandle.dispose();
            if (!shadowHandle) {
                return null;
            }
            elmHandle = shadowHandle.asElement();
        }
        return elmHandle;
    });
}
function findWithText(page, rootHandle, text, contains) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsHandle = yield page.evaluateHandle((rootElm, text, contains) => {
            let foundElm = null;
            function checkContent(elm) {
                if (!elm || foundElm) {
                    return;
                }
                if (elm.nodeType === 3) {
                    if (typeof text === 'string' && elm.textContent.trim() === text) {
                        foundElm = elm.parentElement;
                        return;
                    }
                    if (typeof contains === 'string' && elm.textContent.includes(contains)) {
                        foundElm = elm.parentElement;
                        return;
                    }
                }
                checkContent(elm.shadowRoot);
                if (elm.childNodes) {
                    for (let i = 0; i < elm.childNodes.length; i++) {
                        checkContent(elm.childNodes[i]);
                    }
                }
            }
            checkContent(rootElm);
            return foundElm;
        }, rootHandle, text, contains);
        if (jsHandle) {
            return jsHandle.asElement();
        }
        return null;
    });
}
function findAll(page, rootHandle, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundElms = [];
        const { lightSelector, shadowSelector } = getSelector(selector);
        const lightElmHandles = yield rootHandle.$$(lightSelector);
        if (lightElmHandles.length === 0) {
            return foundElms;
        }
        if (shadowSelector) {
            // light dom selected, then shadow dom selected inside of light dom elements
            for (let i = 0; i < lightElmHandles.length; i++) {
                const executionContext = lightElmHandles[i].executionContext();
                const shadowJsHandle = yield executionContext.evaluateHandle((elm, shadowSelector) => {
                    if (!elm.shadowRoot) {
                        throw new Error(`shadow root does not exist for element: ${elm.tagName.toLowerCase()}`);
                    }
                    return elm.shadowRoot.querySelectorAll(shadowSelector);
                }, lightElmHandles[i], shadowSelector);
                yield lightElmHandles[i].dispose();
                const shadowJsProperties = yield shadowJsHandle.getProperties();
                yield shadowJsHandle.dispose();
                for (const shadowJsProperty of shadowJsProperties.values()) {
                    const shadowElmHandle = shadowJsProperty.asElement();
                    if (shadowElmHandle) {
                        const elm = new E2EElement(page, shadowElmHandle);
                        yield elm.e2eSync();
                        foundElms.push(elm);
                    }
                }
            }
        }
        else {
            // light dom only
            for (let i = 0; i < lightElmHandles.length; i++) {
                const elm = new E2EElement(page, lightElmHandles[i]);
                yield elm.e2eSync();
                foundElms.push(elm);
            }
        }
        return foundElms;
    });
}
function getSelector(selector) {
    const rtn = {
        lightSelector: null,
        shadowSelector: null,
        text: null,
        contains: null
    };
    if (typeof selector === 'string') {
        const splt = selector.split('>>>');
        rtn.lightSelector = splt[0].trim();
        rtn.shadowSelector = (splt.length > 1 ? splt[1].trim() : null);
    }
    else if (typeof selector.text === 'string') {
        rtn.text = selector.text.trim();
    }
    else if (typeof selector.contains === 'string') {
        rtn.contains = selector.contains.trim();
    }
    else {
        throw new Error(`invalid find selector: ${selector}`);
    }
    return rtn;
}

function writeScreenshotImage(imagePath, screenshotBuf) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageExists = yield fileExists(imagePath);
        if (!imageExists) {
            yield writeFile(imagePath, screenshotBuf);
        }
    });
}
function writeScreenshotData(dataDir, screenshotData) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = getDataFilePath(dataDir, screenshotData.id);
        const content = JSON.stringify(screenshotData, null, 2);
        yield writeFile(filePath, content);
    });
}
function getDataFilePath(dataDir, screenshotId) {
    const fileName = `${screenshotId}.json`;
    return path__default.join(dataDir, fileName);
}
function fileExists(filePath) {
    return new Promise(resolve => {
        gracefulFs.access(filePath, (err) => resolve(!err));
    });
}
function writeFile(filePath, data) {
    return new Promise((resolve, reject) => {
        gracefulFs.writeFile(filePath, data, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

function compareScreenshot(emulateConfig, screenshotBuildData, currentScreenshotBuf, desc, testPath, pixelmatchThreshold) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentImageHash = crypto.createHash('md5').update(currentScreenshotBuf).digest('hex');
        const currentImageName = `${currentImageHash}.png`;
        const currentImagePath = path.join(screenshotBuildData.imagesDir, currentImageName);
        yield writeScreenshotImage(currentImagePath, currentScreenshotBuf);
        currentScreenshotBuf = null;
        if (testPath) {
            testPath = normalizePath$1(path.relative(screenshotBuildData.rootDir, testPath));
        }
        // create the data we'll be saving as json
        // the "id" is what we use as a key to compare to sets of data
        // the "image" is a hash of the image file name
        // and what we can use to quickly see if they're identical or not
        const screenshotId = getScreenshotId(emulateConfig, desc);
        const screenshot = {
            id: screenshotId,
            image: currentImageName,
            device: emulateConfig.device,
            userAgent: emulateConfig.userAgent,
            desc: desc,
            testPath: testPath,
            width: emulateConfig.viewport.width,
            height: emulateConfig.viewport.height,
            deviceScaleFactor: emulateConfig.viewport.deviceScaleFactor,
            hasTouch: emulateConfig.viewport.hasTouch,
            isLandscape: emulateConfig.viewport.isLandscape,
            isMobile: emulateConfig.viewport.isMobile,
            diff: {
                id: screenshotId,
                desc: desc,
                imageA: currentImageName,
                imageB: currentImageName,
                mismatchedPixels: 0,
                device: emulateConfig.device,
                userAgent: emulateConfig.userAgent,
                width: emulateConfig.viewport.width,
                height: emulateConfig.viewport.height,
                deviceScaleFactor: emulateConfig.viewport.deviceScaleFactor,
                hasTouch: emulateConfig.viewport.hasTouch,
                isLandscape: emulateConfig.viewport.isLandscape,
                isMobile: emulateConfig.viewport.isMobile,
                allowableMismatchedPixels: screenshotBuildData.allowableMismatchedPixels,
                allowableMismatchedRatio: screenshotBuildData.allowableMismatchedRatio,
                testPath: testPath
            }
        };
        if (screenshotBuildData.updateMaster) {
            // this data is going to become the master data
            // so no need to compare with previous versions
            yield writeScreenshotData(screenshotBuildData.currentBuildDir, screenshot);
            return screenshot.diff;
        }
        const masterScreenshotImage = screenshotBuildData.masterScreenshots[screenshot.id];
        if (!masterScreenshotImage) {
            // didn't find a master screenshot to compare it to
            yield writeScreenshotData(screenshotBuildData.currentBuildDir, screenshot);
            return screenshot.diff;
        }
        // set that the master data image as the image we're going to compare the current image to
        // imageB is already set as the current image
        screenshot.diff.imageA = masterScreenshotImage;
        // compare only if the image hashes are different
        if (screenshot.diff.imageA !== screenshot.diff.imageB) {
            // we know the images are not identical since they have different hashes
            // create a cache key from the two hashes
            screenshot.diff.cacheKey = getCacheKey(screenshot.diff.imageA, screenshot.diff.imageB, pixelmatchThreshold);
            // let's see if we've already calculated the mismatched pixels already
            const cachedMismatchedPixels = screenshotBuildData.cache[screenshot.diff.cacheKey];
            if (typeof cachedMismatchedPixels === 'number' && !isNaN(cachedMismatchedPixels)) {
                // awesome, we've got cached data so we
                // can skip having to do the heavy pixelmatch comparison
                screenshot.diff.mismatchedPixels = cachedMismatchedPixels;
            }
            else {
                // images are not identical
                // and we don't have any cached data so let's
                // compare the two images pixel by pixel to
                // figure out a mismatch value
                // figure out the actual width and height of the screenshot
                const naturalWidth = Math.round(emulateConfig.viewport.width * emulateConfig.viewport.deviceScaleFactor);
                const naturalHeight = Math.round(emulateConfig.viewport.height * emulateConfig.viewport.deviceScaleFactor);
                const pixelMatchInput = {
                    imageAPath: path.join(screenshotBuildData.imagesDir, screenshot.diff.imageA),
                    imageBPath: path.join(screenshotBuildData.imagesDir, screenshot.diff.imageB),
                    width: naturalWidth,
                    height: naturalHeight,
                    pixelmatchThreshold: pixelmatchThreshold
                };
                screenshot.diff.mismatchedPixels = yield getMismatchedPixels(screenshotBuildData.pixelmatchModulePath, pixelMatchInput);
            }
        }
        yield writeScreenshotData(screenshotBuildData.currentBuildDir, screenshot);
        return screenshot.diff;
    });
}
function getMismatchedPixels(pixelmatchModulePath, pixelMatchInput) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const timeout = 30000;
            const tmr = setTimeout(() => {
                reject(`getMismatchedPixels timeout: ${timeout}ms`);
            }, timeout);
            try {
                const filteredExecArgs = process.execArgv.filter(v => !/^--(debug|inspect)/.test(v));
                const options = {
                    execArgv: filteredExecArgs,
                    env: process.env,
                    cwd: process.cwd(),
                    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
                };
                const pixelMatchProcess = child_process.fork(pixelmatchModulePath, [], options);
                pixelMatchProcess.on('message', data => {
                    pixelMatchProcess.kill();
                    clearTimeout(tmr);
                    resolve(data);
                });
                pixelMatchProcess.on('error', err => {
                    clearTimeout(tmr);
                    reject(err);
                });
                pixelMatchProcess.send(pixelMatchInput);
            }
            catch (e) {
                clearTimeout(tmr);
                reject(`getMismatchedPixels error: ${e}`);
            }
        });
    });
}
function getCacheKey(imageA, imageB, pixelmatchThreshold) {
    const hash = crypto.createHash('md5');
    hash.update(`${imageA}:${imageB}:${pixelmatchThreshold}`);
    return hash.digest('hex').substr(0, 10);
}
function getScreenshotId(emulateConfig, uniqueDescription) {
    if (typeof uniqueDescription !== 'string' || uniqueDescription.trim().length === 0) {
        throw new Error(`invalid test description`);
    }
    const hash = crypto.createHash('md5');
    hash.update(uniqueDescription + ':');
    hash.update(emulateConfig.userAgent + ':');
    hash.update(emulateConfig.viewport.width + ':');
    hash.update(emulateConfig.viewport.height + ':');
    hash.update(emulateConfig.viewport.deviceScaleFactor + ':');
    hash.update(emulateConfig.viewport.hasTouch + ':');
    hash.update(emulateConfig.viewport.isMobile + ':');
    return hash.digest('hex').substr(0, 8).toLowerCase();
}

function initPageScreenshot(page) {
    const env = (process.env);
    if (env.__STENCIL_SCREENSHOT__ === 'true') {
        page.compareScreenshot = (a, b) => {
            const jestEnv = global;
            let desc = '';
            let testPath = '';
            if (jestEnv.currentSpec) {
                if (typeof jestEnv.currentSpec.fullName === 'string') {
                    desc = jestEnv.currentSpec.fullName;
                }
                if (typeof jestEnv.currentSpec.testPath === 'string') {
                    testPath = jestEnv.currentSpec.testPath;
                }
            }
            let opts;
            if (typeof a === 'string') {
                if (desc.length > 0) {
                    desc += ', ' + a;
                }
                else {
                    desc = a;
                }
                if (typeof b === 'object') {
                    opts = b;
                }
            }
            else if (typeof a === 'object') {
                opts = a;
            }
            desc = desc.trim();
            opts = opts || {};
            if (!desc) {
                throw new Error(`Invalid screenshot description in "${testPath}"`);
            }
            if (jestEnv.screenshotDescriptions.has(desc)) {
                throw new Error(`Screenshot description "${desc}" found in "${testPath}" cannot be used for multiple screenshots and must be unique. To make screenshot descriptions unique within the same test, use the first argument to "compareScreenshot", such as "compareScreenshot('more to the description')".`);
            }
            jestEnv.screenshotDescriptions.add(desc);
            return pageCompareScreenshot(page, env, desc, testPath, opts);
        };
    }
    else {
        // screen shot not enabled, so just skip over all the logic
        page.compareScreenshot = () => __awaiter(this, void 0, void 0, function* () {
            const diff = {
                mismatchedPixels: 0,
                allowableMismatchedPixels: 1,
                allowableMismatchedRatio: 1,
                desc: '',
                width: 1,
                height: 1,
                deviceScaleFactor: 1
            };
            return diff;
        });
    }
}
function pageCompareScreenshot(page, env, desc, testPath, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof env.__STENCIL_EMULATE__ !== 'string') {
            throw new Error(`compareScreenshot, missing screenshot emulate env var`);
        }
        if (typeof env.__STENCIL_SCREENSHOT_BUILD__ !== 'string') {
            throw new Error(`compareScreenshot, missing screen build env var`);
        }
        const emulateConfig = JSON.parse(env.__STENCIL_EMULATE__);
        const screenshotBuildData = JSON.parse(env.__STENCIL_SCREENSHOT_BUILD__);
        yield wait(screenshotBuildData.timeoutBeforeScreenshot);
        yield page.evaluate(() => {
            return new Promise(resolve => {
                window.requestIdleCallback(() => {
                    window.requestAnimationFrame(() => {
                        resolve();
                    });
                }, { timeout: 100 });
            });
        });
        const screenshotOpts = createPuppeteerScreenshopOptions(opts);
        let screenshotBuf = yield page.screenshot(screenshotOpts);
        const pixelmatchThreshold = (typeof opts.pixelmatchThreshold === 'number' ? opts.pixelmatchThreshold : screenshotBuildData.pixelmatchThreshold);
        const results = yield compareScreenshot(emulateConfig, screenshotBuildData, screenshotBuf, desc, testPath, pixelmatchThreshold);
        screenshotBuf = null;
        return results;
    });
}
function createPuppeteerScreenshopOptions(opts) {
    const puppeteerOpts = {
        type: 'png',
        fullPage: opts.fullPage,
        omitBackground: opts.omitBackground,
        encoding: 'binary'
    };
    if (opts.clip) {
        puppeteerOpts.clip = {
            x: opts.clip.x,
            y: opts.clip.y,
            width: opts.clip.width,
            height: opts.clip.height
        };
    }
    return puppeteerOpts;
}
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function newE2EPage(opts = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!global.__NEW_TEST_PAGE__) {
            throw new Error(`newE2EPage() is only available from E2E tests, and ran with the --e2e cmd line flag.`);
        }
        const page = yield global.__NEW_TEST_PAGE__();
        page._e2eElements = [];
        page._e2eGoto = page.goto;
        yield setPageEmulate(page);
        yield page.setCacheEnabled(false);
        yield initPageEvents(page);
        initPageScreenshot(page);
        let docPromise = null;
        page.find = (selector) => __awaiter(this, void 0, void 0, function* () {
            if (!docPromise) {
                docPromise = page.evaluateHandle('document');
            }
            const documentJsHandle = yield docPromise;
            const docHandle = documentJsHandle.asElement();
            return find(page, docHandle, selector);
        });
        page.findAll = (selector) => __awaiter(this, void 0, void 0, function* () {
            if (!docPromise) {
                docPromise = page.evaluateHandle('document');
            }
            const documentJsHandle = yield docPromise;
            const docHandle = documentJsHandle.asElement();
            return findAll(page, docHandle, selector);
        });
        page.waitForChanges = waitForChanges.bind(null, page);
        page.on('console', consoleMessage);
        page.on('pageerror', pageError);
        page.on('requestfailed', requestFailed);
        if (typeof opts.html === 'string') {
            const errMsg = yield e2eSetContent(page, opts.html);
            if (errMsg) {
                throw errMsg;
            }
        }
        else if (typeof opts.url === 'string') {
            const errMsg = yield e2eGoTo(page, opts.url);
            if (errMsg) {
                throw errMsg;
            }
        }
        else {
            page.goto = e2eGoTo.bind(null, page);
            page.setContent = e2eSetContent.bind(null, page);
        }
        return page;
    });
}
function e2eGoTo(page, url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (page.isClosed()) {
                return 'e2eGoTo unavailable: page already closed';
            }
        }
        catch (e) {
            return null;
        }
        if (typeof url !== 'string') {
            yield closePage(page);
            return 'invalid gotoTest() url';
        }
        if (!url.startsWith('/')) {
            yield closePage(page);
            return 'gotoTest() url must start with /';
        }
        const browserUrl = process.env.__STENCIL_BROWSER_URL__;
        if (typeof browserUrl !== 'string') {
            yield closePage(page);
            return 'invalid gotoTest() browser url';
        }
        const fullUrl = browserUrl + url.substring(1);
        const rsp = yield page._e2eGoto(fullUrl);
        if (!rsp.ok()) {
            yield closePage(page);
            return `Testing unable to load ${url}, HTTP status: ${rsp.status()}`;
        }
        const tmr = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield closePage(page);
            throw new Error(`App did not load in allowed time. Please ensure the url ${url} loads a stencil application.`);
        }), 4500);
        yield page.waitForFunction('window.stencilAppLoaded');
        clearTimeout(tmr);
        return null;
    });
}
function e2eSetContent(page, html) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (page.isClosed()) {
                return 'e2eSetContent unavailable: page already closed';
            }
        }
        catch (e) {
            return null;
        }
        if (typeof html !== 'string') {
            yield closePage(page);
            return 'invalid e2eSetContent() html';
        }
        const loaderUrl = process.env.__STENCIL_LOADER_URL__;
        if (typeof loaderUrl !== 'string') {
            yield closePage(page);
            return 'invalid e2eSetContent() loader script url';
        }
        const url = [
            `data:text/html;charset=UTF-8,`,
            `<script src="${loaderUrl}"></script>`,
            html
        ];
        const rsp = yield page._e2eGoto(url.join(''));
        if (!rsp.ok()) {
            yield closePage(page);
            return `Testing unable to load content`;
        }
        const tmr = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield closePage(page);
            throw new Error(`App did not load in allowed time. Please ensure the content loads a stencil application.`);
        }), 4500);
        yield page.waitForFunction('window.stencilAppLoaded');
        clearTimeout(tmr);
        return null;
    });
}
function setPageEmulate(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (page.isClosed()) {
                return;
            }
        }
        catch (e) {
            return;
        }
        const env = (process.env);
        const emulateJsonContent = env.__STENCIL_EMULATE__;
        if (!emulateJsonContent) {
            return;
        }
        try {
            const screenshotEmulate = JSON.parse(emulateJsonContent);
            const emulateOptions = {
                viewport: screenshotEmulate.viewport,
                userAgent: screenshotEmulate.userAgent
            };
            yield page.emulate(emulateOptions);
        }
        catch (e) {
            console.error('setPageEmulate', e);
            yield closePage(page);
        }
    });
}
function waitForChanges(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (page.isClosed()) {
                return;
            }
            yield Promise.all(page._e2eElements.map((elm) => __awaiter(this, void 0, void 0, function* () {
                yield elm.e2eRunActions();
            })));
            if (page.isClosed()) {
                return;
            }
            yield page.evaluate(() => {
                const promises = window['s-apps'].map((appNamespace) => {
                    return window[appNamespace].onReady();
                });
                return Promise.all(promises);
            });
            if (page.isClosed()) {
                return;
            }
            yield Promise.all(page._e2eElements.map((elm) => __awaiter(this, void 0, void 0, function* () {
                yield elm.e2eSync();
            })));
            yield page.waitFor(4);
        }
        catch (e) { }
    });
}
function consoleMessage(c) {
    const type = c.type();
    if (typeof console[type] === 'function') {
        console[type](c.text());
    }
    else {
        console.log(type, c.text());
    }
}
function pageError(e) {
    console.error('pageerror', e);
}
function requestFailed(req) {
    console.error('requestfailed', req.url());
}

function runJestScreenshot(config, env) {
    return __awaiter(this, void 0, void 0, function* () {
        config.logger.debug(`screenshot connector: ${config.testing.screenshotConnector}`);
        const ScreenshotConnector = require(config.testing.screenshotConnector);
        const connector = new ScreenshotConnector();
        // for CI, let's wait a little longer than locally before taking the screenshot
        const timeoutBeforeScreenshot = config.flags.ci ? 30 : 10;
        const pixelmatchModulePath = config.sys.path.join(config.sys.compiler.packageDir, 'screenshot', 'pixel-match.js');
        config.logger.debug(`pixelmatch module: ${pixelmatchModulePath}`);
        const initTimespan = config.logger.createTimeSpan(`screenshot, initBuild started`, true);
        yield connector.initBuild({
            buildId: createBuildId(),
            buildMessage: createBuildMessage(),
            buildTimestamp: Date.now(),
            appNamespace: config.namespace,
            rootDir: config.rootDir,
            cacheDir: config.cacheDir,
            packageDir: config.sys.compiler.packageDir,
            updateMaster: config.flags.updateScreenshot,
            logger: config.logger,
            allowableMismatchedPixels: config.testing.allowableMismatchedPixels,
            allowableMismatchedRatio: config.testing.allowableMismatchedRatio,
            pixelmatchThreshold: config.testing.pixelmatchThreshold,
            timeoutBeforeScreenshot: timeoutBeforeScreenshot,
            pixelmatchModulePath: pixelmatchModulePath
        });
        if (!config.flags.updateScreenshot) {
            yield connector.pullMasterBuild();
        }
        initTimespan.finish(`screenshot, initBuild finished`);
        const dataPromises = yield Promise.all([
            yield connector.getMasterBuild(),
            yield connector.getScreenshotCache()
        ]);
        const masterBuild = dataPromises[0];
        const screenshotCache = dataPromises[1];
        env.__STENCIL_SCREENSHOT_BUILD__ = connector.toJson(masterBuild, screenshotCache);
        const testsTimespan = config.logger.createTimeSpan(`screenshot, tests started`, true);
        const passed = yield runJest(config, env);
        testsTimespan.finish(`screenshot, tests finished, passed: ${passed}`);
        try {
            const completeTimespan = config.logger.createTimeSpan(`screenshot, completeTimespan started`, true);
            let results = yield connector.completeBuild(masterBuild);
            completeTimespan.finish(`screenshot, completeTimespan finished`);
            if (results) {
                const publishTimespan = config.logger.createTimeSpan(`screenshot, publishBuild started`, true);
                results = yield connector.publishBuild(results);
                publishTimespan.finish(`screenshot, publishBuild finished`);
                if (config.flags.updateScreenshot) {
                    // updating the master screenshot
                    if (results.currentBuild && typeof results.currentBuild.previewUrl === 'string') {
                        config.logger.info(config.logger.magenta(results.currentBuild.previewUrl));
                    }
                }
                else {
                    // comparing the screenshot to master
                    if (results.compare) {
                        try {
                            yield connector.updateScreenshotCache(screenshotCache, results);
                        }
                        catch (e) {
                            config.logger.error(e);
                        }
                        config.logger.info(`screenshots compared: ${results.compare.diffs.length}`);
                        if (typeof results.compare.url === 'string') {
                            config.logger.info(config.logger.magenta(results.compare.url));
                        }
                    }
                }
            }
        }
        catch (e) {
            config.logger.error(e, e.stack);
        }
        return passed;
    });
}
function createBuildId() {
    const d = new Date();
    let fmDt = (d.getFullYear() + '');
    fmDt += ('0' + (d.getMonth() + 1)).slice(-2);
    fmDt += ('0' + d.getDate()).slice(-2);
    fmDt += ('0' + d.getHours()).slice(-2);
    fmDt += ('0' + d.getMinutes()).slice(-2);
    fmDt += ('0' + d.getSeconds()).slice(-2);
    return fmDt;
}
function createBuildMessage() {
    const d = new Date();
    let fmDt = (d.getFullYear() + '') + '-';
    fmDt += ('0' + (d.getMonth() + 1)).slice(-2) + '-';
    fmDt += ('0' + d.getDate()).slice(-2) + ' ';
    fmDt += ('0' + d.getHours()).slice(-2) + ':';
    fmDt += ('0' + d.getMinutes()).slice(-2) + ':';
    fmDt += ('0' + d.getSeconds()).slice(-2);
    return `Build: ${fmDt}`;
}

class Testing {
    constructor(config) {
        this.isValid = false;
        const { Compiler } = require('../compiler/index.js');
        this.compiler = new Compiler(setupTestingConfig(config));
        this.config = this.compiler.config;
        this.isValid = this.compiler.isValid;
        if (this.isValid) {
            if (!config.flags.spec && !config.flags.e2e) {
                config.logger.error(`Testing requires either the --spec or --e2e command line flags, or both. For example, to run unit tests, use the command: stencil test --spec`);
                this.isValid = false;
            }
        }
    }
    runTests() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isValid || !this.compiler) {
                return false;
            }
            const env = process.env;
            const compiler = this.compiler;
            const config = this.config;
            const { isValid, outputTarget } = getOutputTarget(config);
            if (!isValid) {
                this.isValid = false;
                return false;
            }
            const msg = [];
            if (config.flags.e2e) {
                msg.push('e2e');
                env.__STENCIL_E2E_TESTS__ = 'true';
            }
            if (config.flags.spec) {
                msg.push('spec');
                env.__STENCIL_SPEC_TESTS__ = 'true';
            }
            config.logger.info(config.logger.magenta(`testing ${msg.join(' and ')} files`));
            const doScreenshots = !!(config.flags.e2e && config.flags.screenshot);
            if (doScreenshots) {
                env.__STENCIL_SCREENSHOT__ = 'true';
                if (config.flags.updateScreenshot) {
                    config.logger.info(config.logger.magenta(`updating master screenshots`));
                }
                else {
                    config.logger.info(config.logger.magenta(`comparing against master screenshots`));
                }
            }
            if (config.flags.e2e) {
                // e2e tests only
                // do a build, start a dev server
                // and spin up a puppeteer browser
                let buildTask = null;
                config.outputTargets.forEach(outputTarget => {
                    outputTarget.empty = false;
                });
                const doBuild = !(config.flags && config.flags.build === false);
                if (doBuild) {
                    buildTask = compiler.build();
                }
                const startupResults = yield Promise.all([
                    compiler.startDevServer(),
                    startPuppeteerBrowser(config),
                ]);
                this.devServer = startupResults[0];
                this.puppeteerBrowser = startupResults[1];
                if (doBuild) {
                    const results = yield buildTask;
                    if (!results || (!config.watch && hasError(results && results.diagnostics))) {
                        yield this.destroy();
                        return false;
                    }
                }
                if (this.devServer) {
                    env.__STENCIL_BROWSER_URL__ = this.devServer.browserUrl;
                    config.logger.debug(`dev server url: ${env.__STENCIL_BROWSER_URL__}`);
                    env.__STENCIL_LOADER_URL__ = getLoaderScriptUrl(config, outputTarget, this.devServer.browserUrl);
                    config.logger.debug(`dev server loader: ${env.__STENCIL_LOADER_URL__}`);
                }
            }
            let passed = false;
            try {
                if (doScreenshots) {
                    passed = yield runJestScreenshot(config, env);
                }
                else {
                    passed = yield runJest(config, env);
                }
                config.logger.info('');
            }
            catch (e) {
                config.logger.error(e);
            }
            return passed;
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config) {
                this.config.sys.destroy();
                this.config = null;
            }
            if (this.devServer) {
                yield this.devServer.close();
                this.devServer = null;
            }
            if (this.puppeteerBrowser) {
                yield this.puppeteerBrowser.close();
                this.puppeteerBrowser = null;
            }
            this.compiler = null;
        });
    }
}
function setupTestingConfig(config) {
    config.buildEs5 = false;
    config.devMode = true;
    config.maxConcurrentWorkers = 1;
    config.validateTypes = false;
    config.flags = config.flags || {};
    config.flags.serve = false;
    config.flags.open = false;
    return config;
}
function getOutputTarget(config) {
    let isValid = true;
    let outputTarget = config.outputTargets.find(o => o.type === 'www');
    if (!outputTarget) {
        outputTarget = config.outputTargets.find(o => o.type === 'dist');
        if (!outputTarget) {
            config.logger.error(`Test missing config output target`);
            isValid = false;
        }
    }
    outputTarget.serviceWorker = null;
    config.outputTargets = [outputTarget];
    return { isValid, outputTarget };
}
function getLoaderScriptUrl(config, outputTarget, browserUrl) {
    const appLoaderFilePath = getLoaderPath(config, outputTarget);
    let appLoadUrlPath;
    if (outputTarget.type === 'www') {
        appLoadUrlPath = config.sys.path.relative(outputTarget.dir, appLoaderFilePath);
    }
    else {
        appLoadUrlPath = config.sys.path.relative(config.rootDir, appLoaderFilePath);
    }
    return browserUrl + appLoadUrlPath;
}

exports.createJestPuppeteerEnvironment = createJestPuppeteerEnvironment;
exports.createTestRunner = createTestRunner;
exports.h = h;
exports.jestPreprocessor = jestPreprocessor;
exports.jestSetupTestFramework = jestSetupTestFramework;
exports.newE2EPage = newE2EPage;
exports.Testing = Testing;
exports.transpile = transpile;
