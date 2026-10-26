import React from 'react';

export default function Button({
    children,
    type = 'button',
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
    size = 'md',        // 'sm' | 'md' | 'lg'
    isLoading = false,
    loadingText = 'Loading...',
    disabled = false,
    onClick,
    icon = null,
    className = '',
    style = {},
    ...rest
}) {
    let baseClass = 'primary-btn';
    if (variant === 'secondary') baseClass = 'secondary-btn';
    if (variant === 'danger') baseClass = 'primary-btn btn-danger';
    if (variant === 'outline') baseClass = 'secondary-btn btn-outline';
    if (variant === 'ghost') baseClass = 'btn-ghost';

    const sizeStyles = size === 'sm'
        ? { padding: '6px 14px', fontSize: '0.85rem' }
        : size === 'lg'
        ? { padding: '14px 28px', fontSize: '1.05rem' }
        : {};

    const combinedStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || isLoading) ? 0.65 : 1,
        ...sizeStyles,
        ...style
    };

    return (
        <button
            type={type}
            className={`${baseClass} ${className}`.trim()}
            style={combinedStyle}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...rest}
        >
            {isLoading ? (
                <>
                    <span
                        className="btn-spinner"
                        style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#ffffff',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 0.8s linear infinite'
                        }}
                    />
                    <span>{loadingText || children}</span>
                </>
            ) : (
                <>
                    {icon && <span className="btn-icon">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
