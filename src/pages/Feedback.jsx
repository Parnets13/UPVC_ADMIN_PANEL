import { useEffect, useState } from 'react';
import api from '../services/api';

const Feedback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback', { params: { page, limit } });
      const data = response.data;
      
      // Backend returns { success, total, page, limit, count, items }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setFeedbacks(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } else if (Array.isArray(data)) {
        // Fallback: backend returned full array (no pagination). Slice on client.
        const start = (page - 1) * limit;
        const end = start + limit;
        setFeedbacks(data.slice(start, end));
        setTotal(data.length);
      } else {
        setFeedbacks([]);
        setTotal(0);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load feedback');
      setFeedbacks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page, limit]);

  const totalPages = total && limit ? Math.max(1, Math.ceil(total / limit)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Customer Feedback</h1>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <label className="text-sm text-gray-600">Per page</label>
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button
            onClick={fetchFeedbacks}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-4 bg-white rounded-xl border">Loading...</div>
      )}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.map((f) => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{f.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{f.stars}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xl whitespace-pre-wrap">{f.text}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{f.createdAt ? new Date(f.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No feedback yet.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white'}`}
            >
              Previous
            </button>
            <div className="text-sm text-gray-700">Page {page} of {totalPages}</div>
            <button
              disabled={total && page * limit >= total}
              onClick={() => setPage(p => p + 1)}
              className={`px-4 py-2 rounded ${(total && page * limit >= total) ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;


