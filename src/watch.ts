import lensPath from 'ramda/es/lensPath';
import view from 'ramda/es/view';
import when from 'ramda/es/when';
import is from 'ramda/es/is';
import isNil from 'ramda/es/isNil';
import {Store} from "redux";
import {property, PropertyDeclaration} from "lit-element";
import always from 'ramda/es/always';
import {ConnectAddOn, Selector} from "./connect";
const toLensSelector = (path: string) => view(lensPath(path.split('.')));
const getSelector = (selector: Selector | string) => when(is(String), toLensSelector)(selector);
const getStore = (store: Store, proto: any) => when(isNil, always((<ConnectAddOn>proto).reduxDefaultStore))(store);
export interface WatchOptions<> {
    store?: Store<any, any>;
    propertyOptions?: PropertyDeclaration;
}
export const watch = <T = any>(selector: Selector<T> | string, options?: WatchOptions) => (proto: any, name: PropertyKey) =>{
    (<ConnectAddOn>proto.constructor).watchProperty(name, {name: String(name), selector: getSelector(selector), store: getStore(options.store, proto)});
    if(proto.constructor.createProperty)
        property(options.propertyOptions)(proto, name);
};
