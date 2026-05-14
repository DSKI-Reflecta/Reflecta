import React from 'react';
import { PlusCircle } from 'lucide-react';

const FloatingButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex items-center p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
    >
      <PlusCircle className="h-6 w-6 mr-2" />
      <span className="hidden md:inline">New Entry</span>
    </button>
  );
};

export default FloatingButton;
