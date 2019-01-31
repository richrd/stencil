"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateCopy(config) {
    if (config.copy === null || config.copy === false) {
        // manually forcing to skip the copy task
        config.copy = null;
        return;
    }
    if (!Array.isArray(config.copy)) {
        config.copy = [];
    }
    if (!config.copy.some(function (c) { return c.src === DEFAULT_ASSETS.src; })) {
        config.copy.push(DEFAULT_ASSETS);
    }
    if (!config.copy.some(function (c) { return c.src === DEFAULT_MANIFEST.src; })) {
        config.copy.push(DEFAULT_MANIFEST);
    }
}
exports.validateCopy = validateCopy;
var DEFAULT_ASSETS = { src: 'assets', warn: false };
var DEFAULT_MANIFEST = { src: 'manifest.json', warn: false };
