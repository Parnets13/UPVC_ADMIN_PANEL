import { useState, useEffect } from 'react';
import { bannerService } from '../services/bannerService';
import { API_CONFIG } from '../config/config';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    video: null,
    chapterThumbnail0: null,
    chapterThumbnail1: null,
    chapterThumbnail2: null,
    chapterThumbnail3: null,
    time: '',
    moment_title: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await bannerService.getAll();
      console.log(response);
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.banners)
        ? response.data.banners
        : [];
      setBanners(list);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    if (formData.title) formDataToSend.append('title', formData.title);
    if (formData.description) formDataToSend.append('description', formData.description);
    // Required by backend
    formDataToSend.append('time', formData.time || '0');
    formDataToSend.append('moment_title', formData.moment_title || '');

    if (formData.video) formDataToSend.append('video', formData.video);
    if (formData.chapterThumbnail0) formDataToSend.append('chapterThumbnail0', formData.chapterThumbnail0);
    if (formData.chapterThumbnail1) formDataToSend.append('chapterThumbnail1', formData.chapterThumbnail1);
    if (formData.chapterThumbnail2) formDataToSend.append('chapterThumbnail2', formData.chapterThumbnail2);
    if (formData.chapterThumbnail3) formDataToSend.append('chapterThumbnail3', formData.chapterThumbnail3);

    try {
      if (editingBanner) {
        const id = editingBanner?._id || editingBanner?.id;
        await bannerService.update(id, formDataToSend);
      } else {
        await bannerService.create(formDataToSend);
      }
      setShowModal(false);
      setEditingBanner(null);
      setFormData({
        video: null,
        chapterThumbnail0: null,
        chapterThumbnail1: null,
        chapterThumbnail2: null,
        chapterThumbnail3: null,
        time: '',
        moment_title: '',
        title: '',
        description: '',
      });
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerService.delete(id);
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Error deleting banner');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Banners</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <div
            key={banner?._id || banner?.id || banner?.filepath || `banner-${index}`}
            className="bg-white rounded-lg shadow-md p-4"
          >
            {(banner.filepath || banner.videoUrl) && (
              <video
                src={`${API_CONFIG.UPLOAD_BASE_URL}/${banner.filepath || banner.videoUrl}`}
                className="w-full h-48 object-cover rounded mb-4"
                controls
              />
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {new Date(banner.createdAt).toLocaleDateString()}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner?._id || banner?.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title (optional)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded p-2"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded p-2"
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Moment Title</label>
                  <input
                    type="text"
                    value={formData.moment_title}
                    onChange={(e) => setFormData({ ...formData, moment_title: e.target.value })}
                    required
                    className="w-full border rounded p-2"
                    placeholder="e.g., Introduction"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time (in seconds)</label>
                  <input
                    type="number"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="w-full border rounded p-2"
                    placeholder="e.g., 0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFormData({ ...formData, video: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chapter Thumbnail 0</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, chapterThumbnail0: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chapter Thumbnail 1</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, chapterThumbnail1: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chapter Thumbnail 2</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, chapterThumbnail2: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chapter Thumbnail 3</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, chapterThumbnail3: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBanner(null);
                    setFormData({
                      video: null,
                      chapterThumbnail0: null,
                      chapterThumbnail1: null,
                      chapterThumbnail2: null,
                      chapterThumbnail3: null,
                      time: '',
                      moment_title: '',
                      title: '',
                      description: '',
                    });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;

