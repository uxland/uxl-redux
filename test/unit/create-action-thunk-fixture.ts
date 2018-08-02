import createActionThunk from "../../src/create-action-thunk";
import {Action} from "../../src";
import {assert} from 'chai';
import * as sinon from 'sinon';
import flatten from "lodash-es/flatten";

const type = 'ACTION';
const actionCreator = (base: string) => (action: string) => `${base}_${action}`;
const endedAction = actionCreator(type)('ENDED');
const startedAction = actionCreator(type)('STARTED');
const failedAction = actionCreator(type)('FAILED');
const succeededAction = actionCreator(type)('SUCCEEDED');

suite('create action thunk fixture', () => {
    const createAsyncSucceededThunkFactory = (result?, meta?) => createActionThunk(type, () => Promise.resolve(result), meta);
    const createAsyncFailedThunkFactory = (error?, meta?) => createActionThunk(type, () => Promise.reject(error || false), meta);
    const createSucceededThunkFactory = (result?, metaCreator?) => createActionThunk(type, () => result, metaCreator);
    const createFailedThunkFactory = (error?, metaCreator?) => createActionThunk(type, () => {
        if(error)
            throw error;
        throw new Error();
    }, metaCreator);
    const dispatchAsyncAction = (factoryCreator) => async (result?, meta?, ...args: any[]) => {
        const factory = factoryCreator(result, meta);
        const thunk = factory(...args);
        const spy = sinon.spy();
        try {
            await thunk(spy);
        }
        catch (e) {
        }
        return spy;
    };
    const dispatchAction = (factoryCreator) => (result?, meta?, ...args) =>{
      const factory = factoryCreator(result, meta);
      const thunk = factory(...args);
      const spy = sinon.spy();
      try {
          thunk(spy);
      }catch  {

      }
      return spy;
    };
    const dispatchAsyncSucceededActionThunk = dispatchAsyncAction(createAsyncSucceededThunkFactory);
    const dispatchAsyncFailedActionThunk = dispatchAsyncAction(createAsyncFailedThunkFactory);
    const dispatchSucceededActionThunk = dispatchAction(createSucceededThunkFactory);
    const dispatchFailedActionThunk = dispatchAction(createFailedThunkFactory);

    test('dispatches started action first', async () => {
        let spy = await dispatchAsyncSucceededActionThunk();
        let started: Action = spy.args[0][0];
        assert.equal(started.type, startedAction);
        spy = await dispatchAsyncFailedActionThunk();
        started = spy.args[0][0];
        assert.equal(started.type, startedAction);
    });
    test('started action payload should not exist', async () => {
        let spy = await dispatchAsyncSucceededActionThunk();
        let started: Action = spy.args[0][0];
        assert.notExists(started.payload);
        spy = await dispatchAsyncFailedActionThunk();
        started = spy.args[0][0];
        assert.notExists(started.payload);
    });
    test('started action should contain meta if supplied', async () => {
        const meta = {id: 1};
        let spy = await dispatchAsyncSucceededActionThunk(undefined, (meta, ...rest: any[]) => meta, meta);
        let started: Action = spy.args[0][0];
        assert.exists(started.meta);
        assert.strictEqual(started.meta, meta);
        spy = await dispatchAsyncFailedActionThunk(undefined, (meta, ...rest: any[]) => meta, meta);
        started = spy.args[0][0];
        assert.exists(started.meta);
        assert.strictEqual(started.meta, meta);
    });
    test('dispatches started, succeeded and ended actions if function succeeds', async () => {
        const spy = await dispatchAsyncSucceededActionThunk();
        const actions: Action[] = flatten(spy.args);
        assert.equal(actions.length, 3);
        assert.equal(actions[0].type, startedAction);
        assert.equal(actions[1].type, succeededAction);
        assert.equal(actions[2].type, endedAction);
    });

    test('succeeded action should contain meta if supplied', async () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncSucceededActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.args)[1];
        assert.exists(succeeded.meta);
        assert.exists(succeeded.meta.meta1);
        assert.strictEqual(succeeded.meta.meta1, meta1);
        assert.exists(succeeded.meta.meta2);
        assert.strictEqual(succeeded.meta.meta2, meta2);
    });
    test('succeeded action payload is result of function', async () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncSucceededActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.args)[1];
        assert.strictEqual(succeeded.payload, result);
    });
    test('params are passed to function (dispatch and getState too)', async () => {
        const param1 = 1;
        const param2 = 2;
        const param3 = 3;
        const functionSpy = sinon.spy((p1, p2, p3) => Promise.resolve(true));
        const factory = createActionThunk(type, functionSpy, (p1, p2, p3) => ({p1, p2, p3}));
        const thunk = factory(param1, param2, param3);
        const spy = sinon.spy();
        const aux = await thunk(spy);
        const succeeded: Action = <any>flatten(spy.args)[1];
        assert.exists(succeeded.meta);
        assert.deepEqual(succeeded.meta, {p1: param1, p2: param2, p3: param3});
        assert.isTrue(functionSpy.calledOnceWith(param1, param2, param3));
        assert.deepEqual(functionSpy.args[0][3], {getState: undefined, extra: undefined, dispatch: spy});
    });
    test('dispatches started, failed and ended if function fails', async() =>{
        const spy = await dispatchAsyncFailedActionThunk();
        const actions: Action[] = flatten(spy.args);
        assert.equal(actions.length, 3);
        assert.equal(actions[0].type, startedAction);
        assert.equal(actions[1].type, failedAction);
        assert.equal(actions[2].type, endedAction);
    });
    test('failed action should contain meta if supplied', async () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.args)[1];
        assert.exists(failed.meta);
        assert.exists(failed.meta.meta1);
        assert.strictEqual(failed.meta.meta1, meta1);
        assert.exists(failed.meta.meta2);
        assert.strictEqual(failed.meta.meta2, meta2);
    });
    test('failed action payload should contain error', async () => {
        const result = new Error('error')
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.args)[1];
        assert.strictEqual(failed.payload, result);
        assert.isTrue(failed.error);
    });
    test('ended action payload contains elapsed', async() =>{
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = await dispatchAsyncSucceededActionThunk('eureka!', metaCreator, 1, 2);
        let ended: Action = flatten(spy.args)[2];
        assert.exists(ended.payload.elapsed);
        spy = await dispatchAsyncFailedActionThunk(new Error('eureka!'), metaCreator, 1, 2);
        ended = flatten(spy.args)[2];
        assert.exists(ended.payload.elapsed);
    });
    test('ended action should contain meta if supplied', async() =>{
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = await dispatchAsyncSucceededActionThunk('eureka!', metaCreator, meta1, meta2);
        let ended: Action = flatten(spy.args)[2];
        assert.exists(ended.meta);
        assert.exists(ended.meta.meta1);
        assert.strictEqual(ended.meta.meta1, meta1);
        assert.exists(ended.meta.meta2);
        assert.strictEqual(ended.meta.meta2, meta2);
        spy = await dispatchAsyncFailedActionThunk(new Error('eureka!'), metaCreator, meta1, meta2);
        ended = flatten(spy.args)[2];
        assert.exists(ended.meta);
        assert.exists(ended.meta.meta1);
        assert.strictEqual(ended.meta.meta1, meta1);
        assert.exists(ended.meta.meta2);
        assert.strictEqual(ended.meta.meta2, meta2);
    });
    test('(Not promise)dispatches started, succeeded and ended actions if function succeeds', () => {
        const spy =  dispatchSucceededActionThunk();
        const actions: Action[] = flatten(spy.args);
        assert.equal(actions.length, 3);
        assert.equal(actions[0].type, startedAction);
        assert.equal(actions[1].type, succeededAction);
        assert.equal(actions[2].type, endedAction);
    });

    test('(Not promise) succeeded action should contain meta if supplied', () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = dispatchSucceededActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.args)[1];
        assert.exists(succeeded.meta);
        assert.exists(succeeded.meta.meta1);
        assert.strictEqual(succeeded.meta.meta1, meta1);
        assert.exists(succeeded.meta.meta2);
        assert.strictEqual(succeeded.meta.meta2, meta2);
    });

    test('(Not promise) succeeded action payload is result of function', () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = dispatchSucceededActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.args)[1];
        assert.strictEqual(succeeded.payload, result);
    });

    test('(Not promise) params are passed to function (dispatch and getState too)', () => {
        const param1 = 1;
        const param2 = 2;
        const param3 = 3;
        const functionSpy = sinon.spy((p1, p2, p3) => true);
        const factory = createActionThunk(type, functionSpy, (p1, p2, p3) => ({p1, p2, p3}));
        const thunk = factory(param1, param2, param3);
        const spy = sinon.spy();
        const aux = thunk(spy);
        const succeeded: Action = <any>flatten(spy.args)[1];
        assert.exists(succeeded.meta);
        assert.deepEqual(succeeded.meta, {p1: param1, p2: param2, p3: param3});
        assert.isTrue(functionSpy.calledOnceWith(param1, param2, param3));
        assert.deepEqual(functionSpy.args[0][3], {getState: undefined, extra: undefined, dispatch: spy});
    });

    test('(Not promise) dispatches started, failed and ended if function fails', () =>{
        const spy =  dispatchFailedActionThunk();
        const actions: Action[] = flatten(spy.args);
        assert.equal(actions.length, 3);
        assert.equal(actions[0].type, startedAction);
        assert.equal(actions[1].type, failedAction);
        assert.equal(actions[2].type, endedAction);
    });

    test('(Not promise) failed action should contain meta if supplied', () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = dispatchFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.args)[1];
        assert.exists(failed.meta);
        assert.exists(failed.meta.meta1);
        assert.strictEqual(failed.meta.meta1, meta1);
        assert.exists(failed.meta.meta2);
        assert.strictEqual(failed.meta.meta2, meta2);
    });

    test('(Not Promise) failed action payload should contain error', () => {
        const result = new Error('error')
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy =  dispatchFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.args)[1];
        assert.strictEqual(failed.payload, result);
        assert.isTrue(failed.error);
    });

    test('(Not Promise) ended action payload contains elapsed', () =>{
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = dispatchSucceededActionThunk('eureka!', metaCreator, 1, 2);
        let ended: Action = flatten(spy.args)[2];
        assert.exists(ended.payload.elapsed);
        spy = dispatchFailedActionThunk(new Error('eureka!'), metaCreator, 1, 2);
        ended = flatten(spy.args)[2];
        assert.exists(ended.payload.elapsed);
    });
    test('(Not promise) ended action should contain meta if supplied', () =>{
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = dispatchSucceededActionThunk('eureka!', metaCreator, meta1, meta2);
        let ended: Action = flatten(spy.args)[2];
        assert.exists(ended.meta);
        assert.exists(ended.meta.meta1);
        assert.strictEqual(ended.meta.meta1, meta1);
        assert.exists(ended.meta.meta2);
        assert.strictEqual(ended.meta.meta2, meta2);
        spy = dispatchFailedActionThunk(new Error('eureka!'), metaCreator, meta1, meta2);
        ended = flatten(spy.args)[2];
        assert.exists(ended.meta);
        assert.exists(ended.meta.meta1);
        assert.strictEqual(ended.meta.meta1, meta1);
        assert.exists(ended.meta.meta2);
        assert.strictEqual(ended.meta.meta2, meta2);
    });
});