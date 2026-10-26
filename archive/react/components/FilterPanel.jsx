function FilterPanel({ selectedType, onTypeChange, selectedGenre, onGenreChange, availableGenres, totalCount }) {
    return (
        <div className="react-filter-panel">
            <div className="react-filter-group">
                <span className="react-filter-label">{typeof t === "function" ? t("filterType") : "Media Type"}:</span>
                <div className="react-type-tabs" role="tablist" aria-label="Filter media type">
                    <button
                        type="button"
                        className={`react-tab-btn ${selectedType === 'all' ? 'active' : ''}`}
                        onClick={() => onTypeChange('all')}
                        role="tab"
                        aria-selected={selectedType === 'all'}
                    >
                        {typeof t === "function" ? t("allTypes") : "All Types"}
                    </button>
                    <button
                        type="button"
                        className={`react-tab-btn ${selectedType === 'movie' ? 'active' : ''}`}
                        onClick={() => onTypeChange('movie')}
                        role="tab"
                        aria-selected={selectedType === 'movie'}
                    >
                        {typeof t === "function" ? t("navMovies") : "Movies"}
                    </button>
                    <button
                        type="button"
                        className={`react-tab-btn ${selectedType === 'tv' ? 'active' : ''}`}
                        onClick={() => onTypeChange('tv')}
                        role="tab"
                        aria-selected={selectedType === 'tv'}
                    >
                        {typeof t === "function" ? t("navTvShows") : "TV Shows"}
                    </button>
                </div>
            </div>

            <div className="react-filter-group">
                <label htmlFor="react-genre-select" className="react-filter-label">{typeof t === "function" ? t("filterGenre") : "Genre"}:</label>
                <select
                    id="react-genre-select"
                    className="react-select"
                    value={selectedGenre}
                    onChange={(e) => onGenreChange(e.target.value)}
                >
                    <option value="all">{typeof t === "function" ? t("allGenres") : "All Genres"}</option>
                    {availableGenres.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>

            <div className="react-count-badge">
                {typeof t === "function" ? t("showingCount") : "Showing"} <strong>{totalCount}</strong> {typeof t === "function" ? t("matchingTitles") : "titles"}
            </div>
        </div>
    );
}

window.FilterPanel = FilterPanel;

