import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLeads();
  }, [page, limit]);

  const fetchLeads = async () => {
    try {
      const response = await leadService.getAll({ page, limit });
      // Backend returns { success, count, leads }
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.leads)
        ? response.data.leads
        : [];
      setLeads(list);
      const totalCount =
        (typeof response.data?.total === 'number' && response.data.total) ||
        (typeof response.data?.count === 'number' && response.data.count) ||
        0;
      setTotal(totalCount);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId, status) => {
    try {
      await leadService.updateStatus({ leadId, status });
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead status');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leads</h1>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Per page</label>
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(Array.isArray(leads) ? leads : []).map((lead) => {
              const statusText = (lead?.status || 'pending').toLowerCase();
              const statusClass =
                statusText === 'active'
                  ? 'bg-green-100 text-green-800'
                  : statusText === 'sold'
                  ? 'bg-blue-100 text-blue-800'
                  : statusText === 'in-progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : statusText === 'closed'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-800';
              return (
              <tr key={lead?._id || `${lead?.contactInfo?.email || ''}-${lead?.createdAt || ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {lead.projectInfo?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {lead.projectInfo?.address || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.contactInfo?.name || 'N/A'} - {lead.contactInfo?.contactNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                    {statusText}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <select
                    value={statusText}
                    onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
              </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white'}`}
        >
          Previous
        </button>
        <div className="text-sm text-gray-700">Page {page}</div>
        <button
          disabled={total && page * limit >= total}
          onClick={() => setPage(p => p + 1)}
          className={`px-4 py-2 rounded ${(total && page * limit >= total) ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Leads;

