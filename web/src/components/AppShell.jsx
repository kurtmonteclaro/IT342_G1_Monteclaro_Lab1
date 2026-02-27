import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AppShell.css';

export function AppShell() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const role = auth.user?.role || 'CLIENT';

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-brand">
          <div className="shell-logo">VE</div>
          <div className="shell-brand-text">
            <div className="shell-title">VetEase</div>
            <div className="shell-subtitle">Appointments & Records</div>
          </div>
        </div>

        <nav className="shell-nav">
          <NavLink to="/dashboard" className="shell-link">
            Dashboard
          </NavLink>
          <NavLink to="/pets" className="shell-link">
            Pets
          </NavLink>
          <NavLink to="/services" className="shell-link">
            Services
          </NavLink>
          <NavLink to="/appointments/book" className="shell-link">
            Book Appointment
          </NavLink>
          <NavLink to="/appointments" className="shell-link">
            My Appointments
          </NavLink>
          {role === 'ADMIN' && (
            <NavLink to="/admin" className="shell-link">
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="shell-footer">
          <div className="shell-user">
            <div className="shell-user-avatar">
              {(auth.user?.username || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="shell-user-meta">
              <div className="shell-user-name">{auth.user?.username || 'User'}</div>
              <div className="shell-user-role">{role}</div>
            </div>
          </div>
          <button className="shell-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}

