"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var config_utils_1 = require("./config-utils");
var typescript_1 = require("typescript");
function validatePaths(config) {
    var path = config.sys.path;
    if (typeof config.globalScript === 'string' && !path.isAbsolute(config.globalScript)) {
        if (!path.isAbsolute(config.globalScript)) {
            config.globalScript = path.join(config.rootDir, config.globalScript);
        }
        config.globalScript = util_1.normalizePath(config.globalScript);
    }
    if (Array.isArray(config.globalStyle)) {
        // DEPRECATED 2018-05-31
        config.logger.warn("\"globalStyle\" config no longer accepts an array. Please update to only use a single entry point for a global style css file.");
        if (config.globalStyle.length > 0) {
            config.globalStyle = config.globalStyle[0];
        }
    }
    if (typeof config.globalStyle === 'string') {
        if (!path.isAbsolute(config.globalStyle)) {
            config.globalStyle = path.join(config.rootDir, config.globalStyle);
        }
        config.globalStyle = util_1.normalizePath(config.globalStyle);
    }
    config_utils_1.setStringConfig(config, 'srcDir', DEFAULT_SRC_DIR);
    if (!path.isAbsolute(config.srcDir)) {
        config.srcDir = path.join(config.rootDir, config.srcDir);
    }
    config.srcDir = util_1.normalizePath(config.srcDir);
    config_utils_1.setStringConfig(config, 'cacheDir', DEFAULT_CACHE_DIR);
    if (!path.isAbsolute(config.cacheDir)) {
        config.cacheDir = path.join(config.rootDir, config.cacheDir);
    }
    config.cacheDir = util_1.normalizePath(config.cacheDir);
    if (typeof config.tsconfig === 'string') {
        if (!path.isAbsolute(config.tsconfig)) {
            config.tsconfig = path.join(config.rootDir, config.tsconfig);
        }
    }
    else {
        config.tsconfig = typescript_1.default.findConfigFile(config.rootDir, typescript_1.default.sys.fileExists);
    }
    if (typeof config.tsconfig === 'string') {
        config.tsconfig = util_1.normalizePath(config.tsconfig);
    }
    config_utils_1.setStringConfig(config, 'srcIndexHtml', util_1.normalizePath(path.join(config.srcDir, DEFAULT_INDEX_HTML)));
    if (!path.isAbsolute(config.srcIndexHtml)) {
        config.srcIndexHtml = path.join(config.rootDir, config.srcIndexHtml);
    }
    config.srcIndexHtml = util_1.normalizePath(config.srcIndexHtml);
    if (config.writeLog) {
        config_utils_1.setStringConfig(config, 'buildLogFilePath', DEFAULT_BUILD_LOG_FILE_NAME);
        if (!path.isAbsolute(config.buildLogFilePath)) {
            config.buildLogFilePath = path.join(config.rootDir, config.buildLogFilePath);
        }
        config.buildLogFilePath = util_1.normalizePath(config.buildLogFilePath);
        config.logger.buildLogFilePath = config.buildLogFilePath;
    }
}
exports.validatePaths = validatePaths;
var DEFAULT_BUILD_LOG_FILE_NAME = 'stencil-build.log';
var DEFAULT_CACHE_DIR = '.stencil';
var DEFAULT_INDEX_HTML = 'index.html';
var DEFAULT_SRC_DIR = 'src';
