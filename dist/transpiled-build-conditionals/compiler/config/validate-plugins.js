"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validatePlugins(config) {
    config.plugins = (config.plugins || []).filter(function (p) { return !!p; });
}
exports.validatePlugins = validatePlugins;
