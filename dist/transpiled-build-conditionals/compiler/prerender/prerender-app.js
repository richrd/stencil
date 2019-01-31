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
var util_1 = require("../util");
var prerender_utils_1 = require("./prerender-utils");
var host_config_1 = require("./host-config");
var optimize_html_1 = require("../html/optimize-html");
var prerender_path_1 = require("./prerender-path");
function prerenderOutputTargets(config, compilerCtx, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function () {
        var outputTargets;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config.srcIndexHtml) {
                        return [2 /*return*/];
                    }
                    outputTargets = config.outputTargets.filter(function (o) {
                        return o.type === 'www' && o.indexHtml;
                    });
                    return [4 /*yield*/, Promise.all(outputTargets.map(function (outputTarget) { return __awaiter(_this, void 0, void 0, function () {
                            var windowLocationPath;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(outputTarget.hydrateComponents && outputTarget.prerenderLocations && outputTarget.prerenderLocations.length > 0)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, prerenderOutputTarget(config, compilerCtx, buildCtx, outputTarget, entryModules)];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        windowLocationPath = outputTarget.baseUrl;
                                        return [4 /*yield*/, optimize_html_1.optimizeIndexHtml(config, compilerCtx, outputTarget, windowLocationPath, buildCtx.diagnostics)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.prerenderOutputTargets = prerenderOutputTargets;
function shouldPrerender(config) {
    if (!config.srcIndexHtml) {
        return false;
    }
    var outputTargets = config.outputTargets.filter(function (o) {
        return o.type === 'www' && o.indexHtml && o.hydrateComponents && o.prerenderLocations && o.prerenderLocations.length > 0;
    });
    return (outputTargets.length > 0);
}
exports.shouldPrerender = shouldPrerender;
/**
 * shouldPrerenderExternal
 * @description Checks if the cli flag has been set that a external prerenderer will be used
 * @param config build config
 */
function shouldPrerenderExternal(config) {
    return config.flags && config.flags.prerenderExternal;
}
exports.shouldPrerenderExternal = shouldPrerenderExternal;
function prerenderOutputTarget(config, compilerCtx, buildCtx, outputTarget, entryModules) {
    return __awaiter(this, void 0, void 0, function () {
        var indexHtml, e_1, prerenderQueue, d_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    indexHtml = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, compilerCtx.fs.readFile(outputTarget.indexHtml)];
                case 2:
                    indexHtml = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (typeof indexHtml !== 'string') {
                        // looks like we don't have an index html file, which is fine
                        buildCtx.debug("prerenderApp, missing index.html for prerendering");
                        return [2 /*return*/, []];
                    }
                    prerenderQueue = prerender_utils_1.getPrerenderQueue(config, outputTarget);
                    if (!prerenderQueue.length) {
                        d_1 = util_1.buildWarn(buildCtx.diagnostics);
                        d_1.messageText = "No urls found in the prerender config";
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, runPrerenderApp(config, compilerCtx, buildCtx, outputTarget, entryModules, prerenderQueue, indexHtml)];
            }
        });
    });
}
function runPrerenderApp(config, compilerCtx, buildCtx, outputTarget, entryModules, prerenderQueue, indexHtml) {
    return __awaiter(this, void 0, void 0, function () {
        var timeSpan, hydrateResults, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timeSpan = buildCtx.createTimeSpan("prerendering started", !outputTarget.hydrateComponents);
                    hydrateResults = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            drainPrerenderQueue(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexHtml, hydrateResults, resolve);
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, host_config_1.generateHostConfig(config, compilerCtx, outputTarget, entryModules, hydrateResults)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    util_1.catchError(buildCtx.diagnostics, e_2);
                    return [3 /*break*/, 5];
                case 5:
                    hydrateResults.forEach(function (hydrateResult) {
                        hydrateResult.diagnostics.forEach(function (diagnostic) {
                            buildCtx.diagnostics.push(diagnostic);
                        });
                    });
                    if (util_1.hasError(buildCtx.diagnostics)) {
                        timeSpan.finish("prerendering failed");
                    }
                    else {
                        timeSpan.finish("prerendered urls: " + hydrateResults.length);
                    }
                    if (compilerCtx.localPrerenderServer) {
                        compilerCtx.localPrerenderServer.close();
                        delete compilerCtx.localPrerenderServer;
                    }
                    return [2 /*return*/, hydrateResults];
            }
        });
    });
}
function drainPrerenderQueue(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexSrcHtml, hydrateResults, resolve) {
    for (var i = 0; i < outputTarget.prerenderMaxConcurrent; i++) {
        var activelyProcessingCount = prerenderQueue.filter(function (p) { return p.status === 'processing'; }).length;
        if (activelyProcessingCount >= outputTarget.prerenderMaxConcurrent) {
            // whooaa, slow down there buddy, let's not get carried away
            break;
        }
        runNextPrerenderUrl(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexSrcHtml, hydrateResults, resolve);
    }
    var remaining = prerenderQueue.filter(function (p) {
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
    return __awaiter(this, void 0, void 0, function () {
        var p, results, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    p = prerenderQueue.find(function (p) { return p.status === 'pending'; });
                    if (!p)
                        return [2 /*return*/];
                    // we've got a url that's pending
                    // well guess what, it's go time
                    p.status = 'processing';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, prerender_path_1.prerenderPath(config, compilerCtx, buildCtx, outputTarget, indexSrcHtml, p)];
                case 2:
                    results = _a.sent();
                    // awesome!!
                    if (outputTarget.prerenderUrlCrawl) {
                        prerender_utils_1.crawlAnchorsForNextUrls(config, outputTarget, prerenderQueue, results.url, results.anchors);
                    }
                    hydrateResults.push(results);
                    return [4 /*yield*/, writePrerenderDest(config, compilerCtx, outputTarget, results)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    // darn, idk, bad news
                    util_1.catchError(buildCtx.diagnostics, e_3);
                    return [3 /*break*/, 5];
                case 5:
                    // this job is not complete
                    p.status = 'complete';
                    // let's try to drain the queue again and let this
                    // next call figure out if we're actually done or not
                    drainPrerenderQueue(config, compilerCtx, buildCtx, outputTarget, prerenderQueue, indexSrcHtml, hydrateResults, resolve);
                    return [2 /*return*/];
            }
        });
    });
}
function writePrerenderDest(config, compilerCtx, outputTarget, results) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = prerender_utils_1.getWritePathFromUrl(config, outputTarget, results.url);
                    // add the prerender html content it to our collection of
                    // files that need to be saved when we're all ready
                    return [4 /*yield*/, compilerCtx.fs.writeFile(filePath, results.html, { useCache: false })];
                case 1:
                    // add the prerender html content it to our collection of
                    // files that need to be saved when we're all ready
                    _a.sent();
                    // write the files now
                    // and since we're not using cache it'll free up its memory
                    return [4 /*yield*/, compilerCtx.fs.commit()];
                case 2:
                    // write the files now
                    // and since we're not using cache it'll free up its memory
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
