// Token
import { accessTokenKey, defaultTheme, themeKey } from "../constants/default";

export const getAccessToken = localStorage.getItem(accessTokenKey);

export const setAccessToken = (token: string) =>
  localStorage.setItem(accessTokenKey, token);

export const removeAccessToken = () => localStorage.removeItem(accessTokenKey);

// Theme
export const getTheme = localStorage.getItem(themeKey) ?? defaultTheme;

export const setTheme = (theme: "light-theme" | "dark-theme") => {
  if (theme === "light-theme" || theme === "dark-theme") {
    localStorage.setItem(themeKey, theme);
  } else {
    throw new Error(
      "Valor de tema inválido. Use 'light-theme' ou 'dark-theme'."
    );
  }
};
