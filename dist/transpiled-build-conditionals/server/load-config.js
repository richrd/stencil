"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var load_config_1 = require("../compiler/config/load-config");
function loadConfig(configObj) {
    var path = require('path');
    var nodeSys = require(path.join(__dirname, '..', 'sys', 'node', 'index.js'));
    var sys = new nodeSys.NodeSystem();
    var config = load_config_1.loadConfig(sys, configObj);
    config.logger = new nodeSys.NodeLogger();
    return config;
}
exports.loadConfig = loadConfig;
