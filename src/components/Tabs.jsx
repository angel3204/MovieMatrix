import React from 'react';

export default function Tabs({
    tabs = [],
    activeTab,
    onChange,
    className = '',
    style = {}
}) {
    if (!tabs || tabs.length === 0) return null;

    return (
        <div
            className={`tabs-navigation-wrapper ${className}`.trim()}
            role="tablist"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '2px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '2px',
                marginBottom: '24px',
                overflowX: 'auto',
                ...style
            }}
        >
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        id={`tab-btn-${tab.id}`}
                        aria-controls={`tabpanel-${tab.id}`}
                        onClick={() => onChange && onChange(tab.id)}
                        className={`movie-tab-btn ${isActive ? 'active' : ''}`}
                        style={{
                            background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            border: 'none',
                            borderBottom: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
                            borderRadius: '8px 8px 0 0',
                            padding: '12px 20px',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge !== null && (
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: isActive ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.15)',
                                    color: '#fff',
                                    fontWeight: 700
                                }}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
