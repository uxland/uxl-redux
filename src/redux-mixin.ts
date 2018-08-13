import { dedupingMixin } from "@polymer/polymer/lib/utils/mixin";
import {LitElement} from '@polymer/lit-element/lit-element';
import * as path from "@polymer/polymer/lib/utils/path";

import { PropertyOptions } from "@uxland/uxl-polymer2-ts";
import { Store } from "redux";
const collect = (what: any, wich: string) => (what ? { ...what[wich], ...collect(Object.getPrototypeOf(what), wich) } : {});

export interface IReduxMixin<T = any> extends LitElement {
    new (): IReduxMixin<T> & T;
}
export type ReduxMixin = <T = any>(parent: any) => IReduxMixin<T>;

export const observersMixin = dedupingMixin(parent =>{
    class mixin extends LitElement{
        _shouldPropertiesChange(props: mixin, changedProps: any, prevProps: any){
            let p = collect(this.constructor, 'properties');
            let observedProperties = Object.keys(p).filter(key => p[key].observer && changedProps.hasOwnProperty(key));
            observedProperties.forEach(name =>{
                let prop = p[name];
                let observer = prop.observer;
                this[observer].call(this, changedProps[name], prevProps[name]);
            })
            /*Object.keys(p).forEach(name =>{
                let property = p[name];
               let observer = property['observer'];
               let computed = property['computed'];
            });*/
            return true;
        }
    }
    return mixin;
})

export function reduxMixin<T = any>(store: Store<any, any>) {
    const subscribers = new Map();
    const bind = (element: any, properties: { [name: string]: PropertyOptions }) => {
        const bindings = Object.keys(properties).filter(name => {
            const property = properties[name];
            if (Object.prototype.hasOwnProperty.call(property, "statePath")) {
                if (!property.readOnly && property.notify) {
                    console.warn(
                        `PolymerRedux: <${element.constructor.is}>.${name} has "notify" enabled, two-way bindings goes against Redux's paradigm`
                    );
                }
                return true;
            }
            return false;
        });
        const update = state => {
            let propertiesChanged = bindings.reduce((previousValue, name) => {
                const { statePath } = properties[name];
                const value = typeof statePath === "function" ? statePath.call(element, state) : path.get(state, statePath);
                return previousValue || element._setPendingProperty(name, value, true);
            }, false);
            if (propertiesChanged)
                element._invalidateProperties();

        };
        const unsubscribe = store.subscribe(() => {
            const detail = store.getState();
            update(detail);
            element.dispatchEvent(new CustomEvent("state-changed", { detail }));
        });
        subscribers.set(element, unsubscribe);
        update(store.getState());

        return update;
    };
    const unbind = element => {
        const off = subscribers.get(element);
        if (typeof off === "function") {
            off();
        }
    };
    return dedupingMixin(parent => {
        class mixin extends observersMixin(parent) {
            connectedCallback() {
                const properties = collect(this.constructor, "properties");
                bind(this, properties);
                super.connectedCallback();
            }
            disconnectedCallback() {
                unbind(this);
                super.disconnectedCallback();
            }
        };
        return mixin as IReduxMixin<T>
    });
}
