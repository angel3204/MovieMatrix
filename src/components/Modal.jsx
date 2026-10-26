import React, { useEffect, useCallback } from 'react';

export default function Modal({
    isOpen = false,
    onClose,
    title = '',
    children,
    size = 'md', // 'sm' | 'md' | 'lg' | 'video'
    contentClassName = '',
    ariaLabel = '',
    showCloseButton = true
}) {
    // Escape key listener to close modal
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && onClose) {
            e.stopPropagation();
            onClose();
        }
    }, [onClose]);

    // Prevent body scrolling while modal is open
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const maxWidth = size === 'sm'
        ? '440px'
        : size === 'lg'
        ? '960px'
        : size === 'video'
        ? '850px'
        : '640px';

    return (
        <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || (typeof title === 'string' ? title : 'Dialog')}
            style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {/* Backdrop overlay */}
            <div
                className="modal-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal content dialog */}
            <div
                className={`modal-content ${contentClassName}`.trim()}
                style={{ maxWidth, width: '92%' }}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        &times;
                    </button>
                )}

                {title && (
                    <div className="modal-header" style={{ padding: '20px 24px 12px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {title}
                        </h3>
                    </div>
                )}

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
