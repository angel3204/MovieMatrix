import { catalogData } from '../data/catalogData';

// TMDB API Base URLs
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Read API key from Vite environment variables (never hardcoded)
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

// Known genre ID to Name mapping for TMDB
export const TMDB_GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
    10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

const GENRE_MAP = TMDB_GENRE_MAP;

/**
 * Standardize TMDB movie/show into consistent Movie Matrix item schema
 */
export function formatTMDBItem(item, defaultType = 'movie') {
    if (!item) return null;

    const isTV = item.first_air_date !== undefined || item.media_type === 'tv' || defaultType === 'tv';
    const type = isTV ? 'tv' : 'movie';
    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || '';
    const year = releaseDate ? releaseDate.slice(0, 4) : '2024';

    // Poster and Backdrop paths with high quality fallback
    const thumb = item.poster_path
        ? `${IMAGE_BASE_URL}${item.poster_path}`
        : '/assets/matrix_awakens.jpg';

    const bgImage = item.backdrop_path
        ? `${BACKDROP_BASE_URL}${item.backdrop_path}`
        : thumb;

    // Genres calculation from genre_ids or genre objects
    let genreString = '';
    if (Array.isArray(item.genres) && item.genres.length > 0) {
        genreString = item.genres.map(g => (typeof g === 'object' ? g.name : g)).filter(Boolean).join(', ');
    } else if (Array.isArray(item.genre_ids) && item.genre_ids.length > 0) {
        genreString = item.genre_ids.map(id => GENRE_MAP[id] || '').filter(Boolean).join(', ');
    }
    if (!genreString) {
        genreString = isTV ? 'Sci-Fi, Drama' : 'Action, Sci-Fi';
    }

    // Default rating & match percentage
    const voteAvg = typeof item.vote_average === 'number' ? item.vote_average : 8.2;
    const defaultRating = Math.round(voteAvg * 10) / 10;
    const match = `${Math.min(99, Math.max(75, Math.round(voteAvg * 10)))}% Match`;

    // Runtime / Duration
    let duration = isTV ? 'Series' : '2h 10m';
    if (item.runtime) {
        const hrs = Math.floor(item.runtime / 60);
        const mins = item.runtime % 60;
        duration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    } else if (item.number_of_seasons) {
        duration = `${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}`;
    }

    // Cast members
    let castString = 'Movie Matrix Ensemble';
    if (item.credits && Array.isArray(item.credits.cast) && item.credits.cast.length > 0) {
        castString = item.credits.cast.slice(0, 4).map(c => c.name).join(', ');
    }

    // YouTube trailer key
    let youtubeId = '9ix7TUGVYIo'; // Matrix trailer fallback
    if (item.videos && Array.isArray(item.videos.results)) {
        const trailer = item.videos.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer && trailer.key) {
            youtubeId = trailer.key;
        }
    }

    return {
        id: String(item.id),
        title,
        type,
        thumb,
        bgImage,
        youtubeId,
        year,
        release_date: item.release_date || (isTV ? '' : releaseDate),
        first_air_date: item.first_air_date || (isTV ? releaseDate : ''),
        genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
        genres: Array.isArray(item.genres) ? item.genres : [],
        match,
        defaultRating,
        rating: item.adult ? '18+' : '16+',
        duration,
        description: item.overview || 'Experience this feature on Movie Matrix.',
        cast: castString,
        genre: genreString,
        isNew: Number(year) >= 2024,
        isPopular: defaultRating >= 8.0
    };
}

/**
 * Generic API Fetcher with error handling and fallback
 */
async function fetchFromTMDB(endpoint, params = {}) {
    if (!API_KEY) {
        throw new Error("No TMDB API key configured.");
    }

    const queryParams = new URLSearchParams({
        api_key: API_KEY,
        language: 'en-US',
        ...params
    });

    const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`TMDB API request failed with status: ${response.status}`);
    }

    return await response.json();
}

// 1. Trending Movies
export async function getTrendingMovies(page = 1) {
    try {
        const data = await fetchFromTMDB('/trending/movie/week', { page });
        const items = (data.results || []).map(item => formatTMDBItem(item, 'movie'));
        return {
            results: items,
            page: data.page || page,
            totalPages: data.total_pages || 1
        };
    } catch {
        // Fallback to local catalog
        const filtered = catalogData.filter(i => i.categories?.includes('trending') || i.isPopular);
        return {
            results: filtered,
            page,
            totalPages: 1
        };
    }
}

