import {Store, Unsubscribe} from "redux";
import {LitElement} from "lit-element";

export type Selector<T = any> = (state: any) => T;
export type Constructable<T extends LitElement = any> = new (...args: any[]) => T;
export interface ConnectMixin {
    __reduxStoreSubscriptions__: Unsubscribe[];
}
export type ConnectMixinFunction = <T extends Constructable<any>>(superClass: T) => T;
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