import React from "react";
import { BookOpen, Calendar, CheckSquare } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-[0.37rem] border-b border-gray-200 flex items-center justify-center md:justify-start">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 60"
          className="h-10 md:h-12 w-auto"
        >
          <defs>
            <linearGradient
              id="purpleGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#9B30FF" />
              <stop offset="100%" stopColor="#6A0DAD" />
            </linearGradient>
          </defs>

          <g>
            <rect
              x="10"
              y="10"
              width="40"
              height="40"
              rx="10"
              ry="10"
              fill="url(#purpleGradient)"
            />
            <line
              x1="30"
              y1="10"
              x2="30"
              y2="50"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M20 25 Q 25 18, 30 25 Q 35 32, 40 25"
              stroke="#FFFFFF"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M20 35 Q 25 42, 30 35 Q 35 28, 40 35"
              stroke="#FFFFFF"
              strokeWidth="2"
              fill="none"
              opacity="0.7"
            />
          </g>

          <text
            x="60"
            y="38"
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            fontWeight="600"
            fontSize="24"
            fill="#333333"
          >
            Reflecta
          </text>
        </svg>
      </div>

      <nav className="flex-1 pt-2">
        <button
          onClick={() => setActiveTab("journal")}
          className={`flex items-center w-full p-3 ${
            activeTab === "journal"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-100"
          }`}
        >
          <BookOpen className="h-5 w-5 mx-auto md:ml-2 md:mr-3" />
          <span className="hidden md:inline">Journal</span>
        </button>

        <button
          onClick={() => setActiveTab("goals")}
          className={`flex items-center w-full p-3 ${
            activeTab === "goals"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-100"
          }`}
        >
          <CheckSquare className="h-5 w-5 mx-auto md:ml-2 md:mr-3" />
          <span className="hidden md:inline">Goals</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center w-full p-3 ${
            activeTab === "calendar"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-100"
          }`}
        >
          <Calendar className="h-5 w-5 mx-auto md:ml-2 md:mr-3" />
          <span className="hidden md:inline">Calendar</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
