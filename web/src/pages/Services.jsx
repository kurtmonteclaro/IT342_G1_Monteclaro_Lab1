import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import './Vetease.css';

export function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await serviceAPI.listActive();
        setServices(response.data || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load clinic services.'));
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <div className="ve-page">
      <section className="ve-hero ve-hero--compact">
        <div>
          <div className="ve-kicker">Available Services</div>
          <h2 className="ve-hero-title">Choose the type of care your pet needs before reserving a time slot.</h2>
          <p className="ve-hero-copy">
            Services are loaded directly from the clinic catalog so the booking page stays aligned with the backend.
          </p>
        </div>
        <Link className="ve-btn ve-btn-primary" to="/appointments/book">
          Go to Booking
        </Link>
      </section>

      {error && <div className="ve-alert">{error}</div>}

      {loading ? (
        <p className="ve-muted">Loading services...</p>
      ) : services.length === 0 ? (
        <p className="ve-muted">No active services are configured yet.</p>
      ) : (
        <div className="ve-cards">
          {services.map((service) => (
            <article key={service.id} className="ve-service">
              <div className="ve-service-top">
                <div>
                  <div className="ve-service-title">{service.name}</div>
                  <div className="ve-service-desc">{service.description || 'No description provided yet.'}</div>
                </div>
                <span className="ve-chip">{service.durationMinutes || 0} min</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
