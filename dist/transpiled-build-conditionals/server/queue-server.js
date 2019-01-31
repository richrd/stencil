"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createQueueServer() {
    var highPriority = [];
    var domReads = [];
    var domWrites = [];
    var queued = false;
    function flush(cb) {
        while (highPriority.length > 0) {
            highPriority.shift()(0);
        }
        while (domReads.length > 0) {
            domReads.shift()(0);
        }
        while (domWrites.length > 0) {
            domWrites.shift()(0);
        }
        queued = (highPriority.length > 0) || (domReads.length > 0) || (domWrites.length > 0);
        if (queued) {
            process.nextTick(flush);
        }
        cb && cb();
    }
    function clear() {
        highPriority.length = 0;
        domReads.length = 0;
        domWrites.length = 0;
    }
    return {
        tick: function (cb) {
            // queue high priority work to happen in next tick
            // uses Promise.resolve() for next tick
            highPriority.push(cb);
            if (!queued) {
                queued = true;
                process.nextTick(flush);
            }
        },
        read: function (cb) {
            // queue dom reads
            domReads.push(cb);
            if (!queued) {
                queued = true;
                process.nextTick(flush);
            }
        },
        write: function (cb) {
            // queue dom writes
            domWrites.push(cb);
            if (!queued) {
                queued = true;
                process.nextTick(flush);
            }
        },
        flush: flush,
        clear: clear
    };
}
exports.createQueueServer = createQueueServer;
