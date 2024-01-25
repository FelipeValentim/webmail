import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Folder from "../interfaces/Folder";
import { logoutUser } from "./user";

type FolderState = Folder | null;

const initialState = null as FolderState;

const slice = createSlice({
  name: "selectedFolder",
  initialState,
  reducers: {
    setSelectedFolder: (_, action: PayloadAction<Folder>) => {
      return action.payload;
    },
    setTotalEmails: (state, action: PayloadAction<number>) => {
      if (state) {
        state.totalEmails = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const { setSelectedFolder, setTotalEmails } = slice.actions;
export default slice.reducer;
