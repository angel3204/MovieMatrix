import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import InitialLoader from '../components/InitialLoader';
import ThemeRipple from '../components/ThemeRipple';
import Toast from '../components/Toast';
import TrailerModal from '../components/TrailerModal';

export default function MainLayout({
    myListCount = 0,
    searchQuery = "",
    onSearchChange,
    onClearSearch,
    catalogData = [],
    userRatings = {},
    currentTheme = "midnight-matrix",
    onThemeChange,
    currentUser = null,
    onSignOut,
    onOpenFrontPage,
    lang = "en",
    onLangChange,
    toast = null,
    rippleState = { active: false, x: 0, y: 0 },
    activeTrailerItem = null,
    onCloseTrailer,
    ...outletProps
}) {
    return (
        <div className="movie-matrix-app">
            {/* Splash screen loader */}
            <InitialLoader lang={lang} />

            {/* Theme ripple background transition */}
            <ThemeRipple rippleState={rippleState} />

            {/* Floating Toast Notification */}
            <Toast toast={toast} />

            {/* Master Navbar */}
            <Navbar
                myListCount={myListCount}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onClearSearch={onClearSearch}
                catalogData={catalogData}
                userRatings={userRatings}
                currentTheme={currentTheme}
                onThemeChange={onThemeChange}
                currentUser={currentUser}
                onSignOut={onSignOut}
                onOpenFrontPage={onOpenFrontPage}
                lang={lang}
                onLangChange={onLangChange}
            />

            {/* Main Page Content */}
            <main id="main-content">
                <Outlet
                    context={{
                        myListCount,
                        searchQuery,
                        onSearchChange,
                        onClearSearch,
                        catalogData,
                        userRatings,
                        currentTheme,
                        onThemeChange,
                        currentUser,
                        onSignOut,
                        onOpenFrontPage,
                        lang,
                        ...outletProps
                    }}
                />
            </main>

            {/* Footer */}
            <Footer lang={lang} />

            {/* Global Video Trailer Modal */}
            <TrailerModal
                item={activeTrailerItem}
                isOpen={Boolean(activeTrailerItem)}
                onClose={onCloseTrailer}
            />
        </div>
    );
}
