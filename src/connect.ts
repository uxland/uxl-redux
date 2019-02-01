import { dedupingMixin } from "@polymer/polymer/lib/utils/mixin";
import {Store, Unsubscribe} from "redux";
import {ConnectMixin, ConnectMixinFunction, PropertyWatch} from "./types";
import {bind} from "./bind";
import {unbind} from "./unbind";
import {Constructor, LitElement} from "lit-element";

export const connect: (defaultStore: Store<any, any>) => ConnectMixinFunction = defaultStore => dedupingMixin((superClass: Constructor<LitElement>) => {
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


