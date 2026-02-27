import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import './Vetease.css';

export function AdminPanel() {
  const [today, setToday] = useState([]);
  const [pending, setPending] = useState([]);
  const [settings, setSettings] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [blockDate, setBlockDate] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, p, s, b] = await Promise.all([
        adminAPI.today(),
        adminAPI.pending(),
        adminAPI.getSettings(),
        adminAPI.listBlockedDates(),
      ]);
      setToday(t.data);
      setPending(p.data);
      setSettings(s.data);
      setBlockedDates(b.data);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Action failed');
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    await act(() => adminAPI.updateSettings(settings));
  };

  const addBlocked = async () => {
    if (!blockDate) return;
    await act(() => adminAPI.addBlockedDate(blockDate));
    setBlockDate('');
  };

  if (loading) {
    return (
      <div className="ve-page">
        <p className="ve-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="ve-page">
      <div className="ve-header">
        <div>
          <h1 className="ve-title">Admin Panel</h1>
          <p className="ve-subtitle">Approve appointments, manage clinic hours, and block dates.</p>
        </div>
      </div>

      {error && <div className="ve-alert">{error}</div>}

      <div className="ve-grid">
        <div className="ve-card">
          <h2 className="ve-card-title">Pending Requests</h2>
          {pending.length === 0 ? (
            <p className="ve-muted">No pending appointments.</p>
          ) : (
            <div className="ve-table">
              {pending.map((a) => (
                <div key={a.id} className="ve-rowline">
                  <div className="ve-rowleft">
                    <div className="ve-rowtitle">
                      {a.time?.slice(0, 5)} • {a.service?.name} • {a.pet?.name}
                    </div>
                    <div className="ve-rowmeta">
                      {a.date} • {a.client?.username} ({a.client?.firstName} {a.client?.lastName})
                    </div>
                  </div>
                  <div className={`ve-status ${a.status?.toLowerCase()}`}>{a.status}</div>
                  <div className="ve-rowactions">
                    <button className="ve-mini" onClick={() => act(() => adminAPI.confirm(a.id))}>
                      Confirm
                    </button>
                    <button className="ve-mini ve-mini-danger" onClick={() => act(() => adminAPI.cancel(a.id))}>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ve-card">
          <h2 className="ve-card-title">Today’s Schedule</h2>
          {today.length === 0 ? (
            <p className="ve-muted">No appointments for today.</p>
          ) : (
            <div className="ve-table">
              {today.map((a) => (
                <div key={a.id} className="ve-rowline">
                  <div className="ve-rowleft">
                    <div className="ve-rowtitle">
                      {a.time?.slice(0, 5)} • {a.service?.name} • {a.pet?.name}
                    </div>
                    <div className="ve-rowmeta">
                      {a.client?.username} • {a.client?.email}
                    </div>
                  </div>
                  <div className={`ve-status ${a.status?.toLowerCase()}`}>{a.status}</div>
                  <div className="ve-rowactions">
                    <button className="ve-mini" onClick={() => act(() => adminAPI.complete(a.id))} disabled={a.status === 'COMPLETED' || a.status === 'CANCELLED'}>
                      Complete
                    </button>
                    <button className="ve-mini ve-mini-danger" onClick={() => act(() => adminAPI.cancel(a.id))} disabled={a.status === 'COMPLETED' || a.status === 'CANCELLED'}>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ve-grid ve-grid-2">
        <div className="ve-card">
          <h2 className="ve-card-title">Clinic Hours</h2>
          {!settings ? (
            <p className="ve-muted">No settings loaded.</p>
          ) : (
            <div className="ve-form">
              <div className="ve-row">
                <div className="ve-field">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    value={settings.openingTime?.slice(0, 5) || '09:00'}
                    onChange={(e) => setSettings((p) => ({ ...p, openingTime: e.target.value }))}
                  />
                </div>
                <div className="ve-field">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    value={settings.closingTime?.slice(0, 5) || '17:00'}
                    onChange={(e) => setSettings((p) => ({ ...p, closingTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ve-row">
                <div className="ve-field">
                  <label>Slot Minutes</label>
                  <input
                    inputMode="numeric"
                    value={settings.slotMinutes ?? 30}
                    onChange={(e) => setSettings((p) => ({ ...p, slotMinutes: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="ve-actions">
                <button className="ve-btn ve-btn-primary" onClick={saveSettings}>
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ve-card">
          <h2 className="ve-card-title">Blocked Dates</h2>
          <div className="ve-row">
            <div className="ve-field">
              <label>Add blocked date</label>
              <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
            </div>
            <div className="ve-field ve-field-right">
              <label>&nbsp;</label>
              <button className="ve-btn ve-btn-primary" onClick={addBlocked} disabled={!blockDate}>
                Block
              </button>
            </div>
          </div>

          {blockedDates.length === 0 ? (
            <p className="ve-muted">No blocked dates.</p>
          ) : (
            <div className="ve-list">
              {blockedDates.map((b) => (
                <div key={b.id} className="ve-list-item">
                  <div className="ve-list-main">
                    <div className="ve-list-title">{b.date}</div>
                    <div className="ve-list-meta">Clinic closed</div>
                  </div>
                  <div className="ve-list-actions">
                    <button className="ve-mini ve-mini-danger" onClick={() => act(() => adminAPI.removeBlockedDate(b.id))}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

