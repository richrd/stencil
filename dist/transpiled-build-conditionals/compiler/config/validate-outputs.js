"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validate_docs_1 = require("./validate-docs");
var validate_outputs_angular_1 = require("./validate-outputs-angular");
var validate_outputs_dist_1 = require("./validate-outputs-dist");
var validate_outputs_www_1 = require("./validate-outputs-www");
var validate_resources_url_1 = require("./validate-resources-url");
var validate_service_worker_1 = require("./validate-service-worker");
var validate_stats_1 = require("./validate-stats");
var _deprecated_validate_multiple_targets_1 = require("./_deprecated-validate-multiple-targets");
function validateOutputTargets(config) {
    // setup outputTargets from deprecated config properties
    _deprecated_validate_multiple_targets_1._deprecatedToMultipleTarget(config);
    if (Array.isArray(config.outputTargets)) {
        config.outputTargets.forEach(function (outputTarget) {
            if (typeof outputTarget.type !== 'string') {
                outputTarget.type = 'www';
            }
            outputTarget.type = outputTarget.type.trim().toLowerCase();
            if (!VALID_TYPES.includes(outputTarget.type)) {
                throw new Error("invalid outputTarget type \"" + outputTarget.type + "\". Valid target types: " + VALID_TYPES.join(', '));
            }
        });
    }
    validate_outputs_www_1.validateOutputTargetWww(config);
    validate_outputs_dist_1.validateOutputTargetDist(config);
    validate_outputs_angular_1.validateOutputTargetAngular(config);
    validate_docs_1.validateDocs(config);
    validate_stats_1.validateStats(config);
    if (!config.outputTargets || config.outputTargets.length === 0) {
        throw new Error("outputTarget required");
    }
    config.outputTargets.forEach(function (outputTarget) {
        validate_resources_url_1.validateResourcesUrl(outputTarget);
        validate_service_worker_1.validateServiceWorker(config, outputTarget);
    });
}
exports.validateOutputTargets = validateOutputTargets;
var VALID_TYPES = [
    'angular',
    'dist',
    'docs',
    'docs-json',
    'docs-custom',
    'stats',
    'www'
];
