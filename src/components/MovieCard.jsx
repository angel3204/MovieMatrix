import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectMyList, toggleMyList } from '../store/movieSlice';
import { showToast } from '../store/uiSlice';
import { t } from '../data/translations';

function highlightMatch(text, query) {
    if (!text) return "";
    const cleanQuery = query ? query.trim() : "";
    if (!cleanQuery) return text;

    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark key={index} className="search-highlight">
                {part}
            </mark>
        ) : (
            part
        )
    );
}

export default function MovieCard({
    movie,
    rankNumber = null,
    searchQuery = "",
    isInList: propIsInList = undefined,
    userRating = null,
    onToggleList,
    onSelectMovie,
    onPlayTrailer,
    lang = "en"
}) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const reduxMyList = useSelector(selectMyList);

    if (!movie) return null;

    const isInList = propIsInList !== undefined ? propIsInList : reduxMyList.includes(movie.id);

    let badgeElement = null;
    if (movie.isNew) {
        badgeElement = <span className="card-status-badge badge-new">{t("newBadge", lang)}</span>;
    } else if (movie.isPopular) {
        badgeElement = <span className="card-status-badge badge-trending">{t("trendingBadge", lang)}</span>;
    } else if (movie.defaultRating && movie.defaultRating >= 8.8) {
        badgeElement = <span className="card-status-badge badge-highly-rated">{t("highlyRated", lang)}</span>;
    } else if (movie.type === "tv") {
        badgeElement = <span className="card-status-badge badge-tv-season">{movie.duration || 'TV'}</span>;
    }

    const userRatingBadge = userRating ? (
        <span
            className="card-user-rating-badge"
            title={`${t("yourRating", lang)}: ${userRating}/10`}
        >
            ★ {userRating}/10
        </span>
    ) : null;

    const defaultRatingText = movie.defaultRating ? `⭐ ${movie.defaultRating}/10` : '⭐ 8.5/10';
    const addListTitle = t("addToMyList", lang);
    const removeListTitle = t("removeFromMyList", lang);
    const typeLabelText = movie.type === "tv" ? t("filterTvShow", lang) : t("filterMovie", lang);

    const formattedRank = rankNumber
        ? (rankNumber < 10 ? `0${rankNumber}` : `${rankNumber}`)
        : null;

    const handleCardClick = () => {
        if (onSelectMovie) {
            onSelectMovie(movie);
        } else {
            navigate(`/movie/${movie.id}`);
        }
    };

    const [justAdded, setJustAdded] = React.useState(false);

    const handleBookmarkClick = (e) => {
        e.stopPropagation();
        const willBeAdded = !isInList;
        dispatch(toggleMyList(movie.id));

        if (willBeAdded) {
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
            dispatch(showToast({ message: `✓ ${t("addedToMyListMsg", lang)}`, type: 'success' }));
        } else {
            setJustAdded(false);
            dispatch(showToast({ message: `✓ ${t("removedFromMyListMsg", lang)}`, type: 'warning' }));
        }
        if (onToggleList) onToggleList(movie.id);
    };

    return (
        <div
            className={`movie-card ${rankNumber ? 'top10-card' : ''}`}
            data-id={movie.id}
            onClick={handleCardClick}
            title={`View details for ${movie.title}`}
            style={{ cursor: 'pointer' }}
        >
            {formattedRank && (
                <div className="rank-number-wrapper" aria-hidden="true">
                    <span className="rank-number">{formattedRank}</span>
                </div>
            )}

            <div className="poster-container">
                <img
                    src={movie.thumb}
                    alt={movie.title}
                    className="poster"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/matrix_awakens.jpg';
                    }}
                />
                <div className="movie-card-overlay">
                    <div className="card-top-bar">
                        <div className="card-badges">
                            <span className="card-type-badge">{typeLabelText}</span>
                            {badgeElement}
                            {userRatingBadge}
                        </div>

                        <button
                            type="button"
                            className={`card-bookmark-btn ${isInList ? 'active' : ''} ${justAdded ? 'just-added' : ''}`}
                            onClick={handleBookmarkClick}
                            title={isInList ? removeListTitle : addListTitle}
                            aria-label={isInList ? removeListTitle : addListTitle}
                        >
                            {justAdded ? '✓' : isInList ? '✓' : '＋'}
                        </button>
                    </div>

                    <button
                        type="button"
                        className="play-center-btn"
                        title="Watch Trailer"
                        aria-label={`Watch trailer for ${movie.title}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onPlayTrailer) onPlayTrailer(movie);
                            else handleCardClick();
                        }}
                    >
                        <span className="play-icon">▶</span>
                        <span className="play-label">Trailer</span>
                    </button>

                    <div className="card-bottom-info">
                        <p className="card-title">
                            {highlightMatch(movie.title, searchQuery)}
                        </p>
                        <div className="card-sub-info">
                            <span className="card-default-rating">{defaultRatingText}</span>
                            <span className="card-year">{movie.year}</span>
                            <span className="meta-rating">{movie.rating}</span>
                            <span className="card-duration">{movie.duration}</span>
                        </div>
                        <div className="card-genre">{movie.genre}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
