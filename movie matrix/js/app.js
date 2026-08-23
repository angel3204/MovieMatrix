let currentTab = "home";
let myList = JSON.parse(localStorage.getItem("movieMatrix_myList") || "[]");
let currentUser = JSON.parse(localStorage.getItem("movieMatrix_currentUser") || "null");
let userRatings = JSON.parse(localStorage.getItem("movieMatrix_userRatings") || "{}");
let activeModalItem = null;
let myListFilter = "all";

function getUserRating(id) {
    return userRatings && userRatings[id] !== undefined ? userRatings[id] : null;
}

function setUserRating(id, ratingVal) {
    if (!userRatings) userRatings = {};
    userRatings[id] = Number(ratingVal);
    localStorage.setItem("movieMatrix_userRatings", JSON.stringify(userRatings));

    if (typeof showToast === "function") {
        const ratingLabel = typeof t === "function" ? t("yourRating") : "Your Rating";
        showToast(`✓ ${ratingLabel}: ${ratingVal}/10`, "success");
    }

    if (activeModalItem && activeModalItem.id === id) {
        renderModalUserRatingWidget(activeModalItem);
    }

    updateAllCardRatings();
}

function updateAllCardRatings() {
    document.querySelectorAll(".movie-card").forEach(card => {
        const itemId = card.getAttribute("data-id");
        if (!itemId) return;
        const uRating = getUserRating(itemId);
        const badgesContainer = card.querySelector(".card-badges");
        if (badgesContainer) {
            let uBadge = badgesContainer.querySelector(".card-user-rating-badge");
            if (uRating !== null) {
                if (!uBadge) {
                    uBadge = document.createElement("span");
                    uBadge.className = "card-user-rating-badge";
                    badgesContainer.appendChild(uBadge);
                }
                uBadge.setAttribute("title", `Your Rating: ${uRating}/10`);
                uBadge.textContent = `★ ${uRating}/10`;
            } else if (uBadge) {
                uBadge.remove();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initCinematicLanding();

    const initialTab = document.body.getAttribute("data-page") || "home";

    setupNavbarScroll();
    setupNavigation();
    setupSearch();
    setupThemeToggle();
    setupKeyboardShortcuts();
    setupAuth();
    updateMyListBadge();

    if (typeof initHeroSlideshow === "function") {
        initHeroSlideshow();
    }
    loadTab(initialTab);
});

function initLoader() {
    const loader = document.getElementById("initial-loader");
    if (!loader) return;

    if (typeof checkMovieMatrixIntro === "function" && checkMovieMatrixIntro()) {
        loader.style.display = "none";
        loader.classList.add("hidden", "fade-out");
        return;
    }

    let isDismissed = false;
    const dismissLoader = () => {
        if (isDismissed) return;
        isDismissed = true;
        loader.classList.add("fade-out");
        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    };

    setTimeout(dismissLoader, 900);

    setTimeout(dismissLoader, 1200);

    window.addEventListener("load", dismissLoader);
}

function openFrontPage() {
    const landing = document.getElementById("cinematic-landing");
    if (!landing) {
        if (typeof resetMovieMatrixIntro === "function") {
            resetMovieMatrixIntro();
        }
        window.location.href = "index.html";
        return;
    }

    if (typeof resetMovieMatrixIntro === "function") {
        resetMovieMatrixIntro();
    }

    landing.classList.remove("hidden", "dismissing");
    if (typeof applyLanguageToDOM === "function") {
        applyLanguageToDOM();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.openFrontPage = openFrontPage;

function initCinematicLanding() {
    const landing = document.getElementById("cinematic-landing");
    if (!landing) return;

    if (typeof checkMovieMatrixIntro === "function" && checkMovieMatrixIntro()) {
        landing.classList.add("hidden");
        return;
    }

    const wall = document.getElementById("cinematic-poster-wall");
    if (wall) {
        wall.innerHTML = "";
        const dataSources = (typeof catalogData !== "undefined" && Array.isArray(catalogData))
            ? catalogData
            : [];

        const tileCount = 30;
        const rotations = [-14, 10, -6, 12, -10, 8, -4, 15, -8, 6, -12, 11, -5, 9, -15, 7, -9, 13, -11, 5, -7, 14, -13, 8];
        const scaleFactors = [0.92, 1.05, 0.88, 1.1, 0.95, 1.02, 0.9, 1.08, 0.94, 1.04, 0.89, 1.06];

        for (let i = 0; i < tileCount; i++) {
            const item = dataSources.length > 0 ? dataSources[i % dataSources.length] : null;
            const tile = document.createElement("div");
            tile.className = "cinematic-poster-tile";

            const rot = rotations[i % rotations.length];
            const sc = scaleFactors[i % scaleFactors.length];
            const delay = (i * 0.03).toFixed(2);

            tile.style.transform = `rotate(${rot}deg) scale(${sc})`;
            tile.style.animationDelay = `${delay}s`;

            const img = document.createElement("img");
            const imgSrc = (item && item.thumb) ? item.thumb : "assets/matrix_awakens.jpg";
            img.src = imgSrc;
            img.alt = item ? item.title : "Movie Poster";
            img.loading = "lazy";
            img.onerror = () => {
                img.src = "assets/matrix_awakens.jpg";
            };

            tile.appendChild(img);
            wall.appendChild(tile);
        }
    }

    if (window.innerWidth > 768 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        let isMoving = false;
        landing.addEventListener("mousemove", (e) => {
            if (isMoving) return;
            isMoving = true;
            requestAnimationFrame(() => {
                const moveX = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 20;
                const moveY = ((e.clientY - window.innerHeight / 2) / window.innerHeight) * 20;
                if (wall) {
                    wall.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
                }
                isMoving = false;
            });
        });

        landing.addEventListener("mouseleave", () => {
            if (wall) {
                wall.style.transform = `translate3d(0px, 0px, 0px)`;
            }
        });
    }

    const enterBtn = document.getElementById("enter-matrix-btn");
    const dismissLanding = (callback) => {
        if (landing.classList.contains("dismissing") || landing.classList.contains("hidden")) return;
        if (typeof completeMovieMatrixIntro === "function") {
            completeMovieMatrixIntro();
        }
        landing.classList.add("dismissing");
        setTimeout(() => {
            landing.classList.add("hidden");
            if (typeof callback === "function") callback();
        }, 900);
    };

    if (enterBtn) {
        enterBtn.addEventListener("click", () => {
            dismissLanding();
        });
    }

    const trailersBtn = document.getElementById("cinematic-trailers-btn");
    if (trailersBtn) {
        trailersBtn.addEventListener("click", () => {
            dismissLanding(() => {
                const heroPlayBtn = document.getElementById("hero-play-btn");
                if (heroPlayBtn) {
                    heroPlayBtn.click();
                } else {
                    const mainContent = document.getElementById("main-content");
                    if (mainContent) mainContent.scrollIntoView({ behavior: "smooth" });
                }
            });
        });
    }

    const signinBtn = document.getElementById("cinematic-signin-btn");
    if (signinBtn) {
        signinBtn.addEventListener("click", () => {
            dismissLanding(() => {
                if (typeof openAuthModal === "function") {
                    openAuthModal("signin");
                }
            });
        });
    }

    const langSelect = document.getElementById("landing-lang-select") || document.getElementById("cinematic-lang-select");
    if (langSelect) {
        langSelect.addEventListener("change", (e) => {
            const lang = e.target.value;
            if (typeof setLanguage === "function") {
                setLanguage(lang, true);
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (!landing.classList.contains("dismissing") && !landing.classList.contains("hidden")) {
            if (e.key === "Enter" && (document.activeElement === document.body || document.activeElement === enterBtn)) {
                dismissLanding();
            }
        }
    });
}

function setupNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const logoBtn = document.getElementById("logo-btn");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const tabKey = item.getAttribute("data-tab");
            const path = window.location.pathname;

            if (tabKey === "home" && (path.endsWith("tvshows.html") || path.endsWith("movies.html"))) {
                window.location.href = "index.html";
                return;
            } else if (tabKey === "tv" && !path.endsWith("tvshows.html")) {
                window.location.href = "tvshows.html";
                return;
            } else if (tabKey === "movies" && !path.endsWith("movies.html")) {
                window.location.href = "movies.html";
                return;
            }

            switchTab(tabKey);
        });
    });

    if (logoBtn) {
        logoBtn.addEventListener("click", () => {
            const path = window.location.pathname;
            if (path.endsWith("tvshows.html") || path.endsWith("movies.html")) {
                window.location.href = "index.html";
            } else {
                switchTab("home");
            }
        });
    }
}

function switchTab(tabKey) {
    if (typeof tabConfigs === "undefined" || !tabConfigs[tabKey]) return;

    const path = window.location.pathname;
    if (tabKey === "home" && (path.endsWith("tvshows.html") || path.endsWith("movies.html"))) {
        window.location.href = "index.html";
        return;
    } else if (tabKey === "tv" && !path.endsWith("tvshows.html")) {
        window.location.href = "tvshows.html";
        return;
    } else if (tabKey === "movies" && !path.endsWith("movies.html")) {
        window.location.href = "movies.html";
        return;
    }

    currentTab = tabKey;

    document.querySelectorAll(".nav-item").forEach(item => {
        if (item.getAttribute("data-tab") === tabKey) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    clearSearch(false);
    loadTab(tabKey);
}

function loadTab(tabKey) {
    if (typeof tabConfigs === "undefined" || typeof catalogData === "undefined") return;
    const config = tabConfigs[tabKey];

    const contentRowsContainer = document.getElementById("content-rows-container");
    const mylistEmptySection = document.getElementById("mylist-empty-section");
    const searchResultsSection = document.getElementById("search-results-section");
    const reactSection = document.getElementById("react-section");
    const heroBanner = document.getElementById("hero-banner");

    if (searchResultsSection) searchResultsSection.classList.add("hidden");
    if (heroBanner) heroBanner.classList.remove("hidden");

    if (tabKey === "movies") {
        if (reactSection) reactSection.classList.remove("hidden");
        if (typeof initReactApp === "function") {
            initReactApp();
        }
    } else {
        if (reactSection) reactSection.classList.add("hidden");
    }

    if (tabKey === "home") {
        if (typeof startHeroSlideshow === "function") startHeroSlideshow();
        if (typeof displayHeroSlide === "function") displayHeroSlide(currentHeroIndex);
    } else {
        if (typeof pauseHeroSlideshow === "function") pauseHeroSlideshow(false);
        const heroItem = catalogData.find(i => i.id === config.heroItemId) || catalogData[0];
        if (typeof updateHeroBanner === "function") updateHeroBanner(heroItem, config.heroBadge);
    }

    if (!contentRowsContainer) return;

    if (tabKey === "mylist") {
        contentRowsContainer.innerHTML = "";

        if (myList.length === 0) {
            contentRowsContainer.classList.add("hidden");
            if (mylistEmptySection) mylistEmptySection.classList.remove("hidden");
        } else {
            if (mylistEmptySection) mylistEmptySection.classList.add("hidden");
            contentRowsContainer.classList.remove("hidden");

            const myItems = catalogData.filter(item => myList.includes(item.id));
            const movieCount = myItems.filter(i => i.type === "movie").length;
            const tvCount = myItems.filter(i => i.type === "tv").length;

            const filteredItems = myItems.filter(item => {
                if (myListFilter === "movie") return item.type === "movie";
                if (myListFilter === "tv") return item.type === "tv";
                return true;
            });

            const headerDiv = document.createElement("div");
            headerDiv.classList.add("mylist-header-container");
            headerDiv.innerHTML = `
                <div class="mylist-header-left">
                    <h2 class="mylist-title">MY LIST</h2>
                    <span class="mylist-subtitle">${myItems.length} ${myItems.length === 1 ? 'TITLE' : 'TITLES'} SAVED</span>
                </div>
                <div class="mylist-filter-tabs" role="tablist" aria-label="Filter My List by Media Type">
                    <button class="mylist-filter-btn ${myListFilter === 'all' ? 'active' : ''}" data-filter="all">All (${myItems.length})</button>
                    <button class="mylist-filter-btn ${myListFilter === 'movie' ? 'active' : ''}" data-filter="movie">Movies (${movieCount})</button>
                    <button class="mylist-filter-btn ${myListFilter === 'tv' ? 'active' : ''}" data-filter="tv">TV Shows (${tvCount})</button>
                </div>
            `;

            headerDiv.querySelectorAll(".mylist-filter-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    myListFilter = btn.getAttribute("data-filter");
                    loadTab("mylist");
                });
            });

            contentRowsContainer.appendChild(headerDiv);

            if (filteredItems.length === 0) {
                const filterEmptyDiv = document.createElement("div");
                filterEmptyDiv.classList.add("empty-search-box");
                filterEmptyDiv.style.margin = "40px auto";
                filterEmptyDiv.innerHTML = `
                    <div class="empty-search-icon">🔍</div>
                    <h3>NO ${myListFilter === 'movie' ? 'MOVIES' : 'TV SHOWS'} IN YOUR LIST</h3>
                    <p>You have items in your watchlist, but none match the ${myListFilter === 'movie' ? 'Movies' : 'TV Shows'} filter.</p>
                    <button class="primary-btn clear-filters-btn" onclick="setMyListFilter('all')">Show All Saved Titles</button>
                `;
                contentRowsContainer.appendChild(filterEmptyDiv);
            } else {
                const postersDiv = document.createElement("div");
                postersDiv.classList.add("search-grid");

                filteredItems.forEach(item => {
                    postersDiv.appendChild(createMovieCard(item));
                });

                contentRowsContainer.appendChild(postersDiv);
            }
        }
    } else {
        if (mylistEmptySection) mylistEmptySection.classList.add("hidden");
        contentRowsContainer.classList.remove("hidden");
        contentRowsContainer.innerHTML = "";

        if (config && config.rows) {
            config.rows.forEach(row => {
                const matchingItems = catalogData.filter(item => item.categories.includes(row.category));
                if (matchingItems.length > 0) {
                    const isTop10 = row.category === "top10" || row.title.toLowerCase().includes("top 10");
                    const rowDisplayTitle = (row.titleKey && typeof t === "function") ? t(row.titleKey) : row.title;
                    const movieRow = renderMovieRow(rowDisplayTitle, matchingItems, isTop10);
                    contentRowsContainer.appendChild(movieRow);
                }
            });
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderMovieRow(rowTitle, items, isTop10 = false) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("movie-row");
    if (isTop10) rowDiv.classList.add("top10-row");

    const titleH3 = document.createElement("h3");
    titleH3.innerHTML = `<span>${rowTitle}</span>${isTop10 ? '<span class="row-category-tag">TOP 10</span>' : ''}`;
    rowDiv.appendChild(titleH3);

    const postersDiv = document.createElement("div");
    postersDiv.classList.add("row-posters");

    items.slice(0, 10).forEach((item, index) => {
        postersDiv.appendChild(createMovieCard(item, isTop10 ? index + 1 : null));
    });

    rowDiv.appendChild(postersDiv);
    return rowDiv;
}

function highlightMatch(text, query) {
    if (!text) return "";
    const cleanQuery = query ? query.trim() : "";
    if (!cleanQuery) return text;

    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");

    return text.replace(regex, `<mark class="search-highlight">$1</mark>`);
}

function createMovieCard(item, rankNumber = null, searchQuery = "") {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.setAttribute("data-id", item.id);
    if (rankNumber) card.classList.add("top10-card");

    const inList = isInMyList(item.id);
    const uRating = getUserRating(item.id);

    let rankHtml = '';
    if (rankNumber) {
        const formattedRank = rankNumber < 10 ? `0${rankNumber}` : `${rankNumber}`;
        rankHtml = `<div class="rank-number-wrapper" aria-hidden="true"><span class="rank-number">${formattedRank}</span></div>`;
    }

    let badgeHtml = '';
    if (item.isNew) {
        badgeHtml += `<span class="card-status-badge badge-new">${typeof t === "function" ? t("newBadge") : "NEW"}</span>`;
    } else if (item.isPopular) {
        badgeHtml += `<span class="card-status-badge badge-trending">${typeof t === "function" ? t("trendingBadge") : "TRENDING"}</span>`;
    } else if (item.defaultRating && item.defaultRating >= 8.8) {
        badgeHtml += `<span class="card-status-badge badge-highly-rated">${typeof t === "function" ? t("highlyRated") : "HIGHLY RATED"}</span>`;
    } else if (item.type === "tv") {
        badgeHtml += `<span class="card-status-badge badge-tv-season">${item.duration || 'TV'}</span>`;
    }

    const yourRatingLabel = typeof t === "function" ? t("yourRating") : "Your Rating";
    let userRatingBadgeHtml = uRating !== null
        ? `<span class="card-user-rating-badge" title="${yourRatingLabel}: ${uRating}/10">★ ${uRating}/10</span>`
        : '';

    const defaultRatingText = item.defaultRating ? `⭐ ${item.defaultRating}/10` : '⭐ 8.5/10';

    const addListTitle = typeof t === "function" ? t("addToMyList") : "Add to My List";
    const removeListTitle = typeof t === "function" ? t("removeFromMyList") : "Remove from My List";
    const typeLabelText = item.type === "tv" ? (typeof t === "function" ? t("filterTvShow") : "TV") : (typeof t === "function" ? t("filterMovie") : "MOVIE");

    card.innerHTML = `
        ${rankHtml}
        <div class="poster-container">
            <img src="${item.thumb}" alt="${item.title}" class="poster" loading="lazy" onerror="this.onerror=null; this.src='assets/matrix_awakens.jpg';">
            <div class="movie-card-overlay">
                <div class="card-top-bar">
                    <div class="card-badges">
                        <span class="card-type-badge">${typeLabelText}</span>
                        ${badgeHtml}
                        ${userRatingBadgeHtml}
                    </div>
                    <button class="card-bookmark-btn ${inList ? 'active' : ''}" title="${inList ? removeListTitle : addListTitle}" aria-label="${inList ? removeListTitle : addListTitle}">
                        ${inList ? '✓' : '＋'}
                    </button>
                </div>
                <div class="play-center-btn" title="Play Trailer">▶</div>
                <div class="card-bottom-info">
                    <p class="card-title">${highlightMatch(item.title, searchQuery)}</p>
                    <div class="card-sub-info">
                        <span class="card-default-rating">${defaultRatingText}</span>
                        <span class="card-year">${item.year}</span>
                        <span class="meta-rating">${item.rating}</span>
                        <span class="card-duration">${item.duration}</span>
                    </div>
                    <div class="card-genre">${item.genre}</div>
                </div>
            </div>
        </div>
    `;

    card.addEventListener("click", (e) => {
        if (e.target.closest(".card-bookmark-btn")) {
            e.stopPropagation();
            toggleMyList(item.id);
            const bookmarkBtn = card.querySelector(".card-bookmark-btn");
            const nowInList = isInMyList(item.id);
            if (bookmarkBtn) {
                bookmarkBtn.classList.toggle("active", nowInList);
                bookmarkBtn.textContent = nowInList ? "✓" : "＋";
                bookmarkBtn.title = nowInList ? 'Remove from My List' : 'Add to My List';
                bookmarkBtn.setAttribute("aria-label", nowInList ? 'Remove from My List' : 'Add to My List');
            }
            return;
        }

        openDetailModal(item);
    });

    return card;
}

function setupSearch() {
    const searchInput = document.getElementById("search-input");
    const searchToggleBtn = document.getElementById("search-toggle-btn");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    const searchBox = document.getElementById("search-box");
    const dropdown = document.getElementById("search-suggestions-dropdown");

    const filterType = document.getElementById("filter-type");
    const filterGenre = document.getElementById("filter-genre");
    const sortBy = document.getElementById("sort-by");

    initSearchFilterOptions();

    if (searchToggleBtn && searchBox && searchInput) {
        searchToggleBtn.addEventListener("click", () => {
            searchBox.classList.toggle("active");
            if (searchBox.classList.contains("active")) {
                searchInput.focus();
                const query = searchInput.value.trim().toLowerCase();
                if (query.length > 0) {
                    hideSearchSuggestions();
                    performSearch(query);
                }
            }
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const query = searchInput.value.trim().toLowerCase();
                if (query.length > 0) {
                    hideSearchSuggestions();
                    performSearch(query);
                }
            }
        });

        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length > 0) {
                if (clearSearchBtn) clearSearchBtn.classList.remove("hidden");
                renderSearchSuggestions(query);
                performSearch(query);
            } else {
                hideSearchSuggestions();
                clearSearch(true);
            }
        });

        searchInput.addEventListener("focus", () => {
            const query = searchInput.value.trim().toLowerCase();
            if (query.length > 0) renderSearchSuggestions(query);
        });

        document.addEventListener("click", (e) => {
            if (!searchBox.contains(e.target)) {
                hideSearchSuggestions();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                hideSearchSuggestions();
                closeDetailsModal();
                closePlayer();
                closeAuthModal();
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            clearSearch(true);
        });
    }

    [filterType, filterGenre, sortBy].forEach(el => {
        if (el) {
            el.addEventListener("change", () => {
                const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
                applySearchFiltersAndSort(query);
            });
        }
    });
}

