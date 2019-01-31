"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyController = function (domApi, controllerComponents, ctrlTag) { return ({
    'create': proxyProp(domApi, controllerComponents, ctrlTag, 'create'),
    'componentOnReady': proxyProp(domApi, controllerComponents, ctrlTag, 'componentOnReady')
}); };
var proxyProp = function (domApi, controllerComponents, ctrlTag, proxyMethodName) {
    return function () {
        var args = arguments;
        return exports.loadComponent(domApi, controllerComponents, ctrlTag)
            .then(function (ctrlElm) { return ctrlElm[proxyMethodName].apply(ctrlElm, args); });
    };
};
exports.loadComponent = function (domApi, controllerComponents, ctrlTag, ctrlElm, body) {
    ctrlElm = controllerComponents[ctrlTag];
    body = domApi.$doc.body;
    if (body) {
        if (!ctrlElm) {
            ctrlElm = body.querySelector(ctrlTag);
        }
        if (!ctrlElm) {
            ctrlElm = controllerComponents[ctrlTag] = domApi.$createElement(ctrlTag);
            domApi.$appendChild(body, ctrlElm);
        }
        return ctrlElm.componentOnReady();
    }
    return Promise.resolve();
};
