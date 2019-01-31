"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var remove_unused_styles_1 = require("./remove-unused-styles");
var used_selectors_1 = require("../html/used-selectors");
function optimizeSsrStyles(config, outputTarget, doc, diagnostics) {
    var ssrStyleElm = mergeSsrStyles(doc);
    if (ssrStyleElm == null) {
        return;
    }
    if (outputTarget.removeUnusedStyles !== false) {
        // removeUnusedStyles is the default
        try {
            // pick out all of the selectors that are actually
            // being used in the html document
            var usedSelectors = new used_selectors_1.UsedSelectors(doc.documentElement);
            // remove any selectors that are not used in this document
            ssrStyleElm.innerHTML = remove_unused_styles_1.removeUnusedStyles(config, usedSelectors, ssrStyleElm.innerHTML, diagnostics);
        }
        catch (e) {
            diagnostics.push({
                level: 'error',
                type: 'hydrate',
                header: 'HTML Selector Parse',
                messageText: e
            });
        }
    }
}
exports.optimizeSsrStyles = optimizeSsrStyles;
function mergeSsrStyles(doc) {
    // get all the styles that were added during prerendering
    var ssrStyleElms = doc.head.querySelectorAll("style[data-styles]");
    if (ssrStyleElms.length === 0) {
        // this doc doesn't have any ssr styles
        return null;
    }
    var styleText = [];
    var ssrStyleElm;
    for (var i = ssrStyleElms.length - 1; i >= 0; i--) {
        // iterate backwards for funzies
        ssrStyleElm = ssrStyleElms[i];
        // collect up all the style text from each style element
        styleText.push(ssrStyleElm.innerHTML);
        // remove this style element from the document
        ssrStyleElm.parentNode.removeChild(ssrStyleElm);
        if (i === 0) {
            // this is the first style element, let's use this
            // same element as the main one we'll load up
            // merge all of the styles we collected into one
            ssrStyleElm.innerHTML = styleText.reverse().join('').trim();
            if (ssrStyleElm.innerHTML.length > 0) {
                // let's keep the first style element
                // and make it the first element in the head
                doc.head.insertBefore(ssrStyleElm, doc.head.firstChild);
                // return the ssr style element we loaded up
                return ssrStyleElm;
            }
        }
    }
    return null;
}
