"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
function validateResourcesUrl(outputTarget) {
    if (typeof outputTarget.resourcesUrl === 'string') {
        outputTarget.resourcesUrl = util_1.normalizePath(outputTarget.resourcesUrl.trim());
        if (outputTarget.resourcesUrl.charAt(outputTarget.resourcesUrl.length - 1) !== '/') {
            // ensure there's a trailing /
            outputTarget.resourcesUrl += '/';
        }
    }
}
exports.validateResourcesUrl = validateResourcesUrl;
