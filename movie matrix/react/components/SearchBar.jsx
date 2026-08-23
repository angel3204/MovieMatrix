function SearchBar({ value, onChange, onClear }) {
    return (
        <div className="react-search-box">
            <span className="react-search-icon">🔍</span>
            <input
                type="text"
                className="react-search-input"
                placeholder={typeof t === "function" ? t("searchReactPlaceholder") : "Search titles, genres, actors in React..."}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label="Search titles in React sandbox"
            />
            {value && (
                <button
                    type="button"
                    className="react-clear-btn"
                    onClick={onClear}
                    aria-label="Clear search query"
                    title="Clear search"
                >
                    &times;
                </button>
            )}
        </div>
    );
}

window.SearchBar = SearchBar;

