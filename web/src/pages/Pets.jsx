import { useEffect, useMemo, useState } from 'react';
import { petAPI, externalAPI } from '../services/api';
import './Vetease.css';

const emptyPet = {
  name: '',
  species: '',
  breed: '',
  age: '',
  notes: '',
  vaccineHistory: '',
};

export function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [breeds, setBreeds] = useState([]);
  const [breedsLoading, setBreedsLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyPet);
  const [photoFile, setPhotoFile] = useState(null);
  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await petAPI.listMine();
      setPets(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadBreeds = async () => {
      setBreedsLoading(true);
      try {
        const res = await externalAPI.dogBreeds();
        setBreeds(res.data || []);
      } catch {
        // fail silently; allow manual breed entry
        setBreeds([]);
      } finally {
        setBreedsLoading(false);
      }
    };
    loadBreeds();
  }, []);

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyPet);
    setPhotoFile(null);
  };

  const startEdit = (pet) => {
    setEditingId(pet.id);
    setForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      age: pet.age ?? '',
      notes: pet.notes || '',
      vaccineHistory: pet.vaccineHistory || '',
    });
    setPhotoFile(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      age: form.age === '' ? null : Number(form.age),
    };
    try {
      if (isEditing) {
        const res = await petAPI.update(editingId, payload);
        const petId = res.data?.id ?? editingId;
        if (photoFile) {
          await petAPI.uploadPhoto(petId, photoFile);
        }
      } else {
        const res = await petAPI.create(payload);
        const petId = res.data?.id;
        if (photoFile && petId) {
          await petAPI.uploadPhoto(petId, photoFile);
        }
      }
      await load();
      startAdd();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Save failed');
    }
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    setPhotoFile(file || null);
  };

  const remove = async (id) => {
    setError('');
    try {
      await petAPI.remove(id);
      await load();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Delete failed');
    }
  };

  return (
    <div className="ve-page">
      <div className="ve-header">
        <div>
          <h1 className="ve-title">Pets</h1>
          <p className="ve-subtitle">Manage your pet profiles and keep history organized.</p>
        </div>
        <button className="ve-btn" onClick={startAdd}>
          Add Pet
        </button>
      </div>

      {error && <div className="ve-alert">{error}</div>}

      <div className="ve-grid">
        <div className="ve-card">
          <h2 className="ve-card-title">{isEditing ? 'Edit Pet' : 'Add a Pet'}</h2>
          <form onSubmit={save} className="ve-form">
            <div className="ve-row">
              <div className="ve-field">
                <label>Name</label>
                <input name="name" value={form.name} onChange={onChange} required />
              </div>
              <div className="ve-field">
                <label>Age</label>
                <input name="age" value={form.age} onChange={onChange} inputMode="numeric" />
              </div>
            </div>
            <div className="ve-row">
              <div className="ve-field">
                <label>Species</label>
                <input name="species" value={form.species} onChange={onChange} placeholder="Dog, Cat..." />
              </div>
              <div className="ve-field">
                <label>Breed</label>
                {breeds.length > 0 ? (
                  <select name="breed" value={form.breed} onChange={onChange}>
                    <option value="">Select breed</option>
                    {breeds.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="breed"
                    value={form.breed}
                    onChange={onChange}
                    placeholder={breedsLoading ? 'Loading breeds...' : 'Shih Tzu...'}
                  />
                )}
              </div>
            </div>
            <div className="ve-field">
              <label>Pet Photo (optional)</label>
              <input type="file" accept="image/*" onChange={onPhotoChange} />
            </div>
            <div className="ve-field">
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={onChange} rows={3} />
            </div>
            <div className="ve-field">
              <label>Vaccine History (optional)</label>
              <textarea name="vaccineHistory" value={form.vaccineHistory} onChange={onChange} rows={3} />
            </div>
            <div className="ve-actions">
              <button type="submit" className="ve-btn ve-btn-primary">
                {isEditing ? 'Save Changes' : 'Create Pet'}
              </button>
              {isEditing && (
                <button type="button" className="ve-btn ve-btn-ghost" onClick={startAdd}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="ve-card">
          <h2 className="ve-card-title">Your Pets</h2>
          {loading ? (
            <p className="ve-muted">Loading...</p>
          ) : pets.length === 0 ? (
            <p className="ve-muted">No pets yet. Add your first pet to start booking.</p>
          ) : (
            <div className="ve-list">
              {pets.map((p) => (
                <div key={p.id} className="ve-list-item">
                  <div className="ve-list-main">
                        {p.photoPath && (
                          <img
                            src={`http://localhost:8080${p.photoPath}`}
                            alt={p.name}
                            className="ve-avatar"
                          />
                        )}
                    <div className="ve-list-title">{p.name}</div>
                    <div className="ve-list-meta">
                      {(p.species || 'Pet') + (p.breed ? ` • ${p.breed}` : '')}
                      {p.age !== null && p.age !== undefined && p.age !== '' ? ` • ${p.age} yrs` : ''}
                    </div>
                  </div>
                  <div className="ve-list-actions">
                    <button className="ve-mini" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="ve-mini ve-mini-danger" onClick={() => remove(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

