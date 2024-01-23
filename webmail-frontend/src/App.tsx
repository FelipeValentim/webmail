import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute, UnprotectedRoute } from "./helpers/authHelper";
import mailbox from "./assets/lotties/mailbox.json";
import { useLottie } from "lottie-react";
import React from "react";

const ViewApp = lazy(() => import("./views/app/index"));
const Login = lazy(() => import("./views/user/login"));
const Message = lazy(() => import("./views/app/message/index"));
const Home = lazy(() => import("./views/app/home/index"));
function App() {
  const options = {
    animationData: mailbox,
    loop: true,
  };

  const { View: LoadingLottie } = useLottie(options);

  return (
    <BrowserRouter>
      <Suspense
        fallback={<div className="loading-animation">{LoadingLottie}</div>}
      >
        <Routes>
          {/* Definindo as rotas com os componentes carregados de forma assíncrona */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ViewApp />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<Home />} />
            <Route path="/:folder/:uniqueid" element={<Message />} />
          </Route>
          <Route
            path="/login"
            element={
              <UnprotectedRoute>
                <Login />
              </UnprotectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
