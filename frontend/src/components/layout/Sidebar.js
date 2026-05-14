import React from 'react';
import { BookOpen, Calendar, CheckSquare, User } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Adjusted padding for potential vertical alignment with page headers */}
      <div className="px-4 py-[0.37rem] border-b border-gray-200 flex items-center justify-center md:justify-start"> {/* Added flex and alignment classes */}
        {/* Replaced the old SVG with the new SVG logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 60"
          className="h-10 md:h-12 w-auto" // Adjusted Tailwind classes for larger height
        >
          {/* Main text */}
          <text x="60" y="38" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="600" font-size="24" fill="#333333">Reflecta</text>

          {/* Mirror/reflection icon */}
          <g>
            {/* Book/journal shape */}
            <rect x="10" y="15" width="40" height="30" rx="2" ry="2" fill="#4169E1" />

            {/* Page divider line */}
            <line x1="30" y1="15" x2="30" y2="45" stroke="#FFFFFF" stroke-width="1" />

            {/* Reflection element */}
            <path d="M20 25 Q 25 20, 30 25 Q 35 30, 40 25" stroke="#FFFFFF" stroke-width="2" fill="none" />

            {/* Reflection element (mirrored) */}
            <path d="M20 35 Q 25 40, 30 35 Q 35 30, 40 35" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6" />
          </g>
        </svg>
      </div>

      <nav className="flex-1 pt-2">
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center w-full p-3 ${activeTab === 'journal' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <BookOpen className="h-5 w-5 mx-auto md:ml-2 md:mr-3" />
          <span className="hidden md:inline">Journal</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center w-full p-3 ${activeTab === 'goals' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <CheckSquare className="h-5 w-5 mx-auto md:ml-2 md:mr-3" />
          <span className="hidden md:inline">Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center w-full p-3 ${activeTab === 'calendar' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <Calendar className="h-5 w-5 mx-auto md:ml-2 md:mr-3" />
          <span className="hidden md:inline">Calendar</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center justify-center md:justify-start w-full p-2 rounded-full bg-gray-100 hover:bg-gray-200">
          <User className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
