import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function Dropdown({
    label = '',
    id,
    options = [],
    value,
    onChange,
    placeholder = 'Select...',
    icon = null,
    className = '',
    style = {}
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                const currentIndex = options.findIndex(opt => String(opt.value) === String(value));
                setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
            }
            return;
        }

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % options.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (highlightedIndex >= 0 && options[highlightedIndex]) {
                    onChange && onChange(options[highlightedIndex].value);
                    setIsOpen(false);
                }
                break;
            default:
                break;
        }
    }, [isOpen, highlightedIndex, options, value, onChange]);

    return (
        <div
            className={`movie-matrix-dropdown ${className}`.trim()}
            ref={dropdownRef}
            style={{
                position: 'relative',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '160px',
                zIndex: isOpen ? 100 : 1,
                ...style
            }}
        >
            {label && (
                <label
                    htmlFor={id}
                    style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                >
                    {label}
                </label>
            )}

            <button
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(prev => !prev);
                }}
                onKeyDown={handleKeyDown}
                style={{
                    background: 'var(--bg-secondary)',
                    border: isOpen ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 12px var(--accent-glow)' : 'none',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                }}
            >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {icon && <span style={{ opacity: 0.85 }}>{icon}</span>}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </span>
                <span style={{ fontSize: '0.75rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', opacity: 0.7 }}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <ul
                    role="listbox"
                    aria-activedescendant={highlightedIndex >= 0 ? `option-${id}-${highlightedIndex}` : undefined}
                    tabIndex={-1}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        minWidth: '100%',
                        width: 'max-content',
                        maxWidth: '280px',
                        zIndex: 1000,
                        backgroundColor: '#121620',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '6px',
                        margin: 0,
                        listStyle: 'none',
                        maxHeight: '280px',
                        overflowY: 'auto',
                        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.95), 0 0 1px rgba(255, 255, 255, 0.2)',
                        animation: 'fadeIn 0.15s ease'
                    }}
                >
                    {options.map((option, index) => {
                        const isSelected = String(option.value) === String(value);
                        const isHighlighted = index === highlightedIndex;

                        return (
                            <li
                                key={option.value}
                                id={`option-${id}-${index}`}
                                role="option"
                                aria-selected={isSelected}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange && onChange(option.value);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                style={{
                                    padding: '9px 14px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.88rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                                    background: isSelected
                                        ? 'var(--accent-gradient)'
                                        : isHighlighted
                                        ? 'rgba(255, 255, 255, 0.08)'
                                        : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    whiteSpace: 'nowrap',
                                    transition: 'background 0.15s ease'
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    {option.icon && <span>{option.icon}</span>}
                                    <span>{option.label}</span>
                                </span>
                                {isSelected && <span style={{ fontSize: '0.85rem' }}>✓</span>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
