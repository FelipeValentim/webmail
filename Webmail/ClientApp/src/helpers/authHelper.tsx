import React from "react";
import { getAccessToken, removeAccessToken } from "./storage";
import api from "../api";
import { AxiosError } from "axios";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const isLoggedIn = async () => {
      const accessToken = getAccessToken; // Chamada da função para obter o token

      if (accessToken) {
        try {
          const response = await api.get("user/isloggedin", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.status === 200) {
            setAuthenticated(true);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              removeAccessToken();
            }
          }
        }
      }

      setLoading(false);
    };

    isLoggedIn();
  }, []);

  if (loading) {
    return null;
  }

  return authenticated ? children : <Navigate to="/user/login" />;
};

export const UnprotectedRoute = ({ children }) => {
  //TODO
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const isLoggedIn = async () => {
      const accessToken = getAccessToken; // Chamada da função para obter o token

      if (accessToken) {
        try {
          const response = await api.get("user/isloggedin", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.status === 200) {
            setAuthenticated(true);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              removeAccessToken();
            }
          }
        }
      }

      setLoading(false);
    };

    isLoggedIn();
  }, []);

  if (loading) {
    return null;
  }

  return authenticated ? children : <Navigate to="/user/login" />;
};
