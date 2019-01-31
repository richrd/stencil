"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DEPRECATED "docs"
 * since 0.16.0, 2018-11-16
 */
function _deprecatedDocsConfig(config) {
    if (!config.outputTargets) {
        return;
    }
    var jsonFile = null;
    config.outputTargets = config.outputTargets.filter(function (outputTarget) {
        if (outputTarget.type === 'docs') {
            if (typeof outputTarget.jsonFile === 'string') {
                jsonFile = outputTarget.jsonFile;
                delete outputTarget.jsonFile;
                config.logger.warn("Stencil config docs outputTarget using the \"jsonFile\" property has been refactored as a new outputTarget type \"docs-json\". Please see the stencil docs for more information.");
                return false;
            }
            if (typeof outputTarget.readmeDir === 'string') {
                outputTarget.dir = outputTarget.readmeDir;
                delete outputTarget.readmeDir;
                config.logger.warn("Stencil config docs outputTarget using the \"readmeDir\" property has been rename to \"dir\". Please see the stencil docs for more information.");
            }
        }
        return true;
    });
    if (typeof jsonFile === 'string' && jsonFile) {
        config.outputTargets.push({
            type: 'docs-json',
            file: jsonFile
        });
    }
}
exports._deprecatedDocsConfig = _deprecatedDocsConfig;
