import {Duration, isAsyncStateStale} from "../../src";
import {subMinutes} from 'date-fns';
import {getDefaultState} from "../../src";

describe('isAsyncStale-fixture', () => {
    it('should return true is state is null or undefined', () => {
        expect(isAsyncStateStale(null)).toBe(true);
        expect(isAsyncStateStale(undefined)).toBe(true);
    });
    it('should return true if is initial state', () => {
        expect(isAsyncStateStale(getDefaultState())).toBe(true);
    });
    it('should return false if is already fetching', () => {
        expect(isAsyncStateStale({isFetching: true})).toBe(false);
    });
    it('should return true if is invalidated or has error', () => {
        expect(isAsyncStateStale({didInvalidate: true, isFetching: false})).toBe(true);
        expect(isAsyncStateStale({error: true, isFetching: false})).toBe(true);
    });
    it('should return false if timestamp is null or undefined', () => {
        const interval: Duration = {amount: 10, unit: "days"};
        expect(isAsyncStateStale({isFetching: false, timestamp: null}, interval)).toBe(false);
        expect(isAsyncStateStale({isFetching: false, timestamp: undefined}, interval)).toBe(false);
    });
    it('should return false if timestamp is invalid date', () => {
        expect(isAsyncStateStale({isFetching: false, timestamp: <any>'hello'})).toBe(false);
    });
    it('should return false if timestamp plus stale interval is before now', () => {
        const timeStamp = subMinutes(new Date(), 10);
        expect(isAsyncStateStale({isFetching: false, timestamp: timeStamp}, {amount: 9, unit: "minutes"})).toBe(false);
    });
    it('should return false if timestamp plus stale interval is afte now', () => {
        const timeStamp = subMinutes(new Date(), 10);
        expect(isAsyncStateStale({isFetching: false, timestamp: timeStamp}, {amount: 11, unit: "minutes"})).toBe(true);
    });
});