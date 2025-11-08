import { useState, useEffect } from 'react';
import { buyerService } from '../services/buyerService';

const Buyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    mobileNumber: '',
  });

  useEffect(() => {
    fetchBuyers();
  }, [page, limit, searchTerm]);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await buyerService.getAll(params);
      console.log('Buyers API Response:', response.data); // Debug log
      
      // Handle different response structures
      let list = [];
      let totalCount = 0;
      
      if (response.data) {
        // Check if response.data is an array directly
        if (Array.isArray(response.data)) {
          list = response.data;
          totalCount = response.data.length;
        } 
        // Check if response.data has buyers array
        else if (Array.isArray(response.data.buyers)) {
          list = response.data.buyers;
          totalCount = response.data.total || response.data.count || response.data.buyers.length;
        }
        // Check if response.data has users array
        else if (Array.isArray(response.data.users)) {
          list = response.data.users;
          totalCount = response.data.total || response.data.count || response.data.users.length;
        }
        // Check for success response structure
        else if (response.data.success && Array.isArray(response.data.buyers)) {
          list = response.data.buyers;
          totalCount = response.data.total || response.data.count || response.data.buyers.length;
        }
      }
      
      setBuyers(list);
      setTotal(totalCount);
      console.log('Processed buyers:', list.length, 'Total:', totalCount); // Debug log
    } catch (error) {
      console.error('Error fetching buyers:', error);
      console.error('Error details:', error.response?.data || error.message);
      setBuyers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (buyer) => {
    setEditingBuyer(buyer._id);
    setEditForm({
      name: buyer.name || '',
      mobileNumber: buyer.mobileNumber || buyer.mobile || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingBuyer(null);
    setEditForm({ name: '', mobileNumber: '' });
  };

  const handleSaveEdit = async (buyerId) => {
    try {
      await buyerService.update(buyerId, editForm);
      alert('Buyer updated successfully');
      setEditingBuyer(null);
      setEditForm({ name: '', mobileNumber: '' });
      fetchBuyers();
    } catch (error) {
      console.error('Error updating buyer:', error);
      alert('Error updating buyer: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (buyerId) => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;
    try {
      await buyerService.delete(buyerId);
      alert('Buyer deleted successfully');
      fetchBuyers();
    } catch (error) {
      console.error('Error deleting buyer:', error);
      alert('Error deleting buyer: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && buyers.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Buyers</h1>
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Per page</label>
          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 50, 100].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buyers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No buyers found
                  </td>
                </tr>
              ) : (
                buyers.map((buyer) => (
                  <tr key={buyer._id || buyer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingBuyer === buyer._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {buyer.name || 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingBuyer === buyer._id ? (
                        <input
                          type="text"
                          value={editForm.mobileNumber}
                          onChange={(e) =>
                            setEditForm({ ...editForm, mobileNumber: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          {buyer.mobileNumber || buyer.mobile || 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {buyer.createdAt
                        ? new Date(buyer.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingBuyer === buyer._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(buyer._id)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(buyer)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(buyer._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} buyers
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-2 rounded ${
              page === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`px-4 py-2 rounded ${
              page >= totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Buyers;

