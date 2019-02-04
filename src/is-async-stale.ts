import isNil from 'ramda/es/isNil';
import equals from 'ramda/es/equals';
import either from 'ramda/es/either';
import propEq from 'ramda/es/propEq';
import allPass from 'ramda/es/allPass';
import both from 'ramda/es/both';
import cond from 'ramda/es/cond';
import T from 'ramda/es/T';
import always from 'ramda/es/always';
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
const notNil = x => !isNil(x);
const nilOrDefault = either(isNil, equals(defaultState));
const isFetching = propEq('isFetching', true);
const invalidatedOrError = either(propEq('didInvalidate', true), propEq('error', true));
const validStaleInterval = (staleInterval) => () => !isNil(staleInterval);
const validTimestamp = (state: AsyncState) => both(notNil, isValid)(state.timestamp);

const validStaleInfo = (staleInterval: Duration) =>  allPass([validStaleInterval(staleInterval), validTimestamp]);
export const isAsyncStateStale = <TIn>(state: AsyncState<TIn>, staleInterval?: Duration): boolean =>
    cond([
        [nilOrDefault, always(true)],
        [isFetching, always(false)],
        [invalidatedOrError, always(true)],
        [validStaleInfo(staleInterval), () => isBefore(Date.now(), durationAdders[staleInterval.unit](state.timestamp, staleInterval.amount))],
        [T, always(false)]
    ])(state);
