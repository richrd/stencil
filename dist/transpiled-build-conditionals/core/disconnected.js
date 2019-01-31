"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var patch_1 = require("../renderer/vdom/patch");
var init_component_instance_1 = require("./init-component-instance");
exports.disconnectedCallback = function (plt, elm, perf) {
    // only disconnect if we're not temporarily disconnected
    // tmpDisconnected will happen when slot nodes are being relocated
    if (!plt.tmpDisconnected && exports.isDisconnected(plt.domApi, elm)) {
        if (_BUILD_.profile) {
            perf.mark("disconnected_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
        }
        // ok, let's officially destroy this thing
        // set this to true so that any of our pending async stuff
        // doesn't continue since we already decided to destroy this node
        // elm._hasDestroyed = true;
        plt.isDisconnectedMap.set(elm, true);
        // double check that we've informed the ancestor host elements
        // that they're good to go and loaded (cuz this one is on its way out)
        init_component_instance_1.propagateComponentReady(plt, elm);
        // since we're disconnecting, call all of the JSX ref's with null
        patch_1.callNodeRefs(plt.vnodeMap.get(elm), true);
        if (_BUILD_.cmpDidUnload) {
            // call instance componentDidUnload
            // if we've created an instance for this
            var instance = plt.instanceMap.get(elm);
            if (instance && instance.componentDidUnload) {
                // call the user's componentDidUnload if there is one
                instance.componentDidUnload();
            }
        }
        // detatch any event listeners that may have been added
        // because we're not passing an exact event name it'll
        // remove all of this element's event, which is good
        plt.domApi.$removeEventListener(elm);
        plt.hasListenersMap.delete(elm);
        // clear CSS var-shim tracking
        if (_BUILD_.cssVarShim && plt.customStyle) {
            plt.customStyle.removeHost(elm);
        }
        // clear any references to other elements
        // more than likely we've already deleted these references
        // but let's double check there pal
        [
            plt.ancestorHostElementMap,
            plt.onReadyCallbacksMap,
            plt.hostSnapshotMap
        ].forEach(function (wm) { return wm.delete(elm); });
        if (_BUILD_.profile) {
            perf.mark("disconnected_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
            perf.measure("disconnected:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "disconnected_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "disconnected_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
        }
    }
};
exports.isDisconnected = function (domApi, elm) {
    while (elm) {
        if (!domApi.$parentNode(elm)) {
            return domApi.$nodeType(elm) !== 9 /* DocumentNode */;
        }
        elm = domApi.$parentNode(elm);
    }
};
