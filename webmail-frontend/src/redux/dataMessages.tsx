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
    setSeenMessages: (state, action) => {
      const { ids, type } = action.payload;
      const items = state?.messages.filter((item) =>
        ids.includes(item.uniqueId.id)
      );

      if (items) {
        items.forEach((item) => {
          item.seen = type == "seen";
        });
      }
    },
    setFlaggedMessaages: (state, action) => {
      const { ids, type } = action.payload;
      const items = state?.messages.filter((item) =>
        ids.includes(item.uniqueId.id)
      );

      if (items) {
        items.forEach((item) => {
          item.flagged = type == "flagged";
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const {
  setMessages,
  toggleFlag,
  removeMessages,
  setFlaggedMessaages,
  setSeenMessages,
} = slice.actions;

export default slice.reducer;
