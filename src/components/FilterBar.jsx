import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectFilters,
    selectSortOption,
    setMediaType,
    setGenreFilter,
    setYearFilter,
    setRatingFilter,
    setSortOption,
    resetFilters
} from '../store/movieSlice';
import Dropdown from './Dropdown';

const mediaTypeOptions = [
    { value: 'all', label: 'All Media', icon: '🎬' },
    { value: 'movie', label: 'Movies', icon: '🎥' },
    { value: 'tv', label: 'TV Shows', icon: '📺' }
];

const genreOptions = [
    { value: 'all', label: 'All Genres' },
    { value: 'action', label: 'Action' },
    { value: 'animation', label: 'Animation' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'crime', label: 'Crime' },
    { value: 'adventure', label: 'Adventure' }
];

const yearOptions = [
    { value: 'all', label: 'All Years' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' }
];

const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '9', label: '9.0+ ★ Exceptional' },
    { value: '8.5', label: '8.5+ ★ High Praise' },
    { value: '8', label: '8.0+ ★ Very Good' },
    { value: '7.5', label: '7.5+ ★ Good' }
];

const sortOptions = [
    { value: 'default', label: 'Featured / Default' },
    { value: 'rating-desc', label: 'Highest Rated ★' },
    { value: 'year-desc', label: 'Newest Release' },
    { value: 'year-asc', label: 'Oldest Release' },
    { value: 'title-asc', label: 'Title (A-Z)' }
];

export default function FilterBar({ showMediaType = true, className = '', style = {} }) {
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);
    const sortOption = useSelector(selectSortOption);

    const hasActiveFilters =
        (showMediaType && filters.mediaType !== 'all') ||
        filters.genre !== 'all' ||
        filters.year !== 'all' ||
        filters.rating !== 'all' ||
        sortOption !== 'default';

    return (
        <div
            className={`movie-matrix-filter-bar ${className}`.trim()}
            style={{
                position: 'relative',
                zIndex: 60,
                background: 'rgba(20, 24, 33, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '18px 22px',
                marginBottom: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                ...style
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: '14px',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                    {showMediaType && (
                        <Dropdown
                            id="filter-media-type"
                            label="Media Type"
                            options={mediaTypeOptions}
                            value={filters.mediaType}
                            onChange={(val) => dispatch(setMediaType(val))}
                            icon="🍿"
                        />
                    )}

                    <Dropdown
                        id="filter-genre"
                        label="Genre"
                        options={genreOptions}
                        value={filters.genre}
                        onChange={(val) => dispatch(setGenreFilter(val))}
                        icon="🎭"
                    />

                    <Dropdown
                        id="filter-year"
                        label="Year"
                        options={yearOptions}
                        value={filters.year}
                        onChange={(val) => dispatch(setYearFilter(val))}
                        icon="📅"
                    />

                    <Dropdown
                        id="filter-rating"
                        label="Rating"
                        options={ratingOptions}
                        value={filters.rating}
                        onChange={(val) => dispatch(setRatingFilter(val))}
                        icon="⭐"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <Dropdown
                        id="sort-by"
                        label="Sort By"
                        options={sortOptions}
                        value={sortOption}
                        onChange={(val) => dispatch(setSortOption(val))}
                        icon="⇅"
                    />

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => dispatch(resetFilters())}
                            className="secondary-btn"
                            style={{
                                height: '42px',
                                padding: '0 16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                color: '#f87171',
                                borderColor: 'rgba(239, 68, 68, 0.3)'
                            }}
                            title="Reset all filters to default"
                        >
                            <span>✖</span> <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {hasActiveFilters && (
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Active:
                    </span>

                    {filters.mediaType !== 'all' && (
                        <span style={activeBadgeStyle} onClick={() => dispatch(setMediaType('all'))}>
                            Type: {filters.mediaType === 'movie' ? 'Movies' : 'TV Shows'} &times;
                        </span>
                    )}

                    {filters.genre !== 'all' && (
                        <span style={activeBadgeStyle} onClick={() => dispatch(setGenreFilter('all'))}>
                            Genre: {filters.genre} &times;
                        </span>
                    )}

                    {filters.year !== 'all' && (
                        <span style={activeBadgeStyle} onClick={() => dispatch(setYearFilter('all'))}>
                            Year: {filters.year} &times;
                        </span>
                    )}

                    {filters.rating !== 'all' && (
                        <span style={activeBadgeStyle} onClick={() => dispatch(setRatingFilter('all'))}>
                            Rating: {filters.rating}+ ★ &times;
                        </span>
                    )}

                    {sortOption !== 'default' && (
                        <span style={activeBadgeStyle} onClick={() => dispatch(setSortOption('default'))}>
                            Sort: {sortOptions.find(o => o.value === sortOption)?.label} &times;
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

const activeBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    color: '#93c5fd',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};
