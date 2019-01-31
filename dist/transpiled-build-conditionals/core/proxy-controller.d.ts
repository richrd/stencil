import { DomApi, HostElement } from '../declarations';
export declare const proxyController: (domApi: DomApi, controllerComponents: {
    [tag: string]: HostElement;
}, ctrlTag: string) => {
    'create': () => Promise<any>;
    'componentOnReady': () => Promise<any>;
};
export declare const loadComponent: (domApi: DomApi, controllerComponents: {
    [tag: string]: HostElement;
}, ctrlTag: string, ctrlElm?: any, body?: any) => Promise<any>;
