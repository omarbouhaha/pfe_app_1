import { createSlice } from '@reduxjs/toolkit';
import CryptoJS from "crypto-js";

const importStepSlice = createSlice({
  name: 'importStep',
  initialState: {
    list: ['CSV', 'JSON', 'XML', 'SQL'],
    importedFiles: [],
  },
  reducers: {
    // addImportStep: (state, action) => {
    //   state.list.push(action.payload);
    // },
    // removeImportStep: (state, action) => {
    //   state.list = state.list.filter(item => item !== action.payload);
    // },
    setImportedFiles: (state, action) => {
      const files = action.payload;
      files.forEach((file) => {
        file.id = CryptoJS.SHA256(file.name).toString();
      });

      state.importedFiles = action.payload;
    },

  }, 
});

// export const { addImportStep, removeImportStep } = importStepSlice.actions;
export const { setImportedFiles } = importStepSlice.actions;

export default importStepSlice.reducer;
