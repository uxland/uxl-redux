import {Action} from "./create-action";
import {Reducer} from "redux";
import {Lens} from 'ramda';
import set from 'ramda/es/set';
import {resolvePath} from "./path-resolver";
import {PathResolver} from "./types";

export interface BasicOptions<T = any> {
    defValue?: T;
    path?: Lens | PathResolver;
}
const setState = (state, action: Action, path: Lens | PathResolver) =>
    path ? set(resolvePath(path, action), action.payload, state) : action.payload;

export const createBasicReducer: <T = any> (actionName: string, options?: BasicOptions<T>) => Reducer<T> = (actionName, options = {defValue: null}) =>
    (state = options.defValue, action: Action) => action.type === actionName ? setState(state, action, options.path) : state;
export default createBasicReducer;