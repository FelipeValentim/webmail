import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Folder from "../interfaces/Folder";
import { logoutUser } from "./user";

type FoldersState = Array<Folder> | null;

const initialState = null as FoldersState;

const slice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setFolders: (_, action: PayloadAction<Array<Folder> | null>) => {
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
