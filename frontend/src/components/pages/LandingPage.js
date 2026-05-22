import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Star,
  Moon,
  Sun,
  Feather,
  Frown,
  Zap,
  User,
  Users,
  Smile,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  Flame,
  CalendarDays,
} from "lucide-react";
import { journalQuestionPool } from "../../api/mockData";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const useScrollFade = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, isVisible];
};

const ReflectaLogo = ({ className = "h-8 w-auto", showWordmark = true }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={showWordmark ? "0 0 200 60" : "0 0 60 60"}
    className={className}
  >
    <defs>
      <linearGradient id="reflectaLandingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9B30FF" />
        <stop offset="100%" stopColor="#6A0DAD" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="40" height="40" rx="10" ry="10" fill="url(#reflectaLandingGradient)" />
    <line x1="30" y1="10" x2="30" y2="50" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M20 25 Q 25 18, 30 25 Q 35 32, 40 25" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    <path
      d="M20 35 Q 25 42, 30 35 Q 35 28, 40 35"
      stroke="#FFFFFF"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
    />
    {showWordmark && (
      <text
        x="60"
        y="38"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="600"
        fontSize="24"
        fill="#171717"
      >
        Reflecta
      </text>
    )}
  </svg>
);

const Navbar = ({ onLogin, onGetStarted }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <ReflectaLogo className="h-12 w-auto" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToId("features")}
              className="text-gray-600 hover:text-[#6A0DAD] transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToId("science")}
              className="text-gray-600 hover:text-[#6A0DAD] transition-colors font-medium"
            >
              The Science
            </button>
            <button
              onClick={() => scrollToId("reviews")}
              className="text-gray-600 hover:text-[#6A0DAD] transition-colors font-medium"
            >
              Reviews
            </button>
            <div className="flex items-center space-x-4 ml-4">
              <button
                onClick={onLogin}
                className="text-gray-900 font-medium hover:text-[#6A0DAD] transition-colors"
              >
                Log In
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Start Reflecting
              </button>
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setIsOpen(false);
              scrollToId("features");
            }}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-purple-50 rounded-md"
          >
            Features
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              scrollToId("science");
            }}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-purple-50 rounded-md"
          >
            The Science
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              scrollToId("reviews");
            }}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-purple-50 rounded-md"
          >
            Reviews
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogin();
            }}
            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-purple-50 rounded-md"
          >
            Log In
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onGetStarted();
            }}
            className="block w-full text-center mt-4 bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] text-white px-6 py-3 rounded-xl font-medium"
          >
            Start Free Trial
          </button>
        </div>
      )}
    </nav>
  );
};

const MetricCard = ({ icon: Icon, value, label }) => (
  <div className="flex-shrink-0 w-64 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mx-3 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="mb-4 bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center">
      <Icon size={20} className="text-[#6A0DAD]" />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  </div>
);

