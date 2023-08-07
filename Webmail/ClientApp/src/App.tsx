import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute, UnprotectedRoute } from "./helpers/authHelper";

const ViewApp = lazy(() => import("./views/app/index"));
const Login = lazy(() => import("./views/user/login"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Definindo as rotas com os componentes carregados de forma assíncrona */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ViewApp />
              </ProtectedRoute>
            }
          />
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
