import api from './api';

export const buyerService = {
  getAll: (params = {}) => api.get('/admin/buyers', { params }),
  getById: (buyerId) => api.get(`/admin/buyers/${buyerId}`),
  update: (buyerId, data) => api.put(`/admin/buyers/${buyerId}`, data),
  delete: (buyerId) => api.delete(`/admin/buyers/${buyerId}`),
};