const MarqueeSection = () => {
  const metrics = [
    { icon: Feather, value: "3.1/5", label: "Stress Level" },
    { icon: Smile, value: "3.6/5", label: "Mood Score" },
    { icon: Users, value: "3.2/5", label: "Social Engagement" },
    { icon: Moon, value: "4.1/5", label: "Sleep Quality" },
    { icon: Sparkles, value: "98%", label: "AI Synthesis Accuracy" },
  ];

  return (
    <div className="w-full overflow-hidden bg-gray-50 py-12 border-y border-gray-100">
      <div className="relative flex w-full">
        <div className="reflecta-marquee flex whitespace-nowrap">
          {[...metrics, ...metrics, ...metrics].map((m, i) => (
            <MetricCard key={i} icon={m.icon} value={m.value} label={m.label} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22c55e"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const RangeSlider = ({ name, label, value, onChange, minIcon, maxIcon }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700">
      {label}: <span className="font-bold text-[#6A0DAD]">{value}</span>
    </label>
    <div className="flex items-center gap-2 mt-1">
      {minIcon}
      <input
        type="range"
        name={name}
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6A0DAD]"
      />
      {maxIcon}
    </div>
    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
      <span>1</span>
      <span>5</span>
    </div>
  </div>
);

const InteractiveJournalCard = () => {
  const [title, setTitle] = useState("Long run by the river");
  const [content, setContent] = useState(
    "10k along the river path. Slept nine hours and felt it the whole run. Phone stayed in my pocket. Brain quiet for the first time this week."
  );
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [sentiment, setSentiment] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [stress, setStress] = useState(1);
  const [socialEngagement, setSocialEngagement] = useState(2);

  const [aiJournalingActive, setAiJournalingActive] = useState(true);
  const [aiQuestion, setAiQuestion] = useState("");
  const [loadingAiQuestion, setLoadingAiQuestion] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const fetchAiQuestion = useCallback(async (currentContent) => {
    setLoadingAiQuestion(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const seed = (currentContent || "").length;
    const question =
      journalQuestionPool[seed % journalQuestionPool.length];
    setAiQuestion(question);
    setLoadingAiQuestion(false);
  }, []);

  useEffect(() => {
    if (aiJournalingActive) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        fetchAiQuestion(content);
      }, 1000);
    } else {
      setAiQuestion("");
    }
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [aiJournalingActive, content, fetchAiQuestion]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative h-[640px] flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Sparkles size={16} className="text-[#6A0DAD]" />
          </div>
          <h5 className="font-bold text-gray-900">New Journal Entry</h5>
        </div>
        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
          Live
        </span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
        <div className="flex gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind today?"
              className="w-full h-9 bg-gray-50 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-[#9B30FF] focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>
          <div className="w-32 flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              readOnly
              className="w-full h-9 bg-gray-50 rounded-lg border border-gray-200 px-2 text-xs text-gray-700 outline-none"
            />
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Journal Entry
          </label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write your thoughts here..."
              className="w-full h-[112px] bg-gray-50 rounded-lg border border-gray-200 p-3 pb-10 text-sm text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-[#9B30FF] focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
            />
            <button
              type="button"
              onClick={() => setAiJournalingActive((v) => !v)}
              className={`absolute bottom-2 right-2 px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                aiJournalingActive
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>{aiJournalingActive ? "AI ON" : "AI"}</span>
            </button>
          </div>
          <div className="mt-1.5 h-5 text-xs text-gray-600 overflow-hidden">
            {aiJournalingActive && (
              loadingAiQuestion ? (
                <span className="italic text-gray-400">Loading AI question...</span>
              ) : (
                <p className="italic truncate">
                  {aiQuestion || "Start typing to get AI questions."}
                </p>
              )
            )}
          </div>
        </div>

        <div className="flex-shrink-0 pt-2 border-t border-gray-100">
          <h6 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">
            Track Your State
          </h6>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <RangeSlider
              name="sentiment"
              label="Sentiment"
              value={sentiment}
              onChange={setSentiment}
              minIcon={<Frown className="h-4 w-4 text-gray-500" />}
              maxIcon={<Smile className="h-4 w-4 text-gray-500" />}
            />
            <RangeSlider
              name="sleep"
              label="Sleep Quality"
              value={sleep}
              onChange={setSleep}
              minIcon={<Moon className="h-4 w-4 text-gray-500" />}
              maxIcon={<Sun className="h-4 w-4 text-gray-500" />}
            />
            <RangeSlider
              name="stress"
              label="Stress Level"
              value={stress}
              onChange={setStress}
              minIcon={<Feather className="h-4 w-4 text-gray-500" />}
              maxIcon={<Zap className="h-4 w-4 text-gray-500" />}
            />
            <RangeSlider
              name="socialEngagement"
              label="Social Engagement"
              value={socialEngagement}
              onChange={setSocialEngagement}
              minIcon={<User className="h-4 w-4 text-gray-500" />}
              maxIcon={<Users className="h-4 w-4 text-gray-500" />}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button className="px-4 py-2 bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] rounded-lg text-sm font-semibold text-white shadow hover:shadow-lg hover:shadow-purple-500/30 transition-all">
          Save Entry
        </button>
      </div>
    </div>
  );
};

const trendData = [
  { day: "Mon", mood: 4, sleep: 4, stress: 2 },
  { day: "Tue", mood: 2, sleep: 1, stress: 5 },
  { day: "Wed", mood: 3, sleep: 3, stress: 4 },
  { day: "Thu", mood: 4, sleep: 4, stress: 3 },
  { day: "Fri", mood: 5, sleep: 5, stress: 1 },
  { day: "Sat", mood: 4, sleep: 4, stress: 2 },
  { day: "Sun", mood: 5, sleep: 5, stress: 1 },
];

const sentimentDist = [
  { name: "Proud", count: 6, color: "#9B30FF" },
  { name: "Calm", count: 5, color: "#A855F7" },
  { name: "Stressed", count: 3, color: "#F472B6" },
  { name: "Tired", count: 4, color: "#94A3B8" },
  { name: "Inspired", count: 2, color: "#22D3EE" },
];

const sleepRing = [{ name: "Sleep", value: 78, fill: "#9B30FF" }];

const InteractiveAnalyticsCard = () => {
  const [hoveredDay, setHoveredDay] = useState(null);

  const stats = [
    { icon: Smile, label: "Avg Mood", value: "3.9", trend: "+0.4", tone: "text-emerald-600" },
    { icon: Moon, label: "Avg Sleep", value: "3.7", trend: "+0.2", tone: "text-emerald-600" },
    { icon: Flame, label: "Streak", value: "12d", trend: "Best yet", tone: "text-[#6A0DAD]" },
    { icon: CalendarDays, label: "Entries", value: "23", trend: "this month", tone: "text-gray-500" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-gray-50 rounded-xl p-3 hover:bg-purple-50 transition-colors cursor-default"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon size={12} className="text-[#6A0DAD]" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                {s.label}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className={`text-[10px] font-medium ${s.tone}`}>{s.trend}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-bold text-gray-900 text-sm">Wellbeing Trends</h5>
          <div className="flex gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-[#6A0DAD]">
              <span className="w-2 h-2 rounded-full bg-[#6A0DAD]" /> Mood
            </span>
            <span className="flex items-center gap-1 text-sky-600">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Sleep
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Stress
            </span>
          </div>
        </div>
        <div className="h-44 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onMouseMove={(e) => setHoveredDay(e?.activeLabel ?? null)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <CartesianGrid stroke="#f1f1f1" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 3, 5]}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip
                cursor={{ stroke: "#9B30FF", strokeOpacity: 0.2 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #f3e8ff",
                  fontSize: 12,
                  boxShadow: "0 8px 20px rgba(155, 48, 255, 0.12)",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#6A0DAD"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#6A0DAD" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ r: 2.5, fill: "#0284c7" }}
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 2.5, fill: "#f43f5e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {hoveredDay && (
          <div className="text-[11px] text-gray-500 mt-1">
            Hovering <span className="font-semibold text-[#6A0DAD]">{hoveredDay}</span> - all charts sync.
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3 bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Sentiment Mix
            </span>
            <span className="text-[10px] text-gray-400">last 14 days</span>
          </div>
          <div className="h-24 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentDist} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(155,48,255,0.06)" }}
                  contentStyle={{ borderRadius: 10, fontSize: 11, border: "1px solid #f3e8ff" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sentimentDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center relative">
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
            Sleep
          </span>
          <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={sleepRing}
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} fill="#9B30FF" background={{ fill: "#f3e8ff" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900 leading-none">78%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-3 flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#6A0DAD] flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#6A0DAD] mb-0.5">
            AI correlation
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Mood and sleep moved together this week (r = 0.81). The two days under 4h sleep both produced your lowest sentiment scores.
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureSection = ({ onExploreAnalytics }) => {
  const [ref1, isVisible1] = useScrollFade();
  const [ref2, isVisible2] = useScrollFade();
  const [ref3, isVisible3] = useScrollFade();

  return (
    <div id="features" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-[#9B30FF] font-bold tracking-wide uppercase text-sm mb-3">
            The Reflecta Architecture
          </h2>
          <h3 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Decode your cognitive DNA.
          </h3>
          <p className="text-xl text-gray-500">
            More than a diary. Reflecta is an ontological interface that maps your thoughts, emotions, and physiological states.
          </p>
        </div>

        <div
          ref={ref1}
          className={`flex flex-col lg:flex-row items-center gap-16 mb-32 transition-all duration-1000 transform ${
            isVisible1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="lg:w-1/2">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Smile className="text-[#6A0DAD]" size={24} />
            </div>
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Capture the human frequency.</h4>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Log your reality effortlessly. Our intuitive sliders let you capture your exact state of being - from Sentiment to Sleep Quality - collapsing the wave function of your day into actionable data.
            </p>
            <ul className="space-y-4">
              {["Frictionless daily entry", "Multi-dimensional state tracking", "Historical timeline search"].map(
                (item, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <div className="mr-3 bg-green-100 rounded-full p-1">
                      <CheckIcon />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="lg:w-1/2 w-full">
            <InteractiveJournalCard />
          </div>
        </div>

        <div
          ref={ref2}
          id="analytics"
          className={`flex flex-col-reverse lg:flex-row items-center gap-16 mb-32 transition-all duration-1000 transform ${
            isVisible2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="lg:w-1/2 w-full">
            <InteractiveAnalyticsCard />
          </div>

          <div className="lg:w-1/2">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="text-[#6A0DAD]" size={24} />
            </div>
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Visualize ontological symmetry.</h4>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Watch your personal universe expand. Reflecta takes your chaotic daily inputs and plots them on beautiful, interactive timelines, revealing the hidden gravitational pulls of your psychological state.
            </p>
            <button
              onClick={onExploreAnalytics}
              className="flex items-center text-[#9B30FF] font-semibold hover:text-[#6A0DAD] transition-colors group"
            >
              Try demo{" "}
              <ArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </div>

        <div
          ref={ref3}
          id="science"
          className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 transform ${
            isVisible3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="lg:w-1/2">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Brain className="text-[#6A0DAD]" size={24} />
            </div>
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Deep synthesis via AI Resonance.</h4>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Experience true cognitive entanglement. Our AI doesn't just read your journal - it synthesizes long-term patterns, identifies cognitive blind spots, and holds a mirror to your future self.
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#9B30FF] to-[#6A0DAD]"></div>
              <p className="italic text-gray-700 text-sm">
                "I noticed your stress levels spike on days following poor sleep quality, yet your social engagement remains high. It seems you might be using social activity to mask fatigue. Let's reflect on this..."
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-[#6A0DAD] uppercase tracking-wider">
                <Sparkles size={14} className="mr-2" /> Reflecta AI Insight
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-gradient-to-br from-[#9B30FF] to-[#6A0DAD] rounded-3xl p-1 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-[22px] p-8 h-full w-full">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                    <ReflectaLogo className="w-8 h-8" showWordmark={false} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Reflecta AI</h4>
                    <p className="text-sm text-gray-500">Always listening, always learning.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 w-[85%] text-sm text-gray-700">
                    Based on your entries this week, you seem to be experiencing "Quantum Burnout." You are doing everything, yet feeling like you've accomplished nothing.
                  </div>
                  <div className="bg-[#9B30FF] text-white rounded-2xl rounded-tr-none p-4 w-[85%] ml-auto text-sm shadow-md">
                    That's exactly how I feel. How do I collapse the wave function and focus?
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 w-[85%] text-sm text-gray-700">
                    Let's look at your sleep data from Tuesday...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  const reviews = [
    {
      text: "Reflecta hasn't just tracked my habits; it has fundamentally altered my ontological trajectory. The AI insights are breathtakingly accurate.",
      author: "Sarah J.",
      role: "Product Designer",
    },
    {
      text: "I used to write in a paper diary. Now I engage in deep synthesis with my future self. The correlation between my sleep and mood charts completely changed my routine.",
      author: "Michael T.",
      role: "Software Engineer",
    },
    {
      text: "It's like having a therapist, a data scientist, and a philosopher in my pocket. The violet gradient alone soothes my neural excitation.",
      author: "Elena R.",
      role: "Creative Director",
    },
  ];

  return (
    <div id="reviews" className="bg-gray-50 py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[#9B30FF] font-bold tracking-wide uppercase text-sm mb-3">Gravitational Pull</h2>
          <h3 className="text-3xl font-extrabold text-gray-900">Join a universe of self-aware minds.</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="flex gap-1 mb-4 text-[#9B30FF]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">"{review.text}"</p>
              <div>
                <h5 className="font-bold text-gray-900 text-sm">{review.author}</h5>
                <p className="text-xs text-gray-500">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CTASection = ({ onGetStarted, onLiveDemo }) => (
  <div className="relative py-24 overflow-hidden">
    <div className="absolute inset-0 reflecta-grid-bg opacity-40"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] opacity-5 rounded-full blur-3xl pointer-events-none"></div>

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <ReflectaLogo className="h-16 w-auto mx-auto mb-8" />
      <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Collapse the wave function of your thoughts.
      </h2>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        Stop letting your cognitive DNA drift into the void. Start tracking, analyzing, and synthesizing your life today.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all transform hover:-translate-y-1 flex items-center justify-center group"
        >
          Sign Up For Free
          <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={onLiveDemo}
          className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={18} className="text-[#9B30FF]" />
          Try live demo
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-6">No credit card required. Free forever basic tier.</p>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <ReflectaLogo className="h-6 w-auto grayscale opacity-50" />
        <span className="text-gray-400 text-sm font-medium">© 2026 Reflecta Inc.</span>
      </div>
      <div className="flex gap-8 text-sm text-gray-500 font-medium">
        <button type="button" onClick={scrollToTop} className="hover:text-[#6A0DAD]">
          Privacy Policy
        </button>
        <button type="button" onClick={scrollToTop} className="hover:text-[#6A0DAD]">
          Terms of Service
        </button>
        <button type="button" onClick={scrollToTop} className="hover:text-[#6A0DAD]">
          Ontology Manifesto
        </button>
      </div>
    </div>
  </footer>
);

const HeroSection = ({ onGetStarted, onLiveDemo }) => (
  <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
    <div className="absolute top-0 right-0 -mr-64 -mt-64 w-[800px] h-[800px] bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Quantify your <br />
            <span className="reflecta-text-gradient">consciousness.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            The AI-powered journal that maps your emotional DNA, tracks your wellbeing, and synthesizes your thoughts into profound insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all transform hover:-translate-y-1"
            >
              Start Reflecting
            </button>
            <button
              onClick={onLiveDemo}
              className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={18} className="text-[#9B30FF]" />
              Try live demo
            </button>
          </div>
          <button
            onClick={() => scrollToId("features")}
            className="mt-6 text-sm text-gray-500 hover:text-[#6A0DAD] transition-colors font-medium"
          >
            or see how it works &darr;
          </button>
        </div>

        <div className="lg:w-1/2 w-full mt-12 lg:mt-0 relative">
          <div className="relative w-full max-w-lg mx-auto transform lg:rotate-2 lg:hover:rotate-0 transition-transform duration-700 ease-out">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#9B30FF] to-[#6A0DAD] rounded-2xl transform translate-x-4 translate-y-4 opacity-20 blur-lg"></div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex h-[500px] relative z-10">
              <div className="w-1/4 bg-gray-50 border-r border-gray-100 p-4 flex-col gap-4 hidden sm:flex">
                <ReflectaLogo className="h-6 w-auto mb-4" />
                <div className="h-8 bg-purple-100 rounded-lg w-full"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-full opacity-50"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-full opacity-50"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-full opacity-50"></div>
              </div>

              <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-bold text-gray-900">My Journal</div>
                  <div className="h-8 w-24 bg-[#9B30FF] rounded-lg"></div>
                </div>

                <div className="h-10 w-full bg-gray-100 rounded-lg mb-6"></div>

                <div className="space-y-4 overflow-hidden">
                  <div className="p-4 border border-gray-100 rounded-xl shadow-sm">
                    <div className="h-4 w-3/4 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 w-1/4 bg-gray-400 rounded mb-3"></div>
                    <div className="flex gap-3">
                      <div className="h-3 w-8 bg-green-100 rounded-full"></div>
                      <div className="h-3 w-8 bg-yellow-100 rounded-full"></div>
                      <div className="h-3 w-8 bg-blue-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl shadow-sm">
                    <div className="h-4 w-1/2 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 w-1/4 bg-gray-400 rounded mb-3"></div>
                    <div className="flex gap-3">
                      <div className="h-3 w-8 bg-red-100 rounded-full"></div>
                      <div className="h-3 w-8 bg-red-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl shadow-sm opacity-50">
                    <div className="h-4 w-2/3 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 w-1/4 bg-gray-400 rounded mb-3"></div>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 bg-purple-50 text-[#6A0DAD] px-4 py-2 rounded-full border border-purple-200 shadow-lg flex items-center gap-2 font-semibold text-sm">
                  <MessageSquare size={16} /> Reflecta AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function LandingPage({ onGetStarted, onLogin, onLiveDemo, onExploreAnalytics }) {
  const handleGetStarted = onGetStarted || (() => {});
  const handleLogin = onLogin || handleGetStarted;
  const handleLiveDemo = onLiveDemo || handleGetStarted;
  const handleExploreAnalytics = onExploreAnalytics || handleLiveDemo;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-purple-200 selection:text-purple-900">
      <Navbar onLogin={handleLogin} onGetStarted={handleGetStarted} />

      <main>
        <HeroSection
          onGetStarted={handleGetStarted}
          onLiveDemo={handleLiveDemo}
        />
        <MarqueeSection />
        <FeatureSection onExploreAnalytics={handleExploreAnalytics} />
        <ReviewsSection />
        <CTASection onGetStarted={handleGetStarted} onLiveDemo={handleLiveDemo} />
      </main>

      <Footer />
    </div>
  );
}
