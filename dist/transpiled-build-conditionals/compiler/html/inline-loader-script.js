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
var app_file_naming_1 = require("../app/app-file-naming");
var util_1 = require("../util");
function inlineLoaderScript(config, compilerCtx, outputTarget, windowLocationPath, doc) {
    return __awaiter(this, void 0, void 0, function () {
        var loaderFileName, scriptElm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loaderFileName = app_file_naming_1.getLoaderFileName(config);
                    scriptElm = findExternalLoaderScript(doc, loaderFileName);
                    if (!scriptElm) return [3 /*break*/, 2];
                    // append the loader script content to the bottom of <body>
                    return [4 /*yield*/, updateInlineLoaderScriptElement(config, compilerCtx, outputTarget, doc, windowLocationPath, scriptElm)];
                case 1:
                    // append the loader script content to the bottom of <body>
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.inlineLoaderScript = inlineLoaderScript;
function findExternalLoaderScript(doc, loaderFileName) {
    var scriptElements = doc.getElementsByTagName('script');
    for (var i = 0; i < scriptElements.length; i++) {
        var src = scriptElements[i].getAttribute('src');
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
exports.isLoaderScriptSrc = isLoaderScriptSrc;
function updateInlineLoaderScriptElement(config, compilerCtx, outputTarget, doc, windowLocationPath, scriptElm) {
    return __awaiter(this, void 0, void 0, function () {
        var appLoaderPath, content, e_1, existingResourcesUrlAttr, resourcesUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appLoaderPath = app_file_naming_1.getLoaderPath(config, outputTarget);
                    content = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, compilerCtx.fs.readFile(appLoaderPath)];
                case 2:
                    // let's look it up directly
                    content = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    config.logger.debug("unable to inline loader: " + appLoaderPath, e_1);
                    return [3 /*break*/, 4];
                case 4:
                    if (!content) {
                        // didn't get good loader content, don't bother
                        return [2 /*return*/];
                    }
                    config.logger.debug("optimize " + windowLocationPath + ", inline loader");
                    // remove the external src
                    scriptElm.removeAttribute('src');
                    existingResourcesUrlAttr = scriptElm.getAttribute('data-resources-url');
                    if (!existingResourcesUrlAttr) {
                        resourcesUrl = setDataResourcesUrlAttr(config, outputTarget);
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
                    return [2 /*return*/];
            }
        });
    });
}
function setDataResourcesUrlAttr(config, outputTarget) {
    var resourcesUrl = outputTarget.resourcesUrl;
    if (!resourcesUrl) {
        resourcesUrl = config.sys.path.join(outputTarget.buildDir, config.fsNamespace);
        resourcesUrl = util_1.normalizePath(config.sys.path.relative(outputTarget.dir, resourcesUrl));
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
exports.setDataResourcesUrlAttr = setDataResourcesUrlAttr;
