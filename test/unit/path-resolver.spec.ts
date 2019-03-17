import {resolvePath, factory} from "../../src";
import {Action} from "../../src";
import {lensPath, lensProp} from 'ramda';
describe('resolve path fixture', () =>{
   it('should resolve identity if argument is string', () =>{
       const lensP = lensProp('property1');
       const path = resolvePath(lensP);
       expect(path).toBe(lensP);
   }) ;
   it('should invoke path resolver passed as path', () =>{
      const path = jest.fn();
      resolvePath(factory(path));
      expect(path).toBeCalledTimes(1);
   });
   it('should pass action to path resolver', () =>{
      const action: Action = {type: 'TYPE'};
      const path = jest.fn();
      resolvePath(factory(path), action);
      expect(path).toBeCalledWith(action);
   });
   it('should return result of function', () =>{
      const action = {type: 'TYPE', payload: 'my-payloda', meta: 'my-meta'};
      const lensP = lensPath(['payload', 'data']);
      const path = factory(jest.fn(() => lensP));
      const result = resolvePath(path, action);
      expect(result).toBe(lensP);
   });
});