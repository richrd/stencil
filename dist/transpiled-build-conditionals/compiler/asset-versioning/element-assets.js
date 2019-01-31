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
var util_2 = require("../util");
function versionElementAssets(config, compilerCtx, outputTarget, windowLocationHref, doc) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config.assetVersioning.versionHtml) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all(ELEMENT_TYPES.map(function (elmType) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, versionElementTypeAssets(config, compilerCtx, outputTarget, windowLocationHref, doc, elmType.selector, elmType.selector)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
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
exports.versionElementAssets = versionElementAssets;
var ELEMENT_TYPES = [
    { selector: 'link[rel="apple-touch-icon"][href]', attr: 'href' },
    { selector: 'link[rel="icon"][href]', attr: 'href' },
    { selector: 'link[rel="manifest"][href]', attr: 'href' },
    { selector: 'link[rel="stylesheet"][href]', attr: 'href' }
];
function versionElementTypeAssets(config, compilerCtx, outputTarget, windowLocationHref, doc, selector, attrName) {
    return __awaiter(this, void 0, void 0, function () {
        var elements, promises, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    elements = doc.querySelectorAll(selector);
                    promises = [];
                    for (i = 0; i < elements.length; i++) {
                        promises.push(versionElementAsset(config, compilerCtx, outputTarget, windowLocationHref, elements[i], attrName));
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function versionElementAsset(config, compilerCtx, outputTarget, windowLocationHref, elm, attrName) {
    return __awaiter(this, void 0, void 0, function () {
        var url, versionedUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = elm.getAttribute(attrName);
                    return [4 /*yield*/, versionAsset(config, compilerCtx, outputTarget, windowLocationHref, url)];
                case 1:
                    versionedUrl = _a.sent();
                    if (versionedUrl) {
                        elm.setAttribute(attrName, versionedUrl);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function versionAsset(config, compilerCtx, outputTarget, windowLocationHref, url) {
    return __awaiter(this, void 0, void 0, function () {
        var orgFilePath, content, hash, dirName, fileName, hashedFileName, hashedFilePath, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    orgFilePath = util_1.getFilePathFromUrl(config, outputTarget, windowLocationHref, url);
                    if (!orgFilePath) {
                        return [2 /*return*/, null];
                    }
                    if (!util_2.hasFileExtension(orgFilePath, TXT_EXT)) return [3 /*break*/, 4];
                    return [4 /*yield*/, compilerCtx.fs.readFile(orgFilePath)];
                case 1:
                    content = _a.sent();
                    hash = config.sys.generateContentHash(content, config.hashedFileNameLength);
                    dirName = config.sys.path.dirname(orgFilePath);
                    fileName = config.sys.path.basename(orgFilePath);
                    hashedFileName = util_1.createHashedFileName(fileName, hash);
                    hashedFilePath = config.sys.path.join(dirName, hashedFileName);
                    return [4 /*yield*/, compilerCtx.fs.writeFile(hashedFilePath, content)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, compilerCtx.fs.remove(orgFilePath)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, hashedFileName];
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
var TXT_EXT = ['js', 'css', 'svg', 'json'];
