import React, { useState, useEffect } from "react";
import { Users, FileText, Cpu } from "lucide-react";
import { getAdminStats } from "../../api/api";

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-purple-100">
        <Icon className="h-5 w-5 text-purple-600" />
      </div>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading admin stats...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total_users}
        />
        <StatCard
          icon={Users}
          label="Active Users (7d)"
          value={stats.active_users_7d}
        />
        <StatCard
          icon={FileText}
          label="Total Entries"
          value={stats.total_entries}
        />
        <StatCard
          icon={Cpu}
          label="AI Calls Today"
          value={stats.ai_calls_today}
        />
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Calls</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_ai_calls}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-xl font-bold text-gray-900">{stats.ai_success_rate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tokens</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.ai_tokens_total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
