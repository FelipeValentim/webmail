import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./assets/css/styles.css";
import "./assets/css/common.css";
import { Provider } from "react-redux";
import store from "./redux/configureStore";
import Toastify from "./containers/Toastify";

const App = React.lazy(() => import(/* webpackChunkName: "App" */ "./App"));
// const Login = React.lazy(() => import(/* webpackChunkName: "App" */ "./Login"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<div className="loading" />}>
        <App />
        <Toastify />
      </Suspense>
    </Provider>
  </React.StrictMode>
);
