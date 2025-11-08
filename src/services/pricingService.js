import api from './api';

export const pricingService = {
  // Video pricing
  getAllVideos: () => api.get('/pricing/video'),
  getVideoById: (id) => api.get(`/pricing/video/${id}`),
  // Let the browser set proper multipart boundaries; don't override Content-Type
  createVideo: (formData) => api.post('/pricing/video', formData),
  updateVideo: (id, formData) => api.put(`/pricing/video/${id}`, formData),
  deleteVideo: (id) => api.delete(`/pricing/video/${id}`),
  
  // Heading pricing
  getAllHeadings: () => api.get('/pricing/heading'),
  getHeadingById: (id) => api.get(`/pricing/heading/${id}`),
  createHeading: (formData) => api.post('/pricing/heading', formData),
  updateHeading: (id, formData) => api.put(`/pricing/heading/${id}`, formData),
  deleteHeading: (id) => api.delete(`/pricing/heading/${id}`),
};

