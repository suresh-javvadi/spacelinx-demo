import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import partTypeReducer from "../slices/partTypeSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    partTypes: partTypeReducer,
  },
});
