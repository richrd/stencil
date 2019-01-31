export interface WorkerOptions {
    maxConcurrentWorkers?: number;
    maxConcurrentTasksPerWorker?: number;
}
export interface WorkerTask {
    taskId: number;
    method: string;
    args: any[];
    resolve: (val: any) => any;
    reject: (msg: string) => any;
    retries: number;
    isLongRunningTask: boolean;
    workerKey: string;
}
export interface WorkerMessage {
    taskId?: number;
    method?: string;
    args?: any[];
    value?: any;
    error?: string;
    exit?: boolean;
}
export declare type WorkerRunner = (methodName: string, args: any[]) => Promise<any>;
export interface WorkerRunnerOptions {
    isLongRunningTask?: boolean;
    workerKey?: string;
}
export interface WorkerContext {
    tsHost?: any;
    tsProgram?: any;
}
