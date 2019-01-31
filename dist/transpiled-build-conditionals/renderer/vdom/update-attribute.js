"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../../util/helpers");
exports.updateAttribute = function (elm, memberName, newValue, isBooleanAttr, isXlinkNs) {
    if (isBooleanAttr === void 0) { isBooleanAttr = typeof newValue === 'boolean'; }
    if (_BUILD_.hasSvg) {
        isXlinkNs = (memberName !== (memberName = memberName.replace(/^xlink\:?/, '')));
    }
    if (newValue == null || (isBooleanAttr && (!newValue || newValue === 'false'))) {
        if (_BUILD_.hasSvg && isXlinkNs) {
            elm.removeAttributeNS(XLINK_NS, helpers_1.toLowerCase(memberName));
        }
        else {
            elm.removeAttribute(memberName);
        }
    }
    else if (typeof newValue !== 'function') {
        if (isBooleanAttr) {
            newValue = '';
        }
        else {
            newValue = newValue.toString();
        }
        if (_BUILD_.hasSvg && isXlinkNs) {
            elm.setAttributeNS(XLINK_NS, helpers_1.toLowerCase(memberName), newValue);
        }
        else {
            elm.setAttribute(memberName, newValue);
        }
    }
};
var XLINK_NS = 'http://www.w3.org/1999/xlink';
