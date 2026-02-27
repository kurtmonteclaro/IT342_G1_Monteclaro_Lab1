import { useEffect, useState } from 'react';
import { serviceAPI } from '../services/api';
import './Vetease.css';

export function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await serviceAPI.listActive();
        setServices(res.data);
      } catch (e) {
        setError(e.response?.data?.message || e.response?.data || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="ve-page">
      <div className="ve-header">
        <div>
          <h1 className="ve-title">Clinic Services</h1>
          <p className="ve-subtitle">Choose a service, then book an available time slot.</p>
        </div>
      </div>

      {error && <div className="ve-alert">{error}</div>}

      {loading ? (
        <p className="ve-muted">Loading...</p>
      ) : services.length === 0 ? (
        <p className="ve-muted">No services configured yet.</p>
      ) : (
        <div className="ve-cards">
          {services.map((s) => (
            <div key={s.id} className="ve-service">
              <div className="ve-service-top">
                <div className="ve-service-title">{s.name}</div>
                {s.durationMinutes ? (
                  <div className="ve-chip">{s.durationMinutes} min</div>
                ) : (
                  <div className="ve-chip">—</div>
                )}
              </div>
              <div className="ve-service-desc">{s.description || 'No description provided.'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

