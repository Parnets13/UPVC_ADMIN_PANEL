import { useState, useEffect } from 'react';
import { pricingService } from '../services/pricingService';
import { API_CONFIG } from '../config/config';

const Pricing = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    video: null,
    sponsorLogo: null,
  });

  // Helper function to construct video URL
  const getVideoUrl = (videoPath) => {
    if (!videoPath) return null;
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
    
    // Ensure UPLOAD_BASE_URL doesn't end with / and path starts with /
    const baseUrl = API_CONFIG.UPLOAD_BASE_URL.endsWith('/') 
      ? API_CONFIG.UPLOAD_BASE_URL.slice(0, -1) 
      : API_CONFIG.UPLOAD_BASE_URL;
    
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await pricingService.getAllVideos();
      const videosData = response.data || [];
      console.log('Fetched videos:', videosData);
      // Log video URLs for debugging
      videosData.forEach(video => {
        if (video.video) {
          console.log(`Video URL for "${video.title}":`, getVideoUrl(video.video));
        }
      });
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    if (!editingItem && !formData.video) {
      alert('Please select a video file to upload.');
      return;
    }
    formDataToSend.append('title', formData.title);
    formDataToSend.append('subtitle', formData.subtitle);
    if (formData.video) formDataToSend.append('video', formData.video);
    if (formData.sponsorLogo) formDataToSend.append('sponsorLogo', formData.sponsorLogo);

    try {
      if (editingItem) {
        await pricingService.updateVideo(editingItem._id, formDataToSend);
      } else {
        await pricingService.createVideo(formDataToSend);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        title: '',
        subtitle: '',
        video: null,
        sponsorLogo: null,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving item';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await pricingService.deleteVideo(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Error deleting video');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pricing</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-4">
            {item.video && (
              <video
                src={getVideoUrl(item.video)}
                className="w-full h-48 object-cover rounded mb-4"
                controls
                onError={(e) => {
                  console.error('Video failed to load:', {
                    originalPath: item.video,
                    constructedUrl: getVideoUrl(item.video),
                    error: e
                  });
                  e.target.style.display = 'none';
                }}
                onLoadStart={() => {
                  console.log('Video loading:', getVideoUrl(item.video));
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
            <h3 className="text-xl font-semibold mb-2">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingItem(item);
                  setFormData({
                    title: item.title || '',
                    subtitle: item.subtitle || '',
                    video: null,
                    sponsorLogo: null,
                  });
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit' : 'Add'} Video
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
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFormData({ ...formData, video: e.target.files[0] })}
                  className="w-full border rounded p-2"
                  required={!editingItem}
                />
                {editingItem && (
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current video</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sponsor Logo</label>
                {editingItem && editingItem.sponsorLogo && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">Current Logo:</p>
                    <img
                      src={getVideoUrl(editingItem.sponsorLogo)}
                      alt="Current"
                      className="w-24 h-24 object-cover border rounded"
                      onError={(e) => {
                        console.error('Sponsor logo failed to load:', getVideoUrl(editingItem.sponsorLogo));
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, sponsorLogo: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
                {editingItem && (
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current logo</p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({
                      title: '',
                      subtitle: '',
                      video: null,
                      sponsorLogo: null,
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
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;

