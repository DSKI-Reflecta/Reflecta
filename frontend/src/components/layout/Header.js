import React from 'react';

const Header = ({ activeTab }) => {
  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between p-4">
      <h2 className="text-xl font-semibold">
        {activeTab === 'journal' && "My Journal"}
        {activeTab === 'goals' && "My Goals"}
        {activeTab === 'calendar' && "Journal Calendar"}
      </h2>
    </header>
  );
};

export default Header;
