import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import FloatingAIButton from "./components/ai/AIButton";
import JournalPage from "./components/pages/JournalPage";
import CalendarPage from "./components/pages/CalendarPage";
import GoalPage from "./components/pages/GoalPage";
import AnalyticsPage from "./components/pages/AnalyticsPage";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import AIChat from "./components/ai/AIChat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const [activeTab, setActiveTab] = useState("journal");
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-50 text-gray-800">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header activeTab={activeTab} />

          <main className="flex-1 flex overflow-hidden">
            <div
              className={`flex-1 overflow-y-auto p-6 ${
                showAIChat ? "md:pr-4" : ""
              }`}
            >
              {activeTab === "journal" && <JournalPage />}
              {activeTab === "goals" && <GoalPage />}
              {activeTab === "calendar" && <CalendarPage />}
              {activeTab === "analytics" && <AnalyticsDashboard />}
            </div>

            {showAIChat && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="relative">
                  {" "}
                  <AIChat onClose={() => setShowAIChat(false)} />
                </div>
              </div>
            )}
          </main>

          <div className="fixed bottom-6 right-6 z-40">
            <FloatingAIButton onClick={() => setShowAIChat(!showAIChat)} />{" "}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
