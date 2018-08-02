import {Action} from "./create-action";
import isFunction from 'lodash-es/isFunction';
export type PathResolver = (action: Action) => string;

export const resolvePath = (path: string | PathResolver, action?: Action) => isFunction(path) ? path(action) : String(path);
export default resolvePath;