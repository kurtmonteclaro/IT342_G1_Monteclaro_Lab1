import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const apiConfig = {
  baseUrl: API_URL,
  origin: API_ORIGIN,
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/user/me'),
};

export const petAPI = {
  listMine: () => api.get('/pets'),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  remove: (id) => api.delete(`/pets/${id}`),
};

export const serviceAPI = {
  listActive: () => api.get('/services'),
};

export const appointmentAPI = {
  listMine: () => api.get('/appointments/mine'),
  availability: ({ date, serviceId }) => api.get('/availability', { params: { date, serviceId } }),
  create: (data) => api.post('/appointments', data),
  cancel: (id) => api.post(`/appointments/${id}/cancel`),
  reschedule: (id, { date, time }) =>
    api.post(`/appointments/${id}/reschedule`, null, { params: { date, time } }),
};

export const adminAPI = {
  today: () => api.get('/admin/appointments/today'),
  pending: () => api.get('/admin/appointments/pending'),
  confirm: (id) => api.post(`/admin/appointments/${id}/confirm`),
  complete: (id) => api.post(`/admin/appointments/${id}/complete`),
  cancel: (id) => api.post(`/admin/appointments/${id}/cancel`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  listBlockedDates: () => api.get('/admin/blocked-dates'),
  addBlockedDate: (date) => api.post('/admin/blocked-dates', null, { params: { date } }),
  removeBlockedDate: (id) => api.delete(`/admin/blocked-dates/${id}`),
};

export default api;
