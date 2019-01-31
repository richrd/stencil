"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_utils_1 = require("./config-utils");
var validate_asset_versioning_1 = require("./validate-asset-versioning");
var validate_copy_1 = require("./validate-copy");
var validate_dev_server_1 = require("./validate-dev-server");
var validate_namespace_1 = require("./validate-namespace");
var validate_outputs_1 = require("./validate-outputs");
var validate_paths_1 = require("./validate-paths");
var validate_plugins_1 = require("./validate-plugins");
var validate_rollup_config_1 = require("./validate-rollup-config");
var validate_testing_1 = require("./validate-testing");
var validate_workers_1 = require("./validate-workers");
var _deprecated_validate_config_collection_1 = require("./_deprecated-validate-config-collection");
function validateConfig(config, setEnvVariables) {
    if (!config) {
        throw new Error("invalid build config");
    }
    if (config._isValidated) {
        // don't bother if we've already validated this config
        return config;
    }
    if (!config.logger) {
        throw new Error("config.logger required");
    }
    if (!config.rootDir) {
        throw new Error('config.rootDir required');
    }
    if (!config.sys) {
        throw new Error('config.sys required');
    }
    config.flags = config.flags || {};
    if (config.flags.debug) {
        config.logLevel = 'debug';
    }
    else if (config.flags.logLevel) {
        config.logLevel = config.flags.logLevel;
    }
    else if (typeof config.logLevel !== 'string') {
        config.logLevel = 'info';
    }
    config.logger.level = config.logLevel;
    config_utils_1.setBooleanConfig(config, 'writeLog', 'log', false);
    config_utils_1.setBooleanConfig(config, 'buildAppCore', null, true);
    // default devMode false
    if (config.flags.prod) {
        config.devMode = false;
    }
    else if (config.flags.dev) {
        config.devMode = true;
    }
    else {
        config_utils_1.setBooleanConfig(config, 'devMode', null, DEFAULT_DEV_MODE);
    }
    // get a good namespace
    validate_namespace_1.validateNamespace(config);
    // figure out all of the config paths and absolute paths
    validate_paths_1.validatePaths(config);
    // setup the outputTargets
    validate_outputs_1.validateOutputTargets(config);
    // validate how many workers we can use
    validate_workers_1.validateWorkers(config);
    // default devInspector to whatever devMode is
    config_utils_1.setBooleanConfig(config, 'devInspector', null, config.devMode);
    // default watch false
    config_utils_1.setBooleanConfig(config, 'watch', 'watch', false);
    config_utils_1.setBooleanConfig(config, 'minifyCss', null, !config.devMode);
    config_utils_1.setBooleanConfig(config, 'minifyJs', null, !config.devMode);
    config_utils_1.setBooleanConfig(config, 'buildEs5', 'es5', !config.devMode);
    config_utils_1.setBooleanConfig(config, 'buildEsm', 'esm', config.buildEs5);
    config_utils_1.setBooleanConfig(config, 'buildScoped', null, config.buildEs5);
    if (typeof config.validateTypes !== 'boolean') {
        config.validateTypes = true;
    }
    config_utils_1.setBooleanConfig(config, 'hashFileNames', null, !(config.devMode || config.watch));
    config_utils_1.setNumberConfig(config, 'hashedFileNameLength', null, DEFAULT_HASHED_FILENAME_LENTH);
    if (config.hashFileNames) {
        if (config.hashedFileNameLength < MIN_HASHED_FILENAME_LENTH) {
            throw new Error("config.hashedFileNameLength must be at least " + MIN_HASHED_FILENAME_LENTH + " characters");
        }
        if (config.hashedFileNameLength > MAX_HASHED_FILENAME_LENTH) {
            throw new Error("config.hashedFileNameLength cannot be more than " + MAX_HASHED_FILENAME_LENTH + " characters");
        }
    }
    validate_copy_1.validateCopy(config);
    validate_plugins_1.validatePlugins(config);
    validate_asset_versioning_1.validateAssetVerioning(config);
    validate_dev_server_1.validateDevServer(config);
    if (!config.watchIgnoredRegex) {
        config.watchIgnoredRegex = DEFAULT_WATCH_IGNORED_REGEX;
    }
    config_utils_1.setStringConfig(config, 'hydratedCssClass', DEFAULT_HYDRATED_CSS_CLASS);
    config_utils_1.setBooleanConfig(config, 'generateDocs', 'docs', false);
    config_utils_1.setBooleanConfig(config, 'enableCache', 'cache', true);
    if (!Array.isArray(config.includeSrc)) {
        config.includeSrc = DEFAULT_INCLUDES.map(function (include) {
            return config.sys.path.join(config.srcDir, include);
        });
    }
    if (!Array.isArray(config.excludeSrc)) {
        config.excludeSrc = DEFAULT_EXCLUDES.slice();
    }
    /**
     * DEPRECATED "config.collections" since 0.6.0, 2018-02-13
     */
    _deprecated_validate_config_collection_1._deprecatedValidateConfigCollections(config);
    config_utils_1.setArrayConfig(config, 'plugins');
    config_utils_1.setArrayConfig(config, 'bundles');
    // set to true so it doesn't bother going through all this again on rebuilds
    config._isValidated = true;
    if (setEnvVariables !== false) {
        setProcessEnvironment(config);
    }
    validate_rollup_config_1.validateRollupConfig(config);
    validate_testing_1.validateTesting(config);
    return config;
}
exports.validateConfig = validateConfig;
function setProcessEnvironment(config) {
    process.env.NODE_ENV = config.devMode ? 'development' : 'production';
}
exports.setProcessEnvironment = setProcessEnvironment;
var DEFAULT_DEV_MODE = false;
var DEFAULT_HASHED_FILENAME_LENTH = 8;
var MIN_HASHED_FILENAME_LENTH = 4;
var MAX_HASHED_FILENAME_LENTH = 32;
var DEFAULT_INCLUDES = ['**/*.ts', '**/*.tsx'];
var DEFAULT_EXCLUDES = ['**/*.+(spec|e2e).*'];
var DEFAULT_WATCH_IGNORED_REGEX = /(?:^|[\\\/])(\.(?!\.)[^\\\/]+)$/i;
var DEFAULT_HYDRATED_CSS_CLASS = 'hydrated';
