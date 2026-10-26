import React from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';

export default function MovieReviews(props) {
    const { movieId } = useParams();
    const context = useOutletContext() || {};
    const movie = context.movie || null;

    const movieTitle = movie ? movie.title : movieId;

    return (
        <section
            className="movie-reviews-section"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        💬 Audience Reviews &amp; Discussion
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Displaying community reviews for <strong>{movieTitle}</strong> (<code style={{ color: 'var(--accent-color)' }}>ID: {movieId}</code>)
                    </p>
                </div>
                <Link
                    to={`/movie/${movieId}`}
                    className="secondary-btn"
                    style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                    Hide Reviews
                </Link>
            </div>

            {/* Placeholder Review Cards */}
            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                    className="review-card"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '18px 22px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                MM
                            </span>
                            <strong>MatrixFan99</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Streamer</span>
                        </div>
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐⭐⭐⭐⭐ 10/10</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
                        "Incredible visual effects and sound design! One of the best titles in the Movie Matrix catalogue. Keanu Reeves and Carrie-Anne Moss delivered an unforgettable performance."
                    </p>
                </div>

                <div
                    className="review-card"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '18px 22px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                CS
                            </span>
                            <strong>CyberScout</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top Reviewer</span>
                        </div>
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐⭐⭐⭐☆ 9/10</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
                        "Atmospheric cyberpunk storytelling with great pacing. The neon aesthetic matches the Cyber Neon theme perfectly!"
                    </p>
                </div>
            </div>

            <div
                style={{
                    marginTop: '24px',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px dashed var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                <span>
                    <strong>Nested Route Active:</strong> This is a nested view rendered via React Router's <code>&lt;Outlet /&gt;</code> under <code>/movie/{movieId}/reviews</code>. Full user review submissions and rating breakdown will be connected in future steps.
                </span>
            </div>
        </section>
    );
}
