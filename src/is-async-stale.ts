import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';
import {addDays, addHours, addMinutes, addSeconds, isBefore, isValid} from "date-fns/esm";
import {AsyncState, getDefaultState} from "./create-async-reducer";

const defaultState = getDefaultState();
const durationAdders = {
    seconds: addSeconds,
    minutes: addMinutes,
    hours: addHours,
    days: addDays
};
export interface Duration {
    amount: number;
    unit: DurationUnitType
}
export type DurationUnitType = 'seconds' | 'minutes' | 'hours' | 'days';
export const isAsyncStateStale = <T>(state: AsyncState<T>, staleInterval?: Duration): boolean =>{
    if(isNil(state) || isEqual(state, defaultState))
        return true;
    if(state.isFetching)
        return false;
    if (state.didInvalidate || state.error)
        return true;
    if(staleInterval && state.timestamp && isValid(state.timestamp))
        return isBefore(Date.now(), durationAdders[staleInterval.unit](state.timestamp, staleInterval.amount));
    return false;
};

export default isAsyncStateStale;