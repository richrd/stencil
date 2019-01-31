"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../util/constants");
var helpers_1 = require("../util/helpers");
exports.createDomApi = function (App, win, doc) {
    // using the $ prefix so that closure is
    // cool with property renaming each of these
    var unregisterListenerFns = new WeakMap();
    var domApi = {
        $doc: doc,
        $supportsShadowDom: !!doc.documentElement.attachShadow,
        $supportsEventOptions: false,
        $nodeType: function (node) {
            return node.nodeType;
        },
        $createElement: function (tagName) {
            return doc.createElement(tagName);
        },
        $createElementNS: function (namespace, tagName) {
            return doc.createElementNS(namespace, tagName);
        },
        $createTextNode: function (text) { return doc.createTextNode(text); },
        $createComment: function (data) { return doc.createComment(data); },
        $insertBefore: function (parentNode, childNode, referenceNode) {
            return parentNode.insertBefore(childNode, referenceNode);
        },
        // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
        // and it's polyfilled in es5 builds
        $remove: function (node) { return node.remove(); },
        $appendChild: function (parentNode, childNode) {
            return parentNode.appendChild(childNode);
        },
        $addClass: function (elm, cssClass) {
            if (_BUILD_.hasSvg && _BUILD_.es5) {
                if (elm.classList) {
                    elm.classList.add(cssClass);
                }
                else if (elm.nodeName.toLowerCase() === 'svg') {
                    // https://caniuse.com/#search=classList
                    // IE11 really does not do <svg> properly :-/
                    var cssClasses = elm.getAttribute('class') || '';
                    if (!(cssClasses.split(' ').includes(cssClass))) {
                        cssClasses += " " + cssClass;
                    }
                    elm.setAttribute('class', cssClasses.trim());
                }
            }
            else {
                elm.classList.add(cssClass);
            }
        },
        $childNodes: function (node) {
            return node.childNodes;
        },
        $parentNode: function (node) {
            return node.parentNode;
        },
        $nextSibling: function (node) {
            return node.nextSibling;
        },
        $previousSibling: function (node) {
            return node.previousSibling;
        },
        $tagName: function (elm) {
            return helpers_1.toLowerCase(elm.nodeName);
        },
        $getTextContent: function (node) {
            return node.textContent;
        },
        $setTextContent: function (node, text) {
            return node.textContent = text;
        },
        $getAttribute: function (elm, key) {
            return elm.getAttribute(key);
        },
        $setAttribute: function (elm, key, val) {
            return elm.setAttribute(key, val);
        },
        $removeAttribute: function (elm, key) {
            return elm.removeAttribute(key);
        },
        $hasAttribute: function (elm, key) {
            return elm.hasAttribute(key);
        },
        $getMode: function (elm) {
            return elm.getAttribute('mode') || (App.Context || {}).mode;
        },
        $elementRef: function (elm, referenceName) {
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
        $addEventListener: function (assignerElm, eventName, listenerCallback, assignerId, useCapture, usePassive, attachTo, eventListenerOpts, splt, assignersEventName) {
            // remember the original name before we possibly change it
            var attachToElm = assignerElm;
            var eventListener = listenerCallback;
            // get the existing unregister listeners for
            // this element from the unregister listeners weakmap
            var assignersUnregListeners = unregisterListenerFns.get(assignerElm);
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
                        eventListener = function (ev) {
                            // wrap the user's event listener with our own check to test
                            // if this keyboard event has the keycode they're looking for
                            if (ev.keyCode === constants_1.KEY_CODE_MAP[splt[1]]) {
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
                assignersUnregListeners[assignersEventName] = function () {
                    // looks like it's time to say goodbye
                    attachToElm && App.rel(attachToElm, eventName, eventListener, eventListenerOpts);
                    assignersUnregListeners[assignersEventName] = null;
                };
            }
        },
        $removeEventListener: function (elm, eventName, assignerId, assignersUnregListeners) {
            // get the unregister listener functions for this element
            if ((assignersUnregListeners = unregisterListenerFns.get(elm))) {
                // this element has unregister listeners
                if (eventName) {
                    // passed in one specific event name to remove
                    assignersUnregListeners[eventName + assignerId] && assignersUnregListeners[eventName + assignerId]();
                }
                else {
                    // remove all event listeners
                    Object.keys(assignersUnregListeners).forEach(function (assignersEventName) {
                        assignersUnregListeners[assignersEventName] && assignersUnregListeners[assignersEventName]();
                    });
                }
            }
        },
        $dispatchEvent: function (elm, eventName, data, e) {
            // create and return the custom event, allows for cancel checks
            e = new win.CustomEvent(eventName, data);
            elm && elm.dispatchEvent(e);
            return e;
        },
        $parentElement: function (elm, parentNode) {
            // if the parent node is a document fragment (shadow root)
            // then use the "host" property on it
            // otherwise use the parent node
            return ((parentNode = domApi.$parentNode(elm)) && domApi.$nodeType(parentNode) === 11 /* DocumentFragment */) ? parentNode.host : parentNode;
        }
    };
    if (_BUILD_.hasSvg) {
        domApi.$setAttributeNS = function (elm, namespaceURI, qualifiedName, val) {
            return elm.setAttributeNS(namespaceURI, qualifiedName, val);
        };
    }
    if (_BUILD_.shadowDom) {
        domApi.$attachShadow = function (elm, shadowRootInit) { return elm.attachShadow(shadowRootInit); };
    }
    if (_BUILD_.es5) {
        if (typeof win.CustomEvent !== 'function') {
            // CustomEvent polyfill
            win.CustomEvent = function (event, data, evt) {
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
        App.ael = function (elm, eventName, cb, opts) { return elm.addEventListener(eventName, cb, opts); };
        App.rel = function (elm, eventName, cb, opts) { return elm.removeEventListener(eventName, cb, opts); };
    }
    if (_BUILD_.event || _BUILD_.listener) {
        // test if this browser supports event options or not
        try {
            win.addEventListener('e', null, Object.defineProperty({}, 'passive', {
                get: function () { return domApi.$supportsEventOptions = true; }
            }));
        }
        catch (e) { }
    }
    return domApi;
};
