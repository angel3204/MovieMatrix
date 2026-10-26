import React from 'react';

export default function MovieSkeleton({ count = 8 }) {
    const items = Array.from({ length: count });

    return (
        <div className="search-grid" aria-label="Loading movies skeleton" style={{ opacity: 0.85 }}>
            {items.map((_, idx) => (
                <div
                    key={idx}
                    className="movie-card skeleton-card"
                    style={{
                        height: '320px',
                        borderRadius: '12px',
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeletonShimmer 1.5s infinite linear',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '16px'
                    }}
                >
                    <div style={{ height: '18px', width: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ height: '12px', width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                </div>
            ))}
        </div>
    );
}
