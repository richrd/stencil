"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../util/helpers");
var scope_1 = require("../util/scope");
var h_1 = require("../renderer/vdom/h");
exports.render = function (plt, cmpMeta, hostElm, instance, perf) {
    try {
        if (_BUILD_.profile) {
            perf.mark("render_start:" + hostElm.nodeName.toLowerCase());
        }
        // if this component has a render function, let's fire
        // it off and generate the child vnodes for this host element
        // note that we do not create the host element cuz it already exists
        var hostMeta = cmpMeta.componentConstructor.host;
        var encapsulation = cmpMeta.componentConstructor.encapsulation;
        // test if this component should be shadow dom
        // and if so does the browser supports it
        var useNativeShadowDom = (_BUILD_.shadowDom && encapsulation === 'shadow' && plt.domApi.$supportsShadowDom);
        var reflectHostAttr = void 0;
        var rootElm = hostElm;
        if (_BUILD_.reflectToAttr) {
            reflectHostAttr = exports.reflectInstanceValuesToHostAttributes(cmpMeta.componentConstructor.properties, instance);
        }
        // this component SHOULD use native slot/shadow dom
        // this browser DOES support native shadow dom
        // and this is the first render
        // let's create that shadow root
        // test if this component should be shadow dom
        // and if so does the browser supports it
        if (_BUILD_.shadowDom && useNativeShadowDom) {
            rootElm = hostElm.shadowRoot;
        }
        if (_BUILD_.styles && !hostElm['s-rn']) {
            // attach the styles this component needs, if any
            // this fn figures out if the styles should go in a
            // shadow root or if they should be global
            plt.attachStyles(plt, plt.domApi, cmpMeta, hostElm);
            var scopeId = hostElm['s-sc'];
            if (scopeId) {
                plt.domApi.$addClass(hostElm, scope_1.getElementScopeId(scopeId, true));
                if (encapsulation === 'scoped') {
                    plt.domApi.$addClass(hostElm, scope_1.getElementScopeId(scopeId));
                }
            }
        }
        if (instance.render || instance.hostData || hostMeta || reflectHostAttr) {
            // tell the platform we're actively rendering
            // if a value is changed within a render() then
            // this tells the platform not to queue the change
            plt.activeRender = true;
            var vnodeChildren = instance.render && instance.render();
            var vnodeHostData = void 0;
            if (_BUILD_.hostData) {
                // user component provided a "hostData()" method
                // the returned data/attributes are used on the host element
                vnodeHostData = instance.hostData && instance.hostData();
                if (_BUILD_.isDev) {
                    if (vnodeHostData && cmpMeta.membersMeta) {
                        var foundHostKeys = Object.keys(vnodeHostData).reduce(function (err, k) {
                            if (cmpMeta.membersMeta[k]) {
                                return err.concat(k);
                            }
                            if (cmpMeta.membersMeta[helpers_1.dashToPascalCase(k)]) {
                                return err.concat(helpers_1.dashToPascalCase(k));
                            }
                            return err;
                        }, []);
                        if (foundHostKeys.length > 0) {
                            throw new Error("The following keys were attempted to be set with hostData() from the " +
                                (cmpMeta.tagNameMeta + " component: " + foundHostKeys.join(', ') + ". ") +
                                "If you would like to modify these please set @Prop({ mutable: true, reflectToAttr: true}) " +
                                "on the @Prop() decorator.");
                        }
                    }
                }
            }
            if (_BUILD_.reflectToAttr && reflectHostAttr) {
                vnodeHostData = vnodeHostData ? Object.assign(vnodeHostData, reflectHostAttr) : reflectHostAttr;
            }
            // tell the platform we're done rendering
            // now any changes will again queue
            plt.activeRender = false;
            if (_BUILD_.hostTheme && hostMeta) {
                // component meta data has a "theme"
                // use this to automatically generate a good css class
                // from the mode and color to add to the host element
                vnodeHostData = exports.applyComponentHostData(vnodeHostData, hostMeta, instance);
            }
            // looks like we've got child nodes to render into this host element
            // or we need to update the css class/attrs on the host element
            var hostVNode = h_1.h(null, vnodeHostData, vnodeChildren);
            // if we haven't already created a vnode, then we give the renderer the actual element
            // if this is a re-render, then give the renderer the last vnode we already created
            var oldVNode = plt.vnodeMap.get(hostElm) || {};
            oldVNode.elm = rootElm;
            if (_BUILD_.reflectToAttr) {
                // only care if we're reflecting values to the host element
                hostVNode.ishost = true;
            }
            // each patch always gets a new vnode
            // the host element itself isn't patched because it already exists
            // kick off the actual render and any DOM updates
            plt.vnodeMap.set(hostElm, plt.render(hostElm, oldVNode, hostVNode, useNativeShadowDom, encapsulation));
        }
        // update styles!
        if (_BUILD_.cssVarShim && plt.customStyle) {
            plt.customStyle.updateHost(hostElm);
        }
        // it's official, this element has rendered
        hostElm['s-rn'] = true;
        if (hostElm['s-rc']) {
            // ok, so turns out there are some child host elements
            // waiting on this parent element to load
            // let's fire off all update callbacks waiting
            hostElm['s-rc'].forEach(function (cb) { return cb(); });
            hostElm['s-rc'] = null;
        }
        if (_BUILD_.profile) {
            perf.mark("render_end:" + hostElm.nodeName.toLowerCase());
            perf.measure("render:" + hostElm.nodeName.toLowerCase(), "render_start:" + hostElm.nodeName.toLowerCase(), "render_end:" + hostElm.nodeName.toLowerCase());
        }
    }
    catch (e) {
        plt.activeRender = false;
        plt.onError(e, 8 /* RenderError */, hostElm, true);
    }
};
exports.applyComponentHostData = function (vnodeHostData, hostMeta, instance) {
    vnodeHostData = vnodeHostData || {};
    // component meta data has a "theme"
    // use this to automatically generate a good css class
    // from the mode and color to add to the host element
    Object.keys(hostMeta).forEach(function (key) {
        if (key === 'theme') {
            // host: { theme: 'button' }
            // adds css classes w/ mode and color combinations
            // class="button button-md button-primary button-md-primary"
            exports.convertCssNamesToObj(vnodeHostData['class'] = vnodeHostData['class'] || {}, hostMeta[key], instance.mode, instance.color);
        }
        else if (key === 'class') {
            // host: { class: 'multiple css-classes' }
            // class="multiple css-classes"
            exports.convertCssNamesToObj(vnodeHostData[key] = vnodeHostData[key] || {}, hostMeta[key]);
        }
        else {
            // rando attribute/properties
            vnodeHostData[key] = hostMeta[key];
        }
    });
    return vnodeHostData;
};
exports.convertCssNamesToObj = function (cssClassObj, className, mode, color) {
    className.split(' ').forEach(function (cssClass) {
        cssClassObj[cssClass] = true;
        if (mode) {
            cssClassObj[cssClass + "-" + mode] = true;
            if (color) {
                cssClassObj[cssClass + "-" + mode + "-" + color] = cssClassObj[cssClass + "-" + color] = true;
            }
        }
    });
};
exports.reflectInstanceValuesToHostAttributes = function (properties, instance, reflectHostAttr) {
    if (properties) {
        Object.keys(properties).forEach(function (memberName) {
            if (properties[memberName].reflectToAttr) {
                reflectHostAttr = reflectHostAttr || {};
                reflectHostAttr[memberName] = instance[memberName];
            }
        });
    }
    return reflectHostAttr;
};
