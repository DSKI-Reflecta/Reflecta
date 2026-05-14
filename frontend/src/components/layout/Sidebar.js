import React from 'react';
import { BookOpen, Calendar, CheckSquare, User } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-center md:text-left">Reflecta</h1>
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