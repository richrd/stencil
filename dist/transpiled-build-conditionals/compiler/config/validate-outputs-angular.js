"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
function validateOutputTargetAngular(config) {
    var path = config.sys.path;
    var distOutputTargets = config.outputTargets.filter(function (o) { return o.type === 'angular'; });
    distOutputTargets.forEach(function (outputTarget) {
        outputTarget.excludeComponents = outputTarget.excludeComponents || [];
        if (!path.isAbsolute(outputTarget.directivesProxyFile)) {
            outputTarget.directivesProxyFile = util_1.normalizePath(path.join(config.rootDir, outputTarget.directivesProxyFile));
        }
        if (outputTarget.directivesArrayFile && !path.isAbsolute(outputTarget.directivesArrayFile)) {
            outputTarget.directivesArrayFile = util_1.normalizePath(path.join(config.rootDir, outputTarget.directivesArrayFile));
        }
        if (outputTarget.directivesUtilsFile && !path.isAbsolute(outputTarget.directivesUtilsFile)) {
            outputTarget.directivesUtilsFile = util_1.normalizePath(path.join(config.rootDir, outputTarget.directivesUtilsFile));
        }
    });
}
exports.validateOutputTargetAngular = validateOutputTargetAngular;
