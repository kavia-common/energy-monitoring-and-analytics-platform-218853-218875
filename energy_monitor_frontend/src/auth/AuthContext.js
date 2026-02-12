import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

/**
 * @return {{
 *   api: any,
 *   token: (string|null),
 *   user: (any|null),
 *   isReady: boolean,
 *   login: function(string, string): Promise<void>,
 *   signup: function(string, string): Promise<void>,
 *   logout: function(): Promise<void>,
 * }}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return ctx;
}

/**
 * @param {{api: any, children: React.ReactNode}} props
 * @return {JSX.Element}
 */
export function AuthProvider(props) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const saved = window.localStorage.getItem('em_token');
        if (saved) {
            setToken(saved);
        }
        setIsReady(true);
    }, []);

    useEffect(() => {
        async function loadMe() {
            if (!token) {
                setUser(null);
                return;
            }
            try {
                const me = await props.api.me(token);
                setUser(me);
            } catch (e) {
                // Token expired/invalid; clear it.
                window.localStorage.removeItem('em_token');
                setToken(null);
                setUser(null);
            }
        }
        loadMe();
    }, [token, props.api]);

    const login = useCallback(async (email, password) => {
        const resp = await props.api.login({ email, password });
        window.localStorage.setItem('em_token', resp.access_token);
        setToken(resp.access_token);
    }, [props.api]);

    const signup = useCallback(async (email, password) => {
        await props.api.signup({ email, password });
        // After signup, log in automatically.
        await login(email, password);
    }, [props.api, login]);

    const logout = useCallback(async () => {
        window.localStorage.removeItem('em_token');
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        api: props.api,
        token,
        user,
        isReady,
        login,
        signup,
        logout,
    }), [props.api, token, user, isReady, login, signup, logout]);

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
}
