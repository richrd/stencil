"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var _deprecated_validate_docs_1 = require("./_deprecated-validate-docs");
function validateDocs(config) {
    _deprecated_validate_docs_1._deprecatedDocsConfig(config);
    config.outputTargets = config.outputTargets || [];
    var buildDocs = !config.devMode;
    // json docs flag
    if (typeof config.flags.docsJson === 'string') {
        buildDocs = true;
        config.outputTargets.push({
            type: 'docs-json',
            file: config.flags.docsJson
        });
    }
    var jsonDocsOutputs = config.outputTargets.filter(function (o) { return o.type === 'docs-json'; });
    jsonDocsOutputs.forEach(function (jsonDocsOutput) {
        validateJsonDocsOutputTarget(config, jsonDocsOutput);
    });
    // readme docs flag
    if (config.flags.docs) {
        buildDocs = true;
        if (!config.outputTargets.some(function (o) { return o.type === 'docs'; })) {
            // didn't provide a docs config, so let's add one
            config.outputTargets.push({ type: 'docs' });
        }
    }
    var readmeDocsOutputs = config.outputTargets.filter(function (o) { return o.type === 'docs'; });
    readmeDocsOutputs.forEach(function (readmeDocsOutput) {
        validateReadmeOutputTarget(config, readmeDocsOutput);
    });
    // custom docs
    var customDocsOutputs = config.outputTargets.filter(function (o) { return o.type === 'docs-custom'; });
    customDocsOutputs.forEach(function (jsonDocsOutput) {
        validateCustomDocsOutputTarget(jsonDocsOutput);
    });
    config.buildDocs = buildDocs;
}
exports.validateDocs = validateDocs;
function validateReadmeOutputTarget(config, outputTarget) {
    if (typeof outputTarget.dir !== 'string') {
        outputTarget.dir = config.srcDir;
    }
    if (!config.sys.path.isAbsolute(outputTarget.dir)) {
        outputTarget.dir = util_1.pathJoin(config, config.rootDir, outputTarget.dir);
    }
    outputTarget.strict = !!outputTarget.strict;
}
function validateJsonDocsOutputTarget(config, outputTarget) {
    if (typeof outputTarget.file !== 'string') {
        throw new Error("docs-json outputTarget missing the \"file\" option");
    }
    outputTarget.file = util_1.pathJoin(config, config.rootDir, outputTarget.file);
    outputTarget.strict = !!outputTarget.strict;
}
function validateCustomDocsOutputTarget(outputTarget) {
    if (typeof outputTarget.generator !== 'function') {
        throw new Error("docs-custom outputTarget missing the \"generator\" function");
    }
    outputTarget.strict = !!outputTarget.strict;
}
