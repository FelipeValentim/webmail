import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import DataMessages from "../interfaces/DataMessages";
import { logoutUser } from "./user";

const initialState: DataMessages | null = null;

const slice = createSlice({
  name: "dataMessages",
  initialState,
  reducers: {
    setMessages: (_, action: PayloadAction<DataMessages | null>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const { setMessages } = slice.actions;

export default slice.reducer;
