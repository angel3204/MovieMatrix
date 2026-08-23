let heroSlideshowItems = [];
let currentHeroIndex = 0;
let heroSlideshowTimer = null;
let heroProgressTimer = null;
let isSlideshowPlaying = true;
let currentActiveLayer = "a";
const SLIDESHOW_DURATION = 7000;

function getSlideDuration(index = currentHeroIndex) {
    const item = heroSlideshowItems[index];
    if (item && typeof item.displayTime === "number") {
        return item.displayTime;
    }
    if (index === 0 || (item && item.id === "matrix-awakens")) {
        return 7000;
    }
    return SLIDESHOW_DURATION;
}

function initHeroSlideshow() {
    if (typeof catalogData === "undefined") return;
    heroSlideshowItems = catalogData.filter(i => ["matrix-awakens", "cyber-heist", "neon-skies", "stranger-code", "zero-gravity"].includes(i.id));

    setupHeroControls();
    initHeroCanvas();
    renderHeroDots();

    if (heroSlideshowItems.length > 0) {
        displayHeroSlide(0);
        startHeroSlideshow();
    }
}

function setupHeroControls() {
    const prevBtn = document.getElementById("hero-prev-btn");
    const nextBtn = document.getElementById("hero-next-btn");
    const toggleBtn = document.getElementById("slideshow-toggle-btn");
    const heroBanner = document.getElementById("hero-banner");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevHeroSlide();
            resetHeroSlideshowTimer();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextHeroSlide();
            resetHeroSlideshowTimer();
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            isSlideshowPlaying = !isSlideshowPlaying;
            const icon = document.getElementById("slideshow-icon");
            if (icon) icon.textContent = isSlideshowPlaying ? "⏸" : "▶";
            if (isSlideshowPlaying) {
                startHeroSlideshow();
                if (typeof showToast === "function") showToast("Hero Slideshow Resumed");
            } else {
                pauseHeroSlideshow(false);
                if (typeof showToast === "function") showToast("Hero Slideshow Paused");
            }
        });
    }

    if (heroBanner) {
        heroBanner.addEventListener("mouseenter", () => {
            if (isSlideshowPlaying) pauseHeroSlideshow(false);
        });
        heroBanner.addEventListener("mouseleave", () => {
            if (isSlideshowPlaying) startHeroSlideshow();
        });
    }
}

function renderHeroDots() {
    const dotsContainer = document.getElementById("hero-dots-container");
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";

    heroSlideshowItems.forEach((item, index) => {
        const dot = document.createElement("div");
        dot.classList.add("hero-dot");
        if (index === currentHeroIndex) dot.classList.add("active");
        dot.title = item.title;
        dot.addEventListener("click", () => {
            goToHeroSlide(index);
            resetHeroSlideshowTimer();
        });
        dotsContainer.appendChild(dot);
    });
}

function updateHeroDots() {
    const dots = document.querySelectorAll(".hero-dot");
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentHeroIndex);
    });
}

function startHeroSlideshow() {
    if (!isSlideshowPlaying || (typeof currentTab !== "undefined" && currentTab !== "home")) return;
    clearTimeout(heroSlideshowTimer);
    clearInterval(heroSlideshowTimer);
    resetProgressBar();

    const duration = getSlideDuration(currentHeroIndex);
    startProgressBar(duration);

    heroSlideshowTimer = setTimeout(() => {
        nextHeroSlide();
        startHeroSlideshow();
    }, duration);
}

function pauseHeroSlideshow(updateIcon = true) {
    clearTimeout(heroSlideshowTimer);
    clearInterval(heroSlideshowTimer);
    stopProgressBar();
    if (updateIcon) {
        const icon = document.getElementById("slideshow-icon");
        if (icon) icon.textContent = "▶";
    }
}

function resetHeroSlideshowTimer() {
    if (isSlideshowPlaying && (typeof currentTab === "undefined" || currentTab === "home")) {
        startHeroSlideshow();
    }
}

function nextHeroSlide() {
    if (heroSlideshowItems.length === 0) return;
    currentHeroIndex = (currentHeroIndex + 1) % heroSlideshowItems.length;
    displayHeroSlide(currentHeroIndex);
}

function prevHeroSlide() {
    if (heroSlideshowItems.length === 0) return;
    currentHeroIndex = (currentHeroIndex - 1 + heroSlideshowItems.length) % heroSlideshowItems.length;
    displayHeroSlide(currentHeroIndex);
}

function goToHeroSlide(index) {
    if (index < 0 || index >= heroSlideshowItems.length) return;
    currentHeroIndex = index;
    displayHeroSlide(currentHeroIndex);
}

function displayHeroSlide(index) {
    const item = heroSlideshowItems[index];
    if (!item) return;

    updateHeroBanner(item, getBadgeForItem(item));
    updateHeroDots();
}

