import { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { apiConfig } from '../services/api';
import './Auth.css';

export function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') === 'google_login_failed' ? 'Google login failed.' : '');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleGoogleLogin = () => {
    window.location.href = `${apiConfig.origin}/oauth2/authorization/google`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(form);
      auth.login(response.data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-panel--hero">
        <div className="auth-kicker">VetEase</div>
        <h1>Online veterinary scheduling for pet owners and clinic staff.</h1>
        <p>
          Log in to manage pet profiles, reserve clinic slots, track appointment statuses, and handle daily schedules
          from one web dashboard.
        </p>
        <div className="auth-feature-list">
          <div className="auth-feature">Verified booking slots based on clinic settings</div>
          <div className="auth-feature">Role-based dashboard for clients and admins</div>
          <div className="auth-feature">Pet records and appointment history in one place</div>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-card">
          <div className="auth-card-head">
            <div className="auth-kicker">Welcome Back</div>
            <h2>Sign in to VetEase</h2>
            <p>Use your VetEase account or continue with your Google account.</p>
          </div>

          {error && <div className="auth-message auth-message--error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Username</span>
              <input
                autoComplete="username"
                name="username"
                onChange={handleChange}
                required
                type="text"
                value={form.username}
              />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input
                autoComplete="current-password"
                name="password"
                onChange={handleChange}
                required
                type="password"
                value={form.password}
              />
            </label>

            <button className="auth-submit" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <button className="auth-submit auth-submit--google" onClick={handleGoogleLogin} type="button">
            <svg aria-hidden="true" className="auth-google-icon" viewBox="0 0 24 24">
              <path
                d="M21.805 10.023H12v3.955h5.612c-.242 1.275-.968 2.356-2.063 3.082v2.558h3.34c1.955-1.8 3.084-4.455 3.084-7.618 0-.661-.06-1.297-.168-1.977z"
                fill="#4285F4"
              />
              <path
                d="M12 22c2.7 0 4.962-.895 6.617-2.422l-3.34-2.558c-.926.625-2.11.994-3.277.994-2.518 0-4.65-1.701-5.412-3.986H3.14v2.655A9.998 9.998 0 0012 22z"
                fill="#34A853"
              />
              <path
                d="M6.588 14.028A5.998 5.998 0 016.286 12c0-.705.12-1.389.302-2.028V7.317H3.14A9.998 9.998 0 002 12c0 1.61.386 3.13 1.14 4.683l3.448-2.655z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.986c1.468 0 2.786.506 3.823 1.5l2.867-2.867C16.958 2.996 14.697 2 12 2A9.998 9.998 0 003.14 7.317l3.448 2.655C7.35 7.687 9.482 5.986 12 5.986z"
                fill="#EA4335"
              />
            </svg>
            <span className="auth-submit-text">Continue with Google</span>
          </button>

          <p className="auth-switch">
            Need an account? <Link to="/register">Create one here</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
