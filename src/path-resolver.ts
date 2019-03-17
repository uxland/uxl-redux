import {Action} from "./create-action";
import {identity, ifElse, is, Lens} from 'ramda';
import 'reflect-metadata';

export interface PathResolver {
    resolver: (action: Action) => Lens;
}

export type Resolver = (action: Action) => Lens;
export const factory = (resolver: Resolver) => <PathResolver>{resolver};

export const resolvePath: (path: Lens | PathResolver, action?: Action) => Lens = (path, action) => ifElse(is(Function), identity, (pr: PathResolver) => pr.resolver(action))(path);
