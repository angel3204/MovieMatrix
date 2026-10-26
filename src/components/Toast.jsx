import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectToast, hideToast } from '../store/uiSlice';

export default function Toast({ toast: propToast = null }) {
    const dispatch = useDispatch();
    const reduxToast = useSelector(selectToast);
    const activeToast = (reduxToast && reduxToast.visible) ? reduxToast : propToast;

    const timerRef = useRef(null);

    useEffect(() => {
        if (reduxToast && reduxToast.visible) {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                dispatch(hideToast());
            }, 3200);
        }
        return () => clearTimeout(timerRef.current);
    }, [reduxToast?.id, reduxToast?.visible, dispatch]);

    if (!activeToast || !activeToast.message) return null;

    const type = activeToast.type || 'info';
    const typeClass = `toast-${type}`;

    const icon = type === 'success'
        ? '✓'
        : type === 'warning'
        ? '⚠️'
        : type === 'error'
        ? '✖'
        : 'ℹ️';

    return (
        <div
            id="toast"
            className={`toast visible ${typeClass}`}
            role="status"
            aria-live="polite"
        >
            <span className="toast-icon">{icon}</span>
            <span>{activeToast.message}</span>
        </div>
    );
}
