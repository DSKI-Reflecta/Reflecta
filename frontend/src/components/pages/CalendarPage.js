import React, { useEffect } from 'react';
import JournalCalendar from '../calendar/JournalCalendar';

// Import API function and react-query hooks
import { fetchCalendarData, addCalendarUpdateListener, removeCalendarUpdateListener } from '../../api/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const CalendarPage = () => {
  // Get the queryClient instance
  const queryClient = useQueryClient();

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

  // Set up real-time updates listener
  useEffect(() => {
    // Add listener for calendar data updates
    const unsubscribe = addCalendarUpdateListener((updatedData) => {
      // This will trigger a refetch of the data when updates occur
      queryClient.invalidateQueries(['calendarData']);
    });

    // Clean up listener on component unmount
    return () => {
      removeCalendarUpdateListener(unsubscribe);
    };
  }, [queryClient]);

  return (
    <div className="calendar-page-container p-4">

      {/* Display loading, error, or calendar */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500 italic">Loading calendar data...</p>
        </div>
      )}

      {isError && (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-red-500 italic">
            Error: {error?.message || 'Failed to load calendar data'}
          </p>
        </div>
      )}

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