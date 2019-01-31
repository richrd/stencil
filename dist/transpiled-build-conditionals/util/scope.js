"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
function getScopeId(cmpMeta, mode) {
    return ('sc-' + cmpMeta.tagNameMeta) + ((mode && mode !== constants_1.DEFAULT_STYLE_MODE) ? '-' + mode : '');
}
exports.getScopeId = getScopeId;
function getElementScopeId(scopeId, isHostElement) {
    return scopeId + (isHostElement ? '-h' : '-s');
}
exports.getElementScopeId = getElementScopeId;
