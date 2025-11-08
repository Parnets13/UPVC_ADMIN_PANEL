import api from './api';

export const bannerService = {
  getAll: () => api.get('/banner'),
  getById: (id) => api.get(`/banner/${id}`),
  create: (formData) => api.post('/banner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/banner/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/banner/${id}`),
};


