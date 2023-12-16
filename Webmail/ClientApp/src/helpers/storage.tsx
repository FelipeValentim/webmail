// Token
import { mailboxUser, defaultTheme, themeKey } from "../constants/default";

export const getUser = () => localStorage.getItem(mailboxUser);

export const setUser = (user: string) => {
  if (user !== null) {
    localStorage.setItem(mailboxUser, user);
  } else {
    localStorage.removeItem(mailboxUser);
  }
};

export const removeUser = () => localStorage.removeItem(mailboxUser);

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
