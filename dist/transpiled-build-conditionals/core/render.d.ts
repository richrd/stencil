import * as d from '../declarations';
export declare const render: (plt: d.PlatformApi, cmpMeta: d.ComponentMeta, hostElm: d.HostElement, instance: d.ComponentInstance, perf: Performance) => void;
export declare const applyComponentHostData: (vnodeHostData: d.VNodeData, hostMeta: d.ComponentConstructorHost, instance: any) => d.VNodeData;
export declare const convertCssNamesToObj: (cssClassObj: {
    [className: string]: boolean;
}, className: string, mode?: string, color?: string) => void;
export declare const reflectInstanceValuesToHostAttributes: (properties: d.ComponentConstructorProperties, instance: d.ComponentInstance, reflectHostAttr?: d.VNodeData) => d.VNodeData;
