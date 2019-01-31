"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var element_has_property_1 = require("./element-has-property");
var helpers_1 = require("../util/helpers");
var data_parse_1 = require("../util/data-parse");
var update_1 = require("./update");
exports.defineMember = function (plt, property, elm, instance, memberName, hostSnapshot, perf, hostAttributes, hostAttrValue) {
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
                exports.setValue(plt, elm, memberName, newValue, perf);
            }
            else if (_BUILD_.verboseError) {
                console.warn("@Prop() \"" + memberName + "\" on \"" + elm.tagName + "\" cannot be modified.");
            }
        }
    }
    if ((_BUILD_.prop && property.type) || (_BUILD_.state && property.state)) {
        var values = plt.valuesMap.get(elm);
        if ((!_BUILD_.state || !property.state) && (_BUILD_.prop)) {
            if (property.attr && (values[memberName] === undefined || values[memberName] === '')) {
                // check the prop value from the host element attribute
                if ((hostAttributes = hostSnapshot && hostSnapshot.$attributes) && helpers_1.isDef(hostAttrValue = hostAttributes[property.attr])) {
                    // looks like we've got an attribute value
                    // let's set it to our internal values
                    values[memberName] = data_parse_1.parsePropertyValue(property.type, hostAttrValue);
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
                        values[memberName] = data_parse_1.parsePropertyValue(property.type, elm[memberName]);
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
                if (element_has_property_1.elementHasProperty(plt, elm, memberName)) {
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
        exports.definePropertyGetterSetter(instance, memberName, getComponentProp, setComponentProp);
    }
    else if (_BUILD_.element && property.elementRef) {
        // @Element()
        // add a getter to the element reference using
        // the member name the component meta provided
        exports.definePropertyValue(instance, memberName, elm);
    }
    else if (_BUILD_.method && property.method) {
        // @Method()
        // add a property "value" on the host element
        // which we'll bind to the instance's method
        exports.definePropertyValue(elm, memberName, instance[memberName].bind(instance));
    }
    else if (_BUILD_.propContext && property.context) {
        // @Prop({ context: 'config' })
        var contextObj = plt.getContextItem(property.context);
        if (contextObj !== undefined) {
            exports.definePropertyValue(instance, memberName, (contextObj.getContext && contextObj.getContext(elm)) || contextObj);
        }
    }
    else if (_BUILD_.propConnect && property.connect) {
        // @Prop({ connect: 'ion-loading-ctrl' })
        exports.definePropertyValue(instance, memberName, plt.propConnect(property.connect));
    }
};
exports.setValue = function (plt, elm, memberName, newVal, perf, instance, values) {
    // get the internal values object, which should always come from the host element instance
    // create the _values object if it doesn't already exist
    values = plt.valuesMap.get(elm);
    if (!values) {
        plt.valuesMap.set(elm, values = {});
    }
    var oldVal = values[memberName];
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
                var watchMethods = values[WATCH_CB_PREFIX + memberName];
                if (watchMethods) {
                    // this instance is watching for when this property changed
                    for (var i = 0; i < watchMethods.length; i++) {
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
                update_1.queueUpdate(plt, elm, perf);
            }
        }
    }
};
exports.definePropertyValue = function (obj, propertyKey, value) {
    // minification shortcut
    Object.defineProperty(obj, propertyKey, {
        configurable: true,
        value: value
    });
};
exports.definePropertyGetterSetter = function (obj, propertyKey, get, set) {
    // minification shortcut
    Object.defineProperty(obj, propertyKey, {
        configurable: true,
        get: get,
        set: set
    });
};
var WATCH_CB_PREFIX = "wc-";
