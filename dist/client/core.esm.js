

export function applyPolyfills(window) {
  if (_BUILD_.polyfills) {
    /*!
    es6-promise - a tiny implementation of Promises/A+.
    Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
    Licensed under MIT license
    See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
    v4.2.4+314e4831
    */
   (window.ES6Promise=function(){function t(){var t=setTimeout;return function(){return t(r,1)}}function r(){for(var t=0;t<y;t+=2)(0,C[t])(C[t+1]),C[t]=void 0,C[t+1]=void 0;y=0}function e(t,r){var e=this,n=new this.constructor(o);void 0===n[O]&&_(n);var i=e._state;if(i){var s=arguments[i-1];g(function(){return v(i,n,s,e._result)})}else l(e,n,t,r);return n}function n(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var r=new this(o);return u(r,t),r}function o(){}function i(t){try{return t.then}catch(t){return q.error=t,q}}function s(t,r,o){r.constructor===t.constructor&&o===e&&r.constructor.resolve===n?function(t,r){r._state===x?a(t,r._result):r._state===F?f(t,r._result):l(r,void 0,function(r){return u(t,r)},function(r){return f(t,r)})}(t,r):o===q?(f(t,q.error),q.error=null):void 0===o?a(t,r):"function"==typeof o?function(t,r,e){g(function(t){var n=!1,o=function(t,r,e,n){try{t.call(r,e,n)}catch(t){return t}}(e,r,function(e){n||(n=!0,r!==e?u(t,e):a(t,e))},function(r){n||(n=!0,f(t,r))},t._label);!n&&o&&(n=!0,f(t,o))},t)}(t,r,o):a(t,r)}function u(t,r){if(t===r)f(t,new TypeError("cannot resolve promise w/ itself"));else{var e=typeof r;null===r||"object"!==e&&"function"!==e?a(t,r):s(t,r,i(r))}}function c(t){t._onerror&&t._onerror(t._result),h(t)}function a(t,r){t._state===P&&(t._result=r,t._state=x,0!==t._subscribers.length&&g(h,t))}function f(t,r){t._state===P&&(t._state=F,t._result=r,g(c,t))}function l(t,r,e,n){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=r,o[i+x]=e,o[i+F]=n,0===i&&t._state&&g(h,t)}function h(t){var r=t._subscribers,e=t._state;if(0!==r.length){for(var n,o,i=t._result,s=0;s<r.length;s+=3)n=r[s],o=r[s+e],n?v(e,n,o,i):o(i);t._subscribers.length=0}}function v(t,r,e,n){var o="function"==typeof e,i=void 0,s=void 0,c=void 0,l=void 0;if(o){try{i=e(n)}catch(t){q.error=t,i=q}if(i===q?(l=!0,s=i.error,i.error=null):c=!0,r===i)return void f(r,new TypeError("Cannot return same promise"))}else i=n,c=!0;r._state===P&&(o&&c?u(r,i):l?f(r,s):t===x?a(r,i):t===F&&f(r,i))}function _(t){t[O]=U++,t._state=void 0,t._result=void 0,t._subscribers=[]}var p,d=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},y=0,w=void 0,m=void 0,g=function(t,e){C[y]=t,C[y+1]=e,2===(y+=2)&&(m?m(r):T())},b=(p="undefined"!=typeof window?window:void 0)||{},A=b.MutationObserver||b.WebKitMutationObserver;b="undefined"==typeof self;var E,S,M,j="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,C=Array(1e3),T=void 0;T=A?(E=0,S=new A(r),M=document.createTextNode(""),S.observe(M,{characterData:!0}),function(){M.data=E=++E%2}):j?function(){var t=new MessageChannel;return t.port1.onmessage=r,function(){return t.port2.postMessage(0)}}():void 0===p&&"function"==typeof require?function(){try{var e=Function("return this")().require("vertx");return void 0!==(w=e.runOnLoop||e.runOnContext)?function(){w(r)}:t()}catch(r){return t()}}():t();var O=Math.random().toString(36).substring(2),P=void 0,x=1,F=2,q={error:null},U=0,D=function(){function t(t,r){this._instanceConstructor=t,this.promise=new t(o),this.promise[O]||_(this.promise),d(r)?(this._remaining=this.length=r.length,this._result=Array(this.length),0===this.length?a(this.promise,this._result):(this.length=this.length||0,this._enumerate(r),0===this._remaining&&a(this.promise,this._result))):f(this.promise,Error("Array Methods must be provided an Array"))}return t.prototype._enumerate=function(t){for(var r=0;this._state===P&&r<t.length;r++)this._eachEntry(t[r],r)},t.prototype._eachEntry=function(t,r){var u=this._instanceConstructor,c=u.resolve;c===n?(c=i(t))===e&&t._state!==P?this._settledAt(t._state,r,t._result):"function"!=typeof c?(this._remaining--,this._result[r]=t):u===K?(s(u=new u(o),t,c),this._willSettleAt(u,r)):this._willSettleAt(new u(function(r){return r(t)}),r):this._willSettleAt(c(t),r)},t.prototype._settledAt=function(t,r,e){var n=this.promise;n._state===P&&(this._remaining--,t===F?f(n,e):this._result[r]=e),0===this._remaining&&a(n,this._result)},t.prototype._willSettleAt=function(t,r){var e=this;l(t,void 0,function(t){return e._settledAt(x,r,t)},function(t){return e._settledAt(F,r,t)})},t}(),K=function(){function t(r){if(this[O]=U++,this._result=this._state=void 0,this._subscribers=[],o!==r){if("function"!=typeof r)throw new TypeError("Must pass a resolver fn as 1st arg");if(!(this instanceof t))throw new TypeError("Failed to construct 'Promise': Use the 'new' operator.");!function(t,r){try{r(function(r){u(t,r)},function(r){f(t,r)})}catch(r){f(t,r)}}(this,r)}}return t.prototype.catch=function(t){return this.then(null,t)},t.prototype.finally=function(t){var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},t}();return K.prototype.then=e,K.all=function(t){return new D(this,t).promise},K.race=function(t){var r=this;return d(t)?new r(function(e,n){for(var o=t.length,i=0;i<o;i++)r.resolve(t[i]).then(e,n)}):new r(function(t,r){return r(new TypeError("Must pass array to race"))})},K.resolve=n,K.reject=function(t){var r=new this(o);return f(r,t),r},K._setScheduler=function(t){m=t},K._setAsap=function(t){g=t},K._asap=g,K.polyfill=function(){var t=void 0;if("undefined"!=typeof global)t=global;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(t){throw Error("polyfill failed")}var r=t.Promise;if(r){var e=null;try{e=Object.prototype.toString.call(r.resolve())}catch(t){}if("[object Promise]"===e&&!r.cast)return}t.Promise=K},K.Promise=K,K.polyfill(),K}());

    const promises = [];

    if (!window.customElements || (window.Element && (!window.Element.prototype.closest || !window.Element.prototype.matches || !window.Element.prototype.remove))) {
      promises.push(import('./polyfills/dom.js'));
    }

    if ('function' !== typeof Object.assign || !Object.entries) {
      promises.push(import('./polyfills/object.js'));
    }

    if (!Array.prototype.find || !Array.prototype.includes) {
      promises.push(import('./polyfills/array.js'));
    }

    if (!String.prototype.startsWith || !String.prototype.endsWith) {
      promises.push(import('./polyfills/string.js'));
    }

    if (!window.fetch) {
      promises.push(import('./polyfills/fetch.js'));
    }

    if (typeof WeakMap == 'undefined' || !(window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--c)'))) {
      promises.push(import('./polyfills/css-shim.js'));
    }

    function checkIfURLIsSupported() {
      try {
        var u = new URL('b', 'http://a');
        u.pathname = 'c%20d';
        return (u.href === 'http://a/c%20d') && u.searchParams;
      } catch(e) {
        return false;
      }
    }
    if (!checkIfURLIsSupported) {
      promises.push(import('./polyfills/url.js'));
    }

    return Promise.all(promises).then(function(results) {
      results.forEach(function(polyfillModule) {
        try {
          polyfillModule.applyPolyfill(window, window.document);
        } catch (e) {
          console.error(e);
        }
      });
    });
  } else {
    return Promise.resolve();
  }
}

function createComponentOnReadyPrototype(win, namespace, HTMLElementPrototype) {
    (win['s-apps'] = win['s-apps'] || []).push(namespace);
    if (!HTMLElementPrototype.componentOnReady) {
        HTMLElementPrototype.componentOnReady = function componentOnReady() {
            /*tslint:disable*/
            var elm = this;
            function executor(resolve) {
                if (elm.nodeName.indexOf('-') > 0) {
                    // window hasn't loaded yet and there's a
                    // good chance this is a custom element
                    var apps = win['s-apps'];
                    var appsReady = 0;
                    // loop through all the app namespaces
                    for (var i = 0; i < apps.length; i++) {
                        // see if this app has "componentOnReady" setup
                        if (win[apps[i]].componentOnReady) {
                            // this app's core has loaded call its "componentOnReady"
                            if (win[apps[i]].componentOnReady(elm, resolve)) {
                                // this component does belong to this app and would
                                // have fired off the resolve fn
                                // let's stop here, we're good
                                return;
                            }
                            appsReady++;
                        }
                    }
                    if (appsReady < apps.length) {
                        // not all apps are ready yet
                        // add it to the queue to be figured out when they are
                        (win['s-cr'] = win['s-cr'] || []).push([elm, resolve]);
                        return;
                    }
                }
                // not a recognized app component
                resolve(null);
            }
            // callback wasn't provided, let's return a promise
            if (win.Promise) {
                // use native/polyfilled promise
                return new win.Promise(executor);
            }
            // promise may not have been polyfilled yet
            return { then: executor };
        };
    }
}

/**
 * SSR Attribute Names
 */
const SSR_VNODE_ID = 'ssrv';
const SSR_CHILD_ID = 'ssrc';
/**
 * Default style mode id
 */
const DEFAULT_STYLE_MODE = '$';
/**
 * Reusable empty obj/array
 * Don't add values to these!!
 */
const EMPTY_OBJ = {};
/**
 * Key Name to Key Code Map
 */
const KEY_CODE_MAP = {
    'enter': 13,
    'escape': 27,
    'space': 32,
    'tab': 9,
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40
};

function getScopeId(cmpMeta, mode) {
    return ('sc-' + cmpMeta.tagNameMeta) + ((mode && mode !== DEFAULT_STYLE_MODE) ? '-' + mode : '');
}
function getElementScopeId(scopeId, isHostElement) {
    return scopeId + (isHostElement ? '-h' : '-s');
}

function initStyleTemplate(domApi, cmpMeta, encapsulation, style, styleMode, perf) {
    if (style) {
        if (_BUILD_.profile) {
            perf.mark(`init_style_template_start:${cmpMeta.tagNameMeta}`);
        }
        // we got a style mode for this component, let's create an id for this style
        const styleModeId = cmpMeta.tagNameMeta + (styleMode || DEFAULT_STYLE_MODE);
        if (!cmpMeta[styleModeId]) {
            // we don't have this style mode id initialized yet
            if (_BUILD_.es5) {
                // ie11's template polyfill doesn't fully do the trick and there's still issues
                // so instead of trying to clone templates with styles in them, we'll just
                // keep a map of the style text as a string to create <style> elements for es5 builds
                cmpMeta[styleModeId] = style;
            }
            else {
                // use <template> elements to clone styles
                // create the template element which will hold the styles
                // adding it to the dom via <template> so that we can
                // clone this for each potential shadow root that will need these styles
                // otherwise it'll be cloned and added to document.body.head
                // but that's for the renderer to figure out later
                const templateElm = domApi.$createElement('template');
                // keep a reference to this template element within the
                // Constructor using the style mode id as the key
                cmpMeta[styleModeId] = templateElm;
                // add the style text to the template element's innerHTML
                if (_BUILD_.hotModuleReplacement) {
                    // hot module replacement enabled
                    // add a style id attribute, but only useful during dev
                    const styleContent = [`<style`, ` data-style-tag="${cmpMeta.tagNameMeta}"`];
                    domApi.$setAttribute(templateElm, 'data-tmpl-style-tag', cmpMeta.tagNameMeta);
                    if (styleMode) {
                        styleContent.push(` data-style-mode="${styleMode}"`);
                        domApi.$setAttribute(templateElm, 'data-tmpl-style-mode', styleMode);
                    }
                    if (encapsulation === 2 /* ScopedCss */ || (encapsulation === 1 /* ShadowDom */ && !domApi.$supportsShadowDom)) {
                        styleContent.push(` data-style-scoped="true"`);
                        domApi.$setAttribute(templateElm, 'data-tmpl-style-scoped', 'true');
                    }
                    styleContent.push(`>`);
                    styleContent.push(style);
                    styleContent.push(`</style>`);
                    templateElm.innerHTML = styleContent.join('');
                }
                else {
                    // prod mode, no style id data attributes
                    templateElm.innerHTML = `<style>${style}</style>`;
                }
                // add our new template element to the head
                // so it can be cloned later
                domApi.$appendChild(domApi.$doc.head, templateElm);
            }
        }
        if (_BUILD_.profile) {
            perf.mark(`init_style_template_end:${cmpMeta.tagNameMeta}`);
            perf.measure(`init_style_template:${cmpMeta.tagNameMeta}`, `init_style_template_start:${cmpMeta.tagNameMeta}`, `init_style_template_end:${cmpMeta.tagNameMeta}`);
        }
    }
}
const attachStyles = (plt, domApi, cmpMeta, hostElm) => {
    // first see if we've got a style for a specific mode
    // either this host element should use scoped css
    // or it wants to use shadow dom but the browser doesn't support it
    // create a scope id which is useful for scoped css
    // and add the scope attribute to the host
    // create the style id w/ the host element's mode
    let styleId = cmpMeta.tagNameMeta + (_BUILD_.hasMode ? hostElm.mode : DEFAULT_STYLE_MODE);
    let styleTemplate = cmpMeta[styleId];
    // if (_BUILD_.scoped || _BUILD_.shadowDom) {
    const shouldScopeCss = (cmpMeta.encapsulationMeta === 2 /* ScopedCss */ || (cmpMeta.encapsulationMeta === 1 /* ShadowDom */ && !plt.domApi.$supportsShadowDom));
    if (shouldScopeCss) {
        hostElm['s-sc'] = styleTemplate
            ? getScopeId(cmpMeta, hostElm.mode)
            : getScopeId(cmpMeta);
    }
    // }
    if (_BUILD_.hasMode && !styleTemplate) {
        // doesn't look like there's a style template with the mode
        // create the style id using the default style mode and try again
        styleId = cmpMeta.tagNameMeta + DEFAULT_STYLE_MODE;
        styleTemplate = cmpMeta[styleId];
    }
    if (styleTemplate) {
        // cool, we found a style template element for this component
        let styleContainerNode = domApi.$doc.head;
        // if this browser supports shadow dom, then let's climb up
        // the dom and see if we're within a shadow dom
        if (_BUILD_.shadowDom && domApi.$supportsShadowDom) {
            if (cmpMeta.encapsulationMeta === 1 /* ShadowDom */) {
                // we already know we're in a shadow dom
                // so shadow root is the container for these styles
                styleContainerNode = hostElm.shadowRoot;
            }
            else {
                // climb up the dom and see if we're in a shadow dom
                const rootEl = hostElm.getRootNode();
                if (rootEl.host) {
                    styleContainerNode = rootEl;
                }
            }
        }
        // if this container element already has these styles
        // then there's no need to apply them again
        // create an object to keep track if we'ready applied this component style
        let appliedStyles = plt.componentAppliedStyles.get(styleContainerNode);
        if (!appliedStyles) {
            plt.componentAppliedStyles.set(styleContainerNode, appliedStyles = {});
        }
        // check if we haven't applied these styles to this container yet
        if (!appliedStyles[styleId]) {
            let styleElm;
            if (_BUILD_.es5) {
                // es5 builds are not using <template> because of ie11 issues
                // instead the "template" is just the style text as a string
                // create a new style element and add as innerHTML
                if (_BUILD_.cssVarShim && plt.customStyle) {
                    styleElm = plt.customStyle.createHostStyle(hostElm, styleId, styleTemplate);
                }
                else {
                    styleElm = domApi.$createElement('style');
                    styleElm.innerHTML = styleTemplate;
                    // remember we don't need to do this again for this element
                    appliedStyles[styleId] = true;
                }
                if (styleElm) {
                    if (_BUILD_.hotModuleReplacement) {
                        // add a style attributes, but only useful during dev
                        domApi.$setAttribute(styleElm, 'data-style-tag', cmpMeta.tagNameMeta);
                        if (hostElm.mode) {
                            domApi.$setAttribute(styleElm, 'data-style-mode', cmpMeta.tagNameMeta);
                        }
                        if (hostElm['s-sc']) {
                            domApi.$setAttribute(styleElm, 'data-style-scoped', 'true');
                        }
                    }
                    const dataStyles = styleContainerNode.querySelectorAll('[data-styles]');
                    domApi.$insertBefore(styleContainerNode, styleElm, (dataStyles.length && dataStyles[dataStyles.length - 1].nextSibling) || styleContainerNode.firstChild);
                }
            }
            else {
                // this browser supports the <template> element
                // and all its native content.cloneNode() goodness
                // clone the template element to create a new <style> element
                styleElm = styleTemplate.content.cloneNode(true);
                // remember we don't need to do this again for this element
                appliedStyles[styleId] = true;
                // let's make sure we put the styles below the <style data-styles> element
                // so any visibility css overrides the default
                const dataStyles = styleContainerNode.querySelectorAll('[data-styles]');
                domApi.$insertBefore(styleContainerNode, styleElm, (dataStyles.length && dataStyles[dataStyles.length - 1].nextSibling) || styleContainerNode.firstChild);
            }
        }
    }
};

const isDef = (v) => v != null;
const toLowerCase = (str) => str.toLowerCase();
const dashToPascalCase = (str) => toLowerCase(str).split('-').map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
const noop = () => { };

const createDomApi = (App, win, doc) => {
    // using the $ prefix so that closure is
    // cool with property renaming each of these
    const unregisterListenerFns = new WeakMap();
    const domApi = {
        $doc: doc,
        $supportsShadowDom: !!doc.documentElement.attachShadow,
        $supportsEventOptions: false,
        $nodeType: (node) => node.nodeType,
        $createElement: (tagName) => doc.createElement(tagName),
        $createElementNS: (namespace, tagName) => doc.createElementNS(namespace, tagName),
        $createTextNode: (text) => doc.createTextNode(text),
        $createComment: (data) => doc.createComment(data),
        $insertBefore: (parentNode, childNode, referenceNode) => parentNode.insertBefore(childNode, referenceNode),
        // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
        // and it's polyfilled in es5 builds
        $remove: (node) => node.remove(),
        $appendChild: (parentNode, childNode) => parentNode.appendChild(childNode),
        $addClass: (elm, cssClass) => {
            if (_BUILD_.hasSvg && _BUILD_.es5) {
                if (elm.classList) {
                    elm.classList.add(cssClass);
                }
                else if (elm.nodeName.toLowerCase() === 'svg') {
                    // https://caniuse.com/#search=classList
                    // IE11 really does not do <svg> properly :-/
                    let cssClasses = elm.getAttribute('class') || '';
                    if (!(cssClasses.split(' ').includes(cssClass))) {
                        cssClasses += ` ${cssClass}`;
                    }
                    elm.setAttribute('class', cssClasses.trim());
                }
            }
            else {
                elm.classList.add(cssClass);
            }
        },
        $childNodes: (node) => node.childNodes,
        $parentNode: (node) => node.parentNode,
        $nextSibling: (node) => node.nextSibling,
        $previousSibling: (node) => node.previousSibling,
        $tagName: (elm) => toLowerCase(elm.nodeName),
        $getTextContent: (node) => node.textContent,
        $setTextContent: (node, text) => node.textContent = text,
        $getAttribute: (elm, key) => elm.getAttribute(key),
        $setAttribute: (elm, key, val) => elm.setAttribute(key, val),
        $removeAttribute: (elm, key) => elm.removeAttribute(key),
        $hasAttribute: (elm, key) => elm.hasAttribute(key),
        $getMode: (elm) => elm.getAttribute('mode') || (App.Context || {}).mode,
        $elementRef: (elm, referenceName) => {
            if (referenceName === 'child') {
                return elm.firstElementChild;
            }
            if (referenceName === 'parent') {
                return domApi.$parentElement(elm);
            }
            if (referenceName === 'body') {
                return doc.body;
            }
            if (referenceName === 'document') {
                return doc;
            }
            if (referenceName === 'window') {
                return win;
            }
            return elm;
        },
        $addEventListener: (assignerElm, eventName, listenerCallback, assignerId, useCapture, usePassive, attachTo, eventListenerOpts, splt, assignersEventName) => {
            // remember the original name before we possibly change it
            let attachToElm = assignerElm;
            let eventListener = listenerCallback;
            // get the existing unregister listeners for
            // this element from the unregister listeners weakmap
            let assignersUnregListeners = unregisterListenerFns.get(assignerElm);
            assignersEventName = eventName + assignerId;
            if (assignersUnregListeners && assignersUnregListeners[assignersEventName]) {
                // removed any existing listeners for this event for the assigner element
                // this element already has this listener, so let's unregister it now
                assignersUnregListeners[assignersEventName]();
            }
            if ((_BUILD_.event || _BUILD_.listener) && typeof attachTo === 'string') {
                // attachTo is a string, and is probably something like
                // "parent", "window", or "document"
                // and the eventName would be like "mouseover" or "mousemove"
                attachToElm = domApi.$elementRef(assignerElm, attachTo);
            }
            else if (typeof attachTo === 'object') {
                // we were passed in an actual element to attach to
                attachToElm = attachTo;
            }
            else if (_BUILD_.event || _BUILD_.listener) {
                // depending on the event name, we could actually be attaching
                // this element to something like the document or window
                splt = eventName.split(':');
                if (splt.length > 1) {
                    // document:mousemove
                    // parent:touchend
                    // body:keyup.enter
                    attachToElm = domApi.$elementRef(assignerElm, splt[0]);
                    eventName = splt[1];
                }
            }
            if (attachToElm) {
                // somehow we're referencing an element that doesn't exist
                // let's not continue
                if (_BUILD_.event || _BUILD_.listener) {
                    // test to see if we're looking for an exact keycode
                    splt = eventName.split('.');
                    if (splt.length > 1) {
                        // looks like this listener is also looking for a keycode
                        // keyup.enter
                        eventName = splt[0];
                        eventListener = (ev) => {
                            // wrap the user's event listener with our own check to test
                            // if this keyboard event has the keycode they're looking for
                            if (ev.keyCode === KEY_CODE_MAP[splt[1]]) {
                                listenerCallback(ev);
                            }
                        };
                    }
                }
                // create the actual event listener options to use
                // this browser may not support event options
                eventListenerOpts = domApi.$supportsEventOptions ? {
                    capture: !!useCapture,
                    passive: !!usePassive
                } : !!useCapture;
                // ok, good to go, let's add the actual listener to the dom element
                App.ael(attachToElm, eventName, eventListener, eventListenerOpts);
                if (!assignersUnregListeners) {
                    // we don't already have a collection, let's create it
                    unregisterListenerFns.set(assignerElm, assignersUnregListeners = {});
                }
                // add the unregister listener to this element's collection
                assignersUnregListeners[assignersEventName] = () => {
                    // looks like it's time to say goodbye
                    attachToElm && App.rel(attachToElm, eventName, eventListener, eventListenerOpts);
                    assignersUnregListeners[assignersEventName] = null;
                };
            }
        },
        $removeEventListener: (elm, eventName, assignerId, assignersUnregListeners) => {
            // get the unregister listener functions for this element
            if ((assignersUnregListeners = unregisterListenerFns.get(elm))) {
                // this element has unregister listeners
                if (eventName) {
                    // passed in one specific event name to remove
                    assignersUnregListeners[eventName + assignerId] && assignersUnregListeners[eventName + assignerId]();
                }
                else {
                    // remove all event listeners
                    Object.keys(assignersUnregListeners).forEach(assignersEventName => {
                        assignersUnregListeners[assignersEventName] && assignersUnregListeners[assignersEventName]();
                    });
                }
            }
        },
        $dispatchEvent: (elm, eventName, data, e) => {
            // create and return the custom event, allows for cancel checks
            e = new win.CustomEvent(eventName, data);
            elm && elm.dispatchEvent(e);
            return e;
        },
        $parentElement: (elm, parentNode) => 
        // if the parent node is a document fragment (shadow root)
        // then use the "host" property on it
        // otherwise use the parent node
        ((parentNode = domApi.$parentNode(elm)) && domApi.$nodeType(parentNode) === 11 /* DocumentFragment */) ? parentNode.host : parentNode
    };
    if (_BUILD_.hasSvg) {
        domApi.$setAttributeNS = (elm, namespaceURI, qualifiedName, val) => elm.setAttributeNS(namespaceURI, qualifiedName, val);
    }
    if (_BUILD_.shadowDom) {
        domApi.$attachShadow = (elm, shadowRootInit) => elm.attachShadow(shadowRootInit);
    }
    if (_BUILD_.es5) {
        if (typeof win.CustomEvent !== 'function') {
            // CustomEvent polyfill
            win.CustomEvent = (event, data, evt) => {
                evt = doc.createEvent('CustomEvent');
                data = data || {};
                evt.initCustomEvent(event, data.bubbles, data.cancelable, data.detail);
                return evt;
            };
            win.CustomEvent.prototype = win.Event.prototype;
        }
    }
    if (_BUILD_.isDev) {
        if (win.location.search.indexOf('shadow=false') > 0) {
            // by adding ?shadow=false it'll force the slot polyfill
            // only add this check when in dev mode
            domApi.$supportsShadowDom = false;
        }
    }
    if (!App.ael) {
        App.ael = (elm, eventName, cb, opts) => elm.addEventListener(eventName, cb, opts);
        App.rel = (elm, eventName, cb, opts) => elm.removeEventListener(eventName, cb, opts);
    }
    if (_BUILD_.event || _BUILD_.listener) {
        // test if this browser supports event options or not
        try {
            win.addEventListener('e', null, Object.defineProperty({}, 'passive', {
                get: () => domApi.$supportsEventOptions = true
            }));
        }
        catch (e) { }
    }
    return domApi;
};

function elementHasProperty(plt, elm, memberName) {
    // within the browser, the element's prototype
    // already has its getter/setter set, but on the
    // server the prototype is shared causing issues
    // so instead the server's elm has the getter/setter
    // directly on the actual element instance, not its prototype
    // so at the time of this function being called, the server
    // side element is unaware if the element has this property
    // name. So for server-side only, do this trick below
    // don't worry, this runtime code doesn't show on the client
    let hasOwnProperty = elm.hasOwnProperty(memberName);
    if (!hasOwnProperty) {
        // element doesn't
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta) {
            if (cmpMeta.componentConstructor && cmpMeta.componentConstructor.properties) {
                // if we have the constructor property data, let's check that
                const member = cmpMeta.componentConstructor.properties[memberName];
                hasOwnProperty = !!(member && member.type);
            }
            if (!hasOwnProperty && cmpMeta.membersMeta) {
                // if we have the component's metadata, let's check that
                const member = cmpMeta.membersMeta[memberName];
                hasOwnProperty = !!(member && member.propType);
            }
        }
    }
    return hasOwnProperty;
}

