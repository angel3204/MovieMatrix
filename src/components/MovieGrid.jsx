import React from 'react';
import MovieCard from './MovieCard';
import { t } from '../data/translations';

export default function MovieGrid({
    movies = [],
    myList = [],
    userRatings = {},
    searchQuery = "",
    onToggleList,
    onSelectMovie,
    onPlayTrailer,
    lang = "en",
    emptyTitle,
    emptyDesc
}) {
    if (!movies || movies.length === 0) {
        return (
            <div className="empty-search-box" style={{ margin: '40px auto' }}>
                <div className="empty-search-icon">🔍</div>
                <h3>{emptyTitle || t("noReactMatches", lang)}</h3>
                <p>{emptyDesc || t("noReactMatchesDesc", lang)}</p>
            </div>
        );
    }

    return (
        <div className="search-grid">
            {movies.map((movie) => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    searchQuery={searchQuery}
                    isInList={myList.includes(movie.id)}
                    userRating={userRatings ? userRatings[movie.id] : null}
                    onToggleList={onToggleList}
                    onSelectMovie={onSelectMovie}
                    onPlayTrailer={onPlayTrailer}
                    lang={lang}
                />
            ))}
        </div>
    );
}
