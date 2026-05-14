import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingAIButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center p-3 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-lg transition-all"
    >
      <MessageCircle className="h-6 w-6 mr-2" />
      <span className="hidden md:inline">AI Assistant</span>
    </button>
  );
};

export default FloatingAIButton;
