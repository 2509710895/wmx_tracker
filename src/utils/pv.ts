export const createHisttoryEvent = <T extends keyof History>(type: T) => {
  const original = history[type];
  return function (this: any) {
    const res = original.apply(this, arguments);
    const event = new Event(type);
    window.dispatchEvent(event);

    return res;
  };
};
