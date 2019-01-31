"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prerender_utils_1 = require("../prerender/prerender-utils");
function getFilePathFromUrl(config, outputTarget, windowLocationHref, url) {
    if (typeof url !== 'string' || url.trim() === '') {
        return null;
    }
    var location = prerender_utils_1.normalizePrerenderLocation(config, outputTarget, windowLocationHref, url);
    if (!location) {
        return null;
    }
    return config.sys.path.join(outputTarget.dir, location.path);
}
exports.getFilePathFromUrl = getFilePathFromUrl;
function createHashedFileName(fileName, hash) {
    var parts = fileName.split('.');
    parts.splice(parts.length - 1, 0, hash);
    return parts.join('.');
}
exports.createHashedFileName = createHashedFileName;
