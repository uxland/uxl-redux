import {createBasicReducer} from "../../src";
import {lensProp} from 'ramda';
import {factory} from "../../src";
const action = 'MY-ACTION';
describe('create basic reducer fixture', () =>{
    it('basic reducer should initialize default value', () =>{
        const initialValue = 10;
        const reducer = createBasicReducer<number>(action, {defValue: initialValue});
        const value = reducer(undefined, {type: '@@INIT'});
        expect(value).toBe(initialValue);
    });
    it('basic reducer should set action payload value', () =>{
        const reducer = createBasicReducer<number>(action);
        const value = reducer(undefined, {type: action, payload: 10});
        expect(value).toBe(10);
    });
    it('basic reducer should be immutable', () =>{
        const state = {myValue: 10};
        const reducer = createBasicReducer(action);
        const newState:any = reducer(state, {type: action, payload: {myValue: 11}});
        expect(newState.myValue).toBe(11);
        expect(newState).not.toBe(state);
    });
    it('basic reducer should return state if action type is different', () =>{
        const state = {myValue: 10};
        const reducer = createBasicReducer(action);
        const newState:any = reducer(state, {type: "OTHER-ACTION", payload: {myValue: 11}});
        expect(newState).toBe(state);
        expect(newState.myValue).toBe(10);
    });
    it('basic reducer should set subproperty if path is supplied', () =>{
       const state = {property1: 'hello', property2: 'bye'};
       let reducer = createBasicReducer(action, {path: lensProp('property1')});
       let newState = reducer(state, {type: action, payload: 'hello world'});
       expect(state).not.toBe(newState);
       expect(newState).toEqual({property1: 'hello world', property2: 'bye'});
       reducer = createBasicReducer(action, {path: factory(a => lensProp(a.meta))});
       newState = reducer(state, {type: action, payload: 'hello world again', meta: 'property2'});
       expect(newState).not.toBe(state);
       expect(newState).toEqual({property1: 'hello', property2: 'hello world again'});
    });
});