import {createAction} from "./create-action";
import {always, drop, ifElse, is} from 'ramda';

type MetaCreator = (...args: any) => any;
const createMeta = (mc: MetaCreator) => (...args: any) => mc(...drop(1, args));
export const createActionThunk = (type: string, fn: Function, metaCreator?: (...args: any[]) => any) => {
    const TYPE_START = `${type}_STARTED`;
    const TYPE_SUCCEEDED = `${type}_SUCCEEDED`;
    const TYPE_FAILED = `${type}_FAILED`;
    const TYPE_ENDED = `${type}_ENDED`;

    const finalMetaCreator: (mc) => MetaCreator = ifElse(is(Function), createMeta, always(undefined));
    const actionCreators = {
        [TYPE_START]: createAction(TYPE_START, () => undefined, metaCreator),
        [TYPE_SUCCEEDED]: createAction(TYPE_SUCCEEDED, undefined, finalMetaCreator(metaCreator)),
        [TYPE_FAILED]: createAction(TYPE_FAILED, undefined, finalMetaCreator(metaCreator)),
        [TYPE_ENDED]: createAction(TYPE_ENDED, undefined, finalMetaCreator(metaCreator))
    };

    const factory: any = (...args) => (dispatch, getState, extra) => {
        let result;
        let startedAt = (new Date()).getTime();
        dispatch(actionCreators[TYPE_START](...args));
        const succeeded = (data) => {
            dispatch(actionCreators[TYPE_SUCCEEDED](data, ...args));
            let endedAt = (new Date()).getTime();
            dispatch(actionCreators[TYPE_ENDED]({
                elapsed: endedAt - startedAt
            }, ...args));
            return data;
        };
        const failed = (err) => {
            let endedAt = (new Date()).getTime();
            dispatch(actionCreators[TYPE_FAILED](err, ...args));
            dispatch(actionCreators[TYPE_ENDED]({
                elapsed: endedAt - startedAt
            }, ...args));
            throw err;
        };
        try {
            result = fn(...args, {getState, dispatch, extra});
        } catch (error) {
            failed(error);
        }
        // in case of async (promise), use success and fail callbacks.
        if (result && result.then) {
            return result.then(succeeded, failed);
        }
        return succeeded(result);
    };

    factory.NAME = type;
    factory.START = actionCreators[TYPE_START].toString();
    factory.SUCCEEDED = actionCreators[TYPE_SUCCEEDED].toString();
    factory.FAILED = actionCreators[TYPE_FAILED].toString();
    factory.ENDED = actionCreators[TYPE_ENDED].toString();

    return factory;
};
