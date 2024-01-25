import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import DataMessages from "../interfaces/DataMessages";
import { logoutUser } from "./user";

type MessageState = DataMessages | null;

const initialState = null as MessageState;

const slice = createSlice({
  name: "dataMessages",
  initialState,
  reducers: {
    setMessages: (_, action: PayloadAction<DataMessages | null>) => {
      return action.payload;
    },
    toggleFlag: (state, action) => {
      const { id, type } = action.payload;
      const item = state?.messages.find((item) => item.uniqueId.id === id);

      if (item) {
        item.flagged = type == "flagged";
      }
    },
    removeMessages: (state, action: PayloadAction<Array<number>>) => {
      const ids = action.payload;
      if (state?.messages) {
        state.messages = state.messages.filter(
          (item) => !ids.includes(item.uniqueId.id)
        );
        state.countMessages -= ids.length;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const { setMessages, toggleFlag, removeMessages } = slice.actions;

export default slice.reducer;
