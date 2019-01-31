"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_file_naming_1 = require("../app/app-file-naming");
var host_config_1 = require("../prerender/host-config");
function validateServiceWorker(config, outputTarget) {
    if (config.devMode && !config.flags.serviceWorker) {
        outputTarget.serviceWorker = null;
        return;
    }
    if (outputTarget.serviceWorker === false || outputTarget.serviceWorker === null) {
        outputTarget.serviceWorker = null;
        return;
    }
    if (!outputTarget.serviceWorker && outputTarget.type !== 'www') {
        outputTarget.serviceWorker = null;
        return;
    }
    if (outputTarget.serviceWorker === true) {
        outputTarget.serviceWorker = {};
    }
    else if (!outputTarget.serviceWorker && config.devMode) {
        outputTarget.serviceWorker = null;
        return;
    }
    if (typeof outputTarget.serviceWorker !== 'object') {
        // what was passed in could have been a boolean
        // in that case let's just turn it into an empty obj so Object.assign doesn't crash
        outputTarget.serviceWorker = {};
    }
    if (!Array.isArray(outputTarget.serviceWorker.globPatterns)) {
        if (typeof outputTarget.serviceWorker.globPatterns === 'string') {
            outputTarget.serviceWorker.globPatterns = [outputTarget.serviceWorker.globPatterns];
        }
        else if (typeof outputTarget.serviceWorker.globPatterns !== 'string') {
            outputTarget.serviceWorker.globPatterns = [DEFAULT_GLOB_PATTERNS];
        }
    }
    if (typeof outputTarget.serviceWorker.globDirectory !== 'string') {
        outputTarget.serviceWorker.globDirectory = outputTarget.dir;
    }
    if (typeof outputTarget.serviceWorker.globIgnores === 'string') {
        outputTarget.serviceWorker.globIgnores = [outputTarget.serviceWorker.globIgnores];
    }
    outputTarget.serviceWorker.globIgnores = outputTarget.serviceWorker.globIgnores || [];
    addGlobIgnores(config, outputTarget.serviceWorker.globIgnores);
    if (!outputTarget.serviceWorker.swDest) {
        outputTarget.serviceWorker.swDest = config.sys.path.join(outputTarget.dir, DEFAULT_FILENAME);
    }
    if (!config.sys.path.isAbsolute(outputTarget.serviceWorker.swDest)) {
        outputTarget.serviceWorker.swDest = config.sys.path.join(outputTarget.dir, outputTarget.serviceWorker.swDest);
    }
}
exports.validateServiceWorker = validateServiceWorker;
function addGlobIgnores(config, globIgnores) {
    var appRegistry = "**/" + app_file_naming_1.getRegistryFileName(config);
    globIgnores.push(appRegistry);
    var appGlobal = "**/" + app_file_naming_1.getGlobalFileName(config);
    globIgnores.push(appGlobal);
    var hostConfigJson = "**/" + host_config_1.HOST_CONFIG_FILENAME;
    globIgnores.push(hostConfigJson);
}
var DEFAULT_GLOB_PATTERNS = '**/*.{js,css,json,html}';
var DEFAULT_FILENAME = 'sw.js';
