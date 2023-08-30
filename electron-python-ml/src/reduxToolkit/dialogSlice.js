import { createSlice } from "@reduxjs/toolkit";

const dialogSlice = createSlice({
  name: "dialog",
  initialState: {
    open: false,
    title: "",
    message: "",
    status: "default",
  },
  reducers: {
    openDialog: (state, action) => {
      state.open = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.status = action.payload.status;
    },
    closeDialog: (state) => {
      state.open = false;
      state.title = "";
      state.message = "";
      state.status = "default";
    },
  },
});

export const { openDialog, closeDialog } = dialogSlice.actions;
export default dialogSlice.reducer;
