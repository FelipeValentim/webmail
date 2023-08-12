import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import Message from "../interfaces/Message";

const initialState: Array<Message> | null = null;

const slice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Array<Message> | null>) => {
      return action.payload;
    },
  },
});

export const { setMessages } = slice.actions;

export default slice.reducer;
