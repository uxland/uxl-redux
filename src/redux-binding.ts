import {PropertyOptions} from "@uxland/uxl-polymer2-ts";
import {Store} from "redux";
import {get} from 'dot-prop-immutable';
const subscribers = new WeakMap();

export const bind = (element: any, properties: { [name: string]: PropertyOptions }, store: Store<any, any>) =>{
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
            const value = typeof statePath === "function" ? statePath.call(element, state) : get(state, statePath);
            return element._setPendingProperty(name, value, true) || previousValue;
        }, false);
        if (propertiesChanged)
            element._invalidateProperties();

    };
    const unsubscribe = store.subscribe(() => {
        const detail = store.getState();
        update(detail);
        if(element.dispatchEvent)
            element.dispatchEvent(new CustomEvent("state-changed", { detail }));
    });
    subscribers.set(element, unsubscribe);
    update(store.getState());

    return update;
};
export const unbind = (element) =>{
    const off = subscribers.get(element);
    if (typeof off === "function") {
        off();
    }
};