import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MOOD_DEFINITIONS, getMoviesByMood } from '../services/movieApi';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { t } from '../data/translations';

const MOOD_KEYS = Object.keys(MOOD_DEFINITIONS);

export default function MoodMatcher({
    myList = [],
    userRatings = {},
    onToggleList,
    onPlayTrailer,
    onToast,
    lang = "en"
}) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read mood from search params if present
    const paramMood = searchParams.get('mood');
    const initialMood = paramMood && MOOD_DEFINITIONS[paramMood] ? paramMood : 'happy';

    const [selectedMood, setSelectedMood] = useState(initialMood);
    const [selectedVibe, setSelectedVibe] = useState('all');
    const [formatType, setFormatType] = useState('all'); // 'all' | 'movie' | 'tv'
    const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'popular' | 'gems' | 'newest'
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSurprising, setIsSurprising] = useState(false);

    // Sync with URL params
    useEffect(() => {
        if (paramMood && MOOD_DEFINITIONS[paramMood] && paramMood !== selectedMood) {
            setSelectedMood(paramMood);
            setSelectedVibe('all');
        }
    }, [paramMood]);

    // Update document title
    useEffect(() => {
        document.title = `Movie Matrix - ${t("navMood", lang)}`;
    }, [lang]);

    // Active mood definition
    const activeMood = useMemo(() => {
        return MOOD_DEFINITIONS[selectedMood] || MOOD_DEFINITIONS.happy;
    }, [selectedMood]);

    // Fetch movies according to selected mood and filters
    const loadMoodMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMoviesByMood({
                moodKey: selectedMood,
                subVibe: selectedVibe,
                type: formatType,
                sortBy: sortBy,
                lang: lang,
                page: 1
            });
            setMovies(data.results || []);
        } catch (err) {
            setError(err.message || "Failed to load mood recommendations.");
        } finally {
            setLoading(false);
        }
    }, [selectedMood, selectedVibe, formatType, sortBy, lang]);

    useEffect(() => {
        loadMoodMovies();
    }, [loadMoodMovies]);

    // Handle picking a mood
    const handleSelectMood = (moodKey) => {
        if (moodKey === selectedMood && selectedVibe === 'all') return;
        setSelectedMood(moodKey);
        setSelectedVibe('all');
        setSearchParams({ mood: moodKey });
        
        // Announce with toast
        const moodObj = MOOD_DEFINITIONS[moodKey];
        if (onToast && moodObj) {
            onToast(`${moodObj.emoji} Tuned to ${moodObj.name}`, "info");
        }
    };

    // Surprise Me action
    const handleSurpriseMe = () => {
        setIsSurprising(true);
        const otherMoods = MOOD_KEYS.filter(k => k !== selectedMood);
        const randomKey = otherMoods[Math.floor(Math.random() * otherMoods.length)] || 'excited';
        
        setTimeout(() => {
            setSelectedMood(randomKey);
            setSelectedVibe('all');
            setSearchParams({ mood: randomKey });
            setIsSurprising(false);
            const moodObj = MOOD_DEFINITIONS[randomKey];
            if (onToast && moodObj) {
                onToast(`🎲 Surprise vibe: ${moodObj.emoji} ${moodObj.name}!`, "success");
            }
        }, 300);
    };

    return (
        <div className="page-mood-matcher">
            {/* Hero Header */}
            <header className="mood-hero-section">
                <div className="mood-badge-pill">
                    <span>✨</span> {t("moodBadge", lang)}
                </div>
                <h1 className="mood-main-title">
                    {t("moodTitle", lang)}
                </h1>
                <p className="mood-main-subtitle">
                    {t("moodSubtitle", lang)}
                </p>

                <div className="mood-actions-bar">
                    <button
                        type="button"
                        className="mood-surprise-btn"
                        onClick={handleSurpriseMe}
                        disabled={isSurprising}
                    >
                        <span className="dice-icon">🎲</span>
                        <span>{t("moodSurpriseMe", lang)}</span>
                    </button>
                </div>
            </header>

            {/* Mood Cards Grid */}
            <section className="mood-grid-container" aria-label="Mood selection">
                <div className="mood-grid">
                    {MOOD_KEYS.map((key) => {
                        const mood = MOOD_DEFINITIONS[key];
                        const isSelected = selectedMood === key;
                        const translatedName = t(`mood_${key}`, lang) !== `mood_${key}` 
                            ? t(`mood_${key}`, lang) 
                            : mood.name;

                        return (
                            <div
                                key={key}
                                className={`mood-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectMood(key)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSelectMood(key);
                                    }
                                }}
                                style={{
                                    '--card-color': mood.color,
                                    '--card-glow': mood.gradient,
                                    '--card-glow-subtle': mood.color + '44'
                                }}
                            >
                                <div className="mood-card-header">
                                    <span className="mood-emoji-wrap">{mood.emoji}</span>
                                    {isSelected && (
                                        <div className="mood-selected-indicator" title="Active selection">
                                            ✓
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="mood-card-name">{translatedName}</h3>
                                    <p className="mood-card-tagline">{mood.tagline}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Active Mood Feature Banner */}
            <section
                className="active-mood-banner"
                style={{
                    background: activeMood.gradient,
                    borderColor: activeMood.color + '66'
                }}
            >
                <div
                    className="active-mood-banner-bg"
                    style={{ background: activeMood.color }}
                />
                <div className="active-mood-content">
                    <div className="active-mood-left">
                        <span className="active-mood-emoji">{activeMood.emoji}</span>
                        <div>
                            <h2 className="active-mood-title">
                                {t(`mood_${selectedMood}`, lang) !== `mood_${selectedMood}` 
                                    ? t(`mood_${selectedMood}`, lang) 
                                    : activeMood.name}
                            </h2>
                            <p className="active-mood-desc">
                                {activeMood.tagline}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                            {t("moodResultsFor", lang)}:
                        </span>
                        <span
                            style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: `1px solid ${activeMood.color}`,
                                color: '#ffffff',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 700
                            }}
                        >
                            {activeMood.emoji} {activeMood.name}
                        </span>
                    </div>
                </div>
            </section>

            {/* Filter & Tuning Controls */}
            <div className="mood-controls-wrapper">
                {/* Sub-vibes selector */}
                {activeMood.subVibes && activeMood.subVibes.length > 0 && (
                    <div className="mood-subvibes-row">
                        <span className="mood-filter-label">{t("moodRefineVibe", lang)}</span>
                        {activeMood.subVibes.map((vibe) => (
                            <button
                                key={vibe.id}
                                type="button"
                                className={`mood-vibe-pill ${selectedVibe === vibe.id ? 'active' : ''}`}
                                onClick={() => setSelectedVibe(vibe.id)}
                            >
                                {vibe.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Secondary controls: format & sorting */}
                <div className="mood-secondary-controls">
                    {/* Media Type Group */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="mood-filter-label">Format:</span>
                        <div className="mood-btn-group">
                            <button
                                type="button"
                                className={`mood-segment-btn ${formatType === 'all' ? 'active' : ''}`}
                                onClick={() => setFormatType('all')}
                            >
                                {t("moodFormatAll", lang)}
                            </button>
                            <button
                                type="button"
                                className={`mood-segment-btn ${formatType === 'movie' ? 'active' : ''}`}
                                onClick={() => setFormatType('movie')}
                            >
                                {t("moodFormatMovies", lang)}
                            </button>
                            <button
                                type="button"
                                className={`mood-segment-btn ${formatType === 'tv' ? 'active' : ''}`}
                                onClick={() => setFormatType('tv')}
                            >
                                {t("moodFormatTv", lang)}
                            </button>
                        </div>
                    </div>

                    {/* Sort Options Group */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="mood-filter-label">Sort:</span>
                        <div className="mood-btn-group">
                            <button
                                type="button"
                                className={`mood-segment-btn ${sortBy === 'rating' ? 'active' : ''}`}
                                onClick={() => setSortBy('rating')}
                            >
                                {t("moodSortTopRated", lang)}
                            </button>
                            <button
                                type="button"
                                className={`mood-segment-btn ${sortBy === 'popular' ? 'active' : ''}`}
                                onClick={() => setSortBy('popular')}
                            >
                                {t("moodSortPopular", lang)}
                            </button>
                            <button
                                type="button"
                                className={`mood-segment-btn ${sortBy === 'gems' ? 'active' : ''}`}
                                onClick={() => setSortBy('gems')}
                            >
                                {t("moodSortGems", lang)}
                            </button>
                            <button
                                type="button"
                                className={`mood-segment-btn ${sortBy === 'newest' ? 'active' : ''}`}
                                onClick={() => setSortBy('newest')}
                            >
                                {t("moodSortNewest", lang)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid Section */}
            <main className="mood-results-section">
                <div className="mood-results-header">
                    <div className="mood-results-count">
                        <span>🎬</span>
                        <span>
                            {loading ? t("moodLoading", lang) : `${movies.length} titles curated for your ${activeMood.name} mood`}
                        </span>
                    </div>

                    {!loading && movies.length > 0 && (
                        <button
                            type="button"
                            className="mood-reset-btn"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                        >
                            ↑ Choose Another Mood
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <MovieSkeleton count={8} />
                )}

                {/* Error State */}
                {!loading && error && (
                    <ErrorMessage
                        message={error}
                        onRetry={loadMoodMovies}
                    />
                )}

                {/* Empty State */}
                {!loading && !error && movies.length === 0 && (
                    <div className="empty-search-box" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <div className="empty-search-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎭</div>
                        <h3>{t("moodEmpty", lang)}</h3>
                        <p>{t("moodEmptyDesc", lang)}</p>
                        <button
                            type="button"
                            className="primary-btn"
                            style={{ marginTop: '20px' }}
                            onClick={() => {
                                setSelectedVibe('all');
                                setFormatType('all');
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Movies Grid */}
                {!loading && !error && movies.length > 0 && (
                    <div className="search-grid">
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                isInList={myList.includes(movie.id)}
                                userRating={userRatings ? userRatings[movie.id] : null}
                                onToggleList={onToggleList}
                                onPlayTrailer={onPlayTrailer}
                                onSelectMovie={(m) => navigate(`/movie/${m.id}`)}
                                lang={lang}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
