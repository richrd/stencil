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
var proxy_members_1 = require("./proxy-members");
exports.proxyComponentInstance = function (plt, cmpConstructor, elm, instance, hostSnapshot, perf) {
    if (_BUILD_.profile) {
        perf.mark("proxy_instance_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
    }
    // at this point we've got a specific node of a host element, and created a component class instance
    // and we've already created getters/setters on both the host element and component class prototypes
    // let's upgrade any data that might have been set on the host element already
    // and let's have the getters/setters kick in and do their jobs
    // let's automatically add a reference to the host element on the instance
    plt.hostElementMap.set(instance, elm);
    // create the values object if it doesn't already exist
    // this will hold all of the internal getter/setter values
    if (!plt.valuesMap.has(elm)) {
        plt.valuesMap.set(elm, {});
    }
    // get the properties from the constructor
    // and add default "mode" and "color" properties
    Object.entries(__assign({ color: { type: String } }, cmpConstructor.properties, { mode: { type: String } })).forEach(function (_a) {
        var memberName = _a[0], property = _a[1];
        // define each of the members and initialize what their role is
        proxy_members_1.defineMember(plt, property, elm, instance, memberName, hostSnapshot, perf);
    });
    if (_BUILD_.profile) {
        perf.mark("proxy_instance_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
        perf.measure("proxy_instance:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "proxy_instance_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "proxy_instance_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
    }
};
