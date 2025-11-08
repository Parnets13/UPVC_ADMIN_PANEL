import api from './api';

export const optionService = {
  getAll: () => api.get('/options'),
  create: (data) => api.post('/options', data),
  update: (id, data) => api.put(`/options/${id}`, data),
  delete: (id) => api.delete(`/options/${id}`),
};






