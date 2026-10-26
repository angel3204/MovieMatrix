import React, { useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchHomeSections,
    selectHomeSections,
    selectHomeStatus
} from '../store/movieSlice';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import CinematicLanding from './CinematicLanding';
import ErrorMessage from '../components/ErrorMessage';
import MovieSkeleton from '../components/MovieSkeleton';
import { t } from '../data/translations';

const QUICK_MOODS = [
    { id: 'happy', emoji: '😄', name: 'Happy', color: '#f59e0b' },
    { id: 'sad', emoji: '😢', name: 'Sad', color: '#60a5fa' },
    { id: 'excited', emoji: '⚡', name: 'Excited', color: '#f43f5e' },
    { id: 'romantic', emoji: '💖', name: 'Romantic', color: '#ec4899' },
    { id: 'relaxed', emoji: '🧘', name: 'Chill', color: '#10b981' },
    { id: 'thoughtful', emoji: '🧠', name: 'Deep & Twisty', color: '#a855f7' },
    { id: 'spooky', emoji: '👻', name: 'Spooky', color: '#2dd4bf' },
    { id: 'bored', emoji: '🥱', name: 'Bored', color: '#eab308' }
];

export default function Home(props) {
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
        lang = "en",
        showLanding = false,
        onDismissLanding,
        onLangChange
    } = effectiveProps;

    const dispatch = useDispatch();
    const homeSections = useSelector(selectHomeSections);
    const { status: homeStatus, error: homeError } = useSelector(selectHomeStatus);

    // Fetch real API home sections on initial mount
    useEffect(() => {
        dispatch(fetchHomeSections());
    }, [dispatch]);

    return (
        <div className="page-home">
            {showLanding && (
                <CinematicLanding
                    catalogData={catalogData}
                    onEnter={onDismissLanding}
                    onExploreTrailers={() => {
                        if (onDismissLanding) onDismissLanding();
                        const heroItem = catalogData.find(i => i.id === "matrix-awakens") || catalogData[0];
                        if (onPlayTrailer) onPlayTrailer(heroItem);
                    }}
                    onSignIn={() => {
                        if (onDismissLanding) onDismissLanding();
                    }}
                    lang={lang}
                    onLangChange={onLangChange}
                />
            )}

            <HeroBanner
                currentTab="home"
                catalogData={catalogData}
                tabConfigs={tabConfigs}
                myList={myList}
                onToggleList={onToggleList}
                onPlayTrailer={onPlayTrailer}
                onToast={onToast}
                lang={lang}
            />

            {/* Interactive Mood Matcher Quick-Bar */}
            <section className="home-mood-bar-container" aria-label="Mood quick recommendations">
                <div className="home-mood-bar-header">
                    <div className="home-mood-bar-title">
                        <span>🎭</span>
                        <span>{t("moodHomePrompt", lang)}</span>
                    </div>
                    <Link to="/mood" className="home-mood-explore-all">
                        <span>{t("navMood", lang)}</span>
                        <span>→</span>
                    </Link>
                </div>
                <div className="home-mood-chips-scroll">
                    {QUICK_MOODS.map(m => (
                        <Link
                            key={m.id}
                            to={`/mood?mood=${m.id}`}
                            className="home-mood-chip"
                            style={{ '--chip-accent': m.color }}
                        >
                            <span>{m.emoji}</span>
                            <span>{t(`mood_${m.id}`, lang) !== `mood_${m.id}` ? t(`mood_${m.id}`, lang) : m.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <div id="content-rows-container">
                {/* Async Loading State */}
                {homeStatus === 'loading' && (
                    <div style={{ padding: '20px 4%' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.9rem' }}>
                            Loading live movie sections...
                        </p>
                        <MovieSkeleton count={6} />
                    </div>
                )}

                {/* Async Error State with Retry Button */}
                {homeStatus === 'failed' && (
                    <ErrorMessage
                        message={homeError || "We could not load the latest movies from the database."}
                        onRetry={() => dispatch(fetchHomeSections())}
                    />
                )}

                {/* 1. Trending Now Section */}
                {homeSections.trending && homeSections.trending.length > 0 && (
                    <MovieRow
                        title={t("trendingNowTitle", lang)}
                        items={homeSections.trending}
                        myList={myList}
                        userRatings={userRatings}
                        onToggleList={onToggleList}
                        onPlayTrailer={onPlayTrailer}
                        lang={lang}
                    />
                )}

                {/* 2. Popular Movies Section */}
                {homeSections.popular && homeSections.popular.length > 0 && (
                    <MovieRow
                        title={t("popularMoviesTitle", lang)}
                        items={homeSections.popular}
                        myList={myList}
                        userRatings={userRatings}
                        onToggleList={onToggleList}
                        onPlayTrailer={onPlayTrailer}
                        lang={lang}
                    />
                )}

                {/* 3. Top Rated Section */}
                {homeSections.topRated && homeSections.topRated.length > 0 && (
                    <MovieRow
                        title="Top Rated Titles"
                        items={homeSections.topRated}
                        myList={myList}
                        userRatings={userRatings}
                        onToggleList={onToggleList}
                        onPlayTrailer={onPlayTrailer}
                        lang={lang}
                    />
                )}

                {/* 4. Upcoming Releases Section */}
                {homeSections.upcoming && homeSections.upcoming.length > 0 && (
                    <MovieRow
                        title="Upcoming Releases"
                        items={homeSections.upcoming}
                        myList={myList}
                        userRatings={userRatings}
                        onToggleList={onToggleList}
                        onPlayTrailer={onPlayTrailer}
                        lang={lang}
                    />
                )}
            </div>
        </div>
    );
}
