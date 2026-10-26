import React, { useRef } from 'react';
import MovieCard from './MovieCard';

export default function MovieRow({
    title,
    items = [],
    isTop10 = false,
    myList = [],
    userRatings = {},
    searchQuery = "",
    onToggleList,
    onSelectMovie,
    onPlayTrailer,
    lang = "en"
}) {
    const rowRef = useRef(null);

    if (!items || items.length === 0) return null;

    const handleScroll = (direction) => {
        if (rowRef.current) {
            const scrollDistance = direction === 'left' ? -600 : 600;
            rowRef.current.scrollBy({ left: scrollDistance, behavior: 'smooth' });
        }
    };

    return (
        <div className={`movie-row ${isTop10 ? 'top10-row' : ''}`}>
            <h3>
                <span>{title}</span>
                {isTop10 && <span className="row-category-tag">TOP 10</span>}
            </h3>

            <div className="movie-row-container">
                <button
                    type="button"
                    className="row-nav-arrow row-nav-left"
                    onClick={() => handleScroll('left')}
                    aria-label={`Scroll ${title} left`}
                    title="Scroll left"
                >
                    ‹
                </button>

                <div className="row-posters" ref={rowRef}>
                    {items.map((item, index) => (
                        <MovieCard
                            key={item.id}
                            movie={item}
                            rankNumber={isTop10 ? index + 1 : null}
                            searchQuery={searchQuery}
                            isInList={myList.includes(item.id)}
                            userRating={userRatings ? userRatings[item.id] : null}
                            onToggleList={onToggleList}
                            onSelectMovie={onSelectMovie}
                            onPlayTrailer={onPlayTrailer}
                            lang={lang}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    className="row-nav-arrow row-nav-right"
                    onClick={() => handleScroll('right')}
                    aria-label={`Scroll ${title} right`}
                    title="Scroll right"
                >
                    ›
                </button>
            </div>
        </div>
    );
}

