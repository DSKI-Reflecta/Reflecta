import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  BookOpen,
  Target,
  FileText,
  Moon,
  AlertCircle,
  Smile,
  Users,
  TrendingUp,
  Frown,
  Meh,
  Sun,
  Zap,
  Feather,
  User,
} from "lucide-react";
import {
  getAnalyticsStats,
  getAnalyticsTrends,
  getAnalyticsCorrelations,
  getAnalyticsSummary,
} from "../../api/api";

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "blue",
  isRating = false,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {isRating && (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={`w-3 h-3 rounded-full ${
                star <= Math.round(value) ? `bg-${color}-400` : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold text-gray-900">
        {isRating ? `${value}/5` : value}
      </h3>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [correlations, setCorrelations] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, trendsData, correlationsData, summaryData] =
          await Promise.all([
            getAnalyticsStats(selectedPeriod),
            getAnalyticsTrends(selectedPeriod),
            getAnalyticsCorrelations(selectedPeriod),
            getAnalyticsSummary(selectedPeriod),
          ]);
        setStats(statsData);
        const formattedTrends = trendsData.dates.map((date, index) => ({
          date,
          sentiment: trendsData.sentiment[index],
          sleep: trendsData.sleep[index],
          stress: trendsData.stress[index],
          social: trendsData.social[index],
        }));
        setTrends(formattedTrends);
        console.log("Trends data:", trendsData);
        setCorrelations(correlationsData);
        setSummary(summaryData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const getSentimentIcon = (value) => {
    if (value >= 4) return Smile;
    if (value <= 2) return Frown;
    return Meh;
  };

  const getSleepIcon = (value) => {
    if (value >= 4) return Sun;
    return Moon;
  };

  const getStressIcon = (value) => {
    if (value >= 4) return Zap;
    return Feather;
  };

  const getSocialIcon = (value) => {
    if (value >= 4) return Users;
    return User;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Journal Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your wellbeing and journaling insights
          </p>

          {/* Period Selector */}
          <div className="flex gap-2 mt-4">
            {["7days", "30days", "90days", "365days"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {period === "7days" && "Last 7 Days"}
                {period === "30days" && "Last 30 Days"}
                {period === "90days" && "Last 90 Days"}
                {period === "365days" && "Last Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Averages/Stats Section */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={BookOpen}
                title="Total Entries"
                value={stats.total_entries}
                subtitle="Journal entries logged"
                color="blue"
              />
              <StatCard
                icon={Target}
                title="Current Streak"
                value={`${stats.current_streak} days`}
                subtitle="Consecutive days"
                color="green"
              />
              <StatCard
                icon={FileText}
                title="Average Words"
                value={stats.average_words_per_entry.toFixed(0)}
                subtitle="Words per entry"
                color="purple"
              />
              <StatCard
                icon={getSleepIcon(stats.sleep)}
                title="Sleep Quality"
                value={stats.sleep.toFixed(1)}
                color="indigo"
                isRating={true}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <StatCard
                icon={getStressIcon(stats.stress)}
                title="Stress Level"
                value={stats.stress.toFixed(1)}
                color="red"
                isRating={true}
              />
              <StatCard
                icon={getSentimentIcon(stats.sentiment)}
                title="Mood"
                value={stats.sentiment.toFixed(1)}
                color="yellow"
                isRating={true}
              />
              <StatCard
                icon={getSocialIcon(stats.social)}
                title="Social Engagement"
                value={stats.social.toFixed(1)}
                color="pink"
                isRating={true}
              />
            </div>
          </div>
        )}

        {/* Trends Section */}
        {trends.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trends</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Wellbeing Trends Over Time
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis domain={[1, 5]} stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Sleep Quality"
                    dot={{ fill: "#6366f1", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Stress Level"
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#eab308"
                    strokeWidth={2}
                    name="Mood"
                    dot={{ fill: "#eab308", strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="social"
                    stroke="#ec4899"
                    strokeWidth={2}
                    name="Social Engagement"
                    dot={{ fill: "#ec4899", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Sleep Quality</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Stress Level</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Mood</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Social Engagement</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Correlation Section */}
        {correlations && correlations.strongest_correlations && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Correlations
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(correlations.strongest_correlations).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {value.x_label} vs {value.y_label}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={value.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="x"
                          domain={[1, 5]}
                          stroke="#64748b"
                          name={value.x_label}
                        />
                        <YAxis
                          dataKey="y"
                          domain={[1, 5]}
                          stroke="#64748b"
                          name={value.y_label}
                        />
                        <Tooltip
                          formatter={(val, name) => [
                            val,
                            name === "x" ? value.x_label : value.y_label,
                          ]}
                          labelFormatter={() => ""}
                        />
                        <Scatter
                          dataKey="y"
                          fill="#10b981"
                          name={value.y_label}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-gray-600 mt-2">
                      Correlation:{" "}
                      <span className="font-medium text-green-600">
                        {value.correlation.toFixed(2)}
                      </span>
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Summary Section */}
        {summary && summary.summary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Summary
            </h2>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Key Insights</h4>
              </div>
              <p className="text-sm text-blue-800">{summary.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
