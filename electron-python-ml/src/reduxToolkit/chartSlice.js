import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async action to fetch chart types
export const fetchChartTypes = createAsyncThunk(
  "charts/fetchTypes",
  async () => {
    const response = await axios.get("http://localhost:3001/charts");
    return response.data;
  }
);

export const fetchUserCharts = createAsyncThunk(
  "charts/fetchUserCharts",
  async () => {
    const response = await fetch("http://localhost:3001/userCharts");
    return response.json();
  }
);

// Asynchronous thunk for adding a user chart
export const postUserChart = createAsyncThunk(
  "charts/postUserChart",
  async (chartData) => {
    const response = await fetch("http://localhost:3001/userCharts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chartData),
    });
    return response.json();
  }
);

// Asynchronous thunk for deleting a user chart
export const deleteUserChart = createAsyncThunk(
  "charts/deleteUserChart",
  async (chartId) => {
    const response = await fetch(`http://localhost:3001/userCharts/${chartId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Could not delete the chart");
    }
    return chartId;
  }
);


const chartSlice = createSlice({
  name: "charts",
  initialState: { chartTypes: [], userCharts: [], status: "idle", error: null },
  reducers: {
    addUserChart: (state, action) => {
      state.userCharts.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchChartTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chartTypes = action.payload;
      })
      .addCase(fetchChartTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchUserCharts.fulfilled, (state, action) => {
        state.userCharts = action.payload;
      })
      .addCase(postUserChart.fulfilled, (state, action) => {
        state.userCharts.push(action.payload);
      })
      .addCase(deleteUserChart.fulfilled, (state, action) => {
        state.userCharts = state.userCharts.filter(chart => chart.id !== action.payload);
      });
  },
});
export const { addUserChart } = chartSlice.actions;
export default chartSlice.reducer;
