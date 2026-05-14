import React, { useState, useEffect } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Legend,
} from "recharts";
import {
  BookOpen,
  Target,
  FileText,
  Moon,
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

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [correlations, setCorrelations] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleTrends, setVisibleTrends] = useState({
    sentiment: true,
    sleep: false,
    stress: false,
    social: false,
  });

  const handleTrendToggle = (trend) => {
    setVisibleTrends((prev) => ({ ...prev, [trend]: !prev[trend] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
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
        if (correlationsData && correlationsData.strongest_correlations) {
          const formattedCorrelations = { ...correlationsData };
          for (const key in formattedCorrelations.strongest_correlations) {
            const correlation =
              formattedCorrelations.strongest_correlations[key];
            correlation.data = correlation.data.map((d, i) => ({
              ...d,
              x_avg: correlation.x_avg[i],
              y_avg: correlation.y_avg[i],
            }));
          }
          setCorrelations(formattedCorrelations);
        } else {
          setCorrelations(correlationsData);
        }
        setSummary(summaryData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Could not load analytics data. Please try again later.");
      } finally {
        setLoading(false);
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

        {loading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Trends
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Wellbeing Trends Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis domain={[1, 5]} stroke="#64748b" />
                      {visibleTrends.sleep && (
                        <Line
                          type="monotone"
                          dataKey="sleep"
                          stroke="#6366f1"
                          strokeWidth={2}
                          name="Sleep Quality"
                          dot={false}
                        />
                      )}
                      {visibleTrends.stress && (
                        <Line
                          type="monotone"
                          dataKey="stress"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="Stress Level"
                          dot={false}
                        />
                      )}
                      {visibleTrends.sentiment && (
                        <Line
                          type="monotone"
                          dataKey="sentiment"
                          stroke="#eab308"
                          strokeWidth={2}
                          name="Mood"
                          dot={false}
                        />
                      )}
                      {visibleTrends.social && (
                        <Line
                          type="monotone"
                          dataKey="social"
                          stroke="#ec4899"
                          strokeWidth={2}
                          name="Social Engagement"
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div
                      className={`flex items-center cursor-pointer ${
                        visibleTrends.sleep ? "text-gray-600" : "text-gray-400"
                      }`}
                      onClick={() => handleTrendToggle("sleep")}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          visibleTrends.sleep ? "bg-indigo-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span>Sleep Quality</span>
                    </div>
                    <div
                      className={`flex items-center cursor-pointer ${
                        visibleTrends.stress ? "text-gray-600" : "text-gray-400"
                      }`}
                      onClick={() => handleTrendToggle("stress")}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          visibleTrends.stress ? "bg-red-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span>Stress Level</span>
                    </div>
                    <div
                      className={`flex items-center cursor-pointer ${
                        visibleTrends.sentiment
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                      onClick={() => handleTrendToggle("sentiment")}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          visibleTrends.sentiment
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span>Mood</span>
                    </div>
                    <div
                      className={`flex items-center cursor-pointer ${
                        visibleTrends.social ? "text-gray-600" : "text-gray-400"
                      }`}
                      onClick={() => handleTrendToggle("social")}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          visibleTrends.social ? "bg-pink-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span>Social Engagement</span>
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
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(correlations.strongest_correlations).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex"
                      >
                        <div className="w-2/3">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {value.x_label} vs {value.y_label}
                          </h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={value.data}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                              />
                              <XAxis dataKey="date" stroke="#64748b" />
                              <YAxis
                                yAxisId="left"
                                stroke="#8884d8"
                                allowDecimals={false}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#ff7300"
                                allowDecimals={false}
                              />
                              <Legend />
                              <Bar
                                yAxisId="left"
                                dataKey="x_avg"
                                barSize={20}
                                fill="#413ea0"
                                name={value.x_label}
                                label={false}
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="y_avg"
                                stroke="#ff7300"
                                name={value.y_label}
                                label={false}
                                dot={false}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                          <p className="text-sm text-gray-600 mt-2">
                            Correlation:{" "}
                            <span className="font-medium text-green-600">
                              {value.correlation.toFixed(2)}
                            </span>
                          </p>
                        </div>
                        <div className="w-1/3 pl-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Insights
                          </h4>
                          {value.insights &&
                            value.insights.map((insight, index) => {
                              const colors = [
                                "bg-blue-50 text-blue-800",
                                "bg-green-50 text-green-800",
                                "bg-yellow-50 text-yellow-800",
                              ];

                              return (
                                <div
                                  key={index}
                                  className={`p-4 rounded-lg mb-4 ${
                                    colors[index % colors.length]
                                  }`}
                                >
                                  <p className="text-sm">{insight}</p>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Summary Section */}
            {summary && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Summary
                </h2>
                {summary.summary ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">
                        Key Insights
                      </h4>
                    </div>
                    <p className="text-sm text-blue-800">{summary.summary}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      The analytics summary could not be generated at this time.
                      This might be due to a temporary issue with our insights
                      provider. Please check back later.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
