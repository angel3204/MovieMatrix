import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectMyList, toggleMyList } from './store/movieSlice';
import { showToast as reduxShowToast } from './store/uiSlice';
import { catalogData, tabConfigs } from './data/catalogData';
import { t, MOVIE_MATRIX_LANG_KEY } from './data/translations';

// Context & Protected Route
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import NewPopular from './pages/NewPopular';
import MyList from './pages/MyList';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import MovieReviews from './pages/MovieReviews';
import MoodMatcher from './pages/MoodMatcher';
import NotFound from './pages/NotFound';

const VALID_THEMES = ["midnight-matrix", "cyber-neon", "ocean-noir", "sunset-cinema"];

function AppRoutes() {
    const dispatch = useDispatch();
    const { user, logout, loading } = useAuth();
    const myList = useSelector(selectMyList);

    // 1. Theme State
    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            const saved = localStorage.getItem("movieMatrix_theme");
            if (saved && VALID_THEMES.includes(saved)) return saved;
            if (saved === "dark-matrix") return "midnight-matrix";
            if (saved === "ruby-velvet") return "ocean-noir";
            if (saved === "midnight-blue") return "sunset-cinema";
        } catch {}
        return "midnight-matrix";
    });

    // 2. Language State
    const [currentLang, setCurrentLang] = useState(() => {
        try {
            const saved = localStorage.getItem(MOVIE_MATRIX_LANG_KEY);
            if (saved === "hi" || saved === "en") return saved;
        } catch {}
        return "en";
    });

    // 3. Landing Page Visibility (for Home)
    const [showLanding, setShowLanding] = useState(() => {
        try {
            return sessionStorage.getItem("movieMatrixIntroSeen") !== "true";
        } catch {
            return false;
        }
    });

    // 4. User Ratings State
    const [userRatings, setUserRatings] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("movieMatrix_userRatings") || "{}");
        } catch {
            return {};
        }
    });

    // 5. Search query state
    const [searchQuery, setSearchQuery] = useState("");

    // 6. Modals & Notifications
    const [activeTrailerItem, setActiveTrailerItem] = useState(null);
    const [toast, setToast] = useState(null);
    const [rippleState, setRippleState] = useState({ active: false, x: 0, y: 0 });

    const toastTimerRef = useRef(null);

    // Apply theme to document body
    useEffect(() => {
        document.body.setAttribute("data-theme", currentTheme);
        try {
            localStorage.setItem("movieMatrix_theme", currentTheme);
        } catch {}
    }, [currentTheme]);

    // Apply language to document
    useEffect(() => {
        document.documentElement.lang = currentLang;
        try {
            localStorage.setItem(MOVIE_MATRIX_LANG_KEY, currentLang);
        } catch {}
    }, [currentLang]);

    // Toast helper syncing to Redux
    const showToast = useCallback((message, type = "info") => {
        dispatch(reduxShowToast({ message, type }));
        clearTimeout(toastTimerRef.current);
        setToast({ message, type, id: Date.now() });
        toastTimerRef.current = setTimeout(() => {
            setToast(null);
        }, 3000);
    }, [dispatch]);

    // Theme change with radial ripple
    const handleThemeChange = useCallback((themeName, clickEvent = null) => {
        let x = window.innerWidth / 2;
        let y = 60;
        if (clickEvent && clickEvent.clientX !== undefined) {
            x = clickEvent.clientX;
            y = clickEvent.clientY;
        }

        setRippleState({ active: true, x, y });
        setTimeout(() => {
            setRippleState({ active: false, x: 0, y: 0 });
        }, 700);

        setCurrentTheme(themeName);
        const themeKey = themeName === "midnight-matrix"
            ? "midnightMatrix"
            : themeName === "cyber-neon"
            ? "cyberNeon"
            : themeName === "ocean-noir"
            ? "oceanNoir"
            : "sunsetCinema";
        showToast(`${t("themeChangedTo", currentLang)}: ${t(themeKey, currentLang)}`, "info");
    }, [currentLang, showToast]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
            if (activeTag === "input" || activeTag === "textarea") return;

            // 'T' to cycle themes
            if (e.key === "t" || e.key === "T") {
                e.preventDefault();
                const currentIndex = VALID_THEMES.indexOf(currentTheme);
                const nextIndex = (currentIndex + 1) % VALID_THEMES.length;
                handleThemeChange(VALID_THEMES[nextIndex]);
            }

            // '1' - '4' direct theme select
            if (["1", "2", "3", "4"].includes(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                if (VALID_THEMES[idx]) {
                    handleThemeChange(VALID_THEMES[idx]);
                }
            }

            // 'Escape' closes active trailer modal
            if (e.key === "Escape") {
                setActiveTrailerItem(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentTheme, handleThemeChange]);

    // Toggle item in watchlist via Redux
    const handleToggleList = useCallback((id) => {
        const isIn = myList.includes(id);
        dispatch(toggleMyList(id));
        if (isIn) {
            showToast(`✓ ${t("removedFromMyListMsg", currentLang)}`, "warning");
        } else {
            showToast(`✓ ${t("addedToMyListMsg", currentLang)}`, "success");
        }
    }, [myList, currentLang, showToast, dispatch]);

    // Set user rating
    const handleSetRating = useCallback((id, ratingValue) => {
        setUserRatings((prev) => {
            const next = { ...prev, [id]: Number(ratingValue) };
            try {
                localStorage.setItem("movieMatrix_userRatings", JSON.stringify(next));
            } catch {}
            return next;
        });
        showToast(`✓ ${t("yourRating", currentLang)}: ${ratingValue}/10`, "success");
    }, [currentLang, showToast]);

    // Language change handler
    const handleLangChange = useCallback((newLang) => {
        setCurrentLang(newLang);
        showToast(t("languageChangedMsg", newLang), "info");
    }, [showToast]);

    // Open front page
    const handleOpenFrontPage = useCallback(() => {
        try {
            sessionStorage.removeItem("movieMatrixIntroSeen");
            document.documentElement.classList.remove("intro-seen");
        } catch {}
        setShowLanding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Dismiss landing
    const handleDismissLanding = useCallback(() => {
        try {
            sessionStorage.setItem("movieMatrixIntroSeen", "true");
            document.documentElement.classList.add("intro-seen");
        } catch {}
        setShowLanding(false);
    }, []);

    // Sign out handler using AuthContext
    const handleSignOut = useCallback(() => {
        logout();
        showToast("Signed out successfully 👋", "warning");
    }, [logout, showToast]);

    // If AuthContext is checking localStorage on startup, show Movie Matrix loading screen
    if (loading) {
        return (
            <div className="initial-loader" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                <div className="loader-content">
                    <h1 className="loader-logo">MOVIE MATRIX</h1>
                    <p className="loader-sub">Initializing Movie Matrix...</p>
                    <div className="loader-progress-ring">
                        <div className="loader-bar-fill"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Common props shared with pages and layout
    const sharedProps = {
        catalogData,
        tabConfigs,
        myList,
        myListCount: myList.length,
        userRatings,
        currentTheme,
        onThemeChange: handleThemeChange,
        currentUser: user,
        onSignOut: handleSignOut,
        searchQuery,
        onSearchChange: setSearchQuery,
        onClearSearch: () => setSearchQuery(""),
        onToggleList: handleToggleList,
        onSetRating: handleSetRating,
        activeTrailerItem,
        onPlayTrailer: (item) => setActiveTrailerItem(item),
        onCloseTrailer: () => setActiveTrailerItem(null),
        onOpenFrontPage: handleOpenFrontPage,
        showLanding,
        onDismissLanding: handleDismissLanding,
        lang: currentLang,
        onLangChange: handleLangChange,
        toast,
        onToast: showToast,
        rippleState
    };

    return (
        <Routes>
            <Route path="/" element={<MainLayout {...sharedProps} />}>
                <Route index element={<Home {...sharedProps} />} />
                <Route path="movies" element={<Movies {...sharedProps} />} />
                <Route path="tv-shows" element={<TVShows {...sharedProps} />} />
                <Route path="new-popular" element={<NewPopular {...sharedProps} />} />
                <Route path="mood" element={<MoodMatcher {...sharedProps} />} />
                {/* Protected Route for /my-list */}
                <Route
                    path="my-list"
                    element={
                        <ProtectedRoute>
                            <MyList {...sharedProps} />
                        </ProtectedRoute>
                    }
                />
                <Route path="search" element={<Search {...sharedProps} />} />
                <Route path="login" element={<Login {...sharedProps} />} />
                <Route path="register" element={<Register {...sharedProps} />} />
                <Route path="movie/:movieId" element={<MovieDetails {...sharedProps} />}>
                    <Route path="reviews" element={<MovieReviews {...sharedProps} />} />
                    <Route path="cast" element={<MovieDetails {...sharedProps} />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
