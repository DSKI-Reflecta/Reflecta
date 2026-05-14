import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons for navigation

// Accept journalEntries and goals as props
const JournalCalendar = ({ journalEntries, goals }) => {
  // State to manage the currently displayed month and year
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to check if a given date has a journal entry
  const getEntriesForDate = (date) => {
    // Normalize the input date to midnight for comparison
    const normalizedInputDate = new Date(date);
    normalizedInputDate.setHours(0, 0, 0, 0);

    return journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      // Normalize entry date to midnight for comparison
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === normalizedInputDate.getTime();
    });
  };

   // Helper to get goals for a given date (target date)
  const getGoalsForDate = (date) => {
      // Normalize the input date to midnight for comparison
      const normalizedInputDate = new Date(date);
      normalizedInputDate.setHours(0, 0, 0, 0);

      return goals.filter(goal => {
          // Only consider goals with a target date
          if (!goal.targetDate) return false;
          const goalDate = new Date(goal.targetDate);
           // Normalize goal date to midnight for comparison
          goalDate.setHours(0, 0, 0, 0);
           // Check if the date matches, ignoring time
          return goalDate.getTime() === normalizedInputDate.getTime();
      });
  };


  // Days of the week
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Create an array of days for the month view based on currentDate state
  const createDaysArray = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const monthStart = new Date(year, month, 1);
    const dayOfWeekStart = monthStart.getDay(); // 0 for Sunday, 6 for Saturday

    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get number of days in current month
    const daysInPrevMonth = new Date(year, month, 0).getDate(); // Get number of days in previous month

    const days = [];
    const totalGridCells = 6 * 7; // Aim for a 6-week grid (42 cells) to cover all months

    for (let i = 0; i < totalGridCells; i++) {
      const day = i - dayOfWeekStart + 1; // Calculate the day number relative to the start of the grid

      let displayDate;
      let isCurrentMonth = false;
      let dateForLookup; // Date object to use for checking entries/goals

      if (day > 0 && day <= daysInMonth) {
        // Current month
        displayDate = day;
        isCurrentMonth = true;
        dateForLookup = new Date(year, month, day);
      } else if (day <= 0) {
        // Previous month
        displayDate = daysInPrevMonth + day;
        dateForLookup = new Date(year, month - 1, displayDate);
      } else {
        // Next month
        displayDate = day - daysInMonth;
        dateForLookup = new Date(year, month + 1, displayDate);
      }

       // Get entries and goals for this specific date
       const entriesOnDay = getEntriesForDate(dateForLookup);
       const goalsOnDay = getGoalsForDate(dateForLookup);


      days.push({
        day: displayDate,
        isCurrentMonth,
        isToday: dateForLookup.toDateString() === new Date().toDateString(), // Check if it's today
        entries: entriesOnDay,
        goals: goalsOnDay,
        fullDate: dateForLookup // Store the full date object
      });
    }

     // Trim the last row if it's entirely from the next month and not needed
     // This check is more accurate now based on the full date
     const lastRow = days.slice(35);
     if (lastRow.every(dayInfo => dayInfo.fullDate.getMonth() !== month)) {
         return days.slice(0, 35);
     }


    return days;
  };

  const days = createDaysArray();

  // Get the name of the current month and year
  const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Handlers for month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };


  return (
    <div className="bg-white rounded-lg shadow p-4"> {/* Added padding */}
      {/* Month Navigation Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-200">
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{monthYearString}</h2>
        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-200">
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden"> {/* Added border and rounded corners */}
        {weekdays.map(day => (
          <div key={day} className="bg-gray-100 text-center py-2 font-medium text-gray-700 text-sm">{day}</div> /* Adjusted background and text size */
        ))}

        {days.map((dayInfo, index) => (
          <div
            key={index}
            className={`bg-white border border-gray-100 h-32 p-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                       ${dayInfo.isCurrentMonth ? '' : 'text-gray-400 bg-gray-50'}
                       ${dayInfo.isToday ? 'border-blue-500 border-2' : ''}
                       hover:bg-gray-100 transition-colors duration-100`} // Added hover effect
          >
            <div className="flex justify-between items-center mb-1"> {/* Added margin-bottom */}
              <span className={`font-medium ${dayInfo.isToday ? 'text-blue-600' : 'text-gray-900'}`}>{dayInfo.day}</span> {/* Highlight today's number */}
            </div>

            {/* Display mini-cards for entries and goals */}
            <div className="flex flex-col space-y-1 flex-grow"> {/* flex-grow to push content down */}
                {/* Journal Entries */}
                {dayInfo.entries.map(entry => (
                    <div key={`entry-${entry.id}`} className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate" title={entry.title}>
                        Entry: {entry.title}
                    </div>
                ))}
                {/* Goals */}
                 {dayInfo.goals.map(goal => (
                    <div key={`goal-${goal.id}`} className="bg-green-100 text-green-800 text-xs p-1 rounded truncate" title={goal.title}>
                        Goal: {goal.title}
                    </div>
                ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalCalendar;
