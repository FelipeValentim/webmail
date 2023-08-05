import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

const Login = React.lazy(
  () => import(/* webpackChunkName: "user-login" */ "./login")
);

const Index = () => {
  return (
    <Suspense fallback={<div className="loading" />}>
      <Routes>
        <Navigate to={`user/login`} />
        <Route path={`user/login`} render={(props) => <Login {...props} />} />
        {/* <Redirect to="/error" /> */}
      </Routes>
    </Suspense>
  );
};

export default Index;
