import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

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

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/user/me'),
};

export const petAPI = {
  getAll: () => api.get('/pets'),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  remove: (id) => api.delete(`/pets/${id}`),
};

export const clinicAPI = {
  getServices: () => api.get('/clinic/services'),
};

export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  book: (data) => api.post('/appointments', data),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  getAvailability: (date, serviceId) => api.get('/appointments/availability', { params: { date, serviceId } }),
};

export const dashboardAPI = {
  getClient: () => api.get('/dashboard/client'),
  getAdmin: () => api.get('/admin/dashboard'),
};

export const adminAPI = {
  getServices: () => api.get('/admin/services'),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getBlockedDates: () => api.get('/admin/blocked-dates'),
  addBlockedDate: (data) => api.post('/admin/blocked-dates', data),
  removeBlockedDate: (id) => api.delete(`/admin/blocked-dates/${id}`),
  updateAppointmentStatus: (id, status) => api.put(`/admin/appointments/${id}/status`, { status }),
};

export default api;
