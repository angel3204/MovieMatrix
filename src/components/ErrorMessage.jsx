import React from 'react';
import Button from './Button';

export default function ErrorMessage({
    title = 'Something went wrong.',
    message = 'We encountered an issue connecting to the movie database. Please try again.',
    onRetry,
    className = '',
    style = {}
}) {
    return (
        <div
            className={`api-error-box ${className}`.trim()}
            style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '16px',
                maxWidth: '560px',
                margin: '40px auto',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                ...style
            }}
            role="alert"
        >
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.9 }}>⚠️</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fca5a5', marginBottom: '8px' }}>
                {title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                {message}
            </p>
            {onRetry && (
                <Button
                    variant="primary"
                    onClick={onRetry}
                    style={{ margin: '0 auto', display: 'inline-flex', padding: '10px 24px' }}
                >
                    <span>↺</span> <span>Try Again</span>
                </Button>
            )}
        </div>
    );
}
