import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * @return {JSX.Element}
 */
export function LoginPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function onSubmit(e) {
        e.preventDefault();
        setError('');

        if (!email.includes('@') || password.length < 8) {
            setError('Enter a valid email and a password with at least 8 characters.');
            return;
        }

        try {
            setIsSubmitting(true);
            await auth.login(email, password);
            const from = location.state && location.state.from ? location.state.from : '/';
            navigate(from);
        } catch (err) {
            setError(err.message || 'Login failed.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid">
            <div className="panel col-12">
                <div className="panel-title">Sign in</div>
                <div className="panel-subtitle">Access your devices, dashboards, and alerts.</div>

                {error ? <div className="notice">{error}</div> : null}

                <form className="form" onSubmit={onSubmit}>
                    <div className="field">
                        <div className="label">Email</div>
                        <input
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="field">
                        <div className="label">Password</div>
                        <input
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <div className="row">
                        <button className="btn" disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Signing in…' : 'Sign in'}
                        </button>
                        <Link className="btn btn-ghost" to="/signup">Create account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
