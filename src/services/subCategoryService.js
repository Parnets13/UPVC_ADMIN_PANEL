import api from './api';

export const subCategoryService = {
  getAll: () => api.get('/subcategories?limit=1000'), // Request all records
  create: (formData) => api.post('/subcategories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.patch(`/subcategories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/subcategories/${id}`),
};

