import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Folders from "../interfaces/Folders";

const initialState: Array<Folders> | null = null;

const slice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setFolders: (state, action: PayloadAction<Array<Folders> | null>) => {
      return action.payload;
    },
  },
});

export const { setFolders } = slice.actions;
export default slice.reducer;
