import React, { useState } from "react";
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Legend,
  ComposedChart,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Award,
  Heart,
  Moon,
  AlertTriangle,
} from "lucide-react";

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [visibleLines, setVisibleLines] = useState({
    mood: true,
    sleep: true,
    stress: true,
    social: true,
  });

  const toggleLine = (line) => {
    setVisibleLines((prevState) => ({
      ...prevState,
      [line]: !prevState[line],
    }));
  };

  // Mock data
  const weeklyData = [
    {
      day: "Mon",
      entries: 2,
      words: 450,
      mood: 4,
      sleep: 4,
      stress: 2,
      social: 3,
    },
    {
      day: "Tue",
      entries: 1,
      words: 320,
      mood: 3,
      sleep: 3,
      stress: 3,
      social: 2,
    },
    {
      day: "Wed",
      entries: 3,
      words: 680,
      mood: 5,
      sleep: 5,
      stress: 1,
      social: 4,
    },
    {
      day: "Thu",
      entries: 1,
      words: 290,
      mood: 2,
      sleep: 3,
      stress: 4,
      social: 2,
    },
    {
      day: "Fri",
      entries: 2,
      words: 540,
      mood: 4,
      sleep: 4,
      stress: 2,
      social: 4,
    },
    {
      day: "Sat",
      entries: 4,
      words: 820,
      mood: 5,
      sleep: 5,
      stress: 1,
      social: 5,
    },
    {
      day: "Sun",
      entries: 2,
      words: 380,
      mood: 3,
      sleep: 4,
      stress: 3,
      social: 3,
    },
  ];

  const correlationData = [
    { sleep: 4, stress: 2, happiness: 4, social: 3 },
    { sleep: 3, stress: 3, happiness: 3, social: 2 },
    { sleep: 5, stress: 1, happiness: 5, social: 4 },
    { sleep: 3, stress: 4, happiness: 2, social: 2 },
    { sleep: 4, stress: 2, happiness: 4, social: 4 },
    { sleep: 5, stress: 1, happiness: 5, social: 5 },
    { sleep: 4, stress: 3, happiness: 3, social: 3 },
    { sleep: 2, stress: 5, happiness: 1, social: 1 },
    { sleep: 4, stress: 2, happiness: 4, social: 4 },
    { sleep: 3, stress: 3, happiness: 3, social: 2 },
  ];

  const topicData = [
    { topic: "Work", count: 15, color: "#3b82f6" },
    { topic: "Relationships", count: 12, color: "#8b5cf6" },
    { topic: "Health", count: 8, color: "#10b981" },
    { topic: "Travel", count: 6, color: "#f59e0b" },
    { topic: "Hobbies", count: 10, color: "#ef4444" },
  ];

  const stats = {
    totalEntries: 15,
    longestStreak: 28,
    averageWords: 485,
    averageMood: 4.2,
    averageSleepQuality: 3.8,
    averageStressLevel: 2.5,
    averageSocialEngagement: 4.5,
    totalEntriesTrend: 5,
    longestStreakTrend: 0,
    averageWordsTrend: -2,
    averageMoodTrend: 8.5,
    averageSleepQualityTrend: 3,
    averageStressLevelTrend: -5,
    averageSocialEngagementTrend: 10,
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    color = "blue",
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
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
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const InsightCard = ({ icon, title, text, color }) => (
    <div className={`bg-${color}-50 p-4 rounded-lg`}>
      <div className="flex items-center">
        {icon}
        <h4 className="font-semibold ml-2 text-gray-800">{title}</h4>
      </div>
      <p className="text-sm text-gray-700 mt-2">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Journal Analytics
          </h1>
          <p className="text-gray-600">
            Track your journaling journey and insights
          </p>

          {/* Period Selector */}
          <div className="flex gap-2 mt-4">
            {["7days", "30days", "90days", "1year"].map((period) => (
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
                {period === "1year" && "This Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Total Entries"
            value={stats.totalEntries}
            subtitle="For this period"
            trend={stats.totalEntriesTrend}
            color="blue"
          />
          <StatCard
            icon={Award}
            title="Longest Streak"
            value={`${stats.longestStreak} days`}
            trend={stats.longestStreakTrend}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Avg. Words per Entry"
            value={stats.averageWords}
            trend={stats.averageWordsTrend}
            color="purple"
          />
          <StatCard
            icon={Heart}
            title="Average Mood"
            value={stats.averageMood}
            subtitle="Out of 5"
            trend={stats.averageMoodTrend}
            color="pink"
          />
          <StatCard
            icon={TrendingUp}
            title="Average Sleep Quality"
            value={stats.averageSleepQuality}
            subtitle="Out of 5"
            trend={stats.averageSleepQualityTrend}
            color="yellow"
          />
          <StatCard
            icon={TrendingUp}
            title="Average Stress Level"
            value={stats.averageStressLevel}
            subtitle="Out of 5"
            trend={stats.averageStressLevelTrend}
            color="red"
          />
          <StatCard
            icon={TrendingUp}
            title="Average Social Engagement"
            value={stats.averageSocialEngagement}
            subtitle="Out of 5"
            trend={stats.averageSocialEngagementTrend}
            color="indigo"
          />
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trends</h3>
            <div className="flex space-x-4">
              {Object.keys(visibleLines).map((line) => (
                <button
                  key={line}
                  onClick={() => toggleLine(line)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    visibleLines[line]
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {line.charAt(0).toUpperCase() + line.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis domain={[0, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {visibleLines.mood && (
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#ef4444"
                  name="Mood"
                />
              )}
              {visibleLines.sleep && (
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="#3b82f6"
                  name="Sleep Quality"
                />
              )}
              {visibleLines.stress && (
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#f97316"
                  name="Stress Level"
                />
              )}
              {visibleLines.social && (
                <Line
                  type="monotone"
                  dataKey="social"
                  stroke="#8b5cf6"
                  name="Social Engagement"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Correlation and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Correlation: Sleep Quality vs. Stress Level
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="sleep"
                  name="Sleep Quality"
                  domain={[0, 5]}
                  label={{
                    value: "Sleep Quality",
                    position: "bottom",
                    offset: 0,
                  }}
                  stroke="#64748b"
                />
                <YAxis
                  type="number"
                  dataKey="stress"
                  name="Stress Level"
                  domain={[0, 5]}
                  label={{
                    value: "Stress Level",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  stroke="#64748b"
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Entries" data={correlationData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <InsightCard
              icon={<TrendingUp className="text-green-500" />}
              title="Strong Correlation"
              text="Better sleep quality strongly correlates with lower stress levels (r = -0.78)"
              color="green"
            />
            <InsightCard
              icon={<Moon className="text-blue-500" />}
              title="Optimal Sleep"
              text="Your lowest stress levels occur when you get 8-9 hours of sleep."
              color="blue"
            />
            <InsightCard
              icon={<AlertTriangle className="text-orange-500" />}
              title="Sleep Deficit"
              text="Less than 7 hours of sleep significantly impacts your stress levels."
              color="orange"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Correlation: Happiness vs. Social Engagement
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="happiness"
                  name="Happiness"
                  domain={[0, 5]}
                  label={{
                    value: "Happiness",
                    position: "bottom",
                    offset: 0,
                  }}
                  stroke="#64748b"
                />
                <YAxis
                  type="number"
                  dataKey="social"
                  name="Social Engagement"
                  domain={[0, 5]}
                  label={{
                    value: "Social Engagement",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  stroke="#64748b"
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Entries" data={correlationData} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <InsightCard
              icon={<TrendingUp className="text-green-500" />}
              title="Positive Correlation"
              text="Higher social engagement is correlated with increased happiness (r = 0.65)"
              color="green"
            />
            <InsightCard
              icon={<Heart className="text-pink-500" />}
              title="Social Boost"
              text="Your happiest days often coincide with high social engagement."
              color="pink"
            />
            <InsightCard
              icon={<AlertTriangle className="text-orange-500" />}
              title="Engagement Opportunity"
              text="Consider increasing social activities to potentially boost happiness."
              color="orange"
            />
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Written Topics
          </h3>
          <div className="space-y-3">
            {topicData.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: topic.color }}
                  ></div>
                  <span className="text-gray-700">{topic.topic}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {topic.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Most productive day:</span>{" "}
                Saturday with 4 entries and 820 words
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">Mood insight:</span> Your mood
                tends to be highest on weekends
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <span className="font-medium">Writing pattern:</span> You write
                23% more on days when you journal in the evening
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <span className="font-medium">Topic focus:</span> Work-related
                entries have increased by 15% this month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
