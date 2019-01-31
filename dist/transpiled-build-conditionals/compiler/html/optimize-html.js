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
var asset_versioning_1 = require("../asset-versioning/asset-versioning");
var util_1 = require("../util");
var collapse_html_whitespace_1 = require("./collapse-html-whitespace");
var inline_external_assets_1 = require("./inline-external-assets");
var inline_loader_script_1 = require("./inline-loader-script");
var minify_inline_content_1 = require("./minify-inline-content");
var optimize_ssr_styles_1 = require("../style/optimize-ssr-styles");
var relocate_meta_charset_1 = require("./relocate-meta-charset");
var canonical_link_1 = require("./canonical-link");
function optimizeHtml(config, compilerCtx, hydrateTarget, windowLocationPath, doc, diagnostics) {
    return __awaiter(this, void 0, void 0, function () {
        var promises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promises = [];
                    if (hydrateTarget.hydrateComponents) {
                        doc.documentElement.setAttribute('data-ssr', (typeof hydrateTarget.timestamp === 'string' ? hydrateTarget.timestamp : ''));
                    }
                    if (hydrateTarget.canonicalLink) {
                        try {
                            canonical_link_1.updateCanonicalLink(config, doc, windowLocationPath);
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
                            optimize_ssr_styles_1.optimizeSsrStyles(config, hydrateTarget, doc, diagnostics);
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
                        promises.push(inline_loader_script_1.inlineLoaderScript(config, compilerCtx, hydrateTarget, windowLocationPath, doc));
                    }
                    if (hydrateTarget.inlineAssetsMaxSize > 0) {
                        promises.push(inline_external_assets_1.inlineExternalAssets(config, compilerCtx, hydrateTarget, windowLocationPath, doc));
                    }
                    if (hydrateTarget.collapseWhitespace && !config.devMode && config.logLevel !== 'debug') {
                        // collapseWhitespace is the default
                        try {
                            config.logger.debug("optimize " + windowLocationPath + ", collapse html whitespace");
                            collapse_html_whitespace_1.collapseHtmlWhitepace(doc.documentElement);
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
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    // need to wait on to see if external files are inlined
                    _a.sent();
                    // reset for new promises
                    promises.length = 0;
                    if (config.minifyCss) {
                        promises.push(minify_inline_content_1.minifyInlineStyles(config, compilerCtx, doc, diagnostics));
                    }
                    if (config.minifyJs) {
                        promises.push(minify_inline_content_1.minifyInlineScripts(config, compilerCtx, doc, diagnostics));
                    }
                    if (config.assetVersioning) {
                        promises.push(asset_versioning_1.assetVersioning(config, compilerCtx, hydrateTarget, windowLocationPath, doc));
                    }
                    relocate_meta_charset_1.relocateMetaCharset(doc);
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.optimizeHtml = optimizeHtml;
function optimizeIndexHtml(config, compilerCtx, hydrateTarget, windowLocationPath, diagnostics) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, dom, win, doc, e_1, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    _a = hydrateTarget;
                    return [4 /*yield*/, compilerCtx.fs.readFile(hydrateTarget.indexHtml)];
                case 1:
                    _a.html = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    dom = config.sys.createDom();
                    win = dom.parse(hydrateTarget);
                    doc = win.document;
                    return [4 /*yield*/, optimizeHtml(config, compilerCtx, hydrateTarget, windowLocationPath, doc, diagnostics)];
                case 3:
                    _b.sent();
                    // serialize this dom back into a string
                    return [4 /*yield*/, compilerCtx.fs.writeFile(hydrateTarget.indexHtml, dom.serialize())];
                case 4:
                    // serialize this dom back into a string
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _b.sent();
                    util_1.catchError(diagnostics, e_1);
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 8];
                case 7:
                    e_2 = _b.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.optimizeIndexHtml = optimizeIndexHtml;
