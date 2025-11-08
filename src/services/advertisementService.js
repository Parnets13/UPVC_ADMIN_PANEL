import api from './api';

export const advertisementService = {
  getAll: () => api.get('/advertisments'),
  getByType: (type) => api.get(`/advertisments/${type}`),
  create: (formData) => api.post('/advertisments', formData),
  update: (id, formData) => api.put(`/advertisments/${id}`, formData),
  delete: (id) => api.delete(`/advertisments/${id}`),
  toggleLike: (id) => api.post(`/advertisments/${id}/like`),
};



