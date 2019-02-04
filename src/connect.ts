import { dedupingMixin } from "@polymer/polymer/lib/utils/mixin";
import {Store, Unsubscribe} from "redux";
import {bind} from "./bind";
import {unbind} from "./unbind";
import {Constructor, LitElement} from "lit-element";
import {MixinFunction} from "@uxland/uxl-utilities/types";


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

        static get reduxDefaultStore(): Store | undefined {
            return defaultStore;
        }

        private static __uxlReduxWatchedProperties: { [key: string]: PropertyWatch };

        protected static get uxlReduxWatchedProperties(): { [key: string]: PropertyWatch } {
            if (!this.__uxlReduxWatchedProperties)
                this.__uxlReduxWatchedProperties = {};
            return this.__uxlReduxWatchedProperties;
        }

        public static watchProperty(name: PropertyKey, options: PropertyWatch) {
            this.uxlReduxWatchedProperties[String(name)] = options;
        }

        connectedCallback(): void {
            bind(this);
            super.connectedCallback();
        }

        disconnectedCallback(): void {
            unbind(this);
            super.disconnectedCallback && super.disconnectedCallback();
        }
    }
    return <any>connectMixin;
});
