import api from './api';

export const buyerAdvertisementService = {
  getAll: () => api.get('/buyer/advertisments'),
  getByType: (type) => api.get(`/buyer/advertisments/${type}`),
  create: (formData) => api.post('/buyer/advertisments', formData),
  update: (id, formData) => api.put(`/buyer/advertisments/${id}`, formData),
  delete: (id) => api.delete(`/buyer/advertisments/${id}`),
  toggleLike: (id) => api.post(`/buyer/advertisments/${id}/like`),
};


