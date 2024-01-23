import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getUser } from "../helpers/storage";

const slice = createSlice({
  name: "user",
  initialState: getUser(),
  reducers: {
    loginUser: (_, action: PayloadAction<string>) => {
      return action.payload;
    },
    logoutUser: () => {
      return null;
    },
  },
});

export const { loginUser, logoutUser } = slice.actions;
export default slice.reducer;
