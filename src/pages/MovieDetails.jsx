import React, { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectAllMedia,
    selectMyList,
    toggleMyList,
    fetchMovieDetailsThunk,
    selectSelectedMovie,
    selectDetailsStatus
} from '../store/movieSlice';
import { showToast } from '../store/uiSlice';
import { t } from '../data/translations';
import Tabs from '../components/Tabs';
import ErrorMessage from '../components/ErrorMessage';
import MovieReviews from './MovieReviews';

export default function MovieDetails(props) {
    const { movieId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const context = useOutletContext() || {};
    const effectiveProps = { ...context, ...props };

    const {
        catalogData: propCatalog = [],
        userRatings = {},
        onSetRating,
        onPlayTrailer,
        lang = "en"
    } = effectiveProps;

    const reduxMedia = useSelector(selectAllMedia);
    const reduxMyList = useSelector(selectMyList);
    const apiSelectedMovie = useSelector(selectSelectedMovie);
    const { status: detailsStatus, error: detailsError } = useSelector(selectDetailsStatus);

    // Check catalog fallback first, or API selected movie
    const localMovie = (reduxMedia.length > 0 ? reduxMedia : propCatalog).find(item => String(item.id) === String(movieId));
    const movie = (apiSelectedMovie && String(apiSelectedMovie.id) === String(movieId)) ? apiSelectedMovie : localMovie;

    const [hoveredScore, setHoveredScore] = useState(null);
    const [justAdded, setJustAdded] = useState(false);

    const isReviews = location.pathname.endsWith('/reviews');
    const isCast = location.pathname.endsWith('/cast');
    const [activeTab, setActiveTab] = useState(() => {
        if (isReviews) return 'reviews';
        if (isCast) return 'cast';
        return 'overview';
    });

    // Fetch movie details from API when movieId changes
    useEffect(() => {
        if (movieId) {
            dispatch(fetchMovieDetailsThunk({ movieId }));
        }
    }, [movieId, dispatch]);

    // Synchronize active tab with URL route changes
    useEffect(() => {
        if (location.pathname.endsWith('/reviews')) {
            setActiveTab('reviews');
        } else if (location.pathname.endsWith('/cast')) {
            setActiveTab('cast');
        } else {
            setActiveTab(prev => (prev === 'reviews' || prev === 'cast' ? 'overview' : prev));
        }
    }, [location.pathname]);

    // Loading State
    if (detailsStatus === 'loading' && !movie) {
        return (
            <div style={{ padding: '100px 4%', textAlign: 'center', minHeight: '60vh' }}>
                <div className="loader-progress-ring" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}>
                    <div className="loader-bar-fill"></div>
                </div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem' }}>
                    Loading movie details...
                </h2>
            </div>
        );
    }

    // Error State
    if (detailsStatus === 'failed' && !movie) {
        return (
            <div style={{ padding: '80px 4%' }}>
                <ErrorMessage
                    title="Movie Not Found"
                    message={detailsError || `Could not find title with ID "${movieId}".`}
                    onRetry={() => dispatch(fetchMovieDetailsThunk({ movieId }))}
                />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-not-found" style={{ padding: '100px 4%', textAlign: 'center', minHeight: '60vh' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎬</div>
                <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                    Title Not Found
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    No movie or TV show with ID <code style={{ color: 'var(--accent-color)' }}>{movieId}</code> exists in the catalog.
                </p>
                <Link to="/movies" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    ← Back to Movies
                </Link>
            </div>
        );
    }

    const isInList = reduxMyList.includes(movie.id);
    const currentScore = (userRatings && userRatings[movie.id] !== undefined && userRatings[movie.id] !== null)
        ? userRatings[movie.id]
        : null;
    const displayedScore = hoveredScore !== null ? hoveredScore : currentScore;

    const handleToggleWatchlist = () => {
        dispatch(toggleMyList(movie.id));
        if (isInList) {
            setJustAdded(false);
            dispatch(showToast({ message: `✓ ${t("removedFromMyListMsg", lang)}`, type: 'warning' }));
        } else {
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
            dispatch(showToast({ message: `✓ ${t("addedToMyListMsg", lang)}`, type: 'success' }));
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'reviews') {
            navigate(`/movie/${movieId}/reviews`, { replace: true });
        } else if (tabId === 'cast') {
            navigate(`/movie/${movieId}/cast`, { replace: true });
        } else {
            navigate(`/movie/${movieId}`, { replace: true });
        }
    };

    const tabsConfig = [
        { id: 'overview', label: 'Overview', icon: '📖' },
        { id: 'cast', label: 'Cast & Crew', icon: '🎭' },
        { id: 'reviews', label: 'Reviews', icon: '💬', badge: 'Community' }
    ];

    const castMembers = (movie.cast || '').split(',').map(name => name.trim()).filter(Boolean);

    return (
        <div className="page-movie-details" style={{ paddingBottom: '80px' }}>
            {/* Cinematic Backdrop Banner */}
            <div
                className="details-backdrop-header"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '420px',
                    backgroundImage: `linear-gradient(180deg, rgba(7,8,10,0.3) 0%, rgba(7,8,10,0.95) 100%), url('${movie.bgImage || movie.thumb}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '0 4% 40px'
                }}
            >
                <div className="details-header-brand" style={{ maxWidth: '800px' }}>
                    <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'var(--accent-gradient)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>
                        {movie.type ? movie.type.toUpperCase() : 'MOVIE'}
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.8)', margin: 0 }}>
                        {movie.title}
                    </h1>
                </div>
            </div>

            {/* Main Content Details Container */}
            <div className="details-container" style={{ maxWidth: '1200px', margin: '-30px auto 0', padding: '0 4%', position: 'relative', zIndex: 5 }}>
                <div className="details-layout-container" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                    <div className="details-poster-col">
                        <img
                            src={movie.thumb}
                            alt={movie.title}
                            className="details-poster-img"
                            style={{ borderRadius: '12px', width: '100%', maxWidth: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/matrix_awakens.jpg';
                            }}
                        />
                    </div>

                    <div className="details-info-col" style={{ flex: 1, minWidth: '300px' }}>
                        <div className="details-header-row">
                            <h2 className="details-title">{movie.title}</h2>
                            <span className="meta-type-badge">{movie.type ? movie.type.toUpperCase() : 'MOVIE'}</span>
                        </div>

                        <div className="details-meta-row" style={{ margin: '14px 0 20px', flexWrap: 'wrap', gap: '10px' }}>
                            <span className="modal-default-rating-tag">⭐ {movie.defaultRating || '8.5'}/10</span>
                            <span className="match-score">{movie.match}</span>
                            <span className="meta-year">{movie.year}</span>
                            <span className="meta-rating">{movie.rating}</span>
                            <span className="meta-duration">{movie.duration}</span>
                        </div>

                        {/* Reusable Tabs Component */}
                        <Tabs
                            tabs={tabsConfig}
                            activeTab={activeTab}
                            onChange={handleTabChange}
                        />

                        {/* Tab Content 1: Overview */}
                        {activeTab === 'overview' && (
                            <div id="tabpanel-overview" role="tabpanel" aria-labelledby="tab-btn-overview">
                                <div className="details-extra-grid" style={{ marginBottom: '18px' }}>
                                    <div><strong>{t("genreLabel", lang)}:</strong> <span>{movie.genre}</span></div>
                                    <div><strong>{t("castLabel", lang)}:</strong> <span>{movie.cast}</span></div>
                                </div>

                                <p className="details-description" style={{ fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '24px' }}>
                                    {movie.description}
                                </p>

                                {/* Interactive Star Rating Widget */}
                                <div id="details-user-rating-box" className="modal-user-rating-box" style={{ marginBottom: '24px' }}>
                                    <div className="rating-box-header">
                                        <span className="rating-box-title">
                                            <span>⭐</span> {t("yourRating", lang)}
                                        </span>
                                        <span id="modal-rating-score-display" className="rating-score-display">
                                            {displayedScore !== null && displayedScore !== undefined ? `★ ${displayedScore}/10` : 'Not rated yet'}
                                        </span>
                                    </div>
                                    <div
                                        id="modal-star-widget"
                                        className="star-rating-widget"
                                        role="radiogroup"
                                        aria-label={`Rate ${movie.title} from 1 to 10`}
                                    >
                                        {[1, 2, 3, 4, 5].map(starIndex => {
                                            const scoreValue = starIndex * 2;
                                            const isFilled = displayedScore !== null && displayedScore >= scoreValue;
                                            return (
                                                <button
                                                    key={starIndex}
                                                    type="button"
                                                    className={`star-btn ${isFilled ? 'active' : ''} ${hoveredScore !== null && hoveredScore >= scoreValue ? 'hovered' : ''}`}
                                                    data-score={scoreValue}
                                                    data-star={starIndex}
                                                    aria-label={`Rate ${scoreValue} out of 10 for ${movie.title}`}
                                                    title={`Rate ${scoreValue}/10`}
                                                    onMouseEnter={() => setHoveredScore(scoreValue)}
                                                    onMouseLeave={() => setHoveredScore(null)}
                                                    onClick={() => {
                                                        if (onSetRating) onSetRating(movie.id, scoreValue);
                                                        dispatch(showToast({ message: `✓ ${t("yourRating", lang)}: ${scoreValue}/10`, type: 'success' }));
                                                    }}
                                                >
                                                    {isFilled ? '★' : '☆'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content 2: Cast & Crew */}
                        {activeTab === 'cast' && (
                            <div id="tabpanel-cast" role="tabpanel" aria-labelledby="tab-btn-cast" style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-primary)' }}>
                                    Key Performers & Production
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                                    {castMembers.map((actor, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '10px',
                                                padding: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.8rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', padding: '6px' }}>
                                                👤
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{actor}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lead Cast</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '0.88rem' }}>
                                    <strong>Release:</strong> {movie.year} &nbsp;•&nbsp; <strong>Duration:</strong> {movie.duration} &nbsp;•&nbsp; <strong>Genres:</strong> {movie.genre}
                                </div>
                            </div>
                        )}

                        {/* Tab Content 3: Reviews */}
                        {activeTab === 'reviews' && (
                            <div id="tabpanel-reviews" role="tabpanel" aria-labelledby="tab-btn-reviews" style={{ marginBottom: '24px' }}>
                                <MovieReviews movie={movie} movieId={movieId} lang={lang} userRatings={userRatings} onSetRating={onSetRating} />
                            </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="details-actions-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                            <button
                                id="movie-details-play-trailer-btn"
                                className="primary-btn watch-trailer-btn"
                                type="button"
                                onClick={() => onPlayTrailer && onPlayTrailer(movie)}
                            >
                                <span>▶</span> <span>{t("watchTrailer", lang)}</span>
                            </button>

                            <button
                                className={`mylist-btn ${isInList || justAdded ? 'added' : ''}`}
                                type="button"
                                onClick={handleToggleWatchlist}
                            >
                                <span>{justAdded ? '✓' : isInList ? '✓' : '＋'}</span>{' '}
                                <span>{justAdded ? 'Added' : isInList ? t("inMyList", lang) : t("addToMyList", lang)}</span>
                            </button>

                            <Link
                                to="/movies"
                                className="secondary-btn"
                                style={{ textDecoration: 'none', borderRadius: '30px', padding: '12px 20px', display: 'inline-flex', alignItems: 'center' }}
                            >
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Nested Outlet for nested route review compatibility */}
                {location.pathname.endsWith('/reviews') && activeTab !== 'reviews' && (
                    <div className="movie-details-nested-content" style={{ marginTop: '30px' }}>
                        <Outlet context={{ movie, movieId, ...effectiveProps }} />
                    </div>
                )}
            </div>
        </div>
    );
}
