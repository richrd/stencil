"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
function validateStats(config) {
    if (config.flags.stats) {
        var hasOutputTarget = config.outputTargets.some(function (o) { return o.type === 'stats'; });
        if (!hasOutputTarget) {
            config.outputTargets.push({
                type: 'stats'
            });
        }
    }
    var outputTargets = config.outputTargets.filter(function (o) { return o.type === 'stats'; });
    outputTargets.forEach(function (outputTarget) {
        validateStatsOutputTarget(config, outputTarget);
    });
}
exports.validateStats = validateStats;
function validateStatsOutputTarget(config, outputTarget) {
    if (!outputTarget.file) {
        outputTarget.file = DEFAULT_JSON_FILE_NAME;
    }
    if (!config.sys.path.isAbsolute(outputTarget.file)) {
        outputTarget.file = util_1.pathJoin(config, config.rootDir, outputTarget.file);
    }
}
var DEFAULT_JSON_FILE_NAME = 'stencil-stats.json';
