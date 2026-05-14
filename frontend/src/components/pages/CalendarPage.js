import React, { useEffect } from "react";
import JournalCalendar from "../calendar/JournalCalendar";

import {
  fetchCalendarData,
  addCalendarUpdateListener,
  removeCalendarUpdateListener,
} from "../../api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const CalendarPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["calendarData"],
    queryFn: fetchCalendarData,
    staleTime: 5 * 60 * 1000,
  });

  const journalEntries = data?.journalEntries || [];
  const goals = data?.goals || [];

  useEffect(() => {
    const unsubscribe = addCalendarUpdateListener((updatedData) => {
      queryClient.invalidateQueries(["calendarData"]);
    });

    return () => {
      removeCalendarUpdateListener(unsubscribe);
    };
  }, [queryClient]);

  return (
    <div className="calendar-page-container p-4">
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500 italic">
            Loading calendar data...
          </p>
        </div>
      )}

      {isError && (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-red-500 italic">
            Error: {error?.message || "Failed to load calendar data"}
          </p>
        </div>
      )}

      {!isLoading && !isError && data && (
        <JournalCalendar journalEntries={journalEntries} goals={goals} />
      )}
    </div>
  );
};

export default CalendarPage;
