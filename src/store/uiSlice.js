import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    toast: {
        message: null,
        type: 'info', // 'info' | 'success' | 'warning' | 'error'
        id: null,
        visible: false
    }
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showToast: (state, action) => {
            const { message, type = 'info' } = typeof action.payload === 'string'
                ? { message: action.payload, type: 'info' }
                : action.payload;

            state.toast = {
                message,
                type,
                id: Date.now(),
                visible: true
            };
        },
        hideToast: (state) => {
            state.toast.visible = false;
            state.toast.message = null;
        }
    }
});

export const { showToast, hideToast } = uiSlice.actions;

export const selectToast = (state) => state.ui.toast;

export default uiSlice.reducer;
