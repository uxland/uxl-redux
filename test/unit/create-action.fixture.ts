import {isFSA} from './flux-standard-action';
import {createAction} from "../../src/create-action";
import {assert} from 'chai';
const type = 'TYPE';
suite('create action fixture', () =>{
   test('returns a valid FSA', () =>{
       const actionCreator = createAction(type, b => b);
       const foobar = { foo: 'bar' };
       const action = actionCreator(foobar);
       assert.isOk(isFSA(action));
   });
    test('uses return value as payload', () => {
        const actionCreator = createAction(type, b => b);
        const foobar = { foo: 'bar' };
        const action = actionCreator(foobar);
        assert.deepEqual(action, {type, payload: foobar});
    });
    test('throws an error if payloadCreator is not a function, undefined, null', () => {
        const wrongTypePayloadCreators = [1, false, 'string', {}, []];
        wrongTypePayloadCreators.forEach( x => assert.throws(() => createAction(type, <any>x), Error, 'Expected payloadCreator to be a function, undefined or null'));
    });
    test('uses identity function if payloadCreator is undefined', () => {
        const actionCreator = createAction(type);
        const foobar = { foo: 'bar' };
        const action = actionCreator(foobar);
        assert.deepEqual(action,{
            type,
            payload: foobar
        });
        assert.isOk(isFSA(action));
    });
    test('uses identity function if payloadCreator is null', () => {
        const actionCreator = createAction(type, null);
        const foobar = { foo: 'bar' };
        const action = actionCreator(foobar);
        assert.deepEqual(action, {
            type,
            payload: foobar
        });
        assert.isOk(isFSA(action));
    });
    test('accepts a second parameter for adding meta to object', () => {
        const actionCreator = createAction(type, undefined, ({ cid }) => ({ cid }));
        const foobar = { foo: 'bar', cid: 5};
        const action = actionCreator(foobar, 5);
        assert.deepEqual(action,{
            type,
            payload: foobar,
            meta: {
                cid: 5
            }
        });
        assert.isOk(isFSA(action));
    });
    test('sets error to true if payload is an Error object', () => {
        const actionCreator = createAction(type);
        const errObj = new TypeError('this is an error');

        const errAction = actionCreator(errObj);
        assert.deepEqual(errAction, {
            type,
            payload: errObj,
            error: true
        });
        assert.isOk(isFSA(errAction));

        const foobar = { foo: 'bar', cid: 5 };
        const noErrAction = actionCreator(foobar);
        assert.deepEqual(noErrAction,{
            type,
            payload: foobar
        });
        assert.isOk(isFSA(noErrAction));
    });

    test('sets error to true if payload is an Error object and meta is provided', () => {
        const actionCreator = createAction(type, undefined, (_, meta) => meta);
        const errObj = new TypeError('this is an error');

        const errAction = actionCreator(errObj, { foo: 'bar' });
        assert.deepEqual(errAction, {
            type,
            payload: errObj,
            error: true,
            meta: { foo: 'bar' }
        });
    });
    test('sets payload only when defined', () => {
        const action = createAction(type)();
        assert.deepEqual(action, {
            type
        });

        const explicitUndefinedAction = createAction(type)(undefined);
        assert.deepEqual(explicitUndefinedAction, {
            type
        });

        const baz = '1';
        const actionCreator = createAction(type, undefined, () => ({ bar: baz }));
        assert.deepEqual(actionCreator(),{
            type,
            meta: {
                bar: '1'
            }
        });

        const validPayload = [false, 0, ''];
        for (let i = 0; i < validPayload.length; i++) {
            const validValue = validPayload[i];
            const expectPayload = createAction(type)(validValue);
            assert.deepEqual(expectPayload, {
                type,
                payload: validValue
            });
        }
    });
    test('bypasses payloadCreator if payload is an Error object', () => {
        const actionCreator = createAction(type, () => 'not this', (_, meta) => meta);
        const errObj = new TypeError('this is an error');

        const errAction = actionCreator(errObj, { foo: 'bar' });
        assert.deepEqual(errAction,<any>{
            type,
            payload: errObj,
            error: true,
            meta: { foo: 'bar' }
        });
    });

    test('sets error to true if payloadCreator return an Error object', () => {
        const errObj = new TypeError('this is an error');
        const actionCreator = createAction(type, () => errObj);
        const errAction = actionCreator('invalid arguments');
        assert.deepEqual(errAction,{
            type,
            payload: errObj,
            error: true
        });
    });


});