"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../util/helpers");
function attributeChangedCallback(attrPropsMap, elm, attribName, newVal) {
    // look up to see if we have a property wired up to this attribute name
    var propName = attrPropsMap[helpers_1.toLowerCase(attribName)];
    if (propName) {
        // there is not need to cast the value since, it's already casted when
        // the prop is setted
        elm[propName] = newVal === null && typeof elm[propName] === 'boolean'
            ? false
            : newVal;
    }
}
exports.attributeChangedCallback = attributeChangedCallback;
