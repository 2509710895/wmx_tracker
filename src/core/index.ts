import { DefaultOptions, TrackerConfig, TrackerOptions } from "../types/index";
import { createHisttoryEvent } from "../utils/pv";

const MouseEventList: string[] = [
  "click",
  "dblclick",
  "contextmenu",
  "mousedown",
  "mouseup",
  "mouseenter",
  "mouseout",
  "mouseover",
];

export default class Tracker {
  public data: TrackerOptions;
  constructor(options: TrackerOptions) {
    this.data = Object.assign(this.initDefaultOptions(), options);
    this.installTracker();
  }

  private initDefaultOptions(): DefaultOptions {
    window.history["pushState"] = createHisttoryEvent("pushState");
    window.history["replaceState"] = createHisttoryEvent("replaceState");
    createHisttoryEvent("pushState");
    return <DefaultOptions>{
      sdkVersion: TrackerConfig.SDK_VERSION,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
    };
  }

  public setUuid<T extends DefaultOptions["uuid"]>(uuid: T) {
    this.data.uuid = uuid;
  }

  public setExtra<T extends DefaultOptions["extra"]>(extra: T) {
    this.data.extra = extra;
  }

  public sendTracker<T>(data: T) {
    this.reportTracker(data);
  }

  private captureDomEvent() {
    MouseEventList.forEach((event) => {
      document.addEventListener(event, (e) => {
        const target = e.target as HTMLElement;
        if (!target || typeof target.getAttribute !== "function") {
          return;
        }
        const targetKey = target.getAttribute("target-key");
        if (targetKey) {
          this.reportTracker({ event, targetKey });
        }
      });
    });
  }

  private captureEvents<T>(
    eventListener: string[],
    targetKey: string,
    data?: T
  ) {
    eventListener.forEach((event) => {
      window.addEventListener(event, () => {
        console.log("监听到了", event, targetKey);
        this.reportTracker({ event, targetKey, data });
      });
    });
  }

  private installTracker() {
    if (this.data.historyTracker) {
      this.captureEvents(
        ["popstate", "pushState", "replaceState"],
        "history-pv"
      );
    }
    if (this.data.hashTracker) {
      this.captureEvents(["hashchange"], "hash-pv");
    }
    if (this.data.domTracker) {
      this.captureDomEvent();
    }
    if (this.data.jsError) {
      this.jsErrorTracker();
    }
  }
  private jsErrorTracker() {
    this.errorTracker();
    this.promiseErrorTracker();
  }
  private errorTracker() {
    window.addEventListener(
      "error",
      (event) => {
        const { message } = event;
        console.log("js-error", event);
        this.reportTracker({
          event: "js-error",
          targetKey: "js-error",
          message,
        });
      },
      true
    );
  }
  private promiseErrorTracker() {
    window.addEventListener("unhandledrejection", (event) => {
      console.log("promise-error", event);
      event.promise.catch((err) => {
        this.reportTracker({
          event: "promise-error",
          targetKey: "promise-error",
          message: err,
        });
      });
    });
  }

  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, { time: Date.now() });
    let header = {
      type: "application/x-www-form-urlencoded",
    };
    let blob = new Blob([JSON.stringify(params)], header);
    navigator.sendBeacon(this.data.requestUrl, blob);
  }
}
