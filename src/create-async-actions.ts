export interface AsyncActions {
    started: string;
    failed: string;
    succeeded: string;
    ended: string;
    invalidated: string;
}

export const ENDED_SUFFIX = "_ENDED";
export const FAILED_SUFFIX = "_FAILED";
export const STARTED_SUFFIX = "_STARTED";
export const SUCCEEDED_SUFFIX = "_SUCCEEDED";
export const INVALIDATED_SUFFIX = "_INVALIDATED";
export const createAsyncActions: (actionName: string) => AsyncActions = actionName => {
    return {
        failed: `${actionName}${FAILED_SUFFIX}`,
        started: `${actionName}${STARTED_SUFFIX}`,
        ended: `${actionName}${ENDED_SUFFIX}`,
        succeeded: `${actionName}${SUCCEEDED_SUFFIX}`,
        invalidated: `${actionName}${INVALIDATED_SUFFIX}`
    };
};
export default createAsyncActions;