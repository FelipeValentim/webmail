import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Folder from "../interfaces/Folder";
import { logoutUser } from "./user";

const initialState: Array<Folder> | null = null;

const slice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setFolders: (state, action: PayloadAction<Array<Folder> | null>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const { setFolders } = slice.actions;
export default slice.reducer;
