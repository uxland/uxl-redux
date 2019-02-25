import {WatchOptions} from "./watch";
import {Store} from "redux";
import {collect} from "@uxland/uxl-utilities";

const DEFAULT_STORE_PROPERTY = 'reduxDefaultStore';
const WATCHED_PROPERTIES_PROPERTY = 'watchedReduxProperties';
export const getDefaultStore = (proto: any) =>{
    return proto.constructor.reduxDefaultStore;
};


export const setDefaultStore = (proto: any, store: Store) =>{
    Object.defineProperty(proto.constructor, DEFAULT_STORE_PROPERTY, {
        get() {
            return store;
        },
        enumerable: true,
        configurable: true
    });
};

export const createWatchedReduxProperty = (propConfig: WatchOptions, proto: any, propName: string) =>{
    const properties =  Object.keys(Object.assign({}, proto.constructor.watchedReduxProperties))
        .filter(key => !proto.__proto__.constructor.watchedReduxProperties || !proto.__proto__.constructor.watchedReduxProperties[key])
        .reduce((previousValue, currentValue) => {return {...previousValue, [currentValue]: proto.constructor.watchedReduxProperties[currentValue]}}, {[propName]: propConfig});

    Object.defineProperty(proto.constructor, WATCHED_PROPERTIES_PROPERTY, {
        get(){
            return properties;
        },
        enumerable: true,
        configurable: true
    });
};
export const getWatchedProperties = (proto: any) => collect(proto.constructor, WATCHED_PROPERTIES_PROPERTY);