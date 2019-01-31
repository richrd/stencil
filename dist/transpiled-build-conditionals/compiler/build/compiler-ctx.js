"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("../events");
var cache_1 = require("../cache");
var in_memory_fs_1 = require("../../util/in-memory-fs");
var util_1 = require("../util");
function getModuleFile(compilerCtx, sourceFilePath) {
    sourceFilePath = util_1.normalizePath(sourceFilePath);
    return compilerCtx.moduleFiles[sourceFilePath] = compilerCtx.moduleFiles[sourceFilePath] || {
        sourceFilePath: sourceFilePath,
        localImports: [],
        externalImports: [],
        potentialCmpRefs: []
    };
}
exports.getModuleFile = getModuleFile;
function getCompilerCtx(config, compilerCtx) {
    // reusable data between builds
    compilerCtx = compilerCtx || {};
    compilerCtx.isActivelyBuilding = false;
    compilerCtx.fs = compilerCtx.fs || new in_memory_fs_1.InMemoryFileSystem(config.sys.fs, config.sys);
    if (!compilerCtx.cache) {
        compilerCtx.cache = new cache_1.Cache(config, new in_memory_fs_1.InMemoryFileSystem(config.sys.fs, config.sys));
        compilerCtx.cache.initCacheDir();
    }
    compilerCtx.events = compilerCtx.events || new events_1.BuildEvents();
    compilerCtx.appFiles = compilerCtx.appFiles || {};
    compilerCtx.moduleFiles = compilerCtx.moduleFiles || {};
    compilerCtx.collections = compilerCtx.collections || [];
    compilerCtx.resolvedCollections = compilerCtx.resolvedCollections || [];
    compilerCtx.compiledModuleJsText = compilerCtx.compiledModuleJsText || {};
    compilerCtx.compiledModuleLegacyJsText = compilerCtx.compiledModuleLegacyJsText || {};
    compilerCtx.lastBuildStyles = compilerCtx.lastBuildStyles || new Map();
    compilerCtx.cachedStyleMeta = compilerCtx.cachedStyleMeta || new Map();
    compilerCtx.lastComponentStyleInput = compilerCtx.lastComponentStyleInput || new Map();
    if (typeof compilerCtx.activeBuildId !== 'number') {
        compilerCtx.activeBuildId = -1;
    }
    return compilerCtx;
}
exports.getCompilerCtx = getCompilerCtx;
function resetCompilerCtx(compilerCtx) {
    compilerCtx.fs.clearCache();
    compilerCtx.cache.clear();
    compilerCtx.appFiles = {};
    compilerCtx.moduleFiles = {};
    compilerCtx.collections.length = 0;
    compilerCtx.resolvedCollections.length = 0;
    compilerCtx.compiledModuleJsText = {};
    compilerCtx.compiledModuleLegacyJsText = {};
    compilerCtx.compilerOptions = null;
    compilerCtx.cachedStyleMeta.clear();
    compilerCtx.lastComponentStyleInput.clear();
    compilerCtx.tsService = null;
    compilerCtx.rootTsFiles = null;
    // do NOT reset 'hasSuccessfulBuild'
}
exports.resetCompilerCtx = resetCompilerCtx;