const updateAttribute = (elm, memberName, newValue, isBooleanAttr = typeof newValue === 'boolean', isXlinkNs) => {
    if (_BUILD_.hasSvg) {
        isXlinkNs = (memberName !== (memberName = memberName.replace(/^xlink\:?/, '')));
    }
    if (newValue == null || (isBooleanAttr && (!newValue || newValue === 'false'))) {
        if (_BUILD_.hasSvg && isXlinkNs) {
            elm.removeAttributeNS(XLINK_NS$1, toLowerCase(memberName));
        }
        else {
            elm.removeAttribute(memberName);
        }
    }
    else if (typeof newValue !== 'function') {
        if (isBooleanAttr) {
            newValue = '';
        }
        else {
            newValue = newValue.toString();
        }
        if (_BUILD_.hasSvg && isXlinkNs) {
            elm.setAttributeNS(XLINK_NS$1, toLowerCase(memberName), newValue);
        }
        else {
            elm.setAttribute(memberName, newValue);
        }
    }
};
const XLINK_NS$1 = 'http://www.w3.org/1999/xlink';

const setAccessor = (plt, elm, memberName, oldValue, newValue, isSvg, isHostElement) => {
    if (memberName === 'class' && !isSvg) {
        // Class
        if (_BUILD_.updatable) {
            if (oldValue !== newValue) {
                const oldList = parseClassList(oldValue);
                const newList = parseClassList(newValue);
                // remove classes in oldList, not included in newList
                const toRemove = oldList.filter(item => !newList.includes(item));
                const classList = parseClassList(elm.className)
                    .filter(item => !toRemove.includes(item));
                // add classes from newValue that are not in oldList or classList
                const toAdd = newList.filter(item => !oldList.includes(item) && !classList.includes(item));
                classList.push(...toAdd);
                elm.className = classList.join(' ');
            }
        }
        else {
            elm.className = newValue;
        }
    }
    else if (memberName === 'style') {
        // update style attribute, css properties and values
        if (_BUILD_.updatable) {
            for (const prop in oldValue) {
                if (!newValue || newValue[prop] == null) {
                    if (/-/.test(prop)) {
                        elm.style.removeProperty(prop);
                    }
                    else {
                        elm.style[prop] = '';
                    }
                }
            }
        }
        for (const prop in newValue) {
            if (!oldValue || newValue[prop] !== oldValue[prop]) {
                if (/-/.test(prop)) {
                    elm.style.setProperty(prop, newValue[prop]);
                }
                else {
                    elm.style[prop] = newValue[prop];
                }
            }
        }
    }
    else if ((memberName[0] === 'o' && memberName[1] === 'n' && /[A-Z]/.test(memberName[2])) && (!(memberName in elm))) {
        // Event Handlers
        // so if the member name starts with "on" and the 3rd characters is
        // a capital letter, and it's not already a member on the element,
        // then we're assuming it's an event listener
        if (toLowerCase(memberName) in elm) {
            // standard event
            // the JSX attribute could have been "onMouseOver" and the
            // member name "onmouseover" is on the element's prototype
            // so let's add the listener "mouseover", which is all lowercased
            memberName = toLowerCase(memberName.substring(2));
        }
        else {
            // custom event
            // the JSX attribute could have been "onMyCustomEvent"
            // so let's trim off the "on" prefix and lowercase the first character
            // and add the listener "myCustomEvent"
            // except for the first character, we keep the event name case
            memberName = toLowerCase(memberName[2]) + memberName.substring(3);
        }
        if (newValue) {
            if (newValue !== oldValue) {
                // add listener
                plt.domApi.$addEventListener(elm, memberName, newValue, 0);
            }
        }
        else if (_BUILD_.updatable) {
            // remove listener
            plt.domApi.$removeEventListener(elm, memberName, 0);
        }
    }
    else if (memberName !== 'list' && memberName !== 'type' && !isSvg &&
        (memberName in elm || (['object', 'function'].indexOf(typeof newValue) !== -1) && newValue !== null)
        || (!_BUILD_.clientSide && elementHasProperty(plt, elm, memberName))) {
        // Properties
        // - list and type are attributes that get applied as values on the element
        // - all svgs get values as attributes not props
        // - check if elm contains name or if the value is array, object, or function
        const cmpMeta = plt.getComponentMeta(elm);
        if (_BUILD_.hasMembers && cmpMeta && cmpMeta.membersMeta && cmpMeta.membersMeta[memberName]) {
            // we know for a fact that this element is a known component
            // and this component has this member name as a property,
            // let's set the known @Prop on this element
            // set it directly as property on the element
            setProperty(elm, memberName, newValue);
            if (_BUILD_.reflectToAttr && isHostElement && cmpMeta.membersMeta[memberName].reflectToAttrib) {
                // we also want to set this data to the attribute
                updateAttribute(elm, cmpMeta.membersMeta[memberName].attribName, newValue, cmpMeta.membersMeta[memberName].propType === 4 /* Boolean */);
            }
        }
        else if (memberName !== 'ref') {
            // this member name is a property on this element, but it's not a component
            // this is a native property like "value" or something
            // also we can ignore the "ref" member name at this point
            setProperty(elm, memberName, newValue == null ? '' : newValue);
            if (newValue == null || newValue === false) {
                plt.domApi.$removeAttribute(elm, memberName);
            }
        }
    }
    else if (newValue != null && memberName !== 'key') {
        if (_BUILD_.isDev && memberName === 'htmlfor') {
            console.error(`Attribute "htmlfor" set on ${elm.tagName.toLowerCase()}, with the lower case "f" must be replaced with a "htmlFor" (capital "F")`);
        }
        // Element Attributes
        updateAttribute(elm, memberName, newValue);
    }
    else if (isSvg || plt.domApi.$hasAttribute(elm, memberName) && (newValue == null || newValue === false)) {
        // remove svg attribute
        plt.domApi.$removeAttribute(elm, memberName);
    }
};
const parseClassList = (value) => (value == null || value === '') ? [] : value.trim().split(/\s+/);
/**
 * Attempt to set a DOM property to the given value.
 * IE & FF throw for certain property-value combinations.
 */
