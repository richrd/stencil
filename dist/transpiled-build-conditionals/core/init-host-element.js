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
var attribute_changed_1 = require("./attribute-changed");
var connected_1 = require("./connected");
var disconnected_1 = require("./disconnected");
var hmr_component_1 = require("./hmr-component");
var init_component_instance_1 = require("./init-component-instance");
var proxy_host_element_1 = require("./proxy-host-element");
var update_1 = require("./update");
exports.initHostElement = function (plt, cmpMeta, HostElementConstructor, hydratedCssClass, perf) {
    // let's wire up our functions to the host element's prototype
    // we can also inject our platform into each one that needs that api
    // note: these cannot be arrow functions cuz "this" is important here hombre
    HostElementConstructor.connectedCallback = function () {
        // coolsville, our host element has just hit the DOM
        connected_1.connectedCallback(plt, cmpMeta, this, perf);
    };
    HostElementConstructor.disconnectedCallback = function () {
        // the element has left the builing
        disconnected_1.disconnectedCallback(plt, this, perf);
    };
    HostElementConstructor['s-init'] = function () {
        init_component_instance_1.initComponentLoaded(plt, this, hydratedCssClass, perf);
    };
    HostElementConstructor.forceUpdate = function () {
        update_1.queueUpdate(plt, this, perf);
    };
    if (_BUILD_.hotModuleReplacement) {
        HostElementConstructor['s-hmr'] = function (hmrVersionId) {
            hmr_component_1.hmrStart(plt, cmpMeta, this, hmrVersionId);
        };
    }
    if (_BUILD_.hasMembers && cmpMeta.membersMeta) {
        var entries = Object.entries(cmpMeta.membersMeta);
        if (_BUILD_.observeAttr) {
            var attrToProp_1 = {};
            entries.forEach(function (_a) {
                var propName = _a[0], attribName = _a[1].attribName;
                if (attribName) {
                    attrToProp_1[attribName] = propName;
                }
            });
            attrToProp_1 = __assign({}, attrToProp_1);
            HostElementConstructor.attributeChangedCallback = function (attribName, _oldVal, newVal) {
                // the browser has just informed us that an attribute
                // on the host element has changed
                attribute_changed_1.attributeChangedCallback(attrToProp_1, this, attribName, newVal);
            };
        }
        // add getters/setters to the host element members
        // these would come from the @Prop and @Method decorators that
        // should create the public API to this component
        proxy_host_element_1.proxyHostElementPrototype(plt, entries, HostElementConstructor, perf);
    }
};
