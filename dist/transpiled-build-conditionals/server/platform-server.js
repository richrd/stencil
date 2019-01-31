"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_api_1 = require("../renderer/dom-api");
var queue_server_1 = require("./queue-server");
var patch_1 = require("../renderer/vdom/patch");
var constants_1 = require("../util/constants");
var listeners_1 = require("../core/listeners");
var cmp_meta_1 = require("../util/cmp-meta");
var app_file_naming_1 = require("../compiler/app/app-file-naming");
var h_1 = require("../renderer/vdom/h");
var component_on_ready_1 = require("../core/component-on-ready");
var helpers_1 = require("../util/helpers");
var dom_api_server_1 = require("./dom-api-server");
var proxy_controller_1 = require("../core/proxy-controller");
var update_1 = require("../core/update");
var server_styles_1 = require("./server-styles");
var helpers_2 = require("../util/helpers");
function createPlatformServer(config, outputTarget, win, doc, App, cmpRegistry, diagnostics, isPrerender, compilerCtx) {
    var loadedBundles = {};
    var appliedStyleIds = new Set();
    var controllerComponents = {};
    var domApi = dom_api_1.createDomApi(App, win, doc);
    var perf = { mark: helpers_1.noop, measure: helpers_1.noop };
    // init build context
    compilerCtx = compilerCtx || {};
    // the root <html> element is always the top level registered component
    cmpRegistry = Object.assign({ 'html': {} }, cmpRegistry);
    // initialize Core global object
    var Context = {};
    Context.enableListener = function (instance, eventName, enabled, attachTo, passive) { return listeners_1.enableEventListener(plt, instance, eventName, enabled, attachTo, passive); };
    Context.emit = function (elm, eventName, data) { return domApi.$dispatchEvent(elm, Context.eventNameFn ? Context.eventNameFn(eventName) : eventName, data); };
    Context.isClient = false;
    Context.isServer = true;
    Context.isPrerender = isPrerender;
    Context.window = win;
    Context.location = win.location;
    Context.document = doc;
    // add the Core global to the window context
    // Note: "Core" is not on the window context on the client-side
    win.Context = Context;
    // add the h() fn to the app's global namespace
    App.h = h_1.h;
    App.Context = Context;
    // add the app's global to the window context
    win[config.namespace] = App;
    var appBuildDir = app_file_naming_1.getAppBuildDir(config, outputTarget);
    Context.resourcesUrl = Context.publicPath = appBuildDir;
    // create the sandboxed context with a new instance of a V8 Context
    // V8 Context provides an isolated global environment
    config.sys.vm.createContext(compilerCtx, outputTarget, win);
    // execute the global scripts (if there are any)
    runGlobalScripts();
    // internal id increment for unique ids
    var ids = 0;
    // create the platform api which is used throughout common core code
    var plt = {
        attachStyles: helpers_1.noop,
        defineComponent: defineComponent,
        domApi: domApi,
        emitEvent: Context.emit,
        getComponentMeta: getComponentMeta,
        getContextItem: getContextItem,
        isDefinedComponent: isDefinedComponent,
        onError: onError,
        activeRender: false,
        isAppLoaded: false,
        nextId: function () { return config.namespace + (ids++); },
        propConnect: propConnect,
        queue: (Context.queue = queue_server_1.createQueueServer()),
        requestBundle: requestBundle,
        tmpDisconnected: false,
        ancestorHostElementMap: new WeakMap(),
        componentAppliedStyles: new WeakMap(),
        hasConnectedMap: new WeakMap(),
        hasListenersMap: new WeakMap(),
        isCmpLoaded: new WeakMap(),
        isCmpReady: new WeakMap(),
        hostElementMap: new WeakMap(),
        hostSnapshotMap: new WeakMap(),
        instanceMap: new WeakMap(),
        isDisconnectedMap: new WeakMap(),
        isQueuedForUpdate: new WeakMap(),
        onReadyCallbacksMap: new WeakMap(),
        queuedEvents: new WeakMap(),
        vnodeMap: new WeakMap(),
        valuesMap: new WeakMap(),
        processingCmp: new Set(),
        onAppReadyCallbacks: []
    };
    // create a method that returns a promise
    // which gets resolved when the app's queue is empty
    // and app is idle, works for both initial load and updates
    App.onReady = function () { return new Promise(function (resolve) { return plt.queue.write(function () { return plt.processingCmp.size ? plt.onAppReadyCallbacks.push(resolve) : resolve(); }); }); };
    // patch dom api like createElement()
    dom_api_server_1.patchDomApi(config, plt, domApi, perf);
    // create the renderer which will be used to patch the vdom
    plt.render = patch_1.createRendererPatch(plt, domApi);
    // patch the componentOnReady fn
    component_on_ready_1.initCoreComponentOnReady(plt, App);
    // setup the root node of all things
    // which is the mighty <html> tag
    var rootElm = domApi.$doc.documentElement;
    rootElm['s-ld'] = [];
    rootElm['s-rn'] = true;
    rootElm['s-init'] = function appLoadedCallback() {
        plt.isCmpReady.set(rootElm, true);
        appLoaded();
    };
    function appLoaded(failureDiagnostic) {
        if (plt.isCmpReady.has(rootElm) || failureDiagnostic) {
            // the root node has loaded
            plt.onAppLoad && plt.onAppLoad(rootElm, failureDiagnostic);
        }
    }
    function getComponentMeta(elm) {
        // registry tags are always lower-case
        return cmpRegistry[elm.nodeName.toLowerCase()];
    }
    function defineComponent(cmpMeta) {
        // default mode and color props
        cmpRegistry[cmpMeta.tagNameMeta] = cmpMeta;
    }
    function setLoadedBundle(bundleId, value) {
        loadedBundles[bundleId] = value;
    }
    function getLoadedBundle(bundleId) {
        if (bundleId == null) {
            return null;
        }
        return loadedBundles[bundleId.replace(/^\.\//, '')];
    }
    function isLoadedBundle(id) {
        if (id === 'exports' || id === 'require') {
            return true;
        }
        return !!getLoadedBundle(id);
    }
    /**
     * Execute a bundle queue item
     * @param name
     * @param deps
     * @param callback
     */
    function execBundleCallback(name, deps, callback) {
        var bundleExports = {};
        try {
            callback.apply(null, deps.map(function (d) {
                if (d === 'exports')
                    return bundleExports;
                if (d === 'require')
                    return userRequire;
                return getLoadedBundle(d);
            }));
        }
        catch (e) {
            onError(e, 1 /* LoadBundleError */, null, true);
        }
        // If name is undefined then this callback was fired by component callback
        if (name === undefined) {
            return;
        }
        setLoadedBundle(name, bundleExports);
        // If name contains chunk then this callback was associated with a dependent bundle loading
        // let's add a reference to the constructors on each components metadata
        // each key in moduleImports is a PascalCased tag name
        if (!name.startsWith('chunk')) {
            Object.keys(bundleExports).forEach(function (pascalCasedTagName) {
                var normalizedTagName = pascalCasedTagName.replace(/-/g, '').toLowerCase();
                var registryTags = Object.keys(cmpRegistry);
                for (var i = 0; i < registryTags.length; i++) {
                    var normalizedRegistryTag = registryTags[i].replace(/-/g, '').toLowerCase();
                    if (normalizedRegistryTag === normalizedTagName) {
                        var cmpMeta = cmpRegistry[helpers_2.toDashCase(pascalCasedTagName)];
                        if (cmpMeta) {
                            // connect the component's constructor to its metadata
                            var componentConstructor = bundleExports[pascalCasedTagName];
                            if (!cmpMeta.componentConstructor) {
                                cmp_meta_1.fillCmpMetaFromConstructor(componentConstructor, cmpMeta);
                                if (!cmpMeta.componentConstructor) {
                                    cmpMeta.componentConstructor = componentConstructor;
                                }
                            }
                            server_styles_1.serverInitStyle(domApi, appliedStyleIds, componentConstructor);
                        }
                        break;
                    }
                }
            });
        }
    }
    /**
     * This function is called anytime a JS file is loaded
     */
    function loadBundle(bundleId, _a, importer) {
        var dependentsList = _a.slice(0);
        var missingDependents = dependentsList.filter(function (d) { return !isLoadedBundle(d); });
        missingDependents.forEach(function (d) {
            var fileName = d.replace('.js', '.es5.js');
            loadFile(fileName);
        });
        execBundleCallback(bundleId, dependentsList, importer);
    }
    App.loadBundle = loadBundle;
    function isDefinedComponent(elm) {
        return !!(cmpRegistry[elm.tagName.toLowerCase()]);
    }
    function userRequire(ids, resolve) {
        loadBundle(undefined, ids, resolve);
    }
    plt.attachStyles = function (plt, _domApi, cmpMeta, hostElm) {
        server_styles_1.serverAttachStyles(plt, appliedStyleIds, cmpMeta, hostElm);
    };
    // This is executed by the component's connected callback.
    function requestBundle(cmpMeta, elm) {
        // set the "mode" property
        if (!elm.mode) {
            // looks like mode wasn't set as a property directly yet
            // first check if there's an attribute
            // next check the app's global
            elm.mode = domApi.$getAttribute(elm, 'mode') || Context.mode;
        }
        // It is possible the data was loaded from an outside source like tests
        if (cmpRegistry[cmpMeta.tagNameMeta].componentConstructor) {
            server_styles_1.serverInitStyle(domApi, appliedStyleIds, cmpRegistry[cmpMeta.tagNameMeta].componentConstructor);
            update_1.queueUpdate(plt, elm, perf);
        }
        else {
            var bundleId = (typeof cmpMeta.bundleIds === 'string') ?
                cmpMeta.bundleIds :
                cmpMeta.bundleIds[elm.mode];
            if (isLoadedBundle(bundleId)) {
                // sweet, we've already loaded this bundle
                update_1.queueUpdate(plt, elm, perf);
            }
            else {
                var fileName = getComponentBundleFilename(cmpMeta, elm.mode);
                loadFile(fileName);
            }
        }
    }
    function loadFile(fileName) {
        var jsFilePath = config.sys.path.join(appBuildDir, fileName);
        var jsCode = compilerCtx.fs.readFileSync(jsFilePath);
        config.sys.vm.runInContext(jsCode, win);
    }
    function runGlobalScripts() {
        if (!compilerCtx || !compilerCtx.appFiles || !compilerCtx.appFiles.global) {
            return;
        }
        config.sys.vm.runInContext(compilerCtx.appFiles.global, win);
    }
    function onError(err, type, elm, appFailure) {
        var diagnostic = {
            type: 'runtime',
            header: 'Runtime error detected',
            level: 'error',
            messageText: err ? err.message ? err.message : err.toString() : ''
        };
        if (err && err.stack) {
            diagnostic.messageText += '\n' + err.stack;
            diagnostic.messageText = diagnostic.messageText.trim();
        }
        switch (type) {
            case 1 /* LoadBundleError */:
                diagnostic.header += ' while loading bundle';
                break;
            case 2 /* QueueEventsError */:
                diagnostic.header += ' while running initial events';
                break;
            case 3 /* WillLoadError */:
                diagnostic.header += ' during componentWillLoad()';
                break;
            case 4 /* DidLoadError */:
                diagnostic.header += ' during componentDidLoad()';
                break;
            case 7 /* InitInstanceError */:
                diagnostic.header += ' while initializing instance';
                break;
            case 8 /* RenderError */:
                diagnostic.header += ' while rendering';
                break;
            case 6 /* DidUpdateError */:
                diagnostic.header += ' while updating';
                break;
        }
        if (elm && elm.tagName) {
            diagnostic.header += ': ' + elm.tagName.toLowerCase();
        }
        diagnostics.push(diagnostic);
        if (appFailure) {
            appLoaded(diagnostic);
        }
    }
    function propConnect(ctrlTag) {
        return proxy_controller_1.proxyController(domApi, controllerComponents, ctrlTag);
    }
    function getContextItem(contextKey) {
        return Context[contextKey];
    }
    return plt;
}
exports.createPlatformServer = createPlatformServer;
function getComponentBundleFilename(cmpMeta, modeName) {
    var bundleId = (typeof cmpMeta.bundleIds === 'string') ?
        cmpMeta.bundleIds :
        (cmpMeta.bundleIds[modeName] || cmpMeta.bundleIds[constants_1.DEFAULT_STYLE_MODE]);
    if (cmpMeta.encapsulationMeta === 2 /* ScopedCss */ || cmpMeta.encapsulationMeta === 1 /* ShadowDom */) {
        bundleId += '.sc';
    }
    // server-side always uses es5 and jsonp callback modules
    bundleId += '.es5.entry.js';
    return bundleId;
}
exports.getComponentBundleFilename = getComponentBundleFilename;
