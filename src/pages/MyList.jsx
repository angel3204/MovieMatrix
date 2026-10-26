import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectMyListItems, clearMyList } from '../store/movieSlice';
import { showToast } from '../store/uiSlice';
import MovieCard from '../components/MovieCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { t } from '../data/translations';

export default function MyList(props) {
    const context = useOutletContext() || {};
    const effectiveProps = { ...context, ...props };

    const {
        userRatings = {},
        onToggleList,
        onPlayTrailer,
        lang = "en"
    } = effectiveProps;

    const dispatch = useDispatch();
    const myItems = useSelector(selectMyListItems);

    const [filterType, setFilterType] = useState("all");
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const handleConfirmClear = () => {
        dispatch(clearMyList());
        dispatch(showToast({ message: "✓ My List cleared successfully", type: "warning" }));
        setIsClearModalOpen(false);
    };

    if (!myItems || myItems.length === 0) {
        return (
            <section id="mylist-empty-section" style={{ paddingTop: '80px', minHeight: '75vh' }}>
                <div className="empty-state-container">
                    <div className="cinematic-empty-state">
                        <div className="empty-glow"></div>
                        <div className="empty-icon-ring">🎬</div>
                        <h2>{t("myListSubhead", lang)}</h2>
                        <p>{t("myListEmptyDesc", lang)}</p>
                        <Link
                            to="/movies"
                            className="primary-btn explore-btn"
                            style={{ textDecoration: 'none' }}
                            aria-label="Explore Movies"
                        >
                            <span>🎬</span> <span>{t("exploreMovies", lang)}</span>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const movieCount = myItems.filter(i => i.type === "movie").length;
    const tvCount = myItems.filter(i => i.type === "tv").length;

    const filteredItems = myItems.filter(item => {
        if (filterType === "movie") return item.type === "movie";
        if (filterType === "tv") return item.type === "tv";
        return true;
    });

    return (
        <div id="content-rows-container" style={{ padding: '95px 4% 80px' }}>
            {/* Header with Title and Clear Action */}
            <div className="mylist-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div className="mylist-header-left">
                    <h2 className="mylist-title">{t("myListHeader", lang)}</h2>
                    <span className="mylist-subtitle">
                        {myItems.length} {myItems.length === 1 ? 'TITLE' : 'TITLES'} SAVED
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="mylist-filter-tabs" role="tablist" aria-label="Filter My List by Media Type">
                        <button
                            type="button"
                            className={`mylist-filter-btn ${filterType === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterType('all')}
                        >
                            All ({myItems.length})
                        </button>
                        <button
                            type="button"
                            className={`mylist-filter-btn ${filterType === 'movie' ? 'active' : ''}`}
                            onClick={() => setFilterType('movie')}
                        >
                            Movies ({movieCount})
                        </button>
                        <button
                            type="button"
                            className={`mylist-filter-btn ${filterType === 'tv' ? 'active' : ''}`}
                            onClick={() => setFilterType('tv')}
                        >
                            TV Shows ({tvCount})
                        </button>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsClearModalOpen(true)}
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        title="Clear all saved titles from My List"
                    >
                        <span>🗑️</span> <span>Clear List</span>
                    </Button>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="empty-search-box" style={{ margin: '40px auto' }}>
                    <div className="empty-search-icon">🔍</div>
                    <h3>NO {filterType === 'movie' ? 'MOVIES' : 'TV SHOWS'} IN YOUR LIST</h3>
                    <p>
                        You have items in your watchlist, but none match the{' '}
                        {filterType === 'movie' ? 'Movies' : 'TV Shows'} filter.
                    </p>
                    <button
                        className="primary-btn clear-filters-btn"
                        type="button"
                        onClick={() => setFilterType('all')}
                    >
                        Show All Saved Titles
                    </button>
                </div>
            ) : (
                <div className="search-grid">
                    {filteredItems.map(item => (
                        <MovieCard
                            key={item.id}
                            movie={item}
                            isInList={true}
                            userRating={userRatings ? userRatings[item.id] : null}
                            onToggleList={onToggleList}
                            onPlayTrailer={onPlayTrailer}
                            lang={lang}
                        />
                    ))}
                </div>
            )}

            {/* Clear Watchlist Confirmation Modal */}
            <Modal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                title="Clear Watchlist?"
                size="sm"
                ariaLabel="Confirm clear watchlist"
            >
                <div style={{ padding: '16px 24px 24px' }}>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                        Are you sure you want to remove all <strong>{myItems.length}</strong> saved titles from your personal watchlist? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button
                            variant="secondary"
                            onClick={() => setIsClearModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleConfirmClear}
                        >
                            Yes, Clear Watchlist
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
