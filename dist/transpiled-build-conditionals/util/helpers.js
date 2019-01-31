"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDef = function (v) { return v != null; };
exports.toLowerCase = function (str) { return str.toLowerCase(); };
exports.toDashCase = function (str) { return exports.toLowerCase(str.replace(/([A-Z0-9])/g, function (g) { return ' ' + g[0]; }).trim().replace(/ /g, '-')); };
exports.dashToPascalCase = function (str) { return exports.toLowerCase(str).split('-').map(function (segment) { return segment.charAt(0).toUpperCase() + segment.slice(1); }).join(''); };
exports.toTitleCase = function (str) { return str.charAt(0).toUpperCase() + str.substr(1); };
exports.captializeFirstLetter = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };
exports.noop = function () { };
exports.pluck = function (obj, keys) {
    return keys.reduce(function (final, key) {
        if (obj[key]) {
            final[key] = obj[key];
        }
        return final;
    }, {});
};
exports.isObject = function (val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
};
