import { AxiosResponse } from "axios";
import User from "../interfaces/User";
import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";
import AuthResult from "../interfaces/AuthResult";
import { ConnectionSettings } from "../interfaces/Provider";

export const UserAPI = {
  login: async function (user: User, cancel = false): Promise<AxiosResponse> {
    return api.request({
      url: `/user/login`,
      method: "POST",
      data: { ...user },
      signal: cancel
        ? cancelApiObject[this.login.name].handleRequestCancellation().signal
        : undefined,
    });
  },
  authGoogle: async function (cancel = false): Promise<AxiosResponse> {
    return api.request({
      url: `/oauth/googleauthenticate`,
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.authGoogle.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  loginOAuth: async function (
    authResult: AuthResult,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/user/oauthlogin`,
      method: "POST",
      data: { ...authResult },
      signal: cancel
        ? cancelApiObject[this.loginOAuth.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  testConnection: async function (
    provider: ConnectionSettings,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/User/TestConnection`,
      method: "POST",
      data: provider,
      signal: cancel
        ? cancelApiObject[this.testConnection.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(UserAPI);
