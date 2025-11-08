import api from './api';

export const subOptionService = {
  getAll: () => api.get('/sub-options'),
  create: (data) => api.post('/sub-options', data),
  createWithFile: (formData) => api.post('/sub-options', formData),
  update: (id, data) => api.patch(`/sub-options/${id}`, data),
  updateWithFile: (id, formData) => api.patch(`/sub-options/${id}`, formData),
  delete: (id) => api.delete(`/sub-options/${id}`),
};




