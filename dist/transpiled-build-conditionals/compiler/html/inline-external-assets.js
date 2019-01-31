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
function inlineExternalAssets(config, compilerCtx, outputTarget, windowLocationPath, doc) {
    return __awaiter(this, void 0, void 0, function () {
        var linkElements, i, scriptElements;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    linkElements = doc.querySelectorAll('link[href][rel="stylesheet"]');
                    for (i = 0; i < linkElements.length; i++) {
                        inlineStyle(config, compilerCtx, outputTarget, windowLocationPath, doc, linkElements[i]);
                    }
                    scriptElements = doc.querySelectorAll('script[src]');
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < scriptElements.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, inlineScript(config, compilerCtx, outputTarget, windowLocationPath, scriptElements[i])];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.inlineExternalAssets = inlineExternalAssets;
function inlineStyle(config, compilerCtx, outputTarget, windowLocationPath, doc, linkElm) {
    return __awaiter(this, void 0, void 0, function () {
        var content, styleElm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAssetContent(config, compilerCtx, outputTarget, windowLocationPath, linkElm.href)];
                case 1:
                    content = _a.sent();
                    if (!content) {
                        return [2 /*return*/];
                    }
                    config.logger.debug("optimize " + windowLocationPath + ", inline style: " + config.sys.url.parse(linkElm.href).pathname);
                    styleElm = doc.createElement('style');
                    styleElm.innerHTML = content;
                    linkElm.parentNode.insertBefore(styleElm, linkElm);
                    linkElm.parentNode.removeChild(linkElm);
                    return [2 /*return*/];
            }
        });
    });
}
function inlineScript(config, compilerCtx, outputTarget, windowLocationPath, scriptElm) {
    return __awaiter(this, void 0, void 0, function () {
        var content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAssetContent(config, compilerCtx, outputTarget, windowLocationPath, scriptElm.src)];
                case 1:
                    content = _a.sent();
                    if (!content) {
                        return [2 /*return*/];
                    }
                    config.logger.debug("optimize " + windowLocationPath + ", inline script: " + scriptElm.src);
                    scriptElm.innerHTML = content;
                    scriptElm.removeAttribute('src');
                    return [2 /*return*/];
            }
        });
    });
}
function getAssetContent(config, ctx, outputTarget, windowLocationPath, assetUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var fromUrl, toUrl, filePath, content, fileSize, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof assetUrl !== 'string' || assetUrl.trim() === '') {
                        return [2 /*return*/, null];
                    }
                    fromUrl = config.sys.url.parse(windowLocationPath);
                    toUrl = config.sys.url.parse(assetUrl);
                    if (fromUrl.hostname !== toUrl.hostname) {
                        // not the same hostname, so we wouldn't have the file content
                        return [2 /*return*/, null];
                    }
                    filePath = getFilePathFromUrl(config, outputTarget, fromUrl, toUrl);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ctx.fs.readFile(filePath)];
                case 2:
                    content = _a.sent();
                    fileSize = content.length;
                    if (fileSize > outputTarget.inlineAssetsMaxSize) {
                        // welp, considered too big, don't inline
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, content];
                case 3:
                    e_1 = _a.sent();
                    // never found the content for this file
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getFilePathFromUrl(config, outputTarget, fromUrl, toUrl) {
    var resolvedUrl = '.' + config.sys.url.resolve(fromUrl.pathname, toUrl.pathname);
    return util_1.pathJoin(config, outputTarget.dir, resolvedUrl);
}
exports.getFilePathFromUrl = getFilePathFromUrl;
