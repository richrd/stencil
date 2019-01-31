"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DEPRECATED "config.collections" since 0.6.0, 2018-02-13
 */
function _deprecatedValidateConfigCollections(config) {
    if (!Array.isArray(config.collections)) {
        return;
    }
    var deprecatedCollections = config.collections;
    if (deprecatedCollections.length > 0) {
        var errorMsg_1 = [
            "As of v0.6.0, \"config.collections\" has been deprecated in favor of standard ES module imports. ",
            "Instead of listing collections within the stencil config, collections should now be ",
            "imported by the app's root component or module. The benefit of this is to not only simplify ",
            "the config by using a standards approach for imports, but to also automatically import the ",
            "collection's types to improve development. Please remove \"config.collections\" ",
            "from the \"stencil.config.js\" file, and add ",
            deprecatedCollections.length === 1 ? "this import " : "these imports ",
            "to your root component or root module:  "
        ];
        deprecatedCollections.forEach(function (collection) {
            errorMsg_1.push("import '" + collection.name + "';  ");
        });
        config.logger.error(errorMsg_1.join(''));
    }
}
exports._deprecatedValidateConfigCollections = _deprecatedValidateConfigCollections;
