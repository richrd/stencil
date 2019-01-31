import * as d from '../declarations';
export declare const initComponentInstance: (plt: d.PlatformApi, elm: d.HostElement, hostSnapshot: d.HostSnapshot, perf: Performance, instance?: d.ComponentInstance, componentConstructor?: d.ComponentConstructor, queuedEvents?: any[], i?: number) => d.ComponentInstance;
export declare const initComponentLoaded: (plt: d.PlatformApi, elm: d.HostElement, hydratedCssClass: string, perf: Performance, instance?: d.ComponentInstance, onReadyCallbacks?: ((elm: d.HostElement) => void)[], hasCmpLoaded?: boolean) => any;
export declare const propagateComponentReady: (plt: d.PlatformApi, elm: d.HostElement, index?: number, ancestorsActivelyLoadingChildren?: d.HostElement[], ancestorHostElement?: d.HostElement, cb?: Function) => void;
