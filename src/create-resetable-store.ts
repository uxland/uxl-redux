import {Reducer, createStore, Store, Action, applyMiddleware, Middleware} from "redux";
import {resetableReducer} from "./resetable-reducer";

export const createResetableSore: <S = any, A extends Action<any> = Action<any>>(mainReducer: Reducer<any, any>, middleware: Middleware<any, any, any>, defaultState?: S, preloadState?: S) => Store<S, A> =
    (mainReducer, middleware, defaultState, preloadState) => createStore<any, any, any, any>(resetableReducer(mainReducer, defaultState), preloadState, applyMiddleware(middleware));