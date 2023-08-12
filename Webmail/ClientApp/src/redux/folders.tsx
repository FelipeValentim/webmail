import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Folder from "../interfaces/Folder";

const initialState: Array<Folder> | null = null;

const slice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setFolders: (state, action: PayloadAction<Array<Folder> | null>) => {
      return action.payload;
    },
  },
});

export const { setFolders } = slice.actions;
export default slice.reducer;
