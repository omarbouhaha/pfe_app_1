import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchDlModels = createAsyncThunk(
    "dlModels/fetchDlModels",
    async () => {
        const response = await fetch("http://localhost:3001/dl_models");
        const data = await response.json();
        console.log(data);
        return data; // assuming dlModels is the key containing your models in db.json
    }
);

export const fetchScalers = createAsyncThunk(
    "dlModels/fetchScalers",
    async () => {
        const response = await fetch("http://localhost:3001/scalers");
        const data = await response.json();
        console.log(data);
        return data; // assuming scalers is the key containing your scalers in db.json
    }
);

const dlModelsSlice = createSlice({
    name: "dlModels",
    initialState: {
        models: [],
        scalers: {},
        status: "idle",
        error: null,
    },
    reducers: {
        // Add any synchronous reducers here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDlModels.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchDlModels.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.models = action.payload;
            })
            .addCase(fetchDlModels.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(fetchScalers.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchScalers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.scalers = action.payload;
            })
            .addCase(fetchScalers.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    }
});

export default dlModelsSlice.reducer;