import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { adminAPI, appointmentAPI, clinicAPI, dashboardAPI, petAPI } from '../services/api';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [clientDashboard, setClientDashboard] = useState(null);
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminSettings, setAdminSettings] = useState({ openTime: '09:00', closeTime: '17:00', slotMinutes: 30 });
  const [blockedDates, setBlockedDates] = useState([]);
  const [petForm, setPetForm] = useState({ name: '', breed: '', age: 1, notes: '', vaccineHistory: '' });
  const [bookingForm, setBookingForm] = useState({ petId: '', serviceId: '', date: '', startTime: '', notes: '' });
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', durationMinutes: 30, active: true });
  const [blockedDateForm, setBlockedDateForm] = useState({ date: '', reason: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const serviceRes = await clinicAPI.getServices();
        setServices(serviceRes.data || []);

        if (auth.user?.role === 'ADMIN') {
          const [adminDashRes, settingsRes, blockedDatesRes, adminServicesRes] = await Promise.all([
            dashboardAPI.getAdmin(),
            adminAPI.getSettings(),
            adminAPI.getBlockedDates(),
            adminAPI.getServices()
          ]);
          setAdminDashboard(adminDashRes.data);
          setAdminSettings(settingsRes.data);
          setBlockedDates(blockedDatesRes.data || []);
          setServices(adminServicesRes.data || []);
        } else {
          const [petsRes, appointmentsRes, dashboardRes] = await Promise.all([
            petAPI.getAll(),
            appointmentAPI.getAll(),
            dashboardAPI.getClient()
          ]);
          setPets(petsRes.data || []);
          setAppointments(appointmentsRes.data || []);
          setClientDashboard(dashboardRes.data);
        }
      } catch (err) {
        setError(err.response?.data || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [auth.user?.role]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!bookingForm.date || !bookingForm.serviceId) {
        setAvailability([]);
        return;
      }
      try {
        const response = await appointmentAPI.getAvailability(bookingForm.date, bookingForm.serviceId);
        setAvailability(response.data.availableSlots || []);
      } catch {
        setAvailability([]);
      }
    };
    fetchAvailability();
  }, [bookingForm.date, bookingForm.serviceId]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(a => a.status !== 'CANCELLED');
  }, [appointments]);

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const reloadClient = async () => {
    const [petsRes, appointmentsRes, dashboardRes] = await Promise.all([
      petAPI.getAll(),
      appointmentAPI.getAll(),
      dashboardAPI.getClient()
    ]);
    setPets(petsRes.data || []);
    setAppointments(appointmentsRes.data || []);
    setClientDashboard(dashboardRes.data);
  };

  const reloadAdmin = async () => {
    const [adminDashRes, settingsRes, blockedDatesRes, adminServicesRes] = await Promise.all([
      dashboardAPI.getAdmin(),
      adminAPI.getSettings(),
      adminAPI.getBlockedDates(),
      adminAPI.getServices()
    ]);
    setAdminDashboard(adminDashRes.data);
    setAdminSettings(settingsRes.data);
    setBlockedDates(blockedDatesRes.data || []);
    setServices(adminServicesRes.data || []);
  };

  const handleCreatePet = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await petAPI.create({ ...petForm, age: Number(petForm.age) });
      setPetForm({ name: '', breed: '', age: 1, notes: '', vaccineHistory: '' });
      await reloadClient();
      setMessage('Pet added successfully.');
    } catch (err) {
      setError(err.response?.data || 'Failed to add pet');
    }
  };

  const handleDeletePet = async (petId) => {
    setError('');
    setMessage('');
    try {
      await petAPI.remove(petId);
      await reloadClient();
      setMessage('Pet deleted.');
    } catch (err) {
      setError(err.response?.data || 'Failed to delete pet');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await appointmentAPI.book({
        ...bookingForm,
        petId: Number(bookingForm.petId),
        serviceId: Number(bookingForm.serviceId)
      });
      setBookingForm({ petId: '', serviceId: '', date: '', startTime: '', notes: '' });
      setAvailability([]);
      await reloadClient();
      setMessage('Appointment booked and set to Pending.');
    } catch (err) {
      setError(err.response?.data || 'Failed to book appointment');
    }
  };

  const handleCancelAppointment = async (id) => {
    setError('');
    setMessage('');
    try {
      await appointmentAPI.cancel(id);
      await reloadClient();
      setMessage('Appointment cancelled.');
    } catch (err) {
      setError(err.response?.data || 'Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = async (id) => {
    const date = window.prompt('Enter new date (YYYY-MM-DD)');
    const startTime = window.prompt('Enter new time (HH:mm)');
    if (!date || !startTime) return;

    setError('');
    setMessage('');
    try {
      await appointmentAPI.reschedule(id, { date, startTime });
      await reloadClient();
      setMessage('Appointment rescheduled and set to Pending.');
    } catch (err) {
      setError(err.response?.data || 'Failed to reschedule appointment');
    }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    setError('');
    setMessage('');
    try {
      await adminAPI.updateAppointmentStatus(id, status);
      await reloadAdmin();
      setMessage(`Appointment updated to ${status}.`);
    } catch (err) {
      setError(err.response?.data || 'Failed to update status');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await adminAPI.updateSettings({
        ...adminSettings,
        slotMinutes: Number(adminSettings.slotMinutes)
      });
      await reloadAdmin();
      setMessage('Clinic settings updated.');
    } catch (err) {
      setError(err.response?.data || 'Failed to update settings');
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await adminAPI.addBlockedDate(blockedDateForm);
      setBlockedDateForm({ date: '', reason: '' });
      await reloadAdmin();
      setMessage('Blocked date added.');
    } catch (err) {
      setError(err.response?.data || 'Failed to block date');
    }
  };

  const handleDeleteBlockedDate = async (id) => {
    setError('');
    setMessage('');
    try {
      await adminAPI.removeBlockedDate(id);
      await reloadAdmin();
      setMessage('Blocked date removed.');
    } catch (err) {
      setError(err.response?.data || 'Failed to remove blocked date');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await adminAPI.createService({
        ...serviceForm,
        durationMinutes: Number(serviceForm.durationMinutes)
      });
      setServiceForm({ name: '', description: '', durationMinutes: 30, active: true });
      await reloadAdmin();
      setMessage('Service added.');
    } catch (err) {
      setError(err.response?.data || 'Failed to add service');
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading VetQueue...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>VetQueue</h1>
          <p className="subtitle">
            {auth.user?.firstName} {auth.user?.lastName} ({auth.user?.role || 'CLIENT'})
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {message && <div className="status success">{message}</div>}
      {error && <div className="status error">{error}</div>}

      {auth.user?.role === 'ADMIN' ? (
        <div className="grid">
          <section className="card">
            <h2>Today&apos;s Schedule</h2>
            {(adminDashboard?.todaySchedule || []).map((a) => (
              <div key={a.id} className="row">
                <span>{a.appointmentDate} {a.startTime} - {a.petName} ({a.serviceName})</span>
                <span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Pending Requests</h2>
            {(adminDashboard?.pendingRequests || []).map((a) => (
              <div key={a.id} className="row actions">
                <span>{a.appointmentDate} {a.startTime} - {a.ownerName}</span>
                <div>
                  <button onClick={() => handleUpdateAppointmentStatus(a.id, 'CONFIRMED')}>Confirm</button>
                  <button onClick={() => handleUpdateAppointmentStatus(a.id, 'COMPLETED')}>Complete</button>
                  <button className="danger" onClick={() => handleUpdateAppointmentStatus(a.id, 'CANCELLED')}>Cancel</button>
                </div>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Clinic Hours</h2>
            <form onSubmit={handleUpdateSettings} className="form-grid">
              <input type="time" value={adminSettings.openTime || ''} onChange={(e) => setAdminSettings(prev => ({ ...prev, openTime: e.target.value }))} required />
              <input type="time" value={adminSettings.closeTime || ''} onChange={(e) => setAdminSettings(prev => ({ ...prev, closeTime: e.target.value }))} required />
              <input type="number" min="5" value={adminSettings.slotMinutes || 30} onChange={(e) => setAdminSettings(prev => ({ ...prev, slotMinutes: e.target.value }))} required />
              <button type="submit">Save Hours</button>
            </form>
          </section>

          <section className="card">
            <h2>Blocked Dates</h2>
            <form onSubmit={handleAddBlockedDate} className="form-grid">
              <input type="date" value={blockedDateForm.date} onChange={(e) => setBlockedDateForm(prev => ({ ...prev, date: e.target.value }))} required />
              <input type="text" placeholder="Reason" value={blockedDateForm.reason} onChange={(e) => setBlockedDateForm(prev => ({ ...prev, reason: e.target.value }))} />
              <button type="submit">Add Block</button>
            </form>
            {blockedDates.map((b) => (
              <div className="row actions" key={b.id}>
                <span>{b.date} {b.reason ? `- ${b.reason}` : ''}</span>
                <button className="danger" onClick={() => handleDeleteBlockedDate(b.id)}>Remove</button>
              </div>
            ))}
          </section>

          <section className="card full">
            <h2>Manage Services</h2>
            <form onSubmit={handleCreateService} className="form-grid">
              <input type="text" placeholder="Service name" value={serviceForm.name} onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))} required />
              <input type="text" placeholder="Description" value={serviceForm.description} onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))} />
              <input type="number" min="5" value={serviceForm.durationMinutes} onChange={(e) => setServiceForm(prev => ({ ...prev, durationMinutes: e.target.value }))} required />
              <button type="submit">Add Service</button>
            </form>
            {services.map((s) => (
              <div key={s.id} className="row">
                <span>{s.name} ({s.durationMinutes} mins)</span>
                <span className={`badge ${s.active ? 'confirmed' : 'cancelled'}`}>{s.active ? 'Active' : 'Inactive'}</span>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <div className="grid">
          <section className="card">
            <h2>Next Appointment</h2>
            {clientDashboard?.nextAppointment ? (
              <p>{clientDashboard.nextAppointment.appointmentDate} at {clientDashboard.nextAppointment.startTime} ({clientDashboard.nextAppointment.serviceName})</p>
            ) : (
              <p>No upcoming appointment.</p>
            )}
          </section>

          <section className="card">
            <h2>Pet Profiles</h2>
            <form onSubmit={handleCreatePet} className="form-grid">
              <input type="text" placeholder="Name" value={petForm.name} onChange={(e) => setPetForm(prev => ({ ...prev, name: e.target.value }))} required />
              <input type="text" placeholder="Breed" value={petForm.breed} onChange={(e) => setPetForm(prev => ({ ...prev, breed: e.target.value }))} required />
              <input type="number" min="0" placeholder="Age" value={petForm.age} onChange={(e) => setPetForm(prev => ({ ...prev, age: e.target.value }))} required />
              <input type="text" placeholder="Notes" value={petForm.notes} onChange={(e) => setPetForm(prev => ({ ...prev, notes: e.target.value }))} />
              <input type="text" placeholder="Vaccine history" value={petForm.vaccineHistory} onChange={(e) => setPetForm(prev => ({ ...prev, vaccineHistory: e.target.value }))} />
              <button type="submit">Add Pet</button>
            </form>
            {pets.map((pet) => (
              <div key={pet.id} className="row actions">
                <span>{pet.name} - {pet.breed}, {pet.age} yrs</span>
                <button className="danger" onClick={() => handleDeletePet(pet.id)}>Delete</button>
              </div>
            ))}
          </section>

          <section className="card full">
            <h2>Book Appointment</h2>
            <form onSubmit={handleBookAppointment} className="form-grid booking">
              <select value={bookingForm.petId} onChange={(e) => setBookingForm(prev => ({ ...prev, petId: e.target.value }))} required>
                <option value="">Select pet</option>
                {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
              </select>
              <select value={bookingForm.serviceId} onChange={(e) => setBookingForm(prev => ({ ...prev, serviceId: e.target.value }))} required>
                <option value="">Select service</option>
                {services.filter(s => s.active).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
              <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))} required />
              <select value={bookingForm.startTime} onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))} required>
                <option value="">Select time slot</option>
                {availability.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
              <input type="text" placeholder="Symptoms / concerns" value={bookingForm.notes} onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))} />
              <button type="submit">Book Now</button>
            </form>
          </section>

          <section className="card full">
            <h2>Upcoming Appointments</h2>
            {upcomingAppointments.map((a) => (
              <div key={a.id} className="row actions">
                <span>{a.appointmentDate} {a.startTime} - {a.petName} ({a.serviceName})</span>
                <div>
                  <span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span>
                  <button onClick={() => handleRescheduleAppointment(a.id)}>Reschedule</button>
                  <button className="danger" onClick={() => handleCancelAppointment(a.id)}>Cancel</button>
                </div>
              </div>
            ))}
          </section>

          <section className="card full">
            <h2>History</h2>
            {(clientDashboard?.history || []).map((h) => (
              <div key={h.id} className="row">
                <span>{h.appointmentDate} {h.startTime} - {h.petName} ({h.serviceName})</span>
                <span className={`badge ${h.status.toLowerCase()}`}>{h.status}</span>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
