import * as d from '../declarations';
export declare class ScreenshotConnector implements d.ScreenshotConnector {
    rootDir: string;
    cacheDir: string;
    packageDir: string;
    screenshotDirName: string;
    imagesDirName: string;
    buildsDirName: string;
    masterBuildFileName: string;
    screenshotCacheFileName: string;
    logger: d.Logger;
    buildId: string;
    buildMessage: string;
    buildAuthor: string;
    buildUrl: string;
    previewUrl: string;
    buildTimestamp: number;
    appNamespace: string;
    screenshotDir: string;
    imagesDir: string;
    buildsDir: string;
    masterBuildFilePath: string;
    screenshotCacheFilePath: string;
    currentBuildDir: string;
    updateMaster: boolean;
    allowableMismatchedRatio: number;
    allowableMismatchedPixels: number;
    pixelmatchThreshold: number;
    timeoutBeforeScreenshot: number;
    pixelmatchModulePath: string;
    initBuild(opts: d.ScreenshotConnectorOptions): Promise<void>;
    pullMasterBuild(): Promise<void>;
    getMasterBuild(): Promise<d.ScreenshotBuild>;
    completeBuild(masterBuild: d.ScreenshotBuild): Promise<d.ScreenshotBuildResults>;
    publishBuild(results: d.ScreenshotBuildResults): Promise<d.ScreenshotBuildResults>;
    generateJsonpDataUris(build: d.ScreenshotBuild): Promise<void>;
    getScreenshotCache(): Promise<d.ScreenshotCache>;
    updateScreenshotCache(screenshotCache: d.ScreenshotCache, buildResults: d.ScreenshotBuildResults): Promise<d.ScreenshotCache>;
    toJson(masterBuild: d.ScreenshotBuild, screenshotCache: d.ScreenshotCache): string;
    sortScreenshots(screenshots: d.Screenshot[]): d.Screenshot[];
    sortCompares(compares: d.ScreenshotDiff[]): d.ScreenshotDiff[];
}
