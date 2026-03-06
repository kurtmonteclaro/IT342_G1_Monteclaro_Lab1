import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
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

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in here</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
