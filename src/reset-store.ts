import {Action, Store} from "redux";
import {RESET_STORE_ACTION} from "./resetable-reducer";
import {tap, pipe} from  'ramda';
const resetAction: Action = {type: RESET_STORE_ACTION};
const initAction: Action = {type: "@@uxl-redux:init-state:action"};
const forceReset = (store: Store) => store.dispatch(resetAction);
const init = (store: Store) => store.dispatch(initAction);

export const resetStore: (store: Store<any, any>) => Store<any, any> = pipe(tap(forceReset), tap(init));