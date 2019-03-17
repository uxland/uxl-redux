import {AsyncState} from "../../src";
import {lensProp} from 'ramda';
import createAsyncReducer from '../../src/create-async-reducer';
import {factory} from "../../src";

const action = 'TYPE';
const actionCreator = (base: string) => (action: string) => `${base}_${action}`;
const endedAction = actionCreator(action)('ENDED');
const startedAction = actionCreator(action)('STARTED');
const failedAction = actionCreator(action)('FAILED');
const succeededAction = actionCreator(action)('SUCCEEDED');
const invalidatedAction = actionCreator(action)('INVALIDATED');

describe('create async reducer fixture', () => {
    it('should initialize to default AsyncState', () =>{
       const reducer = createAsyncReducer<any>(action);
       const state = reducer(undefined, {type: 'OTHER-TYPE'});
       expect(state).toEqual({
           didInvalidate: false,
           error: false,
           isFetching: false,
       });
    });
    it('should initialize state if default value is supplied', () =>{
        const reducer = createAsyncReducer<number>(action, {defValue: 1});
        const state = reducer(undefined, {type: 'OTHER-TYPE'});
        expect(state).toEqual({didInvalidate: false, state: 1, error: false, isFetching: false});
    });
    it('should return state if action type is different', () =>{
        const reducer = createAsyncReducer<number>(action);
        const state = {isFetching: false, didInvalidate: false, error: false, state: 15};
        const newState = reducer(state, {type: 'OTHER-ACTION', payload: 34});
        expect(newState).toBe(state);
    });
    test('action name is not a valid action', () =>{
        const reducer = createAsyncReducer<number>(action);
        const state = {isFetching: false, didInvalidate: false, error: false, state: 15};
        const newState = reducer(state, {type: action, payload: 34});
        expect(newState).toBe(state);
    });
    test( 'handling action started sets isFetching property to true and resets other properties', () =>{
        const reducer = createAsyncReducer<number>(action);
        const state: AsyncState = {isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() };
        const newState = reducer(state, {type: startedAction});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: true, didInvalidate: false, error: false});
    });
    test('handling action succeeded set state to payload and resets other properties', () =>{
        const reducer = createAsyncReducer<number>(action);
        const state: AsyncState = {isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() };
        const newState = reducer(state, {type: succeededAction, payload: 55});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: false, state: 55});
    });
    test('handling action failed sets error properties', () =>{
        const reducer = createAsyncReducer<number>(action);
        const state: AsyncState = {isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() };
        let newState = reducer(state, {type: failedAction, payload: {message: 'error message'}});
        expect(state).not.toBe(newState);
        const expected = {isFetching: false, didInvalidate: false, error: true, errorDescription: 'error message', exceptions: [{message: 'error message'}]};
        expect(newState).toEqual(expected);
        newState = reducer(state, {type: failedAction});
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: true});
        newState = reducer(state, {type: failedAction, payload: 34});
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: true, errorDescription: '34', exceptions: [34]});
    });
    test('handling action ended sets elapsed time', () =>{
        const reducer = createAsyncReducer<number>(action);
        const state: AsyncState = {isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() };
        let newState = reducer(state, {type: endedAction, payload:65});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({...state, elapsed: 65});
    });
    test('handling action ended should not set elapsed is not supplied', () =>{
        const reducer = createAsyncReducer<number>(action);
        const state: AsyncState = {isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() };
        let newState = reducer(state, {type: endedAction});
        expect(state).toBe(newState);
        expect(newState).toEqual({...state});
    });
    test('actions should set timestamp if supplied in action', () =>{
        const timestamp = new Date();
        const reducer = createAsyncReducer<number>(action);
        const state: AsyncState = {isFetching: false, didInvalidate: false, error: false, state: 15};
        let newState = reducer(state, {type: startedAction, payload: 55, timestamp});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: true, didInvalidate: false, error: false, timestamp: timestamp});
        newState = reducer(state, {type: succeededAction, payload: 55, timestamp});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: false, state: 55, timestamp: timestamp});
        newState = reducer(state, {type: failedAction, payload: 'fail', timestamp});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: true, errorDescription: 'fail', exceptions: ['fail'], timestamp: timestamp});
        newState = reducer(state, {type: endedAction, payload: 35, timestamp});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: false, state: 15, elapsed: 35, timestamp: timestamp});
        newState = reducer(state, {type: invalidatedAction, payload: 35, timestamp});
        expect(newState).toEqual( {isFetching: false, didInvalidate: true, error: false, state: 15, timestamp: timestamp});
    });
    test('actions should set timestamp if timestamp resolver option', () =>{
        const timestamp = new Date();
        let reducer = createAsyncReducer<{value?: number, timestamp?: Date}>(action, {timestampAccessor: a => a.payload.timestamp});
        const state: AsyncState<{value?: number, timestamp?: Date}> = {isFetching: false, didInvalidate: false, error: false, state: {value: 15}};
        let newState = reducer(state, {type: startedAction, payload: {timestamp}});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: true, didInvalidate: false, error: false, timestamp: timestamp});
        newState = reducer(state, {type: succeededAction, payload: {value: 55, timestamp}});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: false, state: {value: 55, timestamp}, timestamp: timestamp});
        newState = reducer(state, {type: failedAction, payload: {message: 'fail', timestamp}, timestamp});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: true, errorDescription: 'fail', exceptions: [{message: 'fail', timestamp}], timestamp: timestamp});

        newState = reducer(state, {type: invalidatedAction, payload: {message: 'fail', timestamp}, timestamp});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: true, error: false, state: {value: 15}, timestamp});

        reducer = createAsyncReducer<{value?: number, timestamp?: Date}>(action, {timestampAccessor: a => a.timestamp});
        newState = reducer(state, {type: endedAction, payload: 35, timestamp});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({isFetching: false, didInvalidate: false, error: false, state: {value: 15}, elapsed: 35, timestamp: timestamp});
    });
    test('invalidate action should set didInvalidate property', () =>{
        let reducer = createAsyncReducer(action);
        const state: AsyncState = {isFetching: false, didInvalidate: false, error: false, state: {value: 15}};
        const newState = reducer(state, {type: invalidatedAction, payload: {value: 18}});
        expect(newState).not.toBe(state);
        expect(newState).toEqual({isFetching: false, error: false, didInvalidate: true, state: {value: 15}});
    });
    test('succeeded action should use payload accessor if supplied', () =>{
       const reducer = createAsyncReducer(action, {payloadAccessor: a => a.payload.data});
       const newState = reducer(undefined, {type: succeededAction, payload:{data: 15}});
       expect(newState).toEqual({
           isFetching: false,
           didInvalidate: false,
           error: false,
           state: 15
       });
    });
});
const dataLensProp = lensProp('data');
const metaPathResolver = factory(action => lensProp(action.meta.propertyId));
describe('create async reducer fixture path resolver', () => {
    it('should initialize to empty object', () =>{
        let reducer = createAsyncReducer<any>(action, {pathResolver: dataLensProp});
        let  newState = reducer(undefined, {type: 'OTHER-TYPE'});
        expect(newState).toEqual({});

        reducer = createAsyncReducer<any>(action, {pathResolver: metaPathResolver});
        newState = reducer(undefined, {type: 'OTHER-TYPE', meta: {propertyId: 'data'}});
        expect(newState).toEqual({});
    });
    test('should return state if action type is different', () =>{
        let reducer = createAsyncReducer<number>(action, {pathResolver: dataLensProp});
        const state = {isFetching: false, didInvalidate: false, error: false, state: 15};
        let  newState = reducer(state, {type: 'OTHER-ACTION', payload: 34});
        expect(newState).toBe(state);

        reducer = createAsyncReducer<any>(action, {pathResolver: metaPathResolver});
        newState = reducer(state, {type: 'OTHER-ACTION', payload: 34});
        expect(newState).toBe(state);
    });
    test('action name is not a valid action', () =>{
        let reducer = createAsyncReducer<number>(action, {pathResolver: dataLensProp});
        const state = {isFetching: false, didInvalidate: false, error: false, state: 15};
        let  newState = reducer(state, {type: action, payload: 34});
        expect(newState).toBe(state);

        reducer = createAsyncReducer<any>(action, {pathResolver: metaPathResolver});
        newState = reducer(state, {type: action, payload: 34});
        expect(newState).toBe(state);
    });
    test( 'handling action started sets isFetching property to true and resets other properties', () =>{
        let reducer = createAsyncReducer(action, {pathResolver: dataLensProp});
        const state: any = {data:{isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() }};
        let newState = reducer(state, {type: startedAction});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({data:{isFetching: true, didInvalidate: false, error: false}});
        reducer = createAsyncReducer<any>(action, {pathResolver: metaPathResolver});
        newState = reducer(state, {type: startedAction, meta: {propertyId: 'data'}});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({data:{isFetching: true, didInvalidate: false, error: false}});
    });
   test('handling action succeeded set state to payload and resets other properties', () =>{
        let reducer = createAsyncReducer<number>(action, {pathResolver:dataLensProp});
        const state: any = {data: {isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() }};
        let newState = reducer(state, {type: succeededAction, payload: 55});
        expect(state).not.toBe(newState);
        expect(newState).toEqual({data:{isFetching: false, didInvalidate: false, error: false, state: 55}});

       reducer = createAsyncReducer<number>(action, {pathResolver: metaPathResolver});
       newState = reducer(state, {type: succeededAction, payload: 55, meta: {propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: false, didInvalidate: false, error: false, state: 55}});
    });
    test('handling action failed sets error properties', () =>{
       const state: any = {data:{isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() }};
       const expected = {data: {isFetching: false, didInvalidate: false, error: true, errorDescription: 'error message', exceptions: [{message: 'error message'}]}};

       let reducer = createAsyncReducer<number>(action, {pathResolver: dataLensProp});
       let newState = reducer(state, {type: failedAction, payload: {message: 'error message'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual(expected);
       newState = reducer(state, {type: failedAction,  meta:{propertyId: 'data'}});
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: true}});
       newState = reducer(state, {type: failedAction, payload: 34});
       expect(newState).toEqual({data:{isFetching: false, didInvalidate: false, error: true, errorDescription: '34', exceptions: [34]}});

        reducer = createAsyncReducer<number>(action, {pathResolver: metaPathResolver});
        newState = reducer(state, {type: failedAction, payload: {message: 'error message'}, meta:{propertyId: 'data'}});
        expect(state).not.toBe(newState);
        expect(newState).toEqual(expected);
        newState = reducer(state, {type: failedAction,  meta:{propertyId: 'data'}});
        expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: true}});
        newState = reducer(state, {type: failedAction, payload: 34,  meta:{propertyId: 'data'}});
        expect(newState).toEqual({data:{isFetching: false, didInvalidate: false, error: true, errorDescription: '34', exceptions: [34]}});
   });
   test('handling action ended sets elapsed time', () =>{
       let reducer = createAsyncReducer<number>(action, {pathResolver: dataLensProp});
       const state: any = {data:{isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() }};
       let newState = reducer(state, {type: endedAction, payload:65});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({...state, data:{...state.data, elapsed: 65}});
       reducer = createAsyncReducer<number>(action, {pathResolver: metaPathResolver});
       newState = reducer(state, {type: endedAction, payload:65, meta:{propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({...state, data:{...state.data, elapsed: 65}});
   });
   test('handling action ended should not set elapsed if not supplied', () =>{
       let reducer = createAsyncReducer<number>(action, {pathResolver: dataLensProp});
       const state: any = {data: {isFetching: false, didInvalidate: true, error: true, errorDescription: 'myError', exceptions: [],state: 34, timestamp: new Date() }};
       let newState = reducer(state, {type: endedAction});
       expect(state).toBe(newState);
       expect(newState).toEqual({...state});
       reducer = createAsyncReducer<number>(action, {pathResolver: metaPathResolver});
       newState = reducer(state, {type: endedAction, meta:{propertyId: 'data'}});
       expect(state).toBe(newState);
       expect(newState).toEqual({...state});
   });
   test('actions should set timestamp if supplied in action', () =>{
       const timestamp = new Date();
       let  reducer = createAsyncReducer<number>(action, {pathResolver: dataLensProp});
       const state: any = {data: {isFetching: false, didInvalidate: false, error: false, state: 15}};
       let newState = reducer(state, {type: startedAction, payload: 55, timestamp});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: true, didInvalidate: false, error: false, timestamp: timestamp}});
       newState = reducer(state, {type: succeededAction, payload: 55, timestamp});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: false, state: 55, timestamp: timestamp}});
       newState = reducer(state, {type: failedAction, payload: 'fail', timestamp});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: true, errorDescription: 'fail', exceptions: ['fail'], timestamp: timestamp}});
       newState = reducer(state, {type: endedAction, payload: 35, timestamp});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: false, state: 15, elapsed: 35, timestamp: timestamp}});
       newState = reducer(state, {type: invalidatedAction, payload: 35, timestamp});
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: true, error: false, state: 15, timestamp: timestamp}});

       reducer = createAsyncReducer<number>(action, {pathResolver: metaPathResolver});
       newState = reducer(state, {type: startedAction, payload: 55, timestamp, meta: {propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: true, didInvalidate: false, error: false, timestamp: timestamp}});
       newState = reducer(state, {type: succeededAction, payload: 55, timestamp, meta: {propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual( {data: {isFetching: false, didInvalidate: false, error: false, state: 55, timestamp: timestamp}});
       newState = reducer(state, {type: failedAction, payload: 'fail', timestamp, meta: {propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: true, errorDescription: 'fail', exceptions: ['fail'], timestamp: timestamp}});
       newState = reducer(state, {type: endedAction, payload: 35, timestamp, meta: {propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: false, state: 15, elapsed: 35, timestamp: timestamp}});
       newState = reducer(state, {type: invalidatedAction, payload: 35, timestamp, meta: {propertyId: 'data'}});
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: true, error: false, state: 15, timestamp: timestamp}});
   });
   test('actions should set timestamp if timestamp resolver option', () =>{
       const timestamp = new Date();
       let reducer = createAsyncReducer<any>(action, {timestampAccessor: a => a.payload.timestamp, pathResolver: dataLensProp});
       const state: any = {data: {isFetching: false, didInvalidate: false, error: false, state: {value: 15}}};
       let newState = reducer(state, {type: startedAction, payload: {timestamp}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual( {data:{isFetching: true, didInvalidate: false, error: false, timestamp: timestamp}});
       newState = reducer(state, {type: succeededAction, payload: {value: 55, timestamp}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: false, state: {value: 55, timestamp}, timestamp: timestamp}});
       newState = reducer(state, {type: failedAction, payload: {message: 'fail', timestamp}, timestamp});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: true, errorDescription: 'fail', exceptions: [{message: 'fail', timestamp}], timestamp: timestamp}});

       newState = reducer(state, {type: invalidatedAction, payload: {message: 'fail', timestamp}, timestamp});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: false, didInvalidate: true, error: false, state: {value: 15}, timestamp}});

       reducer = createAsyncReducer<{value?: number, timestamp?: Date}>(action, {timestampAccessor: a => a.timestamp, pathResolver: dataLensProp});
       newState = reducer(state, {type: endedAction, payload: 35, timestamp});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: false, didInvalidate: false, error: false, state: {value: 15}, elapsed: 35, timestamp: timestamp}});

       reducer = createAsyncReducer<any>(action, {timestampAccessor: a => a.payload.timestamp, pathResolver: metaPathResolver});
       newState = reducer(state, {type: startedAction, payload: {timestamp}, meta:{propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: true, didInvalidate: false, error: false, timestamp: timestamp}});
       newState = reducer(state, {type: succeededAction, payload: {value: 55, timestamp}, meta:{propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: false, state: {value: 55, timestamp}, timestamp: timestamp}});
       newState = reducer(state, {type: failedAction, payload: {message: 'fail', timestamp}, timestamp, meta:{propertyId: 'data'}});
       expect(state).not.toBe( newState);
       expect(newState).toEqual({data: {isFetching: false, didInvalidate: false, error: true, errorDescription: 'fail', exceptions: [{message: 'fail', timestamp}], timestamp: timestamp}});

       newState = reducer(state, {type: invalidatedAction, payload: {message: 'fail', timestamp}, timestamp, meta:{propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: false, didInvalidate: true, error: false, state: {value: 15}, timestamp}});

       reducer = createAsyncReducer<{value?: number, timestamp?: Date}>(action, {timestampAccessor: a => a.timestamp, pathResolver: metaPathResolver});
       newState = reducer(state, {type: endedAction, payload: 35, timestamp, meta:{propertyId: 'data'}});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({data:{isFetching: false, didInvalidate: false, error: false, state: {value: 15}, elapsed: 35, timestamp: timestamp}});
   });
   test('invalidate action should set didInvalidate property', () =>{
       let reducer = createAsyncReducer(action, {pathResolver: dataLensProp});
       const state:any = {data:{isFetching: false, didInvalidate: false, error: false, state: {value: 15}}};
       let newState = reducer(state, {type: invalidatedAction, payload: {value: 18}});
       expect(newState).not.toBe(state);
       expect(newState).toEqual({data:{isFetching: false, error: false, didInvalidate: true, state: {value: 15}}});
       reducer = createAsyncReducer(action, {pathResolver: metaPathResolver});
       newState = reducer(state, {type: invalidatedAction, payload: {value: 18}, meta: {propertyId: 'data'}});
       expect(newState).not.toBe(state);
       expect(newState).toEqual({data:{isFetching: false, error: false, didInvalidate: true, state: {value: 15}}});
   });
   test('succeeded action should use payload accessor if supplied', () =>{
       let reducer = createAsyncReducer(action, {payloadAccessor: a => a.payload.data, pathResolver: dataLensProp});
       let newState = reducer(undefined, {type: succeededAction, payload:{data: 15}});
       expect(newState).toEqual({data:{
           isFetching: false,
           didInvalidate: false,
           error: false,
           state: 15
       }});
       reducer = createAsyncReducer(action, {payloadAccessor: a => a.payload.data, pathResolver: metaPathResolver});
       newState = reducer(undefined, {type: succeededAction, payload:{data: 15}, meta: {propertyId: 'data'}});
       expect(newState).toEqual({data:{
               isFetching: false,
               didInvalidate: false,
               error: false,
               state: 15
           }});
   });
});