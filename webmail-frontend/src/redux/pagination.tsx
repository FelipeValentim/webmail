import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "./user";
import Pagination from "../interfaces/Pagination";

const initialState: Pagination = { page: 0, rowsPerPage: 30, returning: false };

const slice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    setPagination: (_, action: PayloadAction<Pagination>) => {
      return action.payload;
    },
    setReturning: (state, action: PayloadAction<boolean>) => {
      state.returning = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser, () => {
      return initialState;
    });
  },
});

export const { setPagination, setReturning } = slice.actions;
export default slice.reducer;
