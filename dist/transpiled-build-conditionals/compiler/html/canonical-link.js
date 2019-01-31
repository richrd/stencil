"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateCanonicalLink(config, doc, windowLocationPath) {
    // https://webmasters.googleblog.com/2009/02/specify-your-canonical.html
    // <link rel="canonical" href="http://www.example.com/product.php?item=swedish-fish" />
    if (typeof windowLocationPath !== 'string') {
        return;
    }
    var canonicalLink = doc.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        return;
    }
    var existingHref = canonicalLink.getAttribute('href');
    var updatedRref = updateCanonicalLinkHref(config, existingHref, windowLocationPath);
    canonicalLink.setAttribute('href', updatedRref);
}
exports.updateCanonicalLink = updateCanonicalLink;
function updateCanonicalLinkHref(config, href, windowLocationPath) {
    var parsedUrl = config.sys.url.parse(windowLocationPath);
    if (typeof href === 'string') {
        href = href.trim();
        if (href.endsWith('/')) {
            href = href.substr(0, href.length - 1);
        }
    }
    else {
        href = '';
    }
    return "" + href + parsedUrl.path;
}
exports.updateCanonicalLinkHref = updateCanonicalLinkHref;
