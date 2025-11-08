import { useState, useEffect } from 'react';
import { sellerService } from '../services/sellerService';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSeller, setEditingSeller] = useState(null);
  const [editForm, setEditForm] = useState({
    companyName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    pinCode: '',
    contactPerson: '',
    contactNumber: '',
    gstNumber: '',
    website: '',
    yearsInBusiness: '',
    brandOfProfileUsed: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, [page, limit, searchTerm]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await sellerService.getAll(params);
      // Backend returns { success, count, sellers }
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.sellers)
        ? response.data.sellers
        : [];
      setSellers(list);
      const totalCount =
        (typeof response.data?.total === 'number' && response.data.total) ||
        (typeof response.data?.count === 'number' && response.data.count) ||
        0;
      setTotal(totalCount);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sellerId) => {
    try {
      await sellerService.approve(sellerId);
      fetchSellers();
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Error approving seller');
    }
  };

  const handleReject = async (sellerId) => {
    try {
      await sellerService.reject(sellerId);
      fetchSellers();
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Error rejecting seller');
    }
  };

  const handleToggleStatus = async (sellerId) => {
    try {
      await sellerService.toggleStatus(sellerId);
      fetchSellers();
    } catch (error) {
      console.error('Error toggling seller status:', error);
      alert('Error toggling seller status');
    }
  };

  const handleEdit = (seller) => {
    setEditingSeller(seller._id);
    setShowEditModal(true);
    setEditForm({
      companyName: seller.companyName || '',
      email: seller.email || '',
      phoneNumber: seller.phoneNumber || seller.contactNumber || '',
      address: seller.address || '',
      city: seller.city || '',
      pinCode: seller.pinCode || '',
      contactPerson: seller.contactPerson || '',
      contactNumber: seller.contactNumber || seller.phoneNumber || '',
      gstNumber: seller.gstNumber || '',
      website: seller.website || '',
      yearsInBusiness: seller.yearsInBusiness?.toString() || '',
      brandOfProfileUsed: seller.brandOfProfileUsed || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingSeller(null);
    setShowEditModal(false);
    setEditForm({
      companyName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      pinCode: '',
      contactPerson: '',
      contactNumber: '',
      gstNumber: '',
      website: '',
      yearsInBusiness: '',
      brandOfProfileUsed: '',
    });
  };

  const handleSaveEdit = async (sellerId) => {
    try {
      const updateData = {
        ...editForm,
        yearsInBusiness: editForm.yearsInBusiness ? parseInt(editForm.yearsInBusiness) : undefined,
      };
      await sellerService.update(sellerId, updateData);
      alert('Seller updated successfully');
      setEditingSeller(null);
      setShowEditModal(false);
      setEditForm({
        companyName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        pinCode: '',
        contactPerson: '',
        contactNumber: '',
        gstNumber: '',
        website: '',
        yearsInBusiness: '',
        brandOfProfileUsed: '',
      });
      fetchSellers();
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Error updating seller: ' + (error.response?.data?.error || error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (sellerId) => {
    if (!confirm('Are you sure you want to delete this seller?')) return;
    try {
      await sellerService.delete(sellerId);
      alert('Seller deleted successfully');
      fetchSellers();
    } catch (error) {
      console.error('Error deleting seller:', error);
      alert('Error deleting seller: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && sellers.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sellers</h1>
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No sellers found
                </td>
              </tr>
            ) : (
              (Array.isArray(sellers) ? sellers : []).map((seller) => (
                <tr
                  key={seller?._id || `${seller?.email}-${seller?.phone || ''}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {seller.name || seller.companyName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{seller.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {seller.phone ||
                        seller.contactNumber ||
                        seller.mobile ||
                        seller.mobileNumber ||
                        seller.phoneNumber ||
                        'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        seller.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : seller.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {seller.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(seller)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                        {seller.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(seller._id)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Approve
                          </button>
                        )}
                        {seller.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(seller._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(seller._id)}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDelete(seller._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Seller Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editForm.contactNumber}
                  onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editForm.contactPerson}
                  onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={editForm.gstNumber}
                  onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={editForm.pinCode}
                  onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                <input
                  type="number"
                  value={editForm.yearsInBusiness}
                  onChange={(e) => setEditForm({ ...editForm, yearsInBusiness: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand of Profile Used</label>
                <input
                  type="text"
                  value={editForm.brandOfProfileUsed}
                  onChange={(e) => setEditForm({ ...editForm, brandOfProfileUsed: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingSeller)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} sellers
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

export default Sellers;

