/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersionsdk版本
 * @extra透传字段
 * @jsError js 和 promise 报错异常上报
 */
interface DefaultOptions {
    uuid: string | undefined;
    requestUrl: string | undefined;
    historyTracker: boolean;
    hashTracker: boolean;
    domTracker: boolean;
    sdkVersion: string | number;
    extra: Record<string, any> | undefined;
    jsError: boolean;
}
interface TrackerOptions extends Partial<DefaultOptions> {
    requestUrl: string;
}

declare class Tracker {
    data: TrackerOptions;
    constructor(options: TrackerOptions);
    private initDefaultOptions;
    setUuid<T extends DefaultOptions["uuid"]>(uuid: T): void;
    setExtra<T extends DefaultOptions["extra"]>(extra: T): void;
    sendTracker<T>(data: T): void;
    private captureDomEvent;
    private captureEvents;
    private installTracker;
    private jsErrorTracker;
    private errorTracker;
    private promiseErrorTracker;
    private reportTracker;
}

export { Tracker as default };
