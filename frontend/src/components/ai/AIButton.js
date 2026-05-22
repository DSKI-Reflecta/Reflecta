import React from "react";
import { MessageCircle, Lock } from "lucide-react";

const FloatingAIButton = ({ onClick, locked = false }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 flex items-center p-3 rounded-full shadow-lg transition-all ${
        locked
          ? "bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-gray-200"
          : "bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-purple-200"
      }`}
    >
      <MessageCircle className="h-6 w-6 mr-2" />
      <span className="hidden md:inline">Reflecta AI</span>
      {locked && (
        <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">
          <Lock size={10} /> Pro
        </span>
      )}
    </button>
  );
};

export default FloatingAIButton;
