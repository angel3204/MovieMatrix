import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/uiSlice';
import { useAuth } from '../context/AuthContext';
import { t } from '../data/translations';

// Reusable Form Components
import Input from '../components/Input';
import Button from '../components/Button';
import FormError from '../components/FormError';

export default function Login(props) {
    const context = useOutletContext() || {};
    const effectiveProps = { ...context, ...props };

    const {
        onToast,
        lang = "en"
    } = effectiveProps;

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Destination after successful login
    const destination = location.state?.from?.pathname || location.state?.from || "/";

    useEffect(() => {
        if (isAuthenticated) {
            navigate(destination, { replace: true });
        }
    }, [isAuthenticated, navigate, destination]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            setErrorMsg("Email address is required.");
            return;
        }

        if (!emailRegex.test(cleanEmail)) {
            setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
            return;
        }

        if (!password) {
            setErrorMsg("Password is required.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await login(cleanEmail, password);

            if (result.success) {
                const firstName = result.user?.name ? result.user.name.split(' ')[0] : 'User';
                const msg = `Welcome back, ${firstName}! 👋`;
                dispatch(showToast({ message: msg, type: 'success' }));
                if (onToast) onToast(msg, "success");
                navigate(destination, { replace: true });
            } else {
                setErrorMsg(result.error || "Invalid email or password. Please check your credentials.");
            }
        } catch {
            setErrorMsg("Unable to sign in right now. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGuestLogin = async () => {
        setErrorMsg("");
        setIsSubmitting(true);
        try {
            const result = await login("guest@moviematrix.io", "guest");
            if (result.success) {
                dispatch(showToast({ message: "Logged in as Guest Explorer 👋", type: "success" }));
                if (onToast) onToast("Logged in as Guest Explorer 👋", "success");
                navigate(destination, { replace: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        const msg = `⚠️ ${t("googleSignInNotCompleted", lang)}`;
        dispatch(showToast({ message: msg, type: "warning" }));
        if (onToast) onToast(msg, "warning");
    };

    return (
        <div className="page-auth-wrapper" style={{ padding: '60px 4% 100px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="auth-box" style={{ maxWidth: '440px', width: '100%', margin: '0 auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px' }}>
                <div className="auth-header">
                    <h2 className="logo" style={{ textAlign: 'center', marginBottom: '8px' }}>MOVIE MATRIX</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                        Sign in to access your personal watchlist and streaming features.
                    </p>
                </div>

                {location.state?.from && (
                    <div
                        style={{
                            background: 'rgba(59, 130, 246, 0.12)',
                            border: '1px solid #3b82f6',
                            color: '#93c5fd',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            marginBottom: '18px',
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}
                    >
                        🔒 Please sign in to view your <strong>My List</strong> watchlist.
                    </div>
                )}

                <div className="auth-tabs" role="tablist" style={{ marginBottom: '24px' }}>
                    <Link
                        to="/login"
                        className="auth-tab active"
                        style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                        {t("signIn", lang)}
                    </Link>
                    <Link
                        to="/register"
                        state={location.state}
                        className="auth-tab"
                        style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                        Sign Up
                    </Link>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <Input
                        label={t("emailAddress", lang)}
                        id="login-email"
                        type="email"
                        placeholder={t("emailPlaceholder", lang)}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errorMsg) setErrorMsg("");
                        }}
                        required
                        autoComplete="email"
                        disabled={isSubmitting}
                    />

                    <Input
                        label={t("password", lang)}
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errorMsg) setErrorMsg("");
                        }}
                        required
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        endAdornment={
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label="Toggle password visibility"
                                disabled={isSubmitting}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        }
                    />

                    <FormError message={errorMsg} />

                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        loadingText="Signing In..."
                        className="auth-submit-btn"
                        style={{ width: '100%' }}
                    >
                        {t("signIn", lang)}
                    </Button>
                </form>

                <div className="guest-divider" style={{ margin: '20px 0' }}>
                    <span>{t("orDivider", lang)}</span>
                </div>

                <button
                    type="button"
                    className="google-auth-btn"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    style={{ width: '100%', marginBottom: '12px' }}
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
                    onClick={handleGuestLogin}
                    disabled={isSubmitting}
                    style={{ width: '100%' }}
                >
                    <span>👤</span> <span>{t("continueGuest", lang)}</span>
                </button>
            </div>
        </div>
    );
}
