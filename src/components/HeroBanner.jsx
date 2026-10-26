import React, { useState, useEffect, useRef } from 'react';
import { t } from '../data/translations';

export default function HeroBanner({
    currentTab = "home",
    catalogData = [],
    tabConfigs = {},
    myList = [],
    onToggleList,
    onSelectMovie,
    onPlayTrailer,
    onToast,
    lang = "en"
}) {
    const slideshowItems = React.useMemo(() => {
        return catalogData.filter(i =>
            ["matrix-awakens", "cyber-heist", "neon-skies", "stranger-code", "zero-gravity"].includes(i.id)
        );
    }, [catalogData]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [activeLayer, setActiveLayer] = useState("a");
    const [layerImages, setLayerImages] = useState({ a: '', b: '' });
    const [progressPct, setProgressPct] = useState(0);

    const canvasRef = useRef(null);
    const timerRef = useRef(null);
    const progressTimerRef = useRef(null);

    // Get current item based on tab
    const currentItem = React.useMemo(() => {
        if (currentTab === "home") {
            return slideshowItems[currentIndex] || catalogData[0];
        }
        const config = tabConfigs[currentTab];
        const itemId = config ? config.heroItemId : "matrix-awakens";
        return catalogData.find(i => i.id === itemId) || catalogData[0];
    }, [currentTab, currentIndex, slideshowItems, catalogData, tabConfigs]);

    // Badge text
    const badgeText = React.useMemo(() => {
        if (!currentItem) return "";
        if (currentTab === "home") {
            if (currentItem.id === "matrix-awakens") return t("trendingToday", lang);
            if (currentItem.id === "cyber-heist") return t("blockbusterCinema", lang);
            if (currentItem.id === "neon-skies") return t("popularTvSeries", lang);
            if (currentItem.id === "stranger-code") return t("newRelease", lang);
            return currentItem.type === "tv" ? t("featuredTv", lang) : t("featuredMovie", lang);
        }
        const config = tabConfigs[currentTab];
        if (config && config.heroBadgeKey) {
            return t(config.heroBadgeKey, lang);
        }
        return config ? config.heroBadge : "";
    }, [currentItem, currentTab, tabConfigs, lang]);

    // Handle background layer swap
    useEffect(() => {
        if (!currentItem) return;
        const bgUrl = currentItem.bgImage || currentItem.thumb || '/assets/matrix_awakens.jpg';

        if (activeLayer === "a") {
            setLayerImages(prev => ({ ...prev, b: bgUrl }));
            setActiveLayer("b");
        } else {
            setLayerImages(prev => ({ ...prev, a: bgUrl }));
            setActiveLayer("a");
        }
    }, [currentItem]);

    // Slideshow automation for Home tab
    useEffect(() => {
        if (currentTab !== "home" || !isPlaying || slideshowItems.length === 0) {
            clearInterval(progressTimerRef.current);
            clearTimeout(timerRef.current);
            setProgressPct(0);
            return;
        }

        const duration = (slideshowItems[currentIndex] && slideshowItems[currentIndex].displayTime) || 7000;
        const startTime = Date.now();

        clearInterval(progressTimerRef.current);
        progressTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, (elapsed / duration) * 100);
            setProgressPct(pct);
            if (pct >= 100) {
                clearInterval(progressTimerRef.current);
            }
        }, 50);

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % slideshowItems.length);
        }, duration);

        return () => {
            clearInterval(progressTimerRef.current);
            clearTimeout(timerRef.current);
        };
    }, [currentTab, currentIndex, isPlaying, slideshowItems]);

    // Particle canvas matrix animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.parentElement) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let width = (canvas.width = canvas.parentElement.clientWidth);
        let height = (canvas.height = canvas.parentElement.clientHeight);

        const handleResize = () => {
            if (!canvas.parentElement) return;
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight;
        };
        window.addEventListener("resize", handleResize);

        const numParticles = 40;
        const particles = [];
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                speedY: -(Math.random() * 0.7 + 0.3),
                speedX: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.2,
                char: Math.random() > 0.5
                    ? String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
                    : Math.floor(Math.random() * 10).toString()
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const themeAccent = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#38bdf8';

            particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = themeAccent;
                ctx.shadowBlur = 8;
                ctx.shadowColor = themeAccent;

                if (Math.random() > 0.75) {
                    ctx.font = '11px monospace';
                    ctx.fillText(p.char, p.x, p.y);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const toggleSlideshow = () => {
        setIsPlaying(prev => {
            const next = !prev;
            if (onToast) {
                onToast(next ? t("slideshowResumed", lang) : t("slideshowPaused", lang), "info");
            }
            return next;
        });
    };

    const nextSlide = () => {
        if (slideshowItems.length === 0) return;
        setCurrentIndex(prev => (prev + 1) % slideshowItems.length);
    };

    const prevSlide = () => {
        if (slideshowItems.length === 0) return;
        setCurrentIndex(prev => (prev - 1 + slideshowItems.length) % slideshowItems.length);
    };

    if (!currentItem) return null;

    const isInList = myList.includes(currentItem.id);
    const genresFormatted = currentItem.genre
        ? currentItem.genre.split(", ").join(" • ")
        : "Sci-Fi • Action";

    const [justAdded, setJustAdded] = useState(false);

    const handleMyListClick = () => {
        if (!currentItem) return;
        const willBeAdded = !isInList;
        if (onToggleList) {
            onToggleList(currentItem.id);
        }

        if (willBeAdded) {
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
            if (onToast) onToast(`✓ ${t("addedToMyListMsg", lang)}`, 'success');
        } else {
            setJustAdded(false);
            if (onToast) onToast(`✓ ${t("removedFromMyListMsg", lang)}`, 'warning');
        }
    };

    return (
        <header
            className="hero"
            id="hero-banner"
            onMouseEnter={() => {
                if (currentTab === "home" && isPlaying) {
                    clearInterval(progressTimerRef.current);
                    clearTimeout(timerRef.current);
                }
            }}
            onMouseLeave={() => {
                if (currentTab === "home" && isPlaying) {
                    setCurrentIndex(prev => prev);
                }
            }}
        >
            <div className="hero-bg-wrapper">
                <div
                    className={`hero-bg-layer layer-a ${activeLayer === "a" ? "active" : ""}`}
                    id="hero-bg-a"
                    style={{ backgroundImage: layerImages.a ? `url('${layerImages.a}')` : undefined }}
                />
                <div
                    className={`hero-bg-layer layer-b ${activeLayer === "b" ? "active" : ""}`}
                    id="hero-bg-b"
                    style={{ backgroundImage: layerImages.b ? `url('${layerImages.b}')` : undefined }}
                />
            </div>

            <canvas id="hero-particles-canvas" ref={canvasRef} className="hero-canvas" />

            <div className="hero-overlay" />

            {currentTab === "home" && (
                <>
                    <button
                        className="carousel-arrow prev-arrow"
                        id="hero-prev-btn"
                        aria-label="Previous Slide"
                        onClick={prevSlide}
                    >
                        ‹
                    </button>
                    <button
                        className="carousel-arrow next-arrow"
                        id="hero-next-btn"
                        aria-label="Next Slide"
                        onClick={nextSlide}
                    >
                        ›
                    </button>
                </>
            )}

            <div className="hero-content" id="hero-content" key={currentItem.id}>
                <div className="hero-badge" id="hero-badge">{badgeText}</div>
                <h2 className="hero-title" id="hero-title">{currentItem.title}</h2>
                <div className="hero-meta" id="hero-meta">
                    <span className="match-score">{currentItem.match}</span>
                    <span className="meta-dot">•</span>
                    <span className="meta-year">{currentItem.year}</span>
                    <span className="meta-dot">•</span>
                    <span className="meta-rating">{currentItem.rating}</span>
                    <span className="meta-dot">•</span>
                    <span className="meta-duration">{currentItem.duration}</span>
                    <span className="meta-type-badge">{currentItem.type.toUpperCase()}</span>
                </div>
                <div className="hero-genres" id="hero-genres">{genresFormatted}</div>
                <p className="hero-description" id="hero-description">
                    {currentItem.description}
                </p>
                <div className="hero-buttons">
                    <button
                        className="play-btn"
                        id="hero-play-btn"
                        type="button"
                        onClick={() => onPlayTrailer && onPlayTrailer(currentItem)}
                    >
                        ▶ {t("watchTrailer", lang)}
                    </button>
                    <button
                        className="info-btn"
                        id="hero-info-btn"
                        type="button"
                        onClick={() => onSelectMovie && onSelectMovie(currentItem)}
                    >
                        ⓘ <span>{t("moreInfo", lang)}</span>
                    </button>
                    <button
                        className={`mylist-btn ${isInList || justAdded ? 'added' : ''}`}
                        id="hero-mylist-btn"
                        type="button"
                        onClick={handleMyListClick}
                    >
                        {justAdded ? `✓ Added` : isInList ? `✓ ${t("inMyList", lang)}` : `＋ ${t("addToMyList", lang)}`}
                    </button>
                </div>
            </div>

            <div
                className="hero-scroll-indicator"
                id="hero-scroll-indicator"
                onClick={() => {
                    const el = document.getElementById("main-content");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <span className="scroll-text">EXPLORE TITLES</span>
                <div className="scroll-arrow-icon" />
            </div>

            {currentTab === "home" && (
                <div className="hero-carousel-controls">
                    <button
                        className="slideshow-toggle-btn"
                        id="slideshow-toggle-btn"
                        title="Pause/Play Slideshow"
                        onClick={toggleSlideshow}
                    >
                        <span id="slideshow-icon">{isPlaying ? "⏸" : "▶"}</span>
                    </button>
                    <div className="hero-dots" id="hero-dots-container">
                        {slideshowItems.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`hero-dot ${idx === currentIndex ? "active" : ""}`}
                                title={item.title}
                                onClick={() => setCurrentIndex(idx)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {currentTab === "home" && (
                <div className="carousel-progress-bar">
                    <div
                        className="progress-fill"
                        id="carousel-progress-fill"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            )}
        </header>
    );
}
