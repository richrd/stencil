/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/snabbdom/snabbdom/blob/master/LICENSE
 *
 * Modified for Stencil's renderer and slot projection
 */
import * as d from '../../declarations';
export declare const createRendererPatch: (plt: d.PlatformApi, domApi: d.DomApi) => d.RendererApi;
export declare const callNodeRefs: (vNode: d.VNode, isDestroy?: boolean) => void;
