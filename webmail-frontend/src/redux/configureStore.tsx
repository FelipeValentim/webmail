import { AnyAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import logger from "./middlewares/logger";
import user from "./user";
import themeSwitch from "./themeSwitch";
import folders from "./folders";
import dataMessages from "./dataMessages";
import selectedFolder from "./selectedFolder";
import search from "./search";

const reducer = combineReducers({
  user,
  themeSwitch,
  folders,
  dataMessages,
  selectedFolder,
  search,
});

const reducerProxy = (state: any, action: AnyAction) => {
  if (action.type === "logout/LOGOUT") {
    return reducer(undefined, action);
  }
  return reducer(state, action);
};

// export const store = configureStore({
//   reducer: reducerProxy,
// });

// Existem middlewares já configurados por padrão na store
// para adicionarmos um novo, precisamos puxar os que já existem
// e desestruturarmos os mesmos dentro de uma array.

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
