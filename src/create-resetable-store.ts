import {Action, applyMiddleware, createStore, Middleware, Reducer, Store} from "redux";
import {resetableReducer} from "./resetable-reducer";

export const createResetableStore: <S = any, A extends Action<any> = Action<any>>(mainReducer: Reducer<any, any>, middleware: Middleware<any, any, any>, defaultState?: S, preloadState?: S) => Store<S, A> =
    (mainReducer, middleware, defaultState, preloadState) => createStore<any, any, any, any>(resetableReducer(mainReducer, defaultState), preloadState, applyMiddleware(middleware));
export default createResetableStore;