"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parse_css_1 = require("./parse-css");
var stringify_css_1 = require("./stringify-css");
function removeUnusedStyles(config, usedSelectors, cssContent, diagnostics) {
    var cleanedCss = cssContent;
    try {
        // parse the css from being applied to the document
        var cssAst = parse_css_1.parseCss(config, cssContent);
        if (cssAst.stylesheet.diagnostics.length) {
            cssAst.stylesheet.diagnostics.forEach(function (d) {
                diagnostics.push(d);
            });
            return cleanedCss;
        }
        try {
            // convert the parsed css back into a string
            // but only keeping what was found in our active selectors
            var stringify = new stringify_css_1.StringifyCss({ usedSelectors: usedSelectors });
            cleanedCss = stringify.compile(cssAst);
        }
        catch (e) {
            diagnostics.push({
                level: 'error',
                type: 'css',
                header: 'CSS Stringify',
                messageText: e
            });
        }
    }
    catch (e) {
        diagnostics.push({
            level: 'error',
            type: 'css',
            header: 'CSS Parse',
            messageText: e
        });
    }
    return cleanedCss;
}
exports.removeUnusedStyles = removeUnusedStyles;
