import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getAccessToken } from "../helpers/storage";
import User from "../interfaces/User";

const initialState: User = {
  token: getAccessToken, // Chame a função para obter o token de armazenamento
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logoutUser: (state) => {
      state.token = null;
    },
  },
});

export const { loginUser, logoutUser } = slice.actions;
export default slice.reducer;