function initSearchFilterOptions() {
    if (typeof catalogData === "undefined") return;
    const filterGenre = document.getElementById("filter-genre");
    if (!filterGenre) return;

    const allGenres = new Set();
    catalogData.forEach(item => {
        if (item.genre) {
            item.genre.split(",").forEach(g => allGenres.add(g.trim()));
        }
    });

    filterGenre.innerHTML = `<option value="all">All Genres</option>`;
    Array.from(allGenres).sort().forEach(g => {
        const option = document.createElement("option");
        option.value = g.toLowerCase();
        option.textContent = g;
        filterGenre.appendChild(option);
    });
}

function renderSearchSuggestions(query) {
    const dropdown = document.getElementById("search-suggestions-dropdown");
    if (!dropdown || typeof catalogData === "undefined") return;

    const cleanQuery = query ? query.trim().toLowerCase() : "";
    if (!cleanQuery) {
        hideSearchSuggestions();
        return;
    }

    const matches = catalogData.filter(item =>
        item.title ? item.title.toLowerCase().includes(cleanQuery) : false
    ).slice(0, 5);

    if (matches.length === 0) {
        hideSearchSuggestions();
        return;
    }

    dropdown.innerHTML = "";
    matches.forEach(item => {
        const uRating = getUserRating(item.id);
        const userRatingHtml = uRating !== null ? `<span style="color:#fbbf24; font-weight:700;">• ★ ${uRating}/10</span>` : '';
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item");
        suggestionItem.innerHTML = `
            <img src="${item.thumb}" alt="${item.title}" class="suggestion-thumb" onerror="this.onerror=null; this.src='assets/matrix_awakens.jpg';">
            <div class="suggestion-info">
                <span class="suggestion-title">${highlightMatch(item.title, cleanQuery)}</span>
                <div class="suggestion-meta">
                    <span style="color:#fbbf24; font-weight:700;">⭐ ${item.defaultRating || '8.5'}/10</span>
                    <span>• ${item.year}</span>
                    <span class="suggestion-type">${item.type.toUpperCase()}</span>
                    ${userRatingHtml}
                </div>
            </div>
        `;

        suggestionItem.addEventListener("click", () => {
            hideSearchSuggestions();
            openDetailModal(item);
        });

        dropdown.appendChild(suggestionItem);
    });

    dropdown.classList.remove("hidden");
}

