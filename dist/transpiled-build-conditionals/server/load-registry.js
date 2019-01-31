"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_registry_1 = require("../compiler/app/app-registry");
function loadComponentRegistry(config, compilerCtx, outputTarget) {
    var appRegistry = app_registry_1.getAppRegistry(config, compilerCtx, outputTarget);
    var cmpRegistry = {};
    var tagNames = Object.keys(appRegistry.components);
    tagNames.forEach(function (tagName) {
        var reg = appRegistry.components[tagName];
        cmpRegistry[tagName] = {
            tagNameMeta: tagName,
            bundleIds: reg.bundleIds
        };
        if (reg.encapsulation === 'shadow') {
            cmpRegistry[tagName].encapsulationMeta = 1 /* ShadowDom */;
        }
        else if (reg.encapsulation === 'scoped') {
            cmpRegistry[tagName].encapsulationMeta = 2 /* ScopedCss */;
        }
    });
    return cmpRegistry;
}
exports.loadComponentRegistry = loadComponentRegistry;
