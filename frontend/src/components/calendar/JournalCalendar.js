import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react'; // Added Calendar and List icons for view toggle

// Accept journalEntries and goals as props
const JournalCalendar = ({ journalEntries, goals }) => {
  // State to manage the currently displayed month and year
  const [currentDate, setCurrentDate] = useState(new Date());
  // State to manage view mode (monthly or weekly)
  const [viewMode, setViewMode] = useState('monthly');

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
  const createMonthDaysArray = () => {
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
  
  // Create an array of days for the week view based on currentDate state
  const createWeekDaysArray = () => {
    const currentDay = new Date(currentDate);
    const day = currentDay.getDay(); // Get current day of week (0 = Sunday, 6 = Saturday)
    
    // Calculate the start date of the week (Sunday)
    const startDate = new Date(currentDay);
    startDate.setDate(currentDay.getDate() - day);
    
    const days = [];
    
    // Create 7 days starting from the calculated Sunday
    for (let i = 0; i < 7; i++) {
      const dateForLookup = new Date(startDate);
      dateForLookup.setDate(startDate.getDate() + i);
      
      // Get entries and goals for this specific date
      const entriesOnDay = getEntriesForDate(dateForLookup);
      const goalsOnDay = getGoalsForDate(dateForLookup);
      
      days.push({
        day: dateForLookup.getDate(),
        isCurrentMonth: dateForLookup.getMonth() === currentDate.getMonth(),
        isToday: dateForLookup.toDateString() === new Date().toDateString(),
        entries: entriesOnDay,
        goals: goalsOnDay,
        fullDate: dateForLookup
      });
    }
    
    return days;
  };

  // Create the appropriate days array based on view mode
  const days = viewMode === 'monthly' ? createMonthDaysArray() : createWeekDaysArray();

  // Get the appropriate header based on view mode
  const getHeaderString = () => {
    if (viewMode === 'monthly') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else {
      // For weekly view, show the date range
      const weekStart = new Date(days[0].fullDate);
      const weekEnd = new Date(days[6].fullDate);
      
      // If same month
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekStart.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
      } 
      // If different months but same year
      else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
        return `${weekStart.getDate()} ${weekStart.toLocaleString('default', { month: 'short' })} - ${weekEnd.getDate()} ${weekEnd.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
      } 
      // If different years
      else {
        return `${weekStart.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    }
  };
  
  const headerString = getHeaderString();

  // Handlers for navigation
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

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // Handle navigation based on view mode
  const handlePrevious = () => {
    if (viewMode === 'monthly') {
      goToPreviousMonth();
    } else {
      goToPreviousWeek();
    }
  };

  const handleNext = () => {
    if (viewMode === 'monthly') {
      goToNextMonth();
    } else {
      goToNextWeek();
    }
  };

  // Function to limit the number of items shown per day
  const getLimitedItems = (items, limit) => {
    // For weekly view, don't limit items
    if (viewMode === 'weekly') {
      return items;
    }
    
    // For monthly view, apply the limit (default: 2)
    limit = limit || 2;
    if (items.length <= limit) return items;
    return items.slice(0, limit);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4"> 
      {/* View Mode Toggle and Navigation Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevious} className="p-2 rounded-full hover:bg-gray-200">
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 mr-4">{headerString}</h2>
          
          {/* View Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('monthly')} 
              className={`flex items-center px-3 py-1 rounded-md ${viewMode === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Month</span>
            </button>
            <button 
              onClick={() => setViewMode('weekly')} 
              className={`flex items-center px-3 py-1 rounded-md ${viewMode === 'weekly' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              <List className="h-4 w-4 mr-1" />
              <span className="text-sm">Week</span>
            </button>
          </div>
        </div>
        
        <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200">
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      <div className={`grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden ${viewMode === 'weekly' ? 'auto-rows-auto' : ''}`}> 
        {weekdays.map(day => (
          <div key={day} className="bg-gray-100 text-center py-2 font-medium text-gray-700 text-sm">{day}</div>
        ))}

        {days.map((dayInfo, index) => (
          <div
            key={index}
            className={`bg-white border border-gray-100 ${viewMode === 'weekly' ? 'min-h-64 h-auto' : 'h-32'} p-1 flex flex-col overflow-hidden
                       ${dayInfo.isCurrentMonth ? '' : 'text-gray-400 bg-gray-50'}
                       ${dayInfo.isToday ? 'border-blue-500 border-2' : ''}
                       hover:bg-gray-100 transition-colors duration-100`}
          >
            <div className="flex justify-between items-center mb-1"> 
              <span className={`font-medium ${dayInfo.isToday ? 'text-blue-600' : 'text-gray-900'}`}>{dayInfo.day}</span>
              {viewMode === 'weekly' && 
                <span className="text-xs text-gray-500">
                  {dayInfo.fullDate.toLocaleString('default', { month: 'short' })}
                </span>
              }
            </div>

            {/* Display entries and goals */}
            <div className="flex flex-col space-y-1 flex-grow"> 
                {/* Journal Entries */}
                {getLimitedItems(dayInfo.entries).map(entry => (
                    <div key={`entry-${entry.id}`} className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate" title={entry.title}>
                        Entry: {entry.title}
                    </div>
                ))}
                
                {/* Goals */}
                {getLimitedItems(dayInfo.goals).map(goal => (
                    <div key={`goal-${goal.id}`} className="bg-green-100 text-green-800 text-xs p-1 rounded truncate" title={goal.title}>
                        Goal: {goal.title}
                    </div>
                ))}
                
                {/* Show count of additional items if there are more than the limit (monthly view only) */}
                {(viewMode === 'monthly' && dayInfo.entries.length + dayInfo.goals.length > 4) && (
                    <div className="text-xs text-gray-500 font-medium">
                        +{dayInfo.entries.length + dayInfo.goals.length - 4} more
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalCalendar;
