import { configureStore } from '@reduxjs/toolkit';
import importStepReducer from './importStepSlice';
import dialogReducer from './dialogSlice';
import dataPreprocessingSlice from './dataPreprocessingSlice';
import chartReducer from './chartSlice';
import mlModelsReducer from './mlModelsSlice';
import dlModelsReducer from './dlModelsSlice';

const store = configureStore({
  reducer: {
    importStep: importStepReducer,
    dialog: dialogReducer,
    dataPreprocessing: dataPreprocessingSlice,
    charts: chartReducer,
    mlModels: mlModelsReducer,
    dlModels: dlModelsReducer,
  },
});

export default store;