function hideSearchSuggestions() {
    const dropdown = document.getElementById("search-suggestions-dropdown");
    if (dropdown) dropdown.classList.add("hidden");
}

function performSearch(query) {
    const searchResultsSection = document.getElementById("search-results-section");
    const contentRowsContainer = document.getElementById("content-rows-container");
    const mylistEmptySection = document.getElementById("mylist-empty-section");
    const heroBanner = document.getElementById("hero-banner");

    if (contentRowsContainer) contentRowsContainer.classList.add("hidden");
    if (mylistEmptySection) mylistEmptySection.classList.add("hidden");
    if (heroBanner) heroBanner.classList.add("hidden");
    if (searchResultsSection) searchResultsSection.classList.remove("hidden");

    applySearchFiltersAndSort(query);
}

function applySearchFiltersAndSort(query = "") {
    const searchGrid = document.getElementById("search-grid");
    const searchResultsTitle = document.getElementById("search-results-title");
    if (!searchGrid) return;
    searchGrid.innerHTML = "";

    const typeFilter = document.getElementById("filter-type") ? document.getElementById("filter-type").value : "all";
    const genreFilter = document.getElementById("filter-genre") ? document.getElementById("filter-genre").value : "all";
    const sortVal = document.getElementById("sort-by") ? document.getElementById("sort-by").value : "match";

    const cleanQuery = query ? query.trim().toLowerCase() : "";

    let results = catalogData.filter(item => {
        const titleMatch = !cleanQuery || (item.title ? item.title.toLowerCase().includes(cleanQuery) : false);

        const matchesType = typeFilter === "all" || (item.type && item.type.toLowerCase() === typeFilter.toLowerCase());
        const matchesGenre = genreFilter === "all" || (item.genre && item.genre.toLowerCase().includes(genreFilter.toLowerCase()));

        return titleMatch && matchesType && matchesGenre;
    });

    results.sort((a, b) => {
        if (sortVal === "match") {
            const scoreA = parseInt(a.match) || 0;
            const scoreB = parseInt(b.match) || 0;
            return scoreB - scoreA;
        } else if (sortVal === "newest") {
            return b.year - a.year;
        } else if (sortVal === "title") {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });

    if (searchResultsTitle) {
        searchResultsTitle.textContent = query
            ? `Results for "${query}" (${results.length})`
            : `All Catalog Titles (${results.length})`;
    }

    if (results.length === 0) {
        searchGrid.innerHTML = `
            <div class="empty-search-box">
                <div class="empty-search-icon">🔍</div>
                <h3>NO MOVIES OR SHOWS FOUND</h3>
                <p>No titles matched your search query or selected filters. Try adjusting your keyword or clearing filters!</p>
                <button class="primary-btn clear-filters-btn" onclick="clearSearch(true)">Clear Search & Filters</button>
            </div>
        `;
    } else {
        results.forEach(item => {
            searchGrid.appendChild(createMovieCard(item, null, cleanQuery));
        });
    }
}

function clearSearch(reloadCurrentTab = true) {
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    const searchResultsSection = document.getElementById("search-results-section");

    const filterType = document.getElementById("filter-type");
    const filterGenre = document.getElementById("filter-genre");
    const sortBy = document.getElementById("sort-by");

    const hadSearchText = searchInput && searchInput.value.trim().length > 0;

    if (searchInput) searchInput.value = "";
    if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
    if (searchResultsSection) searchResultsSection.classList.add("hidden");
    hideSearchSuggestions();

    if (filterType) filterType.value = "all";
    if (filterGenre) filterGenre.value = "all";
    if (sortBy) sortBy.value = "match";

    if (hadSearchText && typeof showToast === "function") {
        showToast("Search cleared", "info");
    }

    if (reloadCurrentTab) {
        loadTab(currentTab);
    }
}

function isInMyList(id) {
    return myList.includes(id);
}

function setMyListFilter(filterKey) {
    myListFilter = filterKey;
    if (currentTab === "mylist") {
        loadTab("mylist");
    }
}

function toggleMyList(id) {
    const index = myList.indexOf(id);
    const item = catalogData.find(i => i.id === id);
    const title = item ? item.title : "Title";

    if (index > -1) {
        myList.splice(index, 1);
        const removedMsg = typeof t === "function" ? t("removedFromMyListMsg") : "Removed from My List";
        if (typeof showToast === "function") showToast(`✓ ${removedMsg}`, "warning");
    } else {
        myList.push(id);
        const addedMsg = typeof t === "function" ? t("addedToMyListMsg") : "Added to My List";
        if (typeof showToast === "function") showToast(`✓ ${addedMsg}`, "success");
    }

    localStorage.setItem("movieMatrix_myList", JSON.stringify(myList));
    updateMyListBadge();

    if (currentTab === "mylist") {
        loadTab("mylist");
    }
}

function updateMyListBadge() {
    const countBadge = document.getElementById("mylist-count");
    if (countBadge) {
        countBadge.textContent = myList.length;
    }
}

function updateMyListButton(buttonEl, itemId) {
    if (!buttonEl) return;
    const inList = isInMyList(itemId);
    const inListText = typeof t === "function" ? t("inMyList") : "In My List";
    const addListText = typeof t === "function" ? t("addToMyList") : "Add to My List";
    const removeListText = typeof t === "function" ? t("removeFromMyList") : "Remove from My List";

    if (inList) {
        buttonEl.classList.add("added");
        buttonEl.textContent = `✓ ${inListText}`;
        buttonEl.title = removeListText;
    } else {
        buttonEl.classList.remove("added");
        buttonEl.textContent = `＋ ${addListText}`;
        buttonEl.title = addListText;
    }
}

function openDetailModal(item) {
    if (!item) return;
    const modal = document.getElementById("details-modal");

    const posterImg = document.getElementById("details-poster-img");
    const titleEl = document.getElementById("details-modal-title");
    const matchEl = document.getElementById("details-match");
    const yearEl = document.getElementById("details-year");
    const ratingEl = document.getElementById("details-rating");
    const durationEl = document.getElementById("details-duration");
    const typeEl = document.getElementById("details-type-badge");
    const defaultRatingEl = document.getElementById("details-default-rating");
    const descriptionEl = document.getElementById("details-description");
    const genreEl = document.getElementById("details-genre");
    const castEl = document.getElementById("details-cast");

    if (posterImg) {
        posterImg.src = item.thumb || 'assets/matrix_awakens.jpg';
        posterImg.alt = item.title;
        posterImg.onerror = () => { posterImg.src = 'assets/matrix_awakens.jpg'; };
    }
    if (titleEl) titleEl.textContent = item.title;
    if (matchEl) matchEl.textContent = item.match || '98% Match';
    if (yearEl) yearEl.textContent = item.year;
    if (ratingEl) ratingEl.textContent = item.rating;
    if (durationEl) durationEl.textContent = item.duration;
    if (typeEl) typeEl.textContent = item.type ? item.type.toUpperCase() : 'MOVIE';
    if (defaultRatingEl) defaultRatingEl.textContent = `⭐ ${item.defaultRating || '8.5'}/10`;
    if (descriptionEl) descriptionEl.textContent = item.description;
    if (genreEl) genreEl.textContent = item.genre;
    if (castEl) castEl.textContent = item.cast;

    renderModalUserRatingWidget(item);

    const watchTrailerBtn = document.getElementById("details-watch-trailer-btn");
    const mylistBtn = document.getElementById("details-mylist-btn");

    if (watchTrailerBtn) {
        watchTrailerBtn.onclick = () => {
            closeDetailsModal();
            openPlayer(item.youtubeId || item.id);
        };
    }

    if (mylistBtn) {
        updateMyListButton(mylistBtn, item.id);
        mylistBtn.onclick = () => {
            toggleMyList(item.id);
            updateMyListButton(mylistBtn, item.id);
        };
    }

    if (modal) {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }
}

function closeDetailsModal() {
    const modal = document.getElementById("details-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.body.style.overflow = "auto";
    }
}

function renderModalUserRatingWidget(item) {
    const ratingBox = document.getElementById("details-user-rating-box");
    if (!ratingBox) return;

    const currentScore = getUserRating(item.id);

    ratingBox.innerHTML = `
        <div class="rating-box-header">
            <span class="rating-box-title">
                <span>⭐</span> Your Rating
            </span>
            <span id="modal-rating-score-display" class="rating-score-display">
                ${currentScore !== null ? `★ ${currentScore}/10` : 'Not rated yet'}
            </span>
        </div>
        <div id="modal-star-widget" class="star-rating-widget" role="radiogroup" aria-label="Rate ${item.title} from 1 to 10">
            ${[1, 2, 3, 4, 5].map(starIndex => {
                const scoreValue = starIndex * 2;
                const isFilled = currentScore !== null && currentScore >= scoreValue;
                return `
                    <button type="button"
                        class="star-btn ${isFilled ? 'active' : ''}"
                        data-score="${scoreValue}"
                        data-star="${starIndex}"
                        aria-label="Rate ${scoreValue} out of 10 for ${item.title}"
                        title="Rate ${scoreValue}/10"
                    >
                        ${isFilled ? '★' : '☆'}
                    </button>
                `;
            }).join('')}
        </div>
    `;

    const starBtns = ratingBox.querySelectorAll(".star-btn");
    const scoreDisplay = document.getElementById("modal-rating-score-display");

    starBtns.forEach((btn, index) => {
        const scoreValue = (index + 1) * 2;

        btn.addEventListener("mouseenter", () => {
            starBtns.forEach((b, i) => {
                if (i <= index) {
                    b.classList.add("hovered");
                    b.textContent = '★';
                } else {
                    b.classList.remove("hovered");
                    b.textContent = '☆';
                }
            });
            if (scoreDisplay) {
                scoreDisplay.textContent = `★ ${scoreValue}/10`;
            }
        });

        btn.addEventListener("mouseleave", () => {
            const savedScore = getUserRating(item.id);
            starBtns.forEach((b, i) => {
                b.classList.remove("hovered");
                const bScore = (i + 1) * 2;
                const isSaved = savedScore !== null && savedScore >= bScore;
                b.classList.toggle("active", isSaved);
                b.textContent = isSaved ? '★' : '☆';
            });
            if (scoreDisplay) {
                scoreDisplay.textContent = savedScore !== null ? `★ ${savedScore}/10` : 'Not rated yet';
            }
        });

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            setUserRating(item.id, scoreValue);
        });
    });
}

