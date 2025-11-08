import { useState, useEffect } from 'react';
import { homepageService } from '../services/homepageService';
import { API_CONFIG } from '../config/config';

const Homepage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKeyMomentModal, setShowKeyMomentModal] = useState(false);
  const [editingKeyMoment, setEditingKeyMoment] = useState(null);
  const [formData, setFormData] = useState({
    videoUrl: null,
    sponsorLogo: null,
  });
  const [keyMomentData, setKeyMomentData] = useState({
    title: '',
    time: '',
    thumbnail: null,
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await homepageService.getContent();
      console.log('Homepage API Response:', response);
      console.log('Response.data:', response?.data);
      
      // Backend returns { success: true, data: content }
      let contentData = null;
      if (response && response.data) {
        if (response.data.data) {
          contentData = response.data.data;
          console.log('Found content in response.data.data');
        } else if (response.data.success && response.data.data) {
          contentData = response.data.data;
          console.log('Found content in response.data.data (with success)');
        } else {
          contentData = response.data;
          console.log('Using response.data directly');
        }
      }
      
      console.log('Final content data:', contentData);
      setContent(contentData);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    if (formData.videoUrl) formDataToSend.append('videoUrl', formData.videoUrl);
    if (formData.sponsorLogo) formDataToSend.append('sponsorLogo', formData.sponsorLogo);

    try {
      if (content) {
        await homepageService.update(formDataToSend);
      } else {
        await homepageService.create(formDataToSend);
      }
      setShowModal(false);
      setFormData({ videoUrl: null, sponsorLogo: null });
      fetchContent();
    } catch (error) {
      console.error('Error saving homepage:', error);
      alert('Error saving homepage');
    }
  };

const handleKeyMomentSubmit = async (e) => {
  e.preventDefault();

  // convert HH:MM:SS or MM:SS → MM.SS
  let t = (keyMomentData.time || '').trim();
  if (!t) return alert('Time is required');

  if (t.includes(':')) {
    const parts = t.split(':');
    if (parts.length === 3) t = `${parts[1].padStart(2,'0')}.${parts[2].padStart(2,'0')}`;
    else if (parts.length === 2) t = `${parts[0].padStart(2,'0')}.${parts[1].padStart(2,'0')}`;
  }
  if (!/^\d{2}\.\d{2}$/.test(t)) {
    return alert('Time must be MM.SS (e.g., 05.30) or HH:MM:SS');
  }

  if (!editingKeyMoment && !keyMomentData.thumbnail) {
    return alert('Thumbnail is required for new key moments');
  }

  const formDataToSend = new FormData();
  formDataToSend.append('title', keyMomentData.title);
  formDataToSend.append('timestamp', t); // <-- REQUIRED by backend
  if (keyMomentData.thumbnail) formDataToSend.append('thumbnail', keyMomentData.thumbnail);

  // Optional: debug what is being sent
  for (const [k, v] of formDataToSend.entries()) {
    console.log('KM FORM', k, v && v.name ? v.name : v);
  }

  try {
    if (editingKeyMoment) {
      await homepageService.updateKeyMoment(editingKeyMoment._id, formDataToSend);
    } else {
      await homepageService.addKeyMoment(formDataToSend);
    }
    setShowKeyMomentModal(false);
    setEditingKeyMoment(null);
    setKeyMomentData({ title: '', time: '', thumbnail: null });
    fetchContent();
  } catch (error) {
    console.error('Error saving key moment:', error);
    alert(error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving key moment');
  }
};

  const handleDeleteKeyMoment = async (momentId) => {
    if (window.confirm('Are you sure you want to delete this key moment?')) {
      try {
        await homepageService.deleteKeyMoment(momentId);
        fetchContent();
      } catch (error) {
        console.error('Error deleting key moment:', error);
        alert('Error deleting key moment');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Homepage</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowKeyMomentModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Add Key Moment
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {content ? 'Update Homepage' : 'Create Homepage'}
          </button>
        </div>
      </div>

      {content && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Main Content</h2>
          {content.title && (
            <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
          )}
          {content.subtitle && (
            <p className="text-gray-600 mb-4">{content.subtitle}</p>
          )}
          {content.videoUrl && (
            <div className="mb-4">
              <video
                src={`${API_CONFIG.UPLOAD_BASE_URL}/${content.videoUrl}`}
                className="w-full h-96 object-cover rounded"
                controls
                onError={(e) => {
                  console.error('Video failed to load:', `${API_CONFIG.UPLOAD_BASE_URL}/${content.videoUrl}`);
                  e.target.style.display = 'none';
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {content.sponsorLogo && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Sponsor Logo:</p>
              <img
                src={`${API_CONFIG.UPLOAD_BASE_URL}/${content.sponsorLogo}`}
                alt="Sponsor Logo"
                className="w-32 h-32 object-contain border rounded"
                onError={(e) => {
                  console.error('Sponsor logo failed to load:', `${API_CONFIG.UPLOAD_BASE_URL}/${content.sponsorLogo}`);
                  e.target.style.display = 'none';
                }}
              />
              {content.sponsorText && (
                <p className="text-sm text-gray-600 mt-2">Sponsor: {content.sponsorText}</p>
              )}
            </div>
          )}
          {!content.videoUrl && !content.sponsorLogo && (
            <p className="text-gray-500">No content available</p>
          )}
        </div>
      )}

      {!content && !loading && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg mb-4">No homepage content found.</p>
          <p className="text-gray-500 text-sm">Click "Create Homepage" to add content.</p>
        </div>
      )}

    {content?.keyMoments && content.keyMoments.length > 0 && (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-2xl font-semibold mb-4">Key Moments</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {content.keyMoments.map((moment) => (
        <div key={moment._id} className="border rounded-lg p-4">
          {(moment.thumbnailUrl || moment.thumbnail) && (
            <img
              src={`${API_CONFIG.UPLOAD_BASE_URL}${(moment.thumbnailUrl || moment.thumbnail).startsWith('/') ? '' : '/'}${moment.thumbnailUrl || moment.thumbnail}`}
              alt={moment.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
          )}
          <h3 className="font-semibold">{moment.title}</h3>
          <p className="text-sm text-gray-600">
            Time: {moment.timestamp || moment.time || 'N/A'}
          </p>
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => {
                setEditingKeyMoment(moment);
                const ts = moment.timestamp || moment.time || '';
                const displayTime = ts.includes('.') ? ts.replace('.', ':') : ts;
                setKeyMomentData({
                  title: moment.title || '',
                  time: displayTime,
                  thumbnail: null,
                });
                setShowKeyMomentModal(true);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteKeyMoment(moment._id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {content ? 'Update Homepage' : 'Create Homepage'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sponsor Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, sponsorLogo: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ videoUrl: null, sponsorLogo: null });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {content ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showKeyMomentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingKeyMoment ? 'Edit Key Moment' : 'Add Key Moment'}
            </h2>
            <form onSubmit={handleKeyMomentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={keyMomentData.title}
                  onChange={(e) => setKeyMomentData({ ...keyMomentData, title: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="text"
                  value={keyMomentData.time}
                  onChange={(e) => setKeyMomentData({ ...keyMomentData, time: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                  placeholder="e.g., 00:05:30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setKeyMomentData({ ...keyMomentData, thumbnail: e.target.files[0] })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowKeyMomentModal(false);
                    setEditingKeyMoment(null);
                    setKeyMomentData({ title: '', time: '', thumbnail: null });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingKeyMoment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;

