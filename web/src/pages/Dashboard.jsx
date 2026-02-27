import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI, authAPI } from '../services/api';
import './Dashboard.css';
import './Vetease.css';

export function Dashboard() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const [meRes, apptRes] = await Promise.all([
          authAPI.getCurrentUser(),
          appointmentAPI.listMine(),
        ]);
        setUserInfo(meRes.data);

        const upcoming = (apptRes.data || [])
          .filter((a) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
          .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];
        setNextAppointment(upcoming || null);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      
      <div className="ve-grid ve-grid-2">
        <div className="profile-section">
          <h2>Next Appointment</h2>
          {!nextAppointment ? (
            <p className="ve-muted">No upcoming appointments. Book one to get started.</p>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <label>Service</label>
                <p>{nextAppointment.service?.name}</p>
              </div>
              <div className="info-item">
                <label>Pet</label>
                <p>{nextAppointment.pet?.name}</p>
              </div>
              <div className="info-item">
                <label>Date / Time</label>
                <p>
                  {nextAppointment.date} • {nextAppointment.time?.slice(0, 5)}
                </p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>{nextAppointment.status}</p>
              </div>
            </div>
          )}
          <div className="ve-actions" style={{ marginTop: 18 }}>
            <button className="ve-btn ve-btn-primary" onClick={() => navigate('/appointments/book')}>
              Book Appointment
            </button>
            <button className="ve-btn ve-btn-ghost" onClick={() => navigate('/appointments')}>
              View All
            </button>
          </div>
        </div>

        <div className="profile-section">
          <h2>Profile Information</h2>
        {userInfo && (
          <div className="profile-info">
            <div className="info-item">
              <label>Username:</label>
              <p>{userInfo.username}</p>
            </div>
            <div className="info-item">
              <label>First Name:</label>
              <p>{userInfo.firstName}</p>
            </div>
            <div className="info-item">
              <label>Last Name:</label>
              <p>{userInfo.lastName}</p>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <p>{userInfo.email}</p>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <p>{userInfo.role}</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
