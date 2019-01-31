import curry from 'ramda/es/curry';
import lensPath from 'ramda/es/lensPath';
import view from 'ramda/es/view';
import when from 'ramda/es/when';
import is from 'ramda/es/is';
import isNil from 'ramda/es/isNil';
import {Store} from "redux";
import {property, PropertyDeclaration} from "lit-element";
import {ConnectAddOn, Selector} from "./types";
import always from 'ramda/es/always';
const toLensSelector = (path: string) => view(lensPath(path.split('.')));
const getSelector = (selector: Selector | string) => when(is(String), toLensSelector)(selector);
const getStore = (store: Store, proto: any) => when(isNil, always((<ConnectAddOn>proto).reduxDefaultStore))(store);
const watchProperty = <T = any>(store: Store, selector: Selector<T> | string, options?: PropertyDeclaration) => (proto: any, name: PropertyKey) =>{
    (<ConnectAddOn>proto).watchProperty(name, {name: String(name), selector: getSelector(selector), store: getStore(store, proto)});
    if(proto.createProperty)
        property(options)(proto, name);
};

const watch = curry<Store, Selector, PropertyDeclaration, any>(watchProperty);
export default watch;