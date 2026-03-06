import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import './AppShell.css';

const clientLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/pets', label: 'Pet Profiles' },
  { to: '/services', label: 'Clinic Services' },
  { to: '/appointments/book', label: 'Book Appointment' },
  { to: '/appointments', label: 'My Appointments' },
];

export function AppShell() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const role = auth.user?.role || 'CLIENT';
  const pageTitle =
    [...clientLinks]
      .sort((left, right) => right.to.length - left.to.length)
      .find((link) => location.pathname.startsWith(link.to))?.label ||
    (location.pathname.startsWith('/admin') ? 'Admin Panel' : 'VetEase');

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-brand">
          <div className="shell-logo">VE</div>
          <div>
            <div className="shell-eyebrow">Veterinary Booking Platform</div>
            <div className="shell-title">VetEase</div>
          </div>
        </div>

        <div className="shell-panel">
          <div className="shell-panel-label">Navigation</div>
          <nav className="shell-nav">
            {clientLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `shell-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {role === 'ADMIN' && (
              <NavLink to="/admin" className={({ isActive }) => `shell-link${isActive ? ' active' : ''}`}>
                Admin Panel
              </NavLink>
            )}
          </nav>
        </div>

        <div className="shell-panel shell-panel--highlight">
          <div className="shell-panel-label">Current Session</div>
          <div className="shell-user">
            <div className="shell-user-avatar">
              {(auth.user?.firstName || auth.user?.username || 'V').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="shell-user-name">
                {auth.user?.firstName} {auth.user?.lastName}
              </div>
              <div className="shell-user-meta">
                {auth.user?.username} - {role}
              </div>
            </div>
          </div>
          <div className="shell-user-email">{auth.user?.email}</div>
          <button className="shell-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <header className="shell-topbar">
          <div>
            <div className="shell-topbar-label">VetEase Workspace</div>
            <h1 className="shell-topbar-title">{pageTitle}</h1>
          </div>
          <div className="shell-topbar-card">
            <span className="shell-topbar-chip">{role}</span>
            <span>{auth.user?.username}</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
