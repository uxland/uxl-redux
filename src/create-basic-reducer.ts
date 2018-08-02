import {Action} from "./create-action";
import {Reducer} from "redux";
import {PathResolver} from "./path-resolver";
import {set} from 'dot-prop-immutable';
import resolvePath from "./path-resolver";

export interface BasicOptions<T = any> {
    defValue?: T;
    path?: string | PathResolver;
}
const setState = (state, action: Action, path: string | PathResolver) =>
    path ? set(state, resolvePath(path, action), action.payload) : action.payload;

export const createBasicReducer: <T = any> (actionName: string, options?: BasicOptions<T>) => Reducer<T> = (actionName, options = {defValue: null}) =>
    (state = options.defValue, action: Action) => action.type === actionName ? setState(state, action, options.path) : state;
export default createBasicReducer;