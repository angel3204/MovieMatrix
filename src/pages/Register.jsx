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

export default function Register(props) {
    const context = useOutletContext() || {};
    const effectiveProps = { ...context, ...props };

    const {
        onToast,
        lang = "en"
    } = effectiveProps;

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { register, isAuthenticated } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Destination after successful registration
    const destination = location.state?.from?.pathname || location.state?.from || "/";

    useEffect(() => {
        if (isAuthenticated) {
            navigate(destination, { replace: true });
        }
    }, [isAuthenticated, navigate, destination]);

    // Password rules validation indicators
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+-=]/.test(password);
    const isPasswordValid = hasLength && hasUppercase && hasSpecial;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const cleanName = name.trim();
        const cleanEmail = email.trim();

        // 1. All fields required
        if (!cleanName) {
            setErrorMsg("Please enter your full name.");
            return;
        }

        if (!cleanEmail) {
            setErrorMsg("Please enter your email address.");
            return;
        }

        // 2. Valid email format
        if (!emailRegex.test(cleanEmail)) {
            setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
            return;
        }

        if (!password) {
            setErrorMsg("Please create a password.");
            return;
        }

        // 3. Password requirements (min length, uppercase, special char)
        if (!isPasswordValid) {
            setErrorMsg("Password must be at least 8 characters, contain 1 capital letter, and 1 special character.");
            return;
        }

        if (!confirmPassword) {
            setErrorMsg("Please confirm your password.");
            return;
        }

        // 4. Password confirmation must match
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match. Please re-enter your confirmation password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await register(cleanName, cleanEmail, password);

            if (result.success) {
                const msg = `Account created! Welcome to Movie Matrix, ${cleanName.split(' ')[0]}! 🎉`;
                dispatch(showToast({ message: msg, type: "success" }));
                if (onToast) onToast(msg, "success");
                navigate(destination, { replace: true });
            } else {
                setErrorMsg(result.error || "Failed to create account. Please try again.");
            }
        } catch {
            setErrorMsg("Unable to complete registration. Please try again.");
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
                        Create an account to save movies, customize recommendations, and stream anywhere.
                    </p>
                </div>

                <div className="auth-tabs" role="tablist" style={{ marginBottom: '24px' }}>
                    <Link
                        to="/login"
                        state={location.state}
                        className="auth-tab"
                        style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                        {t("signIn", lang)}
                    </Link>
                    <Link
                        to="/register"
                        className="auth-tab active"
                        style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                        Sign Up
                    </Link>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <Input
                        label="Full Name"
                        id="register-name"
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errorMsg) setErrorMsg("");
                        }}
                        required
                        autoComplete="name"
                        disabled={isSubmitting}
                    />

                    <Input
                        label={t("emailAddress", lang)}
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
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
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errorMsg) setErrorMsg("");
                        }}
                        required
                        autoComplete="new-password"
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

                    <div className="password-rules-box" id="password-rules-box" style={{ marginBottom: '18px' }}>
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

                    <Input
                        label="Confirm Password"
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errorMsg) setErrorMsg("");
                        }}
                        required
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        endAdornment={
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                aria-label="Toggle confirm password visibility"
                                disabled={isSubmitting}
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </button>
                        }
                    />

                    <FormError message={errorMsg} />

                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        loadingText="Creating Account..."
                        className="auth-submit-btn"
                        style={{ width: '100%' }}
                    >
                        Create Account
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
            </div>
        </div>
    );
}
