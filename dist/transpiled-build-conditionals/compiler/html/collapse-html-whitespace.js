"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function collapseHtmlWhitepace(node) {
    // this isn't about reducing HTML filesize (cuz it doesn't really matter after gzip)
    // this is more about having many less nodes for the client side to
    // have to climb through while it's creating vnodes from this HTML
    if (node.nodeType === 1 /* ElementNode */) {
        var attributes = node.attributes;
        for (var j = attributes.length - 1; j >= 0; j--) {
            var attr = attributes.item(j);
            if (!attr.value) {
                if (SAFE_TO_REMOVE_EMPTY_ATTRS.includes(attr.name)) {
                    node.removeAttribute(attr.name);
                }
            }
        }
    }
    if (WHITESPACE_SENSITIVE_TAGS.includes(node.nodeName)) {
        return;
    }
    var lastWhitespaceTextNode = null;
    for (var i = node.childNodes.length - 1; i >= 0; i--) {
        var childNode = node.childNodes[i];
        if (childNode.nodeType === 3 /* TextNode */ || childNode.nodeType === 8 /* CommentNode */) {
            childNode.nodeValue = childNode.nodeValue.replace(REDUCE_WHITESPACE_REGEX, ' ');
            if (childNode.nodeValue === ' ') {
                if (lastWhitespaceTextNode === null) {
                    childNode.nodeValue = ' ';
                    lastWhitespaceTextNode = childNode;
                }
                else {
                    childNode.parentNode.removeChild(childNode);
                }
                continue;
            }
        }
        else if (childNode.childNodes) {
            collapseHtmlWhitepace(childNode);
        }
        lastWhitespaceTextNode = null;
    }
}
exports.collapseHtmlWhitepace = collapseHtmlWhitepace;
var REDUCE_WHITESPACE_REGEX = /\s\s+/g;
var WHITESPACE_SENSITIVE_TAGS = ['PRE', 'SCRIPT', 'STYLE', 'TEXTAREA'];
var SAFE_TO_REMOVE_EMPTY_ATTRS = [
    'class',
    'style',
];
