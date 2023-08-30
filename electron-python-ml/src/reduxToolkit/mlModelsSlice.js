import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// This would be an example of how you'd fetch your data from db.json using an API. 
// If your approach differs, please adjust accordingly.
export const fetchMlModels = createAsyncThunk(
  'mlModels/fetchMlModels',
  async () => {
    const response = await fetch('http://localhost:3001/ml_models');
    const data = await response.json();
    // console.log(data);
    return data;  // assuming mlModels is the key containing your models in db.json
  }
);

export const fetchScalers = createAsyncThunk(
  'mlModels/fetchScalers',
  async () => {
    const response = await fetch('http://localhost:3001/scalers');
    const data = await response.json();
    // console.log(data);
    return data;  // assuming scalers is the key containing your scalers in db.json
  }
);


const mlModelsSlice = createSlice({
  name: 'mlModels',
  initialState: {
    models: [],
    scalers:{},
    status: 'idle',
    error: null
  },
  reducers: {
    // Add any synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMlModels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMlModels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.models = action.payload;
      })
      .addCase(fetchMlModels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchScalers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchScalers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.scalers = action.payload;
      })
      .addCase(fetchScalers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default mlModelsSlice.reducer;

// If you have synchronous actions, export them here.
// export const { yourAction } = mlModelsSlice.actions;