function openPlayer(youtubeIdOrItem) {
    let item;
    if (typeof youtubeIdOrItem === "object" && youtubeIdOrItem !== null) {
        item = youtubeIdOrItem;
    } else {
        item = catalogData.find(i => i.youtubeId === youtubeIdOrItem || i.id === youtubeIdOrItem) || catalogData[0];
    }

    const modal = document.getElementById("video-modal");
    const iframe = document.getElementById("youtube-player");
    const titleEl = document.getElementById("trailer-modal-title");

    if (titleEl && item) {
        titleEl.textContent = `${item.title} - Official Trailer`;
    }

    if (iframe && item) {
        iframe.src = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    }

    if (modal) {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }
}

function closePlayer() {
    const modal = document.getElementById("video-modal");
    const iframe = document.getElementById("youtube-player");

    if (modal) modal.classList.add("hidden");
    if (iframe) iframe.src = "";
    document.body.style.overflow = "auto";
}

function setupAuth() {
    const navSigninBtn = document.getElementById("nav-signin-btn");
    const navSignoutBtn = document.getElementById("nav-signout-btn");
    const userAvatarBtn = document.getElementById("user-avatar-btn");
    const userDropdownMenu = document.getElementById("user-dropdown-menu");
    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");
    const signupPasswordInput = document.getElementById("signup-password");

    updateUserUI();

    if (navSigninBtn) {
        navSigninBtn.addEventListener("click", () => {
            openAuthModal("signin");
        });
    }

    if (navSignoutBtn) {
        navSignoutBtn.addEventListener("click", () => {
            handleSignOut();
        });
    }

    if (userAvatarBtn && userDropdownMenu) {
        userAvatarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", () => {
            userDropdownMenu.classList.add("hidden");
        });
    }

    if (signupPasswordInput) {
        signupPasswordInput.addEventListener("input", (e) => {
            validatePasswordRequirements(e.target.value);
        });
    }

    if (signinForm) {
        signinForm.addEventListener("submit", handleSignIn);
    }

    if (signupForm) {
        signupForm.addEventListener("submit", handleSignUp);
    }
}

