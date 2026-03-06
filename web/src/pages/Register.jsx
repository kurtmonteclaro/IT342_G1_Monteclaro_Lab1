import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiConfig, authAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import './Auth.css';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CLIENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleRegister = () => {
    window.location.href = `${apiConfig.origin}/oauth2/authorization/google`;
  };

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
    setSuccess('');

    try {
      await authAPI.register(form);
      setSuccess('Account created successfully. Redirecting to login...');
      window.setTimeout(() => navigate('/login', { replace: true }), 800);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-panel--hero">
        <div className="auth-kicker">Create Account</div>
        <h1>Start booking clinic visits online in a few minutes.</h1>
        <p>
          Register as a pet owner to manage bookings, or as an admin to review requests, manage schedules, and block
          clinic dates.
        </p>
        <div className="auth-feature-list">
          <div className="auth-feature">Client and admin roles available during sign-up</div>
          <div className="auth-feature">JWT-secured login backed by Spring Boot</div>
          <div className="auth-feature">Ready for pet profiles and appointment scheduling</div>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-card auth-card--wide">
          <div className="auth-card-head">
            <div className="auth-kicker">Registration</div>
            <h2>Create your VetEase account</h2>
            <p>Fill in the required details below. New users can sign in right after registration.</p>
          </div>

          {error && <div className="auth-message auth-message--error">{error}</div>}
          {success && <div className="auth-message auth-message--success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-row">
              <label className="auth-field">
                <span>First Name</span>
                <input name="firstName" onChange={handleChange} required type="text" value={form.firstName} />
              </label>
              <label className="auth-field">
                <span>Last Name</span>
                <input name="lastName" onChange={handleChange} required type="text" value={form.lastName} />
              </label>
            </div>

            <div className="auth-row">
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
                <span>Email</span>
                <input
                  autoComplete="email"
                  name="email"
                  onChange={handleChange}
                  required
                  type="email"
                  value={form.email}
                />
              </label>
            </div>

            <div className="auth-row">
              <label className="auth-field">
                <span>Password</span>
                <input
                  autoComplete="new-password"
                  name="password"
                  onChange={handleChange}
                  required
                  type="password"
                  value={form.password}
                />
              </label>
              <label className="auth-field">
                <span>Role</span>
                <select name="role" onChange={handleChange} value={form.role}>
                  <option value="CLIENT">Client</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
            </div>

            <button className="auth-submit" disabled={loading} type="submit">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <button className="auth-submit auth-submit--google" onClick={handleGoogleRegister} type="button">
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
            Already registered? <Link to="/login">Sign in here</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
