"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function initEventEmitters(plt, cmpEvents, instance) {
    if (cmpEvents) {
        var elm_1 = plt.hostElementMap.get(instance);
        cmpEvents.forEach(function (eventMeta) {
            instance[eventMeta.method] = {
                emit: function (data) {
                    return plt.emitEvent(elm_1, eventMeta.name, {
                        bubbles: eventMeta.bubbles,
                        composed: eventMeta.composed,
                        cancelable: eventMeta.cancelable,
                        detail: data
                    });
                }
            };
        });
    }
}
exports.initEventEmitters = initEventEmitters;
