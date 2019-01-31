"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UsedSelectors = /** @class */ (function () {
    function UsedSelectors(elm) {
        this.tags = [];
        this.classNames = [];
        this.ids = [];
        this.attrs = [];
        this.collectSelectors(elm);
    }
    UsedSelectors.prototype.collectSelectors = function (elm) {
        var i;
        if (elm && elm.tagName) {
            // tags
            var tagName = elm.tagName.toLowerCase();
            if (!this.tags.includes(tagName)) {
                this.tags.push(tagName);
            }
            // classes
            var classList = elm.classList;
            for (i = 0; i < classList.length; i++) {
                var className = classList.item(i);
                if (!this.classNames.includes(className)) {
                    this.classNames.push(className);
                }
            }
            // attributes
            var attributes = elm.attributes;
            for (i = 0; i < attributes.length; i++) {
                var attr = attributes.item(i);
                var attrName = attr.name.toLowerCase();
                if (!attrName || attrName === 'class' || attrName === 'id' || attrName === 'style')
                    continue;
                if (!this.attrs.includes(attrName)) {
                    this.attrs.push(attrName);
                }
            }
            // ids
            var idValue = elm.getAttribute('id');
            if (idValue) {
                idValue = idValue.trim();
                if (idValue && !this.ids.includes(idValue)) {
                    this.ids.push(idValue);
                }
            }
            // drill down
            for (i = 0; i < elm.children.length; i++) {
                this.collectSelectors(elm.children[i]);
            }
        }
    };
    return UsedSelectors;
}());
exports.UsedSelectors = UsedSelectors;
