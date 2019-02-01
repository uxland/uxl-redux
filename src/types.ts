import {Store, Unsubscribe} from "redux";
import {Constructor, LitElement} from "lit-element";
import {Action} from "./create-action";
import {Lens} from "ramda";

export type Selector<T = any> = (state: any) => T;
export interface ConnectMixin {
    __reduxStoreSubscriptions__: Unsubscribe[];
}
export interface ConnectMixinConstructor {
    new (...args: any[]): ConnectMixin;
}
export type MixinFunction<T1 extends Constructor<any> = Constructor<any>, T2 extends Constructor<LitElement> = Constructor<LitElement>>  = (superClass: T2)=> Constructor<T1 & T2>;
export type ConnectMixinFunction = MixinFunction<ConnectMixinConstructor>;
export interface PropertyWatch {
    selector: Selector;
    store: Store;
    name: string;
}
export interface ConnectAddOn {
    uxlReduxWatchedProperties: {[key: string]: PropertyWatch};
    reduxDefaultStore: Store;
    watchProperty: (name: PropertyKey, watch: PropertyWatch) => void;
}
export interface PathResolver {
    resolver: (action: Action) => Lens;
}