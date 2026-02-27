import { useEffect, useMemo, useState } from 'react';
import { appointmentAPI, petAPI, serviceAPI } from '../services/api';
import './Vetease.css';

export function BookAppointment() {
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const canCheck = useMemo(() => date && serviceId, [date, serviceId]);
  const canSubmit = useMemo(() => petId && serviceId && date && time, [petId, serviceId, date, time]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [pRes, sRes] = await Promise.all([petAPI.listMine(), serviceAPI.listActive()]);
        setPets(pRes.data);
        setServices(sRes.data);
      } catch (e) {
        setError(e.response?.data?.message || e.response?.data || 'Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const checkAvailability = async () => {
    if (!canCheck) return;
    setError('');
    setSuccess('');
    setTime('');
    try {
      const res = await appointmentAPI.availability({ date, serviceId });
      setSlots(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to check availability');
      setSlots([]);
    }
  };

  useEffect(() => {
    if (canCheck) checkAvailability();
  }, [date, serviceId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await appointmentAPI.create({
        petId: Number(petId),
        serviceId: Number(serviceId),
        date,
        time,
        notes,
      });
      setSuccess('Appointment request submitted. Status: Pending.');
      setNotes('');
      await checkAvailability();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Booking failed');
    }
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
          <h1 className="ve-title">Book Appointment</h1>
          <p className="ve-subtitle">Pick a pet, choose a service, and reserve an available time slot.</p>
        </div>
      </div>

      {error && <div className="ve-alert">{error}</div>}
      {success && <div className="ve-success">{success}</div>}

      <div className="ve-card">
        <form onSubmit={submit} className="ve-form">
          <div className="ve-row">
            <div className="ve-field">
              <label>Pet</label>
              <select value={petId} onChange={(e) => setPetId(e.target.value)}>
                <option value="">Select a pet</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="ve-field">
              <label>Service</label>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ve-row">
            <div className="ve-field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="ve-field">
              <label>Time Slot</label>
              <div className="ve-slots">
                {canCheck && slots.length === 0 ? (
                  <div className="ve-muted">No open slots.</div>
                ) : (
                  slots.map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`ve-slot ${time === s ? 'active' : ''}`}
                      onClick={() => setTime(s)}
                    >
                      {s.slice(0, 5)}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="ve-field">
            <label>Notes (symptoms/concerns)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>

          <div className="ve-actions">
            <button className="ve-btn ve-btn-primary" type="submit" disabled={!canSubmit}>
              Submit Booking
            </button>
            <button className="ve-btn ve-btn-ghost" type="button" onClick={checkAvailability} disabled={!canCheck}>
              Refresh Availability
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

