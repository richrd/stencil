"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../util/constants");
var set_accessor_1 = require("./set-accessor");
exports.updateElement = function (plt, oldVnode, newVnode, isSvgMode, memberName) {
    // if the element passed in is a shadow root, which is a document fragment
    // then we want to be adding attrs/props to the shadow root's "host" element
    // if it's not a shadow root, then we add attrs/props to the same element
    var elm = (newVnode.elm.nodeType === 11 /* DocumentFragment */ && newVnode.elm.host) ? newVnode.elm.host : newVnode.elm;
    var oldVnodeAttrs = (oldVnode && oldVnode.vattrs) || constants_1.EMPTY_OBJ;
    var newVnodeAttrs = newVnode.vattrs || constants_1.EMPTY_OBJ;
    if (_BUILD_.updatable) {
        // remove attributes no longer present on the vnode by setting them to undefined
        for (memberName in oldVnodeAttrs) {
            if (!(newVnodeAttrs && newVnodeAttrs[memberName] != null) && oldVnodeAttrs[memberName] != null) {
                set_accessor_1.setAccessor(plt, elm, memberName, oldVnodeAttrs[memberName], undefined, isSvgMode, newVnode.ishost);
            }
        }
    }
    // add new & update changed attributes
    for (memberName in newVnodeAttrs) {
        if (!(memberName in oldVnodeAttrs) || newVnodeAttrs[memberName] !== (memberName === 'value' || memberName === 'checked' ? elm[memberName] : oldVnodeAttrs[memberName])) {
            set_accessor_1.setAccessor(plt, elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], isSvgMode, newVnode.ishost);
        }
    }
};
