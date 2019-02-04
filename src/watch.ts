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
export const watch = <T = any>(store: Store<any, any>) =>(selector: Selector<T> | string, options?: PropertyDeclaration) => (proto: any, name: PropertyKey) =>{
    (<ConnectAddOn>proto.constructor).watchProperty(name, {name: String(name), selector: getSelector(selector), store: getStore(store, proto)});
    if(proto.constructor.createProperty)
        property(options)(proto, name);
};
