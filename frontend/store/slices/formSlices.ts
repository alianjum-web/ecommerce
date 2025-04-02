import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormState {
  data: Record<string, string>;
}

const initialState: FormState = {
  data: {},
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<{ name: string; value: string }>) => {
      state.data[action.payload.name] = action.payload.value;
    },
    resetForm: (state) => {
      state.data = {};
    },
  },
});

export const { updateFormData, resetForm } = formSlice.actions;
export default formSlice.reducer;
