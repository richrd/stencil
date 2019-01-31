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
var hydrate_utils_1 = require("./hydrate-utils");
var connect_element_1 = require("./connect-element");
var platform_server_1 = require("./platform-server");
var optimize_html_1 = require("../compiler/html/optimize-html");
var constants_1 = require("../util/constants");
function hydrateHtml(config, compilerCtx, outputTarget, cmpRegistry, opts, perf) {
    var _this = this;
    return new Promise(function (resolve) {
        // validate the hydrate options and add any missing info
        var hydrateTarget = hydrate_utils_1.normalizeHydrateOptions(outputTarget, opts);
        // create the results object we're gonna return
        var hydrateResults = hydrate_utils_1.generateHydrateResults(config, hydrateTarget);
        // create a emulated window
        // attach data the request to the window
        var dom = config.sys.createDom();
        var win = dom.parse(hydrateTarget);
        var doc = win.document;
        // normalize dir and lang before connecting elements
        // so that the info is their incase they read it at runtime
        hydrate_utils_1.normalizeDirection(doc, hydrateTarget);
        hydrate_utils_1.normalizeLanguage(doc, hydrateTarget);
        // create the app global
        var App = {};
        // create the platform
        var plt = platform_server_1.createPlatformServer(config, hydrateTarget, win, doc, App, cmpRegistry, hydrateResults.diagnostics, hydrateTarget.isPrerender, compilerCtx);
        // fire off this function when the app has finished loading
        // and all components have finished hydrating
        plt.onAppLoad = function (rootElm, failureDiagnostic) { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config._isTesting) {
                            hydrateResults.__testPlatform = plt;
                        }
                        if (failureDiagnostic) {
                            hydrateResults.html = hydrate_utils_1.generateFailureDiagnostic(failureDiagnostic);
                            dom.destroy();
                            resolve(hydrateResults);
                            return [2 /*return*/];
                        }
                        if (!rootElm) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // optimize this document!!
                        return [4 /*yield*/, optimize_html_1.optimizeHtml(config, compilerCtx, hydrateTarget, hydrateResults.url, doc, hydrateResults.diagnostics)];
                    case 2:
                        // optimize this document!!
                        _a.sent();
                        // gather up all of the <a> tag information in the doc
                        if (hydrateTarget.isPrerender && hydrateTarget.hydrateComponents) {
                            hydrate_utils_1.collectAnchors(config, doc, hydrateResults);
                        }
                        // serialize this dom back into a string
                        if (hydrateTarget.serializeHtml !== false) {
                            hydrateResults.html = dom.serialize();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        // gahh, something's up
                        hydrateResults.diagnostics.push({
                            level: 'error',
                            type: 'hydrate',
                            header: 'DOM Serialize',
                            messageText: e_1
                        });
                        // idk, some error, just use the original html
                        hydrateResults.html = hydrateTarget.html;
                        return [3 /*break*/, 4];
                    case 4:
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
                        return [2 /*return*/];
                }
            });
        }); };
        if (hydrateTarget.hydrateComponents === false) {
            plt.onAppLoad(win.document.body);
            return;
        }
        // patch the render function that we can add SSR ids
        // and to connect any elements it may have just appened to the DOM
        var ssrIds = 0;
        var pltRender = plt.render;
        plt.render = function render(hostElm, oldVNode, newVNode, useNativeShadowDom, encapsulation) {
            var ssrId;
            var existingSsrId;
            if (hydrateTarget.ssrIds !== false) {
                // this may have been patched more than once
                // so reuse the ssr id if it already has one
                if (oldVNode && oldVNode.elm) {
                    existingSsrId = oldVNode.elm.getAttribute(constants_1.SSR_VNODE_ID);
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
            connect_element_1.connectChildElements(config, plt, App, hydrateResults, newVNode.elm, perf);
            return newVNode;
        };
        // loop through each node and start connecting/hydrating
        // any elements that are host elements to components
        // this kicks off all the async hydrating
        connect_element_1.connectChildElements(config, plt, App, hydrateResults, win.document.body, perf);
        if (hydrateResults.components.length === 0) {
            // what gives, never found ANY host elements to connect!
            // ok we're just done i guess, idk
            hydrateResults.html = hydrateTarget.html;
            resolve(hydrateResults);
        }
    });
}
exports.hydrateHtml = hydrateHtml;
