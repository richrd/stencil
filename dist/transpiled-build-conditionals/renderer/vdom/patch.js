"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../../util/helpers");
var constants_1 = require("../../util/constants");
var update_dom_node_1 = require("./update-dom-node");
var isSvgMode = false;
exports.createRendererPatch = function (plt, domApi) {
    // createRenderer() is only created once per app
    // the patch() function which createRenderer() returned is the function
    // which gets called numerous times by each component
    // internal variables to be reused per patch() call
    var useNativeShadowDom, ssrId, scopeId, checkSlotFallbackVisibility, checkSlotRelocate, contentRef, hostTagName, hostElm;
    var createElm = function (oldParentVNode, newParentVNode, childIndex, parentElm, i, elm, childNode, newVNode, oldVNode) {
        newVNode = newParentVNode.vchildren[childIndex];
        if (_BUILD_.slotPolyfill && !useNativeShadowDom) {
            // remember for later we need to check to relocate nodes
            checkSlotRelocate = true;
            if (newVNode.vtag === 'slot') {
                if (scopeId) {
                    // scoped css needs to add its scoped id to the parent element
                    domApi.$addClass(parentElm, scopeId + '-s');
                }
                if (!newVNode.vchildren) {
                    // slot element does not have fallback content
                    // create an html comment we'll use to always reference
                    // where actual slot content should sit next to
                    newVNode.isSlotReference = true;
                }
                else {
                    // slot element has fallback content
                    // still create an element that "mocks" the slot element
                    newVNode.isSlotFallback = true;
                }
            }
        }
        if (helpers_1.isDef(newVNode.vtext)) {
            // create text node
            newVNode.elm = domApi.$createTextNode(newVNode.vtext);
        }
        else if (_BUILD_.slotPolyfill && newVNode.isSlotReference) {
            // create a slot reference html text node
            newVNode.elm = domApi.$createTextNode('');
        }
        else {
            // create element
            elm = newVNode.elm = ((_BUILD_.hasSvg && (isSvgMode || newVNode.vtag === 'svg')) ?
                domApi.$createElementNS('http://www.w3.org/2000/svg', newVNode.vtag) :
                domApi.$createElement((_BUILD_.slotPolyfill && newVNode.isSlotFallback) ? 'slot-fb' : newVNode.vtag));
            if (plt.isDefinedComponent(elm)) {
                plt.isCmpReady.delete(hostElm);
            }
            if (_BUILD_.hasSvg) {
                isSvgMode = newVNode.vtag === 'svg' ? true : (newVNode.vtag === 'foreignObject' ? false : isSvgMode);
            }
            // add css classes, attrs, props, listeners, etc.
            update_dom_node_1.updateElement(plt, null, newVNode, isSvgMode);
            if (helpers_1.isDef(scopeId) && elm['s-si'] !== scopeId) {
                // if there is a scopeId and this is the initial render
                // then let's add the scopeId as an attribute
                domApi.$addClass(elm, (elm['s-si'] = scopeId));
            }
            if (_BUILD_.ssrServerSide && helpers_1.isDef(ssrId)) {
                // SSR ONLY: this is an SSR render and this
                // logic does not run on the client
                // give this element the SSR child id that can be read by the client
                domApi.$setAttribute(elm, constants_1.SSR_CHILD_ID, ssrId + '.' + childIndex + (hasChildNodes(newVNode.vchildren) ? '' : '.'));
            }
            if (newVNode.vchildren) {
                for (i = 0; i < newVNode.vchildren.length; ++i) {
                    // create the node
                    childNode = createElm(oldParentVNode, newVNode, i, elm);
                    // return node could have been null
                    if (childNode) {
                        if (_BUILD_.ssrServerSide && helpers_1.isDef(ssrId) && childNode.nodeType === 3 /* TextNode */ && !childNode['s-cr']) {
                            // SSR ONLY: add the text node's start comment
                            domApi.$appendChild(elm, domApi.$createComment('s.' + ssrId + '.' + i));
                        }
                        // append our new node
                        domApi.$appendChild(elm, childNode);
                        if (_BUILD_.ssrServerSide && helpers_1.isDef(ssrId) && childNode.nodeType === 3 /* TextNode */ && !childNode['s-cr']) {
                            // SSR ONLY: add the text node's end comment
                            domApi.$appendChild(elm, domApi.$createComment('/'));
                            domApi.$appendChild(elm, domApi.$createTextNode(' '));
                        }
                    }
                }
            }
            if (_BUILD_.hasSvg && newVNode.vtag === 'svg') {
                // Only reset the SVG context when we're exiting SVG element
                isSvgMode = false;
            }
        }
        if (_BUILD_.slotPolyfill) {
            newVNode.elm['s-hn'] = hostTagName;
            if (newVNode.isSlotFallback || newVNode.isSlotReference) {
                // remember the content reference comment
                newVNode.elm['s-sr'] = true;
                // remember the content reference comment
                newVNode.elm['s-cr'] = contentRef;
                // remember the slot name, or empty string for default slot
                newVNode.elm['s-sn'] = newVNode.vname || '';
                // check if we've got an old vnode for this slot
                oldVNode = oldParentVNode && oldParentVNode.vchildren && oldParentVNode.vchildren[childIndex];
                if (oldVNode && oldVNode.vtag === newVNode.vtag && oldParentVNode.elm) {
                    // we've got an old slot vnode and the wrapper is being replaced
                    // so let's move the old slot content back to it's original location
                    putBackInOriginalLocation(oldParentVNode.elm);
                }
            }
        }
        return newVNode.elm;
    };
    var putBackInOriginalLocation = function (parentElm, recursive, i, childNode) {
        plt.tmpDisconnected = true;
        var oldSlotChildNodes = domApi.$childNodes(parentElm);
        for (i = oldSlotChildNodes.length - 1; i >= 0; i--) {
            childNode = oldSlotChildNodes[i];
            if (childNode['s-hn'] !== hostTagName && childNode['s-ol']) {
                // this child node in the old element is from another component
                // remove this node from the old slot's parent
                domApi.$remove(childNode);
                // and relocate it back to it's original location
                domApi.$insertBefore(parentReferenceNode(childNode), childNode, referenceNode(childNode));
                // remove the old original location comment entirely
                // later on the patch function will know what to do
                // and move this to the correct spot in need be
                domApi.$remove(childNode['s-ol']);
                childNode['s-ol'] = null;
                checkSlotRelocate = true;
            }
            if (recursive) {
                putBackInOriginalLocation(childNode, recursive);
            }
        }
        plt.tmpDisconnected = false;
    };
    var addVnodes = function (parentElm, before, parentVNode, vnodes, startIdx, endIdx, containerElm, childNode) {
        var contentRef = parentElm['s-cr'];
        containerElm = ((contentRef && domApi.$parentNode(contentRef)) || parentElm);
        if (containerElm.shadowRoot && domApi.$tagName(containerElm) === hostTagName) {
            containerElm = containerElm.shadowRoot;
        }
        for (; startIdx <= endIdx; ++startIdx) {
            if (vnodes[startIdx]) {
                childNode = helpers_1.isDef(vnodes[startIdx].vtext) ?
                    domApi.$createTextNode(vnodes[startIdx].vtext) :
                    createElm(null, parentVNode, startIdx, parentElm);
                if (childNode) {
                    vnodes[startIdx].elm = childNode;
                    domApi.$insertBefore(containerElm, childNode, referenceNode(before));
                }
            }
        }
    };
    var removeVnodes = function (vnodes, startIdx, endIdx, node) {
        for (; startIdx <= endIdx; ++startIdx) {
            if (helpers_1.isDef(vnodes[startIdx])) {
                node = vnodes[startIdx].elm;
                if (_BUILD_.slotPolyfill) {
                    // we're removing this element
                    // so it's possible we need to show slot fallback content now
                    checkSlotFallbackVisibility = true;
                    if (node['s-ol']) {
                        // remove the original location comment
                        domApi.$remove(node['s-ol']);
                    }
                    else {
                        // it's possible that child nodes of the node
                        // that's being removed are slot nodes
                        putBackInOriginalLocation(node, true);
                    }
                }
                // remove the vnode's element from the dom
                domApi.$remove(node);
            }
        }
    };
    var updateChildren = function (parentElm, oldCh, newVNode, newCh, idxInOld, i, node, elmToMove) {
        var oldStartIdx = 0, newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                // Vnode might have been moved left
                oldStartVnode = oldCh[++oldStartIdx];
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldStartVnode, newStartVnode)) {
                patchVNode(oldStartVnode, newStartVnode);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (isSameVnode(oldEndVnode, newEndVnode)) {
                patchVNode(oldEndVnode, newEndVnode);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldStartVnode, newEndVnode)) {
                // Vnode moved right
                if (_BUILD_.slotPolyfill && (oldStartVnode.vtag === 'slot' || newEndVnode.vtag === 'slot')) {
                    putBackInOriginalLocation(domApi.$parentNode(oldStartVnode.elm));
                }
                patchVNode(oldStartVnode, newEndVnode);
                domApi.$insertBefore(parentElm, oldStartVnode.elm, domApi.$nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
                if (_BUILD_.slotPolyfill && (oldStartVnode.vtag === 'slot' || newEndVnode.vtag === 'slot')) {
                    putBackInOriginalLocation(domApi.$parentNode(oldEndVnode.elm));
                }
                patchVNode(oldEndVnode, newStartVnode);
                domApi.$insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                // createKeyToOldIdx
                idxInOld = null;
                for (i = oldStartIdx; i <= oldEndIdx; ++i) {
                    if (oldCh[i] && helpers_1.isDef(oldCh[i].vkey) && oldCh[i].vkey === newStartVnode.vkey) {
                        idxInOld = i;
                        break;
                    }
                }
                if (helpers_1.isDef(idxInOld)) {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.vtag !== newStartVnode.vtag) {
                        node = createElm(oldCh && oldCh[newStartIdx], newVNode, idxInOld, parentElm);
                    }
                    else {
                        patchVNode(elmToMove, newStartVnode);
                        oldCh[idxInOld] = undefined;
                        node = elmToMove.elm;
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    // new element
                    node = createElm(oldCh && oldCh[newStartIdx], newVNode, newStartIdx, parentElm);
                    newStartVnode = newCh[++newStartIdx];
                }
                if (node) {
                    if (_BUILD_.slotPolyfill) {
                        domApi.$insertBefore(parentReferenceNode(oldStartVnode.elm), node, referenceNode(oldStartVnode.elm));
                    }
                    else {
                        domApi.$insertBefore(domApi.$parentNode(oldStartVnode.elm), node, oldStartVnode.elm);
                    }
                }
            }
        }
        if (oldStartIdx > oldEndIdx) {
            addVnodes(parentElm, (newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm), newVNode, newCh, newStartIdx, newEndIdx);
        }
        else if (_BUILD_.updatable && newStartIdx > newEndIdx) {
            removeVnodes(oldCh, oldStartIdx, oldEndIdx);
        }
    };
    var isSameVnode = function (vnode1, vnode2) {
        // compare if two vnode to see if they're "technically" the same
        // need to have the same element tag, and same key to be the same
        if (vnode1.vtag === vnode2.vtag && vnode1.vkey === vnode2.vkey) {
            if (_BUILD_.slotPolyfill) {
                if (vnode1.vtag === 'slot') {
                    return vnode1.vname === vnode2.vname;
                }
            }
            return true;
        }
        return false;
    };
    var referenceNode = function (node) {
        if (node && node['s-ol']) {
            // this node was relocated to a new location in the dom
            // because of some other component's slot
            // but we still have an html comment in place of where
            // it's original location was according to it's original vdom
            return node['s-ol'];
        }
        return node;
    };
    var parentReferenceNode = function (node) {
        return domApi.$parentNode(node['s-ol'] ? node['s-ol'] : node);
    };
    var patchVNode = function (oldVNode, newVNode, defaultHolder) {
        var elm = newVNode.elm = oldVNode.elm;
        var oldChildren = oldVNode.vchildren;
        var newChildren = newVNode.vchildren;
        if (_BUILD_.hasSvg) {
            // test if we're rendering an svg element, or still rendering nodes inside of one
            // only add this to the when the compiler sees we're using an svg somewhere
            isSvgMode = newVNode.elm &&
                helpers_1.isDef(domApi.$parentElement(newVNode.elm)) &&
                newVNode.elm.ownerSVGElement !== undefined;
            isSvgMode = newVNode.vtag === 'svg' ? true : (newVNode.vtag === 'foreignObject' ? false : isSvgMode);
        }
        if (!helpers_1.isDef(newVNode.vtext)) {
            // element node
            if (newVNode.vtag !== 'slot') {
                // either this is the first render of an element OR it's an update
                // AND we already know it's possible it could have changed
                // this updates the element's css classes, attrs, props, listeners, etc.
                update_dom_node_1.updateElement(plt, oldVNode, newVNode, isSvgMode);
            }
            if (_BUILD_.updatable && helpers_1.isDef(oldChildren) && helpers_1.isDef(newChildren)) {
                // looks like there's child vnodes for both the old and new vnodes
                updateChildren(elm, oldChildren, newVNode, newChildren);
            }
            else if (helpers_1.isDef(newChildren)) {
                // no old child vnodes, but there are new child vnodes to add
                if (_BUILD_.updatable && helpers_1.isDef(oldVNode.vtext)) {
                    // the old vnode was text, so be sure to clear it out
                    domApi.$setTextContent(elm, '');
                }
                // add the new vnode children
                addVnodes(elm, null, newVNode, newChildren, 0, newChildren.length - 1);
            }
            else if (_BUILD_.updatable && helpers_1.isDef(oldChildren)) {
                // no new child vnodes, but there are old child vnodes to remove
                removeVnodes(oldChildren, 0, oldChildren.length - 1);
            }
        }
        else if (_BUILD_.slotPolyfill && (defaultHolder = elm['s-cr'])) {
            // this element has slotted content
            domApi.$setTextContent(domApi.$parentNode(defaultHolder), newVNode.vtext);
        }
        else if (oldVNode.vtext !== newVNode.vtext) {
            // update the text content for the text only vnode
            // and also only if the text is different than before
            domApi.$setTextContent(elm, newVNode.vtext);
        }
        if (_BUILD_.hasSvg) {
            // reset svgMode when svg node is fully patched
            if (isSvgMode && 'svg' === newVNode.vtag) {
                isSvgMode = false;
            }
        }
    };
    var updateFallbackSlotVisibility = function (elm, childNode, childNodes, i, ilen, j, slotNameAttr, nodeType) {
        childNodes = domApi.$childNodes(elm);
        for (i = 0, ilen = childNodes.length; i < ilen; i++) {
            childNode = childNodes[i];
            if (domApi.$nodeType(childNode) === 1 /* ElementNode */) {
                if (childNode['s-sr']) {
                    // this is a slot fallback node
                    // get the slot name for this slot reference node
                    slotNameAttr = childNode['s-sn'];
                    // by default always show a fallback slot node
                    // then hide it if there are other slots in the light dom
                    childNode.hidden = false;
                    for (j = 0; j < ilen; j++) {
                        if (childNodes[j]['s-hn'] !== childNode['s-hn']) {
                            // this sibling node is from a different component
                            nodeType = domApi.$nodeType(childNodes[j]);
                            if (slotNameAttr !== '') {
                                // this is a named fallback slot node
                                if (nodeType === 1 /* ElementNode */ && slotNameAttr === domApi.$getAttribute(childNodes[j], 'slot')) {
                                    childNode.hidden = true;
                                    break;
                                }
                            }
                            else {
                                // this is a default fallback slot node
                                // any element or text node (with content)
                                // should hide the default fallback slot node
                                if (nodeType === 1 /* ElementNode */ || (nodeType === 3 /* TextNode */ && domApi.$getTextContent(childNodes[j]).trim() !== '')) {
                                    childNode.hidden = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                // keep drilling down
                updateFallbackSlotVisibility(childNode);
            }
        }
    };
    var relocateNodes = [];
    var relocateSlotContent = function (elm, childNodes, childNode, node, i, ilen, j, hostContentNodes, slotNameAttr, nodeType) {
        childNodes = domApi.$childNodes(elm);
        for (i = 0, ilen = childNodes.length; i < ilen; i++) {
            childNode = childNodes[i];
            if (childNode['s-sr'] && (node = childNode['s-cr'])) {
                // first got the content reference comment node
                // then we got it's parent, which is where all the host content is in now
                hostContentNodes = domApi.$childNodes(domApi.$parentNode(node));
                slotNameAttr = childNode['s-sn'];
                for (j = hostContentNodes.length - 1; j >= 0; j--) {
                    node = hostContentNodes[j];
                    if (!node['s-cn'] && !node['s-nr'] && node['s-hn'] !== childNode['s-hn']) {
                        // let's do some relocating to its new home
                        // but never relocate a content reference node
                        // that is suppose to always represent the original content location
                        nodeType = domApi.$nodeType(node);
                        if (((nodeType === 3 /* TextNode */ || nodeType === 8 /* CommentNode */) && slotNameAttr === '') ||
                            (nodeType === 1 /* ElementNode */ && domApi.$getAttribute(node, 'slot') === null && slotNameAttr === '') ||
                            (nodeType === 1 /* ElementNode */ && domApi.$getAttribute(node, 'slot') === slotNameAttr)) {
                            // it's possible we've already decided to relocate this node
                            if (!relocateNodes.some(function (r) { return r.nodeToRelocate === node; })) {
                                // made some changes to slots
                                // let's make sure we also double check
                                // fallbacks are correctly hidden or shown
                                checkSlotFallbackVisibility = true;
                                node['s-sn'] = slotNameAttr;
                                // add to our list of nodes to relocate
                                relocateNodes.push({
                                    slotRefNode: childNode,
                                    nodeToRelocate: node
                                });
                            }
                        }
                    }
                }
            }
            if (domApi.$nodeType(childNode) === 1 /* ElementNode */) {
                relocateSlotContent(childNode);
            }
        }
    };
    return function (hostElement, oldVNode, newVNode, useNativeShadowDomVal, encapsulation, ssrPatchId, i, relocateNode, orgLocationNode, refNode, parentNodeRef, insertBeforeNode) {
        // patchVNode() is synchronous
        // so it is safe to set these variables and internally
        // the same patch() call will reference the same data
        hostElm = hostElement;
        hostTagName = domApi.$tagName(hostElm);
        contentRef = hostElm['s-cr'];
        useNativeShadowDom = useNativeShadowDomVal;
        if (_BUILD_.ssrServerSide) {
            if (encapsulation !== 'shadow') {
                ssrId = ssrPatchId;
            }
            else {
                ssrId = null;
            }
        }
        if (_BUILD_.slotPolyfill) {
            // get the scopeId
            scopeId = hostElm['s-sc'];
            // always reset
            checkSlotRelocate = checkSlotFallbackVisibility = false;
        }
        // synchronous patch
        patchVNode(oldVNode, newVNode);
        if (_BUILD_.ssrServerSide && helpers_1.isDef(ssrId)) {
            // SSR ONLY: we've been given an SSR id, so the host element
            // should be given the ssr id attribute
            domApi.$setAttribute(oldVNode.elm, constants_1.SSR_VNODE_ID, ssrId);
        }
        if (_BUILD_.slotPolyfill) {
            if (checkSlotRelocate) {
                relocateSlotContent(newVNode.elm);
                for (i = 0; i < relocateNodes.length; i++) {
                    relocateNode = relocateNodes[i];
                    if (!relocateNode.nodeToRelocate['s-ol']) {
                        // add a reference node marking this node's original location
                        // keep a reference to this node for later lookups
                        orgLocationNode = domApi.$createTextNode('');
                        orgLocationNode['s-nr'] = relocateNode.nodeToRelocate;
                        domApi.$insertBefore(domApi.$parentNode(relocateNode.nodeToRelocate), (relocateNode.nodeToRelocate['s-ol'] = orgLocationNode), relocateNode.nodeToRelocate);
                    }
                }
                // while we're moving nodes around existing nodes, temporarily disable
                // the disconnectCallback from working
                plt.tmpDisconnected = true;
                for (i = 0; i < relocateNodes.length; i++) {
                    relocateNode = relocateNodes[i];
                    // by default we're just going to insert it directly
                    // after the slot reference node
                    parentNodeRef = domApi.$parentNode(relocateNode.slotRefNode);
                    insertBeforeNode = domApi.$nextSibling(relocateNode.slotRefNode);
                    orgLocationNode = relocateNode.nodeToRelocate['s-ol'];
                    while (orgLocationNode = domApi.$previousSibling(orgLocationNode)) {
                        if ((refNode = orgLocationNode['s-nr']) && refNode) {
                            if (refNode['s-sn'] === relocateNode.nodeToRelocate['s-sn']) {
                                if (parentNodeRef === domApi.$parentNode(refNode)) {
                                    if ((refNode = domApi.$nextSibling(refNode)) && refNode && !refNode['s-nr']) {
                                        insertBeforeNode = refNode;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if ((!insertBeforeNode && parentNodeRef !== domApi.$parentNode(relocateNode.nodeToRelocate)) ||
                        (domApi.$nextSibling(relocateNode.nodeToRelocate) !== insertBeforeNode)) {
                        // we've checked that it's worth while to relocate
                        // since that the node to relocate
                        // has a different next sibling or parent relocated
                        if (relocateNode.nodeToRelocate !== insertBeforeNode) {
                            // remove the node from the dom
                            domApi.$remove(relocateNode.nodeToRelocate);
                            // add it back to the dom but in its new home
                            domApi.$insertBefore(parentNodeRef, relocateNode.nodeToRelocate, insertBeforeNode);
                        }
                    }
                }
                // done moving nodes around
                // allow the disconnect callback to work again
                plt.tmpDisconnected = false;
            }
            if (checkSlotFallbackVisibility) {
                updateFallbackSlotVisibility(newVNode.elm);
            }
            // always reset
            relocateNodes.length = 0;
        }
        // return our new vnode
        return newVNode;
    };
};
exports.callNodeRefs = function (vNode, isDestroy) {
    if (vNode) {
        vNode.vattrs && vNode.vattrs.ref && vNode.vattrs.ref(isDestroy ? null : vNode.elm);
        vNode.vchildren && vNode.vchildren.forEach(function (vChild) {
            exports.callNodeRefs(vChild, isDestroy);
        });
    }
};
var hasChildNodes = function (children) {
    // SSR ONLY: check if there are any more nested child elements
    // if there aren't, this info is useful so the client runtime
    // doesn't have to climb down and check so many elements
    if (children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].vtag !== 'slot' || hasChildNodes(children[i].vchildren)) {
                return true;
            }
        }
    }
    return false;
};
