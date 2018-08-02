import {actionNameBuilder} from "../../src/action-name-builder";
import {assert} from 'chai';
suite('constant builder', () =>{
    test('action', () =>{
        const action = actionNameBuilder("prefix")('my-action');
        assert.equal(action, 'prefix:my-action:action');
    }) ;
});