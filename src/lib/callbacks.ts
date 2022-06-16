export type FormCallback = (args: any) => Promise<void>;
export type CallbackMap = Record<string, FormCallback>;
