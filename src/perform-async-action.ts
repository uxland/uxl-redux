import {Store} from "redux";
import {createAsyncActions} from "./create-async-actions";

export async function performAsyncAction<T = any>(actionName: string, fn: () => Promise<T>, store: Store, meta?: any, errorHandler?: (error) => Promise<any>) {
    let started = window.performance.now();
    let actions = createAsyncActions(actionName);
    try {
        store.dispatch({type: actions.started, meta: meta});
        let payload = await fn();
        store.dispatch({type: actions.succeeded, payload, meta, timestamp: new Date()});
        return payload;
    }
    catch (e) {
        if(errorHandler)
            await errorHandler(e);
        store.dispatch({type: actions.failed, payload: e, meta});
    }
    finally {
        store.dispatch({type: actions.ended, payload: {elapsed: window.performance.now() - started}, meta});
    }
}