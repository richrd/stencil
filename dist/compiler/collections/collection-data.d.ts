import * as d from '../../declarations';
export declare function writeAppCollections(config: d.Config, compilerCtx: d.CompilerCtx, buildCtx: d.BuildCtx): Promise<void>;
export declare function serializeAppCollection(config: d.Config, compilerCtx: d.CompilerCtx, collectionDir: string, entryModules: d.EntryModule[], globalModule: d.ModuleFile): d.CollectionData;
export declare function serializeCollectionDependencies(compilerCtx: d.CompilerCtx): d.CollectionDependencyData[];
export declare function parseCollectionData(config: d.Config, collectionName: string, collectionDir: string, collectionJsonStr: string): d.Collection;
export declare function parseComponents(config: d.Config, collectionDir: string, collectionData: d.CollectionData, collection: d.Collection): void;
export declare function parseCollectionDependencies(collectionData: d.CollectionData): string[];
export declare function excludeFromCollection(config: d.Config, cmpData: d.ComponentData): boolean;
export declare function serializeComponent(config: d.Config, collectionDir: string, moduleFile: d.ModuleFile): d.ComponentData;
export declare function parseComponentDataToModuleFile(config: d.Config, collection: d.Collection, collectionDir: string, cmpData: d.ComponentData): d.ModuleFile;
export declare function parseWillChangeDeprecated(cmpData: any, cmpMeta: d.ComponentMeta): void;
export declare function parseDidChangeDeprecated(cmpData: any, cmpMeta: d.ComponentMeta): void;
export declare function serializeAppGlobal(config: d.Config, collectionDir: string, collectionData: d.CollectionData, globalModule: d.ModuleFile): void;
export declare function parseGlobal(config: d.Config, collectionDir: string, collectionData: d.CollectionData, collection: d.Collection): void;
export declare function serializeBundles(config: d.Config, collectionData: d.CollectionData): void;
export declare function parseBundles(collectionData: d.CollectionData, collection: d.Collection): void;
export declare const BOOLEAN_KEY = "Boolean";
export declare const NUMBER_KEY = "Number";
export declare const STRING_KEY = "String";
export declare const ANY_KEY = "Any";