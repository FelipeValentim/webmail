import React, { FC, ReactNode } from "react";
import { removeAccessToken } from "./storage";
import api from "../api";
import { AxiosError } from "axios";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RootState from "../interfaces/RootState";

interface RouteProps {
  children: ReactNode;
}

export const ProtectedRoute: FC<RouteProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const user = useSelector((state: RootState) => state.user);

  React.useEffect(() => {
    const isLoggedIn = async () => {
      if (user) {
        try {
          const response = await api.get("user/isloggedin", {
            headers: {
              Authorization: `Bearer ${user.token}`,
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
  return authenticated ? children : <Navigate to="/login" />;
};

export const UnprotectedRoute: FC<RouteProps> = ({ children }) => {
  //TODO
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const user = useSelector((state: RootState) => state.user);

  React.useEffect(() => {
    const isLoggedIn = async () => {
      if (user) {
        try {
          const response = await api.get("user/isloggedin", {
            headers: {
              Authorization: `Bearer ${user.token}`,
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
  return authenticated ? <Navigate to="/" /> : children;
};