// 2. Popular Movies (enriched with top rated titles on page 1 for full genre representation)
export async function getPopularMovies(page = 1) {
    try {
        const data = await fetchFromTMDB('/movie/popular', { page });
        let items = (data.results || []).map(item => formatTMDBItem(item, 'movie'));

        if (page === 1) {
            try {
                const topRatedData = await fetchFromTMDB('/movie/top_rated', { page: 1 });
                const topRatedItems = (topRatedData.results || []).map(item => formatTMDBItem(item, 'movie'));
                const existingIds = new Set(items.map(m => m.id));
                const supplementary = topRatedItems.filter(m => !existingIds.has(m.id));
                items = [...items, ...supplementary];
            } catch {
                // Keep popular items if top_rated fails
            }
        }

        return {
            results: items,
            page: data.page || page,
            totalPages: data.total_pages || 1
        };
    } catch {
        const filtered = catalogData.filter(i => i.type === 'movie');
        return {
            results: filtered,
            page,
            totalPages: 1
        };
    }
}

// 3. Top Rated Movies
export async function getTopRatedMovies(page = 1) {
    try {
        const data = await fetchFromTMDB('/movie/top_rated', { page });
        const items = (data.results || []).map(item => formatTMDBItem(item, 'movie'));
        return {
            results: items,
            page: data.page || page,
            totalPages: data.total_pages || 1
        };
    } catch {
        const filtered = catalogData.filter(i => (i.defaultRating || 0) >= 8.5);
        return {
            results: filtered,
            page,
            totalPages: 1
        };
    }
}

// 4. Upcoming Movies
export async function getUpcomingMovies(page = 1) {
    try {
        const data = await fetchFromTMDB('/movie/upcoming', { page });
        const items = (data.results || []).map(item => formatTMDBItem(item, 'movie'));
        return {
            results: items,
            page: data.page || page,
            totalPages: data.total_pages || 1
        };
    } catch {
        const filtered = catalogData.filter(i => i.isNew || i.year === '2024');
        return {
            results: filtered,
            page,
            totalPages: 1
        };
    }
}

// 5. Popular TV Shows
export async function getPopularTVShows(page = 1) {
    try {
        const data = await fetchFromTMDB('/tv/popular', { page });
        const items = (data.results || []).map(item => formatTMDBItem(item, 'tv'));
        return {
            results: items,
            page: data.page || page,
            totalPages: data.total_pages || 1
        };
    } catch {
        const filtered = catalogData.filter(i => i.type === 'tv');
        return {
            results: filtered,
            page,
            totalPages: 1
        };
    }
}

// 6. Movie or Show Details with Credits and Videos
export async function getMovieDetails(movieId, type = 'movie') {
    // Check if movieId exists in local catalog first for instant demo speed
    const localMatch = catalogData.find(m => String(m.id) === String(movieId));

    try {
        const endpoint = type === 'tv' ? `/tv/${movieId}` : `/movie/${movieId}`;
        const data = await fetchFromTMDB(endpoint, {
            append_to_response: 'credits,videos'
        });
        return formatTMDBItem(data, type);
    } catch {
        if (localMatch) return localMatch;
        throw new Error(`Movie with ID "${movieId}" could not be loaded.`);
    }
}

// 7. Search Movies and Shows
export async function searchMovies(query, page = 1) {
    if (!query || !query.trim()) {
        return { results: [], page: 1, totalPages: 0 };
    }

    try {
        const data = await fetchFromTMDB('/search/multi', {
            query: query.trim(),
            page
        });
        const items = (data.results || [])
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => formatTMDBItem(item, item.media_type));

        return {
            results: items,
            page: data.page || page,
            totalPages: data.total_pages || 1,
            totalResults: data.total_results || items.length
        };
    } catch {
        // Fallback to local search
        const clean = query.trim().toLowerCase();
        const results = catalogData.filter(m =>
            (m.title && m.title.toLowerCase().includes(clean)) ||
            (m.description && m.description.toLowerCase().includes(clean)) ||
            (m.cast && m.cast.toLowerCase().includes(clean)) ||
            (m.genre && m.genre.toLowerCase().includes(clean))
        );
        return {
            results,
            page: 1,
            totalPages: 1,
            totalResults: results.length
        };
    }
}

// 8. Get Genres list
export async function getGenres() {
    try {
        const data = await fetchFromTMDB('/genre/movie/list');
        return data.genres || [];
    } catch {
        return Object.entries(GENRE_MAP).map(([id, name]) => ({ id: Number(id), name }));
    }
}

