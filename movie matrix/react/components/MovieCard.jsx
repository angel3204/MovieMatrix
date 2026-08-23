function MovieCard({ movie, searchQuery, isInList, userRating, onToggleList, onSelectMovie }) {
    let badgeHtml = null;
    if (movie.isNew) {
        badgeHtml = <span className="card-status-badge badge-new">{typeof t === "function" ? t("newBadge") : "NEW"}</span>;
    } else if (movie.isPopular) {
        badgeHtml = <span className="card-status-badge badge-trending">{typeof t === "function" ? t("trendingBadge") : "TRENDING"}</span>;
    } else if (movie.defaultRating && movie.defaultRating >= 8.8) {
        badgeHtml = <span className="card-status-badge badge-highly-rated">{typeof t === "function" ? t("highlyRated") : "HIGHLY RATED"}</span>;
    } else if (movie.type === "tv") {
        badgeHtml = <span className="card-status-badge badge-tv-season">{movie.duration || 'TV'}</span>;
    }

    const userRatingBadge = userRating ? (
        <span className="card-user-rating-badge" title={`${typeof t === "function" ? t("yourRating") : "Your Rating"}: ${userRating}/10`}>
            ★ {userRating}/10
        </span>
    ) : null;

    const defaultRatingText = movie.defaultRating ? `⭐ ${movie.defaultRating}/10` : '⭐ 8.5/10';

    const addListTitle = typeof t === "function" ? t("addToMyList") : "Add to My List";
    const removeListTitle = typeof t === "function" ? t("removeFromMyList") : "Remove from My List";

    return (
        <div
            className="movie-card"
            data-id={movie.id}
            onClick={() => onSelectMovie && onSelectMovie(movie)}
            title={`View details for ${movie.title}`}
        >
            <div className="poster-container">
                <img
                    src={movie.thumb}
                    alt={movie.title}
                    className="poster"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'assets/matrix_awakens.jpg'; }}
                />
                <div className="movie-card-overlay">
                    <div className="card-top-bar">
                        <div className="card-badges">
                            <span className="card-type-badge">{movie.type === "tv" ? (typeof t === "function" ? t("filterTvShow") : "TV") : (typeof t === "function" ? t("filterMovie") : "MOVIE")}</span>
                            {badgeHtml}
                            {userRatingBadge}
                        </div>

                        <button
                            type="button"
                            className={`card-bookmark-btn ${isInList ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleList(movie.id);
                            }}
                            title={isInList ? removeListTitle : addListTitle}
                            aria-label={isInList ? removeListTitle : addListTitle}
                        >
                            {isInList ? '✓' : '＋'}
                        </button>
                    </div>

                    <div className="play-center-btn" title="Play Trailer">▶</div>

                    <div className="card-bottom-info">
                        <p className="card-title" dangerouslySetInnerHTML={{ __html: typeof highlightMatch === "function" ? highlightMatch(movie.title, searchQuery) : movie.title }}></p>
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

window.MovieCard = MovieCard;

