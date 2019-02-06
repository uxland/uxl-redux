import {Action, Reducer} from "redux";

export const RESET_STORE_ACTION = "@@uxl-redux:reset-state:action";
export const resetableReducer: (reducer: Reducer<any, any>, defaultState: any) => Reducer<any, any>  = (reducer: Reducer<any, any>, defaultState: any = {}) => (state: any, action: Action) =>
    action.type === RESET_STORE_ACTION ? defaultState : reducer(state, action);