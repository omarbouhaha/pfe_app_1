import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchData = createAsyncThunk(
  "dataPreprocessing/fetchData",
  async () => {
    const response = await axios.get("http://localhost:3001/preprocessing");
    return response.data;
  }
);

const dataPreprocessingSlice = createSlice({
  name: "dataPreprocessing",
  initialState: {
    data: {},
    selectedOptions: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setApply: (state, action) => {
      const { operationName, apply } = action.payload;
      const operation = state.data.dataCleaning.operations.find(
        (op) => op.name === operationName
      );
      if (operation) {
        operation.apply = apply;
        if (!apply) {
          // find the index of the operation in the selectedOptions array
            const index = state.selectedOptions.findIndex(
                (op) => op.operationName === operationName
            );
            if (index !== -1) {
                state.selectedOptions.splice(index, 1); // remove the operation from the selectedOptions array
            }

        }
      }
    },
    setMethod: (state, action) => {
      const { operationName, method } = action.payload;
      const operation = state.data.dataCleaning.operations.find(
        (op) => op.name === operationName
      );
      if (operation) {
        operation.method = method;
      }
    },
    addOrModifyOption: (state, action) => {
        state.selectedOptions = action.payload.modifiedOptions;
    },
    deleteOptionByOperationName: (state, action) => {
        const operationName = action.payload;
        state.selectedOptions = state.selectedOptions.filter(
          option => option.operationName !== operationName
        );
      }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setApply, setMethod, addOrModifyOption, deleteOptionByOperationName } =
  dataPreprocessingSlice.actions;

export default dataPreprocessingSlice.reducer;
