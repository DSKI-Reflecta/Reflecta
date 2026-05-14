import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import FloatingAIButton from './components/ai/AIButton';
import JournalPage from './components/pages/JournalPage';
import CalendarPage from './components/pages/CalendarPage';
import GoalPage from './components/pages/GoalPage';
import AIChat from './components/ai/AIChat';

// Import QueryClient and QueryClientProvider from @tanstack/react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Optional: Import ReactQueryDevtools for debugging
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client instance for React Query
const queryClient = new QueryClient();

function App() {
  const [activeTab, setActiveTab] = useState('journal');
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    // Wrap the entire application with QueryClientProvider to make the query client available
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-50 text-gray-800">
        {/* Sidebar is permanently visible */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header activeTab={activeTab} />

          <main className="flex-1 flex overflow-hidden">
            {/* Main content area - adjust padding on the right if chat is shown */}
            <div className={`flex-1 overflow-y-auto p-6 ${showAIChat ? 'md:pr-4' : ''}`}>
              {activeTab === 'journal' && <JournalPage />}
              {activeTab === 'goals' && <GoalPage />}
              {activeTab === 'calendar' && <CalendarPage />}
            </div>

            {/* Centered AI Chat Modal */}
            {showAIChat && (
              // Overlay for the background
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                {/* Container for the chat window */}
                <div className="relative"> {/* Added relative positioning for potential children like close button */}
                   {/* Pass a close handler to AIChat if needed, or handle closing here */}
                  <AIChat onClose={() => setShowAIChat(false)} />
                </div>
              </div>
            )}
          </main>

          {/* Floating AI Button - adjust z-index to be below modal but above other content */}
          <div className="fixed bottom-6 right-6 z-40">
             <FloatingAIButton onClick={() => setShowAIChat(!showAIChat)} /> {/* Corrected typo: showAICat -> showAIChat */}
          </div>
        </div>
      </div>
      {/* Optional: Add ReactQueryDevtools for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;