const setProperty = (elm, name, value) => {
    try {
        elm[name] = value;
    }
    catch (e) { }
};

const updateElement = (plt, oldVnode, newVnode, isSvgMode, memberName) => {
    // if the element passed in is a shadow root, which is a document fragment
    // then we want to be adding attrs/props to the shadow root's "host" element
    // if it's not a shadow root, then we add attrs/props to the same element
    const elm = (newVnode.elm.nodeType === 11 /* DocumentFragment */ && newVnode.elm.host) ? newVnode.elm.host : newVnode.elm;
    const oldVnodeAttrs = (oldVnode && oldVnode.vattrs) || EMPTY_OBJ;
    const newVnodeAttrs = newVnode.vattrs || EMPTY_OBJ;
    if (_BUILD_.updatable) {
        // remove attributes no longer present on the vnode by setting them to undefined
        for (memberName in oldVnodeAttrs) {
            if (!(newVnodeAttrs && newVnodeAttrs[memberName] != null) && oldVnodeAttrs[memberName] != null) {
                setAccessor(plt, elm, memberName, oldVnodeAttrs[memberName], undefined, isSvgMode, newVnode.ishost);
            }
        }
    }
    // add new & update changed attributes
    for (memberName in newVnodeAttrs) {
        if (!(memberName in oldVnodeAttrs) || newVnodeAttrs[memberName] !== (memberName === 'value' || memberName === 'checked' ? elm[memberName] : oldVnodeAttrs[memberName])) {
            setAccessor(plt, elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], isSvgMode, newVnode.ishost);
        }
    }
};

