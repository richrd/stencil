"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function initElementListeners(plt, elm) {
    // so the element was just connected, which means it's in the DOM
    // however, the component instance hasn't been created yet
    // but what if an event it should be listening to get emitted right now??
    // let's add our listeners right now to our element, and if it happens
    // to receive events between now and the instance being created let's
    // queue up all of the event data and fire it off on the instance when it's ready
    var cmpMeta = plt.getComponentMeta(elm);
    if (cmpMeta.listenersMeta) {
        // we've got listens
        cmpMeta.listenersMeta.forEach(function (listenMeta) {
            // go through each listener
            if (!listenMeta.eventDisabled) {
                // only add ones that are not already disabled
                plt.domApi.$addEventListener(elm, listenMeta.eventName, createListenerCallback(plt, elm, listenMeta.eventMethodName), 1, listenMeta.eventCapture, listenMeta.eventPassive);
            }
        });
    }
}
exports.initElementListeners = initElementListeners;
function createListenerCallback(plt, elm, eventMethodName, val) {
    // create the function that gets called when the element receives
    // an event which it should be listening for
    return function (ev) {
        // get the instance if it exists
        val = plt.instanceMap.get(elm);
        if (val) {
            // instance is ready, let's call it's member method for this event
            val[eventMethodName](ev);
        }
        else {
            // instance is not ready!!
            // let's queue up this event data and replay it later
            // when the instance is ready
            val = (plt.queuedEvents.get(elm) || []);
            val.push(eventMethodName, ev);
            plt.queuedEvents.set(elm, val);
        }
    };
}
exports.createListenerCallback = createListenerCallback;
function enableEventListener(plt, instance, eventName, shouldEnable, attachTo, passive) {
    if (instance) {
        // cool, we've got an instance, it's get the element it's on
        var elm = plt.hostElementMap.get(instance);
        var cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta && cmpMeta.listenersMeta) {
            // alrighty, so this cmp has listener meta
            if (shouldEnable) {
                // we want to enable this event
                // find which listen meta we're talking about
                var listenMeta_1 = cmpMeta.listenersMeta.find(function (l) { return l.eventName === eventName; });
                if (listenMeta_1) {
                    // found the listen meta, so let's add the listener
                    plt.domApi.$addEventListener(elm, eventName, function (ev) { return instance[listenMeta_1.eventMethodName](ev); }, 1, listenMeta_1.eventCapture, (passive === undefined) ? listenMeta_1.eventPassive : !!passive, attachTo);
                }
            }
            else {
                // we're disabling the event listener
                // so let's just remove it entirely
                plt.domApi.$removeEventListener(elm, eventName, 1);
            }
        }
    }
}
exports.enableEventListener = enableEventListener;