function validatePasswordRequirements(password) {
    const ruleLength = document.getElementById("rule-length");
    const ruleUppercase = document.getElementById("rule-uppercase");
    const ruleSpecial = document.getElementById("rule-special");

    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+-=]/.test(password);

    updateRuleItem(ruleLength, hasLength);
    updateRuleItem(ruleUppercase, hasUppercase);
    updateRuleItem(ruleSpecial, hasSpecial);

    return hasLength && hasUppercase && hasSpecial;
}

function updateRuleItem(element, isValid) {
    if (!element) return;
    const icon = element.querySelector(".rule-icon");
    if (isValid) {
        element.classList.add("valid");
        element.classList.remove("invalid");
        if (icon) icon.textContent = "✓";
    } else {
        element.classList.remove("valid");
        element.classList.add("invalid");
        if (icon) icon.textContent = "✖";
    }
}

function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        btnEl.textContent = "🙈";
    } else {
        input.type = "password";
        btnEl.textContent = "👁️";
    }
}

function switchAuthTab(tab) {
    const signinTab = document.getElementById("tab-signin");
    const signupTab = document.getElementById("tab-signup");
    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");
    const authSubtitle = document.getElementById("auth-subtitle");
    const signinError = document.getElementById("signin-error");
    const signupError = document.getElementById("signup-error");

    if (signinError) signinError.classList.add("hidden");
    if (signupError) signupError.classList.add("hidden");

    if (tab === "signin") {
        if (signinTab) signinTab.classList.add("active");
        if (signupTab) signupTab.classList.remove("active");
        if (signinForm) signinForm.classList.remove("hidden");
        if (signupForm) signupForm.classList.add("hidden");
        if (authSubtitle) authSubtitle.textContent = "Sign in to access your personal watchlist and streaming features.";
    } else {
        if (signupTab) signupTab.classList.add("active");
        if (signinTab) signinTab.classList.remove("active");
        if (signupForm) signupForm.classList.remove("hidden");
        if (signinForm) signinForm.classList.add("hidden");
        if (authSubtitle) authSubtitle.textContent = "Create an account to save movies, customize recommendations, and stream anywhere.";
    }
}

