"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setBooleanConfig(config, configName, flagName, defaultValue) {
    if (flagName) {
        if (typeof config.flags[flagName] === 'boolean') {
            config[configName] = config.flags[flagName];
        }
    }
    var userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = !!config[userConfigName]();
    }
    if (typeof config[userConfigName] === 'boolean') {
        config[configName] = config[userConfigName];
    }
    else {
        config[configName] = defaultValue;
    }
}
exports.setBooleanConfig = setBooleanConfig;
function setNumberConfig(config, configName, _flagName, defaultValue) {
    var userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = config[userConfigName]();
    }
    if (typeof config[userConfigName] === 'number') {
        config[configName] = config[userConfigName];
    }
    else {
        config[configName] = defaultValue;
    }
}
exports.setNumberConfig = setNumberConfig;
function setStringConfig(config, configName, defaultValue) {
    var userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = config[userConfigName]();
    }
    if (typeof config[userConfigName] === 'string') {
        config[configName] = config[userConfigName];
    }
    else {
        config[configName] = defaultValue;
    }
}
exports.setStringConfig = setStringConfig;
function setArrayConfig(config, configName, defaultValue) {
    var userConfigName = getUserConfigName(config, configName);
    if (typeof config[userConfigName] === 'function') {
        config[userConfigName] = config[userConfigName]();
    }
    if (!Array.isArray(config[configName])) {
        if (Array.isArray(defaultValue)) {
            config[configName] = defaultValue.slice();
        }
        else {
            config[configName] = [];
        }
    }
}
exports.setArrayConfig = setArrayConfig;
function getUserConfigName(config, correctConfigName) {
    var userConfigNames = Object.keys(config);
    for (var _i = 0, userConfigNames_1 = userConfigNames; _i < userConfigNames_1.length; _i++) {
        var userConfigName = userConfigNames_1[_i];
        if (userConfigName.toLowerCase() === correctConfigName.toLowerCase()) {
            if (userConfigName !== correctConfigName) {
                config.logger.warn("config \"" + userConfigName + "\" should be \"" + correctConfigName + "\"");
                return userConfigName;
            }
            break;
        }
    }
    return correctConfigName;
}
