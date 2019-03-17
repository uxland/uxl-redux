import {actionNameBuilder} from "../../src";

describe('constant builder', () => {
    it('action', () => {
        const action = actionNameBuilder("prefix")('my-action');
        expect(action).toBe('prefix:my-action:action');
    });
});
