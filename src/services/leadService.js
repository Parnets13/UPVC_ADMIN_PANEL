import api from './api';

export const leadService = {
  getAll: (params = {}) => api.get('/seller/lead', { params }),
  getById: (id) => api.get(`/seller/lead/${id}`),
  updateStatus: (data) => api.put('/seller/lead/status', data),
  calculatePrice: (data) => api.post('/seller/lead/calculate-price', data),
};



