import {Action} from "./create-action";
import {BasicOptions} from './create-basic-reducer';
import {Lens} from 'ramda';
import is from 'ramda/es/is';
import view from 'ramda/es/view';
import isNil from 'ramda/es/isNil';
import set from 'ramda/es/set';
import {resolvePath} from "./path-resolver";
import {PathResolver} from "./types";

export interface Options<T = any> extends BasicOptions<T>{
    timestampAccessor?: (action: Action) => Date;
    payloadAccessor?: (action: Action) => T;
    pathResolver?: Lens | PathResolver;
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
export const getDefaultState = () => ({...defaultState});
const actionCreator = (base: string) => (action: string) => `${base}_${action}`;
const actionsCreator = (base: string) => {
    const creator = actionCreator(base);
    return ({startedAction: creator('STARTED'), succeededAction: creator('SUCCEEDED'), failedAction: creator('FAILED'), endedAction: creator('ENDED'), invalidatedAction: creator('INVALIDATED')});
};

const setPropertyOnlyIfDefined = (state: any, prop: string, value: any) => value ? {...state, [prop]: value} : state;

const extractExceptions = (action: Action) => action.payload ? is(Array, action.payload) ? action.payload : [action.payload] : null;
const extractErrorDescription = (action: Action) => action.payload ? !isNil(action.payload.message) ? action.payload.message : String(action.payload) : '';

const setErrorDescription = (state: AsyncState, action: Action): AsyncState => setPropertyOnlyIfDefined(state, 'errorDescription', extractErrorDescription(action));
const setErrorExceptions = (state: AsyncState, action: Action): AsyncState => setPropertyOnlyIfDefined(state, 'exceptions', extractExceptions(action));

type propertySetter = (state: AsyncState, action: Action) => AsyncState;
const piper = (...pipes:propertySetter[]) => (state: AsyncState, action: Action) =>
    pipes.reduce((previousValue, currentValue) => currentValue(previousValue, action), state);


const setTimestampFactory = (options: Options) => (state: AsyncState, action: Action) =>{
  const timestamp = options.timestampAccessor ? options.timestampAccessor(action) : action.timestamp;
  return setPropertyOnlyIfDefined(state, 'timestamp', timestamp);
};
const setPayloadFactory = <T>(options: Options<T>) => (state: AsyncState<T>, action: Action) =>
    ({...state, state: options.payloadAccessor ? options.payloadAccessor(action) : action.payload});
const setIsFetching = (state: AsyncState) => ({...state, isFetching: true});
const setElapsed = (state, action) => setPropertyOnlyIfDefined(state, 'elapsed', action.payload);

const setter = (options: Options, setter) => {
    const getState = (state: AsyncState, action: Action) =>
        options.pathResolver ? view(resolvePath(options.pathResolver, action), state) : state;
    const setState = (state, newState, action) => options.pathResolver ? set(resolvePath(options.pathResolver, action), newState, state) : newState;
    return (state, action) => {
        const currentState  = getState(state, action);
        const newState = setter(currentState, action);
        return newState !== currentState ? setState(state, newState, action) : state;
    }
};
const initialValueSetter = (setter, initialValue) => (state, action) => setter(initialValue, action);

const nop = state => state;

export const createAsyncReducer = <T>(actionName: string, options: Options<T> = {}) => {
    const initialValue = isNil(options.defValue) ? {...defaultState} : {...defaultState, state: options.defValue};
    const {startedAction, succeededAction, failedAction, endedAction, invalidatedAction} = actionsCreator(actionName);
    const setterFactory = (...pipes) => piper(...pipes, setTimestampFactory(options));
    const setters = {
        [startedAction]: setter(options, initialValueSetter(setterFactory(setIsFetching), initialValue)),
        [succeededAction]: setter(options, initialValueSetter(setterFactory(setPayloadFactory(options)), initialValue)),
        [failedAction]: setter (options, initialValueSetter(setterFactory( state => ({...state, error: true}), setErrorDescription, setErrorExceptions), initialValue)),
        [endedAction]: setter(options, setterFactory(setElapsed)),
        [invalidatedAction]: setter(options, setterFactory((state) => ({...state, didInvalidate: true})))
    };
    return (state: AsyncState<T> = options.pathResolver ? <any>{} : initialValue, action: Action) => (setters[action.type] || nop)(state, action);
};

export default createAsyncReducer;