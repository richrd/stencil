"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var proxy_members_1 = require("./proxy-members");
var helpers_1 = require("../util/helpers");
var data_parse_1 = require("../util/data-parse");
exports.proxyHostElementPrototype = function (plt, membersEntries, hostPrototype, perf) {
    // create getters/setters on the host element prototype to represent the public API
    // the setters allows us to know when data has changed so we can re-render
    if (!_BUILD_.clientSide) {
        // in just a server-side build
        // let's set the properties to the values immediately
        var values_1 = plt.valuesMap.get(hostPrototype);
        if (!values_1) {
            plt.valuesMap.set(hostPrototype, values_1 = {});
        }
        membersEntries.forEach(function (_a) {
            var memberName = _a[0], member = _a[1];
            var memberType = member.memberType;
            if (memberType & (1 /* Prop */ | 2 /* PropMutable */)) {
                values_1[memberName] = hostPrototype[memberName];
            }
        });
    }
    membersEntries.forEach(function (_a) {
        var memberName = _a[0], member = _a[1];
        // add getters/setters
        var memberType = member.memberType;
        if ((memberType & (1 /* Prop */ | 2 /* PropMutable */)) && (_BUILD_.prop)) {
            // @Prop() or @Prop({ mutable: true })
            proxy_members_1.definePropertyGetterSetter(hostPrototype, memberName, function getHostElementProp() {
                // host element getter (cannot be arrow fn)
                // yup, ugly, srynotsry
                return (plt.valuesMap.get(this) || {})[memberName];
            }, function setHostElementProp(newValue) {
                // host element setter (cannot be arrow fn)
                proxy_members_1.setValue(plt, this, memberName, data_parse_1.parsePropertyValue(member.propType, newValue), perf);
            });
        }
        else if (_BUILD_.method && memberType === 32 /* Method */) {
            // @Method()
            // add a placeholder noop value on the host element's prototype
            // incase this method gets called before setup
            proxy_members_1.definePropertyValue(hostPrototype, memberName, helpers_1.noop);
        }
    });
};
