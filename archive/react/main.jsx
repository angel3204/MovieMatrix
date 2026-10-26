function initReactApp() {
    const container = document.getElementById("react-app-root");
    if (!container) return;

    if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
        console.error("React or ReactDOM is not loaded.");
        return;
    }

    if (ReactDOM.createRoot) {
        if (!window._reactRootInstance) {
            window._reactRootInstance = ReactDOM.createRoot(container);
        }
        window._reactRootInstance.render(React.createElement(App));
    } else if (ReactDOM.render) {
        ReactDOM.render(React.createElement(App), container);
    }
}

window.initReactApp = initReactApp;

