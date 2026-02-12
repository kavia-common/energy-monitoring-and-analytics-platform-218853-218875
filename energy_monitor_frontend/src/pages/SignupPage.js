import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * @return {JSX.Element}
 */
export function SignupPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function onSubmit(e) {
        e.preventDefault();
        setError('');

        if (!email.includes('@')) {
            setError('Enter a valid email.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== password2) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setIsSubmitting(true);
            await auth.signup(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Signup failed.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid">
            <div className="panel col-12">
                <div className="panel-title">Create account</div>
                <div className="panel-subtitle">Your data is private and scoped to your user.</div>

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
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <div className="field">
                        <div className="label">Repeat password</div>
                        <input
                            className="input"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="row">
                        <button className="btn" disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Creating…' : 'Create account'}
                        </button>
                        <Link className="btn btn-ghost" to="/login">Back to sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
