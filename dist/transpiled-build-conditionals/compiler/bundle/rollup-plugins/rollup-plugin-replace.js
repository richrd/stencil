"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var magic_string_1 = require("magic-string");
function escape(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
function ensureFunction(functionOrValue) {
    if (typeof functionOrValue === 'function')
        return functionOrValue;
    return function () { return functionOrValue; };
}
function longest(a, b) {
    return b.length - a.length;
}
function getReplacements(options) {
    return __assign({}, options.values);
}
function mapToFunctions(object) {
    var functions = {};
    Object.keys(object).forEach(function (key) {
        functions[key] = ensureFunction(object[key]);
    });
    return functions;
}
function replace(options) {
    var delimiters = options.delimiters;
    var functionValues = mapToFunctions(getReplacements(options));
    var keys = Object.keys(functionValues)
        .sort(longest)
        .map(escape);
    var pattern = delimiters
        ? new RegExp(escape(delimiters[0]) + "(" + keys.join('|') + ")" + escape(delimiters[1]), 'g')
        : new RegExp("\\b(" + keys.join('|') + ")\\b", 'g');
    return {
        name: 'replace',
        transform: function (code, id) {
            var magicString = new magic_string_1.default(code);
            var hasReplacements = false;
            var match;
            var start;
            var end;
            var replacement;
            while ((match = pattern.exec(code))) {
                hasReplacements = true;
                start = match.index;
                end = start + match[0].length;
                replacement = String(functionValues[match[1]](id));
                magicString.overwrite(start, end, replacement);
            }
            if (!hasReplacements)
                return null;
            return { code: magicString.toString() };
        }
    };
}
exports.default = replace;
