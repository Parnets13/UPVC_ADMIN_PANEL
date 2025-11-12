import { useState, useEffect } from 'react';
import { subCategoryService } from '../services/subCategoryService';
import { categoryService } from '../services/categoryService';
import { API_CONFIG } from '../config/config';

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    subCategories: '',
    videoUrl: '',
    videoFile: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Check if video URL is valid (not a placeholder)
  const isValidVideoUrl = (url) => {
    if (!url) return false;
    const normalized = String(url).trim().toLowerCase();
    
    // List of placeholder/invalid URLs to filter out
    const placeholderPatterns = [
      'yourvideo.com',
      'example.com',
      'demo.mp4',
      'placeholder',
      'test.mp4',
      'sample.mp4',
      'http://example.com',
      'https://example.com',
      'http://yourvideo.com',
      'https://yourvideo.com'
    ];
    
    // Check if URL contains any placeholder pattern
    return !placeholderPatterns.some(pattern => normalized.includes(pattern));
  };

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [subCategoriesRes, categoriesRes] = await Promise.all([
        subCategoryService.getAll(),
        categoryService.getAll(),
      ]);
      
      console.log('SubCategories API Response:', subCategoriesRes);
      console.log('Categories API Response:', categoriesRes);
      
      // Parse subcategories
      let subCats = [];
      if (subCategoriesRes && subCategoriesRes.data) {
        if (Array.isArray(subCategoriesRes.data)) {
          subCats = subCategoriesRes.data;
          console.log('Found subcategories: Direct array in response.data');
        } else if (Array.isArray(subCategoriesRes.data.subCategories)) {
          subCats = subCategoriesRes.data.subCategories;
          console.log('Found subcategories: response.data.subCategories');
        } else if (Array.isArray(subCategoriesRes.data.data)) {
          subCats = subCategoriesRes.data.data;
          console.log('Found subcategories: response.data.data');
        }
      }
      
      // Parse categories
      let cats = [];
      if (categoriesRes && categoriesRes.data) {
        if (Array.isArray(categoriesRes.data)) {
          cats = categoriesRes.data;
        } else if (Array.isArray(categoriesRes.data.categories)) {
          cats = categoriesRes.data.categories;
        } else if (Array.isArray(categoriesRes.data.data)) {
          cats = categoriesRes.data.data;
        }
      }
      
      console.log('Final subcategories:', subCats);
      console.log('Final categories:', cats);
      console.log('Number of subcategories:', subCats.length);
      
      setSubCategories(subCats);
      setCategories(cats);
      
      if (subCats.length === 0 && subCategoriesRes?.data) {
        console.warn('⚠️ No subcategories found! Response structure:', JSON.stringify(subCategoriesRes.data, null, 2));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch subcategories. Please check your connection and try again.'
      );
      setSubCategories([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('parentCategory', formData.categoryId);
      if (formData.description) data.append('description', formData.description);
      if (formData.subCategories) data.append('subCategories', formData.subCategories);
      // Prefer uploaded file; else pass existing URL if provided
      if (formData.videoFile) {
        data.append('video', formData.videoFile);
      } else if (formData.videoUrl) {
        data.append('videoUrl', formData.videoUrl);
      }

      if (editingSubCategory) {
        await subCategoryService.update(editingSubCategory._id, data);
      } else {
        await subCategoryService.create(data);
      }
      setShowModal(false);
      setEditingSubCategory(null);
      setFormData({ name: '', categoryId: '', description: '', subCategories: '', videoUrl: '', videoFile: null });
      fetchData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      const msg =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' && error.response.data.includes('File too large')
          ? 'Video file too large. Please upload a smaller file.'
          : null) ||
        'Error saving subcategory';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await subCategoryService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert('Error deleting subcategory');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sub Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Sub Category
        </button>
      </div>

     
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-red-700 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && subCategories.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No sub categories found.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Sub Category" to create your first one.</p>
        </div>
      )}

      {subCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subCategories.map((subCategory) => (
          <div key={subCategory._id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-2">{subCategory.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{subCategory.description}</p>
            {subCategory.videoUrl && isValidVideoUrl(subCategory.videoUrl) && (
              <div className="w-full h-40 rounded mb-3 overflow-hidden bg-black">
                <video
                  src={
                    subCategory.videoUrl.startsWith('http')
                      ? subCategory.videoUrl
                      : `${API_CONFIG.UPLOAD_BASE_URL}${subCategory.videoUrl.startsWith('/') ? '' : '/'}${subCategory.videoUrl}`
                  }
                  className="w-full h-full object-cover"
                  controls
                  controlsList="nodownload"
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video failed to load:', subCategory.videoUrl);
                    e.target.style.display = 'none';
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            <p className="text-xs text-gray-500 mb-4">
              Category: {
                subCategory.parentCategory?.name || 
                (typeof subCategory.parentCategory === 'string' 
                  ? categories.find(c => c._id === subCategory.parentCategory)?.name 
                  : null) ||
                categories.find(c => c._id === subCategory.categoryId)?.name || 
                'N/A'
              }
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingSubCategory(subCategory);
                  setFormData({
                    name: subCategory.name || '',
                    categoryId: subCategory.parentCategory?._id || 
                                (typeof subCategory.parentCategory === 'string' ? subCategory.parentCategory : null) ||
                                subCategory.categoryId || '',
                    description: subCategory.description || '',
                    subCategories: subCategory.subCategories || '',
                    videoUrl: subCategory.videoUrl || '',
                    videoFile: null,
                  });
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(subCategory._id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingSubCategory ? 'Edit Sub Category' : 'Add Sub Category'}
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
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
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
                <label className="block text-sm font-medium mb-2">Sub Categories (string)</label>
                <input
                  type="text"
                  value={formData.subCategories}
                  onChange={(e) => setFormData({ ...formData, subCategories: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., Windows, Doors"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Video file (optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFormData({ ...formData, videoFile: e.target.files[0] })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Or Video URL (optional)</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border rounded p-2"
                    placeholder="https://... or /uploads/..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSubCategory(null);
                    setFormData({ name: '', categoryId: '', description: '', subCategories: '', videoUrl: '', videoFile: null });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingSubCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;

