"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_utils_1 = require("./config-utils");
function validateAssetVerioning(config) {
    if (!config.assetVersioning) {
        config.assetVersioning = null;
        return;
    }
    if ((config.assetVersioning) === true) {
        config.assetVersioning = {};
    }
    var hashLength = config.hashedFileNameLength > 3 ? config.hashedFileNameLength : DEFAULTS.hashLength;
    config_utils_1.setArrayConfig(config.assetVersioning, 'cssProperties', DEFAULTS.cssProperties);
    config_utils_1.setNumberConfig(config.assetVersioning, 'hashLength', null, hashLength);
    config_utils_1.setBooleanConfig(config.assetVersioning, 'queryMode', null, DEFAULTS.queryMode);
    config_utils_1.setStringConfig(config.assetVersioning, 'prefix', DEFAULTS.separator);
    config_utils_1.setStringConfig(config.assetVersioning, 'separator', DEFAULTS.separator);
    config_utils_1.setBooleanConfig(config.assetVersioning, 'versionHtml', null, DEFAULTS.versionHtml);
    config_utils_1.setBooleanConfig(config.assetVersioning, 'versionManifest', null, DEFAULTS.versionManifest);
    config_utils_1.setBooleanConfig(config.assetVersioning, 'versionCssProperties', null, DEFAULTS.versionCssProperties);
}
exports.validateAssetVerioning = validateAssetVerioning;
var DEFAULTS = {
    cssProperties: ['background', 'background-url', 'url'],
    hashLength: 8,
    queryMode: false,
    pattern: '**/*.{css,js,png,jpg,jpeg,gif,svg,json,woff,woff2,ttf,eot}',
    prefix: '',
    separator: '.',
    versionHtml: true,
    versionManifest: true,
    versionCssProperties: true,
};
