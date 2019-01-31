"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../util/constants");
var scope_1 = require("../util/scope");
function serverInitStyle(domApi, appliedStyleIds, cmpCtr) {
    if (!cmpCtr || !cmpCtr.style) {
        // no styles
        return;
    }
    var styleId = cmpCtr.is + (cmpCtr.styleMode || constants_1.DEFAULT_STYLE_MODE);
    if (appliedStyleIds.has(styleId)) {
        // already initialized
        return;
    }
    appliedStyleIds.add(styleId);
    var styleElm = domApi.$createElement('style');
    styleElm.setAttribute('data-styles', '');
    styleElm.innerHTML = cmpCtr.style;
    domApi.$appendChild(domApi.$doc.head, styleElm);
}
exports.serverInitStyle = serverInitStyle;
function serverAttachStyles(plt, appliedStyleIds, cmpMeta, hostElm) {
    var shouldScopeCss = (cmpMeta.encapsulationMeta === 2 /* ScopedCss */ || (cmpMeta.encapsulationMeta === 1 /* ShadowDom */ && !plt.domApi.$supportsShadowDom));
    // create the style id w/ the host element's mode
    var styleModeId = cmpMeta.tagNameMeta + hostElm.mode;
    if (shouldScopeCss) {
        hostElm['s-sc'] = scope_1.getScopeId(cmpMeta, hostElm.mode);
    }
    if (!appliedStyleIds.has(styleModeId)) {
        // doesn't look like there's a style template with the mode
        // create the style id using the default style mode and try again
        if (shouldScopeCss) {
            hostElm['s-sc'] = scope_1.getScopeId(cmpMeta);
        }
    }
}
exports.serverAttachStyles = serverAttachStyles;
