"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CSS stringify adopted from rework/css by
 * TJ Holowaychuk (@tj)
 * Licensed under the MIT License
 * https://github.com/reworkcss/css/blob/master/LICENSE
 */
var get_selectors_1 = require("./get-selectors");
var StringifyCss = /** @class */ (function () {
    function StringifyCss(opts) {
        this.usedSelectors = opts.usedSelectors;
    }
    /**
     * Visit `node`.
     */
    StringifyCss.prototype.visit = function (node) {
        return this[node.type](node);
    };
    /**
     * Map visit over array of `nodes`, optionally using a `delim`
     */
    StringifyCss.prototype.mapVisit = function (nodes, delim) {
        var buf = '';
        delim = delim || '';
        for (var i = 0, length = nodes.length; i < length; i++) {
            buf += this.visit(nodes[i]);
            if (delim && i < length - 1)
                buf += delim;
        }
        return buf;
    };
    /**
     * Compile `node`.
     */
    StringifyCss.prototype.compile = function (node) {
        return node.stylesheet
            .rules.map(this.visit, this)
            .join('');
    };
    StringifyCss.prototype.comment = function () {
        return '';
    };
    /**
     * Visit import node.
     */
    StringifyCss.prototype.import = function (node) {
        return '@import ' + node.import + ';';
    };
    /**
     * Visit media node.
     */
    StringifyCss.prototype.media = function (node) {
        var mediaCss = this.mapVisit(node.rules);
        if (mediaCss === '') {
            return '';
        }
        return '@media ' + node.media + '{' + this.mapVisit(node.rules) + '}';
    };
    /**
     * Visit document node.
     */
    StringifyCss.prototype.document = function (node) {
        var documentCss = this.mapVisit(node.rules);
        if (documentCss === '') {
            return '';
        }
        var doc = '@' + (node.vendor || '') + 'document ' + node.document;
        return doc + '{' + documentCss + '}';
    };
    /**
     * Visit charset node.
     */
    StringifyCss.prototype.charset = function (node) {
        return '@charset ' + node.charset + ';';
    };
    /**
     * Visit namespace node.
     */
    StringifyCss.prototype.namespace = function (node) {
        return '@namespace ' + node.namespace + ';';
    };
    /**
     * Visit supports node.
     */
    StringifyCss.prototype.supports = function (node) {
        var supportsCss = this.mapVisit(node.rules);
        if (supportsCss === '') {
            return '';
        }
        return '@supports ' + node.supports + '{' + supportsCss + '}';
    };
    /**
     * Visit keyframes node.
     */
    StringifyCss.prototype.keyframes = function (node) {
        var keyframesCss = this.mapVisit(node.keyframes);
        if (keyframesCss === '') {
            return '';
        }
        return '@' + (node.vendor || '') + 'keyframes ' + node.name + '{' + keyframesCss + '}';
    };
    /**
     * Visit keyframe node.
     */
    StringifyCss.prototype.keyframe = function (node) {
        var decls = node.declarations;
        return node.values.join(',') + '{' + this.mapVisit(decls) + '}';
    };
    /**
     * Visit page node.
     */
    StringifyCss.prototype.page = function (node) {
        var sel = node.selectors.length
            ? node.selectors.join(', ')
            : '';
        return '@page ' + sel + '{' + this.mapVisit(node.declarations) + '}';
    };
    /**
     * Visit font-face node.
     */
    StringifyCss.prototype['font-face'] = function (node) {
        var fontCss = this.mapVisit(node.declarations);
        if (fontCss === '') {
            return '';
        }
        return '@font-face{' + fontCss + '}';
    };
    /**
     * Visit host node.
     */
    StringifyCss.prototype.host = function (node) {
        return '@host{' + this.mapVisit(node.rules) + '}';
    };
    /**
     * Visit custom-media node.
     */
    StringifyCss.prototype['custom-media'] = function (node) {
        return '@custom-media ' + node.name + ' ' + node.media + ';';
    };
    /**
     * Visit rule node.
     */
    StringifyCss.prototype.rule = function (node) {
        var decls = node.declarations;
        if (!decls.length)
            return '';
        var i, j;
        for (i = node.selectors.length - 1; i >= 0; i--) {
            var sel = get_selectors_1.getSelectors(node.selectors[i]);
            if (this.usedSelectors) {
                var include = true;
                // classes
                var jlen = sel.classNames.length;
                if (jlen > 0) {
                    for (j = 0; j < jlen; j++) {
                        if (this.usedSelectors.classNames.indexOf(sel.classNames[j]) === -1) {
                            include = false;
                            break;
                        }
                    }
                }
                // tags
                if (include) {
                    jlen = sel.tags.length;
                    if (jlen > 0) {
                        for (j = 0; j < jlen; j++) {
                            if (this.usedSelectors.tags.indexOf(sel.tags[j]) === -1) {
                                include = false;
                                break;
                            }
                        }
                    }
                }
                // attrs
                if (include) {
                    jlen = sel.attrs.length;
                    if (jlen > 0) {
                        for (j = 0; j < jlen; j++) {
                            if (this.usedSelectors.attrs.indexOf(sel.attrs[j]) === -1) {
                                include = false;
                                break;
                            }
                        }
                    }
                }
                // ids
                if (include) {
                    jlen = sel.ids.length;
                    if (jlen > 0) {
                        for (j = 0; j < jlen; j++) {
                            if (this.usedSelectors.ids.indexOf(sel.ids[j]) === -1) {
                                include = false;
                                break;
                            }
                        }
                    }
                }
                if (!include) {
                    node.selectors.splice(i, 1);
                }
            }
        }
        if (node.selectors.length === 0)
            return '';
        return node.selectors + "{" + this.mapVisit(decls) + "}";
    };
    /**
     * Visit declaration node.
     */
    StringifyCss.prototype.declaration = function (node) {
        return node.property + ':' + node.value + ';';
    };
    return StringifyCss;
}());
exports.StringifyCss = StringifyCss;
