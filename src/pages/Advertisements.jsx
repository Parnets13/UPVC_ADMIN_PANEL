import { useState, useEffect } from 'react';
import { advertisementService } from '../services/advertisementService';
import { API_CONFIG } from '../config/config';

const Advertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image', // 'image' or 'video' - media type
    isFeatured: false,
    category: 'latest',
    media: null,
    thumbnail: null,
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await advertisementService.getAll();
      
      // Log full response for debugging
      console.log('Full API Response:', response);
      console.log('Response.data:', response?.data);
      
      // Backend returns { success: true, ads: [...] }
      // So response.data should be { success: true, ads: [...] }
      let ads = [];
      
      if (response?.data) {
        // Check if response.data is directly an array
        if (Array.isArray(response.data)) {
          ads = response.data;
          console.log('Found ads: Direct array in response.data');
        }
        // Check if response.data has ads property
        else if (response.data.ads && Array.isArray(response.data.ads)) {
          ads = response.data.ads;
          console.log('Found ads: response.data.ads');
        }
        // Fallback: check for nested data
        else if (response.data.data && Array.isArray(response.data.data)) {
          ads = response.data.data;
          console.log('Found ads: response.data.data');
        }
      }
      
      console.log('Final extracted ads:', ads);
      console.log('Number of ads:', ads.length);
      
      if (ads.length === 0 && response?.data) {
        console.warn('⚠️ No ads found! Response structure:', JSON.stringify(response.data, null, 2));
        console.warn('Response keys:', Object.keys(response.data || {}));
      }
      
      setAdvertisements(ads);
    } catch (error) {
      console.error('❌ Error fetching advertisements:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch advertisements. Please check your connection and try again.'
      );
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Require media on create
    if (!editingAd && !formData.media) {
      alert('Please select a media file (image or video).');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('type', formData.type); // 'image' or 'video'
    formDataToSend.append('isFeatured', formData.isFeatured.toString());
    formDataToSend.append('category', formData.category);
    if (formData.category === 'trending') {
      formDataToSend.append('likes', '100');
    }
    if (formData.media) formDataToSend.append('media', formData.media);
    if (formData.thumbnail) formDataToSend.append('thumbnail', formData.thumbnail);

    try {
      if (editingAd) {
        await advertisementService.update(editingAd._id, formDataToSend);
      } else {
        await advertisementService.create(formDataToSend);
      }
      setShowModal(false);
      setEditingAd(null);
      setFormData({
        title: '',
        description: '',
        type: 'image',
        isFeatured: false,
        category: 'latest',
        media: null,
        thumbnail: null,
      });
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error saving advertisement';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await advertisementService.delete(id);
        fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error deleting advertisement';
      alert(errorMessage);
    }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Seller Advertisements</h1>
        <div className="flex gap-2">
          <a href="/advertisements/seller" className="px-3 py-2 border rounded bg-gray-200">Seller</a>
          <a href="/advertisements/buyer" className="px-3 py-2 border rounded">Buyer</a>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Advertisement
          </button>
        </div>
      </div>

      

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <button
            onClick={fetchAdvertisements}
            className="mt-2 text-red-700 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && advertisements.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No advertisements found.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Advertisement" to create your first one.</p>
        </div>
      )}

      {advertisements.length > 0 ? (
        <>
          {/* <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>✓ Found {advertisements.length} advertisement(s)</strong>
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advertisements.map((ad) => {
              console.log('Rendering ad:', ad);
              return (
                <div key={ad._id} className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-300">
                  {ad.type === 'video' ? (
                    <div className="w-full h-48 rounded mb-4 overflow-hidden bg-black relative">
                      <video
                        src={`${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.mediaUrl}`}
                        className="w-full h-full object-cover"
                        controls
                        poster={ad.thumbnailUrl ? `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.thumbnailUrl}` : undefined}
                        onError={(e) => {
                          console.error('Video failed to load:', `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.mediaUrl}`);
                          e.target.style.display = 'none';
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : ad.type === 'image' ? (
                    ad.thumbnailUrl ? (
                      <img
                        src={`${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.thumbnailUrl}`}
                        alt={ad.title}
                        className="w-full h-48 object-cover rounded mb-4"
                        onError={(e) => {
                          console.error('Thumbnail failed to load, trying mediaUrl:', `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.thumbnailUrl}`);
                          if (ad.mediaUrl) {
                            e.target.src = `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.mediaUrl}`;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    ) : ad.mediaUrl ? (
                      <img
                        src={`${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.mediaUrl}`}
                        alt={ad.title}
                        className="w-full h-48 object-cover rounded mb-4"
                        onError={(e) => {
                          console.error('Image failed to load:', `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${ad.mediaUrl}`);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
                        <span className="text-gray-500">No Media</span>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
                      <span className="text-gray-500">No Media Type Specified</span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{ad.title || 'No Title'}</h3>
                  <p className="text-sm text-gray-600 mb-2">{ad.description || 'No Description'}</p>
                  <div className="flex gap-2 mb-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {ad.type || 'image'}
                    </span>
                    {ad.isFeatured && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                  setEditingAd(ad);
                  setFormData({
                    title: ad.title,
                    description: ad.description,
                    type: ad.type || 'image',
                    isFeatured: ad.isFeatured || false,
                    category: (ad.isFeatured ? 'featured' : 'latest'),
        media: null,
        thumbnail: null,
                  });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingAd ? 'Edit Advertisement' : 'Add Advertisement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Media Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ad Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, isFeatured: e.target.value === 'featured' })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="latest">Latest</option>
                  <option value="featured">Featured</option>
                  <option value="trending">Trending</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Featured sets a badge; Trending is shown when likes ≥ 100.</p>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured Advertisement</span>
                </label>
              </div>
              {editingAd && (
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-sm font-medium mb-2">Current Media:</p>
                  {editingAd.type === 'video' ? (
                    <div className="w-full h-40 rounded mb-2 overflow-hidden bg-black relative">
                      <video
                        src={`${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.mediaUrl}`}
                        className="w-full h-full object-cover"
                        controls
                        poster={editingAd.thumbnailUrl ? `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.thumbnailUrl}` : undefined}
                        onError={(e) => {
                          console.error('Video preview failed to load:', `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.mediaUrl}`);
                          e.target.parentElement.innerHTML = '<div class="w-full h-40 flex items-center justify-center text-white">Video preview unavailable</div>';
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : editingAd.type === 'image' ? (
                    editingAd.thumbnailUrl ? (
                      <img
                        src={`${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.thumbnailUrl}`}
                        alt="Current thumbnail"
                        className="w-full h-40 object-cover rounded mb-2"
                        onError={(e) => {
                          console.error('Thumbnail preview failed to load, trying mediaUrl:', `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.thumbnailUrl}`);
                          if (editingAd.mediaUrl) {
                            e.target.src = `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.mediaUrl}`;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    ) : editingAd.mediaUrl ? (
                      <img
                        src={`${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.mediaUrl}`}
                        alt="Current media"
                        className="w-full h-40 object-cover rounded mb-2"
                        onError={(e) => {
                          console.error('Image preview failed to load:', `${API_CONFIG.UPLOAD_BASE_URL}/uploads/${editingAd.mediaUrl}`);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <span className="text-gray-500">No media available</span>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500">No media type specified</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2">Upload a new file below to replace the current media</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {editingAd ? 'New Media (Video/Image)' : 'Media (Video/Image)'}
                </label>
                <input
                  type="file"
                  accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => setFormData({ ...formData, media: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
                {editingAd && !formData.media && (
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current media</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {editingAd ? 'New Thumbnail' : 'Thumbnail'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
                {editingAd && !formData.thumbnail && (
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current thumbnail</p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAd(null);
      setFormData({
        title: '',
        description: '',
        type: 'image',
        isFeatured: false,
        media: null,
        thumbnail: null,
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
                  {editingAd ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advertisements;

