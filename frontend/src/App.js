import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import FloatingAIButton from "./components/ai/AIButton";
import JournalPage from "./components/pages/JournalPage";
import CalendarPage from "./components/pages/CalendarPage";
import GoalPage from "./components/pages/GoalPage";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import AIChat from "./components/ai/AIChat";
import LoginPage from "./components/pages/LoginPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState("journal");
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="flex h-screen bg-white text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
          </div>

          {showAIChat && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="relative">
                <AIChat onClose={() => setShowAIChat(false)} />
              </div>
            </div>
          )}
        </main>

        <div className="fixed bottom-6 right-6 z-40">
          <FloatingAIButton onClick={() => setShowAIChat(!showAIChat)} />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
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
