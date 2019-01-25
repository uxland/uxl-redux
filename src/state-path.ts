import {PropertyDeclaration} from "lit-element";

export type StatePathFunction = (state: object) => any;
import {property} from 'lit-element/lib/decorators'
const createReduxStatePath = (statePath: StatePathFunction, proto: any, propName: string) =>{
    const properties =  Object.keys(Object.assign({}, proto.constructor.uxlReduxStatePaths))
        .filter(key => !proto.__proto__.constructor.uxlReduxStatePaths || !proto.__proto__.constructor.uxlReduxStatePaths[key])
        .reduce((previousValue, currentValue) => {return {...previousValue, [currentValue]: proto.constructor.uxlReduxStatePaths[currentValue]}}, {[propName]: statePath});

    Object.defineProperty(proto.constructor, 'uxlReduxStatePaths', {
        get(){
            return properties;
        },
        enumerable: true,
        configurable: true
    });
};
const defaultOptions: PropertyDeclaration = {reflect: true};
const createPropertyOptions: (options?: PropertyDeclaration) => PropertyDeclaration = (options = {}) => ({...defaultOptions, ...options});
export const statePath = (statePath:  StatePathFunction, options?: PropertyDeclaration) => (proto: any, propName: string) =>{
    createReduxStatePath(statePath, proto, propName);
    property(createPropertyOptions(options))(proto, propName);
};