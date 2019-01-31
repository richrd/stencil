import { ComponentInstance, HostElement, PlatformApi } from '../declarations';
export declare function initElementListeners(plt: PlatformApi, elm: HostElement): void;
export declare function createListenerCallback(plt: PlatformApi, elm: HostElement, eventMethodName: string, val?: any): (ev?: any) => void;
export declare function enableEventListener(plt: PlatformApi, instance: ComponentInstance, eventName: string, shouldEnable: boolean, attachTo?: string | Element, passive?: boolean): void;
