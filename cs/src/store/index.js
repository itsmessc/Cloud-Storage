import { configureStore } from "@reduxjs/toolkit";
import rootReducer from '../reducers'; // Assuming you have a single reducer file

const store = configureStore({
  reducer: rootReducer
});

export default store;
