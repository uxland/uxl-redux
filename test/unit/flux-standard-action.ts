import {is, equals, anyPass, all, keys} from 'ramda';
const isType = equals('type');
const isPayload = equals('payload');
const isErrorProp = equals('error');
const isMeta = equals('meta');
const isValidKey: (key: string) => boolean = anyPass([isType, isPayload, isErrorProp, isMeta]);
export const isFSA: (action) => boolean  = action => is(Object, action) && is(String, action.type) && all(isValidKey, keys(action));
