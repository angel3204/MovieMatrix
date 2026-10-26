import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './movieSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
    reducer: {
        movies: movieReducer,
        ui: uiReducer
    }
});

export default store;