// 9. Mood Definitions & Intelligent Mood Recommendations
export const MOOD_DEFINITIONS = {
    happy: {
        id: 'happy',
        emoji: '😄',
        name: 'Happy & Joyful',
        tagline: 'Boost your spirits with laugh-out-loud comedies & heartwarming stories',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(234, 88, 12, 0.25))',
        color: '#f59e0b',
        genres: [35, 10751, 16], // Comedy, Family, Animation
        subVibes: [
            { id: 'all', label: 'All Happy Vibes', genres: [35, 10751, 16] },
            { id: 'laugh', label: '😂 Laugh Out Loud', genres: [35] },
            { id: 'wholesome', label: '💖 Wholesome & Heartwarming', genres: [10751, 16] },
            { id: 'adventure', label: '🌟 Feel-Good Adventure', genres: [12, 35] }
        ],
        reason: 'Packed with lighthearted laughs and feel-good energy'
    },
    sad: {
        id: 'sad',
        emoji: '😢',
        name: 'Sad & Melancholic',
        tagline: 'Emotional tearjerkers, touching dramas & moving bittersweet tales',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.25))',
        color: '#60a5fa',
        genres: [18, 10749], // Drama, Romance
        subVibes: [
            { id: 'all', label: 'All Melancholic Vibes', genres: [18, 10749] },
            { id: 'tearjerker', label: '😭 Pure Tearjerker', genres: [18] },
            { id: 'heartbreak', label: '💔 Bittersweet Romance', genres: [10749, 18] },
            { id: 'cathartic', label: '🌧️ Cathartic & Deep', genres: [18] }
        ],
        reason: 'Touching emotional depth that brings tears and catharsis'
    },
    excited: {
        id: 'excited',
        emoji: '⚡',
        name: 'Excited & Energetic',
        tagline: 'High-adrenaline action, jaw-dropping spectacles & non-stop energy',
        gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(244, 63, 94, 0.25))',
        color: '#f43f5e',
        genres: [28, 878, 53], // Action, Sci-Fi, Thriller
        subVibes: [
            { id: 'all', label: 'All High Energy', genres: [28, 878, 53] },
            { id: 'action', label: '💥 Pure Action', genres: [28] },
            { id: 'scifi', label: '🚀 Sci-Fi Epic', genres: [878, 28] },
            { id: 'thriller', label: '🔥 Heart-Pounding Thriller', genres: [53, 28] }
        ],
        reason: 'High-velocity thrills with pulse-pounding action'
    },
    romantic: {
        id: 'romantic',
        emoji: '💖',
        name: 'Romantic & In Love',
        tagline: 'Heartwarming romance, irresistible chemistry & swoon-worthy stories',
        gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(217, 70, 239, 0.25))',
        color: '#ec4899',
        genres: [10749, 35], // Romance, Comedy
        subVibes: [
            { id: 'all', label: 'All Romantic Vibes', genres: [10749, 35] },
            { id: 'romcom', label: '🥰 Sweet Rom-Com', genres: [10749, 35] },
            { id: 'passionate', label: '🔥 Passionate Drama', genres: [10749, 18] },
            { id: 'datenight', label: '🍷 Cozy Date Night', genres: [10749] }
        ],
        reason: 'Beautiful chemistry and heartwarming romantic moments'
    },
    relaxed: {
        id: 'relaxed',
        emoji: '🧘',
        name: 'Stressed & Need Chill',
        tagline: 'Low-stress comfort viewing, tranquil escapes & soothing stories',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(20, 184, 166, 0.25))',
        color: '#10b981',
        genres: [16, 10751, 14, 35], // Animation, Family, Fantasy, Comedy
        subVibes: [
            { id: 'all', label: 'All Chill Vibes', genres: [16, 10751, 14, 35] },
            { id: 'comfort', label: '🛋️ Cozy Comfort', genres: [16, 10751] },
            { id: 'gentle', label: '🍵 Low-Stress Escapes', genres: [14, 10751] },
            { id: 'light', label: '☀️ Lighthearted Chill', genres: [35, 16] }
        ],
        reason: 'Gentle, comforting pacing designed to melt stress away'
    },
    thoughtful: {
        id: 'thoughtful',
        emoji: '🧠',
        name: 'Thoughtful & Mind-Bending',
        tagline: 'Complex mysteries, twisty dilemmas & mind-expanding questions',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(168, 85, 247, 0.25))',
        color: '#a855f7',
        genres: [9648, 878, 18], // Mystery, Sci-Fi, Drama
        subVibes: [
            { id: 'all', label: 'All Mind-Bending', genres: [9648, 878, 18] },
            { id: 'mystery', label: '🕵️ Plot Twists & Whodunit', genres: [9648] },
            { id: 'philosophical', label: '🌌 Existential Sci-Fi', genres: [878, 18] },
            { id: 'psychological', label: '🧩 Psychological Puzzle', genres: [53, 18] }
        ],
        reason: 'Challenging puzzles and shocking plot twists that make you think'
    },
    spooky: {
        id: 'spooky',
        emoji: '👻',
        name: 'Spooky & Chills',
        tagline: 'Bone-chilling suspense, haunted dread & hair-raising frights',
        gradient: 'linear-gradient(135deg, rgba(13, 148, 136, 0.25), rgba(79, 70, 229, 0.25))',
        color: '#2dd4bf',
        genres: [27, 9648, 53], // Horror, Mystery, Thriller
        subVibes: [
            { id: 'all', label: 'All Spooky Vibes', genres: [27, 9648, 53] },
            { id: 'horror', label: '😱 Haunted Horror', genres: [27] },
            { id: 'suspense', label: '🔦 Dark Thriller', genres: [53, 9648] },
            { id: 'creepy', label: '🕯️ Atmospheric Dread', genres: [27, 53] }
        ],
        reason: 'Spine-tingling suspense and eerie atmosphere'
    },
    bored: {
        id: 'bored',
        emoji: '🥱',
        name: 'Bored & Need Energy',
        tagline: 'Cure boredom instantly with snappy heists, wit & non-stop intrigue',
        gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(249, 115, 22, 0.25))',
        color: '#eab308',
        genres: [28, 80, 35, 53], // Action, Crime, Comedy, Thriller
        subVibes: [
            { id: 'all', label: 'All Quick Fixes', genres: [28, 80, 35, 53] },
            { id: 'heist', label: '💰 Heists & Capers', genres: [80, 28] },
            { id: 'wild', label: '🎢 Fast & Fun Rides', genres: [28, 35] },
            { id: 'twists', label: '⚡ Unpredictable Thrills', genres: [53, 80] }
        ],
        reason: 'Fast-paced, witty, and guaranteed to snap you out of boredom'
    }
};

