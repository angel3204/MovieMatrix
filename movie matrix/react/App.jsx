function App() {

    const [searchQuery, setSearchQuery] = React.useState("");

    const [selectedType, setSelectedType] = React.useState("all");

    const [selectedGenre, setSelectedGenre] = React.useState("all");

    const [myList, setMyList] = React.useState(() => {
        try {
            return JSON.parse(localStorage.getItem("movieMatrix_myList") || "[]");
        } catch (err) {
            return [];
        }
    });

    const [filteredMovies, setFilteredMovies] = React.useState([]);

    const availableGenres = React.useMemo(() => {
        if (typeof catalogData === "undefined") return [];
        const genresSet = new Set();
        catalogData.forEach((item) => {
            if (item.genre) {
                item.genre.split(",").forEach((g) => genresSet.add(g.trim()));
            }
        });
        return Array.from(genresSet).sort();
    }, []);

    React.useEffect(() => {
        if (typeof catalogData === "undefined") return;

        const cleanQuery = searchQuery ? searchQuery.trim().toLowerCase() : "";

        const results = catalogData.filter((item) => {
            const titleMatch = !cleanQuery || (item.title ? item.title.toLowerCase().includes(cleanQuery) : false);

            const matchesType = selectedType === "all" || item.type === selectedType;
            const matchesGenre = selectedGenre === "all" || (item.genre && item.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

            return titleMatch && matchesType && matchesGenre;
        });

        setFilteredMovies(results);
    }, [searchQuery, selectedType, selectedGenre]);

    React.useEffect(() => {
        localStorage.setItem("movieMatrix_myList", JSON.stringify(myList));
        if (typeof updateMyListBadge === "function") {
            updateMyListBadge();
        }
    }, [myList]);

    const [currentLang, setCurrentLang] = React.useState(() => {
        return typeof getLanguage === "function" ? getLanguage() : "en";
    });

    React.useEffect(() => {
        const handleLangChange = (e) => {
            setCurrentLang(e.detail ? e.detail.lang : (getLanguage() || "en"));
        };
        window.addEventListener("languageChanged", handleLangChange);
        return () => window.removeEventListener("languageChanged", handleLangChange);
    }, []);

    const handleToggleList = (id) => {
        setMyList((prevList) => {
            const exists = prevList.includes(id);
            if (exists) {
                const msg = typeof t === "function" ? t("removedFromMyListMsg") : "Removed from My List";
                if (typeof showToast === "function") showToast(`✓ ${msg}`, "warning");
                return prevList.filter((itemId) => itemId !== id);
            } else {
                const msg = typeof t === "function" ? t("addedToMyListMsg") : "Added to My List";
                if (typeof showToast === "function") showToast(`✓ ${msg}`, "success");
                return [...prevList, id];
            }
        });
    };

    const handleSelectMovie = (movie) => {
        if (typeof openDetailModal === "function") {
            openDetailModal(movie);
        }
    };

    return (
        <div className="react-app-wrapper" style={{ padding: '20px 0' }}>

            <div className="react-controls-card">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => {
                        setSearchQuery("");
                        if (typeof showToast === "function") showToast("Search cleared", "info");
                    }}
                />

                <FilterPanel
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                    selectedGenre={selectedGenre}
                    onGenreChange={setSelectedGenre}
                    availableGenres={availableGenres}
                    totalCount={filteredMovies.length}
                />
            </div>

            <MovieGrid
                movies={filteredMovies}
                myList={myList}
                searchQuery={searchQuery}
                userRatings={typeof userRatings !== "undefined" ? userRatings : {}}
                onToggleList={handleToggleList}
                onSelectMovie={handleSelectMovie}
            />
        </div>
    );
}

window.App = App;

