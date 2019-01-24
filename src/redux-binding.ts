import {Store} from "redux";
import isNil from 'ramda/es/isNil';
import keys from 'ramda/es/keys';
import map from 'ramda/es/map';
import pipe from 'ramda/es/pipe';
import reject from 'ramda/es/reject';
import {notEqual} from "lit-element";
import {StatePathFunction} from "./state-path";

const subscribers = new WeakMap();

interface PropertyChange {
    name: string,
    current: any,
    old?: any;
}
export const bind = (element: any, statePaths: { [name: string]: StatePathFunction }, store: Store<any, any>) => {

    const bindings = keys(statePaths).map(String);
    const getValue = (prop: string, state: any) => statePaths[prop].call(element, state);
    const updateProperties = map<PropertyChange, any>(x => {
        element[x.name] = x.current;
        return element.requestUpdate ? element.requestUpdate(x.name, x.old) : Promise.resolve();
    });
    const getCurrent = (name: string, state: any) => <PropertyChange>{name, current: getValue(name, state)};
    const getPrevious = (change: PropertyChange) => <PropertyChange>({...change, old: element[change.name]});
    const getChange = (change: PropertyChange) => notEqual(change.old, change.current) ? change : undefined;
    const getPropertiesChanges = (state: any) => map<string, PropertyChange>(x => pipe(getCurrent, getPrevious, getChange)(x, state));
    const update = state => pipe(getPropertiesChanges(state), reject(isNil), updateProperties)(bindings);
    const unsubscribe = store.subscribe(() => {
        const detail = store.getState();
        update(detail);
        if (element.dispatchEvent)
            element.dispatchEvent(new CustomEvent("state-changed", {detail}));
    });
    subscribers.set(element, unsubscribe);
    update(store.getState());

    return update;
};
export const unbind = (element) => {
    const off = subscribers.get(element);
    if (typeof off === "function") {
        off();
    }
};