export async function getMoviesByMood({
    moodKey = 'happy',
    subVibe = 'all',
    type = 'all',
    sortBy = 'rating',
    lang = 'en',
    page = 1
} = {}) {
    const mood = MOOD_DEFINITIONS[moodKey] || MOOD_DEFINITIONS.happy;
    let selectedGenres = mood.genres;
    if (subVibe && subVibe !== 'all') {
        const foundVibe = (mood.subVibes || []).find(v => v.id === subVibe);
        if (foundVibe && foundVibe.genres && foundVibe.genres.length > 0) {
            selectedGenres = foundVibe.genres;
        }
    }

    const genreString = selectedGenres.join(',');

    let tmdbSort = 'popularity.desc';
    let voteCountThreshold = 100;
    if (sortBy === 'rating') {
        tmdbSort = 'vote_average.desc';
        voteCountThreshold = 250;
    } else if (sortBy === 'newest') {
        tmdbSort = 'primary_release_date.desc';
        voteCountThreshold = 40;
    } else if (sortBy === 'gems') {
        tmdbSort = 'vote_average.desc';
        voteCountThreshold = 80;
    } else {
        tmdbSort = 'popularity.desc';
        voteCountThreshold = 120;
    }

    const tmdbLanguage = lang === 'hi' ? 'hi-IN' : 'en-US';

    try {
        const isTv = type === 'tv';
        const endpoint = isTv ? '/discover/tv' : '/discover/movie';
        const params = {
            with_genres: genreString,
            sort_by: isTv && tmdbSort === 'primary_release_date.desc' ? 'first_air_date.desc' : tmdbSort,
            'vote_count.gte': voteCountThreshold,
            language: tmdbLanguage,
            page
        };

        const data = await fetchFromTMDB(endpoint, params);
        const results = (data.results || []).map(item => ({
            ...formatTMDBItem(item, isTv ? 'tv' : 'movie'),
            moodReason: mood.reason,
            moodKey: mood.id,
            moodEmoji: mood.emoji
        }));

        return {
            results,
            totalPages: data.total_pages || 1,
            page: data.page || page,
            mood
        };
    } catch {
        // Fallback to local catalog
        const filtered = catalogData.filter(item => {
            if (type !== 'all' && item.type !== type) return false;
            if (Array.isArray(item.genre_ids)) {
                return item.genre_ids.some(gid => selectedGenres.includes(gid));
            }
            return true;
        }).map(item => ({
            ...item,
            moodReason: mood.reason,
            moodKey: mood.id,
            moodEmoji: mood.emoji
        }));

        return {
            results: filtered.length > 0 ? filtered : catalogData.slice(0, 8).map(i => ({
                ...i,
                moodReason: mood.reason,
                moodKey: mood.id,
                moodEmoji: mood.emoji
            })),
            totalPages: 1,
            page: 1,
            mood
        };
    }
}
