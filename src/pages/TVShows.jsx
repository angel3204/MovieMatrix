import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchTVShowsList,
    selectFilteredTVShows,
    selectTVPagination,
    resetFilters
} from '../store/movieSlice';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import FilterBar from '../components/FilterBar';
import MovieSkeleton from '../components/MovieSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { t } from '../data/translations';

export default function TVShows(props) {
    const context = useOutletContext() || {};
    const effectiveProps = { ...context, ...props };

    const {
        catalogData = [],
        tabConfigs = {},
        myList = [],
        userRatings = {},
        onToggleList,
        onPlayTrailer,
        onToast,
        lang = "en"
    } = effectiveProps;

    const dispatch = useDispatch();
    const tvShows = useSelector(selectFilteredTVShows);
    const { page, hasMore, status, error } = useSelector(selectTVPagination);

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Initial load of TV Shows from API
    useEffect(() => {
        dispatch(fetchTVShowsList({ page: 1, append: false }));
    }, [dispatch]);

    // Handle "Load More" pagination
    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        await dispatch(fetchTVShowsList({ page: page + 1, append: true }));
        setIsLoadingMore(false);
    };

    return (
        <div className="page-tvshows">
            <HeroBanner
                currentTab="tv"
                catalogData={catalogData}
                tabConfigs={tabConfigs}
                myList={myList}
                onToggleList={onToggleList}
                onPlayTrailer={onPlayTrailer}
                onToast={onToast}
                lang={lang}
            />

            <section className="catalog-browse-section" style={{ padding: '30px 4% 80px' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h2 className="section-heading" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                            {t("navTvShows", lang)} Catalog
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                            Stream episodic series, limited documentaries, and serialized dramas.
                        </p>
                    </div>
                    {tvShows.length > 0 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Showing {tvShows.length} titles
                        </span>
                    )}
                </div>

                {/* Filter & Sort Bar */}
                <FilterBar showMediaType={false} />

                {/* Loading Skeleton */}
                {status === 'loading' && tvShows.length === 0 && (
                    <MovieSkeleton count={8} />
                )}

                {/* API Error State */}
                {status === 'failed' && tvShows.length === 0 && (
                    <ErrorMessage
                        message={error || "Failed to load TV shows."}
                        onRetry={() => dispatch(fetchTVShowsList({ page: 1, append: false }))}
                    />
                )}

                {/* TV Shows Grid or Empty State */}
                {status !== 'loading' && tvShows.length === 0 ? (
                    <div className="empty-search-box" style={{ margin: '40px auto', textAlign: 'center' }}>
                        <div className="empty-search-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📺</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-primary)' }}>NO TV SHOWS FOUND</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                            No TV shows matched your active filter criteria. Try selecting another genre or resetting filters.
                        </p>
                        <button
                            className="primary-btn clear-filters-btn"
                            type="button"
                            onClick={() => dispatch(resetFilters())}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            <span>↺</span> <span>Reset Filters</span>
                        </button>
                    </div>
                ) : (
                    <div className="search-grid">
                        {tvShows.map((show) => (
                            <MovieCard
                                key={show.id}
                                movie={show}
                                userRating={userRatings ? userRatings[show.id] : null}
                                onToggleList={onToggleList}
                                onPlayTrailer={onPlayTrailer}
                                lang={lang}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination: Load More Button */}
                {hasMore && tvShows.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Button
                            variant="primary"
                            size="lg"
                            isLoading={isLoadingMore}
                            loadingText="Loading more shows..."
                            onClick={handleLoadMore}
                            style={{ minWidth: '200px' }}
                        >
                            <span>＋</span> <span>Load More TV Shows</span>
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}
