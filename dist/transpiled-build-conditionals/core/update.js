"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var init_component_instance_1 = require("./init-component-instance");
var render_1 = require("./render");
exports.queueUpdate = function (plt, elm, perf) {
    if (_BUILD_.profile) {
        perf.mark("queue:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
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
            plt.queue.write(function () { return exports.update(plt, elm, perf); });
        }
        else {
            // app hasn't finished loading yet
            // so let's use next tick to do everything
            // as fast as possible
            plt.queue.tick(function () { return exports.update(plt, elm, perf); });
        }
    }
};
exports.update = function (plt, elm, perf, isInitialLoad, instance, ancestorHostElement) { return __awaiter(_this, void 0, void 0, function () {
    var e_1, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (_BUILD_.isDev) {
                    perf.mark("update_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                }
                // no longer queued for update
                plt.isQueuedForUpdate.delete(elm);
                if (!!plt.isDisconnectedMap.has(elm)) return [3 /*break*/, 12];
                instance = plt.instanceMap.get(elm);
                isInitialLoad = !instance;
                if (!isInitialLoad) return [3 /*break*/, 6];
                ancestorHostElement = plt.ancestorHostElementMap.get(elm);
                if (ancestorHostElement && !ancestorHostElement['s-rn']) {
                    // this is the intial load
                    // this element has an ancestor host element
                    // but the ancestor host element has NOT rendered yet
                    // so let's just cool our jets and wait for the ancestor to render
                    (ancestorHostElement['s-rc'] = ancestorHostElement['s-rc'] || []).push(function () {
                        // this will get fired off when the ancestor host element
                        // finally gets around to rendering its lazy self
                        exports.update(plt, elm, perf);
                    });
                    return [2 /*return*/];
                }
                // haven't created a component instance for this host element yet!
                // create the instance from the user's component class
                // https://www.youtube.com/watch?v=olLxrojmvMg
                instance = init_component_instance_1.initComponentInstance(plt, elm, plt.hostSnapshotMap.get(elm), perf);
                if (!(_BUILD_.cmpWillLoad && instance)) return [3 /*break*/, 5];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                if (!instance.componentWillLoad) return [3 /*break*/, 3];
                if (_BUILD_.profile) {
                    perf.mark("componentWillLoad_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                }
                return [4 /*yield*/, instance.componentWillLoad()];
            case 2:
                _a.sent();
                if (_BUILD_.profile) {
                    perf.mark("componentWillLoad_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                    perf.measure("componentWillLoad:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "componentWillLoad_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "componentWillLoad_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                }
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                plt.onError(e_1, 3 /* WillLoadError */, elm);
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 11];
            case 6:
                if (!(_BUILD_.cmpWillUpdate && instance)) return [3 /*break*/, 11];
                _a.label = 7;
            case 7:
                _a.trys.push([7, 10, , 11]);
                if (!instance.componentWillUpdate) return [3 /*break*/, 9];
                if (_BUILD_.profile) {
                    perf.mark("componentWillUpdate_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                }
                return [4 /*yield*/, instance.componentWillUpdate()];
            case 8:
                _a.sent();
                if (_BUILD_.profile) {
                    perf.mark("componentWillUpdate_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                }
                _a.label = 9;
            case 9: return [3 /*break*/, 11];
            case 10:
                e_2 = _a.sent();
                plt.onError(e_2, 5 /* WillUpdateError */, elm);
                return [3 /*break*/, 11];
            case 11:
                // if this component has a render function, let's fire
                // it off and generate a vnode for this
                render_1.render(plt, plt.getComponentMeta(elm), elm, instance, perf);
                if (_BUILD_.isDev) {
                    perf.mark("update_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                    perf.measure("update:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "update_start:" + elm.nodeName.toLowerCase() + ":" + elm['s-id'], "update_end:" + elm.nodeName.toLowerCase() + ":" + elm['s-id']);
                }
                elm['s-init']();
                if (_BUILD_.hotModuleReplacement) {
                    elm['s-hmr-load'] && elm['s-hmr-load']();
                }
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); };
