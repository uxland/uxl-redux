import {Dispatch} from "redux";
import {createAsyncActions} from "./create-async-actions";
export interface ErrorHandler {
    (error: Error): Promise<any>;
}

export const performAsyncAction =  <T = any> (dispatch: Dispatch) =>  (actionName) =>{
    const actions = createAsyncActions(actionName);
    return (fn: (...args: any) => Promise<T>, errorHandler?: ErrorHandler) => async(meta: any, ...args: any) =>{
        let started = window.performance.now();
        try {
            dispatch({type: actions.started, meta});
            let payload = await fn.call(this, ...args);
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