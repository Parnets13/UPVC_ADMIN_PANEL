import api from './api';

export const homepageService = {
  getContent: () => api.get('/homepage'),
  create: (formData) => api.post('/homepage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (formData) => api.put('/homepage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  addKeyMoment: (formData) => api.post('/homepage/key-moments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateKeyMoment: (momentId, formData) => api.put(`/homepage/key-moments/${momentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteKeyMoment: (momentId) => api.delete(`/homepage/key-moments/${momentId}`),
};