let isSvgMode = false;
const createRendererPatch = (plt, domApi) => {
    // createRenderer() is only created once per app
    // the patch() function which createRenderer() returned is the function
    // which gets called numerous times by each component
    // internal variables to be reused per patch() call
    let useNativeShadowDom, ssrId, scopeId, checkSlotFallbackVisibility, checkSlotRelocate, contentRef, hostTagName, hostElm;
    const createElm = (oldParentVNode, newParentVNode, childIndex, parentElm, i, elm, childNode, newVNode, oldVNode) => {
        newVNode = newParentVNode.vchildren[childIndex];
        if (_BUILD_.slotPolyfill && !useNativeShadowDom) {
            // remember for later we need to check to relocate nodes
            checkSlotRelocate = true;
            if (newVNode.vtag === 'slot') {
                if (scopeId) {
                    // scoped css needs to add its scoped id to the parent element
                    domApi.$addClass(parentElm, scopeId + '-s');
                }
                if (!newVNode.vchildren) {
                    // slot element does not have fallback content
                    // create an html comment we'll use to always reference
                    // where actual slot content should sit next to
                    newVNode.isSlotReference = true;
                }
                else {
                    // slot element has fallback content
                    // still create an element that "mocks" the slot element
                    newVNode.isSlotFallback = true;
                }
            }
        }
        if (isDef(newVNode.vtext)) {
            // create text node
            newVNode.elm = domApi.$createTextNode(newVNode.vtext);
        }
        else if (_BUILD_.slotPolyfill && newVNode.isSlotReference) {
            // create a slot reference html text node
            newVNode.elm = domApi.$createTextNode('');
        }
        else {
            // create element
            elm = newVNode.elm = ((_BUILD_.hasSvg && (isSvgMode || newVNode.vtag === 'svg')) ?
                domApi.$createElementNS('http://www.w3.org/2000/svg', newVNode.vtag) :
                domApi.$createElement((_BUILD_.slotPolyfill && newVNode.isSlotFallback) ? 'slot-fb' : newVNode.vtag));
            if (plt.isDefinedComponent(elm)) {
                plt.isCmpReady.delete(hostElm);
            }
            if (_BUILD_.hasSvg) {
                isSvgMode = newVNode.vtag === 'svg' ? true : (newVNode.vtag === 'foreignObject' ? false : isSvgMode);
            }
            // add css classes, attrs, props, listeners, etc.
            updateElement(plt, null, newVNode, isSvgMode);
            if (isDef(scopeId) && elm['s-si'] !== scopeId) {
                // if there is a scopeId and this is the initial render
                // then let's add the scopeId as an attribute
                domApi.$addClass(elm, (elm['s-si'] = scopeId));
            }
            if (_BUILD_.ssrServerSide && isDef(ssrId)) {
                // SSR ONLY: this is an SSR render and this
                // logic does not run on the client
                // give this element the SSR child id that can be read by the client
                domApi.$setAttribute(elm, SSR_CHILD_ID, ssrId + '.' + childIndex + (hasChildNodes(newVNode.vchildren) ? '' : '.'));
            }
            if (newVNode.vchildren) {
                for (i = 0; i < newVNode.vchildren.length; ++i) {
                    // create the node
                    childNode = createElm(oldParentVNode, newVNode, i, elm);
                    // return node could have been null
                    if (childNode) {
                        if (_BUILD_.ssrServerSide && isDef(ssrId) && childNode.nodeType === 3 /* TextNode */ && !childNode['s-cr']) {
                            // SSR ONLY: add the text node's start comment
                            domApi.$appendChild(elm, domApi.$createComment('s.' + ssrId + '.' + i));
                        }
                        // append our new node
                        domApi.$appendChild(elm, childNode);
                        if (_BUILD_.ssrServerSide && isDef(ssrId) && childNode.nodeType === 3 /* TextNode */ && !childNode['s-cr']) {
                            // SSR ONLY: add the text node's end comment
                            domApi.$appendChild(elm, domApi.$createComment('/'));
                            domApi.$appendChild(elm, domApi.$createTextNode(' '));
                        }
                    }
                }
            }
            if (_BUILD_.hasSvg && newVNode.vtag === 'svg') {
                // Only reset the SVG context when we're exiting SVG element
                isSvgMode = false;
            }
        }
        if (_BUILD_.slotPolyfill) {
            newVNode.elm['s-hn'] = hostTagName;
            if (newVNode.isSlotFallback || newVNode.isSlotReference) {
                // remember the content reference comment
                newVNode.elm['s-sr'] = true;
                // remember the content reference comment
                newVNode.elm['s-cr'] = contentRef;
                // remember the slot name, or empty string for default slot
                newVNode.elm['s-sn'] = newVNode.vname || '';
                // check if we've got an old vnode for this slot
                oldVNode = oldParentVNode && oldParentVNode.vchildren && oldParentVNode.vchildren[childIndex];
                if (oldVNode && oldVNode.vtag === newVNode.vtag && oldParentVNode.elm) {
                    // we've got an old slot vnode and the wrapper is being replaced
                    // so let's move the old slot content back to it's original location
                    putBackInOriginalLocation(oldParentVNode.elm);
                }
            }
        }
        return newVNode.elm;
    };
    const putBackInOriginalLocation = (parentElm, recursive, i, childNode) => {
        plt.tmpDisconnected = true;
        const oldSlotChildNodes = domApi.$childNodes(parentElm);
        for (i = oldSlotChildNodes.length - 1; i >= 0; i--) {
            childNode = oldSlotChildNodes[i];
            if (childNode['s-hn'] !== hostTagName && childNode['s-ol']) {
                // this child node in the old element is from another component
                // remove this node from the old slot's parent
                domApi.$remove(childNode);
                // and relocate it back to it's original location
                domApi.$insertBefore(parentReferenceNode(childNode), childNode, referenceNode(childNode));
                // remove the old original location comment entirely
                // later on the patch function will know what to do
                // and move this to the correct spot in need be
                domApi.$remove(childNode['s-ol']);
                childNode['s-ol'] = null;
                checkSlotRelocate = true;
            }
            if (recursive) {
                putBackInOriginalLocation(childNode, recursive);
            }
        }
        plt.tmpDisconnected = false;
    };
    const addVnodes = (parentElm, before, parentVNode, vnodes, startIdx, endIdx, containerElm, childNode) => {
        const contentRef = parentElm['s-cr'];
        containerElm = ((contentRef && domApi.$parentNode(contentRef)) || parentElm);
        if (containerElm.shadowRoot && domApi.$tagName(containerElm) === hostTagName) {
            containerElm = containerElm.shadowRoot;
        }
        for (; startIdx <= endIdx; ++startIdx) {
            if (vnodes[startIdx]) {
                childNode = isDef(vnodes[startIdx].vtext) ?
                    domApi.$createTextNode(vnodes[startIdx].vtext) :
                    createElm(null, parentVNode, startIdx, parentElm);
                if (childNode) {
                    vnodes[startIdx].elm = childNode;
                    domApi.$insertBefore(containerElm, childNode, referenceNode(before));
                }
            }
        }
    };
    const removeVnodes = (vnodes, startIdx, endIdx, node) => {
        for (; startIdx <= endIdx; ++startIdx) {
            if (isDef(vnodes[startIdx])) {
                node = vnodes[startIdx].elm;
                if (_BUILD_.slotPolyfill) {
                    // we're removing this element
                    // so it's possible we need to show slot fallback content now
                    checkSlotFallbackVisibility = true;
                    if (node['s-ol']) {
                        // remove the original location comment
                        domApi.$remove(node['s-ol']);
                    }
                    else {
                        // it's possible that child nodes of the node
                        // that's being removed are slot nodes
                        putBackInOriginalLocation(node, true);
                    }
                }
                // remove the vnode's element from the dom
                domApi.$remove(node);
            }
        }
    };
    const updateChildren = (parentElm, oldCh, newVNode, newCh, idxInOld, i, node, elmToMove) => {
        let oldStartIdx = 0, newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                // Vnode might have been moved left
                oldStartVnode = oldCh[++oldStartIdx];
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldStartVnode, newStartVnode)) {
                patchVNode(oldStartVnode, newStartVnode);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (isSameVnode(oldEndVnode, newEndVnode)) {
                patchVNode(oldEndVnode, newEndVnode);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldStartVnode, newEndVnode)) {
                // Vnode moved right
                if (_BUILD_.slotPolyfill && (oldStartVnode.vtag === 'slot' || newEndVnode.vtag === 'slot')) {
                    putBackInOriginalLocation(domApi.$parentNode(oldStartVnode.elm));
                }
                patchVNode(oldStartVnode, newEndVnode);
                domApi.$insertBefore(parentElm, oldStartVnode.elm, domApi.$nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (isSameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
                if (_BUILD_.slotPolyfill && (oldStartVnode.vtag === 'slot' || newEndVnode.vtag === 'slot')) {
                    putBackInOriginalLocation(domApi.$parentNode(oldEndVnode.elm));
                }
                patchVNode(oldEndVnode, newStartVnode);
                domApi.$insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                // createKeyToOldIdx
                idxInOld = null;
                for (i = oldStartIdx; i <= oldEndIdx; ++i) {
                    if (oldCh[i] && isDef(oldCh[i].vkey) && oldCh[i].vkey === newStartVnode.vkey) {
                        idxInOld = i;
                        break;
                    }
                }
                if (isDef(idxInOld)) {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.vtag !== newStartVnode.vtag) {
                        node = createElm(oldCh && oldCh[newStartIdx], newVNode, idxInOld, parentElm);
                    }
                    else {
                        patchVNode(elmToMove, newStartVnode);
                        oldCh[idxInOld] = undefined;
                        node = elmToMove.elm;
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    // new element
                    node = createElm(oldCh && oldCh[newStartIdx], newVNode, newStartIdx, parentElm);
                    newStartVnode = newCh[++newStartIdx];
                }
                if (node) {
                    if (_BUILD_.slotPolyfill) {
                        domApi.$insertBefore(parentReferenceNode(oldStartVnode.elm), node, referenceNode(oldStartVnode.elm));
                    }
                    else {
                        domApi.$insertBefore(domApi.$parentNode(oldStartVnode.elm), node, oldStartVnode.elm);
                    }
                }
            }
        }
        if (oldStartIdx > oldEndIdx) {
            addVnodes(parentElm, (newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm), newVNode, newCh, newStartIdx, newEndIdx);
        }
        else if (_BUILD_.updatable && newStartIdx > newEndIdx) {
            removeVnodes(oldCh, oldStartIdx, oldEndIdx);
        }
    };
    const isSameVnode = (vnode1, vnode2) => {
        // compare if two vnode to see if they're "technically" the same
        // need to have the same element tag, and same key to be the same
        if (vnode1.vtag === vnode2.vtag && vnode1.vkey === vnode2.vkey) {
            if (_BUILD_.slotPolyfill) {
                if (vnode1.vtag === 'slot') {
                    return vnode1.vname === vnode2.vname;
                }
            }
            return true;
        }
        return false;
    };
    const referenceNode = (node) => {
        if (node && node['s-ol']) {
            // this node was relocated to a new location in the dom
            // because of some other component's slot
            // but we still have an html comment in place of where
            // it's original location was according to it's original vdom
            return node['s-ol'];
        }
        return node;
    };
    const parentReferenceNode = (node) => {
        return domApi.$parentNode(node['s-ol'] ? node['s-ol'] : node);
    };
    const patchVNode = (oldVNode, newVNode, defaultHolder) => {
        const elm = newVNode.elm = oldVNode.elm;
        const oldChildren = oldVNode.vchildren;
        const newChildren = newVNode.vchildren;
        if (_BUILD_.hasSvg) {
            // test if we're rendering an svg element, or still rendering nodes inside of one
            // only add this to the when the compiler sees we're using an svg somewhere
            isSvgMode = newVNode.elm &&
                isDef(domApi.$parentElement(newVNode.elm)) &&
                newVNode.elm.ownerSVGElement !== undefined;
            isSvgMode = newVNode.vtag === 'svg' ? true : (newVNode.vtag === 'foreignObject' ? false : isSvgMode);
        }
        if (!isDef(newVNode.vtext)) {
            // element node
            if (newVNode.vtag !== 'slot') {
                // either this is the first render of an element OR it's an update
                // AND we already know it's possible it could have changed
                // this updates the element's css classes, attrs, props, listeners, etc.
                updateElement(plt, oldVNode, newVNode, isSvgMode);
            }
            if (_BUILD_.updatable && isDef(oldChildren) && isDef(newChildren)) {
                // looks like there's child vnodes for both the old and new vnodes
                updateChildren(elm, oldChildren, newVNode, newChildren);
            }
            else if (isDef(newChildren)) {
                // no old child vnodes, but there are new child vnodes to add
                if (_BUILD_.updatable && isDef(oldVNode.vtext)) {
                    // the old vnode was text, so be sure to clear it out
                    domApi.$setTextContent(elm, '');
                }
                // add the new vnode children
                addVnodes(elm, null, newVNode, newChildren, 0, newChildren.length - 1);
            }
            else if (_BUILD_.updatable && isDef(oldChildren)) {
                // no new child vnodes, but there are old child vnodes to remove
                removeVnodes(oldChildren, 0, oldChildren.length - 1);
            }
        }
        else if (_BUILD_.slotPolyfill && (defaultHolder = elm['s-cr'])) {
            // this element has slotted content
            domApi.$setTextContent(domApi.$parentNode(defaultHolder), newVNode.vtext);
        }
        else if (oldVNode.vtext !== newVNode.vtext) {
            // update the text content for the text only vnode
            // and also only if the text is different than before
            domApi.$setTextContent(elm, newVNode.vtext);
        }
        if (_BUILD_.hasSvg) {
            // reset svgMode when svg node is fully patched
            if (isSvgMode && 'svg' === newVNode.vtag) {
                isSvgMode = false;
            }
        }
    };
    const updateFallbackSlotVisibility = (elm, childNode, childNodes, i, ilen, j, slotNameAttr, nodeType) => {
        childNodes = domApi.$childNodes(elm);
        for (i = 0, ilen = childNodes.length; i < ilen; i++) {
            childNode = childNodes[i];
            if (domApi.$nodeType(childNode) === 1 /* ElementNode */) {
                if (childNode['s-sr']) {
                    // this is a slot fallback node
                    // get the slot name for this slot reference node
                    slotNameAttr = childNode['s-sn'];
                    // by default always show a fallback slot node
                    // then hide it if there are other slots in the light dom
                    childNode.hidden = false;
                    for (j = 0; j < ilen; j++) {
                        if (childNodes[j]['s-hn'] !== childNode['s-hn']) {
                            // this sibling node is from a different component
                            nodeType = domApi.$nodeType(childNodes[j]);
                            if (slotNameAttr !== '') {
                                // this is a named fallback slot node
                                if (nodeType === 1 /* ElementNode */ && slotNameAttr === domApi.$getAttribute(childNodes[j], 'slot')) {
                                    childNode.hidden = true;
                                    break;
                                }
                            }
                            else {
                                // this is a default fallback slot node
                                // any element or text node (with content)
                                // should hide the default fallback slot node
                                if (nodeType === 1 /* ElementNode */ || (nodeType === 3 /* TextNode */ && domApi.$getTextContent(childNodes[j]).trim() !== '')) {
                                    childNode.hidden = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                // keep drilling down
                updateFallbackSlotVisibility(childNode);
            }
        }
    };
    const relocateNodes = [];
    const relocateSlotContent = (elm, childNodes, childNode, node, i, ilen, j, hostContentNodes, slotNameAttr, nodeType) => {
        childNodes = domApi.$childNodes(elm);
        for (i = 0, ilen = childNodes.length; i < ilen; i++) {
            childNode = childNodes[i];
            if (childNode['s-sr'] && (node = childNode['s-cr'])) {
                // first got the content reference comment node
                // then we got it's parent, which is where all the host content is in now
                hostContentNodes = domApi.$childNodes(domApi.$parentNode(node));
                slotNameAttr = childNode['s-sn'];
                for (j = hostContentNodes.length - 1; j >= 0; j--) {
                    node = hostContentNodes[j];
                    if (!node['s-cn'] && !node['s-nr'] && node['s-hn'] !== childNode['s-hn']) {
                        // let's do some relocating to its new home
                        // but never relocate a content reference node
                        // that is suppose to always represent the original content location
                        nodeType = domApi.$nodeType(node);
                        if (((nodeType === 3 /* TextNode */ || nodeType === 8 /* CommentNode */) && slotNameAttr === '') ||
                            (nodeType === 1 /* ElementNode */ && domApi.$getAttribute(node, 'slot') === null && slotNameAttr === '') ||
                            (nodeType === 1 /* ElementNode */ && domApi.$getAttribute(node, 'slot') === slotNameAttr)) {
                            // it's possible we've already decided to relocate this node
                            if (!relocateNodes.some(r => r.nodeToRelocate === node)) {
                                // made some changes to slots
                                // let's make sure we also double check
                                // fallbacks are correctly hidden or shown
                                checkSlotFallbackVisibility = true;
                                node['s-sn'] = slotNameAttr;
                                // add to our list of nodes to relocate
                                relocateNodes.push({
                                    slotRefNode: childNode,
                                    nodeToRelocate: node
                                });
                            }
                        }
                    }
                }
            }
            if (domApi.$nodeType(childNode) === 1 /* ElementNode */) {
                relocateSlotContent(childNode);
            }
        }
    };
    return (hostElement, oldVNode, newVNode, useNativeShadowDomVal, encapsulation, ssrPatchId, i, relocateNode, orgLocationNode, refNode, parentNodeRef, insertBeforeNode) => {
        // patchVNode() is synchronous
        // so it is safe to set these variables and internally
        // the same patch() call will reference the same data
        hostElm = hostElement;
        hostTagName = domApi.$tagName(hostElm);
        contentRef = hostElm['s-cr'];
        useNativeShadowDom = useNativeShadowDomVal;
        if (_BUILD_.ssrServerSide) {
            if (encapsulation !== 'shadow') {
                ssrId = ssrPatchId;
            }
            else {
                ssrId = null;
            }
        }
        if (_BUILD_.slotPolyfill) {
            // get the scopeId
            scopeId = hostElm['s-sc'];
            // always reset
            checkSlotRelocate = checkSlotFallbackVisibility = false;
        }
        // synchronous patch
        patchVNode(oldVNode, newVNode);
        if (_BUILD_.ssrServerSide && isDef(ssrId)) {
            // SSR ONLY: we've been given an SSR id, so the host element
            // should be given the ssr id attribute
            domApi.$setAttribute(oldVNode.elm, SSR_VNODE_ID, ssrId);
        }
        if (_BUILD_.slotPolyfill) {
            if (checkSlotRelocate) {
                relocateSlotContent(newVNode.elm);
                for (i = 0; i < relocateNodes.length; i++) {
                    relocateNode = relocateNodes[i];
                    if (!relocateNode.nodeToRelocate['s-ol']) {
                        // add a reference node marking this node's original location
                        // keep a reference to this node for later lookups
                        orgLocationNode = domApi.$createTextNode('');
                        orgLocationNode['s-nr'] = relocateNode.nodeToRelocate;
                        domApi.$insertBefore(domApi.$parentNode(relocateNode.nodeToRelocate), (relocateNode.nodeToRelocate['s-ol'] = orgLocationNode), relocateNode.nodeToRelocate);
                    }
                }
                // while we're moving nodes around existing nodes, temporarily disable
                // the disconnectCallback from working
                plt.tmpDisconnected = true;
                for (i = 0; i < relocateNodes.length; i++) {
                    relocateNode = relocateNodes[i];
                    // by default we're just going to insert it directly
                    // after the slot reference node
                    parentNodeRef = domApi.$parentNode(relocateNode.slotRefNode);
                    insertBeforeNode = domApi.$nextSibling(relocateNode.slotRefNode);
                    orgLocationNode = relocateNode.nodeToRelocate['s-ol'];
                    while (orgLocationNode = domApi.$previousSibling(orgLocationNode)) {
                        if ((refNode = orgLocationNode['s-nr']) && refNode) {
                            if (refNode['s-sn'] === relocateNode.nodeToRelocate['s-sn']) {
                                if (parentNodeRef === domApi.$parentNode(refNode)) {
                                    if ((refNode = domApi.$nextSibling(refNode)) && refNode && !refNode['s-nr']) {
                                        insertBeforeNode = refNode;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if ((!insertBeforeNode && parentNodeRef !== domApi.$parentNode(relocateNode.nodeToRelocate)) ||
                        (domApi.$nextSibling(relocateNode.nodeToRelocate) !== insertBeforeNode)) {
                        // we've checked that it's worth while to relocate
                        // since that the node to relocate
                        // has a different next sibling or parent relocated
                        if (relocateNode.nodeToRelocate !== insertBeforeNode) {
                            // remove the node from the dom
                            domApi.$remove(relocateNode.nodeToRelocate);
                            // add it back to the dom but in its new home
                            domApi.$insertBefore(parentNodeRef, relocateNode.nodeToRelocate, insertBeforeNode);
                        }
                    }
                }
                // done moving nodes around
                // allow the disconnect callback to work again
                plt.tmpDisconnected = false;
            }
            if (checkSlotFallbackVisibility) {
                updateFallbackSlotVisibility(newVNode.elm);
            }
            // always reset
            relocateNodes.length = 0;
        }
        // return our new vnode
        return newVNode;
    };
};
const callNodeRefs = (vNode, isDestroy) => {
    if (vNode) {
        vNode.vattrs && vNode.vattrs.ref && vNode.vattrs.ref(isDestroy ? null : vNode.elm);
        vNode.vchildren && vNode.vchildren.forEach(vChild => {
            callNodeRefs(vChild, isDestroy);
        });
    }
};
const hasChildNodes = (children) => {
    // SSR ONLY: check if there are any more nested child elements
    // if there aren't, this info is useful so the client runtime
    // doesn't have to climb down and check so many elements
    if (children) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].vtag !== 'slot' || hasChildNodes(children[i].vchildren)) {
                return true;
            }
        }
    }
    return false;
};

function createVNodesFromSsr(plt, domApi, rootElm) {
    const allSsrElms = rootElm.querySelectorAll(`[${SSR_VNODE_ID}]`);
    const ilen = allSsrElms.length;
    let elm, ssrVNodeId, ssrVNode, i, j, jlen;
    if (ilen > 0) {
        plt.isCmpReady.set(rootElm, true);
        for (i = 0; i < ilen; i++) {
            elm = allSsrElms[i];
            ssrVNodeId = domApi.$getAttribute(elm, SSR_VNODE_ID);
            ssrVNode = {};
            ssrVNode.vtag = domApi.$tagName(ssrVNode.elm = elm);
            plt.vnodeMap.set(elm, ssrVNode);
            for (j = 0, jlen = elm.childNodes.length; j < jlen; j++) {
                addChildSsrVNodes(domApi, elm.childNodes[j], ssrVNode, ssrVNodeId, true);
            }
        }
    }
}
function addChildSsrVNodes(domApi, node, parentVNode, ssrVNodeId, checkNestedElements) {
    const nodeType = domApi.$nodeType(node);
    let previousComment;
    let childVNodeId, childVNodeSplt, childVNode;
    if (checkNestedElements && nodeType === 1 /* ElementNode */) {
        childVNodeId = domApi.$getAttribute(node, SSR_CHILD_ID);
        if (childVNodeId) {
            // split the start comment's data with a period
            childVNodeSplt = childVNodeId.split('.');
            // ensure this this element is a child element of the ssr vnode
            if (childVNodeSplt[0] === ssrVNodeId) {
                // cool, this element is a child to the parent vnode
                childVNode = {};
                childVNode.vtag = domApi.$tagName(childVNode.elm = node);
                // this is a new child vnode
                // so ensure its parent vnode has the vchildren array
                if (!parentVNode.vchildren) {
                    parentVNode.vchildren = [];
                }
                // add our child vnode to a specific index of the vnode's children
                parentVNode.vchildren[childVNodeSplt[1]] = childVNode;
                // this is now the new parent vnode for all the next child checks
                parentVNode = childVNode;
                // if there's a trailing period, then it means there aren't any
                // more nested elements, but maybe nested text nodes
                // either way, don't keep walking down the tree after this next call
                checkNestedElements = (childVNodeSplt[2] !== '');
            }
        }
        // keep drilling down through the elements
        for (let i = 0; i < node.childNodes.length; i++) {
            addChildSsrVNodes(domApi, node.childNodes[i], parentVNode, ssrVNodeId, checkNestedElements);
        }
    }
    else if (nodeType === 3 /* TextNode */ &&
        (previousComment = node.previousSibling) &&
        domApi.$nodeType(previousComment) === 8 /* CommentNode */) {
        // split the start comment's data with a period
        childVNodeSplt = domApi.$getTextContent(previousComment).split('.');
        // ensure this is an ssr text node start comment
        // which should start with an "s" and delimited by periods
        if (childVNodeSplt[0] === 's' && childVNodeSplt[1] === ssrVNodeId) {
            // cool, this is a text node and it's got a start comment
            childVNode = { vtext: domApi.$getTextContent(node) };
            childVNode.elm = node;
            // this is a new child vnode
            // so ensure its parent vnode has the vchildren array
            if (!parentVNode.vchildren) {
                parentVNode.vchildren = [];
            }
            // add our child vnode to a specific index of the vnode's children
            parentVNode.vchildren[childVNodeSplt[2]] = childVNode;
        }
    }
}

const createQueueClient = (App, win) => {
    if (!_BUILD_.updatable) {
        const resolved = Promise.resolve();
        const tick = (cb) => {
            resolved.then(() => {
                try {
                    cb(win.performance.now());
                }
                catch (e) {
                    console.error(e);
                }
            });
        };
        return {
            tick: tick,
            read: tick,
            write: tick,
        };
    }
    else {
        let congestion = 0;
        let rafPending = false;
        const now = () => win.performance.now();
        const async = App.asyncQueue !== false;
        const resolved = Promise.resolve();
        const highPriority = [];
        const domReads = [];
        const domWrites = [];
        const domWritesLow = [];
        const queueTask = (queue) => (cb) => {
            // queue dom reads
            queue.push(cb);
            if (!rafPending) {
                rafPending = true;
                App.raf(flush);
            }
        };
        const consume = (queue) => {
            for (let i = 0; i < queue.length; i++) {
                try {
                    queue[i](now());
                }
                catch (e) {
                    console.error(e);
                }
            }
            queue.length = 0;
        };
        const consumeTimeout = (queue, timeout) => {
            let i = 0;
            let ts;
            while (i < queue.length && (ts = now()) < timeout) {
                try {
                    queue[i++](ts);
                }
                catch (e) {
                    console.error(e);
                }
            }
            if (i === queue.length) {
                queue.length = 0;
            }
            else if (i !== 0) {
                queue.splice(0, i);
            }
        };
        const flush = () => {
            congestion++;
            // always force a bunch of medium callbacks to run, but still have
            // a throttle on how many can run in a certain time
            // DOM READS!!!
            consume(domReads);
            const timeout = async
                ? now() + (7 * Math.ceil(congestion * (1.0 / 22.0)))
                : Infinity;
            // DOM WRITES!!!
            consumeTimeout(domWrites, timeout);
            consumeTimeout(domWritesLow, timeout);
            if (domWrites.length > 0) {
                domWritesLow.push(...domWrites);
                domWrites.length = 0;
            }
            if (rafPending = ((domReads.length + domWrites.length + domWritesLow.length) > 0)) {
                // still more to do yet, but we've run out of time
                // let's let this thing cool off and try again in the next tick
                App.raf(flush);
            }
            else {
                congestion = 0;
            }
        };
        if (!App.raf) {
            App.raf = win.requestAnimationFrame.bind(win);
        }
        return {
            tick(cb) {
                // queue high priority work to happen in next tick
                // uses Promise.resolve() for next tick
                highPriority.push(cb);
                if (highPriority.length === 1) {
                    resolved.then(() => consume(highPriority));
                }
            },
            read: queueTask(domReads),
            write: queueTask(domWrites),
        };
    }
};

function initElementListeners(plt, elm) {
    // so the element was just connected, which means it's in the DOM
    // however, the component instance hasn't been created yet
    // but what if an event it should be listening to get emitted right now??
    // let's add our listeners right now to our element, and if it happens
    // to receive events between now and the instance being created let's
    // queue up all of the event data and fire it off on the instance when it's ready
    const cmpMeta = plt.getComponentMeta(elm);
    if (cmpMeta.listenersMeta) {
        // we've got listens
        cmpMeta.listenersMeta.forEach(listenMeta => {
            // go through each listener
            if (!listenMeta.eventDisabled) {
                // only add ones that are not already disabled
                plt.domApi.$addEventListener(elm, listenMeta.eventName, createListenerCallback(plt, elm, listenMeta.eventMethodName), 1, listenMeta.eventCapture, listenMeta.eventPassive);
            }
        });
    }
}
function createListenerCallback(plt, elm, eventMethodName, val) {
    // create the function that gets called when the element receives
    // an event which it should be listening for
    return (ev) => {
        // get the instance if it exists
        val = plt.instanceMap.get(elm);
        if (val) {
            // instance is ready, let's call it's member method for this event
            val[eventMethodName](ev);
        }
        else {
            // instance is not ready!!
            // let's queue up this event data and replay it later
            // when the instance is ready
            val = (plt.queuedEvents.get(elm) || []);
            val.push(eventMethodName, ev);
            plt.queuedEvents.set(elm, val);
        }
    };
}
function enableEventListener(plt, instance, eventName, shouldEnable, attachTo, passive) {
    if (instance) {
        // cool, we've got an instance, it's get the element it's on
        const elm = plt.hostElementMap.get(instance);
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta && cmpMeta.listenersMeta) {
            // alrighty, so this cmp has listener meta
            if (shouldEnable) {
                // we want to enable this event
                // find which listen meta we're talking about
                const listenMeta = cmpMeta.listenersMeta.find(l => l.eventName === eventName);
                if (listenMeta) {
                    // found the listen meta, so let's add the listener
                    plt.domApi.$addEventListener(elm, eventName, (ev) => instance[listenMeta.eventMethodName](ev), 1, listenMeta.eventCapture, (passive === undefined) ? listenMeta.eventPassive : !!passive, attachTo);
                }
            }
            else {
                // we're disabling the event listener
                // so let's just remove it entirely
                plt.domApi.$removeEventListener(elm, eventName, 1);
            }
        }
    }
}

function generateDevInspector(namespace, win, plt, components) {
    const devInspector = win.devInspector = (win.devInspector || {});
    devInspector.apps = devInspector.apps || [];
    devInspector.apps.push(generateDevInspectorApp(namespace, plt, components));
    if (!devInspector.getInstance) {
        devInspector.getInstance = (elm) => {
            return Promise.all(devInspector.apps.map(app => {
                return app.getInstance(elm);
            })).then(results => {
                return results.find(instance => !!instance);
            });
        };
    }
    if (!devInspector.getComponents) {
        devInspector.getComponents = () => {
            const appsMetadata = [];
            devInspector.apps.forEach(app => {
                appsMetadata.push(app.getComponents());
            });
            return Promise.all(appsMetadata).then(appMetadata => {
                const allMetadata = [];
                appMetadata.forEach(metadata => {
                    metadata.forEach(m => {
                        allMetadata.push(m);
                    });
                });
                return allMetadata;
            });
        };
    }
    return devInspector;
}
function generateDevInspectorApp(namespace, plt, components) {
    const app = {
        namespace: namespace,
        getInstance: (elm) => {
            if (elm && elm.tagName) {
                return Promise.all([
                    getComponentMeta(plt, elm.tagName),
                    getComponentInstance(plt, elm)
                ]).then(results => {
                    if (results[0] && results[1]) {
                        const cmp = {
                            meta: results[0],
                            instance: results[1]
                        };
                        return cmp;
                    }
                    return null;
                });
            }
            return Promise.resolve(null);
        },
        getComponent: (tagName) => {
            return getComponentMeta(plt, tagName);
        },
        getComponents: () => {
            return Promise.all(components.map(cmp => {
                return getComponentMeta(plt, cmp[0]);
            })).then(metadata => {
                return metadata.filter(m => m);
            });
        }
    };
    return app;
}
function getMembersMeta(properties) {
    return Object.keys(properties).reduce((membersMap, memberKey) => {
        const prop = properties[memberKey];
        let category;
        const member = {
            name: memberKey
        };
        if (prop.state) {
            category = 'states';
            member.watchers = prop.watchCallbacks || [];
        }
        else if (prop.elementRef) {
            category = 'elements';
        }
        else if (prop.method) {
            category = 'methods';
        }
        else {
            category = 'props';
            let type = 'any';
            if (prop.type) {
                type = prop.type;
                if (typeof prop.type === 'function') {
                    type = prop.type.name;
                }
            }
            member.type = type.toLowerCase();
            member.mutable = prop.mutable || false;
            member.connect = prop.connect || '-';
            member.context = prop.connect || '-';
            member.watchers = prop.watchCallbacks || [];
        }
        membersMap[category].push(member);
        return membersMap;
    }, {
        props: [],
        states: [],
        elements: [],
        methods: []
    });
}
function getComponentMeta(plt, tagName) {
    const elm = { nodeName: tagName };
    const internalMeta = plt.getComponentMeta(elm);
    if (!internalMeta || !internalMeta.componentConstructor) {
        return Promise.resolve(null);
    }
    const cmpCtr = internalMeta.componentConstructor;
    const members = getMembersMeta(cmpCtr.properties || {});
    const listeners = (internalMeta.listenersMeta || []).map(listenerMeta => {
        return {
            event: listenerMeta.eventName,
            capture: listenerMeta.eventCapture,
            disabled: listenerMeta.eventDisabled,
            passive: listenerMeta.eventPassive,
            method: listenerMeta.eventMethodName
        };
    });
    const emmiters = cmpCtr.events || [];
    const meta = Object.assign({ tag: cmpCtr.is, bundle: (internalMeta.bundleIds || 'unknown'), encapsulation: cmpCtr.encapsulation || 'none' }, members, { events: {
            emmiters,
            listeners
        } });
    return Promise.resolve(meta);
}
function getComponentInstance(plt, elm) {
    return Promise.resolve(plt.instanceMap.get(elm));
}

/**
 * Production h() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */
const stack = [];
function h(nodeName, vnodeData) {
    let children = null;
    let lastSimple = false;
    let simple = false;
    let i = arguments.length;
    let vkey;
    let vname;
    for (; i-- > 2;) {
        stack.push(arguments[i]);
    }
    while (stack.length > 0) {
        let child = stack.pop();
        if (child && child.pop !== undefined) {
            for (i = child.length; i--;) {
                stack.push(child[i]);
            }
        }
        else {
            if (typeof child === 'boolean') {
                child = null;
            }
            if ((simple = typeof nodeName !== 'function')) {
                if (child == null) {
                    child = '';
                }
                else if (typeof child === 'number') {
                    child = String(child);
                }
                else if (typeof child !== 'string') {
                    simple = false;
                }
            }
            if (simple && lastSimple) {
                children[children.length - 1].vtext += child;
            }
            else if (children === null) {
                children = [simple ? { vtext: child } : child];
            }
            else {
                children.push(simple ? { vtext: child } : child);
            }
            lastSimple = simple;
        }
    }
    if (vnodeData != null) {
        // normalize class / classname attributes
        if (vnodeData['className']) {
            vnodeData['class'] = vnodeData['className'];
        }
        if (typeof vnodeData['class'] === 'object') {
            for (i in vnodeData['class']) {
                if (vnodeData['class'][i]) {
                    stack.push(i);
                }
            }
            vnodeData['class'] = stack.join(' ');
            stack.length = 0;
        }
        if (vnodeData.key != null) {
            vkey = vnodeData.key;
        }
        if (vnodeData.name != null) {
            vname = vnodeData.name;
        }
    }
    if (typeof nodeName === 'function') {
        // nodeName is a functional component
        return nodeName(vnodeData, children || [], utils);
    }
    return {
        vtag: nodeName,
        vchildren: children,
        vtext: undefined,
        vattrs: vnodeData,
        vkey: vkey,
        vname: vname,
        elm: undefined,
        ishost: false
    };
}
const utils = {
    'forEach': (children, cb) => children.forEach(cb),
    'map': (children, cb) => children.map(cb)
};

const initCoreComponentOnReady = (plt, App, win, apps, queuedComponentOnReadys, i) => {
    // add componentOnReady() to the App object
    // this also is used to know that the App's core is ready
    App.componentOnReady = (elm, resolve) => {
        if (!elm.nodeName.includes('-')) {
            resolve(null);
            return false;
        }
        const cmpMeta = plt.getComponentMeta(elm);
        if (cmpMeta) {
            if (plt.isCmpReady.has(elm)) {
                // element has already loaded, pass the resolve the element component
                // so we know that the resolve knows it this element is an app component
                resolve(elm);
            }
            else {
                // element hasn't loaded yet or it has an update in progress
                // add this resolve specifically to this elements on ready queue
                const onReadyCallbacks = plt.onReadyCallbacksMap.get(elm) || [];
                onReadyCallbacks.push(resolve);
                plt.onReadyCallbacksMap.set(elm, onReadyCallbacks);
            }
        }
        // return a boolean if this app recognized this element or not
        return !!cmpMeta;
    };
    if (queuedComponentOnReadys) {
        // we've got some componentOnReadys in the queue before the app was ready
        for (i = queuedComponentOnReadys.length - 1; i >= 0; i--) {
            // go through each element and see if this app recongizes it
            if (App.componentOnReady(queuedComponentOnReadys[i][0], queuedComponentOnReadys[i][1])) {
                // turns out this element belongs to this app
                // remove the resolve from the queue so in the end
                // all that's left in the queue are elements not apart of any apps
                queuedComponentOnReadys.splice(i, 1);
            }
        }
        for (i = 0; i < apps.length; i++) {
            if (!win[apps[i]].componentOnReady) {
                // there is at least 1 apps that isn't ready yet
                // so let's stop here cuz there's still app cores loading
                return;
            }
        }
        // if we got to this point then that means all of the apps are ready
        // and they would have removed any of their elements from queuedComponentOnReadys
        // so let's do the cleanup of the  remaining queuedComponentOnReadys
        for (i = 0; i < queuedComponentOnReadys.length; i++) {
            // resolve any queued componentsOnReadys that are left over
            // since these elements were not apart of any apps
            // call the resolve fn, but pass null so it's know this wasn't a known app component
            queuedComponentOnReadys[i][1](null);
        }
        queuedComponentOnReadys.length = 0;
    }
};

function attributeChangedCallback(attrPropsMap, elm, attribName, newVal) {
    // look up to see if we have a property wired up to this attribute name
    const propName = attrPropsMap[toLowerCase(attribName)];
    if (propName) {
        // there is not need to cast the value since, it's already casted when
        // the prop is setted
        elm[propName] = newVal === null && typeof elm[propName] === 'boolean'
            ? false
            : newVal;
    }
}

const initHostSnapshot = (domApi, cmpMeta, hostElm, hostSnapshot, attribName) => {
    // the host element has connected to the dom
    // and we've waited a tick to make sure all frameworks
    // have finished adding attributes and child nodes to the host
    // before we go all out and hydrate this beast
    // let's first take a snapshot of its original layout before render
    if (!hostElm.mode) {
        // looks like mode wasn't set as a property directly yet
        // first check if there's an attribute
        // next check the app's global
        hostElm.mode = domApi.$getMode(hostElm);
    }
    if (_BUILD_.slotPolyfill) {
        // if the slot polyfill is required we'll need to put some nodes
        // in here to act as original content anchors as we move nodes around
        // host element has been connected to the DOM
        if (!hostElm['s-cr'] && !domApi.$getAttribute(hostElm, SSR_VNODE_ID) && (!domApi.$supportsShadowDom || cmpMeta.encapsulationMeta !== 1 /* ShadowDom */)) {
            // only required when we're NOT using native shadow dom (slot)
            // or this browser doesn't support native shadow dom
            // and this host element was NOT created with SSR
            // let's pick out the inner content for slot projection
            // create a node to represent where the original
            // content was first placed, which is useful later on
            hostElm['s-cr'] = domApi.$createTextNode('');
            hostElm['s-cr']['s-cn'] = true;
            domApi.$insertBefore(hostElm, hostElm['s-cr'], domApi.$childNodes(hostElm)[0]);
        }
        if ((_BUILD_.es5 || _BUILD_.scoped) && !domApi.$supportsShadowDom && cmpMeta.encapsulationMeta === 1 /* ShadowDom */) {
            // this component should use shadow dom
            // but this browser doesn't support it
            // so let's polyfill a few things for the user
            if (window.HTMLElement && !('shadowRoot' in window.HTMLElement.prototype)) {
                hostElm.shadowRoot = hostElm;
            }
        }
    }
    if (_BUILD_.shadowDom) {
        if (cmpMeta.encapsulationMeta === 1 /* ShadowDom */ && domApi.$supportsShadowDom && !hostElm.shadowRoot) {
            // this component is using shadow dom
            // and this browser supports shadow dom
            // add the read-only property "shadowRoot" to the host element
            domApi.$attachShadow(hostElm, { mode: 'open' });
        }
    }
    // create a host snapshot object we'll
    // use to store all host data about to be read later
    hostSnapshot = {
        $attributes: {}
    };
    if (_BUILD_.hasMembers) {
        // loop through and gather up all the original attributes on the host
        // this is useful later when we're creating the component instance
        cmpMeta.membersMeta && Object.keys(cmpMeta.membersMeta).forEach(memberName => {
            if (attribName = cmpMeta.membersMeta[memberName].attribName) {
                hostSnapshot.$attributes[attribName] = domApi.$getAttribute(hostElm, attribName);
            }
        });
    }
    return hostSnapshot;
};

const connectedCallback = (plt, cmpMeta, elm, perf) => {
    if (_BUILD_.listener) {
        // initialize our event listeners on the host element
        // we do this now so that we can listening to events that may
        // have fired even before the instance is ready
        if (!plt.hasListenersMap.has(elm)) {
            // it's possible we've already connected
            // then disconnected
            // and the same element is reconnected again
            plt.hasListenersMap.set(elm, true);
            initElementListeners(plt, elm);
        }
    }
    // this element just connected, which may be re-connecting
    // ensure we remove it from our map of disconnected
    plt.isDisconnectedMap.delete(elm);
    if (!plt.hasConnectedMap.has(elm)) {
        if (_BUILD_.profile) {
            if (!elm['s-id']) {
                // assign a unique id to this host element
                // it's possible this was already given an element id
                elm['s-id'] = plt.nextId();
            }
            perf.mark(`connected_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        }
        plt.hasConnectedComponent = true;
        plt.processingCmp.add(elm);
        // first time we've connected
        plt.hasConnectedMap.set(elm, true);
        // register this component as an actively
        // loading child to its parent component
        registerWithParentComponent(plt, elm);
        // add to the queue to load the bundle
        // it's important to have an async tick in here so we can
        // ensure the "mode" attribute has been added to the element
        // place in high priority since it's not much work and we need
        // to know as fast as possible, but still an async tick in between
        plt.queue.tick(() => {
            // start loading this component mode's bundle
            // if it's already loaded then the callback will be synchronous
            plt.hostSnapshotMap.set(elm, initHostSnapshot(plt.domApi, cmpMeta, elm));
            if (_BUILD_.profile) {
                perf.mark(`connected_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                perf.measure(`connected:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `connected_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `connected_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            }
            plt.requestBundle(cmpMeta, elm);
        });
    }
};
const registerWithParentComponent = (plt, elm, ancestorHostElement) => {
    // find the first ancestor host element (if there is one) and register
    // this element as one of the actively loading child elements for its ancestor
    ancestorHostElement = elm;
    while (ancestorHostElement = plt.domApi.$parentElement(ancestorHostElement)) {
        // climb up the ancestors looking for the first registered component
        if (plt.isDefinedComponent(ancestorHostElement)) {
            // we found this elements the first ancestor host element
            // if the ancestor already loaded then do nothing, it's too late
            if (!plt.isCmpReady.has(elm)) {
                // keep a reference to this element's ancestor host element
                // elm._ancestorHostElement = ancestorHostElement;
                plt.ancestorHostElementMap.set(elm, ancestorHostElement);
                // ensure there is an array to contain a reference to each of the child elements
                // and set this element as one of the ancestor's child elements it should wait on
                (ancestorHostElement['s-ld'] = ancestorHostElement['s-ld'] || []).push(elm);
            }
            break;
        }
    }
};

function initEventEmitters(plt, cmpEvents, instance) {
    if (cmpEvents) {
        const elm = plt.hostElementMap.get(instance);
        cmpEvents.forEach(eventMeta => {
            instance[eventMeta.method] = {
                emit: (data) => plt.emitEvent(elm, eventMeta.name, {
                    bubbles: eventMeta.bubbles,
                    composed: eventMeta.composed,
                    cancelable: eventMeta.cancelable,
                    detail: data
                })
            };
        });
    }
}

const parseComponentLoader = (cmpRegistryData, i, cmpData) => {
    // tag name will always be lower case
    // parse member meta
    // this data only includes props that are attributes that need to be observed
    // it does not include all of the props yet
    const [tagNameMeta, bundleIds, , memberData, encapsulationMeta, listenerMeta] = cmpRegistryData;
    const membersMeta = {
        // every component defaults to always have
        // the mode and color properties
        // but only color should observe any attribute changes
        'color': { attribName: 'color' }
    };
    if (_BUILD_.hasMembers && memberData) {
        for (i = 0; i < memberData.length; i++) {
            cmpData = memberData[i];
            membersMeta[cmpData[0]] = {
                memberType: cmpData[1],
                reflectToAttrib: !!cmpData[2],
                attribName: typeof cmpData[3] === 'string' ? cmpData[3] : cmpData[3] ? cmpData[0] : 0,
                propType: cmpData[4]
            };
        }
    }
    return {
        tagNameMeta,
        // map of the bundle ids
        // can contain modes, and array of esm and es5 bundle ids
        bundleIds,
        membersMeta: Object.assign({}, membersMeta),
        // encapsulation
        encapsulationMeta,
        // parse listener meta
        listenersMeta: listenerMeta ? listenerMeta.map(parseListenerData) : undefined
    };
};
const parseListenerData = (listenerData) => ({
    eventName: listenerData[0],
    eventMethodName: listenerData[1],
    eventDisabled: !!listenerData[2],
    eventPassive: !!listenerData[3],
    eventCapture: !!listenerData[4]
});
const parsePropertyValue = (propType, propValue) => {
    // ensure this value is of the correct prop type
    // we're testing both formats of the "propType" value because
    // we could have either gotten the data from the attribute changed callback,
    // which wouldn't have Constructor data yet, and because this method is reused
    // within proxy where we don't have meta data, but only constructor data
    if (isDef(propValue) && typeof propValue !== 'object' && typeof propValue !== 'function') {
        if (propType === Boolean || propType === 4 /* Boolean */) {
            // per the HTML spec, any string value means it is a boolean true value
            // but we'll cheat here and say that the string "false" is the boolean false
            return (propValue === 'false' ? false : propValue === '' || !!propValue);
        }
        if (propType === Number || propType === 8 /* Number */) {
            // force it to be a number
            return parseFloat(propValue);
        }
        if (propType === String || propType === 2 /* String */) {
            // could have been passed as a number or boolean
            // but we still want it as a string
            return propValue.toString();
        }
        // redundant return here for better minification
        return propValue;
    }
    // not sure exactly what type we want
    // so no need to change to a different type
    return propValue;
};

const render = (plt, cmpMeta, hostElm, instance, perf) => {
    try {
        if (_BUILD_.profile) {
            perf.mark(`render_start:${hostElm.nodeName.toLowerCase()}`);
        }
        // if this component has a render function, let's fire
        // it off and generate the child vnodes for this host element
        // note that we do not create the host element cuz it already exists
        const hostMeta = cmpMeta.componentConstructor.host;
        const encapsulation = cmpMeta.componentConstructor.encapsulation;
        // test if this component should be shadow dom
        // and if so does the browser supports it
        const useNativeShadowDom = (_BUILD_.shadowDom && encapsulation === 'shadow' && plt.domApi.$supportsShadowDom);
        let reflectHostAttr;
        let rootElm = hostElm;
        if (_BUILD_.reflectToAttr) {
            reflectHostAttr = reflectInstanceValuesToHostAttributes(cmpMeta.componentConstructor.properties, instance);
        }
        // this component SHOULD use native slot/shadow dom
        // this browser DOES support native shadow dom
        // and this is the first render
        // let's create that shadow root
        // test if this component should be shadow dom
        // and if so does the browser supports it
        if (_BUILD_.shadowDom && useNativeShadowDom) {
            rootElm = hostElm.shadowRoot;
        }
        if (_BUILD_.styles && !hostElm['s-rn']) {
            // attach the styles this component needs, if any
            // this fn figures out if the styles should go in a
            // shadow root or if they should be global
            plt.attachStyles(plt, plt.domApi, cmpMeta, hostElm);
            const scopeId = hostElm['s-sc'];
            if (scopeId) {
                plt.domApi.$addClass(hostElm, getElementScopeId(scopeId, true));
                if (encapsulation === 'scoped') {
                    plt.domApi.$addClass(hostElm, getElementScopeId(scopeId));
                }
            }
        }
        if (instance.render || instance.hostData || hostMeta || reflectHostAttr) {
            // tell the platform we're actively rendering
            // if a value is changed within a render() then
            // this tells the platform not to queue the change
            plt.activeRender = true;
            const vnodeChildren = instance.render && instance.render();
            let vnodeHostData;
            if (_BUILD_.hostData) {
                // user component provided a "hostData()" method
                // the returned data/attributes are used on the host element
                vnodeHostData = instance.hostData && instance.hostData();
                if (_BUILD_.isDev) {
                    if (vnodeHostData && cmpMeta.membersMeta) {
                        const foundHostKeys = Object.keys(vnodeHostData).reduce((err, k) => {
                            if (cmpMeta.membersMeta[k]) {
                                return err.concat(k);
                            }
                            if (cmpMeta.membersMeta[dashToPascalCase(k)]) {
                                return err.concat(dashToPascalCase(k));
                            }
                            return err;
                        }, []);
                        if (foundHostKeys.length > 0) {
                            throw new Error(`The following keys were attempted to be set with hostData() from the ` +
                                `${cmpMeta.tagNameMeta} component: ${foundHostKeys.join(', ')}. ` +
                                `If you would like to modify these please set @Prop({ mutable: true, reflectToAttr: true}) ` +
                                `on the @Prop() decorator.`);
                        }
                    }
                }
            }
            if (_BUILD_.reflectToAttr && reflectHostAttr) {
                vnodeHostData = vnodeHostData ? Object.assign(vnodeHostData, reflectHostAttr) : reflectHostAttr;
            }
            // tell the platform we're done rendering
            // now any changes will again queue
            plt.activeRender = false;
            if (_BUILD_.hostTheme && hostMeta) {
                // component meta data has a "theme"
                // use this to automatically generate a good css class
                // from the mode and color to add to the host element
                vnodeHostData = applyComponentHostData(vnodeHostData, hostMeta, instance);
            }
            // looks like we've got child nodes to render into this host element
            // or we need to update the css class/attrs on the host element
            const hostVNode = h(null, vnodeHostData, vnodeChildren);
            // if we haven't already created a vnode, then we give the renderer the actual element
            // if this is a re-render, then give the renderer the last vnode we already created
            const oldVNode = plt.vnodeMap.get(hostElm) || {};
            oldVNode.elm = rootElm;
            if (_BUILD_.reflectToAttr) {
                // only care if we're reflecting values to the host element
                hostVNode.ishost = true;
            }
            // each patch always gets a new vnode
            // the host element itself isn't patched because it already exists
            // kick off the actual render and any DOM updates
            plt.vnodeMap.set(hostElm, plt.render(hostElm, oldVNode, hostVNode, useNativeShadowDom, encapsulation));
        }
        // update styles!
        if (_BUILD_.cssVarShim && plt.customStyle) {
            plt.customStyle.updateHost(hostElm);
        }
        // it's official, this element has rendered
        hostElm['s-rn'] = true;
        if (hostElm['s-rc']) {
            // ok, so turns out there are some child host elements
            // waiting on this parent element to load
            // let's fire off all update callbacks waiting
            hostElm['s-rc'].forEach(cb => cb());
            hostElm['s-rc'] = null;
        }
        if (_BUILD_.profile) {
            perf.mark(`render_end:${hostElm.nodeName.toLowerCase()}`);
            perf.measure(`render:${hostElm.nodeName.toLowerCase()}`, `render_start:${hostElm.nodeName.toLowerCase()}`, `render_end:${hostElm.nodeName.toLowerCase()}`);
        }
    }
    catch (e) {
        plt.activeRender = false;
        plt.onError(e, 8 /* RenderError */, hostElm, true);
    }
};
const applyComponentHostData = (vnodeHostData, hostMeta, instance) => {
    vnodeHostData = vnodeHostData || {};
    // component meta data has a "theme"
    // use this to automatically generate a good css class
    // from the mode and color to add to the host element
    Object.keys(hostMeta).forEach(key => {
        if (key === 'theme') {
            // host: { theme: 'button' }
            // adds css classes w/ mode and color combinations
            // class="button button-md button-primary button-md-primary"
            convertCssNamesToObj(vnodeHostData['class'] = vnodeHostData['class'] || {}, hostMeta[key], instance.mode, instance.color);
        }
        else if (key === 'class') {
            // host: { class: 'multiple css-classes' }
            // class="multiple css-classes"
            convertCssNamesToObj(vnodeHostData[key] = vnodeHostData[key] || {}, hostMeta[key]);
        }
        else {
            // rando attribute/properties
            vnodeHostData[key] = hostMeta[key];
        }
    });
    return vnodeHostData;
};
const convertCssNamesToObj = (cssClassObj, className, mode, color) => {
    className.split(' ').forEach(cssClass => {
        cssClassObj[cssClass] = true;
        if (mode) {
            cssClassObj[`${cssClass}-${mode}`] = true;
            if (color) {
                cssClassObj[`${cssClass}-${mode}-${color}`] = cssClassObj[`${cssClass}-${color}`] = true;
            }
        }
    });
};
const reflectInstanceValuesToHostAttributes = (properties, instance, reflectHostAttr) => {
    if (properties) {
        Object.keys(properties).forEach(memberName => {
            if (properties[memberName].reflectToAttr) {
                reflectHostAttr = reflectHostAttr || {};
                reflectHostAttr[memberName] = instance[memberName];
            }
        });
    }
    return reflectHostAttr;
};

const queueUpdate = (plt, elm, perf) => {
    if (_BUILD_.profile) {
        perf.mark(`queue:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
    }
    // we're actively processing this component
    plt.processingCmp.add(elm);
    // only run patch if it isn't queued already
    if (!plt.isQueuedForUpdate.has(elm)) {
        plt.isQueuedForUpdate.set(elm, true);
        // run the patch in the next tick
        // vdom diff and patch the host element for differences
        if (plt.isAppLoaded) {
            // app has already loaded
            // let's queue this work in the dom write phase
            plt.queue.write(() => update(plt, elm, perf));
        }
        else {
            // app hasn't finished loading yet
            // so let's use next tick to do everything
            // as fast as possible
            plt.queue.tick(() => update(plt, elm, perf));
        }
    }
};
const update = async (plt, elm, perf, isInitialLoad, instance, ancestorHostElement) => {
    if (_BUILD_.isDev) {
        perf.mark(`update_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
    }
    // no longer queued for update
    plt.isQueuedForUpdate.delete(elm);
    // everything is async, so somehow we could have already disconnected
    // this node, so be sure to do nothing if we've already disconnected
    if (!plt.isDisconnectedMap.has(elm)) {
        instance = plt.instanceMap.get(elm);
        isInitialLoad = !instance;
        if (isInitialLoad) {
            ancestorHostElement = plt.ancestorHostElementMap.get(elm);
            if (ancestorHostElement && !ancestorHostElement['s-rn']) {
                // this is the intial load
                // this element has an ancestor host element
                // but the ancestor host element has NOT rendered yet
                // so let's just cool our jets and wait for the ancestor to render
                (ancestorHostElement['s-rc'] = ancestorHostElement['s-rc'] || []).push(() => {
                    // this will get fired off when the ancestor host element
                    // finally gets around to rendering its lazy self
                    update(plt, elm, perf);
                });
                return;
            }
            // haven't created a component instance for this host element yet!
            // create the instance from the user's component class
            // https://www.youtube.com/watch?v=olLxrojmvMg
            instance = initComponentInstance(plt, elm, plt.hostSnapshotMap.get(elm), perf);
            if (_BUILD_.cmpWillLoad && instance) {
                // this is the initial load and the instance was just created
                // fire off the user's componentWillLoad method (if one was provided)
                // componentWillLoad only runs ONCE, after instance's element has been
                // assigned as the host element, but BEFORE render() has been called
                try {
                    if (instance.componentWillLoad) {
                        if (_BUILD_.profile) {
                            perf.mark(`componentWillLoad_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                        }
                        await instance.componentWillLoad();
                        if (_BUILD_.profile) {
                            perf.mark(`componentWillLoad_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                            perf.measure(`componentWillLoad:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `componentWillLoad_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `componentWillLoad_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                        }
                    }
                }
                catch (e) {
                    plt.onError(e, 3 /* WillLoadError */, elm);
                }
            }
        }
        else if (_BUILD_.cmpWillUpdate && instance) {
            // component already initialized, this is an update
            // already created an instance and this is an update
            // fire off the user's componentWillUpdate method (if one was provided)
            // componentWillUpdate runs BEFORE render() has been called
            // but only BEFORE an UPDATE and not before the intial render
            // get the returned promise (if one was provided)
            try {
                if (instance.componentWillUpdate) {
                    if (_BUILD_.profile) {
                        perf.mark(`componentWillUpdate_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                    }
                    await instance.componentWillUpdate();
                    if (_BUILD_.profile) {
                        perf.mark(`componentWillUpdate_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                    }
                }
            }
            catch (e) {
                plt.onError(e, 5 /* WillUpdateError */, elm);
            }
        }
        // if this component has a render function, let's fire
        // it off and generate a vnode for this
        render(plt, plt.getComponentMeta(elm), elm, instance, perf);
        if (_BUILD_.isDev) {
            perf.mark(`update_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            perf.measure(`update:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `update_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `update_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        }
        elm['s-init']();
        if (_BUILD_.hotModuleReplacement) {
            elm['s-hmr-load'] && elm['s-hmr-load']();
        }
    }
};

const defineMember = (plt, property, elm, instance, memberName, hostSnapshot, perf, hostAttributes, hostAttrValue) => {
    function getComponentProp(values) {
        // component instance prop/state getter
        // get the property value directly from our internal values
        values = plt.valuesMap.get(plt.hostElementMap.get(this));
        return values && values[memberName];
    }
    function setComponentProp(newValue, elm) {
        // component instance prop/state setter (cannot be arrow fn)
        elm = plt.hostElementMap.get(this);
        if (elm) {
            if ((_BUILD_.state && property.state) || property.mutable) {
                setValue(plt, elm, memberName, newValue, perf);
            }
            else if (_BUILD_.verboseError) {
                console.warn(`@Prop() "${memberName}" on "${elm.tagName}" cannot be modified.`);
            }
        }
    }
    if ((_BUILD_.prop && property.type) || (_BUILD_.state && property.state)) {
        const values = plt.valuesMap.get(elm);
        if ((!_BUILD_.state || !property.state) && (_BUILD_.prop)) {
            if (property.attr && (values[memberName] === undefined || values[memberName] === '')) {
                // check the prop value from the host element attribute
                if ((hostAttributes = hostSnapshot && hostSnapshot.$attributes) && isDef(hostAttrValue = hostAttributes[property.attr])) {
                    // looks like we've got an attribute value
                    // let's set it to our internal values
                    values[memberName] = parsePropertyValue(property.type, hostAttrValue);
                }
            }
            if (_BUILD_.clientSide) {
                // client-side
                // within the browser, the element's prototype
                // already has its getter/setter set, but on the
                // server the prototype is shared causing issues
                // so instead the server's elm has the getter/setter
                // directly on the actual element instance, not its prototype
                // so on the browser we can use "hasOwnProperty"
                if (elm.hasOwnProperty(memberName)) {
                    // @Prop or @Prop({mutable:true})
                    // property values on the host element should override
                    // any default values on the component instance
                    if (values[memberName] === undefined) {
                        values[memberName] = parsePropertyValue(property.type, elm[memberName]);
                    }
                    // for the client only, let's delete its "own" property
                    // this way our already assigned getter/setter on the prototype kicks in
                    // the very special case is to NOT do this for "mode"
                    if (memberName !== 'mode') {
                        delete elm[memberName];
                    }
                }
            }
            else {
                // server-side
                // server-side elm has the getter/setter
                // on the actual element instance, not its prototype
                // on the server we cannot accurately use "hasOwnProperty"
                // instead we'll do a direct lookup to see if the
                // constructor has this property
                if (elementHasProperty(plt, elm, memberName)) {
                    // @Prop or @Prop({mutable:true})
                    // property values on the host element should override
                    // any default values on the component instance
                    if (values[memberName] === undefined) {
                        values[memberName] = elm[memberName];
                    }
                }
            }
        }
        if (instance.hasOwnProperty(memberName) && values[memberName] === undefined) {
            // @Prop() or @Prop({mutable:true}) or @State()
            // we haven't yet got a value from the above checks so let's
            // read any "own" property instance values already set
            // to our internal value as the source of getter data
            // we're about to define a property and it'll overwrite this "own" property
            values[memberName] = instance[memberName];
        }
        if (_BUILD_.watchCallback) {
            if (property.watchCallbacks) {
                values[WATCH_CB_PREFIX + memberName] = property.watchCallbacks.slice();
            }
        }
        // add getter/setter to the component instance
        // these will be pointed to the internal data set from the above checks
        definePropertyGetterSetter(instance, memberName, getComponentProp, setComponentProp);
    }
    else if (_BUILD_.element && property.elementRef) {
        // @Element()
        // add a getter to the element reference using
        // the member name the component meta provided
        definePropertyValue(instance, memberName, elm);
    }
    else if (_BUILD_.method && property.method) {
        // @Method()
        // add a property "value" on the host element
        // which we'll bind to the instance's method
        definePropertyValue(elm, memberName, instance[memberName].bind(instance));
    }
    else if (_BUILD_.propContext && property.context) {
        // @Prop({ context: 'config' })
        const contextObj = plt.getContextItem(property.context);
        if (contextObj !== undefined) {
            definePropertyValue(instance, memberName, (contextObj.getContext && contextObj.getContext(elm)) || contextObj);
        }
    }
    else if (_BUILD_.propConnect && property.connect) {
        // @Prop({ connect: 'ion-loading-ctrl' })
        definePropertyValue(instance, memberName, plt.propConnect(property.connect));
    }
};
const setValue = (plt, elm, memberName, newVal, perf, instance, values) => {
    // get the internal values object, which should always come from the host element instance
    // create the _values object if it doesn't already exist
    values = plt.valuesMap.get(elm);
    if (!values) {
        plt.valuesMap.set(elm, values = {});
    }
    const oldVal = values[memberName];
    // check our new property value against our internal value
    if (newVal !== oldVal) {
        // gadzooks! the property's value has changed!!
        // set our new value!
        // https://youtu.be/dFtLONl4cNc?t=22
        values[memberName] = newVal;
        instance = plt.instanceMap.get(elm);
        if (instance) {
            // get an array of method names of watch functions to call
            if (_BUILD_.watchCallback) {
                const watchMethods = values[WATCH_CB_PREFIX + memberName];
                if (watchMethods) {
                    // this instance is watching for when this property changed
                    for (let i = 0; i < watchMethods.length; i++) {
                        try {
                            // fire off each of the watch methods that are watching this property
                            instance[watchMethods[i]].call(instance, newVal, oldVal, memberName);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
            if (!plt.activeRender && elm['s-rn']) {
                // looks like this value actually changed, so we've got work to do!
                // but only if we've already rendered, otherwise just chill out
                // queue that we need to do an update, but don't worry about queuing
                // up millions cuz this function ensures it only runs once
                queueUpdate(plt, elm, perf);
            }
        }
    }
};
const definePropertyValue = (obj, propertyKey, value) => {
    // minification shortcut
    Object.defineProperty(obj, propertyKey, {
        configurable: true,
        value
    });
};
const definePropertyGetterSetter = (obj, propertyKey, get, set) => {
    // minification shortcut
    Object.defineProperty(obj, propertyKey, {
        configurable: true,
        get,
        set
    });
};
const WATCH_CB_PREFIX = `wc-`;

const proxyComponentInstance = (plt, cmpConstructor, elm, instance, hostSnapshot, perf) => {
    if (_BUILD_.profile) {
        perf.mark(`proxy_instance_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
    }
    // at this point we've got a specific node of a host element, and created a component class instance
    // and we've already created getters/setters on both the host element and component class prototypes
    // let's upgrade any data that might have been set on the host element already
    // and let's have the getters/setters kick in and do their jobs
    // let's automatically add a reference to the host element on the instance
    plt.hostElementMap.set(instance, elm);
    // create the values object if it doesn't already exist
    // this will hold all of the internal getter/setter values
    if (!plt.valuesMap.has(elm)) {
        plt.valuesMap.set(elm, {});
    }
    // get the properties from the constructor
    // and add default "mode" and "color" properties
    Object.entries(Object.assign({ color: { type: String } }, cmpConstructor.properties, { mode: { type: String } })).forEach(([memberName, property]) => {
        // define each of the members and initialize what their role is
        defineMember(plt, property, elm, instance, memberName, hostSnapshot, perf);
    });
    if (_BUILD_.profile) {
        perf.mark(`proxy_instance_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        perf.measure(`proxy_instance:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `proxy_instance_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `proxy_instance_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
    }
};

const initComponentInstance = (plt, elm, hostSnapshot, perf, instance, componentConstructor, queuedEvents, i) => {
    try {
        if (_BUILD_.profile) {
            perf.mark(`init_instance_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        }
        // using the user's component class, let's create a new instance
        componentConstructor = plt.getComponentMeta(elm).componentConstructor;
        instance = new componentConstructor();
        // ok cool, we've got an host element now, and a actual instance
        // and there were no errors creating the instance
        // let's upgrade the data on the host element
        // and let the getters/setters do their jobs
        proxyComponentInstance(plt, componentConstructor, elm, instance, hostSnapshot, perf);
        if (_BUILD_.event) {
            // add each of the event emitters which wire up instance methods
            // to fire off dom events from the host element
            initEventEmitters(plt, componentConstructor.events, instance);
        }
        if (_BUILD_.listener) {
            try {
                // replay any event listeners on the instance that
                // were queued up between the time the element was
                // connected and before the instance was ready
                queuedEvents = plt.queuedEvents.get(elm);
                if (queuedEvents) {
                    // events may have already fired before the instance was even ready
                    // now that the instance is ready, let's replay all of the events that
                    // we queued up earlier that were originally meant for the instance
                    for (i = 0; i < queuedEvents.length; i += 2) {
                        // data was added in sets of two
                        // first item the eventMethodName
                        // second item is the event data
                        // take a look at initElementListener()
                        instance[queuedEvents[i]](queuedEvents[i + 1]);
                    }
                    plt.queuedEvents.delete(elm);
                }
            }
            catch (e) {
                plt.onError(e, 2 /* QueueEventsError */, elm);
            }
        }
    }
    catch (e) {
        // something done went wrong trying to create a component instance
        // create a dumby instance so other stuff can load
        // but chances are the app isn't fully working cuz this component has issues
        instance = {};
        plt.onError(e, 7 /* InitInstanceError */, elm, true);
    }
    plt.instanceMap.set(elm, instance);
    if (_BUILD_.profile) {
        perf.mark(`init_instance_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        perf.measure(`init_instance:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `init_instance_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `init_instance_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
    }
    return instance;
};
const initComponentLoaded = (plt, elm, hydratedCssClass, perf, instance, onReadyCallbacks, hasCmpLoaded) => {
    if (_BUILD_.polyfills && !allChildrenHaveConnected(plt, elm)) {
        // this check needs to be done when using the customElements polyfill
        // since the polyfill uses MutationObserver which causes the
        // connectedCallbacks to fire async, which isn't ideal for the code below
        return;
    }
    // all is good, this component has been told it's time to finish loading
    // it's possible that we've already decided to destroy this element
    // check if this element has any actively loading child elements
    if ((instance = plt.instanceMap.get(elm)) &&
        !plt.isDisconnectedMap.has(elm) &&
        (!elm['s-ld'] || !elm['s-ld'].length)) {
        // cool, so at this point this element isn't already being destroyed
        // and it does not have any child elements that are still loading
        // all of this element's children have loaded (if any)
        plt.isCmpReady.set(elm, true);
        if (!(hasCmpLoaded = plt.isCmpLoaded.has(elm))) {
            if (_BUILD_.profile) {
                perf.mark(`init_loaded_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            }
            // remember that this component has loaded
            // isCmpLoaded map is useful to know if we should fire
            // the lifecycle componentDidLoad() or componentDidUpdate()
            plt.isCmpLoaded.set(elm, true);
            // ensure we remove any child references cuz it doesn't matter at this point
            elm['s-ld'] = undefined;
            // add the css class that this element has officially hydrated
            plt.domApi.$addClass(elm, hydratedCssClass);
        }
        try {
            // fire off the ref if it exists
            callNodeRefs(plt.vnodeMap.get(elm));
            // fire off the user's elm.componentOnReady() callbacks that were
            // put directly on the element (well before anything was ready)
            if (onReadyCallbacks = plt.onReadyCallbacksMap.get(elm)) {
                onReadyCallbacks.forEach(cb => cb(elm));
                plt.onReadyCallbacksMap.delete(elm);
            }
            if (_BUILD_.cmpDidLoad && !hasCmpLoaded && instance.componentDidLoad) {
                // we've never loaded this component
                // fire off the user's componentDidLoad method (if one was provided)
                // componentDidLoad only runs ONCE, after the instance's element has been
                // assigned as the host element, and AFTER render() has been called
                // and all the child componenets have finished loading
                if (_BUILD_.profile) {
                    perf.mark(`componentDidLoad_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                }
                instance.componentDidLoad();
                if (_BUILD_.profile) {
                    perf.mark(`componentDidLoad_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                    perf.measure(`componentDidLoad:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `componentDidLoad_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `componentDidLoad_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                }
            }
            else if (_BUILD_.cmpDidUpdate && hasCmpLoaded && instance.componentDidUpdate) {
                // we've already loaded this component
                // fire off the user's componentDidUpdate method (if one was provided)
                // componentDidUpdate runs AFTER render() has been called
                // and all child components have finished updating
                if (_BUILD_.profile) {
                    perf.mark(`componentDidUpdate_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                }
                instance.componentDidUpdate();
                if (_BUILD_.profile) {
                    perf.mark(`componentDidUpdate_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                    perf.measure(`componentDidUpdate:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `componentDidUpdate_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `componentDidUpdate_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                }
            }
        }
        catch (e) {
            plt.onError(e, 4 /* DidLoadError */, elm);
        }
        if (_BUILD_.profile && !hasCmpLoaded) {
            perf.mark(`init_loaded_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            perf.measure(`init_loaded:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `init_loaded_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `init_loaded_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            perf.measure(`loaded:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `connected_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `init_loaded_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        }
        // ( •_•)
        // ( •_•)>⌐■-■
        // (⌐■_■)
        // load events fire from bottom to top
        // the deepest elements load first then bubbles up
        propagateComponentReady(plt, elm);
    }
};
const allChildrenHaveConnected = (plt, elm) => {
    // Note: in IE11 <svg> does not have the "children" property
    for (let i = 0; i < elm.childNodes.length; i++) {
        const child = elm.childNodes[i];
        if (child.nodeType === 1 /* ElementNode */) {
            if (plt.getComponentMeta(child) && !plt.hasConnectedMap.has(child)) {
                // this is a defined componnent
                // but it hasn't connected yet
                return false;
            }
            if (!allChildrenHaveConnected(plt, child)) {
                // one of the defined child components hasn't connected yet
                return false;
            }
        }
    }
    // everything has connected, we're good
    return true;
};
const propagateComponentReady = (plt, elm, index, ancestorsActivelyLoadingChildren, ancestorHostElement, cb) => {
    // we're no longer processing this component
    plt.processingCmp.delete(elm);
    // load events fire from bottom to top
    // the deepest elements load first then bubbles up
    if ((ancestorHostElement = plt.ancestorHostElementMap.get(elm))) {
        // ok so this element already has a known ancestor host element
        // let's make sure we remove this element from its ancestor's
        // known list of child elements which are actively loading
        ancestorsActivelyLoadingChildren = ancestorHostElement['s-ld'];
        if (ancestorsActivelyLoadingChildren) {
            index = ancestorsActivelyLoadingChildren.indexOf(elm);
            if (index > -1) {
                // yup, this element is in the list of child elements to wait on
                // remove it so we can work to get the length down to 0
                ancestorsActivelyLoadingChildren.splice(index, 1);
            }
            // the ancestor's initLoad method will do the actual checks
            // to see if the ancestor is actually loaded or not
            // then let's call the ancestor's initLoad method if there's no length
            // (which actually ends up as this method again but for the ancestor)
            if (!ancestorsActivelyLoadingChildren.length) {
                ancestorHostElement['s-init'] && ancestorHostElement['s-init']();
            }
        }
        plt.ancestorHostElementMap.delete(elm);
    }
    if (plt.onAppReadyCallbacks.length && !plt.processingCmp.size) {
        // we've got some promises waiting on the entire app to be done processing
        // so it should have an empty queue and no longer rendering
        while ((cb = plt.onAppReadyCallbacks.shift())) {
            cb();
        }
    }
};

const disconnectedCallback = (plt, elm, perf) => {
    // only disconnect if we're not temporarily disconnected
    // tmpDisconnected will happen when slot nodes are being relocated
    if (!plt.tmpDisconnected && isDisconnected(plt.domApi, elm)) {
        if (_BUILD_.profile) {
            perf.mark(`disconnected_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        }
        // ok, let's officially destroy this thing
        // set this to true so that any of our pending async stuff
        // doesn't continue since we already decided to destroy this node
        // elm._hasDestroyed = true;
        plt.isDisconnectedMap.set(elm, true);
        // double check that we've informed the ancestor host elements
        // that they're good to go and loaded (cuz this one is on its way out)
        propagateComponentReady(plt, elm);
        // since we're disconnecting, call all of the JSX ref's with null
        callNodeRefs(plt.vnodeMap.get(elm), true);
        if (_BUILD_.cmpDidUnload) {
            // call instance componentDidUnload
            // if we've created an instance for this
            const instance = plt.instanceMap.get(elm);
            if (instance && instance.componentDidUnload) {
                // call the user's componentDidUnload if there is one
                instance.componentDidUnload();
            }
        }
        // detatch any event listeners that may have been added
        // because we're not passing an exact event name it'll
        // remove all of this element's event, which is good
        plt.domApi.$removeEventListener(elm);
        plt.hasListenersMap.delete(elm);
        // clear CSS var-shim tracking
        if (_BUILD_.cssVarShim && plt.customStyle) {
            plt.customStyle.removeHost(elm);
        }
        // clear any references to other elements
        // more than likely we've already deleted these references
        // but let's double check there pal
        [
            plt.ancestorHostElementMap,
            plt.onReadyCallbacksMap,
            plt.hostSnapshotMap
        ].forEach(wm => wm.delete(elm));
        if (_BUILD_.profile) {
            perf.mark(`disconnected_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            perf.measure(`disconnected:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `disconnected_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `disconnected_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
        }
    }
};
const isDisconnected = (domApi, elm) => {
    while (elm) {
        if (!domApi.$parentNode(elm)) {
            return domApi.$nodeType(elm) !== 9 /* DocumentNode */;
        }
        elm = domApi.$parentNode(elm);
    }
};

function hmrStart(plt, cmpMeta, elm, hmrVersionId) {
    // ¯\_(ツ)_/¯
    // keep the existing state
    // forget the constructor
    cmpMeta.componentConstructor = null;
    // no sir, this component has never loaded, not once, ever
    plt.isCmpLoaded.delete(elm);
    plt.isCmpReady.delete(elm);
    // forget the instance
    const instance = plt.instanceMap.get(elm);
    if (instance) {
        plt.hostElementMap.delete(instance);
        plt.instanceMap.delete(elm);
    }
    // detatch any event listeners that may have been added
    // because we're not passing an exact event name it'll
    // remove all of this element's event, which is good
    plt.domApi.$removeEventListener(elm);
    plt.hasListenersMap.delete(elm);
    cmpMeta.listenersMeta = null;
    // create a callback for when this component finishes hmr
    elm['s-hmr-load'] = () => {
        // finished hmr for this element
        delete elm['s-hmr-load'];
        hmrFinish(plt, cmpMeta, elm);
    };
    // create the new host snapshot from the element
    plt.hostSnapshotMap.set(elm, initHostSnapshot(plt.domApi, cmpMeta, elm));
    // request the bundle again
    plt.requestBundle(cmpMeta, elm, hmrVersionId);
}
function hmrFinish(plt, cmpMeta, elm) {
    if (!plt.hasListenersMap.has(elm)) {
        plt.hasListenersMap.set(elm, true);
        // initElementListeners works off of cmp metadata
        // but we just got new data from the constructor
        // so let's update the cmp metadata w/ constructor listener data
        if (cmpMeta.componentConstructor && cmpMeta.componentConstructor.listeners) {
            cmpMeta.listenersMeta = cmpMeta.componentConstructor.listeners.map(lstn => {
                const listenerMeta = {
                    eventMethodName: lstn.method,
                    eventName: lstn.name,
                    eventCapture: !!lstn.capture,
                    eventPassive: !!lstn.passive,
                    eventDisabled: !!lstn.disabled,
                };
                return listenerMeta;
            });
            initElementListeners(plt, elm);
        }
    }
}

const proxyHostElementPrototype = (plt, membersEntries, hostPrototype, perf) => {
    // create getters/setters on the host element prototype to represent the public API
    // the setters allows us to know when data has changed so we can re-render
    if (!_BUILD_.clientSide) {
        // in just a server-side build
        // let's set the properties to the values immediately
        let values = plt.valuesMap.get(hostPrototype);
        if (!values) {
            plt.valuesMap.set(hostPrototype, values = {});
        }
        membersEntries.forEach(([memberName, member]) => {
            const memberType = member.memberType;
            if (memberType & (1 /* Prop */ | 2 /* PropMutable */)) {
                values[memberName] = hostPrototype[memberName];
            }
        });
    }
    membersEntries.forEach(([memberName, member]) => {
        // add getters/setters
        const memberType = member.memberType;
        if ((memberType & (1 /* Prop */ | 2 /* PropMutable */)) && (_BUILD_.prop)) {
            // @Prop() or @Prop({ mutable: true })
            definePropertyGetterSetter(hostPrototype, memberName, function getHostElementProp() {
                // host element getter (cannot be arrow fn)
                // yup, ugly, srynotsry
                return (plt.valuesMap.get(this) || {})[memberName];
            }, function setHostElementProp(newValue) {
                // host element setter (cannot be arrow fn)
                setValue(plt, this, memberName, parsePropertyValue(member.propType, newValue), perf);
            });
        }
        else if (_BUILD_.method && memberType === 32 /* Method */) {
            // @Method()
            // add a placeholder noop value on the host element's prototype
            // incase this method gets called before setup
            definePropertyValue(hostPrototype, memberName, noop);
        }
    });
};

const initHostElement = (plt, cmpMeta, HostElementConstructor, hydratedCssClass, perf) => {
    // let's wire up our functions to the host element's prototype
    // we can also inject our platform into each one that needs that api
    // note: these cannot be arrow functions cuz "this" is important here hombre
    HostElementConstructor.connectedCallback = function () {
        // coolsville, our host element has just hit the DOM
        connectedCallback(plt, cmpMeta, this, perf);
    };
    HostElementConstructor.disconnectedCallback = function () {
        // the element has left the builing
        disconnectedCallback(plt, this, perf);
    };
    HostElementConstructor['s-init'] = function () {
        initComponentLoaded(plt, this, hydratedCssClass, perf);
    };
    HostElementConstructor.forceUpdate = function () {
        queueUpdate(plt, this, perf);
    };
    if (_BUILD_.hotModuleReplacement) {
        HostElementConstructor['s-hmr'] = function (hmrVersionId) {
            hmrStart(plt, cmpMeta, this, hmrVersionId);
        };
    }
    if (_BUILD_.hasMembers && cmpMeta.membersMeta) {
        const entries = Object.entries(cmpMeta.membersMeta);
        if (_BUILD_.observeAttr) {
            let attrToProp = {};
            entries.forEach(([propName, { attribName }]) => {
                if (attribName) {
                    attrToProp[attribName] = propName;
                }
            });
            attrToProp = Object.assign({}, attrToProp);
            HostElementConstructor.attributeChangedCallback = function (attribName, _oldVal, newVal) {
                // the browser has just informed us that an attribute
                // on the host element has changed
                attributeChangedCallback(attrToProp, this, attribName, newVal);
            };
        }
        // add getters/setters to the host element members
        // these would come from the @Prop and @Method decorators that
        // should create the public API to this component
        proxyHostElementPrototype(plt, entries, HostElementConstructor, perf);
    }
};

const proxyController = (domApi, controllerComponents, ctrlTag) => ({
    'create': proxyProp(domApi, controllerComponents, ctrlTag, 'create'),
    'componentOnReady': proxyProp(domApi, controllerComponents, ctrlTag, 'componentOnReady')
});
const proxyProp = (domApi, controllerComponents, ctrlTag, proxyMethodName) => function () {
    const args = arguments;
    return loadComponent(domApi, controllerComponents, ctrlTag)
        .then(ctrlElm => ctrlElm[proxyMethodName].apply(ctrlElm, args));
};
const loadComponent = (domApi, controllerComponents, ctrlTag, ctrlElm, body) => {
    ctrlElm = controllerComponents[ctrlTag];
    body = domApi.$doc.body;
    if (body) {
        if (!ctrlElm) {
            ctrlElm = body.querySelector(ctrlTag);
        }
        if (!ctrlElm) {
            ctrlElm = controllerComponents[ctrlTag] = domApi.$createElement(ctrlTag);
            domApi.$appendChild(body, ctrlElm);
        }
        return ctrlElm.componentOnReady();
    }
    return Promise.resolve();
};

const createPlatformMain = (namespace, Context, win, doc, resourcesUrl, hydratedCssClass, components) => {
    const perf = win.performance;
    const cmpRegistry = { 'html': {} };
    const controllerComponents = {};
    const App = win[namespace] = win[namespace] || {};
    const domApi = createDomApi(App, win, doc);
    const rootElm = domApi.$doc.documentElement;
    // keep a global set of tags we've already defined
    const globalDefined = win['s-defined'] = (win['s-defined'] || {});
    const defineComponent = (cmpMeta, HostElementConstructor) => {
        if (!win.customElements.get(cmpMeta.tagNameMeta)) {
            // define the custom element
            // initialize the members on the host element prototype
            // keep a ref to the metadata with the tag as the key
            initHostElement(plt, (cmpRegistry[cmpMeta.tagNameMeta] = cmpMeta), HostElementConstructor.prototype, hydratedCssClass, perf);
            if (_BUILD_.observeAttr) {
                // add which attributes should be observed
                // at this point the membersMeta only includes attributes which should
                // be observed, it does not include all props yet, so it's safe to
                // loop through all of the props (attrs) and observed them
                // set the array of all the attributes to keep an eye on
                // https://www.youtube.com/watch?v=RBs21CFBALI
                HostElementConstructor.observedAttributes = Object.values(cmpMeta.membersMeta)
                    .map(member => member.attribName)
                    .filter(attribName => !!attribName);
            }
            if (_BUILD_.profile) {
                perf.mark(`define_start:${cmpMeta.tagNameMeta}`);
            }
            win.customElements.define(cmpMeta.tagNameMeta, HostElementConstructor);
            if (_BUILD_.profile) {
                perf.mark(`define_end:${cmpMeta.tagNameMeta}`);
                perf.measure(`define:${cmpMeta.tagNameMeta}`, `define_start:${cmpMeta.tagNameMeta}`, `define_end:${cmpMeta.tagNameMeta}`);
            }
        }
    };
    // create the platform api which is used throughout common core code
    const plt = {
        domApi,
        defineComponent,
        getComponentMeta: elm => cmpRegistry[domApi.$tagName(elm)],
        getContextItem: contextKey => Context[contextKey],
        isClient: true,
        isDefinedComponent: (elm) => !!(globalDefined[domApi.$tagName(elm)] || plt.getComponentMeta(elm)),
        onError: (err, type, elm) => console.error(err, type, elm && elm.tagName),
        queue: (Context.queue = createQueueClient(App, win)),
        requestBundle: (cmpMeta, elm, hmrVersionId) => {
            if (_BUILD_.profile) {
                perf.mark(`request_bundle_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
            }
            if (_BUILD_.externalModuleLoader) {
                // using a 3rd party bundler to import modules
                // at this point the cmpMeta will already have a
                // static function as a the bundleIds that returns the module
                const useScopedCss = _BUILD_.shadowDom && !domApi.$supportsShadowDom;
                const moduleOpts = {
                    mode: elm.mode,
                    scoped: useScopedCss
                };
                cmpMeta.bundleIds(moduleOpts).then(cmpConstructor => {
                    // async loading of the module is done
                    if (_BUILD_.profile) {
                        perf.mark(`request_bundle_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                        perf.measure(`request_bundle:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `request_bundle_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `request_bundle_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                    }
                    try {
                        // get the component constructor from the module
                        // initialize this component constructor's styles
                        // it is possible for the same component to have difficult styles applied in the same app
                        cmpMeta.componentConstructor = cmpConstructor;
                        if (_BUILD_.styles) {
                            initStyleTemplate(domApi, cmpMeta, cmpMeta.encapsulationMeta, cmpConstructor.style, cmpConstructor.styleMode, perf);
                        }
                    }
                    catch (e) {
                        // oh man, something's up
                        console.error(e);
                        // provide a bogus component constructor
                        // so the rest of the app acts as normal
                        cmpMeta.componentConstructor = class {
                        };
                    }
                    // bundle all loaded up, let's continue
                    queueUpdate(plt, elm, perf);
                });
            }
            else if (_BUILD_.browserModuleLoader) {
                // self loading module using built-in browser's import()
                // this is when not using a 3rd party bundler
                // and components are able to lazy load themselves
                // through standardized browser APIs
                const bundleId = (_BUILD_.hasMode && typeof cmpMeta.bundleIds !== 'string')
                    ? cmpMeta.bundleIds[elm.mode]
                    : cmpMeta.bundleIds;
                const useScopedCss = _BUILD_.shadowDom && !domApi.$supportsShadowDom;
                let url = resourcesUrl + bundleId + (useScopedCss ? '.sc' : '') + '.entry.js';
                if (_BUILD_.hotModuleReplacement && hmrVersionId) {
                    url += '?s-hmr=' + hmrVersionId;
                }
                // dynamic es module import() => woot!
                import(url).then(importedModule => {
                    // async loading of the module is done
                    if (_BUILD_.profile) {
                        perf.mark(`request_bundle_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                        perf.measure(`request_bundle:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `request_bundle_start:${elm.nodeName.toLowerCase()}:${elm['s-id']}`, `request_bundle_end:${elm.nodeName.toLowerCase()}:${elm['s-id']}`);
                    }
                    try {
                        // get the component constructor from the module
                        // initialize this component constructor's styles
                        // it is possible for the same component to have difficult styles applied in the same app
                        cmpMeta.componentConstructor = importedModule[dashToPascalCase(cmpMeta.tagNameMeta)];
                        if (_BUILD_.styles) {
                            initStyleTemplate(domApi, cmpMeta, cmpMeta.encapsulationMeta, cmpMeta.componentConstructor.style, cmpMeta.componentConstructor.styleMode, perf);
                        }
                        // bundle all loaded up, let's continue
                        queueUpdate(plt, elm, perf);
                    }
                    catch (e) {
                        // oh man, something's up
                        console.error(e);
                        // provide a bogus component constructor
                        // so the rest of the app acts as normal
                        cmpMeta.componentConstructor = class {
                        };
                    }
                }, err => console.error(err, url));
            }
        },
        activeRender: false,
        isAppLoaded: false,
        tmpDisconnected: false,
        attachStyles: (_BUILD_.styles) ? attachStyles : undefined,
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
    if (_BUILD_.profile) {
        perf.mark(`app_load_start`);
    }
    // set App Context
    Context.isServer = Context.isPrerender = !(Context.isClient = true);
    Context.window = win;
    Context.location = win.location;
    Context.document = doc;
    Context.resourcesUrl = Context.publicPath = resourcesUrl;
    if (_BUILD_.listener) {
        Context.enableListener = (instance, eventName, enabled, attachTo, passive) => enableEventListener(plt, instance, eventName, enabled, attachTo, passive);
    }
    if (_BUILD_.event) {
        plt.emitEvent = Context.emit = (elm, eventName, data) => domApi.$dispatchEvent(elm, Context.eventNameFn ? Context.eventNameFn(eventName) : eventName, data);
    }
    if (_BUILD_.propConnect) {
        plt.propConnect = ctrlTag => proxyController(domApi, controllerComponents, ctrlTag);
    }
    if (_BUILD_.profile) {
        // internal id increment for unique ids
        let ids = 0;
        plt.nextId = () => namespace + (ids++);
    }
    // add the h() fn to the app's global namespace
    App.h = h;
    App.Context = Context;
    // create a method that returns a promise
    // which gets resolved when the app's queue is empty
    // and app is idle, works for both initial load and updates
    App.onReady = () => new Promise(resolve => plt.queue.write(() => plt.processingCmp.size ? plt.onAppReadyCallbacks.push(resolve) : resolve()));
    // create the renderer that will be used
    plt.render = createRendererPatch(plt, domApi);
    // setup the root element which is the mighty <html> tag
    // the <html> has the final say of when the app has loaded
    rootElm['s-ld'] = [];
    rootElm['s-rn'] = true;
    // this will fire when all components have finished loaded
    rootElm['s-init'] = () => {
        plt.isCmpReady.set(rootElm, App.loaded = plt.isAppLoaded = true);
        domApi.$dispatchEvent(win, 'appload', { detail: { namespace: namespace } });
        if (_BUILD_.profile) {
            perf.mark('app_load_end');
            perf.measure('app_load', 'app_load_start', 'app_load_end');
        }
    };
    if (_BUILD_.prerenderClientSide || _BUILD_.prerenderExternal) {
        // if the HTML was generated from prerendering
        // then let's walk the tree and generate vnodes out of the data
        createVNodesFromSsr(plt, domApi, rootElm);
    }
    if (_BUILD_.devInspector) {
        generateDevInspector(namespace, win, plt, components);
    }
    if (_BUILD_.browserModuleLoader) {
        // register all the components now that everything's ready
        // standard es2017 class extends HTMLElement
        if (_BUILD_.profile) {
            perf.mark(`define_custom_elements_start`);
        }
        components
            .map(parseComponentLoader)
            .forEach(cmpMeta => defineComponent(cmpMeta, class extends HTMLElement {
        }));
        if (_BUILD_.profile) {
            perf.mark(`define_custom_elements_end`);
            perf.measure(`define_custom_elements`, `define_custom_elements_start`, `define_custom_elements_end`);
        }
        if (!plt.hasConnectedComponent) {
            // we just defined call the custom elements but no
            // connectedCallbacks happened, so no components in the dom :(
            rootElm['s-init']();
        }
    }
    // create the componentOnReady fn
    initCoreComponentOnReady(plt, App, win, win['s-apps'], win['s-cr']);
    // notify that the app has initialized and the core script is ready
    // but note that the components have not fully loaded yet
    App.initialized = true;
    return plt;
};

const pltMap = {};
let initCmpOnReady = false;
function defineCustomElement(win, cmpData, opts = {}) {
    let cmpDataArray = (Array.isArray(cmpData) ? cmpData : [cmpData]);
    const doc = win.document;
    const hydratedCssClass = opts.hydratedCssClass || '__APP__HYDRATED__CSS__PLACEHOLDER__';
    const exclude = opts['exclude'];
    if (exclude) {
        cmpDataArray = cmpDataArray.filter(c => exclude.indexOf(c[0]) === -1);
    }
    const styleCmps = cmpDataArray.map(c => c[0]);
    if (styleCmps.length > 0) {
        // auto hide components until they been fully hydrated
        // reusing the "x" and "i" variables from the args for funzies
        const styleElm = doc.createElement('style');
        styleElm.innerHTML = styleCmps.join() + '{visibility:hidden}.' + hydratedCssClass + '{visibility:inherit}';
        styleElm.setAttribute('data-styles', '');
        doc.head.insertBefore(styleElm, doc.head.firstChild);
    }
    const namespace = opts.namespace || '__APP__NAMESPACE__PLACEHOLDER__';
    if (!initCmpOnReady) {
        initCmpOnReady = true;
        createComponentOnReadyPrototype(win, namespace, win.HTMLElement.prototype);
    }
    return applyPolyfills(win).then(() => {
        if (!pltMap[namespace]) {
            const Context = {};
            const resourcesUrl = opts.resourcesUrl || './';
            appGlobal(namespace, Context, win, doc, resourcesUrl, hydratedCssClass);
            // create a platform for this namespace
            pltMap[namespace] = createPlatformMain(namespace, Context, win, doc, resourcesUrl, hydratedCssClass, cmpDataArray);
        }
        function defineComponents() {
            // polyfills have been applied if need be
            cmpDataArray.forEach(c => {
                let HostElementConstructor;
                if (isNative(win.customElements.define)) {
                    // native custom elements supported
                    const createHostConstructor = new Function('w', 'return class extends w.HTMLElement{}');
                    HostElementConstructor = createHostConstructor(win);
                }
                else {
                    // using polyfilled custom elements
                    HostElementConstructor = function (self) {
                        return win.HTMLElement.call(this, self);
                    };
                    HostElementConstructor.prototype = Object.create(win.HTMLElement.prototype, { constructor: { value: HostElementConstructor, configurable: true } });
                }
                // convert the static constructor data to cmp metadata
                // define the component as a custom element
                pltMap[namespace].defineComponent(buildComponentLoader(c), HostElementConstructor);
            });
        }
        if (_BUILD_.cssVarShim && window.customStyleShim) {
            pltMap[namespace].customStyle = window.customStyleShim;
            return pltMap[namespace].customStyle.initShim().then(defineComponents);
        }
        else {
            defineComponents();
        }
    });
}
function buildComponentLoader(c) {
    const meta = parseComponentLoader(c);
    const bundleIds = meta.bundleIds;
    const className = dashToPascalCase(c[0]);
    meta.bundleIds = ({ mode, scoped }) => {
        if (typeof bundleIds === 'string') {
            return loadBundle(bundleIds, scoped, className);
        }
        else {
            return loadBundle(bundleIds[mode], scoped, className);
        }
    };
    return meta;
}
function loadBundle(bundleId, useScopedCss, className) {
    return import(
    /* webpackInclude: /\.entry\.js$/ */
    /* webpackMode: "lazy" */
    `./build/${bundleId}${(useScopedCss ? '.sc' : '')}.entry.js`).then(m => m[className]);
}
function isNative(fn) {
    return (/\{\s*\[native code\]\s*\}/).test('' + fn);
}

export { defineCustomElement, h };