(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      (global.wmxTracker = factory()));
})(this, function () {
  "use strict";

  var TrackerConfig;
  (function (TrackerConfig) {
    TrackerConfig["SDK_VERSION"] = "1.0.0";
  })(TrackerConfig || (TrackerConfig = {}));

  const createHisttoryEvent = (type) => {
    const original = history[type];
    return function () {
      const res = original.apply(this, arguments);
      const event = new Event(type);
      window.dispatchEvent(event);
      return res;
    };
  };

  const MouseEventList = [
    "click",
    "dblclick",
    "contextmenu",
    "mousedown",
    "mouseup",
    "mouseenter",
    "mouseout",
    "mouseover",
  ];
  class Tracker {
    constructor(options) {
      this.data = Object.assign(this.initDefaultOptions(), options);
      this.installTracker();
    }
    initDefaultOptions() {
      window.history["pushState"] = createHisttoryEvent("pushState");
      window.history["replaceState"] = createHisttoryEvent("replaceState");
      return {
        sdkVersion: TrackerConfig.SDK_VERSION,
        historyTracker: false,
        hashTracker: false,
        domTracker: false,
        jsError: false,
      };
    }
    setUuid(uuid) {
      this.data.uuid = uuid;
    }
    setExtra(extra) {
      this.data.extra = extra;
    }
    sendTracker(data) {
      this.reportTracker(data);
    }
    captureDomEvent() {
      MouseEventList.forEach((event) => {
        document.addEventListener(event, (e) => {
          const target = e.target;
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
    captureEvents(eventListener, targetKey, data) {
      eventListener.forEach((event) => {
        window.addEventListener(event, () => {
          console.log("监听到了", event, targetKey);
          this.reportTracker({ event, targetKey, data });
        });
      });
    }
    installTracker() {
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
    jsErrorTracker() {
      this.errorTracker();
      this.promiseErrorTracker();
    }
    errorTracker() {
      window.addEventListener("error", (event) => {
        const { message } = event;
        console.log("js-error", event);
        this.reportTracker({
          event: "js-error",
          targetKey: "js-error",
          message,
        });
      });
    }
    promiseErrorTracker() {
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
    reportTracker(data) {
      const params = Object.assign(this.data, data, { time: Date.now() });
      let header = {
        type: "application/x-www-form-urlencoded",
      };
      let blob = new Blob([JSON.stringify(params)], header);
      navigator.sendBeacon(this.data.requestUrl, blob);
    }
  }

  new Tracker({
    requestUrl: "http://localhost:9000/tracker",
    historyTracker: true,
    hashTracker: true,
    domTracker: true,
    jsError: true,
  });
  console.log(asss);
  return Tracker;
});
