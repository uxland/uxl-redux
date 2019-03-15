import createBasicReducer from "../../src/create-basic-reducer";
import {assert} from 'chai';
import {lensProp} from 'ramda';
import {factory} from "../../src";
const action = 'MY-ACTION';
suite('create basic reducer fixture', () =>{
    test('basic reducer should initialize default value', () =>{
        const initialValue = 10;
        const reducer = createBasicReducer<number>(action, {defValue: initialValue});
        const value = reducer(undefined, {type: '@@INIT'});
        assert.equal(value, initialValue);
    });
    test('basic reducer should set action payload value', () =>{
        const reducer = createBasicReducer<number>(action);
        const value = reducer(undefined, {type: action, payload: 10});
        assert.equal(value, 10);
    });
    test('basic reducer should be immutable', () =>{
        const state = {myValue: 10};
        const reducer = createBasicReducer(action);
        const newState:any = reducer(state, {type: action, payload: {myValue: 11}});
        assert.equal(newState.myValue, 11);
        assert.notStrictEqual(newState, state);
    });
    test('basic reducer should return state if action type is different', () =>{
        const state = {myValue: 10};
        const reducer = createBasicReducer(action);
        const newState:any = reducer(state, {type: "OTHER-ACTION", payload: {myValue: 11}});
        assert.strictEqual(newState, state);
        assert.equal(newState.myValue, 10);
    });
    test('basic reducer should set subproperty if path is supplied', () =>{
       const state = {property1: 'hello', property2: 'bye'};
       let reducer = createBasicReducer(action, {path: lensProp('property1')});
       let newState = reducer(state, {type: action, payload: 'hello world'});
       assert.isTrue(state !== newState);
       assert.deepEqual(newState, {property1: 'hello world', property2: 'bye'});
       reducer = createBasicReducer(action, {path: factory(a => lensProp(a.meta))});
       newState = reducer(state, {type: action, payload: 'hello world again', meta: 'property2'});
       assert.isTrue(newState !== state);
       assert.deepEqual(newState, {property1: 'hello', property2: 'hello world again'});
    });
});