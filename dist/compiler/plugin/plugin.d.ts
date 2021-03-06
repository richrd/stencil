import * as d from '../../declarations';
import { PluginCtx } from '../../declarations/plugin';
export declare function runPluginResolveId(pluginCtx: PluginCtx, importee: string): Promise<string>;
export declare function runPluginLoad(pluginCtx: PluginCtx, id: string): Promise<string>;
export declare function runPluginTransforms(config: d.Config, compilerCtx: d.CompilerCtx, buildCtx: d.BuildCtx, id: string, moduleFile?: d.ModuleFile): Promise<d.PluginTransformResults>;
