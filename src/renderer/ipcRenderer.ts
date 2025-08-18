import { AllIpcHandlers } from '../electron/ipcHandlers';

export const electronMethods = new Proxy({} as AllIpcHandlers, {
  get(target, prop: keyof AllIpcHandlers) {
    return (...args: any[]) => window.ipcRenderer.invoke(prop, ...args);
  }
});
