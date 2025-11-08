import { useState, useEffect } from 'react';
import { subOptionService } from '../services/subOptionService';
import { optionService } from '../services/optionService';
import { API_CONFIG } from '../config/config';

const SubOptions = () => {
  const [subOptions, setSubOptions] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubOption, setEditingSubOption] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    optionId: '',
    description: '',
    videoUrl: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Normalize video URL: if absolute, use as-is; if relative, prepend base URL
  const normalizeVideoUrl = (url) => {
    if (!url) return null;
    // Normalize backslashes to forward slashes
    const normalized = String(url).trim().replace(/\\/g, '/');
    // If it's already an absolute URL, return as-is
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return normalized;
    }
    // Otherwise, construct the full URL
    const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return `${API_CONFIG.UPLOAD_BASE_URL}${path}`;
  };

  // Debug: Log video URLs
  useEffect(() => {
    if (subOptions.length > 0) {
      subOptions.forEach(sub => {
        if (sub.videoUrl) {
          console.log('Sub-option video:', {
            name: sub.name,
            originalUrl: sub.videoUrl,
            normalizedUrl: normalizeVideoUrl(sub.videoUrl)
          });
        }
      });
    }
  }, [subOptions]);

  const fetchData = async () => {
    try {
      const [subOptionsRes, optionsRes] = await Promise.all([
        subOptionService.getAll(),
        optionService.getAll(),
      ]);
      // Backend returns { options, totalPages, currentPage } and uses fields: title, option, features
      const rawSubOpts = Array.isArray(subOptionsRes.data)
        ? subOptionsRes.data
        : Array.isArray(subOptionsRes.data?.options)
        ? subOptionsRes.data.options
        : [];
      const normalizedSubs = rawSubOpts.map((s) => ({
        ...s,
        name: s.name || s.title || '',
        optionId: s.option?._id || s.option || '',
        description: s.description || (Array.isArray(s.features) ? s.features.join(', ') : s.features || ''),
        videoUrl: s.videoUrl || '',
      }));
      setSubOptions(normalizedSubs);

      const rawOptions = Array.isArray(optionsRes.data) ? optionsRes.data : [];
      const normalizedOptions = rawOptions.map((o) => ({ ...o, name: o.name || o.title || '' }));
      setOptions(normalizedOptions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        e.target.value = '';
        return;
      }
      // Validate file size (max 200MB)
      if (file.size > 200 * 1024 * 1024) {
        alert('Video file size must be less than 200MB');
        e.target.value = '';
        return;
      }
      setVideoFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      // Clear videoUrl when file is selected
      setFormData({ ...formData, videoUrl: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.optionId) {
      alert('Option is required');
      return;
    }
    
    try {
      // Use FormData if video file is selected, otherwise use JSON
      if (videoFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('option', formData.optionId);
        formDataToSend.append('title', formData.name.trim());
        formDataToSend.append('features', formData.description || '');
        formDataToSend.append('video', videoFile);
        
        console.log('Sending FormData:', {
          option: formData.optionId,
          title: formData.name.trim(),
          features: formData.description || '',
          videoFile: videoFile.name,
          videoSize: videoFile.size
        });
        
        if (editingSubOption) {
          await subOptionService.updateWithFile(editingSubOption._id, formDataToSend);
        } else {
          await subOptionService.createWithFile(formDataToSend);
        }
      } else {
        const payload = {
          option: formData.optionId,
          title: formData.name.trim(),
          features: formData.description || '',
          videoUrl: formData.videoUrl || '',
        };
        console.log('Sending JSON payload:', payload);
        
        if (editingSubOption) {
          await subOptionService.update(editingSubOption._id, payload);
        } else {
          await subOptionService.create(payload);
        }
      }
      setShowModal(false);
      setEditingSubOption(null);
      setFormData({ name: '', optionId: '', description: '', videoUrl: '' });
      setVideoFile(null);
      setVideoPreview(null);
      fetchData();
    } catch (error) {
      console.error('Error saving sub-option:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });
      alert(`Error saving sub-option: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-option?')) {
      try {
        await subOptionService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting sub-option:', error);
        alert('Error deleting sub-option');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sub Options</h1>
        <button
          onClick={() => {
            setEditingSubOption(null);
            setFormData({ name: '', optionId: '', description: '', videoUrl: '' });
            setVideoFile(null);
            if (videoPreview && videoPreview.startsWith('blob:')) {
              URL.revokeObjectURL(videoPreview);
            }
            setVideoPreview(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Sub Option
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subOptions.map((subOption) => (
          <div key={subOption._id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-2">{subOption.name}</h3>
            {subOption.videoUrl && (
              <div className="mb-3 w-full h-40 rounded-lg overflow-hidden bg-black">
                <video
                  src={normalizeVideoUrl(subOption.videoUrl)}
                  controls
                  controlsList="nodownload"
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Video failed to load:', {
                      originalUrl: subOption.videoUrl,
                      normalizedUrl: normalizeVideoUrl(subOption.videoUrl),
                      error: e
                    });
                    // Show error message instead of hiding
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-white text-center p-2 text-xs';
                    errorDiv.textContent = 'Video unavailable';
                    e.target.parentElement.appendChild(errorDiv);
                    e.target.style.display = 'none';
                  }}
                  onLoadStart={() => {
                    console.log('Video loading:', normalizeVideoUrl(subOption.videoUrl));
                  }}
                  onCanPlay={() => {
                    console.log('Video can play:', normalizeVideoUrl(subOption.videoUrl));
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-2">{subOption.description}</p>
            <p className="text-xs text-gray-500 mb-4">
              Option: {options.find(o => o._id === (subOption.option?._id || subOption.optionId))?.name || 'N/A'}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingSubOption(subOption);
                  setFormData({
                    name: subOption.name || subOption.title || '',
                    optionId: subOption.option?._id || subOption.optionId || '',
                    description: subOption.description || (Array.isArray(subOption.features) ? subOption.features.join(', ') : subOption.features || ''),
                    videoUrl: subOption.videoUrl || '',
                  });
                  setVideoFile(null);
                  setVideoPreview(subOption.videoUrl ? normalizeVideoUrl(subOption.videoUrl) : null);
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(subOption._id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingSubOption ? 'Edit Sub Option' : 'Add Sub Option'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Option</label>
                <select
                  value={formData.optionId}
                  onChange={(e) => setFormData({ ...formData, optionId: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Option</option>
                  {options.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded p-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Video</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Upload Video File</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="w-full border rounded p-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max size: 200MB</p>
                  </div>
                  <div className="text-center text-gray-500 text-sm">OR</div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Video URL</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, videoUrl: e.target.value });
                        // Clear video file when URL is entered
                        if (e.target.value) {
                          setVideoFile(null);
                          if (videoPreview && videoPreview.startsWith('blob:')) {
                            URL.revokeObjectURL(videoPreview);
                          }
                          setVideoPreview(null);
                        }
                      }}
                      placeholder="https://example.com/video.mp4"
                      className="w-full border rounded p-2"
                      disabled={!!videoFile}
                    />
                  </div>
                </div>
                {/* Video Preview */}
                {(videoPreview || formData.videoUrl) && (
                  <div className="mt-3 w-full h-40 rounded-lg overflow-hidden bg-black">
                    <video
                      src={videoPreview || normalizeVideoUrl(formData.videoUrl)}
                      controls
                      controlsList="nodownload"
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('Video preview failed to load:', videoPreview || normalizeVideoUrl(formData.videoUrl));
                        e.target.style.display = 'none';
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                {videoFile && (
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSubOption(null);
                    setFormData({ name: '', optionId: '', description: '', videoUrl: '' });
                    setVideoFile(null);
                    if (videoPreview && videoPreview.startsWith('blob:')) {
                      URL.revokeObjectURL(videoPreview);
                    }
                    setVideoPreview(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingSubOption ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubOptions;

