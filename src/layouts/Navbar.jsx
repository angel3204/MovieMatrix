import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectMyListCount } from '../store/movieSlice';
import { useAuth } from '../context/AuthContext';
import { t } from '../data/translations';

export default function Navbar({
    myListCount: propsMyListCount = 0,
    searchQuery = "",
    onSearchChange,
    onClearSearch,
    catalogData = [],
    userRatings = {},
    currentTheme = "midnight-matrix",
    onThemeChange,
    currentUser: propsCurrentUser = null,
    onSignOut,
    onOpenFrontPage,
    lang = "en",
    onLangChange
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser, logout } = useAuth();
    const currentUser = authUser !== undefined ? authUser : propsCurrentUser;
    const reduxCount = useSelector(selectMyListCount);
    const myListCount = reduxCount !== undefined ? reduxCount : propsMyListCount;

    const [scrolled, setScrolled] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const searchBoxRef = useRef(null);
    const searchInputRef = useRef(null);
    const themeDropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    // Navbar scroll listener
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Click outside listener for dropdowns
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
                setShowSuggestions(false);
                setSearchActive(false);
            }
            if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
                setThemeMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Search suggestions calculation
    const suggestions = React.useMemo(() => {
        const clean = searchQuery ? searchQuery.trim().toLowerCase() : "";
        if (!clean) return [];
        return catalogData.filter(item =>
            item.title ? item.title.toLowerCase().includes(clean) : false
        ).slice(0, 5);
    }, [searchQuery, catalogData]);

    const handleSearchToggle = () => {
        setSearchActive(prev => {
            const next = !prev;
            if (next && searchInputRef.current) {
                setTimeout(() => searchInputRef.current.focus(), 50);
            }
            return next;
        });
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setShowSuggestions(false);
            const query = searchQuery.trim();
            if (query) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
            } else {
                navigate('/search');
            }
        }
    };

    const handleClearClick = () => {
        if (onClearSearch) onClearSearch();
        setShowSuggestions(false);
        if (location.pathname === '/search') {
            navigate('/search');
        }
    };

    const handleSuggestionClick = (item) => {
        setShowSuggestions(false);
        navigate(`/movie/${item.id}`);
    };

    const placeholderText = location.pathname.startsWith('/movies')
        ? t("searchPlaceholderMovies", lang)
        : location.pathname.startsWith('/tv')
        ? t("searchPlaceholderTv", lang)
        : t("searchPlaceholder", lang);

    const userFirstName = currentUser && currentUser.name
        ? currentUser.name.split(" ")[0]
        : "User";

    const userInitials = currentUser && currentUser.name
        ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <nav id="navbar" className={scrolled ? "scrolled" : ""}>
            <div className="nav-left">
                <Link
                    to="/"
                    className="logo"
                    id="logo-btn"
                    style={{ textDecoration: 'none' }}
                >
                    MOVIE MATRIX
                </Link>

                <ul className="nav-links">
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                            end
                        >
                            {t("navHome", lang)}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/tv-shows"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            {t("navTvShows", lang)}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/movies"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            {t("navMovies", lang)}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/new-popular"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            {t("navNewPopular", lang)}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/mood"
                            className={({ isActive }) => `nav-item mood-nav-item ${isActive ? "active" : ""}`}
                        >
                            <span>{t("navMood", lang)}</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/my-list"
                            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        >
                            <span>{t("navMyList", lang)}</span>{' '}
                            <span className="badge" id="mylist-count">{myListCount}</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="nav-right">
                <div
                    className={`search-box ${searchActive || searchQuery || location.pathname === '/search' ? "active" : ""}`}
                    id="search-box"
                    ref={searchBoxRef}
                >
                    <button
                        className="search-btn"
                        id="search-toggle-btn"
                        aria-label="Search"
                        type="button"
                        onClick={handleSearchToggle}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <input
                        type="text"
                        id="search-input"
                        ref={searchInputRef}
                        placeholder={placeholderText}
                        value={searchQuery}
                        autoComplete="off"
                        onChange={(e) => {
                            if (onSearchChange) onSearchChange(e.target.value);
                            setShowSuggestions(e.target.value.trim().length > 0);
                        }}
                        onKeyDown={handleSearchSubmit}
                        onFocus={() => {
                            setSearchActive(true);
                            if (searchQuery.trim().length > 0) {
                                setShowSuggestions(true);
                            }
                        }}
                        onBlur={() => {
                            if (!searchQuery.trim()) {
                                setSearchActive(false);
                            }
                        }}
                    />
                    {searchQuery && (
                        <button
                            className="clear-search-btn"
                            id="clear-search-btn"
                            aria-label="Clear search"
                            type="button"
                            onClick={handleClearClick}
                        >
                            &times;
                        </button>
                    )}

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="search-suggestions-dropdown" id="search-suggestions-dropdown">
                            {suggestions.map(item => {
                                const uRating = userRatings ? userRatings[item.id] : null;
                                return (
                                    <div
                                        key={item.id}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(item)}
                                    >
                                        <img
                                            src={item.thumb}
                                            alt={item.title}
                                            className="suggestion-thumb"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = 'assets/matrix_awakens.jpg';
                                            }}
                                        />
                                        <div className="suggestion-info">
                                            <span className="suggestion-title">{item.title}</span>
                                            <div className="suggestion-meta">
                                                <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                                                    ⭐ {item.defaultRating || '8.5'}/10
                                                </span>
                                                <span>• {item.year}</span>
                                                <span className="suggestion-type">{item.type.toUpperCase()}</span>
                                                {uRating !== null && uRating !== undefined && (
                                                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                                                        • ★ {uRating}/10
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div
                    className={`theme-dropdown-wrapper ${themeMenuOpen ? "active" : ""}`}
                    id="theme-dropdown-wrapper"
                    ref={themeDropdownRef}
                >
                    <button
                        className="theme-picker-btn"
                        id="theme-picker-btn"
                        aria-label="Choose Theme"
                        title="Choose Color Theme"
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setThemeMenuOpen(prev => !prev);
                        }}
                    >
                        <span className="theme-color-dot" id="theme-current-dot" />
                        <span className="theme-btn-label">{t("themeLabel", lang)}</span>
                        <span className="dropdown-arrow">▾</span>
                    </button>

                    <div className={`theme-dropdown-menu ${themeMenuOpen ? "" : "hidden"}`} id="theme-dropdown-menu">
                        <div
                            className={`theme-option ${currentTheme === "midnight-matrix" ? "active" : ""}`}
                            data-theme="midnight-matrix"
                            onClick={(e) => {
                                onThemeChange("midnight-matrix", e);
                                setThemeMenuOpen(false);
                            }}
                        >
                            <span className="theme-dot dot-midnight" />
                            <span>{t("midnightMatrix", lang)}</span>
                        </div>
                        <div
                            className={`theme-option ${currentTheme === "cyber-neon" ? "active" : ""}`}
                            data-theme="cyber-neon"
                            onClick={(e) => {
                                onThemeChange("cyber-neon", e);
                                setThemeMenuOpen(false);
                            }}
                        >
                            <span className="theme-dot dot-neon" />
                            <span>{t("cyberNeon", lang)}</span>
                        </div>
                        <div
                            className={`theme-option ${currentTheme === "ocean-noir" ? "active" : ""}`}
                            data-theme="ocean-noir"
                            onClick={(e) => {
                                onThemeChange("ocean-noir", e);
                                setThemeMenuOpen(false);
                            }}
                        >
                            <span className="theme-dot dot-ocean" />
                            <span>{t("oceanNoir", lang)}</span>
                        </div>
                        <div
                            className={`theme-option ${currentTheme === "sunset-cinema" ? "active" : ""}`}
                            data-theme="sunset-cinema"
                            onClick={(e) => {
                                onThemeChange("sunset-cinema", e);
                                setThemeMenuOpen(false);
                            }}
                        >
                            <span className="theme-dot dot-sunset" />
                            <span>{t("sunsetCinema", lang)}</span>
                        </div>
                        <div className="theme-shortcut-hint">
                            <span>Shortcut: Press <strong>'T'</strong></span>
                        </div>
                    </div>
                </div>

                {/* Language Selector */}
                <div className="lang-select-wrapper" id="nav-lang-select-wrapper" title="Select Language">
                    <span className="lang-globe-icon" aria-hidden="true">🌐</span>
                    <select
                        className="lang-select"
                        id="nav-lang-select"
                        aria-label="Select Language"
                        value={lang}
                        onChange={(e) => onLangChange && onLangChange(e.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी</option>
                    </select>
                    <span className="dropdown-arrow" aria-hidden="true" style={{ pointerEvents: 'none' }}>▾</span>
                </div>

                {!currentUser ? (
                    <Link
                        to="/login"
                        className="auth-btn"
                        id="nav-signin-btn"
                        style={{ textDecoration: 'none' }}
                    >
                        {t("signIn", lang)}
                    </Link>
                ) : (
                    <div
                        className="user-menu-wrapper"
                        id="user-menu-wrapper"
                        ref={userMenuRef}
                    >
                        <button
                            className="user-avatar-btn"
                            id="user-avatar-btn"
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setUserMenuOpen(prev => !prev);
                            }}
                        >
                            <span className="avatar-initials" id="user-initials">
                                {userInitials}
                            </span>
                            <span className="user-name-label" id="user-name-label">
                                {userFirstName}
                            </span>
                            <span className="dropdown-arrow">▾</span>
                        </button>
                        <div className={`user-dropdown-menu ${userMenuOpen ? "" : "hidden"}`} id="user-dropdown-menu">
                            <div className="user-dropdown-header">
                                <strong id="user-full-name">
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                                        {t("welcomeBack", lang)} 👋
                                    </span>
                                    {currentUser.name}
                                </strong>
                                <span id="user-email-text" className="user-email-text">
                                    {currentUser.email}
                                </span>
                            </div>
                            <div className="user-dropdown-divider" />
                            <Link
                                to="/my-list"
                                className="user-dropdown-item"
                                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => setUserMenuOpen(false)}
                            >
                                🎬 <span>{t("navMyList", lang)}</span>
                            </Link>
                            <div
                                className="user-dropdown-item signout-item"
                                id="nav-signout-btn"
                                onClick={() => {
                                    setUserMenuOpen(false);
                                    logout();
                                    if (onSignOut) onSignOut();
                                }}
                            >
                                🚪 <span>{t("signOut", lang)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
