import { createSlice } from "@reduxjs/toolkit";
import { getTheme } from "../helpers/storage";

const initialState = getTheme;

const slice = createSlice({
  name: "themeSwitch",
  initialState: initialState,
  reducers: {
    lightMode: () => {
      return "light-theme";
    },
    darkMode: () => {
      return "dark-theme";
    },
  },
});

export const { lightMode, darkMode } = slice.actions;
export default slice.reducer;
