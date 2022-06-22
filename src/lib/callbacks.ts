import {ActionContext} from "vuex";
import type {StoreState} from "@/store";

export type FormCallback = (args: any, context: ActionContext<Partial<StoreState>, Partial<StoreState>>) => Promise<void>;
export type CallbackMap = Record<string, FormCallback>;
