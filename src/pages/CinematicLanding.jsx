import React, { useState, useEffect, useRef } from 'react';
import { t } from '../data/translations';
import Footer from '../layouts/Footer';

export default function CinematicLanding({
    catalogData = [],
    onEnter,
    onExploreTrailers,
    onSignIn,
    lang = "en",
    onLangChange
}) {
    const [dismissing, setDismissing] = useState(false);
    const wallRef = useRef(null);

    const tileCount = 30;
    const rotations = [-14, 10, -6, 12, -10, 8, -4, 15, -8, 6, -12, 11, -5, 9, -15, 7, -9, 13, -11, 5, -7, 14, -13, 8];
    const scaleFactors = [0.92, 1.05, 0.88, 1.1, 0.95, 1.02, 0.9, 1.08, 0.94, 1.04, 0.89, 1.06];

    // Mouse parallax effect
    useEffect(() => {
        if (window.innerWidth <= 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        let isMoving = false;
        const handleMouseMove = (e) => {
            if (isMoving || !wallRef.current) return;
            isMoving = true;
            requestAnimationFrame(() => {
                if (wallRef.current) {
                    const moveX = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 20;
                    const moveY = ((e.clientY - window.innerHeight / 2) / window.innerHeight) * 20;
                    wallRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
                }
                isMoving = false;
            });
        };

        const handleMouseLeave = () => {
            if (wallRef.current) {
                wallRef.current.style.transform = `translate3d(0px, 0px, 0px)`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    const handleDismiss = (callback) => {
        if (dismissing) return;
        try {
            sessionStorage.setItem("movieMatrixIntroSeen", "true");
            document.documentElement.classList.add("intro-seen");
        } catch {}
        setDismissing(true);
        setTimeout(() => {
            if (callback) callback();
            if (onEnter) onEnter();
        }, 600);
    };

    return (
        <div
            id="cinematic-landing"
            className={`cinematic-landing ${dismissing ? 'dismissing' : ''}`}
            role="region"
            aria-label="Welcome to Movie Matrix"
            style={{ paddingTop: '90px' }}
        >
            <div className="cinematic-poster-wall" id="cinematic-poster-wall" ref={wallRef}>
                {Array.from({ length: tileCount }).map((_, i) => {
                    const item = catalogData.length > 0 ? catalogData[i % catalogData.length] : null;
                    const rot = rotations[i % rotations.length];
                    const sc = scaleFactors[i % scaleFactors.length];
                    const delay = (i * 0.03).toFixed(2);

                    return (
                        <div
                            key={i}
                            className="cinematic-poster-tile"
                            style={{
                                transform: `rotate(${rot}deg) scale(${sc})`,
                                animationDelay: `${delay}s`
                            }}
                        >
                            <img
                                src={item && item.thumb ? item.thumb : 'assets/matrix_awakens.jpg'}
                                alt={item ? item.title : 'Movie Poster'}
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'assets/matrix_awakens.jpg';
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="cinematic-overlay-dark"></div>
            <div className="cinematic-overlay-radial"></div>
            <div className="cinematic-overlay-vignette"></div>
            <div className="cinematic-grain"></div>

            <div className="cinematic-center-content">
                <div className="cinematic-hero-tagline" id="cinematic-tagline">
                    <span className="cinematic-tagline-dot"></span>
                    <span id="cinematic-tagline-text">{t("discoverTagline", lang)}</span>
                </div>
                <h2 className="cinematic-headline" id="cinematic-headline">
                    <span>{t("discoverHeadline1", lang)}</span><br />
                    <span className="cinematic-headline-gradient" id="cinematic-headline-accent">
                        {t("discoverHeadline2", lang)}
                    </span>
                </h2>
                <p className="cinematic-description" id="cinematic-description">
                    {t("discoverDesc", lang)}
                </p>
                <div className="cinematic-cta-group">
                    <button
                        className="cinematic-cta-btn primary"
                        id="enter-matrix-btn"
                        type="button"
                        onClick={() => handleDismiss()}
                    >
                        <span id="cinematic-cta-text">{t("enterMovieMatrix", lang)}</span>
                        <span className="cinematic-cta-icon">→</span>
                    </button>
                    <button
                        className="cinematic-cta-btn secondary"
                        id="cinematic-trailers-btn"
                        type="button"
                        onClick={() => {
                            handleDismiss(() => {
                                if (onExploreTrailers) onExploreTrailers();
                            });
                        }}
                    >
                        <span id="cinematic-trailers-text">{t("exploreTrailers", lang)}</span>
                    </button>
                </div>
            </div>

            <footer className="cinematic-footer">
                <div className="cinematic-quality-pills">
                    <span className="cinematic-pill">{t("qualityBadge", lang)}</span>
                    <span className="cinematic-pill">DOLBY ATMOS</span>
                    <span className="cinematic-pill">SPATIAL SOUND</span>
                </div>
            </footer>

            <Footer lang={lang} />
        </div>
    );
}
