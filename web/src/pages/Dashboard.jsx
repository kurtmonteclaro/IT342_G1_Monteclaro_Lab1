import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { appointmentAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import {
  formatDateTime,
  formatStatus,
  getStatusTone,
  isPastAppointment,
  sortAppointments,
} from '../utils/formatters';
import './Vetease.css';

export function Dashboard() {
  const auth = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await appointmentAPI.listMine();
        setAppointments(sortAppointments(response.data || []));
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load your dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const nextAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) =>
          !isPastAppointment(appointment) &&
          appointment.status !== 'CANCELLED' &&
          appointment.status !== 'COMPLETED',
      ) || null,
    [appointments],
  );

  const completedCount = appointments.filter((appointment) => appointment.status === 'COMPLETED').length;
  const pendingCount = appointments.filter((appointment) => appointment.status === 'PENDING').length;
  const cancelledCount = appointments.filter((appointment) => appointment.status === 'CANCELLED').length;
  const recentAppointments = [...appointments].reverse().slice(0, 4);

  return (
    <div className="ve-page">
      <section className="ve-hero">
        <div>
          <div className="ve-kicker">Welcome back</div>
          <h2 className="ve-hero-title">
            {auth.user?.firstName || auth.user?.username}, your clinic bookings are all in one place.
          </h2>
          <p className="ve-hero-copy">
            Track upcoming visits, review your appointment history, and reserve verified time slots without
            calling the clinic.
          </p>
        </div>
        <div className="ve-hero-actions">
          <Link className="ve-btn ve-btn-primary" to="/appointments/book">
            Book an Appointment
          </Link>
          <Link className="ve-btn ve-btn-ghost" to="/pets">
            Manage Pets
          </Link>
        </div>
      </section>

      {error && <div className="ve-alert">{error}</div>}

      <section className="ve-stats-grid">
        <article className="ve-stat-card">
          <span className="ve-stat-label">Upcoming</span>
          <strong>{nextAppointment ? '1 scheduled' : 'No booking yet'}</strong>
          <span className="ve-stat-detail">
            {nextAppointment ? formatDateTime(nextAppointment.date, nextAppointment.time) : 'Reserve your next visit'}
          </span>
        </article>
        <article className="ve-stat-card">
          <span className="ve-stat-label">Pending Requests</span>
          <strong>{pendingCount}</strong>
          <span className="ve-stat-detail">Awaiting clinic approval</span>
        </article>
        <article className="ve-stat-card">
          <span className="ve-stat-label">Completed Visits</span>
          <strong>{completedCount}</strong>
          <span className="ve-stat-detail">Past appointments on record</span>
        </article>
        <article className="ve-stat-card">
          <span className="ve-stat-label">Cancelled</span>
          <strong>{cancelledCount}</strong>
          <span className="ve-stat-detail">Appointments you can rebook anytime</span>
        </article>
      </section>

      <div className="ve-grid ve-grid-main">
        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Next Appointment</h3>
              <p className="ve-section-copy">Your nearest active booking.</p>
            </div>
            <Link className="ve-link" to="/appointments">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="ve-muted">Loading schedule...</p>
          ) : !nextAppointment ? (
            <div className="ve-empty">
              <p>No upcoming appointment yet.</p>
              <Link className="ve-btn ve-btn-primary" to="/appointments/book">
                Start Booking
              </Link>
            </div>
          ) : (
            <div className="ve-highlight-card">
              <div className="ve-highlight-row">
                <span className="ve-highlight-label">Service</span>
                <strong>{nextAppointment.service?.name}</strong>
              </div>
              <div className="ve-highlight-row">
                <span className="ve-highlight-label">Pet</span>
                <strong>{nextAppointment.pet?.name}</strong>
              </div>
              <div className="ve-highlight-row">
                <span className="ve-highlight-label">Schedule</span>
                <strong>{formatDateTime(nextAppointment.date, nextAppointment.time)}</strong>
              </div>
              <div className="ve-highlight-row">
                <span className="ve-highlight-label">Status</span>
                <span className={`ve-status ${getStatusTone(nextAppointment.status)}`}>
                  {formatStatus(nextAppointment.status)}
                </span>
              </div>
              {nextAppointment.notes && (
                <div className="ve-highlight-note">
                  <span className="ve-highlight-label">Notes</span>
                  <p>{nextAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Profile Overview</h3>
              <p className="ve-section-copy">Account details used for your clinic reservations.</p>
            </div>
          </div>

          <div className="ve-detail-list">
            <div className="ve-detail-row">
              <span>Full Name</span>
              <strong>
                {auth.user?.firstName} {auth.user?.lastName}
              </strong>
            </div>
            <div className="ve-detail-row">
              <span>Username</span>
              <strong>{auth.user?.username}</strong>
            </div>
            <div className="ve-detail-row">
              <span>Email</span>
              <strong>{auth.user?.email}</strong>
            </div>
            <div className="ve-detail-row">
              <span>Role</span>
              <strong>{auth.user?.role}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="ve-card">
        <div className="ve-section-head">
          <div>
            <h3 className="ve-card-title">Recent Activity</h3>
            <p className="ve-section-copy">Latest requests and visit history.</p>
          </div>
        </div>

        {loading ? (
          <p className="ve-muted">Loading activity...</p>
        ) : recentAppointments.length === 0 ? (
          <p className="ve-muted">No appointment activity yet.</p>
        ) : (
          <div className="ve-table">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="ve-rowline">
                <div className="ve-rowleft">
                  <div className="ve-rowtitle">
                    {appointment.service?.name} for {appointment.pet?.name}
                  </div>
                  <div className="ve-rowmeta">{formatDateTime(appointment.date, appointment.time)}</div>
                </div>
                <div className={`ve-status ${getStatusTone(appointment.status)}`}>
                  {formatStatus(appointment.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
