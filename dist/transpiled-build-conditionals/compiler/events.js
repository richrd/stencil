"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BuildEvents = /** @class */ (function () {
    function BuildEvents() {
        this.evCallbacks = {};
    }
    BuildEvents.prototype.subscribe = function (eventName, cb) {
        var _this = this;
        var evName = getEventName(eventName);
        if (!this.evCallbacks[evName]) {
            this.evCallbacks[evName] = [];
        }
        this.evCallbacks[evName].push(cb);
        return function () {
            _this.unsubscribe(evName, cb);
        };
    };
    BuildEvents.prototype.unsubscribe = function (eventName, cb) {
        var evName = getEventName(eventName);
        if (this.evCallbacks[evName]) {
            var index = this.evCallbacks[evName].indexOf(cb);
            if (index > -1) {
                this.evCallbacks[evName].splice(index, 1);
            }
        }
    };
    BuildEvents.prototype.unsubscribeAll = function () {
        this.evCallbacks = {};
    };
    BuildEvents.prototype.emit = function (eventName) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var evName = getEventName(eventName);
        var evCallbacks = this.evCallbacks[evName];
        if (evCallbacks) {
            evCallbacks.forEach(function (cb) {
                try {
                    cb.apply(_this, args);
                }
                catch (e) {
                    console.log(e);
                }
            });
        }
    };
    return BuildEvents;
}());
exports.BuildEvents = BuildEvents;
function getEventName(evName) {
    return evName.trim().toLowerCase();
}
