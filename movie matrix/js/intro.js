const MOVIE_MATRIX_INTRO_KEY = "movieMatrixIntroSeen";

function checkMovieMatrixIntro() {
    try {
        return sessionStorage.getItem(MOVIE_MATRIX_INTRO_KEY) === "true";
    } catch (e) {
        console.error("Movie Matrix: Failed to access sessionStorage", e);
        return false;
    }
}

function completeMovieMatrixIntro() {
    try {
        sessionStorage.setItem(MOVIE_MATRIX_INTRO_KEY, "true");
        if (document.documentElement) {
            document.documentElement.classList.add("intro-seen");
        }
    } catch (e) {
        console.error("Movie Matrix: Failed to save intro state to sessionStorage", e);
    }
}

function resetMovieMatrixIntro() {
    try {
        sessionStorage.removeItem(MOVIE_MATRIX_INTRO_KEY);
        if (document.documentElement) {
            document.documentElement.classList.remove("intro-seen");
        }
        console.log("Movie Matrix: Intro state has been reset. Reload the page to test first-visit behavior.");
    } catch (e) {
        console.error("Movie Matrix: Failed to reset intro state", e);
    }
}

(function earlyIntroCheck() {
    if (checkMovieMatrixIntro()) {
        if (document.documentElement) {
            document.documentElement.classList.add("intro-seen");
        }
    }
})();

window.checkMovieMatrixIntro = checkMovieMatrixIntro;
window.completeMovieMatrixIntro = completeMovieMatrixIntro;
window.resetMovieMatrixIntro = resetMovieMatrixIntro;
window.isMovieMatrixIntroSeen = checkMovieMatrixIntro;

