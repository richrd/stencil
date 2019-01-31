"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
/**
 * Interal minifier, not exposed publicly.
 */
function minifyJs(config, compilerCtx, diagnostics, jsText, sourceTarget, preamble, buildTimestamp) {
    return __awaiter(this, void 0, void 0, function () {
        var opts, cacheKey, cachedContent, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opts = {
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
                        opts.output.preamble = util_1.generatePreamble(config, { suffix: buildTimestamp });
                    }
                    if (!compilerCtx) return [3 /*break*/, 2];
                    cacheKey = compilerCtx.cache.createKey('minifyJs', '__BUILDID:MINIFYJS__', opts, jsText);
                    return [4 /*yield*/, compilerCtx.cache.get(cacheKey)];
                case 1:
                    cachedContent = _a.sent();
                    if (cachedContent != null) {
                        return [2 /*return*/, cachedContent];
                    }
                    _a.label = 2;
                case 2: return [4 /*yield*/, config.sys.minifyJs(jsText, opts)];
                case 3:
                    r = _a.sent();
                    if (!(r && r.diagnostics.length === 0 && typeof r.output === 'string')) return [3 /*break*/, 5];
                    r.output = auxMinify(r.output);
                    if (!compilerCtx) return [3 /*break*/, 5];
                    return [4 /*yield*/, compilerCtx.cache.put(cacheKey, r.output)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (r.diagnostics.length > 0) {
                        diagnostics.push.apply(diagnostics, r.diagnostics);
                        return [2 /*return*/, jsText];
                    }
                    else {
                        return [2 /*return*/, r.output];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.minifyJs = minifyJs;
function auxMinify(jsText) {
    return jsText.replace(/^window;/, '');
}
