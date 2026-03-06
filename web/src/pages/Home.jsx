import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import './Home.css';

export function Home() {
  const auth = useContext(AuthContext);
  const primaryCta = auth.isAuthenticated ? { to: '/dashboard', label: 'Open Dashboard' } : { to: '/register', label: 'Create Account' };
  const secondaryCta = auth.isAuthenticated ? { to: '/appointments/book', label: 'Book Appointment' } : { to: '/login', label: 'Sign In' };

  return (
    <div className="home-page">
      <header className="home-nav">
        <Link className="home-brand" to="/">
          <span className="home-brand-mark">VE</span>
          <span className="home-brand-name">VetEase</span>
        </Link>
        <div className="home-nav-actions">
          <Link className="home-nav-link" to="/services">
            Services
          </Link>
          <Link className="home-nav-link" to="/appointments/book">
            Book
          </Link>
          <Link className="home-nav-btn" to={secondaryCta.to}>
            {secondaryCta.label}
          </Link>
        </div>
      </header>

      <main className="home-content">
        <section className="home-hero">
          <div className="home-kicker">Care Made Easy</div>
          <h1>Book trusted veterinary visits in minutes.</h1>
          <p>
            VetEase helps pet owners manage profiles, reserve clinic slots, and track appointment status from one
            simple web dashboard.
          </p>
          <div className="home-hero-actions">
            <Link className="home-cta home-cta-primary" to={primaryCta.to}>
              {primaryCta.label}
            </Link>
            <Link className="home-cta" to={secondaryCta.to}>
              {secondaryCta.label}
            </Link>
          </div>
        </section>

        <section className="home-feature-grid">
          <article className="home-feature">
            <h2>For Pet Owners</h2>
            <p>Keep your pets, notes, and vaccine history in one organized profile before each visit.</p>
          </article>
          <article className="home-feature">
            <h2>Real Slot Availability</h2>
            <p>Choose only open times based on clinic settings and blocked dates from the backend.</p>
          </article>
          <article className="home-feature">
            <h2>Status Tracking</h2>
            <p>Monitor pending, confirmed, completed, and cancelled appointments without calling the clinic.</p>
          </article>
        </section>

        <section className="home-split">
          <article className="home-card">
            <div className="home-card-kicker">Pet-first Dashboard</div>
            <h3>Everything for your next visit in one timeline.</h3>
            <p>
              View upcoming appointments, rebook in a few clicks, and stay informed with history and clinic updates.
            </p>
            <Link className="home-inline-link" to="/dashboard">
              View dashboard flow
            </Link>
          </article>

          <article className="home-card home-card-highlight">
            <div className="home-card-kicker">Registration</div>
            <h3>Start with your account, then add your pets.</h3>
            <p>
              Client and admin roles are supported. Most users should register as pet owners and begin booking
              immediately.
            </p>
            <Link className="home-inline-link" to="/register">
              Create your account
            </Link>
          </article>
        </section>
      </main>
    </div>
  );
}
