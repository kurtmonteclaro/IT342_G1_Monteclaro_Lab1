import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import './Auth.css';

export function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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
            <p>Use your VetEase username and password. Google sign-in is not active in the current backend yet.</p>
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

          <p className="auth-switch">
            Need an account? <Link to="/register">Create one here</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
