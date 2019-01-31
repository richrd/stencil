"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_utils_1 = require("./config-utils");
var util_1 = require("../util");
function validatePrerender(config, outputTarget) {
    var defaults;
    if (config.flags.prerender) {
        // forcing a prerender build
        defaults = FULL_PRERENDER_DEFAULTS;
    }
    else if (config.flags.ssr) {
        // forcing a ssr build
        defaults = SSR_DEFAULTS;
    }
    else {
        // not forcing a prerender build
        if (config.devMode) {
            // not forcing a prerender build
            // but we're in dev mode
            defaults = DEV_MODE_DEFAULTS;
        }
        else {
            // not forcing a prerender build
            // but we're in prod mode
            defaults = PROD_NON_HYDRATE_DEFAULTS;
        }
    }
    config_utils_1.setStringConfig(outputTarget, 'baseUrl', defaults.baseUrl);
    config_utils_1.setBooleanConfig(outputTarget, 'canonicalLink', null, defaults.canonicalLink);
    config_utils_1.setBooleanConfig(outputTarget, 'collapseWhitespace', null, defaults.collapseWhitespace);
    config_utils_1.setBooleanConfig(outputTarget, 'hydrateComponents', null, defaults.hydrateComponents);
    config_utils_1.setBooleanConfig(outputTarget, 'inlineStyles', null, defaults.inlineStyles);
    config_utils_1.setBooleanConfig(outputTarget, 'inlineLoaderScript', null, defaults.inlineLoaderScript);
    config_utils_1.setNumberConfig(outputTarget, 'inlineAssetsMaxSize', null, defaults.inlineAssetsMaxSize);
    config_utils_1.setBooleanConfig(outputTarget, 'prerenderUrlCrawl', null, defaults.prerenderUrlCrawl);
    config_utils_1.setArrayConfig(outputTarget, 'prerenderLocations', defaults.prerenderLocations);
    config_utils_1.setBooleanConfig(outputTarget, 'prerenderPathHash', null, defaults.prerenderPathHash);
    config_utils_1.setBooleanConfig(outputTarget, 'prerenderPathQuery', null, defaults.prerenderPathQuery);
    config_utils_1.setNumberConfig(outputTarget, 'prerenderMaxConcurrent', null, defaults.prerenderMaxConcurrent);
    config_utils_1.setBooleanConfig(outputTarget, 'removeUnusedStyles', null, defaults.removeUnusedStyles);
    defaults.baseUrl = util_1.normalizePath(defaults.baseUrl);
    if (!outputTarget.baseUrl.startsWith('/')) {
        throw new Error("baseUrl \"" + outputTarget.baseUrl + "\" must start with a slash \"/\". This represents an absolute path to the root of the domain.");
    }
    if (!outputTarget.baseUrl.endsWith('/')) {
        outputTarget.baseUrl += '/';
    }
    if (config.flags.prerender && outputTarget.prerenderLocations.length === 0) {
        outputTarget.prerenderLocations.push({
            path: outputTarget.baseUrl
        });
    }
    if (outputTarget.hydrateComponents) {
        config.buildEs5 = true;
    }
}
exports.validatePrerender = validatePrerender;
var FULL_PRERENDER_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: true,
    collapseWhitespace: true,
    hydrateComponents: true,
    inlineStyles: true,
    inlineLoaderScript: true,
    inlineAssetsMaxSize: 5000,
    prerenderUrlCrawl: true,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 4,
    removeUnusedStyles: true
};
var SSR_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: true,
    collapseWhitespace: true,
    hydrateComponents: true,
    inlineStyles: true,
    inlineLoaderScript: true,
    inlineAssetsMaxSize: 0,
    prerenderUrlCrawl: false,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 0,
    removeUnusedStyles: false
};
var PROD_NON_HYDRATE_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: false,
    collapseWhitespace: true,
    hydrateComponents: false,
    inlineStyles: false,
    inlineLoaderScript: true,
    inlineAssetsMaxSize: 0,
    prerenderUrlCrawl: false,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 0,
    removeUnusedStyles: false
};
var DEV_MODE_DEFAULTS = {
    type: 'www',
    baseUrl: '/',
    canonicalLink: false,
    collapseWhitespace: false,
    hydrateComponents: false,
    inlineStyles: false,
    inlineLoaderScript: false,
    inlineAssetsMaxSize: 0,
    prerenderUrlCrawl: false,
    prerenderPathHash: false,
    prerenderPathQuery: false,
    prerenderMaxConcurrent: 0,
    removeUnusedStyles: false
};
