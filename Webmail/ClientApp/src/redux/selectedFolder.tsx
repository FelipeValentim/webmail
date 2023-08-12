import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Folder from "../interfaces/Folder";
import { logoutUser } from "./user";

const initialState: Folder | null = null;

const slice = createSlice({
  name: "selectedFolder",
  initialState,
  reducers: {
    setSelectedFolder: (state, action: PayloadAction<Folder | null>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const { setSelectedFolder } = slice.actions;
export default slice.reducer;
