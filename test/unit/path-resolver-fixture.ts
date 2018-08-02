import resolvePath from "../../src/path-resolver";
import * as sinon from 'sinon';
import {Action} from "../../src";
import {assert} from 'chai';
suite('resolve path fixture', () =>{
   test('should resolve identity if argument is string', () =>{
       const path = resolvePath('property1');
       assert.equal(path, 'property1');
   }) ;
   test('should stringify if argument is not an string or function', () =>{
      assert.equal(resolvePath(<any>3), '3');
      assert.equal(resolvePath(<any>3.1), '3.1');
      assert.equal(resolvePath(<any>true), 'true');
      assert.equal(resolvePath(<any>false), 'false');
      const date = new Date();
      assert.equal(resolvePath(<any>date), date.toString());
      assert.equal(resolvePath(<any>{}), '[object Object]');
      const aux = {};
      aux.toString = () => 'myObject';
      assert.equal(resolvePath(<any>aux), 'myObject');
      assert.equal(resolvePath(undefined), 'undefined');
      assert.equal(resolvePath(null), 'null');
   });
   test('should invoke function passed as path', () =>{
      const path = sinon.spy();
      resolvePath(path);
      assert(path.calledOnce);
   });
   test('should pass action to function', () =>{
      const action: Action = {type: 'TYPE'};
      const path = sinon.spy();
      resolvePath(path, action);
      assert(path.calledOnceWith(action));
   });
   test('should return result of function', () =>{
      const action = {type: 'TYPE', payload: 'my-payloda', meta: 'my-meta'};
      const path = sinon.spy((a) => `${a.type}:${a.payload}:${a.meta}`);
      const result = resolvePath(path, action);
      assert.equal(result, `${action.type}:${action.payload}:${action.meta}`);
   });
});