import React, { useState } from 'react';
import { t } from '../data/translations';

export default function AuthModal({
    isOpen = false,
    initialTab = "signin",
    onClose,
    onAuthSuccess,
    onToast,
    lang = "en"
}) {
    const [tab, setTab] = useState(initialTab);

    // Sign in state
    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [signInError, setSignInError] = useState("");

    // Sign up state
    const [signUpName, setSignUpName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [signUpError, setSignUpError] = useState("");

    // Password rules validation for Sign Up
    const hasLength = signUpPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(signUpPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+-=]/.test(signUpPassword);
    const isPasswordValid = hasLength && hasUppercase && hasSpecial;

    if (!isOpen) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSignInSubmit = (e) => {
        e.preventDefault();
        setSignInError("");

        const email = signInEmail.trim().toLowerCase();
        const password = signInPassword;

        if (!email) {
            setSignInError("Please enter your email address.");
            if (onToast) onToast("Email is required", "error");
            return;
        }

        if (!emailRegex.test(email)) {
            setSignInError("Please enter a valid email address (e.g. name@example.com).");
            if (onToast) onToast("Invalid email format", "warning");
            return;
        }

        if (!password) {
            setSignInError("Please enter your password.");
            if (onToast) onToast("Password is required", "error");
            return;
        }

        const users = JSON.parse(localStorage.getItem("movieMatrix_users") || "[]");
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (!foundUser) {
            setSignInError("Invalid email or password. Please check your credentials or create a new account.");
            if (onToast) onToast("Invalid email or password", "error");
            return;
        }

        const user = { name: foundUser.name, email: foundUser.email };
        localStorage.setItem("movieMatrix_currentUser", JSON.stringify(user));

        if (onToast) onToast(`Welcome back, ${foundUser.name.split(' ')[0]}! 👋`, "success");
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
    };

    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        setSignUpError("");

        const name = signUpName.trim();
        const email = signUpEmail.trim().toLowerCase();
        const password = signUpPassword;

        if (!name) {
            setSignUpError("Please enter your full name.");
            if (onToast) onToast("Full name is required", "error");
            return;
        }

        if (!email || !emailRegex.test(email)) {
            setSignUpError("Please enter a valid email address.");
            if (onToast) onToast("Invalid email format", "warning");
            return;
        }

        if (!isPasswordValid) {
            setSignUpError("Password must be at least 8 characters, contain 1 capital letter, and 1 special character.");
            if (onToast) onToast("Password does not meet security requirements", "warning");
            return;
        }

        const users = JSON.parse(localStorage.getItem("movieMatrix_users") || "[]");
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            setSignUpError("An account with this email address already exists. Please sign in instead.");
            if (onToast) onToast("Account already exists", "warning");
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem("movieMatrix_users", JSON.stringify(users));

        const user = { name, email };
        localStorage.setItem("movieMatrix_currentUser", JSON.stringify(user));

        if (onToast) onToast(`Account created! Welcome to Movie Matrix, ${name.split(' ')[0]}! 🎉`, "success");
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
    };

    const handleGuestClick = () => {
        const guestUser = {
            name: "Guest Explorer",
            email: "guest@moviematrix.io",
            isGuest: true
        };
        localStorage.setItem("movieMatrix_currentUser", JSON.stringify(guestUser));
        if (onToast) onToast("Welcome back 👋", "success");
        if (onAuthSuccess) onAuthSuccess(guestUser);
        onClose();
    };

    const handleGoogleClick = () => {
        if (onToast) {
            onToast(`⚠️ ${t("googleSignInNotCompleted", lang)}`, "warning");
        }
    };

    return (
        <div id="auth-modal" className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-content auth-modal-content">
                <button className="close-btn" onClick={onClose} aria-label="Close authentication modal">&times;</button>

                <div className="auth-box">
                    <div className="auth-header">
                        <h2 className="logo" id="auth-modal-title">MOVIE MATRIX</h2>
                        <p id="auth-subtitle">
                            {tab === "signin"
                                ? "Sign in to access your personal watchlist and streaming features."
                                : "Create an account to save movies, customize recommendations, and stream anywhere."}
                        </p>
                    </div>

                    <div className="auth-tabs" role="tablist">
                        <button
                            type="button"
                            className={`auth-tab ${tab === "signin" ? "active" : ""}`}
                            id="tab-signin"
                            role="tab"
                            aria-selected={tab === "signin"}
                            onClick={() => {
                                setTab("signin");
                                setSignInError("");
                            }}
                        >
                            {t("signIn", lang)}
                        </button>
                        <button
                            type="button"
                            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
                            id="tab-signup"
                            role="tab"
                            aria-selected={tab === "signup"}
                            onClick={() => {
                                setTab("signup");
                                setSignUpError("");
                            }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {tab === "signin" && (
                        <form id="signin-form" className="auth-form" onSubmit={handleSignInSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="signin-email">{t("emailAddress", lang)}</label>
                                <input
                                    type="email"
                                    id="signin-email"
                                    placeholder={t("emailPlaceholder", lang)}
                                    value={signInEmail}
                                    onChange={(e) => setSignInEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signin-password">{t("password", lang)}</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showSignInPassword ? "text" : "password"}
                                        id="signin-password"
                                        placeholder="Enter your password"
                                        value={signInPassword}
                                        onChange={(e) => setSignInPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowSignInPassword(prev => !prev)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showSignInPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
                            {signInError && (
                                <div id="signin-error" className="auth-error-msg" role="alert">
                                    {signInError}
                                </div>
                            )}
                            <button type="submit" className="primary-btn auth-submit-btn">
                                {t("signIn", lang)}
                            </button>
                        </form>
                    )}

                    {tab === "signup" && (
                        <form id="signup-form" className="auth-form" onSubmit={handleSignUpSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="signup-name">Full Name</label>
                                <input
                                    type="text"
                                    id="signup-name"
                                    placeholder="Alex Morgan"
                                    value={signUpName}
                                    onChange={(e) => setSignUpName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-email">{t("emailAddress", lang)}</label>
                                <input
                                    type="email"
                                    id="signup-email"
                                    placeholder="name@example.com"
                                    value={signUpEmail}
                                    onChange={(e) => setSignUpEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-password">{t("password", lang)}</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showSignUpPassword ? "text" : "password"}
                                        id="signup-password"
                                        placeholder="Create password"
                                        value={signUpPassword}
                                        onChange={(e) => setSignUpPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowSignUpPassword(prev => !prev)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showSignUpPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div className="password-rules-box" id="password-rules-box">
                                <p className="rules-heading">Password Security Requirements:</p>
                                <ul className="rules-list">
                                    <li className={`rule-item ${hasLength ? "valid" : "invalid"}`}>
                                        <span className="rule-icon">{hasLength ? "✓" : "✖"}</span> At least 8 characters
                                    </li>
                                    <li className={`rule-item ${hasUppercase ? "valid" : "invalid"}`}>
                                        <span className="rule-icon">{hasUppercase ? "✓" : "✖"}</span> At least 1 capital letter (A-Z)
                                    </li>
                                    <li className={`rule-item ${hasSpecial ? "valid" : "invalid"}`}>
                                        <span className="rule-icon">{hasSpecial ? "✓" : "✖"}</span> At least 1 special character (!@#$%^&*)
                                    </li>
                                </ul>
                            </div>

                            {signUpError && (
                                <div id="signup-error" className="auth-error-msg" role="alert">
                                    {signUpError}
                                </div>
                            )}
                            <button type="submit" className="primary-btn auth-submit-btn">
                                Create Account
                            </button>
                        </form>
                    )}

                    <div className="guest-divider">
                        <span>{t("orDivider", lang)}</span>
                    </div>

                    <button
                        type="button"
                        className="google-auth-btn"
                        id="btn-google-login"
                        onClick={handleGoogleClick}
                    >
                        <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>{t("continueWithGoogle", lang)}</span>
                    </button>

                    <button
                        type="button"
                        className="guest-login-btn"
                        id="btn-guest-login"
                        onClick={handleGuestClick}
                    >
                        <span>👤</span> <span>{t("continueGuest", lang)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
