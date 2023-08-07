import { accessTokenKey } from "../constants/default";

export const getAccessToken = localStorage.getItem(accessTokenKey);

export const setAccessToken = (token: string) =>
  localStorage.setItem(accessTokenKey, token);

export const removeAccessToken = () => localStorage.removeItem(accessTokenKey);
