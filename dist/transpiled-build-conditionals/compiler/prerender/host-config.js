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
var constants_1 = require("../../util/constants");
var app_file_naming_1 = require("../app/app-file-naming");
var util_1 = require("../util");
function generateHostConfig(config, compilerCtx, outputTarget, entryModules, hydrateResultss) {
    return __awaiter(this, void 0, void 0, function () {
        var hostConfig, hostConfigFilePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hostConfig = {
                        hosting: {
                            rules: []
                        }
                    };
                    hydrateResultss = hydrateResultss.sort(function (a, b) {
                        if (a.url.toLowerCase() < b.url.toLowerCase())
                            return -1;
                        if (a.url.toLowerCase() > b.url.toLowerCase())
                            return 1;
                        return 0;
                    });
                    hydrateResultss.forEach(function (hydrateResults) {
                        var hostRule = generateHostRule(config, compilerCtx, outputTarget, entryModules, hydrateResults);
                        if (hostRule) {
                            hostConfig.hosting.rules.push(hostRule);
                        }
                    });
                    addDefaults(config, outputTarget, hostConfig);
                    hostConfigFilePath = util_1.pathJoin(config, outputTarget.dir, exports.HOST_CONFIG_FILENAME);
                    return [4 /*yield*/, mergeUserHostConfigFile(config, compilerCtx, hostConfig)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, compilerCtx.fs.writeFile(hostConfigFilePath, JSON.stringify(hostConfig, null, 2))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.generateHostConfig = generateHostConfig;
function generateHostRule(config, compilerCtx, outputTarget, entryModules, hydrateResults) {
    var hostRule = {
        include: hydrateResults.path,
        headers: generateHostRuleHeaders(config, compilerCtx, outputTarget, entryModules, hydrateResults)
    };
    if (hostRule.headers.length === 0) {
        return null;
    }
    return hostRule;
}
exports.generateHostRule = generateHostRule;
function generateHostRuleHeaders(config, compilerCtx, outputTarget, entryModules, hydrateResults) {
    var hostRuleHeaders = [];
    addStyles(config, hostRuleHeaders, hydrateResults);
    addCoreJs(config, outputTarget, compilerCtx.appCoreWWWPath, hostRuleHeaders);
    addBundles(config, outputTarget, entryModules, hostRuleHeaders, hydrateResults.components);
    addScripts(config, hostRuleHeaders, hydrateResults);
    addImgs(config, hostRuleHeaders, hydrateResults);
    return hostRuleHeaders;
}
exports.generateHostRuleHeaders = generateHostRuleHeaders;
function addCoreJs(config, outputTarget, appCoreWWWPath, hostRuleHeaders) {
    var url = getUrlFromFilePath(config, outputTarget, appCoreWWWPath);
    hostRuleHeaders.push(formatLinkRelPreloadHeader(url));
}
function addBundles(config, outputTarget, entryModules, hostRuleHeaders, components) {
    components = sortComponents(components);
    var bundleIds = getBundleIds(entryModules, components);
    bundleIds.forEach(function (bundleId) {
        if (hostRuleHeaders.length < MAX_LINK_REL_PRELOAD_COUNT) {
            var bundleUrl = getBundleUrl(config, outputTarget, bundleId);
            hostRuleHeaders.push(formatLinkRelPreloadHeader(bundleUrl));
        }
    });
}
exports.addBundles = addBundles;
function getBundleIds(entryModules, components) {
    var bundleIds = [];
    components.forEach(function (cmp) {
        entryModules.forEach(function (mb) {
            var moduleFile = mb.moduleFiles.find(function (mf) { return mf.cmpMeta && mf.cmpMeta.tagNameMeta === cmp.tag; });
            if (!moduleFile) {
                return;
            }
            var bundleId;
            if (typeof moduleFile.cmpMeta.bundleIds === 'string') {
                bundleId = moduleFile.cmpMeta.bundleIds;
            }
            else {
                bundleId = moduleFile.cmpMeta.bundleIds[DEFAULT_MODE];
                if (!bundleId) {
                    bundleId = moduleFile.cmpMeta.bundleIds[constants_1.DEFAULT_STYLE_MODE];
                }
            }
            if (bundleId && bundleIds.indexOf(bundleId) === -1) {
                bundleIds.push(bundleId);
            }
        });
    });
    return bundleIds;
}
exports.getBundleIds = getBundleIds;
function getBundleUrl(config, outputTarget, bundleId) {
    var unscopedFileName = app_file_naming_1.getBrowserFilename(bundleId, false);
    var unscopedWwwBuildPath = util_1.pathJoin(config, app_file_naming_1.getAppBuildDir(config, outputTarget), unscopedFileName);
    return getUrlFromFilePath(config, outputTarget, unscopedWwwBuildPath);
}
function getUrlFromFilePath(config, outputTarget, filePath) {
    var url = util_1.pathJoin(config, '/', config.sys.path.relative(outputTarget.dir, filePath));
    url = outputTarget.baseUrl + url.substring(1);
    return url;
}
exports.getUrlFromFilePath = getUrlFromFilePath;
function sortComponents(components) {
    return components.sort(function (a, b) {
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
exports.sortComponents = sortComponents;
function addStyles(config, hostRuleHeaders, hydrateResults) {
    hydrateResults.styleUrls.forEach(function (styleUrl) {
        if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
            return;
        }
        var url = config.sys.url.parse(styleUrl);
        if (url.hostname === hydrateResults.hostname) {
            hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
        }
    });
}
function addScripts(config, hostRuleHeaders, hydrateResults) {
    hydrateResults.scriptUrls.forEach(function (scriptUrl) {
        if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
            return;
        }
        var url = config.sys.url.parse(scriptUrl);
        if (url.hostname === hydrateResults.hostname) {
            hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
        }
    });
}
function addImgs(config, hostRuleHeaders, hydrateResults) {
    hydrateResults.imgUrls.forEach(function (imgUrl) {
        if (hostRuleHeaders.length >= MAX_LINK_REL_PRELOAD_COUNT) {
            return;
        }
        var url = config.sys.url.parse(imgUrl);
        if (url.hostname === hydrateResults.hostname) {
            hostRuleHeaders.push(formatLinkRelPreloadHeader(url.path));
        }
    });
}
function formatLinkRelPreloadHeader(url) {
    var header = {
        name: 'Link',
        value: formatLinkRelPreloadValue(url)
    };
    return header;
}
exports.formatLinkRelPreloadHeader = formatLinkRelPreloadHeader;
function formatLinkRelPreloadValue(url) {
    var parts = [
        "<" + url + ">",
        "rel=preload"
    ];
    var ext = url.split('.').pop().toLowerCase();
    if (ext === SCRIPT_EXT) {
        parts.push("as=script");
    }
    else if (ext === STYLE_EXT) {
        parts.push("as=style");
    }
    else if (IMG_EXTS.indexOf(ext) > -1) {
        parts.push("as=image");
    }
    return parts.join(';');
}
function addDefaults(config, outputTarget, hostConfig) {
    addBuildDirCacheControl(config, outputTarget, hostConfig);
    addServiceWorkerNoCacheControl(config, outputTarget, hostConfig);
}
function addBuildDirCacheControl(config, outputTarget, hostConfig) {
    var url = getUrlFromFilePath(config, outputTarget, app_file_naming_1.getAppBuildDir(config, outputTarget));
    hostConfig.hosting.rules.push({
        include: util_1.pathJoin(config, url, '**'),
        headers: [
            {
                name: "Cache-Control",
                value: "public, max-age=31536000"
            }
        ]
    });
}
function addServiceWorkerNoCacheControl(config, outputTarget, hostConfig) {
    if (!outputTarget.serviceWorker) {
        return;
    }
    var url = getUrlFromFilePath(config, outputTarget, outputTarget.serviceWorker.swDest);
    hostConfig.hosting.rules.push({
        include: url,
        headers: [
            {
                name: "Cache-Control",
                value: "no-cache, no-store, must-revalidate"
            }
        ]
    });
}
function mergeUserHostConfigFile(config, compilerCtx, hostConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var hostConfigFilePath, userHostConfigStr, userHostConfig, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hostConfigFilePath = util_1.pathJoin(config, config.srcDir, exports.HOST_CONFIG_FILENAME);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, compilerCtx.fs.readFile(hostConfigFilePath)];
                case 2:
                    userHostConfigStr = _a.sent();
                    userHostConfig = JSON.parse(userHostConfigStr);
                    mergeUserHostConfig(userHostConfig, hostConfig);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function mergeUserHostConfig(userHostConfig, hostConfig) {
    if (!userHostConfig || !userHostConfig.hosting) {
        return;
    }
    if (!Array.isArray(userHostConfig.hosting.rules)) {
        return;
    }
    var rules = userHostConfig.hosting.rules.concat(hostConfig.hosting.rules);
    hostConfig.hosting.rules = rules;
}
exports.mergeUserHostConfig = mergeUserHostConfig;
var DEFAULT_MODE = 'md';
var MAX_LINK_REL_PRELOAD_COUNT = 6;
exports.HOST_CONFIG_FILENAME = 'host.config.json';
var IMG_EXTS = ['png', 'gif', 'svg', 'jpg', 'jpeg', 'webp'];
var STYLE_EXT = 'css';
var SCRIPT_EXT = 'js';