function getBadgeForItem(item) {
    if (typeof t !== "function") {
        if (item.id === "matrix-awakens") return "🔥 TRENDING #1 TODAY";
        if (item.id === "cyber-heist") return "⚡ BLOCKBUSTER CINEMA";
        if (item.id === "neon-skies") return "🌟 POPULAR TV SERIES";
        if (item.id === "stranger-code") return "✨ NEW SEASON RELEASE";
        return item.type === "tv" ? "FEATURED TV SHOW" : "FEATURED MOVIE";
    }
    if (item.id === "matrix-awakens") return t("trendingToday");
    if (item.id === "cyber-heist") return t("blockbusterCinema");
    if (item.id === "neon-skies") return t("popularTvSeries");
    if (item.id === "stranger-code") return t("newRelease");
    return item.type === "tv" ? t("featuredTv") : t("featuredMovie");
}

function startProgressBar(customDuration) {
    const fill = document.getElementById("carousel-progress-fill");
    if (!fill) return;

    const duration = customDuration || getSlideDuration(currentHeroIndex);
    let startTime = Date.now();
    clearInterval(heroProgressTimer);

    heroProgressTimer = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let pct = Math.min(100, (elapsed / duration) * 100);
        fill.style.width = `${pct}%`;
        if (pct >= 100) {
            clearInterval(heroProgressTimer);
        }
    }, 50);
}

function stopProgressBar() {
    clearInterval(heroProgressTimer);
}

function resetProgressBar() {
    clearInterval(heroProgressTimer);
    const fill = document.getElementById("carousel-progress-fill");
    if (fill) fill.style.width = "0%";
}

function initHeroCanvas() {
    const canvas = document.getElementById("hero-particles-canvas");
    if (!canvas || !canvas.parentElement) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    window.addEventListener("resize", () => {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
    });

    const numParticles = 40;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            speedY: -(Math.random() * 0.7 + 0.3),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.5 + 0.2,
            char: Math.random() > 0.5 ? String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)) : Math.floor(Math.random() * 10).toString()
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        const themeAccent = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#E50914';

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;

            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = themeAccent;
            ctx.shadowBlur = 8;
            ctx.shadowColor = themeAccent;

            if (Math.random() > 0.75) {
                ctx.font = '11px monospace';
                ctx.fillText(p.char, p.x, p.y);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

function updateHeroBanner(item, badgeText) {
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-description");
    const heroBadge = document.getElementById("hero-badge");
    const heroMeta = document.getElementById("hero-meta");
    const heroGenres = document.getElementById("hero-genres");
    const playBtn = document.getElementById("hero-play-btn");
    const infoBtn = document.getElementById("hero-info-btn");
    const mylistBtn = document.getElementById("hero-mylist-btn");

    const layerA = document.getElementById("hero-bg-a");
    const layerB = document.getElementById("hero-bg-b");

    if (layerA && layerB) {
        const nextLayer = currentActiveLayer === "a" ? layerB : layerA;
        const currentLayer = currentActiveLayer === "a" ? layerA : layerB;

        nextLayer.style.backgroundImage = `url('${item.bgImage}')`;

        nextLayer.classList.remove("active");
        void nextLayer.offsetWidth;
        nextLayer.classList.add("active");

        currentLayer.classList.remove("active");
        currentActiveLayer = currentActiveLayer === "a" ? "b" : "a";
    } else {
        const heroBanner = document.getElementById("hero-banner");
        if (heroBanner) heroBanner.style.backgroundImage = `url('${item.bgImage}')`;
    }

    const heroContent = document.getElementById("hero-content");
    if (heroContent) {
        heroContent.style.animation = 'none';
        void heroContent.offsetWidth;
        heroContent.style.animation = null;
    }

    if (heroBadge) heroBadge.textContent = badgeText || (item.isPopular ? "🔥 TRENDING #1 TODAY" : (item.type === "tv" ? "FEATURED TV SHOW" : "FEATURED MOVIE"));
    if (heroTitle) heroTitle.textContent = item.title;
    if (heroDesc) heroDesc.textContent = item.description;

    if (heroMeta) {
        heroMeta.innerHTML = `
            <span class="match-score">${item.match}</span>
            <span class="meta-dot">•</span>
            <span class="meta-year">${item.year}</span>
            <span class="meta-dot">•</span>
            <span class="meta-rating">${item.rating}</span>
            <span class="meta-dot">•</span>
            <span class="meta-duration">${item.duration}</span>
            <span class="meta-type-badge">${item.type.toUpperCase()}</span>
        `;
    }

    if (heroGenres) {
        const genresFormatted = item.genre ? item.genre.split(", ").join(" • ") : "Sci-Fi • Action";
        heroGenres.textContent = genresFormatted;
    }

    if (playBtn) {
        playBtn.innerHTML = `▶ ${typeof t === "function" ? t("watchTrailer") : "Watch Trailer"}`;
        playBtn.onclick = () => openPlayer(item.youtubeId);
    }

    if (infoBtn) {
        infoBtn.innerHTML = `ⓘ <span data-i18n="moreInfo">${typeof t === "function" ? t("moreInfo") : "More Info"}</span>`;
        infoBtn.onclick = () => openDetailModal(item);
    }

    if (mylistBtn) {
        updateMyListButton(mylistBtn, item.id);
        mylistBtn.onclick = () => {
            toggleMyList(item.id);
            updateMyListButton(mylistBtn, item.id);
        };
    }
}

