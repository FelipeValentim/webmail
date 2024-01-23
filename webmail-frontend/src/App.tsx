import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute, UnprotectedRoute } from "./helpers/authHelper";
import mailbox from "./assets/lotties/mailbox.json";
import { useLottie } from "lottie-react";
import React from "react";

const ViewApp = lazy(() => import("./views/app/index"));
const ViewLogin = lazy(() => import("./views/user/login"));
const ViewMessage = lazy(() => import("./views/app/message/index"));
const ViewHome = lazy(() => import("./views/app/home/index"));
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
            <Route path="" element={<ViewHome />} />
            <Route path="/:folder/:uniqueid" element={<ViewMessage />} />
          </Route>
          <Route
            path="/login"
            element={
              <UnprotectedRoute>
                <ViewLogin />
              </UnprotectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
