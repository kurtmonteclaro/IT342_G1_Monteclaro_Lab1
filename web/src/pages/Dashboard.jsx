import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        setUserInfo(response.data);
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
          </div>
        )}
      </div>
    </div>
  );
}
