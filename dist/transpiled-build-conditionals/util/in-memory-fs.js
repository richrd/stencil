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
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../compiler/util");
var InMemoryFileSystem = /** @class */ (function () {
    function InMemoryFileSystem(disk, sys) {
        this.disk = disk;
        this.sys = sys;
        this.items = new Map();
    }
    InMemoryFileSystem.prototype.accessData = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var item, data, s, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.getItem(filePath);
                        data = {
                            exists: false,
                            isDirectory: false,
                            isFile: false
                        };
                        if (typeof item.exists === 'boolean') {
                            data.exists = item.exists;
                            data.isDirectory = item.isDirectory;
                            data.isFile = item.isFile;
                            return [2 /*return*/, data];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.stat(filePath)];
                    case 2:
                        s = _a.sent();
                        item.exists = true;
                        item.isDirectory = s.isDirectory;
                        item.isFile = s.isFile;
                        data.exists = item.exists;
                        data.isDirectory = item.isDirectory;
                        data.isFile = item.isFile;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        item.exists = false;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, data];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.access = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accessData(filePath)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.exists];
                }
            });
        });
    };
    /**
     * Synchronous!!! Do not use!!!
     * (Only typescript transpiling is allowed to use)
     * @param filePath
     */
    InMemoryFileSystem.prototype.accessSync = function (filePath) {
        var item = this.getItem(filePath);
        if (typeof item.exists === 'boolean') {
            return item.exists;
        }
        var hasAccess = false;
        try {
            var s = this.statSync(filePath);
            item.exists = true;
            item.isDirectory = s.isDirectory;
            item.isFile = s.isFile;
            hasAccess = true;
        }
        catch (e) {
            item.exists = false;
        }
        return hasAccess;
    };
    InMemoryFileSystem.prototype.emptyDir = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.getItem(dirPath);
                        return [4 /*yield*/, this.removeDir(dirPath)];
                    case 1:
                        _a.sent();
                        item.isFile = false;
                        item.isDirectory = true;
                        item.queueWriteToDisk = true;
                        item.queueDeleteFromDisk = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.readdir = function (dirPath, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var collectedPaths, inMemoryDir, inMemoryDirs_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dirPath = util_1.normalizePath(dirPath);
                        collectedPaths = [];
                        if (!opts.inMemoryOnly) return [3 /*break*/, 1];
                        inMemoryDir = dirPath;
                        if (!inMemoryDir.endsWith('/')) {
                            inMemoryDir += '/';
                        }
                        inMemoryDirs_1 = dirPath.split('/');
                        this.items.forEach(function (d, filePath) {
                            if (!filePath.startsWith(dirPath)) {
                                return;
                            }
                            var parts = filePath.split('/');
                            if (parts.length === inMemoryDirs_1.length + 1 || (opts.recursive && parts.length > inMemoryDirs_1.length)) {
                                if (d.exists) {
                                    var item = {
                                        absPath: filePath,
                                        relPath: parts[inMemoryDirs_1.length],
                                        isDirectory: d.isDirectory,
                                        isFile: d.isFile
                                    };
                                    collectedPaths.push(item);
                                }
                            }
                        });
                        return [3 /*break*/, 3];
                    case 1: 
                    // always a disk read
                    return [4 /*yield*/, this.readDirectory(dirPath, dirPath, opts, collectedPaths)];
                    case 2:
                        // always a disk read
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, collectedPaths.sort(function (a, b) {
                            if (a.absPath < b.absPath)
                                return -1;
                            if (a.absPath > b.absPath)
                                return 1;
                            return 0;
                        })];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.readDirectory = function (initPath, dirPath, opts, collectedPaths) {
        return __awaiter(this, void 0, void 0, function () {
            var dirItems, item;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.disk.readdir(dirPath)];
                    case 1:
                        dirItems = _a.sent();
                        item = this.getItem(dirPath);
                        item.exists = true;
                        item.isFile = false;
                        item.isDirectory = true;
                        return [4 /*yield*/, Promise.all(dirItems.map(function (dirItem) { return __awaiter(_this, void 0, void 0, function () {
                                var absPath, relPath, stats, subItem;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            absPath = util_1.normalizePath(this.sys.path.join(dirPath, dirItem));
                                            relPath = util_1.normalizePath(this.sys.path.relative(initPath, absPath));
                                            return [4 /*yield*/, this.stat(absPath)];
                                        case 1:
                                            stats = _a.sent();
                                            subItem = this.getItem(absPath);
                                            subItem.exists = true;
                                            subItem.isDirectory = stats.isDirectory;
                                            subItem.isFile = stats.isFile;
                                            collectedPaths.push({
                                                absPath: absPath,
                                                relPath: relPath,
                                                isDirectory: stats.isDirectory,
                                                isFile: stats.isFile
                                            });
                                            if (!(opts.recursive && stats.isDirectory)) return [3 /*break*/, 3];
                                            // looks like it's yet another directory
                                            // let's keep drilling down
                                            return [4 /*yield*/, this.readDirectory(initPath, absPath, opts, collectedPaths)];
                                        case 2:
                                            // looks like it's yet another directory
                                            // let's keep drilling down
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.readFile = function (filePath, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var item_1, fileContent, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!opts || (opts.useCache === true || opts.useCache === undefined)) {
                            item_1 = this.getItem(filePath);
                            if (item_1.exists && typeof item_1.fileText === 'string') {
                                return [2 /*return*/, item_1.fileText];
                            }
                        }
                        return [4 /*yield*/, this.disk.readFile(filePath)];
                    case 1:
                        fileContent = _a.sent();
                        item = this.getItem(filePath);
                        if (fileContent.length < MAX_TEXT_CACHE) {
                            item.exists = true;
                            item.isFile = true;
                            item.isDirectory = false;
                            item.fileText = fileContent;
                        }
                        return [2 /*return*/, fileContent];
                }
            });
        });
    };
    /**
     * Synchronous!!! Do not use!!!
     * (Only typescript transpiling is allowed to use)
     * @param filePath
     */
    InMemoryFileSystem.prototype.readFileSync = function (filePath, opts) {
        if (!opts || (opts.useCache === true || opts.useCache === undefined)) {
            var item_2 = this.getItem(filePath);
            if (item_2.exists && typeof item_2.fileText === 'string') {
                return item_2.fileText;
            }
        }
        var fileContent = this.disk.readFileSync(filePath);
        var item = this.getItem(filePath);
        if (fileContent.length < MAX_TEXT_CACHE) {
            item.exists = true;
            item.isFile = true;
            item.isDirectory = false;
            item.fileText = fileContent;
        }
        return fileContent;
    };
    InMemoryFileSystem.prototype.remove = function (itemPath) {
        return __awaiter(this, void 0, void 0, function () {
            var stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.stat(itemPath)];
                    case 1:
                        stats = _a.sent();
                        if (!stats.isDirectory) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.removeDir(itemPath)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!stats.isFile) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.removeItem(itemPath)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.removeDir = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var item, dirItems, e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.getItem(dirPath);
                        item.isFile = false;
                        item.isDirectory = true;
                        if (!item.queueWriteToDisk) {
                            item.queueDeleteFromDisk = true;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.readdir(dirPath, { recursive: true })];
                    case 2:
                        dirItems = _a.sent();
                        return [4 /*yield*/, Promise.all(dirItems.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.removeItem(item.absPath)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.removeItem = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                item = this.getItem(filePath);
                if (!item.queueWriteToDisk) {
                    item.queueDeleteFromDisk = true;
                }
                return [2 /*return*/];
            });
        });
    };
    InMemoryFileSystem.prototype.stat = function (itemPath) {
        return __awaiter(this, void 0, void 0, function () {
            var item, s;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.getItem(itemPath);
                        if (!(typeof item.isDirectory !== 'boolean' || typeof item.isFile !== 'boolean')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.disk.stat(itemPath)];
                    case 1:
                        s = _a.sent();
                        item.exists = true;
                        item.isDirectory = s.isDirectory();
                        item.isFile = s.isFile();
                        item.size = s.size;
                        _a.label = 2;
                    case 2: return [2 /*return*/, {
                            exists: !!item.exists,
                            isFile: !!item.isFile,
                            isDirectory: !!item.isDirectory,
                            size: typeof item.size === 'number' ? item.size : 0
                        }];
                }
            });
        });
    };
    /**
     * Synchronous!!! Do not use!!!
     * (Only typescript transpiling is allowed to use)
     * @param itemPath
     */
    InMemoryFileSystem.prototype.statSync = function (itemPath) {
        var item = this.getItem(itemPath);
        if (typeof item.isDirectory !== 'boolean' || typeof item.isFile !== 'boolean') {
            var s = this.disk.statSync(itemPath);
            item.exists = true;
            item.isDirectory = s.isDirectory();
            item.isFile = s.isFile();
        }
        return {
            isFile: item.isFile,
            isDirectory: item.isDirectory
        };
    };
    InMemoryFileSystem.prototype.writeFile = function (filePath, content, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var results, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = {};
                        if (typeof filePath !== 'string') {
                            throw new Error("writeFile, invalid filePath: " + filePath);
                        }
                        if (typeof content !== 'string') {
                            throw new Error("writeFile, invalid content: " + filePath);
                        }
                        if (shouldIgnore(filePath)) {
                            results.ignored = true;
                            return [2 /*return*/, results];
                        }
                        item = this.getItem(filePath);
                        item.exists = true;
                        item.isFile = true;
                        item.isDirectory = false;
                        item.queueDeleteFromDisk = false;
                        results.changedContent = item.fileText !== content;
                        results.queuedWrite = false;
                        item.fileText = content;
                        if (opts && opts.useCache === false) {
                            item.useCache = false;
                        }
                        if (!(opts && opts.inMemoryOnly)) return [3 /*break*/, 1];
                        // we don't want to actually write this to disk
                        // just keep it in memory
                        if (item.queueWriteToDisk) {
                            // we already queued this file to write to disk
                            // in that case we still need to do it
                            results.queuedWrite = true;
                        }
                        else {
                            // we only want this in memory and
                            // it wasn't already queued to be written
                            item.queueWriteToDisk = false;
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        if (!(opts && opts.immediateWrite)) return [3 /*break*/, 3];
                        // If this is an immediate write then write the file
                        // and do not add it to the queue
                        return [4 /*yield*/, this.disk.writeFile(filePath, item.fileText)];
                    case 2:
                        // If this is an immediate write then write the file
                        // and do not add it to the queue
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        // we want to write this to disk (eventually)
                        // but only if the content is different
                        // from our existing cached content
                        if (!item.queueWriteToDisk && results.changedContent) {
                            // not already queued to be written
                            // and the content is different
                            item.queueWriteToDisk = true;
                            results.queuedWrite = true;
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.writeFiles = function (files, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var writtenFiles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(Object.keys(files).map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var writtenFile;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.writeFile(filePath, files[filePath], opts)];
                                    case 1:
                                        writtenFile = _a.sent();
                                        return [2 /*return*/, writtenFile];
                                }
                            });
                        }); }))];
                    case 1:
                        writtenFiles = _a.sent();
                        return [2 /*return*/, writtenFiles];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var instructions, dirsAdded, filesWritten, filesDeleted, dirsDeleted;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        instructions = getCommitInstructions(this.sys.path, this.items);
                        return [4 /*yield*/, this.commitEnsureDirs(instructions.dirsToEnsure)];
                    case 1:
                        dirsAdded = _a.sent();
                        return [4 /*yield*/, this.commitWriteFiles(instructions.filesToWrite)];
                    case 2:
                        filesWritten = _a.sent();
                        return [4 /*yield*/, this.commitDeleteFiles(instructions.filesToDelete)];
                    case 3:
                        filesDeleted = _a.sent();
                        return [4 /*yield*/, this.commitDeleteDirs(instructions.dirsToDelete)];
                    case 4:
                        dirsDeleted = _a.sent();
                        instructions.filesToDelete.forEach(function (fileToDelete) {
                            _this.clearFileCache(fileToDelete);
                        });
                        instructions.dirsToDelete.forEach(function (dirToDelete) {
                            _this.clearDirCache(dirToDelete);
                        });
                        // return only the files that were
                        return [2 /*return*/, {
                                filesWritten: filesWritten,
                                filesDeleted: filesDeleted,
                                dirsDeleted: dirsDeleted,
                                dirsAdded: dirsAdded
                            }];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.commitEnsureDirs = function (dirsToEnsure) {
        return __awaiter(this, void 0, void 0, function () {
            var dirsAdded, _i, dirsToEnsure_1, dirPath, item, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dirsAdded = [];
                        _i = 0, dirsToEnsure_1 = dirsToEnsure;
                        _a.label = 1;
                    case 1:
                        if (!(_i < dirsToEnsure_1.length)) return [3 /*break*/, 6];
                        dirPath = dirsToEnsure_1[_i];
                        item = this.getItem(dirPath);
                        if (item.exists && item.isDirectory) {
                            // already cached that this path is indeed an existing directory
                            return [3 /*break*/, 5];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        // cache that we know this is a directory on disk
                        item.exists = true;
                        item.isDirectory = true;
                        item.isFile = false;
                        return [4 /*yield*/, this.disk.mkdir(dirPath)];
                    case 3:
                        _a.sent();
                        dirsAdded.push(dirPath);
                        return [3 /*break*/, 5];
                    case 4:
                        e_3 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, dirsAdded];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.commitWriteFiles = function (filesToWrite) {
        var _this = this;
        var writtenFiles = Promise.all(filesToWrite.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof filePath !== 'string') {
                    throw new Error("unable to writeFile without filePath");
                }
                return [2 /*return*/, this.commitWriteFile(filePath)];
            });
        }); }));
        return writtenFiles;
    };
    InMemoryFileSystem.prototype.commitWriteFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.getItem(filePath);
                        if (item.fileText == null) {
                            throw new Error("unable to find item fileText to write: " + filePath);
                        }
                        return [4 /*yield*/, this.disk.writeFile(filePath, item.fileText)];
                    case 1:
                        _a.sent();
                        if (item.useCache === false) {
                            this.clearFileCache(filePath);
                        }
                        return [2 /*return*/, filePath];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.commitDeleteFiles = function (filesToDelete) {
        return __awaiter(this, void 0, void 0, function () {
            var deletedFiles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(filesToDelete.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (typeof filePath !== 'string') {
                                            throw new Error("unable to unlink without filePath");
                                        }
                                        return [4 /*yield*/, this.disk.unlink(filePath)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, filePath];
                                }
                            });
                        }); }))];
                    case 1:
                        deletedFiles = _a.sent();
                        return [2 /*return*/, deletedFiles];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.commitDeleteDirs = function (dirsToDelete) {
        return __awaiter(this, void 0, void 0, function () {
            var dirsDeleted, _i, dirsToDelete_1, dirPath, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dirsDeleted = [];
                        _i = 0, dirsToDelete_1 = dirsToDelete;
                        _a.label = 1;
                    case 1:
                        if (!(_i < dirsToDelete_1.length)) return [3 /*break*/, 7];
                        dirPath = dirsToDelete_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.disk.rmdir(dirPath)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        dirsDeleted.push(dirPath);
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, dirsDeleted];
                }
            });
        });
    };
    InMemoryFileSystem.prototype.clearDirCache = function (dirPath) {
        var _this = this;
        dirPath = util_1.normalizePath(dirPath);
        this.items.forEach(function (_, f) {
            var filePath = _this.sys.path.relative(dirPath, f).split('/')[0];
            if (!filePath.startsWith('.') && !filePath.startsWith('/')) {
                _this.clearFileCache(f);
            }
        });
    };
    InMemoryFileSystem.prototype.clearFileCache = function (filePath) {
        filePath = util_1.normalizePath(filePath);
        var item = this.items.get(filePath);
        if (item && !item.queueWriteToDisk) {
            this.items.delete(filePath);
        }
    };
    InMemoryFileSystem.prototype.cancelDeleteFilesFromDisk = function (filePaths) {
        var _this = this;
        filePaths.forEach(function (filePath) {
            var item = _this.getItem(filePath);
            if (item.isFile && item.queueDeleteFromDisk) {
                item.queueDeleteFromDisk = false;
            }
        });
    };
    InMemoryFileSystem.prototype.cancelDeleteDirectoriesFromDisk = function (dirPaths) {
        var _this = this;
        dirPaths.forEach(function (dirPath) {
            var item = _this.getItem(dirPath);
            if (item.queueDeleteFromDisk) {
                item.queueDeleteFromDisk = false;
            }
        });
    };
    InMemoryFileSystem.prototype.getItem = function (itemPath) {
        itemPath = util_1.normalizePath(itemPath);
        var item = this.items.get(itemPath);
        if (item) {
            return item;
        }
        this.items.set(itemPath, item = {});
        return item;
    };
    InMemoryFileSystem.prototype.clearCache = function () {
        this.items = new Map();
    };
    Object.defineProperty(InMemoryFileSystem.prototype, "keys", {
        get: function () {
            return Array.from(this.items.keys()).sort();
        },
        enumerable: true,
        configurable: true
    });
    InMemoryFileSystem.prototype.getMemoryStats = function () {
        return "data length: " + this.items.size;
    };
    return InMemoryFileSystem;
}());
exports.InMemoryFileSystem = InMemoryFileSystem;
function getCommitInstructions(path, d) {
    var instructions = {
        filesToDelete: [],
        filesToWrite: [],
        dirsToDelete: [],
        dirsToEnsure: []
    };
    d.forEach(function (item, itemPath) {
        if (item.queueWriteToDisk) {
            if (item.isFile) {
                instructions.filesToWrite.push(itemPath);
                var dir = util_1.normalizePath(path.dirname(itemPath));
                if (!instructions.dirsToEnsure.includes(dir)) {
                    instructions.dirsToEnsure.push(dir);
                }
                var dirDeleteIndex = instructions.dirsToDelete.indexOf(dir);
                if (dirDeleteIndex > -1) {
                    instructions.dirsToDelete.splice(dirDeleteIndex, 1);
                }
                var fileDeleteIndex = instructions.filesToDelete.indexOf(itemPath);
                if (fileDeleteIndex > -1) {
                    instructions.filesToDelete.splice(fileDeleteIndex, 1);
                }
            }
            else if (item.isDirectory) {
                if (!instructions.dirsToEnsure.includes(itemPath)) {
                    instructions.dirsToEnsure.push(itemPath);
                }
                var dirDeleteIndex = instructions.dirsToDelete.indexOf(itemPath);
                if (dirDeleteIndex > -1) {
                    instructions.dirsToDelete.splice(dirDeleteIndex, 1);
                }
            }
        }
        else if (item.queueDeleteFromDisk) {
            if (item.isDirectory && !instructions.dirsToEnsure.includes(itemPath)) {
                instructions.dirsToDelete.push(itemPath);
            }
            else if (item.isFile && !instructions.filesToWrite.includes(itemPath)) {
                instructions.filesToDelete.push(itemPath);
            }
        }
        item.queueDeleteFromDisk = false;
        item.queueWriteToDisk = false;
    });
    // add all the ancestor directories for each directory too
    for (var i = 0, ilen = instructions.dirsToEnsure.length; i < ilen; i++) {
        var segments = instructions.dirsToEnsure[i].split('/');
        for (var j = 2; j < segments.length; j++) {
            var dir = segments.slice(0, j).join('/');
            if (!instructions.dirsToEnsure.includes(dir)) {
                instructions.dirsToEnsure.push(dir);
            }
        }
    }
    // sort directories so shortest paths are ensured first
    instructions.dirsToEnsure.sort(function (a, b) {
        var segmentsA = a.split('/').length;
        var segmentsB = b.split('/').length;
        if (segmentsA < segmentsB)
            return -1;
        if (segmentsA > segmentsB)
            return 1;
        if (a.length < b.length)
            return -1;
        if (a.length > b.length)
            return 1;
        return 0;
    });
    // sort directories so longest paths are removed first
    instructions.dirsToDelete.sort(function (a, b) {
        var segmentsA = a.split('/').length;
        var segmentsB = b.split('/').length;
        if (segmentsA < segmentsB)
            return 1;
        if (segmentsA > segmentsB)
            return -1;
        if (a.length < b.length)
            return 1;
        if (a.length > b.length)
            return -1;
        return 0;
    });
    instructions.dirsToEnsure.forEach(function (dirToEnsure) {
        var i = instructions.dirsToDelete.indexOf(dirToEnsure);
        if (i > -1) {
            instructions.dirsToDelete.splice(i, 1);
        }
    });
    instructions.dirsToDelete = instructions.dirsToDelete.filter(function (dir) {
        if (dir === '/' || dir.endsWith(':/')) {
            return false;
        }
        return true;
    });
    instructions.dirsToEnsure = instructions.dirsToEnsure.filter(function (dir) {
        var item = d.get(dir);
        if (item && item.exists && item.isDirectory) {
            return false;
        }
        if (dir === '/' || dir.endsWith(':/')) {
            return false;
        }
        return true;
    });
    return instructions;
}
exports.getCommitInstructions = getCommitInstructions;
function isTextFile(filePath) {
    filePath = filePath.toLowerCase().trim();
    return TXT_EXT.some(function (ext) { return filePath.endsWith(ext); });
}
exports.isTextFile = isTextFile;
var TXT_EXT = [
    '.ts', '.tsx', '.js', '.jsx', '.svg',
    '.html', '.txt', '.md', '.markdown', '.json',
    '.css', '.scss', '.sass', '.less', '.styl'
];
function shouldIgnore(filePath) {
    filePath = filePath.trim().toLowerCase();
    return IGNORE.some(function (ignoreFile) { return filePath.endsWith(ignoreFile); });
}
exports.shouldIgnore = shouldIgnore;
var IGNORE = [
    '.ds_store',
    '.gitignore',
    'desktop.ini',
    'thumbs.db'
];
// only cache if it's less than 5MB-ish (using .length as a rough guess)
// why 5MB? idk, seems like a good number for source text
// it's pretty darn large to cover almost ALL legitimate source files
// and anything larger is probably a REALLY large file and a rare case
// which we don't need to eat up memory for
var MAX_TEXT_CACHE = 5242880;
