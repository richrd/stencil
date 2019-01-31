"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var init_host_element_1 = require("../core/init-host-element");
var host_snapshot_1 = require("../core/host-snapshot");
function patchDomApi(config, plt, domApi, perf) {
    var orgCreateElement = domApi.$createElement;
    domApi.$createElement = function (tagName) {
        var elm = orgCreateElement(tagName);
        var cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta && !cmpMeta.componentConstructor) {
            init_host_element_1.initHostElement(plt, cmpMeta, elm, config.namespace, perf);
            var hostSnapshot = host_snapshot_1.initHostSnapshot(domApi, cmpMeta, elm);
            plt.hostSnapshotMap.set(elm, hostSnapshot);
            plt.requestBundle(cmpMeta, elm);
        }
        return elm;
    };
}
exports.patchDomApi = patchDomApi;
