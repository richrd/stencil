"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var load_config_1 = require("../../compiler/config/load-config");
var load_config_2 = require("../load-config");
var renderer_1 = require("../renderer");
function initApp(ssrConfig) {
    if (!ssrConfig.app) {
        throw new Error("missing \"app\" config");
    }
    if (typeof ssrConfig.app.use !== 'function') {
        throw new Error("invalid express app, missing the \"app.use()\" function");
    }
    if (typeof ssrConfig.configPath !== 'string') {
        ssrConfig.configPath = process.cwd();
    }
    // load up the user's config
    // to be passed to the middleware
    var middlewareConfig = {
        config: load_config_2.loadConfig(ssrConfig.configPath)
    };
    // start the ssr middleware
    ssrConfig.app.use(exports.ssrPathRegex, ssrMiddleware(middlewareConfig));
    var wwwOutput = middlewareConfig.config.outputTargets.find(function (o) {
        return o.type === 'www';
    });
    if (!wwwOutput || typeof wwwOutput.dir !== 'string') {
        throw new Error("unable to find www directory to serve static files from");
    }
    return {
        config: middlewareConfig.config,
        logger: middlewareConfig.config.logger,
        wwwDir: wwwOutput.dir,
        destroy: function () {
            middlewareConfig.config.sys.destroy();
        }
    };
}
exports.initApp = initApp;
function ssrMiddleware(middlewareConfig) {
    // load up the config
    var path = require('path');
    var nodeSys = require(path.join(__dirname, '..', 'sys', 'node', 'index.js'));
    middlewareConfig.config = load_config_1.loadConfig(nodeSys.sys, middlewareConfig.config);
    var config = middlewareConfig.config;
    // set the ssr flag
    config.flags = config.flags || {};
    config.flags.ssr = true;
    // create the renderer
    var renderer = new renderer_1.Renderer(middlewareConfig.config);
    // add the destroy fn to the middleware config
    // this will exit all forked workers
    middlewareConfig.destroy = function () {
        middlewareConfig.config.sys.destroy();
    };
    var srcIndexHtml;
    try {
        // load the source index.html
        srcIndexHtml = renderer.fs.readFileSync(config.srcIndexHtml);
    }
    catch (e) {
        config.logger.error("ssrMiddleware, error loading srcIndexHtml", e);
        process.exit(1);
    }
    // middleware fn
    return function (req, res) {
        config.logger.debug("ssr request: " + req.url);
        // hydrate level 4, please!
        renderer.hydrate({
            html: srcIndexHtml,
            req: req
        }).then(function (results) {
            // print out any diagnostics
            config.logger.printDiagnostics(results.diagnostics);
            // respond with the hydrated html
            res.send(results.html);
        });
    };
}
exports.ssrMiddleware = ssrMiddleware;
/**
 * SSR Path Regex matches urls which end with index.html,
 * urls with a trailing /, and urls with no trailing slash,
 * but also do not have a file extension. The following example
 * urls would all match (with or without a querystring):
 *   /index.html
 *   /about
 *   /about/
 *   /
 *
 * The follwing example url would not match:
 *   /image.jpg
 *   /font.woff
 *
 * Please see the unit tests if any changes are required.
 */
exports.ssrPathRegex = /^([^.+]|.html)*(\?.*)?$/i;
