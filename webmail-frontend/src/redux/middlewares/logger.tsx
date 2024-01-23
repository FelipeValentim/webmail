import { Middleware, MiddlewareAPI, Dispatch, Action } from "redux";

const logger: Middleware =
  (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    console.group(action.type);
    console.log("ACTION", action);
    console.log("PREV_STATE", store.getState());
    const result = next(action);
    console.log("NEW_STATE", store.getState());
    console.groupEnd();
    return result;
  };

export default logger;
