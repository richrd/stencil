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
var constants_1 = require("./constants");
var util_1 = require("../compiler/util");
var prerender_app_1 = require("../compiler/prerender/prerender-app");
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
exports.getDefaultBuildConditionals = getDefaultBuildConditionals;
function setBuildConditionals(config, compilerCtx, coreId, buildCtx, entryModules) {
    return __awaiter(this, void 0, void 0, function () {
        var existingCoreBuild, coreBuild, promises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    existingCoreBuild = getLastBuildConditionals(compilerCtx, coreId, buildCtx);
                    if (existingCoreBuild) {
                        // cool we can use the last build conditionals
                        // because it's a rebuild, and was probably only a css or html change
                        // if it was a typescript change we need to do a full rebuild again
                        return [2 /*return*/, existingCoreBuild];
                    }
                    coreBuild = {
                        coreId: coreId,
                        clientSide: true,
                        isDev: !!config.devMode,
                        isProd: !config.devMode,
                        profile: !!(config.flags && config.flags.profile),
                        hasSlot: !!buildCtx.hasSlot,
                        hasSvg: !!buildCtx.hasSvg,
                        devInspector: config.devInspector,
                        hotModuleReplacement: config.devMode,
                        verboseError: config.devMode,
                        externalModuleLoader: false,
                        browserModuleLoader: false,
                        polyfills: false,
                        es5: false,
                        cssVarShim: false,
                        ssrServerSide: false,
                        prerenderClientSide: false,
                        prerenderExternal: false,
                        shadowDom: false,
                        scoped: false,
                        slotPolyfill: false,
                        hasMode: false,
                        event: false,
                        listener: false,
                        styles: false,
                        hostTheme: false,
                        observeAttr: false,
                        prop: false,
                        propMutable: false,
                        propConnect: false,
                        propContext: false,
                        state: false,
                        hasMembers: false,
                        updatable: false,
                        method: false,
                        element: false,
                        watchCallback: false,
                        reflectToAttr: false,
                        cmpWillLoad: false,
                        cmpDidLoad: false,
                        cmpWillUpdate: false,
                        cmpDidUpdate: false,
                        cmpDidUnload: false,
                        hostData: false
                    };
                    promises = [];
                    entryModules.forEach(function (bundle) {
                        bundle.moduleFiles.forEach(function (moduleFile) {
                            if (moduleFile.cmpMeta) {
                                promises.push(setBuildFromComponent(config, compilerCtx, coreBuild, moduleFile));
                            }
                        });
                    });
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    if (coreId === 'core') {
                        // modern build
                        coreBuild.browserModuleLoader = true;
                        coreBuild.prerenderClientSide = prerender_app_1.shouldPrerender(config);
                        coreBuild.prerenderExternal = prerender_app_1.shouldPrerenderExternal(config);
                        compilerCtx.lastBuildConditionalsBrowserEsm = coreBuild;
                    }
                    else if (coreId === 'core.pf') {
                        // polyfilled build
                        coreBuild.browserModuleLoader = true;
                        coreBuild.es5 = true;
                        coreBuild.polyfills = true;
                        coreBuild.cssVarShim = true;
                        coreBuild.prerenderClientSide = prerender_app_1.shouldPrerender(config);
                        coreBuild.prerenderExternal = prerender_app_1.shouldPrerenderExternal(config);
                        compilerCtx.lastBuildConditionalsBrowserEs5 = coreBuild;
                    }
                    else if (coreId === 'esm.es5') {
                        // es5 build to be imported by bundlers
                        coreBuild.es5 = true;
                        coreBuild.externalModuleLoader = true;
                        coreBuild.cssVarShim = true;
                        coreBuild.polyfills = true;
                        coreBuild.slotPolyfill = true;
                        compilerCtx.lastBuildConditionalsEsmEs5 = coreBuild;
                    }
                    else if (coreId === 'esm.es2017') {
                        // es2017 build to be imported by bundlers
                        coreBuild.externalModuleLoader = true;
                        coreBuild.slotPolyfill = (coreBuild.scoped && buildCtx.hasSlot);
                        compilerCtx.lastBuildConditionalsEsmEs2017 = coreBuild;
                    }
                    // TODO: hasSlot does not account for dependencies
                    coreBuild.slotPolyfill = true;
                    // TODO: hasSvg does not account for dependencies
                    coreBuild.hasSvg = true;
                    return [2 /*return*/, coreBuild];
            }
        });
    });
}
exports.setBuildConditionals = setBuildConditionals;
function getLastBuildConditionals(compilerCtx, coreId, buildCtx) {
    if (buildCtx.isRebuild && Array.isArray(buildCtx.filesChanged)) {
        // this is a rebuild and we do have lastBuildConditionals already
        var hasChangedTsFile = buildCtx.filesChanged.some(function (filePath) {
            return util_1.isTsFile(filePath);
        });
        if (!hasChangedTsFile) {
            // we didn't have a typescript change
            // so it's ok to use the lastBuildConditionals
            if (coreId === 'core' && compilerCtx.lastBuildConditionalsBrowserEsm) {
                return compilerCtx.lastBuildConditionalsBrowserEsm;
            }
            if (coreId === 'core.pf' && compilerCtx.lastBuildConditionalsBrowserEs5) {
                return compilerCtx.lastBuildConditionalsBrowserEs5;
            }
            if (coreId === 'esm.es5' && compilerCtx.lastBuildConditionalsEsmEs5) {
                return compilerCtx.lastBuildConditionalsEsmEs5;
            }
            if (coreId === 'esm.es2017' && compilerCtx.lastBuildConditionalsEsmEs2017) {
                return compilerCtx.lastBuildConditionalsEsmEs2017;
            }
        }
    }
    // we've gotta do a full rebuild of the build conditionals object again
    return null;
}
exports.getLastBuildConditionals = getLastBuildConditionals;
function setBuildFromComponent(config, compilerCtx, coreBuild, moduleFile) {
    return __awaiter(this, void 0, void 0, function () {
        var jsText, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setBuildFromComponentMeta(coreBuild, moduleFile.cmpMeta);
                    if (!moduleFile.jsFilePath) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, compilerCtx.fs.readFile(moduleFile.jsFilePath)];
                case 2:
                    jsText = _a.sent();
                    setBuildFromComponentContent(coreBuild, jsText);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    config.logger.debug("setBuildFromComponent: " + moduleFile.jsFilePath + ": " + e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setBuildFromComponentMeta(coreBuild, cmpMeta) {
    if (!cmpMeta) {
        return;
    }
    coreBuild.shadowDom = coreBuild.shadowDom || cmpMeta.encapsulationMeta === 1 /* ShadowDom */;
    coreBuild.scoped = coreBuild.scoped || cmpMeta.encapsulationMeta === 2 /* ScopedCss */;
    coreBuild.event = coreBuild.event || !!(cmpMeta.eventsMeta && cmpMeta.eventsMeta.length > 0);
    coreBuild.listener = coreBuild.listener || !!(cmpMeta.listenersMeta && cmpMeta.listenersMeta.length > 0);
    coreBuild.hostTheme = coreBuild.hostTheme || !!(cmpMeta.hostMeta && cmpMeta.hostMeta.theme);
    if (cmpMeta.stylesMeta) {
        var modeNames = Object.keys(cmpMeta.stylesMeta);
        if (modeNames.length > 0) {
            coreBuild.styles = true;
            if (!coreBuild.hasMode) {
                coreBuild.hasMode = modeNames.filter(function (m) { return m !== constants_1.DEFAULT_STYLE_MODE; }).length > 0;
            }
        }
    }
    if (cmpMeta.membersMeta) {
        var memberNames = Object.keys(cmpMeta.membersMeta);
        coreBuild.hasMembers = coreBuild.hasMembers || (memberNames.length > 0);
        memberNames.forEach(function (memberName) {
            var memberMeta = cmpMeta.membersMeta[memberName];
            var memberType = memberMeta.memberType;
            var propType = memberMeta.propType;
            if (memberType === 1 /* Prop */ || memberType === 2 /* PropMutable */) {
                coreBuild.prop = true;
                if (memberType === 2 /* PropMutable */) {
                    coreBuild.propMutable = true;
                }
                if (propType === 2 /* String */ || propType === 8 /* Number */ || propType === 4 /* Boolean */ || propType === 1 /* Any */) {
                    coreBuild.observeAttr = true;
                }
            }
            else if (memberType === 16 /* State */) {
                coreBuild.state = true;
            }
            else if (memberType === 8 /* PropConnect */) {
                coreBuild.propConnect = true;
            }
            else if (memberType === 4 /* PropContext */) {
                coreBuild.propContext = true;
            }
            else if (memberType === 32 /* Method */) {
                coreBuild.method = true;
            }
            else if (memberType === 64 /* Element */) {
                coreBuild.element = true;
            }
            if (memberMeta.watchCallbacks && memberMeta.watchCallbacks.length > 0) {
                coreBuild.watchCallback = true;
            }
            if (memberMeta.reflectToAttrib) {
                coreBuild.reflectToAttr = true;
            }
        });
    }
    coreBuild.updatable = (coreBuild.updatable || !!(coreBuild.prop || coreBuild.state));
}
exports.setBuildFromComponentMeta = setBuildFromComponentMeta;
function setBuildFromComponentContent(coreBuild, jsText) {
    if (typeof jsText !== 'string') {
        return;
    }
    // hacky to do it this way...yeah
    // but with collections the components may have been
    // built many moons ago, so we don't want to lock ourselves
    // into a very certain way that components can be parsed
    // so here we're just doing raw string checks, and there
    // wouldn't be any harm if a build section was included when it
    // wasn't needed, but these keywords are all pretty unique already
    coreBuild.cmpWillLoad = coreBuild.cmpWillLoad || jsText.includes('componentWillLoad');
    coreBuild.cmpDidLoad = coreBuild.cmpDidLoad || jsText.includes('componentDidLoad');
    coreBuild.cmpWillUpdate = coreBuild.cmpWillUpdate || jsText.includes('componentWillUpdate');
    coreBuild.cmpDidUpdate = coreBuild.cmpDidUpdate || jsText.includes('componentDidUpdate');
    coreBuild.cmpDidUnload = coreBuild.cmpDidUnload || jsText.includes('componentDidUnload');
    coreBuild.hostData = coreBuild.hostData || jsText.includes('hostData');
}
exports.setBuildFromComponentContent = setBuildFromComponentContent;
