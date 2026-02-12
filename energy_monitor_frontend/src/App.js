import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

import { ApiClient } from './api/ApiClient';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AlertsPage } from './pages/AlertsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

/**
 * @param {{children: React.ReactNode}} props
 * @return {JSX.Element}
 */
function AppProviders(props) {
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    const api = useMemo(() => new ApiClient(apiBaseUrl), [apiBaseUrl]);

    return (
        <AuthProvider api={api}>
            {props.children}
        </AuthProvider>
    );
}

/**
 * @param {{children: React.ReactNode}} props
 * @return {JSX.Element}
 */
function ProtectedRoute(props) {
    const auth = useAuth();
    const location = useLocation();

    if (!auth.isReady) {
        return (
            <div className="app-shell">
                <main className="content">
                    <div className="panel">
                        <div className="panel-title">Loading…</div>
                        <div className="muted">Checking your session.</div>
                    </div>
                </main>
            </div>
        );
    }

    if (!auth.token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return /** @type {JSX.Element} */ (props.children);
}

/**
 * @return {JSX.Element}
 */
function Sidebar() {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * @param {string} path
     * @return {string}
     */
    function navClass(path) {
        return location.pathname === path ? 'nav-item nav-item-active' : 'nav-item';
    }

    async function onLogout() {
        await auth.logout();
        navigate('/login');
    }

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-badge">EM</div>
                <div>
                    <div className="brand-title">Energy Monitor</div>
                    <div className="brand-subtitle">Retro Analytics Console</div>
                </div>
            </div>

            <nav className="nav">
                <Link className={navClass('/')} to="/">Dashboard</Link>
                <Link className={navClass('/devices')} to="/devices">Devices</Link>
                <Link className={navClass('/alerts')} to="/alerts">Alerts</Link>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-label">Signed in as</div>
                    <div className="sidebar-user-value">{auth.user?.email || '—'}</div>
                </div>

                <button className="btn btn-ghost" onClick={onLogout} type="button">
                    Sign out
                </button>
            </div>
        </aside>
    );
}

/**
 * @return {JSX.Element}
 */
function AppShell() {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="content">
                <Routes>
                    <Route
                        path="/"
                        element={(
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route
                        path="/devices"
                        element={(
                            <ProtectedRoute>
                                <DevicesPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route
                        path="/alerts"
                        element={(
                            <ProtectedRoute>
                                <AlertsPage />
                            </ProtectedRoute>
                        )}
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

// PUBLIC_INTERFACE
/**
 * Main application entry component.
 * @return {JSX.Element}
 */
function App() {
    // Keep the template's theme hook but do not manipulate DOM directly.
    // We use body dataset with React effect.
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        document.body.dataset.theme = theme;
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    return (
        <BrowserRouter>
            <AppProviders>
                <div className="topbar">
                    <div className="topbar-left">
                        <span className="pill">LIVE</span>
                        <span className="topbar-title">Energy Monitoring & Analytics</span>
                    </div>
                    <div className="topbar-right">
                        <button className="btn btn-small" onClick={toggleTheme} type="button">
                            Theme: {theme}
                        </button>
                    </div>
                </div>
                <AppShell />
            </AppProviders>
        </BrowserRouter>
    );
}

export default App;
