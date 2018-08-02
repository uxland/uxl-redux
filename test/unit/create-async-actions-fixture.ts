import {createAsyncActions, SUCCEEDED_SUFFIX, ENDED_SUFFIX, STARTED_SUFFIX, FAILED_SUFFIX, INVALIDATED_SUFFIX} from '../../src/create-async-actions';
import {assert} from 'chai';
const action = 'MY-ACTION';
test('create async actions test', () => {

    const actions = createAsyncActions('MY-ACTION');
    assert.equal(actions.ended, action + ENDED_SUFFIX);
    assert.equal(actions.started, action + STARTED_SUFFIX);
    assert.equal(actions.failed, action + FAILED_SUFFIX);
    assert.equal(actions.succeeded, action + SUCCEEDED_SUFFIX);
    assert.equal(actions.invalidated, action + INVALIDATED_SUFFIX);
});