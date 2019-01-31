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
var helpers_1 = require("./helpers");
exports.parseComponentLoader = function (cmpRegistryData, i, cmpData) {
    // tag name will always be lower case
    // parse member meta
    // this data only includes props that are attributes that need to be observed
    // it does not include all of the props yet
    var tagNameMeta = cmpRegistryData[0], bundleIds = cmpRegistryData[1], memberData = cmpRegistryData[3], encapsulationMeta = cmpRegistryData[4], listenerMeta = cmpRegistryData[5];
    var membersMeta = {
        // every component defaults to always have
        // the mode and color properties
        // but only color should observe any attribute changes
        'color': { attribName: 'color' }
    };
    if (_BUILD_.hasMembers && memberData) {
        for (i = 0; i < memberData.length; i++) {
            cmpData = memberData[i];
            membersMeta[cmpData[0]] = {
                memberType: cmpData[1],
                reflectToAttrib: !!cmpData[2],
                attribName: typeof cmpData[3] === 'string' ? cmpData[3] : cmpData[3] ? cmpData[0] : 0,
                propType: cmpData[4]
            };
        }
    }
    return {
        tagNameMeta: tagNameMeta,
        // map of the bundle ids
        // can contain modes, and array of esm and es5 bundle ids
        bundleIds: bundleIds,
        membersMeta: __assign({}, membersMeta),
        // encapsulation
        encapsulationMeta: encapsulationMeta,
        // parse listener meta
        listenersMeta: listenerMeta ? listenerMeta.map(parseListenerData) : undefined
    };
};
var parseListenerData = function (listenerData) { return ({
    eventName: listenerData[0],
    eventMethodName: listenerData[1],
    eventDisabled: !!listenerData[2],
    eventPassive: !!listenerData[3],
    eventCapture: !!listenerData[4]
}); };
exports.parsePropertyValue = function (propType, propValue) {
    // ensure this value is of the correct prop type
    // we're testing both formats of the "propType" value because
    // we could have either gotten the data from the attribute changed callback,
    // which wouldn't have Constructor data yet, and because this method is reused
    // within proxy where we don't have meta data, but only constructor data
    if (helpers_1.isDef(propValue) && typeof propValue !== 'object' && typeof propValue !== 'function') {
        if (propType === Boolean || propType === 4 /* Boolean */) {
            // per the HTML spec, any string value means it is a boolean true value
            // but we'll cheat here and say that the string "false" is the boolean false
            return (propValue === 'false' ? false : propValue === '' || !!propValue);
        }
        if (propType === Number || propType === 8 /* Number */) {
            // force it to be a number
            return parseFloat(propValue);
        }
        if (propType === String || propType === 2 /* String */) {
            // could have been passed as a number or boolean
            // but we still want it as a string
            return propValue.toString();
        }
        // redundant return here for better minification
        return propValue;
    }
    // not sure exactly what type we want
    // so no need to change to a different type
    return propValue;
};
