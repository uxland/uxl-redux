import {Store, Unsubscribe} from "redux";
import {bind} from "./bind";
import {unbind} from "./unbind";
import {Constructor, LitElement} from "lit-element";
import {MixinFunction} from "@uxland/uxl-utilities/types";
import {dedupingMixin} from "@uxland/uxl-utilities/deduping-mixin";
import {microTask} from "@uxland/uxl-utilities/async/micro-task";

export interface ConnectMixin {
    __reduxStoreSubscriptions__: Unsubscribe[];
}
export type Selector<T = any> = (state: any) => T;

export interface ConnectAddOn {
    uxlReduxWatchedProperties: {[key: string]: PropertyWatch};
    reduxDefaultStore: Store;
    watchProperty: (name: PropertyKey, watch: PropertyWatch) => void;
}
export interface PropertyWatch {
    selector: Selector;
    store: Store;
    name: string;
}
export interface ConnectMixinConstructor  extends LitElement{
    new (...args: any[]): ConnectMixin & LitElement;
}
export type ConnectMixinFunction = MixinFunction<ConnectMixinConstructor>;


export const connect: (defaultStore?: Store<any, any>) => ConnectMixinFunction = defaultStore => dedupingMixin((superClass: Constructor<LitElement>) => {
    class connectMixin extends superClass implements ConnectMixin {
        __reduxStoreSubscriptions__: Unsubscribe[];
        constructor(){
            super();
            microTask.run(()=> bind(this));
        }
        static get reduxDefaultStore(): Store | undefined {
            return defaultStore;
        }

        disconnectedCallback(): void {
            unbind(this);
            super.disconnectedCallback && super.disconnectedCallback();
        }
    }
    return <any>connectMixin;
});
