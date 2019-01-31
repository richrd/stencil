"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var config_utils_1 = require("./config-utils");
var validate_prerender_1 = require("./validate-prerender");
function validateOutputTargetWww(config) {
    if (!Array.isArray(config.outputTargets)) {
        config.outputTargets = [
            { type: 'www' }
        ];
    }
    var wwwOutputTargets = config.outputTargets.filter(function (o) { return o.type === 'www'; });
    wwwOutputTargets.forEach(function (outputTarget) {
        validateOutputTarget(config, outputTarget);
    });
}
exports.validateOutputTargetWww = validateOutputTargetWww;
function validateOutputTarget(config, outputTarget) {
    var path = config.sys.path;
    config_utils_1.setStringConfig(outputTarget, 'dir', DEFAULT_DIR);
    if (!path.isAbsolute(outputTarget.dir)) {
        outputTarget.dir = util_1.pathJoin(config, config.rootDir, outputTarget.dir);
    }
    config_utils_1.setStringConfig(outputTarget, 'buildDir', DEFAULT_BUILD_DIR);
    if (!path.isAbsolute(outputTarget.buildDir)) {
        outputTarget.buildDir = util_1.pathJoin(config, outputTarget.dir, outputTarget.buildDir);
    }
    config_utils_1.setStringConfig(outputTarget, 'indexHtml', DEFAULT_INDEX_HTML);
    if (!path.isAbsolute(outputTarget.indexHtml)) {
        outputTarget.indexHtml = util_1.pathJoin(config, outputTarget.dir, outputTarget.indexHtml);
    }
    config_utils_1.setBooleanConfig(outputTarget, 'empty', null, DEFAULT_EMPTY_DIR);
    validate_prerender_1.validatePrerender(config, outputTarget);
    if (typeof outputTarget.appBuild !== 'boolean') {
        outputTarget.appBuild = true;
    }
}
var DEFAULT_DIR = 'www';
var DEFAULT_INDEX_HTML = 'index.html';
var DEFAULT_BUILD_DIR = 'build';
var DEFAULT_EMPTY_DIR = true;
