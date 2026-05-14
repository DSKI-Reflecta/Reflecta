import React from "react";

const Header = ({ activeTab }) => {
  const titles = {
    journal: "My Journal",
    goals: "My Goals",
    calendar: "Calendar",
    analytics: "Analytics",
    admin: "Admin",
  };

  return (
    <header className="flex items-center px-8 py-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {titles[activeTab]}
      </h2>
    </header>
  );
};

export default Header;
