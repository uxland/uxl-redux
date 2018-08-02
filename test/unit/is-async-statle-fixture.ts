import {isAsyncStateStale,  Duration} from "../../src/is-async-stale";
import {subMinutes} from 'date-fns/esm';
import {getDefaultState} from "../../src/create-async-reducer";
import {assert} from 'chai';
suite('isAsyncStale-fixture', () =>{
   test ('should return true is state is null or undefined', () =>{
      assert.isTrue(isAsyncStateStale(null));
      assert.isTrue(isAsyncStateStale(undefined));
   });
   test('should return true if is initial state', () =>{
      assert.isTrue(isAsyncStateStale(getDefaultState()))
   });
   test('should return false if is already fetching',() =>{
      assert.isFalse(isAsyncStateStale({isFetching: true}));
   });
   test('should return true if is invalidated or has error', () =>{
      assert.isTrue(isAsyncStateStale({didInvalidate: true, isFetching: false}));
      assert.isTrue(isAsyncStateStale({error: true, isFetching: false}));
   });
   test('should return false if timestamp is null or undefined', () =>{
      const interval: Duration = {amount: 10, unit: "days"};
      assert.isFalse(isAsyncStateStale({isFetching: false, timestamp: null}, interval));
      assert.isFalse(isAsyncStateStale({isFetching: false, timestamp: undefined}, interval));
   });
   test('should return false if timestamp is invalid date', () =>{
      const interval: Duration = {amount: 10, unit: 'minutes'};
      assert.isFalse(isAsyncStateStale({isFetching: false, timestamp: <any>'hhhh'}));
   });
   test('should return false if timestamp plus stale interval is before now', () =>{
      const timeStamp = subMinutes(new Date(), 10);
      assert.isFalse(isAsyncStateStale({isFetching: false, timestamp: timeStamp}, {amount: 9, unit: "minutes"}));
   });
   test('should return false if timestamp plus stale interval is afte now', () =>{
       const timeStamp = subMinutes(new Date(), 10);
       assert.isTrue(isAsyncStateStale({isFetching: false, timestamp: timeStamp}, {amount: 11, unit: "minutes"}));
   });
});