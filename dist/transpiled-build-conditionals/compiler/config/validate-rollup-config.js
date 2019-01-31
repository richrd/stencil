"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../../util/helpers");
function validateRollupConfig(config) {
    var cleanRollupConfig = getCleanRollupConfig(config.rollupConfig);
    config.rollupConfig = cleanRollupConfig;
}
exports.validateRollupConfig = validateRollupConfig;
function getCleanRollupConfig(rollupConfig) {
    var cleanRollupConfig = DEFAULT_ROLLUP_CONFIG;
    if (!rollupConfig || !helpers_1.isObject(rollupConfig)) {
        return cleanRollupConfig;
    }
    if (rollupConfig.inputOptions && helpers_1.isObject(rollupConfig.inputOptions)) {
        cleanRollupConfig = __assign({}, cleanRollupConfig, { inputOptions: helpers_1.pluck(rollupConfig.inputOptions, ['context', 'moduleContext']) });
    }
    if (rollupConfig.outputOptions && helpers_1.isObject(rollupConfig.outputOptions)) {
        cleanRollupConfig = __assign({}, cleanRollupConfig, { outputOptions: helpers_1.pluck(rollupConfig.outputOptions, ['globals']) });
    }
    return cleanRollupConfig;
}
var DEFAULT_ROLLUP_CONFIG = {
    inputOptions: {},
    outputOptions: {}
};
