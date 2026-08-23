function setupThemeToggle() {
    const pickerBtn = document.getElementById("theme-picker-btn");
    const dropdownWrapper = document.getElementById("theme-dropdown-wrapper");
    const dropdownMenu = document.getElementById("theme-dropdown-menu");
    const themeOptions = document.querySelectorAll(".theme-option");

    const savedTheme = localStorage.getItem("movieMatrix_theme") || "dark-matrix";
    setTheme(savedTheme, false);

    if (pickerBtn && dropdownMenu) {
        pickerBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("hidden");
            dropdownWrapper.classList.toggle("active");
        });

        document.addEventListener("click", () => {
            dropdownMenu.classList.add("hidden");
            dropdownWrapper.classList.remove("active");
        });
    }

    themeOptions.forEach(option => {
        option.addEventListener("click", (e) => {
            e.stopPropagation();
            const selectedTheme = option.getAttribute("data-theme");
            setTheme(selectedTheme, true, e);
            dropdownMenu.classList.add("hidden");
            dropdownWrapper.classList.remove("active");
        });
    });
}

function setupKeyboardShortcuts() {
    const validThemes = ["midnight-matrix", "cyber-neon", "ocean-noir", "sunset-cinema"];

    document.addEventListener("keydown", (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (activeTag === "input" || activeTag === "textarea") return;

        if (e.key === "t" || e.key === "T") {
            e.preventDefault();
            const current = document.body.getAttribute("data-theme") || "midnight-matrix";
            const currentIndex = validThemes.indexOf(current);
            const nextIndex = (currentIndex + 1) % validThemes.length;
            setTheme(validThemes[nextIndex], true);
        }

        if (["1", "2", "3", "4"].includes(e.key)) {
            const themeIndex = parseInt(e.key, 10) - 1;
            if (validThemes[themeIndex]) {
                setTheme(validThemes[themeIndex], true);
            }
        }
    });
}

function setTheme(themeKey, notify = true, clickEvent = null) {
    const canonicalMap = {
        "dark-matrix": "midnight-matrix",
        "midnight-matrix": "midnight-matrix",
        "cyber-neon": "cyber-neon",
        "ruby-velvet": "ocean-noir",
        "ocean-noir": "ocean-noir",
        "midnight-blue": "sunset-cinema",
        "sunset-cinema": "sunset-cinema"
    };

    let activeTheme = canonicalMap[themeKey] || "midnight-matrix";

    if (notify) {
        triggerThemeRipple(clickEvent);
        animateThemeButton();
    }

    document.body.setAttribute("data-theme", activeTheme);
    localStorage.setItem("movieMatrix_theme", activeTheme);

    document.querySelectorAll(".theme-option").forEach(opt => {
        const optTheme = opt.getAttribute("data-theme");
        if (optTheme === activeTheme || canonicalMap[optTheme] === activeTheme) {
            opt.classList.add("active");
        } else {
            opt.classList.remove("active");
        }
    });

    const themeNames = {
        "midnight-matrix": "Midnight Matrix",
        "dark-matrix": "Midnight Matrix",
        "cyber-neon": "Cyber Neon",
        "ocean-noir": "Ocean Noir",
        "ruby-velvet": "Ocean Noir",
        "sunset-cinema": "Sunset Cinema",
        "midnight-blue": "Sunset Cinema"
    };

    if (notify) {
        const themeNameKey = activeTheme === "midnight-matrix" ? "midnightMatrix" : (activeTheme === "cyber-neon" ? "cyberNeon" : (activeTheme === "ocean-noir" ? "oceanNoir" : "sunsetCinema"));
        const prefix = typeof t === "function" ? t("themeChangedTo") : "Theme changed to";
        const name = typeof t === "function" ? t(themeNameKey) : (themeNames[activeTheme] || activeTheme);
        showToast(`✓ ${prefix} ${name}`);
    }
}

function triggerThemeRipple(e = null) {
    const ripple = document.getElementById("theme-ripple");
    const pickerBtn = document.getElementById("theme-picker-btn");
    if (!ripple) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e && e.clientX && e.clientY) {
        x = e.clientX;
        y = e.clientY;
    } else if (pickerBtn) {
        const rect = pickerBtn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
    }

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    ripple.classList.remove("animate");
    void ripple.offsetWidth;
    ripple.classList.add("animate");
}

function animateThemeButton() {
    const pickerBtn = document.getElementById("theme-picker-btn");
    if (!pickerBtn) return;
    pickerBtn.classList.remove("spinning");
    void pickerBtn.offsetWidth;
    pickerBtn.classList.add("spinning");
}

let toastTimeoutId = null;

function showToast(message, type = "info", duration = 3000) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    if (toastTimeoutId) {
        clearTimeout(toastTimeoutId);
        toastTimeoutId = null;
    }

    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    let icon = "ℹ️";
    if (type === "success" || message.includes("✓") || message.includes("Added") || message.includes("Welcome")) {
        icon = "✓";
    } else if (type === "warning" || message.includes("⚠️") || message.includes("Removed") || message.includes("Signed out")) {
        icon = "⚠️";
    } else if (type === "error" || message.includes("✖") || message.includes("Invalid")) {
        icon = "✖";
    } else if (message.includes("🔍") || message.includes("Search")) {
        icon = "🔍";
    }

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${message.replace(/^[✓⚠️✖ℹ️🔍]\s*/, "")}</span>`;

    void toast.offsetWidth;
    toast.classList.remove("hidden");
    toast.classList.add("visible");

    toastTimeoutId = setTimeout(() => {
        toast.classList.remove("visible");
        toast.classList.add("hidden");
    }, duration);
}

