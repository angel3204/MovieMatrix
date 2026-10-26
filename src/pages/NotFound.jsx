import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <section
            className="not-found-page"
            style={{
                minHeight: '75vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 4%',
                textAlign: 'center'
            }}
        >
            <div
                className="not-found-card"
                style={{
                    maxWidth: '560px',
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '48px 32px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Ambient glow in background */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'var(--accent-color)',
                        opacity: 0.15,
                        filter: 'blur(50px)',
                        pointerEvents: 'none'
                    }}
                />

                <div
                    className="not-found-code"
                    style={{
                        fontSize: 'clamp(5rem, 12vw, 7.5rem)',
                        fontWeight: 900,
                        lineHeight: 1,
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '10px',
                        letterSpacing: '2px'
                    }}
                >
                    404
                </div>

                <h1
                    style={{
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '14px'
                    }}
                >
                    Page Not Found
                </h1>

                <p
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        marginBottom: '32px'
                    }}
                >
                    The reality simulation you are trying to access does not exist in the Movie Matrix.
                </p>

                <Link
                    to="/"
                    className="primary-btn"
                    style={{
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 28px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: '30px'
                    }}
                >
                    <span>🏠</span> <span>Back to Home</span>
                </Link>
            </div>
        </section>
    );
}
