import { useEffect, useState } from 'react';
import { bannerService } from '../services/bannerService';
import { categoryService } from '../services/categoryService';
import { sellerService } from '../services/sellerService';
import { leadService } from '../services/leadService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    banners: 0,
    categories: 0,
    sellers: 0,
    leads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bannersRes, categoriesRes, sellersRes, leadsRes] = await Promise.all([
          bannerService.getAll(),
          categoryService.getAll(),
          sellerService.getAll(),
          leadService.getAll(),
        ]);

        const getCount = (res) => {
          if (!res || !res.data) return 0;
          const d = res.data;
          
          // If data is directly an array (banners, categories)
          if (Array.isArray(d)) return d.length;
          
          // Check for total count (sellers, leads with pagination)
          if (typeof d?.total === 'number') return d.total;
          
          // Check for pagination object with total
          if (d?.pagination && typeof d.pagination.total === 'number') {
            return d.pagination.total;
          }
          
          // Check for array properties (leads, sellers)
          if (Array.isArray(d?.leads)) return d.leads.length;
          if (Array.isArray(d?.sellers)) return d.sellers.length;
          if (Array.isArray(d?.items)) return d.items.length;
          if (Array.isArray(d?.data)) return d.data.length;
          
          // Check for count property
          if (typeof d?.count === 'number') return d.count;
          
          return 0;
        };

        setStats({
          banners: getCount(bannersRes),
          categories: getCount(categoriesRes),
          sellers: getCount(sellersRes),
          leads: getCount(leadsRes),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Banners', value: stats.banners, color: 'blue', icon: '🖼️' },
    { label: 'Categories', value: stats.categories, color: 'green', icon: '📁' },
    { label: 'Sellers', value: stats.sellers, color: 'purple', icon: '👥' },
    { label: 'Leads', value: stats.leads, color: 'orange', icon: '📋' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const colorMap = {
            blue: 'border-blue-500',
            green: 'border-green-500',
            purple: 'border-purple-500',
            orange: 'border-orange-500',
          };
          const borderClass = colorMap[stat.color] || 'border-slate-300';
          return (
          <div
            key={stat.label}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderClass}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;



