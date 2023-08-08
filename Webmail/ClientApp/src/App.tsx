import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute, UnprotectedRoute } from "./helpers/authHelper";

const ViewApp = lazy(() => import("./views/app/index"));
const Login = lazy(() => import("./views/user/login"));
const Message = lazy(() => import("./views/app/message/index"));
const Home = lazy(() => import("./views/app/home/index"));
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading" />}>
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
            <Route path="message" element={<Message />} />
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
