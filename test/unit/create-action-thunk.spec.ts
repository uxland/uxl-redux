import createActionThunk from "../../src/create-action-thunk";
import {Action} from "../../src";
import {flatten} from "ramda";

const type = 'ACTION';
const actionCreator = (base: string) => (action: string) => `${base}_${action}`;
const endedAction = actionCreator(type)('ENDED');
const startedAction = actionCreator(type)('STARTED');
const failedAction = actionCreator(type)('FAILED');
const succeededAction = actionCreator(type)('SUCCEEDED');

describe('create action thunk fixture', () => {
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
        const spy = jest.fn();
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
      const spy = jest.fn();
      try {
          thunk(spy);
      }catch (e) {

      }
      return spy;
    };
    const dispatchAsyncSucceededActionThunk = dispatchAsyncAction(createAsyncSucceededThunkFactory);
    const dispatchAsyncFailedActionThunk = dispatchAsyncAction(createAsyncFailedThunkFactory);
    const dispatchSucceededActionThunk = dispatchAction(createSucceededThunkFactory);
    const dispatchFailedActionThunk = dispatchAction(createFailedThunkFactory);

    it('dispatches started action first', async () => {
        let spy = await dispatchAsyncSucceededActionThunk();
        let started: Action = spy.mock.calls[0][0];
        expect(started.type).toEqual(startedAction);
        spy = await dispatchAsyncFailedActionThunk();
        started = spy.mock.calls[0][0];
        expect(started.type).toEqual(startedAction);
    });
    it('started action payload should not exist', async () => {
        let spy = await dispatchAsyncSucceededActionThunk();
        let started: Action = spy.mock.calls[0][0];
        expect(started.payload).toBeUndefined();
        spy = await dispatchAsyncFailedActionThunk();
        started = spy.mock.calls[0][0];
        expect(started.payload).toBeUndefined();
    });
    it('started action should contain meta if supplied', async () => {
        const meta = {id: 1};
        let spy = await dispatchAsyncSucceededActionThunk(undefined, (meta) => meta, meta);
        let started: Action = spy.mock.calls[0][0];
        expect(started.meta).toBeDefined();
        expect(started.meta).toBe(meta);
        spy = await dispatchAsyncFailedActionThunk(undefined, (meta) => meta, meta);
        started = spy.mock.calls[0][0];
        expect(started.meta).toBeDefined();
        expect(started.meta).toBe(meta);
    });
    it('dispatches started, succeeded and ended actions if function succeeds', async () => {
        const spy = await dispatchAsyncSucceededActionThunk();
        const actions: Action[] = flatten(spy.mock.calls);
        expect(actions.length).toBe(3);
        expect(actions[0].type).toBe(startedAction);
        expect(actions[1].type).toBe(succeededAction);
        expect(actions[2].type).toBe(endedAction);
    });

    it('succeeded action should contain meta if supplied', async () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncSucceededActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.mock.calls)[1];
        expect(succeeded.meta).toBeDefined();
        expect(succeeded.meta.meta1).toBeDefined();
        expect(succeeded.meta.meta1).toBe(meta1);
        expect(succeeded.meta.meta2).toBeDefined();
        expect(succeeded.meta.meta2).toBe(meta2);
    });
    it('succeeded action payload is result of function', async () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncSucceededActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.mock.calls)[1];
        expect(succeeded.payload).toBe(result);
    });
    it('params are passed to function (dispatch and getState too)', async () => {
        const param1 = 1;
        const param2 = 2;
        const param3 = 3;
        const func = {fn:() => Promise.resolve(true)};
        const functionSpy = jest.spyOn(func, 'fn');
        const factory = createActionThunk(type, func.fn.bind(func), (p1, p2, p3) => ({p1, p2, p3}));
        const thunk = factory(param1, param2, param3);
        const spy = jest.fn();
        await thunk(spy);
        const succeeded: Action = <any>flatten(spy.mock.calls)[1];
        expect(succeeded.meta).toBeDefined();
        expect(succeeded.meta).toEqual({p1: param1, p2: param2, p3: param3});
        expect(functionSpy).toHaveBeenCalledWith(param1, param2, param3, {getState: undefined, extra: undefined, dispatch: spy});
        expect(functionSpy).toHaveBeenCalledTimes(1);
    });
    it('dispatches started, failed and ended if function fails', async() =>{
        const spy = await dispatchAsyncFailedActionThunk();
        const actions: Action[] = flatten(spy.mock.calls);
        expect(actions.length).toBe(3);
        expect(actions[0].type).toEqual(startedAction);
        expect(actions[1].type).toEqual(failedAction);
        expect(actions[2].type).toEqual(endedAction);
    });
    it('failed action should contain meta if supplied', async () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.mock.calls)[1];
        expect(failed.meta).toBeDefined();
        expect(failed.meta.meta1).toBeDefined();
        expect(failed.meta.meta1).toBe(meta1);
        expect(failed.meta.meta2).toBeDefined();
        expect(failed.meta.meta2).toBe(meta2);
    });
    it('failed action payload should contain error', async () => {
        const result = new Error('error');
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = await dispatchAsyncFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.mock.calls)[1];
        expect(failed.payload).toEqual(result);
        expect(failed.error).toBe(true);
    });
    it('ended action payload contains elapsed', async() =>{
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = await dispatchAsyncSucceededActionThunk('eureka!', metaCreator, 1, 2);
        let ended: Action = flatten(spy.mock.calls)[2];
        expect(ended.payload.elapsed).toBeDefined();
        spy = await dispatchAsyncFailedActionThunk(new Error('eureka!'), metaCreator, 1, 2);
        ended = flatten(spy.mock.calls)[2];
        expect(ended.payload.elapsed).toBeDefined();
    });
    it('ended action should contain meta if supplied', async() =>{
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = await dispatchAsyncSucceededActionThunk('eureka!', metaCreator, meta1, meta2);
        let ended: Action = flatten(spy.mock.calls)[2];
        expect(ended.meta).toBeDefined();
        expect(ended.meta.meta1).toBeDefined();
        expect(ended.meta.meta1).toEqual(meta1);
        expect(ended.meta.meta2).toBeDefined();
        expect(ended.meta.meta2).toEqual(meta2);
        spy = await dispatchAsyncFailedActionThunk(new Error('eureka!'), metaCreator, meta1, meta2);
        ended = flatten(spy.mock.calls)[2];
        expect(ended.meta).toBeDefined();
        expect(ended.meta.meta1).toBeDefined();
        expect(ended.meta.meta1).toEqual(meta1);
        expect(ended.meta.meta2).toBeDefined();
        expect(ended.meta.meta2).toEqual(meta2);
    });
    it('(Not promise)dispatches started, succeeded and ended actions if function succeeds', () => {
        const spy =  dispatchSucceededActionThunk();
        const actions: Action[] = flatten(spy.mock.calls);
        expect(actions.length).toBe(3);
        expect(actions[0].type).toBe( startedAction);
        expect(actions[1].type).toBe(succeededAction);
        expect(actions[2].type).toBe(endedAction);
    });

    it('(Not promise) succeeded action should contain meta if supplied', () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = dispatchSucceededActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.mock.calls)[1];
        expect(succeeded.meta).toBeDefined();
        expect(succeeded.meta.meta1).toBeDefined();
        expect(succeeded.meta.meta1).toEqual( meta1);
        expect(succeeded.meta.meta2).toBeDefined();
        expect(succeeded.meta.meta2).toEqual(meta2);
    });

    it('(Not promise) succeeded action payload is result of function', () => {
        const expected = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = dispatchSucceededActionThunk(expected, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const succeeded: Action = flatten(spy.mock.calls)[1];
        expect(succeeded.payload).toEqual(expected);
    });

    it('(Not promise) params are passed to function (dispatch and getState too)', () => {
        const param1 = 1;
        const param2 = 2;
        const param3 = 3;
        const func = {fn:() => true};
        const functionSpy = jest.spyOn(func, 'fn');
        const factory = createActionThunk(type, func.fn.bind(func), (p1, p2, p3) => ({p1, p2, p3}));
        const thunk = factory(param1, param2, param3);
        const spy = jest.fn();
        thunk(spy);
        const succeeded: Action = <any>flatten(spy.mock.calls)[1];
        expect(succeeded.meta).toBeDefined();
        expect(succeeded.meta).toEqual({p1: param1, p2: param2, p3: param3});
        expect(functionSpy).toHaveBeenCalledWith(param1, param2, param3, {getState: undefined, extra: undefined, dispatch: spy});
        expect(functionSpy).toHaveBeenCalledTimes(1);
    });

    it('(Not promise) dispatches started, failed and ended if function fails', () =>{
        const spy =  dispatchFailedActionThunk();
        const actions: Action[] = flatten(spy.mock.calls);
        expect(actions.length).toBe(3);
        expect(actions[0].type).toBe(startedAction);
        expect(actions[1].type).toBe(failedAction);
        expect(actions[2].type).toBe(endedAction);
    });

    it('(Not promise) failed action should contain meta if supplied', () => {
        const result = {result: 10};
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy = dispatchFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.mock.calls)[1];
        expect(failed.meta).toBeDefined();
        expect(failed.meta.meta1).toBeDefined();
        expect(failed.meta.meta1).toBe(meta1);
        expect(failed.meta.meta2).toBeDefined();
        expect(failed.meta.meta2).toBe( meta2);
    });

    test('(Not Promise) failed action payload should contain error', () => {
        const result = new Error('error');
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const spy =  dispatchFailedActionThunk(result, (meta1, meta2) => ({meta1, meta2}), meta1, meta2);
        const failed: Action = flatten(spy.mock.calls)[1];
        expect(failed.payload).toBe(result);
        expect(failed.error).toBe(true);
    });

    test('(Not Promise) ended action payload contains elapsed', () =>{
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = dispatchSucceededActionThunk('eureka!', metaCreator, 1, 2);
        let ended: Action = flatten(spy.mock.calls)[2];
        expect(ended.payload.elapsed).toBeDefined();
        spy = dispatchFailedActionThunk(new Error('eureka!'), metaCreator, 1, 2);
        ended = flatten(spy.mock.calls)[2];
        expect(ended.payload.elapsed).toBeDefined();
    });
    it('(Not promise) ended action should contain meta if supplied', () =>{
        const meta1 = {id: 1};
        const meta2 = {id: 2};
        const metaCreator = (meta1, meta2) => ({meta1, meta2});
        let spy = dispatchSucceededActionThunk('eureka!', metaCreator, meta1, meta2);
        let ended: Action = flatten(spy.mock.calls)[2];
        expect(ended.meta).toBeDefined();
        expect(ended.meta.meta1).toBeDefined();
        expect(ended.meta.meta1).toEqual(meta1);
        expect(ended.meta.meta2).toBeDefined();
        expect(ended.meta.meta2).toEqual(meta2);
        spy = dispatchFailedActionThunk(new Error('eureka!'), metaCreator, meta1, meta2);
        ended = flatten(spy.mock.calls)[2];
        expect(ended.meta).toBeDefined();
        expect(ended.meta.meta1).toBeDefined();
        expect(ended.meta.meta1).toEqual(meta1);
        expect(ended.meta.meta2).toBeDefined();
        expect(ended.meta.meta2).toEqual(meta2);
    });
});