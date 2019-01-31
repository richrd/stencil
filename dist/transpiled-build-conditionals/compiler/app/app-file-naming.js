"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
function getAppBuildDir(config, outputTarget) {
    return util_1.pathJoin(config, outputTarget.buildDir, config.fsNamespace);
}
exports.getAppBuildDir = getAppBuildDir;
function getRegistryFileName(config) {
    return config.fsNamespace + ".registry.json";
}
exports.getRegistryFileName = getRegistryFileName;
function getRegistryJson(config, outputTarget) {
    return util_1.pathJoin(config, getAppBuildDir(config, outputTarget), getRegistryFileName(config));
}
exports.getRegistryJson = getRegistryJson;
function getLoaderFileName(config) {
    return config.fsNamespace + ".js";
}
exports.getLoaderFileName = getLoaderFileName;
function getLoaderPath(config, outputTarget) {
    return util_1.pathJoin(config, outputTarget.buildDir, getLoaderFileName(config));
}
exports.getLoaderPath = getLoaderPath;
function getGlobalFileName(config) {
    return config.fsNamespace + ".global.js";
}
exports.getGlobalFileName = getGlobalFileName;
function getGlobalJsBuildPath(config, outputTarget) {
    return util_1.pathJoin(config, getAppBuildDir(config, outputTarget), getGlobalFileName(config));
}
exports.getGlobalJsBuildPath = getGlobalJsBuildPath;
function getCoreFilename(config, coreId, jsContent) {
    if (config.hashFileNames) {
        // prod mode renames the core file with its hashed content
        var contentHash = config.sys.generateContentHash(jsContent, config.hashedFileNameLength);
        return config.fsNamespace + "." + contentHash + ".js";
    }
    // dev file name
    return config.fsNamespace + "." + coreId + ".js";
}
exports.getCoreFilename = getCoreFilename;
function getDistCjsIndexPath(config, outputTarget) {
    return util_1.pathJoin(config, outputTarget.buildDir, 'index.js');
}
exports.getDistCjsIndexPath = getDistCjsIndexPath;
function getDistEsmDir(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, outputTarget.buildDir, 'esm', sourceTarget || '');
}
exports.getDistEsmDir = getDistEsmDir;
function getDistEsmComponentsDir(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), 'build');
}
exports.getDistEsmComponentsDir = getDistEsmComponentsDir;
function getDistEsmIndexPath(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), 'index.js');
}
exports.getDistEsmIndexPath = getDistEsmIndexPath;
function getCoreEsmBuildPath(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getCoreEsmFileName(config));
}
exports.getCoreEsmBuildPath = getCoreEsmBuildPath;
function getDefineCustomElementsPath(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getDefineEsmFilename(config));
}
exports.getDefineCustomElementsPath = getDefineCustomElementsPath;
function getGlobalEsmBuildPath(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getGlobalEsmFileName(config));
}
exports.getGlobalEsmBuildPath = getGlobalEsmBuildPath;
function getComponentsEsmBuildPath(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), getComponentsEsmFileName(config));
}
exports.getComponentsEsmBuildPath = getComponentsEsmBuildPath;
function getPolyfillsEsmBuildPath(config, outputTarget, sourceTarget) {
    return util_1.pathJoin(config, getDistEsmDir(config, outputTarget, sourceTarget), "polyfills");
}
exports.getPolyfillsEsmBuildPath = getPolyfillsEsmBuildPath;
function getCoreEsmFileName(config) {
    return config.fsNamespace + ".core.js";
}
exports.getCoreEsmFileName = getCoreEsmFileName;
function getDefineEsmFilename(config) {
    return config.fsNamespace + ".define.js";
}
exports.getDefineEsmFilename = getDefineEsmFilename;
function getGlobalEsmFileName(config) {
    return config.fsNamespace + ".global.js";
}
exports.getGlobalEsmFileName = getGlobalEsmFileName;
function getComponentsEsmFileName(config) {
    return config.fsNamespace + ".components.js";
}
exports.getComponentsEsmFileName = getComponentsEsmFileName;
function getLoaderEsmPath(config, outputTarget) {
    return util_1.pathJoin(config, outputTarget.buildDir, outputTarget.esmLoaderPath);
}
exports.getLoaderEsmPath = getLoaderEsmPath;
function getGlobalStyleFilename(config) {
    return config.fsNamespace + ".css";
}
exports.getGlobalStyleFilename = getGlobalStyleFilename;
function getBrowserFilename(bundleId, isScopedStyles, sourceTarget) {
    return "" + bundleId + (isScopedStyles ? '.sc' : '') + (sourceTarget === 'es5' ? '.es5' : '') + ".entry.js";
}
exports.getBrowserFilename = getBrowserFilename;
function getEsmFilename(bundleId, isScopedStyles) {
    return "" + bundleId + (isScopedStyles ? '.sc' : '') + ".entry.js";
}
exports.getEsmFilename = getEsmFilename;
function getComponentsDtsSrcFilePath(config) {
    return util_1.pathJoin(config, config.srcDir, exports.GENERATED_DTS);
}
exports.getComponentsDtsSrcFilePath = getComponentsDtsSrcFilePath;
function getComponentsDtsTypesFilePath(config, outputTarget) {
    return util_1.pathJoin(config, outputTarget.typesDir, exports.GENERATED_DTS);
}
exports.getComponentsDtsTypesFilePath = getComponentsDtsTypesFilePath;
exports.GENERATED_DTS = 'components.d.ts';
