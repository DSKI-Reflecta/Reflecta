import React, { useState, useEffect } from 'react';
import JournalCalendar from '../calendar/JournalCalendar';


// Import API function and react-query hook
import { fetchCalendarData } from '../../api/api';
import { useQuery } from '@tanstack/react-query';


const CalendarPage = () => {
  // --- Data Fetching with useQuery ---
  const { data, isLoading, isError, error } = useQuery({
      queryKey: ['calendarData'], // Unique key for this query
      queryFn: fetchCalendarData, // Function to fetch data
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      // initialData: { journalEntries: [], goals: [] } // Optional: provide initial data
  });

  // Destructure data once it's available
  const journalEntries = data?.journalEntries || [];
  const goals = data?.goals || [];


  return (
    <div>

      {/* Display loading, error, or calendar */}
      {isLoading && <p className="text-center text-gray-500 italic">Loading calendar data...</p>} {/* Use isLoading from useQuery */}
      {isError && <p className="text-center text-red-500 italic">Error: {error?.message}</p>} {/* Use isError and error from useQuery */}
      {/* Render only when not loading and no error, and data is available */}
      {!isLoading && !isError && data && (
        <JournalCalendar
          journalEntries={journalEntries}
          goals={goals}
        />
      )}
    </div>
  );
};

export default CalendarPage;

