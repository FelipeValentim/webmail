// Token
import {
  mailboxUser,
  defaultTheme,
  themeKey,
  mailboxTemplates,
} from "../constants/default";
import Template from "../interfaces/Template";

export const getUser = () => localStorage.getItem(mailboxUser);

export const setUser = (user: string) => {
  if (user !== null) {
    localStorage.setItem(mailboxUser, user);
  }
};

export const getTemplates = (): Template[] => {
  // Obtenha os templates do localStorage
  const templates = localStorage.getItem(mailboxTemplates);

  // Verifique se há templates armazenados
  if (templates) {
    return JSON.parse(templates) as Template[];
  } else {
    // Caso contrário, retorne uma lista vazia
    return [];
  }
};

export const addTemplate = (template: Template) => {
  if (template !== null) {
    const templates = getTemplates();
    const newTemplates = [...templates, template];
    localStorage.setItem(mailboxTemplates, JSON.stringify(newTemplates));
  }
};

export const cleanTemplates = () => {
  localStorage.removeItem(mailboxTemplates);
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
