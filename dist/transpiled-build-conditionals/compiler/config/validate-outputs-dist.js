"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
function validateOutputTargetDist(config) {
    var path = config.sys.path;
    var distOutputTargets = config.outputTargets.filter(function (o) { return o.type === 'dist'; });
    distOutputTargets.forEach(function (outputTarget) {
        if (!outputTarget.dir) {
            outputTarget.dir = DEFAULT_DIR;
        }
        if (!path.isAbsolute(outputTarget.dir)) {
            outputTarget.dir = util_1.normalizePath(path.join(config.rootDir, outputTarget.dir));
        }
        if (!outputTarget.buildDir) {
            outputTarget.buildDir = DEFAULT_BUILD_DIR;
        }
        if (!path.isAbsolute(outputTarget.buildDir)) {
            outputTarget.buildDir = util_1.normalizePath(path.join(outputTarget.dir, outputTarget.buildDir));
        }
        if (!outputTarget.collectionDir) {
            outputTarget.collectionDir = DEFAULT_COLLECTION_DIR;
        }
        if (!path.isAbsolute(outputTarget.collectionDir)) {
            outputTarget.collectionDir = util_1.normalizePath(path.join(outputTarget.dir, outputTarget.collectionDir));
        }
        if (!outputTarget.esmLoaderPath) {
            outputTarget.esmLoaderPath = DEFAULT_ESM_LOADER_DIR;
        }
        if (!outputTarget.typesDir) {
            outputTarget.typesDir = DEFAULT_TYPES_DIR;
        }
        if (!path.isAbsolute(outputTarget.typesDir)) {
            outputTarget.typesDir = util_1.normalizePath(path.join(outputTarget.dir, outputTarget.typesDir));
        }
        if (typeof outputTarget.empty !== 'boolean') {
            outputTarget.empty = DEFAULT_EMPTY_DIR;
        }
        if (typeof outputTarget.appBuild !== 'boolean') {
            outputTarget.appBuild = true;
        }
    });
}
exports.validateOutputTargetDist = validateOutputTargetDist;
var DEFAULT_DIR = 'dist';
var DEFAULT_BUILD_DIR = '';
var DEFAULT_EMPTY_DIR = true;
var DEFAULT_COLLECTION_DIR = 'collection';
var DEFAULT_TYPES_DIR = 'types';
var DEFAULT_ESM_LOADER_DIR = 'loader';
