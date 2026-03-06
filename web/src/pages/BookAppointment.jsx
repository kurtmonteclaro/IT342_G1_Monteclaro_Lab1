import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentAPI, petAPI, serviceAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime, formatTime, getTodayIsoDate } from '../utils/formatters';
import './Vetease.css';

export function BookAppointment() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    petId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: '',
  });

  const selectedPet = pets.find((pet) => String(pet.id) === form.petId);
  const selectedService = services.find((service) => String(service.id) === form.serviceId);
  const canCheckAvailability = Boolean(form.date && form.serviceId);
  const canSubmit = Boolean(form.petId && form.serviceId && form.date && form.time);

  useEffect(() => {
    const loadBookingData = async () => {
      setLoading(true);
      setError('');

      try {
        const [petResponse, serviceResponse] = await Promise.all([petAPI.listMine(), serviceAPI.listActive()]);
        setPets(petResponse.data || []);
        setServices(serviceResponse.data || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load booking form data.'));
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, []);

  const loadAvailability = async (date, serviceId) => {
    if (!date || !serviceId) {
      setSlots([]);
      return;
    }

    setSlotLoading(true);
    setError('');

    try {
      const response = await appointmentAPI.availability({ date, serviceId });
      setSlots(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load available time slots.'));
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  useEffect(() => {
    setForm((current) => ({
      ...current,
      time: '',
    }));

    if (form.date && form.serviceId) {
      loadAvailability(form.date, form.serviceId);
    } else {
      setSlots([]);
    }
  }, [form.date, form.serviceId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await appointmentAPI.create({
        petId: Number(form.petId),
        serviceId: Number(form.serviceId),
        date: form.date,
        time: form.time,
        notes: form.notes,
      });

      setSuccess('Appointment request submitted with pending status.');
      setForm((current) => ({
        ...current,
        time: '',
        notes: '',
      }));
      await loadAvailability(form.date, form.serviceId);
      window.setTimeout(() => navigate('/appointments'), 700);
    } catch (err) {
      setError(getErrorMessage(err, 'Booking failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const bookingSummary = useMemo(() => {
    if (!selectedPet || !selectedService || !form.date || !form.time) {
      return 'Select a pet, service, date, and slot to preview the reservation.';
    }

    return `${selectedPet.name} is set for ${selectedService.name} on ${formatDateTime(form.date, form.time)}.`;
  }, [form.date, form.time, selectedPet, selectedService]);

  if (loading) {
    return (
      <div className="ve-page">
        <p className="ve-muted">Loading booking form...</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="ve-page">
        <section className="ve-card ve-empty ve-empty--large">
          <h2 className="ve-card-title">Add a pet before booking</h2>
          <p className="ve-muted">Appointments are tied to a pet profile, so create one first.</p>
          <Link className="ve-btn ve-btn-primary" to="/pets">
            Go to Pet Profiles
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="ve-page">
      <div className="ve-header">
        <div>
          <h2 className="ve-title">Book Appointment</h2>
          <p className="ve-subtitle">
            Reserve only from generated open slots so your request stays aligned with clinic availability.
          </p>
        </div>
      </div>

      {error && <div className="ve-alert">{error}</div>}
      {success && <div className="ve-success">{success}</div>}

      <div className="ve-grid ve-grid-main">
        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Reservation Details</h3>
              <p className="ve-section-copy">Choose a pet, service, date, and verified time slot.</p>
            </div>
          </div>

          <form className="ve-form" onSubmit={handleSubmit}>
            <div className="ve-row">
              <div className="ve-field">
                <label htmlFor="petId">Pet</label>
                <select id="petId" name="petId" value={form.petId} onChange={handleChange}>
                  <option value="">Select a pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ve-field">
                <label htmlFor="serviceId">Service</label>
                <select id="serviceId" name="serviceId" value={form.serviceId} onChange={handleChange}>
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ve-row">
              <div className="ve-field">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  min={getTodayIsoDate()}
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              <div className="ve-field">
                <label>Time Slot</label>
                <div className="ve-slots">
                  {!canCheckAvailability ? (
                    <span className="ve-muted">Select a service and date first.</span>
                  ) : slotLoading ? (
                    <span className="ve-muted">Checking availability...</span>
                  ) : slots.length === 0 ? (
                    <span className="ve-muted">No open slots for this date.</span>
                  ) : (
                    slots.map((slot) => (
                      <button
                        key={slot}
                        className={`ve-slot ${form.time === slot ? 'active' : ''}`}
                        onClick={() => setForm((current) => ({ ...current, time: slot }))}
                        type="button"
                      >
                        {formatTime(slot)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="ve-field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Symptoms, concerns, or instructions for the clinic"
              />
            </div>

            <div className="ve-actions">
              <button className="ve-btn ve-btn-primary" disabled={!canSubmit || submitting} type="submit">
                {submitting ? 'Submitting...' : 'Submit Booking'}
              </button>
              <button
                className="ve-btn ve-btn-ghost"
                disabled={!canCheckAvailability || slotLoading}
                onClick={() => loadAvailability(form.date, form.serviceId)}
                type="button"
              >
                Refresh Slots
              </button>
            </div>
          </form>
        </section>

        <aside className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Booking Preview</h3>
              <p className="ve-section-copy">A quick check before you submit.</p>
            </div>
          </div>

          <div className="ve-detail-list">
            <div className="ve-detail-row">
              <span>Selected Pet</span>
              <strong>{selectedPet?.name || 'None yet'}</strong>
            </div>
            <div className="ve-detail-row">
              <span>Service</span>
              <strong>{selectedService?.name || 'None yet'}</strong>
            </div>
            <div className="ve-detail-row">
              <span>Date</span>
              <strong>{form.date || 'Not selected'}</strong>
            </div>
            <div className="ve-detail-row">
              <span>Time</span>
              <strong>{form.time ? formatTime(form.time) : 'Not selected'}</strong>
            </div>
          </div>

          <div className="ve-copy-block ve-copy-block--accent">
            <p>{bookingSummary}</p>
            <p>Submitted bookings start with a pending status until the clinic confirms them.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
