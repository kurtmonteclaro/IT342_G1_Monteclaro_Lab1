import { useEffect, useMemo, useState } from 'react';
import { petAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import './Vetease.css';

const defaultPet = {
  name: '',
  species: 'Dog',
  breed: '',
  age: '',
  notes: '',
  vaccineHistory: '',
};

export function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultPet);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const loadPets = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await petAPI.listMine();
      setPets(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load pet profiles.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultPet);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = (pet) => {
    setEditingId(pet.id);
    setForm({
      name: pet.name || '',
      species: pet.species || 'Dog',
      breed: pet.breed || '',
      age: pet.age ?? '',
      notes: pet.notes || '',
      vaccineHistory: pet.vaccineHistory || '',
    });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      ...form,
      age: form.age === '' ? null : Number(form.age),
    };

    try {
      if (isEditing) {
        await petAPI.update(editingId, payload);
        setSuccess('Pet profile updated.');
      } else {
        await petAPI.create(payload);
        setSuccess('Pet profile created.');
      }

      resetForm();
      await loadPets();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save pet profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');

    try {
      await petAPI.remove(id);
      setSuccess('Pet profile deleted.');
      await loadPets();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete pet profile.'));
    }
  };

  return (
    <div className="ve-page">
      <div className="ve-header">
        <div>
          <h2 className="ve-title">Pet Profiles</h2>
          <p className="ve-subtitle">
            Maintain the pet records used when booking appointments and sharing clinic notes.
          </p>
        </div>
        <button className="ve-btn ve-btn-ghost" onClick={resetForm}>
          {isEditing ? 'Create New Pet' : 'Clear Form'}
        </button>
      </div>

      {error && <div className="ve-alert">{error}</div>}
      {success && <div className="ve-success">{success}</div>}

      <div className="ve-grid ve-grid-main">
        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">{isEditing ? 'Edit Pet Profile' : 'Add a Pet'}</h3>
              <p className="ve-section-copy">
                Breed lookup and image uploads depend on backend support, so this form keeps manual entry reliable.
              </p>
            </div>
          </div>

          <form className="ve-form" onSubmit={handleSubmit}>
            <div className="ve-row">
              <div className="ve-field">
                <label htmlFor="name">Pet Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="ve-field">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="ve-row">
              <div className="ve-field">
                <label htmlFor="species">Species</label>
                <select id="species" name="species" value={form.species} onChange={handleChange}>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="ve-field">
                <label htmlFor="breed">Breed</label>
                <input
                  id="breed"
                  name="breed"
                  value={form.breed}
                  onChange={handleChange}
                  placeholder="Manual breed entry"
                />
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
                placeholder="Medical conditions, behavior, symptoms, or care reminders"
              />
            </div>

            <div className="ve-field">
              <label htmlFor="vaccineHistory">Vaccine History</label>
              <textarea
                id="vaccineHistory"
                name="vaccineHistory"
                value={form.vaccineHistory}
                onChange={handleChange}
                rows="4"
                placeholder="Optional free-text vaccine history"
              />
            </div>

            <div className="ve-actions">
              <button className="ve-btn ve-btn-primary" disabled={saving} type="submit">
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Pet'}
              </button>
              {isEditing && (
                <button className="ve-btn ve-btn-ghost" onClick={resetForm} type="button">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="ve-card">
          <div className="ve-section-head">
            <div>
              <h3 className="ve-card-title">Your Pet Records</h3>
              <p className="ve-section-copy">Each pet can be selected during appointment booking.</p>
            </div>
          </div>

          {loading ? (
            <p className="ve-muted">Loading pets...</p>
          ) : pets.length === 0 ? (
            <div className="ve-empty">
              <p>No pets added yet.</p>
              <p className="ve-muted">Create your first pet profile to start booking online.</p>
            </div>
          ) : (
            <div className="ve-list">
              {pets.map((pet) => (
                <article key={pet.id} className="ve-list-item ve-list-item--stack">
                  <div className="ve-list-main ve-list-main--column">
                    <div className="ve-list-title">{pet.name}</div>
                    <div className="ve-list-meta">
                      {pet.species || 'Pet'}
                      {pet.breed ? ` - ${pet.breed}` : ''}
                      {pet.age !== null && pet.age !== '' && pet.age !== undefined ? ` - ${pet.age} yrs` : ''}
                    </div>
                    {(pet.notes || pet.vaccineHistory) && (
                      <div className="ve-copy-block">
                        {pet.notes && <p>{pet.notes}</p>}
                        {pet.vaccineHistory && <p>Vaccines: {pet.vaccineHistory}</p>}
                      </div>
                    )}
                  </div>
                  <div className="ve-list-actions">
                    <button className="ve-mini" onClick={() => handleEdit(pet)}>
                      Edit
                    </button>
                    <button className="ve-mini ve-mini-danger" onClick={() => handleDelete(pet.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

