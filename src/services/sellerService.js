import api from './api';

export const sellerService = {
  getAll: (params = {}) => api.get('/seller/managment/sellers', { params }),
  getById: (sellerId) => api.get(`/seller/managment/sellers/${sellerId}`),
  approve: (sellerId) => api.put(`/seller/managment/sellers/${sellerId}/approve`),
  reject: (sellerId) => api.put(`/seller/managment/sellers/${sellerId}/reject`),
  toggleStatus: (sellerId) => api.put(`/seller/managment/sellers/${sellerId}/toggle-status`),
  update: (sellerId, data) => api.put(`/seller/managment/sellers/${sellerId}`, data),
  delete: (sellerId) => api.delete(`/seller/managment/sellers/${sellerId}`),
};



