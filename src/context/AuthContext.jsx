import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

// Demo password hashing helper using Web Crypto API with fallback
async function hashDemoPassword(plainText) {
    if (!plainText) return "";
    try {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(plainText + "_movie_matrix_salt_2026");
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        }
    } catch {
        // Fallback for environments where subtle crypto is unavailable
    }
    return btoa(plainText + "_demo_salt");
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial check on app startup
    useEffect(() => {
        let isMounted = true;
        try {
            const savedUser = localStorage.getItem("movieMatrix_currentUser");
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                if (isMounted) {
                    setUser(parsed);
                }
            }
        } catch (err) {
            console.error("Failed to restore auth session from localStorage:", err);
        } finally {
            // Keep loading indicator brief but sufficient to prevent flash of wrong UI
            const timer = setTimeout(() => {
                if (isMounted) {
                    setLoading(false);
                }
            }, 300);
            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        }
    }, []);

    // Login function
    const login = useCallback(async (email, password) => {
        const cleanEmail = email ? email.trim().toLowerCase() : "";
        const cleanPassword = password ? password.trim() : "";

        if (!cleanEmail || !cleanPassword) {
            return {
                success: false,
                error: "Please enter both email and password."
            };
        }

        // Demo Guest Login shortcut
        if (cleanEmail === "guest@moviematrix.io") {
            const guestUser = {
                name: "Guest Explorer",
                email: "guest@moviematrix.io",
                isGuest: true
            };
            setUser(guestUser);
            try {
                localStorage.setItem("movieMatrix_currentUser", JSON.stringify(guestUser));
            } catch {}
            return { success: true, user: guestUser };
        }

        try {
            const usersRaw = localStorage.getItem("movieMatrix_users");
            const users = usersRaw ? JSON.parse(usersRaw) : [];
            const passwordHash = await hashDemoPassword(cleanPassword);

            // Match either hashed password or fallback legacy plain password
            const matchedUser = users.find(u =>
                u.email &&
                u.email.toLowerCase() === cleanEmail &&
                (u.passwordHash === passwordHash || u.password === cleanPassword)
            );

            if (!matchedUser) {
                return {
                    success: false,
                    error: "Invalid email or password. Please check your credentials or create a new account."
                };
            }

            const authenticatedUser = {
                name: matchedUser.name,
                email: matchedUser.email,
                isGuest: false
            };

            setUser(authenticatedUser);
            try {
                localStorage.setItem("movieMatrix_currentUser", JSON.stringify(authenticatedUser));
            } catch {}

            return { success: true, user: authenticatedUser };
        } catch (err) {
            console.error("Login error:", err);
            return {
                success: false,
                error: "An unexpected error occurred during login. Please try again."
            };
        }
    }, []);

    // Register function
    const register = useCallback(async (name, email, password) => {
        const cleanName = name ? name.trim() : "";
        const cleanEmail = email ? email.trim().toLowerCase() : "";
        const cleanPassword = password ? password.trim() : "";

        if (!cleanName || !cleanEmail || !cleanPassword) {
            return {
                success: false,
                error: "All fields are required."
            };
        }

        try {
            const usersRaw = localStorage.getItem("movieMatrix_users");
            const users = usersRaw ? JSON.parse(usersRaw) : [];

            // Check if email already registered
            const existingUser = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
            if (existingUser) {
                return {
                    success: false,
                    error: "An account with this email address already exists. Please sign in instead."
                };
            }

            const passwordHash = await hashDemoPassword(cleanPassword);
            const newUserRecord = {
                name: cleanName,
                email: cleanEmail,
                passwordHash, // Secure demo hash, no plain-text password
                createdAt: new Date().toISOString()
            };

            users.push(newUserRecord);
            localStorage.setItem("movieMatrix_users", JSON.stringify(users));

            const authenticatedUser = {
                name: cleanName,
                email: cleanEmail,
                isGuest: false
            };

            setUser(authenticatedUser);
            localStorage.setItem("movieMatrix_currentUser", JSON.stringify(authenticatedUser));

            return { success: true, user: authenticatedUser };
        } catch (err) {
            console.error("Registration error:", err);
            return {
                success: false,
                error: "Failed to create account. Please try again."
            };
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        setUser(null);
        try {
            localStorage.removeItem("movieMatrix_currentUser");
        } catch {}
    }, []);

    const value = {
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to consume AuthContext
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
