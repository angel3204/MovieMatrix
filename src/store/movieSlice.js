import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { catalogData } from '../data/catalogData';
import * as movieApi from '../services/movieApi';
import { TMDB_GENRE_MAP } from '../services/movieApi';

// Helper to load watchlist from localStorage safely
const loadSavedWatchlist = () => {
    try {
        const saved = localStorage.getItem("movieMatrix_myList");
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

// Helper to save watchlist to localStorage safely
const persistWatchlist = (list) => {
    try {
        localStorage.setItem("movieMatrix_myList", JSON.stringify(list));
    } catch (e) {
        console.error("Failed to persist watchlist to localStorage:", e);
    }
};

const initialFilters = {
    mediaType: 'all',
    genre: 'all',
    year: 'all',
    rating: 'all'
};

// ==========================================
// REDUX ASYNC THUNKS (API Integration)
// ==========================================

// 1. Fetch Home Sections (Trending, Popular, Top Rated, Upcoming)
export const fetchHomeSections = createAsyncThunk(
    'movies/fetchHomeSections',
    async (_, { rejectWithValue }) => {
        try {
            const [trending, popular, topRated, upcoming] = await Promise.all([
                movieApi.getTrendingMovies(1),
                movieApi.getPopularMovies(1),
                movieApi.getTopRatedMovies(1),
                movieApi.getUpcomingMovies(1)
            ]);

            return {
                trending: trending.results,
                popular: popular.results,
                topRated: topRated.results,
                upcoming: upcoming.results
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Something went wrong.');
        }
    }
);

// 2. Fetch Movies with Pagination
export const fetchMoviesList = createAsyncThunk(
    'movies/fetchMoviesList',
    async ({ page = 1, append = false } = {}, { rejectWithValue }) => {
        try {
            const data = await movieApi.getPopularMovies(page);
            return {
                results: data.results,
                page,
                totalPages: data.totalPages,
                append
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Something went wrong.');
        }
    }
);

// 3. Fetch TV Shows with Pagination
export const fetchTVShowsList = createAsyncThunk(
    'movies/fetchTVShowsList',
    async ({ page = 1, append = false } = {}, { rejectWithValue }) => {
        try {
            const data = await movieApi.getPopularTVShows(page);
            return {
                results: data.results,
                page,
                totalPages: data.totalPages,
                append
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Something went wrong.');
        }
    }
);

// 4. Fetch Movie Details
export const fetchMovieDetailsThunk = createAsyncThunk(
    'movies/fetchMovieDetails',
    async ({ movieId, type = 'movie' }, { rejectWithValue }) => {
        try {
            const details = await movieApi.getMovieDetails(movieId, type);
            return details;
        } catch (error) {
            return rejectWithValue(error.message || 'Something went wrong.');
        }
    }
);

// 5. Fetch Search Results
export const fetchSearchThunk = createAsyncThunk(
    'movies/fetchSearch',
    async ({ query, page = 1 }, { rejectWithValue }) => {
        try {
            const data = await movieApi.searchMovies(query, page);
            return {
                results: data.results,
                query,
                page,
                totalResults: data.totalResults
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Something went wrong.');
        }
    }
);

// ==========================================
// MOVIE SLICE
// ==========================================

const initialState = {
    // Catalog media collections
    allMedia: catalogData,
    movies: catalogData.filter(item => item.type === 'movie'),
    tvShows: catalogData.filter(item => item.type === 'tv'),
    homeSections: {
        trending: catalogData.filter(i => i.categories?.includes('trending')),
        popular: catalogData.filter(i => i.isPopular),
        topRated: catalogData.filter(i => (i.defaultRating || 0) >= 8.5),
        upcoming: catalogData.filter(i => i.isNew || i.year === '2024')
    },
    selectedMovie: null,
    myList: loadSavedWatchlist(),

    // Search and filters
    searchQuery: '',
    searchResults: [],
    filters: initialFilters,
    sortOption: 'default',

    // Pagination trackers
    moviesPage: 1,
    tvPage: 1,
    hasMoreMovies: true,
    hasMoreTV: true,

    // Async State Trackers (idle | loading | succeeded | failed)
    homeStatus: 'idle',
    homeError: null,
    moviesStatus: 'idle',
    moviesError: null,
    tvStatus: 'idle',
    tvError: null,
    detailsStatus: 'idle',
    detailsError: null,
    searchStatus: 'idle',
    searchError: null
};

const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        // CRUD: Create (Add movie to My List)
        addToMyList: (state, action) => {
            const id = action.payload;
            if (id && !state.myList.includes(id)) {
                state.myList.push(id);
                persistWatchlist(state.myList);
            }
        },
        // CRUD: Delete (Remove movie from My List)
        removeFromMyList: (state, action) => {
            const id = action.payload;
            if (id) {
                state.myList = state.myList.filter(itemId => itemId !== id);
                persistWatchlist(state.myList);
            }
        },
        // CRUD: Toggle
        toggleMyList: (state, action) => {
            const id = action.payload;
            if (!id) return;
            if (state.myList.includes(id)) {
                state.myList = state.myList.filter(itemId => itemId !== id);
            } else {
                state.myList.push(id);
            }
            persistWatchlist(state.myList);
        },
        // CRUD: Clear
        clearMyList: (state) => {
            state.myList = [];
            persistWatchlist([]);
        },
        setSelectedMovie: (state, action) => {
            state.selectedMovie = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload ?? '';
        },
        setGenreFilter: (state, action) => {
            state.filters.genre = action.payload ?? 'all';
        },
        setYearFilter: (state, action) => {
            state.filters.year = action.payload ?? 'all';
        },
        setRatingFilter: (state, action) => {
            state.filters.rating = action.payload ?? 'all';
        },
        setMediaType: (state, action) => {
            state.filters.mediaType = action.payload ?? 'all';
        },
        setSortOption: (state, action) => {
            state.sortOption = action.payload ?? 'default';
        },
        resetFilters: (state) => {
            state.filters = { ...initialFilters };
            state.sortOption = 'default';
            state.searchQuery = '';
        }
    },
    extraReducers: (builder) => {
        // Home Sections
        builder
            .addCase(fetchHomeSections.pending, (state) => {
                state.homeStatus = 'loading';
                state.homeError = null;
            })
            .addCase(fetchHomeSections.fulfilled, (state, action) => {
                state.homeStatus = 'succeeded';
                if (action.payload) {
                    state.homeSections = action.payload;
                    // Merge any new API items into allMedia catalog for global search
                    const combined = [
                        ...action.payload.trending,
                        ...action.payload.popular,
                        ...action.payload.topRated,
                        ...action.payload.upcoming
                    ];
                    const existingIds = new Set(state.allMedia.map(m => m.id));
                    combined.forEach(item => {
                        if (item && !existingIds.has(item.id)) {
                            state.allMedia.push(item);
                            existingIds.add(item.id);
                        }
                    });
                }
            })
            .addCase(fetchHomeSections.rejected, (state, action) => {
                state.homeStatus = 'failed';
                state.homeError = action.payload || 'Something went wrong.';
            });

        // Movies List
        builder
            .addCase(fetchMoviesList.pending, (state) => {
                state.moviesStatus = 'loading';
                state.moviesError = null;
            })
            .addCase(fetchMoviesList.fulfilled, (state, action) => {
                state.moviesStatus = 'succeeded';
                const { results, page, totalPages, append } = action.payload;
                state.moviesPage = page;
                state.hasMoreMovies = page < totalPages;

                if (append) {
                    const existingIds = new Set(state.movies.map(m => m.id));
                    const newItems = results.filter(m => !existingIds.has(m.id));
                    state.movies.push(...newItems);
                } else if (results.length > 0) {
                    // Combine curated catalog movies with API results (preserving curated ones)
                    const catalogMovies = catalogData.filter(item => item.type === 'movie');
                    const existingIds = new Set(catalogMovies.map(m => m.id));
                    const newApiMovies = results.filter(m => !existingIds.has(m.id));
                    state.movies = [...catalogMovies, ...newApiMovies];
                }
            })
            .addCase(fetchMoviesList.rejected, (state, action) => {
                state.moviesStatus = 'failed';
                state.moviesError = action.payload || 'Something went wrong.';
            });

        // TV Shows List
        builder
            .addCase(fetchTVShowsList.pending, (state) => {
                state.tvStatus = 'loading';
                state.tvError = null;
            })
            .addCase(fetchTVShowsList.fulfilled, (state, action) => {
                state.tvStatus = 'succeeded';
                const { results, page, totalPages, append } = action.payload;
                state.tvPage = page;
                state.hasMoreTV = page < totalPages;

                if (append) {
                    const existingIds = new Set(state.tvShows.map(m => m.id));
                    const newItems = results.filter(m => !existingIds.has(m.id));
                    state.tvShows.push(...newItems);
                } else if (results.length > 0) {
                    const catalogTV = catalogData.filter(item => item.type === 'tv');
                    const existingIds = new Set(catalogTV.map(m => m.id));
                    const newApiTV = results.filter(m => !existingIds.has(m.id));
                    state.tvShows = [...catalogTV, ...newApiTV];
                }
            })
            .addCase(fetchTVShowsList.rejected, (state, action) => {
                state.tvStatus = 'failed';
                state.tvError = action.payload || 'Something went wrong.';
            });

        // Movie Details
        builder
            .addCase(fetchMovieDetailsThunk.pending, (state) => {
                state.detailsStatus = 'loading';
                state.detailsError = null;
            })
            .addCase(fetchMovieDetailsThunk.fulfilled, (state, action) => {
                state.detailsStatus = 'succeeded';
                state.selectedMovie = action.payload;
            })
            .addCase(fetchMovieDetailsThunk.rejected, (state, action) => {
                state.detailsStatus = 'failed';
                state.detailsError = action.payload || 'Something went wrong.';
            });

        // Search
        builder
            .addCase(fetchSearchThunk.pending, (state) => {
                state.searchStatus = 'loading';
                state.searchError = null;
            })
            .addCase(fetchSearchThunk.fulfilled, (state, action) => {
                state.searchStatus = 'succeeded';
                state.searchResults = action.payload.results;
            })
            .addCase(fetchSearchThunk.rejected, (state, action) => {
                state.searchStatus = 'failed';
                state.searchError = action.payload || 'Something went wrong.';
            });
    }
});

export const {
    addToMyList,
    removeFromMyList,
    toggleMyList,
    clearMyList,
    setSelectedMovie,
    setSearchQuery,
    setGenreFilter,
    setYearFilter,
    setRatingFilter,
    setMediaType,
    setSortOption,
    resetFilters
} = movieSlice.actions;

// Selectors
export const selectAllMedia = (state) => state.movies.allMedia;
export const selectMovies = (state) => state.movies.movies;
export const selectTVShows = (state) => state.movies.tvShows;
export const selectHomeSections = (state) => state.movies.homeSections;
export const selectSelectedMovie = (state) => state.movies.selectedMovie;
export const selectMyList = (state) => state.movies.myList;
export const selectMyListCount = (state) => state.movies.myList.length;
export const selectSearchQuery = (state) => state.movies.searchQuery;
export const selectSearchResults = (state) => state.movies.searchResults;
export const selectFilters = (state) => state.movies.filters;
export const selectSortOption = (state) => state.movies.sortOption;

// Pagination & Status Selectors
export const selectMoviesPagination = (state) => ({
    page: state.movies.moviesPage,
    hasMore: state.movies.hasMoreMovies,
    status: state.movies.moviesStatus,
    error: state.movies.moviesError
});

export const selectTVPagination = (state) => ({
    page: state.movies.tvPage,
    hasMore: state.movies.hasMoreTV,
    status: state.movies.tvStatus,
    error: state.movies.tvError
});

export const selectHomeStatus = (state) => ({
    status: state.movies.homeStatus,
    error: state.movies.homeError
});

export const selectDetailsStatus = (state) => ({
    status: state.movies.detailsStatus,
    error: state.movies.detailsError
});

export const selectSearchStatus = (state) => ({
    status: state.movies.searchStatus,
    error: state.movies.searchError
});

// Selector for full saved movie objects in My List
export const selectMyListItems = (state) => {
    const list = state.movies.myList;
    return state.movies.allMedia.filter(item => list.includes(item.id));
};

// ==========================================
// ROBUST FILTER & SORT HELPERS
// ==========================================

/**
 * Standardized Genre matching logic
 * Handles:
 * - Single/comma-separated strings ("Animation, Comedy")
 * - Array of strings (["Animation", "Comedy"])
 * - Array of objects ([{ id: 16, name: "Animation" }])
 * - Array of numeric TMDB genre IDs ([16, 35])
 * - Array of category strings (["trending", "animation"])
 * - Case-insensitive & normalized aliases (e.g. sci-fi / science fiction)
 */
export function matchesGenre(item, targetGenre) {
    if (!targetGenre || String(targetGenre).trim().toLowerCase() === 'all') return true;
    if (!item) return false;

    const target = String(targetGenre).trim().toLowerCase();

    // Canonical aliases for target genres
    const aliases = [target];
    if (target === 'sci-fi' || target === 'scifi') {
        aliases.push('sci-fi', 'scifi', 'sci fi', 'science fiction', 'sci-fi & fantasy');
    } else if (target === 'action') {
        aliases.push('action', 'action & adventure');
    } else if (target === 'adventure') {
        aliases.push('adventure', 'action & adventure');
    } else if (target === 'animation') {
        aliases.push('animation', 'animated', 'anime');
    } else if (target === 'comedy') {
        aliases.push('comedy');
    } else if (target === 'drama') {
        aliases.push('drama');
    } else if (target === 'thriller') {
        aliases.push('thriller');
    } else if (target === 'crime') {
        aliases.push('crime');
    }

    const checkText = (text) => {
        if (!text || typeof text !== 'string') return false;
        const lower = text.toLowerCase();
        return aliases.some(alias => lower.includes(alias));
    };

    const checkId = (id) => {
        const num = Number(id);
        if (isNaN(num)) return false;
        const name = TMDB_GENRE_MAP ? TMDB_GENRE_MAP[num] : null;
        if (name && checkText(name)) return true;

        if (target === 'animation' && num === 16) return true;
        if (target === 'action' && (num === 28 || num === 10759)) return true;
        if (target === 'adventure' && (num === 12 || num === 10759)) return true;
        if (target === 'comedy' && num === 35) return true;
        if (target === 'drama' && num === 18) return true;
        if (target === 'crime' && num === 80) return true;
        if (target === 'thriller' && num === 53) return true;
        if ((target === 'sci-fi' || target === 'scifi') && (num === 878 || num === 10765)) return true;
        return false;
    };

    // 1. Check item.genre_ids (array of numbers from TMDB API e.g. [16, 35])
    if (Array.isArray(item.genre_ids)) {
        if (item.genre_ids.some(id => checkId(id))) return true;
    }

    // 2. Check item.genres (array of objects {id, name} or array of strings)
    if (Array.isArray(item.genres)) {
        const hasMatch = item.genres.some(g => {
            if (typeof g === 'number') return checkId(g);
            if (typeof g === 'string') return checkText(g);
            if (g && typeof g === 'object') {
                if (typeof g.name === 'string' && checkText(g.name)) return true;
                if (g.id !== undefined && checkId(g.id)) return true;
            }
            return false;
        });
        if (hasMatch) return true;
    }

    // 3. Check item.genre (string e.g. "Animation, Comedy" or "Sci-Fi, Action, Thriller")
    if (checkText(item.genre)) return true;

    // 4. Check item.categories (array of strings)
    if (Array.isArray(item.categories)) {
        if (item.categories.some(cat => checkText(String(cat)))) return true;
    }

    // 5. Check item.category (single string)
    if (checkText(item.category)) return true;

    return false;
}

/**
 * Standardized release year extractor
 * Extracts 4-digit year from:
 * - item.year ("2024" or 2024)
 * - item.release_date ("2024-07-19")
 * - item.first_air_date ("2024-07-19")
 * - item.releaseYear (2024)
 * - item.releaseDate ("2024-07-19")
 */
export function extractYear(item) {
    if (!item) return null;

    const raw = item.year ?? item.release_date ?? item.first_air_date ?? item.releaseYear ?? item.releaseDate;
    if (raw === undefined || raw === null || raw === '') return null;

    const str = String(raw).trim();

    // Look for 4-digit year pattern (1900-2099)
    const match = str.match(/\b(19\d\d|20\d\d)\b/);
    if (match) {
        return match[1];
    }

    // Fallback: check if the first 4 characters are numeric
    const firstFour = str.slice(0, 4);
    if (/^\d{4}$/.test(firstFour)) {
        return firstFour;
    }

    return null;
}

/**
 * Robust release year matching logic
 * Handles numeric years (2024), string years ("2024"), ISO dates ("2024-07-19"),
 * and TV show dates ("1989-12-17"). Never hardcodes individual years.
 */
export function matchesYear(item, targetYear) {
    if (!targetYear || String(targetYear).trim().toLowerCase() === 'all') return true;
    if (!item) return false;

    const strTarget = String(targetYear).trim();
    // Normalize target year if given as date or string
    const targetMatch = strTarget.match(/\b(19\d\d|20\d\d)\b/);
    const normalizedTarget = targetMatch ? targetMatch[1] : strTarget;

    const itemYear = extractYear(item);
    if (!itemYear) return false;

    return itemYear === normalizedTarget;
}


export function matchesRating(item, targetRating) {
    if (!targetRating || String(targetRating).trim().toLowerCase() === 'all') return true;
    if (!item) return false;
    const minRating = parseFloat(targetRating);
    if (isNaN(minRating)) return true;
    const itemRating = parseFloat(item.defaultRating ?? item.vote_average ?? 0);
    return !isNaN(itemRating) && itemRating >= minRating;
}

export function matchesMediaType(item, targetMediaType) {
    if (!targetMediaType || String(targetMediaType).trim().toLowerCase() === 'all') return true;
    if (!item) return false;
    const cleanTarget = String(targetMediaType).trim().toLowerCase();
    const itemType = (item.type || (item.first_air_date ? 'tv' : 'movie')).toLowerCase();
    return itemType === cleanTarget;
}

export function sortMediaItems(items, sortOption = 'default') {
    if (!Array.isArray(items)) return [];
    const list = [...items]; // Non-mutating copy

    switch (sortOption) {
        case 'rating-desc':
            list.sort((a, b) => {
                const rA = parseFloat(a.defaultRating ?? a.vote_average ?? 0) || 0;
                const rB = parseFloat(b.defaultRating ?? b.vote_average ?? 0) || 0;
                return rB - rA;
            });
            break;
        case 'year-desc':
            list.sort((a, b) => {
                const yA = parseInt(String(a.year || '').slice(0, 4), 10) || 0;
                const yB = parseInt(String(b.year || '').slice(0, 4), 10) || 0;
                return yB - yA;
            });
            break;
        case 'year-asc':
            list.sort((a, b) => {
                const yA = parseInt(String(a.year || '').slice(0, 4), 10) || 0;
                const yB = parseInt(String(b.year || '').slice(0, 4), 10) || 0;
                return yA - yB;
            });
            break;
        case 'title-asc':
            list.sort((a, b) => {
                const tA = (a.title || a.name || '').toLowerCase();
                const tB = (b.title || b.name || '').toLowerCase();
                return tA.localeCompare(tB);
            });
            break;
        default:
            break;
    }

    return list;
}

export function filterAndSortMedia(items, filters = {}, sortOption = 'default', ignoreMediaType = false) {
    if (!Array.isArray(items)) return [];
    const { mediaType = 'all', genre = 'all', year = 'all', rating = 'all' } = filters;

    const filtered = items.filter(item => {
        if (!item) return false;
        if (!ignoreMediaType && !matchesMediaType(item, mediaType)) return false;
        if (!matchesGenre(item, genre)) return false;
        if (!matchesYear(item, year)) return false;
        if (!matchesRating(item, rating)) return false;
        return true;
    });

    return sortMediaItems(filtered, sortOption);
}

// Filtered TV Shows Selector (respects genre, year, rating, sortOption)
export const selectFilteredTVShows = (state) => {
    return filterAndSortMedia(state.movies.tvShows, state.movies.filters, state.movies.sortOption, true);
};

// Filtered Movies Selector (respects genre, year, rating, sortOption)
export const selectFilteredMovies = (state) => {
    return filterAndSortMedia(state.movies.movies, state.movies.filters, state.movies.sortOption, true);
};

// Filtered Media Selector (allMedia or searchResults, respects mediaType, genre, year, rating, sortOption)
export const selectFilteredMedia = (state) => {
    const { allMedia, searchQuery, searchResults, filters, sortOption } = state.movies;
    let source = (searchQuery && searchQuery.trim() && searchResults.length > 0)
        ? searchResults
        : allMedia;

    if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        source = source.filter(item =>
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.cast && item.cast.toLowerCase().includes(q)) ||
            (item.genre && item.genre.toLowerCase().includes(q))
        );
    }

    return filterAndSortMedia(source, filters, sortOption, false);
};

export default movieSlice.reducer;
