"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var connected_1 = require("../core/connected");
var init_host_element_1 = require("../core/init-host-element");
var host_snapshot_1 = require("../core/host-snapshot");
function connectChildElements(config, plt, App, hydrateResults, parentElm, perf) {
    if (parentElm && parentElm.children) {
        for (var i = 0; i < parentElm.children.length; i++) {
            connectElement(config, plt, App, hydrateResults, parentElm.children[i], perf);
            connectChildElements(config, plt, App, hydrateResults, parentElm.children[i], perf);
        }
    }
}
exports.connectChildElements = connectChildElements;
function connectElement(config, plt, App, hydrateResults, elm, perf) {
    if (!plt.hasConnectedMap.has(elm)) {
        var tagName = elm.tagName.toLowerCase();
        var cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta) {
            connectHostElement(config, plt, App, hydrateResults, elm, cmpMeta, perf);
        }
        else if (tagName === 'script') {
            connectScriptElement(hydrateResults, elm);
        }
        else if (tagName === 'link') {
            connectLinkElement(hydrateResults, elm);
        }
        else if (tagName === 'img') {
            connectImgElement(hydrateResults, elm);
        }
        plt.hasConnectedMap.set(elm, true);
    }
}
exports.connectElement = connectElement;
function connectHostElement(config, plt, App, hydrateResults, elm, cmpMeta, perf) {
    var hostSnapshot = host_snapshot_1.initHostSnapshot(plt.domApi, cmpMeta, elm);
    plt.hostSnapshotMap.set(elm, hostSnapshot);
    if (!cmpMeta.componentConstructor) {
        plt.requestBundle(cmpMeta, elm);
    }
    if (cmpMeta.encapsulationMeta !== 1 /* ShadowDom */) {
        init_host_element_1.initHostElement(plt, cmpMeta, elm, config.hydratedCssClass, perf);
        connected_1.connectedCallback(plt, cmpMeta, elm, perf);
    }
    connectComponentOnReady(App, elm);
    var depth = getNodeDepth(elm);
    var cmp = hydrateResults.components.find(function (c) { return c.tag === cmpMeta.tagNameMeta; });
    if (cmp) {
        cmp.count++;
        if (depth > cmp.depth) {
            cmp.depth = depth;
        }
    }
    else {
        hydrateResults.components.push({
            tag: cmpMeta.tagNameMeta,
            count: 1,
            depth: depth
        });
    }
}
function connectComponentOnReady(App, elm) {
    elm.componentOnReady = function componentOnReady() {
        return new Promise(function (resolve) {
            App.componentOnReady(elm, resolve);
        });
    };
}
exports.connectComponentOnReady = connectComponentOnReady;
function connectScriptElement(hydrateResults, elm) {
    var src = elm.src;
    if (src && hydrateResults.scriptUrls.indexOf(src) === -1) {
        hydrateResults.scriptUrls.push(src);
    }
}
function connectLinkElement(hydrateResults, elm) {
    var href = elm.href;
    var rel = (elm.rel || '').toLowerCase();
    if (rel === 'stylesheet' && href && hydrateResults.styleUrls.indexOf(href) === -1) {
        hydrateResults.styleUrls.push(href);
    }
}
function connectImgElement(hydrateResults, elm) {
    var src = elm.src;
    if (src && hydrateResults.imgUrls.indexOf(src) === -1) {
        hydrateResults.imgUrls.push(src);
    }
}
function getNodeDepth(elm) {
    var depth = 0;
    while (elm.parentNode) {
        depth++;
        elm = elm.parentNode;
    }
    return depth;
}
