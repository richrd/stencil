import * as d from '../declarations';
export declare const queueUpdate: (plt: d.PlatformApi, elm: d.HostElement, perf: Performance) => void;
export declare const update: (plt: d.PlatformApi, elm: d.HostElement, perf: Performance, isInitialLoad?: boolean, instance?: d.ComponentInstance, ancestorHostElement?: d.HostElement) => Promise<void>;
