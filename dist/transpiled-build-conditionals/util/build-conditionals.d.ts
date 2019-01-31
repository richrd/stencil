import * as d from '../declarations';
export declare function getDefaultBuildConditionals(): d.BuildConditionals;
export declare function setBuildConditionals(config: d.Config, compilerCtx: d.CompilerCtx, coreId: d.BuildCoreIds, buildCtx: d.BuildCtx, entryModules: d.EntryModule[]): Promise<d.BuildConditionals>;
export declare function getLastBuildConditionals(compilerCtx: d.CompilerCtx, coreId: d.BuildCoreIds, buildCtx: d.BuildCtx): d.BuildConditionals;
export declare function setBuildFromComponentMeta(coreBuild: d.BuildConditionals, cmpMeta: d.ComponentMeta): void;
export declare function setBuildFromComponentContent(coreBuild: d.BuildConditionals, jsText: string): void;
