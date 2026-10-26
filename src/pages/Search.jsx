import React, { useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectFilteredMedia,
    selectSearchQuery,
    selectSearchStatus,
    setSearchQuery,
    fetchSearchThunk,
    resetFilters
} from '../store/movieSlice';
import useDebounce from '../hooks/useDebounce';
import MovieCard from '../components/MovieCard';
import FilterBar from '../components/FilterBar';
import MovieSkeleton from '../components/MovieSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { t } from '../data/translations';

export default function Search(props) {
    const context = useOutletContext() || {};
    const effectiveProps = { ...context, ...props };

    const {
        userRatings = {},
        onToggleList,
        onPlayTrailer,
        lang = "en"
    } = effectiveProps;

    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get('q') || "";

    const dispatch = useDispatch();
    const searchQuery = useSelector(selectSearchQuery);
    const filteredResults = useSelector(selectFilteredMedia);
    const { status: searchStatus, error: searchError } = useSelector(selectSearchStatus);

    // Debounce the search input by 500ms
    const debouncedQuery = useDebounce(searchQuery, 500);

    // Sync URL param with Redux store initially
    useEffect(() => {
        if (queryParam !== searchQuery) {
            dispatch(setSearchQuery(queryParam));
        }
    }, [queryParam, dispatch]);

    // Dispatch real API search when debounced query updates
    useEffect(() => {
        if (debouncedQuery.trim().length > 1) {
            dispatch(fetchSearchThunk({ query: debouncedQuery.trim() }));
        }
    }, [debouncedQuery, dispatch]);

    const handleSearchInputChange = (e) => {
        const val = e.target.value;
        dispatch(setSearchQuery(val));
        if (val.trim()) {
            setSearchParams({ q: val.trim() });
        } else {
            setSearchParams({});
        }
    };

    const handleClearSearch = () => {
        dispatch(setSearchQuery(""));
        setSearchParams({});
    };

    const handleResetAll = () => {
        dispatch(resetFilters());
        setSearchParams({});
    };

    const titleText = searchQuery
        ? `Results for "${searchQuery}" (${filteredResults.length})`
        : `Catalog Titles (${filteredResults.length})`;

    return (
        <section id="search-results-section" style={{ padding: '95px 4% 80px', minHeight: '75vh' }}>
            {/* Header & Search Bar Input */}
            <div className="search-results-header" style={{ marginBottom: '24px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                    <h2 className="section-heading" id="search-results-title">
                        {titleText}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Live debounced search powered by Movie Matrix API.
                    </p>
                </div>

                <div className="search-input-wrapper-container" style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '30px',
                            padding: '4px 16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem', marginRight: '8px', opacity: 0.7 }}>🔍</span>
                        <input
                            type="text"
                            className="react-search-input"
                            style={{
                                width: '100%',
                                padding: '10px 0',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                            placeholder={t("searchPlaceholder", lang)}
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            aria-label="Search movies and TV shows"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '4px 8px'
                                }}
                                title="Clear search"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reusable FilterBar with Dropdowns for Media, Genre, Year, Rating, Sort */}
            <FilterBar showMediaType={true} />

            {/* Async Searching Skeleton */}
            {searchStatus === 'loading' && (
                <div style={{ padding: '20px 0' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                        Searching title database...
                    </p>
                    <MovieSkeleton count={8} />
                </div>
            )}

            {/* API Search Error State */}
            {searchStatus === 'failed' && (
                <ErrorMessage
                    message={searchError || "Unable to complete search query."}
                    onRetry={() => dispatch(fetchSearchThunk({ query: debouncedQuery.trim() }))}
                />
            )}

            {/* Results Grid or Empty State */}
            {searchStatus !== 'loading' && filteredResults.length === 0 ? (
                <div className="empty-search-box" style={{ margin: '40px auto', textAlign: 'center' }}>
                    <div className="empty-search-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-primary)' }}>NO TITLES FOUND</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                        No movies or shows matched your query or filter criteria. Try searching for another keyword or resetting the active filters.
                    </p>
                    <button
                        className="primary-btn clear-filters-btn"
                        type="button"
                        onClick={handleResetAll}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>↺</span> <span>Reset All Filters</span>
                    </button>
                </div>
            ) : (
                <div className="search-grid" id="search-grid">
                    {filteredResults.map(item => (
                        <MovieCard
                            key={item.id}
                            movie={item}
                            searchQuery={searchQuery}
                            userRating={userRatings ? userRatings[item.id] : null}
                            onToggleList={onToggleList}
                            onPlayTrailer={onPlayTrailer}
                            lang={lang}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
