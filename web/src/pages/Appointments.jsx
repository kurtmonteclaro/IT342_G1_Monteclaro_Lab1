import { useEffect, useMemo, useState } from 'react';
import { appointmentAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import {
  formatDate,
  formatDateTime,
  formatStatus,
  formatTime,
  getStatusTone,
  getTodayIsoDate,
  isPastAppointment,
  sortAppointments,
} from '../utils/formatters';
import './Vetease.css';

export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rescheduleState, setRescheduleState] = useState({
    appointmentId: null,
    serviceId: null,
    date: '',
    time: '',
    slots: [],
    loading: false,
  });

  const loadAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await appointmentAPI.listMine();
      setAppointments(sortAppointments(response.data || []));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load appointments.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          !isPastAppointment(appointment) &&
          appointment.status !== 'COMPLETED' &&
          appointment.status !== 'CANCELLED',
      ),
    [appointments],
  );

  const historyAppointments = useMemo(
    () =>
      [...appointments]
        .filter(
          (appointment) =>
            appointment.status === 'COMPLETED' ||
            appointment.status === 'CANCELLED' ||
            isPastAppointment(appointment),
        )
        .reverse(),
    [appointments],
  );

  const loadRescheduleSlots = async (date, serviceId) => {
    if (!date || !serviceId) {
      return;
    }

    setRescheduleState((current) => ({
      ...current,
      loading: true,
      slots: [],
    }));

    try {
      const response = await appointmentAPI.availability({ date, serviceId });
      setRescheduleState((current) => ({
        ...current,
        loading: false,
        slots: response.data || [],
      }));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load available slots for rescheduling.'));
      setRescheduleState((current) => ({
        ...current,
        loading: false,
        slots: [],
      }));
    }
  };

  const openReschedule = async (appointment) => {
    setSuccess('');
    setError('');
    setRescheduleState({
      appointmentId: appointment.id,
      serviceId: appointment.service?.id,
      date: appointment.date,
      time: '',
      slots: [],
      loading: false,
    });
  };

  useEffect(() => {
    if (rescheduleState.appointmentId && rescheduleState.date && rescheduleState.serviceId) {
      loadRescheduleSlots(rescheduleState.date, rescheduleState.serviceId);
    }
  }, [rescheduleState.appointmentId, rescheduleState.date, rescheduleState.serviceId]);

  const handleCancel = async (appointmentId) => {
    setError('');
    setSuccess('');

    try {
      await appointmentAPI.cancel(appointmentId);
      setSuccess('Appointment cancelled.');
      await loadAppointments();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to cancel appointment.'));
    }
  };

  const handleReschedule = async () => {
    setError('');
    setSuccess('');

    try {
      await appointmentAPI.reschedule(rescheduleState.appointmentId, {
        date: rescheduleState.date,
        time: rescheduleState.time,
      });
      setSuccess('Appointment rescheduled and returned to pending status.');
      setRescheduleState({
        appointmentId: null,
        serviceId: null,
        date: '',
        time: '',
        slots: [],
        loading: false,
      });
      await loadAppointments();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reschedule appointment.'));
    }
  };

  const renderAppointmentCard = (appointment, mode) => (
    <div key={appointment.id} className="ve-rowline">
      <div className="ve-rowleft">
        <div className="ve-rowtitle">
          {appointment.service?.name} for {appointment.pet?.name}
        </div>
        <div className="ve-rowmeta">{formatDateTime(appointment.date, appointment.time)}</div>
        {appointment.notes && <div className="ve-rowmeta ve-rowmeta--notes">{appointment.notes}</div>}
      </div>
      <div className={`ve-status ${getStatusTone(appointment.status)}`}>{formatStatus(appointment.status)}</div>
      {mode === 'upcoming' && (
        <div className="ve-rowactions">
          <button className="ve-mini" onClick={() => openReschedule(appointment)}>
            Reschedule
          </button>
          <button className="ve-mini ve-mini-danger" onClick={() => handleCancel(appointment.id)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="ve-page">
      <div className="ve-header">
        <div>
          <h2 className="ve-title">My Appointments</h2>
          <p className="ve-subtitle">Review upcoming reservations, past visits, and any cancellations.</p>
        </div>
      </div>

      {error && <div className="ve-alert">{error}</div>}
      {success && <div className="ve-success">{success}</div>}

      <div className="ve-grid ve-grid-main">
        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Upcoming</h3>
              <p className="ve-section-copy">Appointments that can still be cancelled or moved.</p>
            </div>
          </div>

          {loading ? (
            <p className="ve-muted">Loading appointments...</p>
          ) : upcomingAppointments.length === 0 ? (
            <p className="ve-muted">No upcoming appointments.</p>
          ) : (
            <div className="ve-table">{upcomingAppointments.map((appointment) => renderAppointmentCard(appointment, 'upcoming'))}</div>
          )}
        </section>

        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">History</h3>
              <p className="ve-section-copy">Completed, cancelled, and older appointments.</p>
            </div>
          </div>

          {loading ? (
            <p className="ve-muted">Loading history...</p>
          ) : historyAppointments.length === 0 ? (
            <p className="ve-muted">No historical appointments yet.</p>
          ) : (
            <div className="ve-table">{historyAppointments.map((appointment) => renderAppointmentCard(appointment, 'history'))}</div>
          )}
        </section>
      </div>

      {rescheduleState.appointmentId && (
        <section className="ve-card ve-card-tight">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Reschedule Appointment</h3>
              <p className="ve-section-copy">Choose a new date and slot. Rescheduled appointments go back to pending.</p>
            </div>
          </div>

          <div className="ve-row">
            <div className="ve-field">
              <label htmlFor="reschedule-date">New Date</label>
              <input
                id="reschedule-date"
                min={getTodayIsoDate()}
                type="date"
                value={rescheduleState.date}
                onChange={(event) =>
                  setRescheduleState((current) => ({
                    ...current,
                    date: event.target.value,
                    time: '',
                  }))
                }
              />
            </div>
            <div className="ve-field">
              <label>Available Slots</label>
              <div className="ve-slots">
                {rescheduleState.loading ? (
                  <span className="ve-muted">Checking available slots...</span>
                ) : rescheduleState.slots.length === 0 ? (
                  <span className="ve-muted">No available slots for {formatDate(rescheduleState.date)}.</span>
                ) : (
                  rescheduleState.slots.map((slot) => (
                    <button
                      key={slot}
                      className={`ve-slot ${rescheduleState.time === slot ? 'active' : ''}`}
                      onClick={() =>
                        setRescheduleState((current) => ({
                          ...current,
                          time: slot,
                        }))
                      }
                      type="button"
                    >
                      {formatTime(slot)}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="ve-actions">
            <button
              className="ve-btn ve-btn-primary"
              disabled={!rescheduleState.date || !rescheduleState.time}
              onClick={handleReschedule}
              type="button"
            >
              Confirm Reschedule
            </button>
            <button
              className="ve-btn ve-btn-ghost"
              onClick={() =>
                setRescheduleState({
                  appointmentId: null,
                  serviceId: null,
                  date: '',
                  time: '',
                  slots: [],
                  loading: false,
                })
              }
              type="button"
            >
              Close
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
