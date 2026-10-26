import React from 'react';

export default function Input({
    label,
    id,
    name,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    required = false,
    disabled = false,
    autoComplete,
    error = '',
    endAdornment = null,
    className = '',
    wrapperClassName = '',
    ...rest
}) {
    const inputElement = (
        <input
            id={id}
            name={name || id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={className}
            style={error ? { borderColor: '#ef4444' } : undefined}
            {...rest}
        />
    );

    return (
        <div className={`form-group ${wrapperClassName}`} style={{ marginBottom: '18px' }}>
            {label && (
                <label htmlFor={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{label} {required && <span style={{ color: 'var(--accent-color)' }}>*</span>}</span>
                </label>
            )}

            {endAdornment ? (
                <div className="password-input-wrapper">
                    {inputElement}
                    {endAdornment}
                </div>
            ) : (
                inputElement
            )}

            {error && (
                <span className="field-error-text" style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                    {error}
                </span>
            )}
        </div>
    );
}
