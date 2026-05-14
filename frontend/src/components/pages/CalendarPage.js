import React from 'react';
import JournalCalendar from '../calendar/JournalCalendar';


const CalendarPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Journal Calendar</h1>
        <p className="text-gray-600">View your journal entries by date</p>
      </div>
      
      <JournalCalendar />
    </div>
  );
};

export default CalendarPage;