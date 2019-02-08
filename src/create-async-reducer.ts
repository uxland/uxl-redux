import {Action} from "./create-action";
import {BasicOptions} from './create-basic-reducer';
import {Lens} from 'ramda';
import is from 'ramda/es/is';
import view from 'ramda/es/view';
import isNil from 'ramda/es/isNil';
import set from 'ramda/es/set';
import lensProp from 'ramda/es/lensProp';
import propEq from 'ramda/es/propEq';
import cond from 'ramda/es/cond';
import Tr from 'ramda/es/T';
import ifElse from 'ramda/es/ifElse';
import pipe from 'ramda/es/pipe';
import equals from 'ramda/es/equals';
import always from 'ramda/es/always';
import when from 'ramda/es/when';
import {resolvePath, PathResolver} from "./path-resolver";

export interface Options<T = any> extends BasicOptions<T>{
    timestampAccessor?: (action: Action) => Date;
    payloadAccessor?: (action: Action) => T;
    pathResolver?: Lens | PathResolver;
    keepPreviousStateOnStarted?: boolean;
}

export interface AsyncState<TState = any>{
    isFetching: boolean;
    error?: boolean;
    errorDescription?: string;
    exceptions?: any;
    state?: TState;
    didInvalidate?: boolean;
    timestamp?: Date;
    elapsed?: number;
}
const defaultState: AsyncState = {
    error: false,
    didInvalidate: false,
    isFetching: false
};

const fetchingState  = {...defaultState, isFetching: true};
export const getDefaultState = () => ({...defaultState});
const actionCreator = (base: string) => (action: string) => `${base}_${action}`;
const actionsCreator = (base: string) => {
    const creator = actionCreator(base);
    return ({startedAction: creator('STARTED'), succeededAction: creator('SUCCEEDED'), failedAction: creator('FAILED'), endedAction: creator('ENDED'), invalidatedAction: creator('INVALIDATED')});
};


const extractExceptions = (action: Action) => action.payload ? is(Array, action.payload) ? action.payload : {exceptions: [action.payload]} : {};
const extractErrorDescription = (action: Action) => ifElse(isNil, () => {}, payload => (<AsyncState>{errorDescription: isNil(payload.message) ? String(payload) : payload.message}))(action.payload);

type StateFactory = (state: any, action: Action) => any;
const typeEqual = propEq('type');
type CurrentStateGetter = (options: Options) => (state: any, action: Action) => any;
const getState: CurrentStateGetter = options => (state, action) => options.pathResolver ? view(resolvePath(options.pathResolver, action), state) : state;
const keepPreviousStateGetter:(defState: any) => CurrentStateGetter = (defState = defaultState) => options => {
    let getter = getState(options);
    return (state, action) => options.keepPreviousStateOnStarted ? getter(state, action) : defState;
};
export const createAsyncReducer = <T>(actionName: string, options: Options<T> = {}) => {
    const initialValue: any = isNil(options.defValue) ? {...defaultState} : {...defaultState, state: options.defValue};
    const defValue: any =  options.pathResolver ? {} : initialValue;
    const {startedAction, succeededAction, failedAction, endedAction, invalidatedAction} = actionsCreator(actionName);
    const isStarted = typeEqual(startedAction), isFailed = typeEqual(failedAction), isSucceeded = typeEqual(succeededAction), isEnded = typeEqual(endedAction), isInvalidated = typeEqual(invalidatedAction);
    const stateGetter = getState(options);
    const fetchingStateGetter = keepPreviousStateGetter(fetchingState)(options);
    const failedStateGetter = keepPreviousStateGetter(defaultState)(options);
    const getPayload = (action: Action) => options.payloadAccessor ? options.payloadAccessor(action) : action.payload;
    const setTimestamp = (action: Action) => (state: AsyncState<T>) =>{
        const timestamp = options.timestampAccessor ? options.timestampAccessor(action) : action.timestamp;
        return timestamp ? set(lensProp('timestamp'), timestamp, state) : state
    };
    const startedStateFactory: StateFactory = pipe(fetchingStateGetter, when( () => options.keepPreviousStateOnStarted, s => ({...fetchingState, state: s})));
    const succeedFactory: StateFactory = (state, action) => set(lensProp('state'), getPayload(action), defaultState);
    const failedFactory: StateFactory = (state, action) =>  pipe(failedStateGetter, s => ({...s, ...defaultState, ...extractExceptions(action), ...extractErrorDescription(action), error: true}))(state, action);
    const endedFactory: StateFactory = (state, action) => (action.elapsed || action.payload) ? {...stateGetter(state, action), elapsed: action.elapsed || action.payload} : stateGetter(state, action);
    const invalidatedFactory: StateFactory = (state, action) =>  set(lensProp('didInvalidate'), true, stateGetter(state, action));

    const updateState = (state, action, newState) => () => options.pathResolver ? set(resolvePath(options.pathResolver, action), newState, state) : newState;
    const setState = (state, action) => (newState) => pipe(stateGetter, ifElse(equals(newState), always(state), updateState(state, action, newState)))(state, action);
    const stateFactory = (factory: StateFactory) => state => action => pipe(factory, setTimestamp(action), setState(state, action))(state, action);
    return (state = defValue, action: Action) =>cond([
        [isStarted, stateFactory(startedStateFactory)(state)],
        [isSucceeded, stateFactory(succeedFactory)(state)],
        [isFailed, stateFactory(failedFactory)(state)],
        [isEnded, stateFactory(endedFactory)(state)],
        [isInvalidated, stateFactory(invalidatedFactory)(state)],
        [Tr, () => state]
    ])(action);
};

export default createAsyncReducer;