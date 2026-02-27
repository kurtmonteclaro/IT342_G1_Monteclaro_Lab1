import { useEffect, useMemo, useState } from 'react';
import { appointmentAPI } from '../services/api';
import './Vetease.css';

export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rescheduleId, setRescheduleId] = useState(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedTime, setReschedTime] = useState('');
  const [reschedSlots, setReschedSlots] = useState([]);
  const [reschedServiceId, setReschedServiceId] = useState(null);

  const canResched = useMemo(() => rescheduleId && reschedDate && reschedTime, [rescheduleId, reschedDate, reschedTime]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentAPI.listMine();
      setAppointments(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    setError('');
    try {
      await appointmentAPI.cancel(id);
      await load();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Cancel failed');
    }
  };

  const openReschedule = async (appt) => {
    setRescheduleId(appt.id);
    setReschedDate(appt.date);
    setReschedTime('');
    setReschedServiceId(appt.service?.id);
    try {
      const res = await appointmentAPI.availability({ date: appt.date, serviceId: appt.service?.id });
      setReschedSlots(res.data);
    } catch {
      setReschedSlots([]);
    }
  };

  const refreshReschedSlots = async () => {
    if (!reschedDate || !reschedServiceId) return;
    const res = await appointmentAPI.availability({ date: reschedDate, serviceId: reschedServiceId });
    setReschedSlots(res.data);
  };

  useEffect(() => {
    if (rescheduleId && reschedDate && reschedServiceId) refreshReschedSlots();
  }, [reschedDate, reschedServiceId, rescheduleId]);

  const doReschedule = async () => {
    setError('');
    try {
      await appointmentAPI.reschedule(rescheduleId, { date: reschedDate, time: reschedTime });
      setRescheduleId(null);
      setReschedTime('');
      await load();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Reschedule failed');
    }
  };

  return (
    <div className="ve-page">
      <div className="ve-header">
        <div>
          <h1 className="ve-title">My Appointments</h1>
          <p className="ve-subtitle">Track status, cancel, or reschedule when needed.</p>
        </div>
      </div>

      {error && <div className="ve-alert">{error}</div>}

      <div className="ve-card">
        {loading ? (
          <p className="ve-muted">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="ve-muted">No appointments yet.</p>
        ) : (
          <div className="ve-table">
            {appointments.map((a) => (
              <div key={a.id} className="ve-rowline">
                <div className="ve-rowleft">
                  <div className="ve-rowtitle">
                    {a.service?.name} • {a.pet?.name}
                  </div>
                  <div className="ve-rowmeta">
                    {a.date} at {a.time?.slice(0, 5)}
                  </div>
                </div>
                <div className={`ve-status ${a.status?.toLowerCase()}`}>{a.status}</div>
                <div className="ve-rowactions">
                  <button className="ve-mini" onClick={() => openReschedule(a)} disabled={a.status === 'COMPLETED' || a.status === 'CANCELLED'}>
                    Reschedule
                  </button>
                  <button className="ve-mini ve-mini-danger" onClick={() => cancel(a.id)} disabled={a.status === 'COMPLETED' || a.status === 'CANCELLED'}>
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rescheduleId && (
        <div className="ve-card ve-card-tight">
          <h2 className="ve-card-title">Reschedule</h2>
          <div className="ve-form">
            <div className="ve-row">
              <div className="ve-field">
                <label>Date</label>
                <input type="date" value={reschedDate} onChange={(e) => setReschedDate(e.target.value)} />
              </div>
              <div className="ve-field">
                <label>Time Slot</label>
                <div className="ve-slots">
                  {reschedSlots.length === 0 ? (
                    <div className="ve-muted">No open slots.</div>
                  ) : (
                    reschedSlots.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`ve-slot ${reschedTime === s ? 'active' : ''}`}
                        onClick={() => setReschedTime(s)}
                      >
                        {s.slice(0, 5)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="ve-actions">
              <button className="ve-btn ve-btn-primary" onClick={doReschedule} disabled={!canResched}>
                Confirm Reschedule
              </button>
              <button className="ve-btn ve-btn-ghost" onClick={() => setRescheduleId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

