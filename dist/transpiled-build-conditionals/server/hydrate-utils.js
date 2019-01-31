"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalizeHydrateOptions(wwwTarget, opts) {
    var hydrateTarget = Object.assign({}, wwwTarget);
    hydrateTarget.prerenderLocations = wwwTarget.prerenderLocations.map(function (p) { return Object.assign({}, p); });
    hydrateTarget.hydrateComponents = true;
    var req = opts.req;
    if (req && typeof req.get === 'function') {
        // assuming node express request object
        // https://expressjs.com/
        if (!opts.url)
            opts.url = req.protocol + '://' + req.get('host') + req.originalUrl;
        if (!opts.referrer)
            opts.referrer = req.get('referrer');
        if (!opts.userAgent)
            opts.userAgent = req.get('user-agent');
        if (!opts.cookie)
            opts.cookie = req.get('cookie');
    }
    Object.assign(hydrateTarget, opts);
    return hydrateTarget;
}
exports.normalizeHydrateOptions = normalizeHydrateOptions;
function generateHydrateResults(config, hydrateTarget) {
    if (!hydrateTarget.url) {
        hydrateTarget.url = "https://hydrate.stenciljs.com/";
    }
    // https://nodejs.org/api/url.html
    var urlParse = config.sys.url.parse(hydrateTarget.url);
    var hydrateResults = {
        diagnostics: [],
        url: hydrateTarget.url,
        host: urlParse.host,
        hostname: urlParse.hostname,
        port: urlParse.port,
        path: urlParse.path,
        pathname: urlParse.pathname,
        search: urlParse.search,
        query: urlParse.query,
        hash: urlParse.hash,
        html: hydrateTarget.html,
        styles: null,
        anchors: [],
        components: [],
        styleUrls: [],
        scriptUrls: [],
        imgUrls: []
    };
    createConsole(config, hydrateTarget, hydrateResults);
    return hydrateResults;
}
exports.generateHydrateResults = generateHydrateResults;
function createConsole(config, opts, results) {
    var pathname = results.pathname;
    opts.console = opts.console || {};
    if (typeof opts.console.error !== 'function') {
        opts.console.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            results.diagnostics.push({
                level: "error",
                type: "hydrate",
                header: "runtime console.error: " + pathname,
                messageText: args.join(', ')
            });
        };
    }
    if (config.logLevel === 'debug') {
        ['debug', 'info', 'log', 'warn'].forEach(function (level) {
            if (typeof opts.console[level] !== 'function') {
                opts.console[level] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    results.diagnostics.push({
                        level: level,
                        type: 'hydrate',
                        header: "runtime console." + level + ": " + pathname,
                        messageText: args.join(', ')
                    });
                };
            }
        });
    }
}
function normalizeDirection(doc, hydrateTarget) {
    var dir = doc.body.getAttribute('dir');
    if (dir) {
        dir = dir.trim().toLowerCase();
        if (dir.trim().length > 0) {
            console.warn("dir=\"" + dir + "\" should be placed on the <html> instead of <body>");
        }
    }
    if (hydrateTarget.direction) {
        dir = hydrateTarget.direction;
    }
    else {
        dir = doc.documentElement.getAttribute('dir');
    }
    if (dir) {
        dir = dir.trim().toLowerCase();
        if (dir !== 'ltr' && dir !== 'rtl') {
            console.warn("only \"ltr\" and \"rtl\" are valid \"dir\" values on the <html> element");
        }
    }
    if (dir !== 'ltr' && dir !== 'rtl') {
        dir = 'ltr';
    }
    doc.documentElement.dir = dir;
}
exports.normalizeDirection = normalizeDirection;
function normalizeLanguage(doc, hydrateTarget) {
    var lang = doc.body.getAttribute('lang');
    if (lang) {
        lang = lang.trim().toLowerCase();
        if (lang.trim().length > 0) {
            console.warn("lang=\"" + lang + "\" should be placed on <html> instead of <body>");
        }
    }
    if (hydrateTarget.language) {
        lang = hydrateTarget.language;
    }
    else {
        lang = doc.documentElement.getAttribute('lang');
    }
    if (lang) {
        lang = lang.trim().toLowerCase();
        if (lang.length > 0) {
            doc.documentElement.lang = lang;
        }
    }
}
exports.normalizeLanguage = normalizeLanguage;
function collectAnchors(config, doc, results) {
    var anchorElements = doc.querySelectorAll('a');
    for (var i = 0; i < anchorElements.length; i++) {
        var attrs = {};
        var anchorAttrs = anchorElements[i].attributes;
        for (var j = 0; j < anchorAttrs.length; j++) {
            attrs[anchorAttrs[j].nodeName.toLowerCase()] = anchorAttrs[j].nodeValue;
        }
        results.anchors.push(attrs);
    }
    config.logger.debug("optimize " + results.pathname + ", collected anchors: " + results.anchors.length);
}
exports.collectAnchors = collectAnchors;
function generateFailureDiagnostic(diagnostic) {
    return "\n    <div style=\"padding: 20px;\">\n      <div style=\"font-weight: bold;\">" + diagnostic.header + "</div>\n      <div>" + diagnostic.messageText + "</div>\n    </div>\n  ";
}
exports.generateFailureDiagnostic = generateFailureDiagnostic;
