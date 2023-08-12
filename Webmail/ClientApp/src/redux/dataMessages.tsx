import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import DataMessages from "../interfaces/DataMessages";

const initialState: DataMessages | null = null;

const slice = createSlice({
  name: "dataMessages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<DataMessages | null>) => {
      return action.payload;
    },
  },
});

export const { setMessages } = slice.actions;

export default slice.reducer;
