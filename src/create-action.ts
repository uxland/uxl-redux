import identity from 'lodash-es/identity';
import isNull from 'lodash-es/isNull';
import isUndefined from 'lodash-es/isUndefined'
import isFunction from 'lodash-es/isFunction';
import {Action as ReduxAction} from "redux";


export type ActionFunctionAny<R> = (...args: any[]) => R;
export interface Action<Payload = any, Meta = any> extends ReduxAction{
    payload?: Payload;
    meta?: Meta;
    error?: boolean;
    timestamp?: Date;
    elapsed?: number;
}
const invariant = (condition: boolean, message: string) =>{
    if(!condition)
        throw new Error(message);
}
export const createAction: <Payload = any, Meta = any>(type: string, payloadCreator?: (...args: any[]) => Payload, metaCreator?: (...args:any[]) => Meta) => (...args: any[]) => Action<Payload, Meta> =
    (type, payloadCreator = identity, metaCreator) => {
        invariant(isFunction(payloadCreator) || isNull(payloadCreator), 'Expected payloadCreator to be a function, undefined or null');
        const hasMeta = isFunction(metaCreator);

        const finalPayloadCreator: (...args: any[]) => any = isNull(payloadCreator) || payloadCreator === identity ? identity :
            (head, ...args) => head instanceof Error ? head : payloadCreator(head, ...args);
        const actionCreator = (...args) =>{
            const action = <Action>{type};
            const payload = finalPayloadCreator(...args);
            if(!isUndefined(payload))
                action.payload = payload;
            if(hasMeta)
                action.meta = metaCreator(...args);
            if(action.payload instanceof Error)
                action.error = true;
            return action
        };
        actionCreator.toString = () => type;
        return actionCreator;
    };

export default createAction;

