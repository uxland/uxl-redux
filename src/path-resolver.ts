import {Action} from "./create-action";
import {identity, ifElse, Lens} from 'ramda';
import 'reflect-metadata';
import {isFunction} from "@uxland/uxl-utilities";

export interface PathResolver {
    resolver: (action: Action) => Lens;
}

export type Resolver = (action: Action) => Lens;
export const factory = (resolver: Resolver) => <PathResolver>{resolver};

export const resolvePath: (path: Lens | PathResolver, action?: Action) => Lens = (path, action) => ifElse(isFunction, identity, (pr: PathResolver) => pr.resolver(action))(path);
