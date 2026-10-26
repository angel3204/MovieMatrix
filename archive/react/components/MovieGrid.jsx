function MovieGrid({ movies, myList, userRatings, searchQuery, onToggleList, onSelectMovie }) {
    if (!movies || movies.length === 0) {
        return (
            <div className="empty-search-box" style={{ margin: '40px auto' }}>
                <div className="empty-search-icon">🔍</div>
                <h3>{typeof t === "function" ? t("noReactMatches") : "NO REACT MATCHES FOUND"}</h3>
                <p>{typeof t === "function" ? t("noReactMatchesDesc") : "No catalog titles matched your search query or selected filters."}</p>
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
                    userRating={userRatings && userRatings[movie.id]}
                    onToggleList={onToggleList}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </div>
    );
}

window.MovieGrid = MovieGrid;

