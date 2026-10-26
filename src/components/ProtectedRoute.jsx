import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // While AuthContext is checking localStorage on initial boot, show Movie Matrix loader
    if (loading) {
        return (
            <div className="initial-loader" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                <div className="loader-content">
                    <h1 className="loader-logo">MOVIE MATRIX</h1>
                    <p className="loader-sub">Securing session...</p>
                    <div className="loader-progress-ring">
                        <div className="loader-bar-fill"></div>
                    </div>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to /login and preserve current location in state
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
