import {PropertyOptions} from "@uxland/uxl-polymer2-ts";
import {Store} from "redux";
import {get} from 'dot-prop-immutable';
import {notEqual} from "lit-element";

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
        let propertiesChanged = bindings.reduce((current, name) => {
            const { statePath } = properties[name];
            const value = typeof statePath === "function" ? statePath.call(element, state) : get(state, statePath);
            const previousValue = element[name];
            if (notEqual(previousValue, value)){
                current.push({name, old: previousValue});
                element[name] = value;
            }
            return current;
        }, []);
        if (propertiesChanged.length && element.requestUpdate)
            element.requestUpdate(propertiesChanged);


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
