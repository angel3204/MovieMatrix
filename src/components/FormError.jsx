import React from 'react';

export default function FormError({ message, className = '', style = {} }) {
    if (!message) return null;

    return (
        <div
            className={`auth-error-msg ${className}`}
            role="alert"
            style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', ...style }}
        >
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <span>{message}</span>
        </div>
    );
}
