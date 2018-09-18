import { dedupingMixin } from "@polymer/polymer/lib/utils/mixin";
import {LitElement} from '@polymer/lit-element/lit-element';
import {collect} from '@uxland/uxl-utilities/collect';
import { Store } from "redux";
import {bind, unbind} from "./redux-binding";

export interface IReduxMixin<T = any> extends LitElement {
    new (): IReduxMixin<T> & T;
}
export type ReduxMixin = <T = any>(parent: any) => IReduxMixin<T>;

export function reduxMixin<T = any>(store: Store<any, any>) {
    return dedupingMixin(parent => {
        class mixin extends parent {
            connectedCallback() {
                const properties = collect(this.constructor, "properties");
                bind(this, properties, store);
                super.connectedCallback();
            }
            disconnectedCallback() {
                unbind(this);
                if(super.disconnectedCallback)
                    super.disconnectedCallback();
            }
        };
        return (<any>mixin) as IReduxMixin<T>;
    });
}
