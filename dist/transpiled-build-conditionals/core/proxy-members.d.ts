import * as d from '../declarations';
export declare const defineMember: (plt: d.PlatformApi, property: d.ComponentConstructorProperty, elm: d.HostElement, instance: d.ComponentInstance, memberName: string, hostSnapshot: d.HostSnapshot, perf: Performance, hostAttributes?: d.HostSnapshotAttributes, hostAttrValue?: string) => void;
export declare const setValue: (plt: d.PlatformApi, elm: d.HostElement, memberName: string, newVal: any, perf: Performance, instance?: d.ComponentInstance, values?: any) => void;
export declare const definePropertyValue: (obj: any, propertyKey: string, value: any) => void;
export declare const definePropertyGetterSetter: (obj: any, propertyKey: string, get: any, set: any) => void;
