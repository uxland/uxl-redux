export type StatePathFunction = (state: object) => any;

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
export const statePath = (statePath:  StatePathFunction) => (proto: any, propName: string) =>{
    createReduxStatePath(statePath, proto, propName);
};