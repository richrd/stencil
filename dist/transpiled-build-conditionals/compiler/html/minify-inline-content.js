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
var minifier_1 = require("../minifier");
var optimize_css_1 = require("../style/optimize-css");
function minifyInlineScripts(config, compilerCtx, doc, diagnostics) {
    return __awaiter(this, void 0, void 0, function () {
        var scripts, promises, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scripts = doc.querySelectorAll('script');
                    promises = [];
                    for (i = 0; i < scripts.length; i++) {
                        promises.push(minifyInlineScript(config, compilerCtx, diagnostics, scripts[i]));
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.minifyInlineScripts = minifyInlineScripts;
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
    var type = script.getAttribute('type');
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
exports.canMinifyInlineScript = canMinifyInlineScript;
var VALID_SCRIPT_TYPES = ['application/javascript', 'application/ecmascript', ''];
function minifyInlineScript(config, compilerCtx, diagnostics, script) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!canMinifyInlineScript(script)) {
                        return [2 /*return*/];
                    }
                    _a = script;
                    return [4 /*yield*/, minifier_1.minifyJs(config, compilerCtx, diagnostics, script.innerHTML, 'es5', false)];
                case 1:
                    _a.innerHTML = _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.minifyInlineScript = minifyInlineScript;
function minifyInlineStyles(config, compilerCtx, doc, diagnostics) {
    return __awaiter(this, void 0, void 0, function () {
        var styles, promises, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    styles = doc.querySelectorAll('style');
                    promises = [];
                    for (i = 0; i < styles.length; i++) {
                        promises.push(minifyInlineStyle(config, compilerCtx, diagnostics, styles[i]));
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.minifyInlineStyles = minifyInlineStyles;
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
exports.canMinifyInlineStyle = canMinifyInlineStyle;
function minifyInlineStyle(config, compilerCtx, diagnostics, style) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!canMinifyInlineStyle(style)) return [3 /*break*/, 2];
                    _a = style;
                    return [4 /*yield*/, optimize_css_1.optimizeCss(config, compilerCtx, diagnostics, style.innerHTML, null, true)];
                case 1:
                    _a.innerHTML = _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
