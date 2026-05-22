import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Lock, ArrowRight, X } from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import FloatingAIButton from "./components/ai/AIButton";
import JournalPage from "./components/pages/JournalPage";
import CalendarPage from "./components/pages/CalendarPage";
import GoalPage from "./components/pages/GoalPage";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import AdminDashboard from "./components/pages/AdminDashboard";
import AIChat from "./components/ai/AIChat";
import LoginPage from "./components/pages/LoginPage";
import LandingPage from "./components/pages/LandingPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const DEMO_FORCE_LOGIN_MS = 5 * 60 * 1000;

function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] text-white px-4 py-2 flex items-center justify-center gap-2 text-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>
      <div className="flex items-center gap-2 relative z-10">
        <Sparkles size={16} />
        <span className="font-semibold">Demo mode</span>
      </div>
    </div>
  );
}

function UpgradeModal({ open, reason, onSignUp, onLogin, onClose, blocking = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {!blocking && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#9B30FF] to-[#6A0DAD] rounded-2xl flex items-center justify-center mb-5">
          <Lock size={26} className="text-white" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
          {blocking ? "Your demo just timed out." : reason || "That's a paid feature."}
        </h3>
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {blocking
            ? "Create a free account to keep exploring with your own data, AI insights, and unlimited entries."
            : "Sign up free to unlock the full Reflecta experience: AI chat, persistent entries, deep analytics, and more."}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onSignUp}
            className="w-full bg-gradient-to-r from-[#9B30FF] to-[#6A0DAD] text-white font-bold py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
          >
            Sign Up Free <ArrowRight size={18} />
          </button>
          <button
            onClick={onLogin}
            className="w-full text-gray-700 font-semibold py-2 hover:text-[#6A0DAD] transition-colors"
          >
            I already have an account
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          No credit card required.
        </p>
      </div>
    </div>
  );
}

function AuthenticatedApp({ demoMode = false, initialTab = "journal", onExitDemo }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAIChat, setShowAIChat] = useState(false);
  const [upgrade, setUpgrade] = useState({ open: false, reason: null, blocking: false });
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!demoMode) return;
    timeoutRef.current = setTimeout(() => {
      setUpgrade({ open: true, reason: null, blocking: true });
    }, DEMO_FORCE_LOGIN_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [demoMode]);

  const handleAIClick = () => {
    if (demoMode) {
      setUpgrade({
        open: true,
        reason: "AI Chat is locked in demo mode.",
        blocking: false,
      });
      return;
    }
    setShowAIChat((v) => !v);
  };

  const handleTabChange = (id) => {
    if (demoMode && id === "admin") {
      setUpgrade({
        open: true,
        reason: "Admin tools require a real account.",
        blocking: false,
      });
      return;
    }
    setActiveTab(id);
  };

  const handleSignUp = () => {
    if (onExitDemo) onExitDemo("signup");
  };
  const handleLogin = () => {
    if (onExitDemo) onExitDemo("login");
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {demoMode && <DemoBanner />}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          demoMode={demoMode}
          onExitDemo={() => onExitDemo && onExitDemo("exit")}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header activeTab={activeTab} />

          <main className="flex-1 flex overflow-hidden">
            <div
              className={`flex-1 overflow-y-auto p-8 ${
                showAIChat ? "md:pr-4" : ""
              }`}
            >
              {activeTab === "journal" && <JournalPage />}
              {activeTab === "goals" && <GoalPage />}
              {activeTab === "calendar" && <CalendarPage />}
              {activeTab === "analytics" && <AnalyticsDashboard />}
              {activeTab === "admin" && !demoMode && <AdminDashboard />}
            </div>

            {showAIChat && !demoMode && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="relative">
                  <AIChat onClose={() => setShowAIChat(false)} />
                </div>
              </div>
            )}
          </main>

          <div className="fixed bottom-6 right-6 z-40">
            <FloatingAIButton onClick={handleAIClick} locked={demoMode} />
          </div>
        </div>
      </div>

      <UpgradeModal
        open={upgrade.open}
        reason={upgrade.reason}
        blocking={upgrade.blocking}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
        onClose={() => setUpgrade({ open: false, reason: null, blocking: false })}
      />
    </div>
  );
}

function AppContent() {
  const { user, loading, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoTab, setDemoTab] = useState("journal");
  const [pendingMode, setPendingMode] = useState("login");

  const enterDemo = async (tab) => {
    setDemoTab(tab);
    setDemoMode(true);
    await login("demo@reflecta.app", "demo");
  };

  const exitDemo = async (intent) => {
    setDemoMode(false);
    await logout();
    if (intent === "exit") {
      setShowLogin(false);
      return;
    }
    setPendingMode(intent === "signup" ? "signup" : "login");
    setShowLogin(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return <LoginPage onBack={() => setShowLogin(false)} initialMode={pendingMode} />;
    }
    return (
      <LandingPage
        onGetStarted={() => {
          setPendingMode("signup");
          setShowLogin(true);
        }}
        onLogin={() => {
          setPendingMode("login");
          setShowLogin(true);
        }}
        onLiveDemo={() => enterDemo("journal")}
        onExploreAnalytics={() => enterDemo("analytics")}
      />
    );
  }

  return (
    <AuthenticatedApp
      demoMode={demoMode}
      initialTab={demoTab}
      onExitDemo={exitDemo}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
