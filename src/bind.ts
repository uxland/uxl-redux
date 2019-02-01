import {ConnectAddOn, PropertyWatch} from "./types";
import {LitElement} from "lit-element";
import pipe from 'ramda/es/pipe';
import values from 'ramda/es/values';
import uniq from 'ramda/es/uniq';
import map from 'ramda/es/map';
import propEq from 'ramda/es/propEq';
import filter from 'ramda/es/filter';
import equals from 'ramda/es/equals';
import reject from 'ramda/es/reject';
import {Store, Unsubscribe} from "redux";
const nop = () =>{};
const getWatches = (element: LitElement) => (<ConnectAddOn><any>element.constructor).uxlReduxWatchedProperties;
const mapWatches = (watchesMap: {[key: string]:PropertyWatch}) => values(watchesMap);
const getWatchesByStore: (store: Store) => (watches: PropertyWatch[])=> PropertyWatch[] = store => filter<PropertyWatch>(propEq('store', store));
interface PropertyState {
    name: string,
    current: any,
    old?: any;
}
const getProperties = (state: any, litElement) => map<PropertyWatch, PropertyState>(x => ({name: x.name, old: litElement[x.name], current: x.selector(state)}));
const rejectUnchanged: (changes: PropertyState[]) => PropertyState[] = reject<PropertyState>(x => equals(x.old, x.current));
const updateProperties = (element: LitElement) => map<PropertyState, void>(change =>{
    element[change.name] = change.current;
    if(element.requestUpdate)
        element.requestUpdate(change.name, change.old).then(nop);
});
const listen = (element: LitElement, store: Store) => {
    const watches = pipe(getWatches, mapWatches, getWatchesByStore(store))(element);
    return () => pipe(getProperties(store.getState(), element), rejectUnchanged, updateProperties(element), nop)(watches)
};
const listener = (element: LitElement) => (store: Store) => store.subscribe(listen(element, store));

const getAllStores = (watches: {[key: string]: PropertyWatch}) => uniq(map(x => x.store, values(watches)));

const subscribe = (element: LitElement) => map<Store, Unsubscribe>(listener(element));

const storeSubscriptions = (element: LitElement) => (subscriptions: Unsubscribe[]) => Object.defineProperty(element, '__reduxStoreSubscriptions__', {
   get(): Unsubscribe[] {
       return subscriptions;
   },
    configurable: true,
    enumerable: true,
});

export const bind: (element: LitElement) => void = element => pipe(getWatches, getAllStores, subscribe(element), storeSubscriptions(element), nop)(element);
