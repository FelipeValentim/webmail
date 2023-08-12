import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Folder from "../interfaces/Folder";

const initialState: Folder | null = null;

const slice = createSlice({
  name: "selectedFolder",
  initialState,
  reducers: {
    setSelectedFolder: (state, action: PayloadAction<Folder | null>) => {
      return action.payload;
    },
  },
});

export const { setSelectedFolder } = slice.actions;
export default slice.reducer;
