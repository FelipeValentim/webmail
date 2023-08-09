import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import logger from "./middlewares/logger";
import user from "./user";

const reducer = combineReducers({ user });
// Existem middlewares já configurados por padrão na store
// para adicionarmos um novo, precisamos puxar os que já existem
// e desestruturarmos os mesmos dentro de uma array.
const middleware = [...getDefaultMiddleware(), logger];

const store = configureStore({ reducer, middleware: middleware });

export default store;