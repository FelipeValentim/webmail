import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./assets/css/styles.css";
// const App = React.lazy(() => import(/* webpackChunkName: "App" */ "./App"));
const Login = React.lazy(() => import(/* webpackChunkName: "App" */ "./Login"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div className="loading" />}>
      <Login />
    </Suspense>
  </React.StrictMode>
);
