import React from "react";
import { BookOpen, Calendar, CheckSquare, BarChart, Shield, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { id: "journal", icon: BookOpen, label: "Journal" },
    { id: "goals", icon: CheckSquare, label: "Goals" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "analytics", icon: BarChart, label: "Analytics" },
    ...(user?.is_admin ? [{ id: "admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <div className="w-16 md:w-64 bg-gray-50 flex flex-col">
      <div className="px-4 py-5 flex items-center justify-center md:justify-start">
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
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="400"
            fontSize="24"
            fill="#171717"
          >
            Reflecta
          </text>
        </svg>
      </div>

      <nav className="flex-1 pt-4 px-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center w-full p-3 mb-1 rounded-xl transition-all duration-150 ${
              activeTab === id
                ? "bg-purple-100 text-purple-700 font-medium"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Icon className="h-5 w-5 mx-auto md:mx-0 md:mr-3" />
            <span className="hidden md:inline text-sm">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-2 pb-4">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut className="h-5 w-5 mx-auto md:mx-0 md:mr-3" />
          <span className="hidden md:inline text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