function openAuthModal(tab = "signin") {
    switchAuthTab(tab);
    const modal = document.getElementById("auth-modal");
    if (modal) {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }
}

function closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) {
        modal.classList.add("hidden");
        document.body.style.overflow = "auto";
    }
}

function handleSignIn(e) {
    e.preventDefault();
    const emailInput = document.getElementById("signin-email");
    const passwordInput = document.getElementById("signin-password");
    const errorDiv = document.getElementById("signin-error");

    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        if (errorDiv) {
            errorDiv.textContent = "Please enter your email address.";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Email is required", "error");
        return;
    }

    if (!emailRegex.test(email)) {
        if (errorDiv) {
            errorDiv.textContent = "Please enter a valid email address (e.g. name@example.com).";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Invalid email format", "warning");
        return;
    }

    if (!password) {
        if (errorDiv) {
            errorDiv.textContent = "Please enter your password.";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Password is required", "error");
        return;
    }

    const users = JSON.parse(localStorage.getItem("movieMatrix_users") || "[]");
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
        if (errorDiv) {
            errorDiv.textContent = "Invalid email or password. Please check your credentials or create a new account.";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Invalid email or password", "error");
        return;
    }

    currentUser = { name: foundUser.name, email: foundUser.email };
    localStorage.setItem("movieMatrix_currentUser", JSON.stringify(currentUser));

    updateUserUI();
    closeAuthModal();
    if (typeof showToast === "function") showToast(`Welcome back, ${foundUser.name.split(' ')[0]}! 👋`, "success");

    if (emailInput) emailInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (errorDiv) errorDiv.classList.add("hidden");
}

function handleSignUp(e) {
    e.preventDefault();
    const nameInput = document.getElementById("signup-name");
    const emailInput = document.getElementById("signup-email");
    const passwordInput = document.getElementById("signup-password");
    const errorDiv = document.getElementById("signup-error");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
        if (errorDiv) {
            errorDiv.textContent = "Please enter your full name.";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Full name is required", "error");
        return;
    }

    if (!email || !emailRegex.test(email)) {
        if (errorDiv) {
            errorDiv.textContent = "Please enter a valid email address.";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Invalid email format", "warning");
        return;
    }

    const isValidPassword = validatePasswordRequirements(password);

    if (!isValidPassword) {
        if (errorDiv) {
            errorDiv.textContent = "Password must be at least 8 characters, contain 1 capital letter, and 1 special character.";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Password does not meet security requirements", "warning");
        return;
    }

    const users = JSON.parse(localStorage.getItem("movieMatrix_users") || "[]");
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        if (errorDiv) {
            errorDiv.textContent = "An account with this email address already exists. Please sign in instead.";
            errorDiv.classList.remove("hidden");
        }
        if (typeof showToast === "function") showToast("Account already exists", "warning");
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("movieMatrix_users", JSON.stringify(users));

    currentUser = { name, email };
    localStorage.setItem("movieMatrix_currentUser", JSON.stringify(currentUser));

    updateUserUI();
    closeAuthModal();
    if (typeof showToast === "function") showToast(`Account created! Welcome to Movie Matrix, ${name.split(' ')[0]}! 🎉`, "success");

    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (errorDiv) errorDiv.classList.add("hidden");
}

function handleGuestLogin() {
    currentUser = {
        name: "Guest Explorer",
        email: "guest@moviematrix.io",
        isGuest: true
    };
    localStorage.setItem("movieMatrix_currentUser", JSON.stringify(currentUser));
    updateUserUI();
    closeAuthModal();
    if (typeof showToast === "function") showToast("Welcome back 👋", "success");
}

function handleGoogleSignIn() {

    if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
            window.google.accounts.id.prompt();
            return;
        } catch (err) {
            console.error("Movie Matrix: Google Identity SDK prompt failed", err);
        }
    }

    if (window.firebase && window.firebase.auth) {
        try {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            window.firebase.auth().signInWithPopup(provider).then((result) => {
                const user = result.user;
                currentUser = { name: user.displayName || "Google User", email: user.email };
                localStorage.setItem("movieMatrix_currentUser", JSON.stringify(currentUser));
                updateUserUI();
                closeAuthModal();
                const firstName = currentUser.name.split(" ")[0];
                if (typeof showToast === "function") showToast(`Welcome back, ${firstName}! 👋`, "success");
            }).catch((error) => {
                console.error("Movie Matrix: Firebase Google auth error", error);
                const msg = typeof t === "function" ? t("googleSignInNotCompleted") : "Google sign-in could not be completed.";
                if (typeof showToast === "function") showToast(`✖ ${msg}`, "error");
            });
            return;
        } catch (err) {
            console.error("Movie Matrix: Firebase provider initialization failed", err);
        }
    }

    console.warn("Movie Matrix: Google OAuth Backend Integration Notice\\n----------------------------------------------------\\nTo enable live Google Sign-In:\\n1. Obtain a Client ID from Google Cloud Console (https://console.cloud.google.com)\\n2. Add script: <script src=\"https://accounts.google.com/gsi/client\" async defer></script>\\n3. Initialize client: google.accounts.id.initialize({ client_id: 'YOUR_CLIENT_ID', callback: handleCredentialResponse });");
    const errorMsg = typeof t === "function" ? t("googleSignInNotCompleted") : "Google sign-in could not be completed.";
    if (typeof showToast === "function") {
        showToast(`⚠️ ${errorMsg}`, "warning");
    }
}

function handleSignOut() {
    currentUser = null;
    localStorage.removeItem("movieMatrix_currentUser");
    updateUserUI();
    if (typeof showToast === "function") showToast("Signed out successfully 👋", "warning");
}

function updateUserUI() {
    const navSigninBtn = document.getElementById("nav-signin-btn");
    const userMenuWrapper = document.getElementById("user-menu-wrapper");
    const userInitials = document.getElementById("user-initials");
    const userNameLabel = document.getElementById("user-name-label");
    const userFullName = document.getElementById("user-full-name");
    const userEmailText = document.getElementById("user-email-text");

    if (currentUser) {
        if (navSigninBtn) navSigninBtn.classList.add("hidden");
        if (userMenuWrapper) userMenuWrapper.classList.remove("hidden");

        const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        if (userInitials) userInitials.textContent = initials || "U";
        if (userNameLabel) userNameLabel.textContent = currentUser.name.split(" ")[0];

        if (userFullName) {
            userFullName.innerHTML = `<span style="display:block; font-size:0.75rem; color:var(--accent-color); font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">Welcome back 👋</span>${currentUser.name}`;
        }
        if (userEmailText) userEmailText.textContent = currentUser.email;
    } else {
        if (navSigninBtn) navSigninBtn.classList.remove("hidden");
        if (userMenuWrapper) userMenuWrapper.classList.add("hidden");
    }
}

