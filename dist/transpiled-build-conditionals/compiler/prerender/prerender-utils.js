"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
function normalizePrerenderLocation(config, outputTarget, windowLocationHref, url) {
    var prerenderLocation = null;
    try {
        if (typeof url !== 'string') {
            return null;
        }
        // remove any quotes that somehow got in the href
        url = url.replace(/\'|\"/g, '');
        // parse the <a href> passed in
        var hrefParseUrl = config.sys.url.parse(url);
        // don't bother for basically empty <a> tags
        if (!hrefParseUrl.pathname) {
            return null;
        }
        // parse the window.location
        var windowLocationUrl = config.sys.url.parse(windowLocationHref);
        // urls must be on the same host
        // but only check they're the same host when the href has a host
        if (hrefParseUrl.hostname && hrefParseUrl.hostname !== windowLocationUrl.hostname) {
            return null;
        }
        // convert it back to a nice in pretty path
        prerenderLocation = {
            url: config.sys.url.resolve(windowLocationHref, url)
        };
        var normalizedUrl = config.sys.url.parse(prerenderLocation.url);
        normalizedUrl.hash = null;
        if (!outputTarget.prerenderPathQuery) {
            normalizedUrl.search = null;
        }
        prerenderLocation.url = config.sys.url.format(normalizedUrl);
        prerenderLocation.path = config.sys.url.parse(prerenderLocation.url).path;
        if (!prerenderLocation.path.startsWith(outputTarget.baseUrl)) {
            if (prerenderLocation.path !== outputTarget.baseUrl.substr(0, outputTarget.baseUrl.length - 1)) {
                return null;
            }
        }
        var filter = (typeof outputTarget.prerenderFilter === 'function') ? outputTarget.prerenderFilter : prerenderFilter;
        var isValidUrl = filter(hrefParseUrl);
        if (!isValidUrl) {
            return null;
        }
        if (hrefParseUrl.hash && outputTarget.prerenderPathHash) {
            prerenderLocation.url += hrefParseUrl.hash;
            prerenderLocation.path += hrefParseUrl.hash;
        }
    }
    catch (e) {
        config.logger.error("normalizePrerenderLocation", e);
        return null;
    }
    return prerenderLocation;
}
exports.normalizePrerenderLocation = normalizePrerenderLocation;
function prerenderFilter(url) {
    var parts = url.pathname.split('/');
    var basename = parts[parts.length - 1];
    return !basename.includes('.');
}
function crawlAnchorsForNextUrls(config, outputTarget, prerenderQueue, windowLocationHref, anchors) {
    anchors && anchors.forEach(function (anchor) {
        if (isValidCrawlableAnchor(anchor)) {
            addLocationToProcess(config, outputTarget, windowLocationHref, prerenderQueue, anchor.href);
        }
    });
}
exports.crawlAnchorsForNextUrls = crawlAnchorsForNextUrls;
function isValidCrawlableAnchor(anchor) {
    if (!anchor) {
        return false;
    }
    if (typeof anchor.href !== 'string' || anchor.href.trim() === '' || anchor.href.trim() === '#') {
        return false;
    }
    if (typeof anchor.target === 'string' && anchor.target.trim().toLowerCase() !== '_self') {
        return false;
    }
    return true;
}
exports.isValidCrawlableAnchor = isValidCrawlableAnchor;
function addLocationToProcess(config, outputTarget, windowLocationHref, prerenderQueue, locationUrl) {
    var prerenderLocation = normalizePrerenderLocation(config, outputTarget, windowLocationHref, locationUrl);
    if (!prerenderLocation || prerenderQueue.some(function (p) { return p.url === prerenderLocation.url; })) {
        // either it's not a good location to prerender
        // or we've already got it in the queue
        return;
    }
    // set that this location is pending to be prerendered
    prerenderLocation.status = 'pending';
    // add this to our queue of locations to prerender
    prerenderQueue.push(prerenderLocation);
}
function getPrerenderQueue(config, outputTarget) {
    var prerenderHost = "http://prerender.stenciljs.com";
    var prerenderQueue = [];
    if (Array.isArray(outputTarget.prerenderLocations)) {
        outputTarget.prerenderLocations.forEach(function (prerenderLocation) {
            addLocationToProcess(config, outputTarget, prerenderHost, prerenderQueue, prerenderLocation.path);
        });
    }
    return prerenderQueue;
}
exports.getPrerenderQueue = getPrerenderQueue;
function getWritePathFromUrl(config, outputTarget, url) {
    var parsedUrl = config.sys.url.parse(url);
    var pathName = parsedUrl.pathname;
    if (pathName.startsWith(outputTarget.baseUrl)) {
        pathName = pathName.substring(outputTarget.baseUrl.length);
    }
    else if (outputTarget.baseUrl === pathName + '/') {
        pathName = '/';
    }
    // figure out the directory where this file will be saved
    var dir = util_1.pathJoin(config, outputTarget.dir, pathName);
    // create the full path where this will be saved (normalize for windowz)
    var filePath;
    if (dir + '/' === outputTarget.dir + '/') {
        // this is the root of the output target directory
        // use the configured index.html
        var basename = outputTarget.indexHtml.substr(dir.length + 1);
        filePath = util_1.pathJoin(config, dir, basename);
    }
    else {
        filePath = util_1.pathJoin(config, dir, "index.html");
    }
    return filePath;
}
exports.getWritePathFromUrl = getWritePathFromUrl;
