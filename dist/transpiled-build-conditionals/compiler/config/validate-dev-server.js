"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var config_utils_1 = require("./config-utils");
function validateDevServer(config) {
    if (config.devServer === false || config.devServer === null) {
        return config.devServer = null;
    }
    config.devServer = config.devServer || {};
    if (typeof config.flags.address === 'string') {
        config.devServer.address = config.flags.address;
    }
    else {
        config_utils_1.setStringConfig(config.devServer, 'address', '0.0.0.0');
    }
    if (typeof config.flags.port === 'number') {
        config.devServer.port = config.flags.port;
    }
    else {
        config_utils_1.setNumberConfig(config.devServer, 'port', null, 3333);
    }
    config_utils_1.setBooleanConfig(config.devServer, 'gzip', null, true);
    config_utils_1.setBooleanConfig(config.devServer, 'hotReplacement', null, true);
    config_utils_1.setBooleanConfig(config.devServer, 'openBrowser', null, true);
    validateProtocol(config.devServer);
    if (config.devServer.historyApiFallback !== null && config.devServer.historyApiFallback !== false) {
        config.devServer.historyApiFallback = config.devServer.historyApiFallback || {};
        if (typeof config.devServer.historyApiFallback.index !== 'string') {
            config.devServer.historyApiFallback.index = 'index.html';
        }
        if (typeof config.devServer.historyApiFallback.disableDotRule !== 'boolean') {
            config.devServer.historyApiFallback.disableDotRule = false;
        }
    }
    if (config.flags && config.flags.open === false) {
        config.devServer.openBrowser = false;
    }
    var serveDir = null;
    var baseUrl = null;
    var wwwOutputTarget = config.outputTargets.find(function (o) { return o.type === 'www'; });
    if (wwwOutputTarget) {
        serveDir = wwwOutputTarget.dir;
        baseUrl = wwwOutputTarget.baseUrl;
        config.logger.debug("dev server www root: " + serveDir + ", base url: " + baseUrl);
    }
    else {
        serveDir = config.rootDir;
        if (config.flags && config.flags.serve) {
            config.logger.debug("dev server missing www output target, serving root directory: " + serveDir);
        }
    }
    if (typeof baseUrl !== 'string') {
        baseUrl = "/";
    }
    baseUrl = util_1.normalizePath(baseUrl);
    if (!baseUrl.startsWith('/')) {
        baseUrl = '/' + baseUrl;
    }
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }
    config_utils_1.setStringConfig(config.devServer, 'root', serveDir);
    config_utils_1.setStringConfig(config.devServer, 'baseUrl', baseUrl);
    if (!config.sys.path.isAbsolute(config.devServer.root)) {
        config.devServer.root = util_1.pathJoin(config, config.rootDir, config.devServer.root);
    }
    if (config.devServer.excludeHmr) {
        if (!Array.isArray(config.devServer.excludeHmr)) {
            config.logger.error("dev server excludeHmr must be an array of glob strings");
        }
    }
    else {
        config.devServer.excludeHmr = [];
    }
    return config.devServer;
}
exports.validateDevServer = validateDevServer;
function validateProtocol(devServer) {
    if (typeof devServer.protocol === 'string') {
        var protocol = devServer.protocol.trim().toLowerCase();
        protocol = protocol.replace(':', '').replace('/', '');
        devServer.protocol = protocol;
    }
    if (devServer.protocol !== 'http' && devServer.protocol !== 'https') {
        devServer.protocol = 'http';
    }
}
