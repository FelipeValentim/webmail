import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "./user";
import Search from "../interfaces/Search";

const initialState: Search = {
  query: "All",
  text: "",
  params: ["subject"],
};

const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearch: (_, action: PayloadAction<Search>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const { setSearch } = slice.actions;
export default slice.reducer;
