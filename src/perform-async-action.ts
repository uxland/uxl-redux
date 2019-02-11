import {Dispatch} from "redux";
import {createAsyncActions} from "./create-async-actions";
export interface ErrorHandler {
    (error: Error): Promise<any>;
}
export interface Executor<T = any> {
    (meta: any, ...args: any[]): Promise<T>
}

export const performAsyncAction: <T = any>(dispatch: Dispatch) => (actionType: string, fn: Executor, errorHandler?: ErrorHandler) => (meta: any) =>(...args: any[]) => Promise<T>
 = dispatch => (actionType, fn, errorHandler) => {
    const actions = createAsyncActions(actionType);
    return meta => async(...args: any) =>{
        let started = window.performance.now();
        try {
            dispatch({type: actions.started, meta});
            let payload = await fn.apply(this, args);
            dispatch({type: actions.succeeded, payload, meta, timestamp: new Date()});
            return payload;
        }
        catch (e) {
            if(errorHandler)
                await errorHandler(e);
            dispatch({type: actions.failed, payload: e, meta});
        }
        finally {
            dispatch({type: actions.ended, payload: {elapsed: window.performance.now() - started}, meta});
        }
    }
};
