import {is, isNil, identity} from 'ramda';
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
};
export type PayloadCreator<Payload = any> = (...args: any[]) => Payload;

export const createAction: <Payload = any, Meta = any>(type: string, payloadCreator?: PayloadCreator<Payload>, metaCreator?: (...args:any[]) => Meta) => (...args: any[]) => Action<Payload, Meta> =
    (type, payloadCreator = identity, metaCreator) => {
        invariant(is(Function, payloadCreator) || isNil(payloadCreator), 'Expected payloadCreator to be a function, undefined or null');
        const hasMeta = is(Function, metaCreator);

        const finalPayloadCreator: (...args: any[]) => any = isNil(payloadCreator) || payloadCreator === identity ? identity :
            (head, ...args) => head instanceof Error ? head : payloadCreator(head, ...args);
        const actionCreator = (...args: any[]) =>{
            const action = <Action>{type};
            const payload = args.length ? finalPayloadCreator(...args) : finalPayloadCreator(null);
            if(!isNil(payload))
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


