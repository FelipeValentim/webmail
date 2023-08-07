import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute, UnprotectedRoute } from "./helpers/authHelper";

const Home = lazy(() => import("./views/app/home/index"));
const Login = lazy(() => import("./views/user/login"));
const Message = lazy(() => import("./views/app/message/index"));

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
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message"
            element={
              <ProtectedRoute>
                <Message />
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
