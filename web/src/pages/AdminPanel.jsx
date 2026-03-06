import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatDateTime, formatStatus, getStatusTone } from '../utils/formatters';
import './Vetease.css';

export function AdminPanel() {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blockDate, setBlockDate] = useState('');

  const pendingCount = pendingAppointments.length;
  const confirmedTodayCount = todayAppointments.filter((appointment) => appointment.status === 'CONFIRMED').length;
  const completedTodayCount = todayAppointments.filter((appointment) => appointment.status === 'COMPLETED').length;

  const sortedBlockedDates = useMemo(
    () => [...blockedDates].sort((left, right) => left.date.localeCompare(right.date)),
    [blockedDates],
  );

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const [todayResponse, pendingResponse, settingsResponse, blockedResponse] = await Promise.all([
        adminAPI.today(),
        adminAPI.pending(),
        adminAPI.getSettings(),
        adminAPI.listBlockedDates(),
      ]);

      setTodayAppointments(todayResponse.data || []);
      setPendingAppointments(pendingResponse.data || []);
      setSettings(settingsResponse.data);
      setBlockedDates(blockedResponse.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load admin data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const runAdminAction = async (action, successMessage) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await action();
      setSuccess(successMessage);
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Admin action failed.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    await runAdminAction(() => adminAPI.updateSettings(settings), 'Clinic settings updated.');
  };

  const handleAddBlockedDate = async () => {
    if (!blockDate) {
      return;
    }

    await runAdminAction(() => adminAPI.addBlockedDate(blockDate), 'Blocked date added.');
    setBlockDate('');
  };

  if (loading) {
    return (
      <div className="ve-page">
        <p className="ve-muted">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="ve-page">
      <section className="ve-hero ve-hero--compact">
        <div>
          <div className="ve-kicker">Admin Control</div>
          <h2 className="ve-hero-title">Manage request approvals, daily schedules, and clinic availability.</h2>
          <p className="ve-hero-copy">
            This panel is connected to the backend appointment and clinic settings endpoints currently implemented in
            Spring Boot.
          </p>
        </div>
      </section>

      {error && <div className="ve-alert">{error}</div>}
      {success && <div className="ve-success">{success}</div>}

      <section className="ve-stats-grid">
        <article className="ve-stat-card">
          <span className="ve-stat-label">Pending Requests</span>
          <strong>{pendingCount}</strong>
          <span className="ve-stat-detail">Appointments awaiting confirmation</span>
        </article>
        <article className="ve-stat-card">
          <span className="ve-stat-label">Today Confirmed</span>
          <strong>{confirmedTodayCount}</strong>
          <span className="ve-stat-detail">Ready for clinic service</span>
        </article>
        <article className="ve-stat-card">
          <span className="ve-stat-label">Today Completed</span>
          <strong>{completedTodayCount}</strong>
          <span className="ve-stat-detail">Finished appointments today</span>
        </article>
        <article className="ve-stat-card">
          <span className="ve-stat-label">Blocked Dates</span>
          <strong>{blockedDates.length}</strong>
          <span className="ve-stat-detail">Clinic closures configured</span>
        </article>
      </section>

      <div className="ve-grid ve-grid-main">
        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Pending Appointment Requests</h3>
              <p className="ve-section-copy">Approve or reject future requests waiting on the clinic.</p>
            </div>
          </div>

          {pendingAppointments.length === 0 ? (
            <p className="ve-muted">No pending appointments.</p>
          ) : (
            <div className="ve-table">
              {pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="ve-rowline">
                  <div className="ve-rowleft">
                    <div className="ve-rowtitle">
                      {appointment.service?.name} for {appointment.pet?.name}
                    </div>
                    <div className="ve-rowmeta">{formatDateTime(appointment.date, appointment.time)}</div>
                    <div className="ve-rowmeta">
                      {appointment.client?.firstName} {appointment.client?.lastName} · {appointment.client?.email}
                    </div>
                  </div>
                  <div className={`ve-status ${getStatusTone(appointment.status)}`}>
                    {formatStatus(appointment.status)}
                  </div>
                  <div className="ve-rowactions">
                    <button
                      className="ve-mini"
                      disabled={saving}
                      onClick={() =>
                        runAdminAction(() => adminAPI.confirm(appointment.id), 'Appointment confirmed.')
                      }
                    >
                      Confirm
                    </button>
                    <button
                      className="ve-mini ve-mini-danger"
                      disabled={saving}
                      onClick={() =>
                        runAdminAction(() => adminAPI.cancel(appointment.id), 'Appointment cancelled.')
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Today&apos;s Schedule</h3>
              <p className="ve-section-copy">Track active bookings scheduled for today.</p>
            </div>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="ve-muted">No appointments scheduled for today.</p>
          ) : (
            <div className="ve-table">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="ve-rowline">
                  <div className="ve-rowleft">
                    <div className="ve-rowtitle">
                      {appointment.service?.name} for {appointment.pet?.name}
                    </div>
                    <div className="ve-rowmeta">
                      {appointment.client?.firstName} {appointment.client?.lastName} · {appointment.client?.username}
                    </div>
                    {appointment.notes && <div className="ve-rowmeta ve-rowmeta--notes">{appointment.notes}</div>}
                  </div>
                  <div className={`ve-status ${getStatusTone(appointment.status)}`}>
                    {formatStatus(appointment.status)}
                  </div>
                  <div className="ve-rowactions">
                    <button
                      className="ve-mini"
                      disabled={saving || appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'}
                      onClick={() =>
                        runAdminAction(() => adminAPI.complete(appointment.id), 'Appointment marked as completed.')
                      }
                    >
                      Complete
                    </button>
                    <button
                      className="ve-mini ve-mini-danger"
                      disabled={saving || appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'}
                      onClick={() =>
                        runAdminAction(() => adminAPI.cancel(appointment.id), 'Appointment cancelled.')
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="ve-grid ve-grid-2">
        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Clinic Settings</h3>
              <p className="ve-section-copy">Define opening hours and slot generation length.</p>
            </div>
          </div>

          {!settings ? (
            <p className="ve-muted">No settings available.</p>
          ) : (
            <div className="ve-form">
              <div className="ve-row">
                <div className="ve-field">
                  <label htmlFor="openingTime">Opening Time</label>
                  <input
                    id="openingTime"
                    type="time"
                    value={settings.openingTime?.slice(0, 5) || '09:00'}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        openingTime: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="ve-field">
                  <label htmlFor="closingTime">Closing Time</label>
                  <input
                    id="closingTime"
                    type="time"
                    value={settings.closingTime?.slice(0, 5) || '17:00'}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        closingTime: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="ve-field">
                <label htmlFor="slotMinutes">Slot Minutes</label>
                <input
                  id="slotMinutes"
                  min="5"
                  step="5"
                  type="number"
                  value={settings.slotMinutes ?? 30}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      slotMinutes: Number(event.target.value),
                    }))
                  }
                />
              </div>

              <div className="ve-actions">
                <button className="ve-btn ve-btn-primary" disabled={saving} onClick={handleSaveSettings} type="button">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Blocked Dates</h3>
              <p className="ve-section-copy">Prevent bookings on holidays and clinic closure dates.</p>
            </div>
          </div>

          <div className="ve-row">
            <div className="ve-field">
              <label htmlFor="blockDate">New Blocked Date</label>
              <input id="blockDate" type="date" value={blockDate} onChange={(event) => setBlockDate(event.target.value)} />
            </div>
            <div className="ve-actions">
              <button
                className="ve-btn ve-btn-primary"
                disabled={!blockDate || saving}
                onClick={handleAddBlockedDate}
                type="button"
              >
                Add Blocked Date
              </button>
            </div>
          </div>

          {sortedBlockedDates.length === 0 ? (
            <p className="ve-muted">No blocked dates configured.</p>
          ) : (
            <div className="ve-list">
              {sortedBlockedDates.map((blockedDate) => (
                <div key={blockedDate.id} className="ve-list-item">
                  <div className="ve-list-main ve-list-main--column">
                    <div className="ve-list-title">{formatDate(blockedDate.date)}</div>
                    <div className="ve-list-meta">Clinic closed</div>
                  </div>
                  <div className="ve-list-actions">
                    <button
                      className="ve-mini ve-mini-danger"
                      disabled={saving}
                      onClick={() =>
                        runAdminAction(() => adminAPI.removeBlockedDate(blockedDate.id), 'Blocked date removed.')
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
