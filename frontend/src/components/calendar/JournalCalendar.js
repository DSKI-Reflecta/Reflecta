import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";

const JournalCalendar = ({ journalEntries, goals }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("monthly");

  const getEntriesForDate = (date) => {
    const normalizedInputDate = new Date(date);
    normalizedInputDate.setHours(0, 0, 0, 0);

    return journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === normalizedInputDate.getTime();
    });
  };

  const getGoalsForDate = (date) => {
    const normalizedInputDate = new Date(date);
    normalizedInputDate.setHours(0, 0, 0, 0);

    return goals.filter((goal) => {
      if (!goal.targetDate) return false;
      const goalDate = new Date(goal.targetDate);
      goalDate.setHours(0, 0, 0, 0);
      return goalDate.getTime() === normalizedInputDate.getTime();
    });
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const createMonthDaysArray = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthStart = new Date(year, month, 1);
    const dayOfWeekStart = monthStart.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    const totalGridCells = 6 * 7;

    for (let i = 0; i < totalGridCells; i++) {
      const day = i - dayOfWeekStart + 1;

      let displayDate;
      let isCurrentMonth = false;
      let dateForLookup;

      if (day > 0 && day <= daysInMonth) {
        displayDate = day;
        isCurrentMonth = true;
        dateForLookup = new Date(year, month, day);
      } else if (day <= 0) {
        displayDate = daysInPrevMonth + day;
        dateForLookup = new Date(year, month - 1, displayDate);
      } else {
        displayDate = day - daysInMonth;
        dateForLookup = new Date(year, month + 1, displayDate);
      }

      const entriesOnDay = getEntriesForDate(dateForLookup);
      const goalsOnDay = getGoalsForDate(dateForLookup);

      days.push({
        day: displayDate,
        isCurrentMonth,
        isToday: dateForLookup.toDateString() === new Date().toDateString(),
        entries: entriesOnDay,
        goals: goalsOnDay,
        fullDate: dateForLookup,
      });
    }

    const lastRow = days.slice(35);
    if (lastRow.every((dayInfo) => dayInfo.fullDate.getMonth() !== month)) {
      return days.slice(0, 35);
    }

    return days;
  };

  const createWeekDaysArray = () => {
    const currentDay = new Date(currentDate);
    const day = currentDay.getDay();

    const startDate = new Date(currentDay);
    startDate.setDate(currentDay.getDate() - day);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const dateForLookup = new Date(startDate);
      dateForLookup.setDate(startDate.getDate() + i);

      const entriesOnDay = getEntriesForDate(dateForLookup);
      const goalsOnDay = getGoalsForDate(dateForLookup);

      days.push({
        day: dateForLookup.getDate(),
        isCurrentMonth: dateForLookup.getMonth() === currentDate.getMonth(),
        isToday: dateForLookup.toDateString() === new Date().toDateString(),
        entries: entriesOnDay,
        goals: goalsOnDay,
        fullDate: dateForLookup,
      });
    }

    return days;
  };

  const days =
    viewMode === "monthly" ? createMonthDaysArray() : createWeekDaysArray();

  const getHeaderString = () => {
    if (viewMode === "monthly") {
      return currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    } else {
      const weekStart = new Date(days[0].fullDate);
      const weekEnd = new Date(days[6].fullDate);

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekStart.toLocaleString(
          "default",
          { month: "long", year: "numeric" }
        )}`;
      } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
        return `${weekStart.getDate()} ${weekStart.toLocaleString("default", {
          month: "short",
        })} - ${weekEnd.getDate()} ${weekEnd.toLocaleString("default", {
          month: "short",
          year: "numeric",
        })}`;
      } else {
        return `${weekStart.toLocaleString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} - ${weekEnd.toLocaleString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      }
    }
  };

  const headerString = getHeaderString();

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToPreviousWeek = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const handlePrevious = () => {
    if (viewMode === "monthly") {
      goToPreviousMonth();
    } else {
      goToPreviousWeek();
    }
  };

  const handleNext = () => {
    if (viewMode === "monthly") {
      goToNextMonth();
    } else {
      goToNextWeek();
    }
  };

  const getLimitedItems = (items, limit) => {
    if (viewMode === "weekly") {
      return items;
    }

    limit = limit || 2;
    if (items.length <= limit) return items;
    return items.slice(0, limit);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>

        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 mr-4">
            {headerString}
          </h2>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("monthly")}
              className={`flex items-center px-3 py-1 rounded-md ${
                viewMode === "monthly" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Month</span>
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`flex items-center px-3 py-1 rounded-md ${
                viewMode === "weekly" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              <List className="h-4 w-4 mr-1" />
              <span className="text-sm">Week</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      <div
        className={`grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden ${
          viewMode === "weekly" ? "auto-rows-auto" : ""
        }`}
      >
        {weekdays.map((day) => (
          <div
            key={day}
            className="bg-gray-100 text-center py-2 font-medium text-gray-700 text-sm"
          >
            {day}
          </div>
        ))}

        {days.map((dayInfo, index) => (
          <div
            key={index}
            className={`bg-white border border-gray-100 ${
              viewMode === "weekly" ? "min-h-64 h-auto" : "h-32"
            } p-1 flex flex-col overflow-hidden
                       ${
                         dayInfo.isCurrentMonth
                           ? ""
                           : "text-gray-400 bg-gray-50"
                       }
                       ${dayInfo.isToday ? "border-blue-500 border-2" : ""}
                       hover:bg-gray-100 transition-colors duration-100`}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`font-medium ${
                  dayInfo.isToday ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {dayInfo.day}
              </span>
              {viewMode === "weekly" && (
                <span className="text-xs text-gray-500">
                  {dayInfo.fullDate.toLocaleString("default", {
                    month: "short",
                  })}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1 flex-grow">
              {getLimitedItems(dayInfo.entries).map((entry) => (
                <div
                  key={`entry-${entry.id}`}
                  className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate"
                  title={entry.title}
                >
                  Entry: {entry.title}
                </div>
              ))}

              {getLimitedItems(dayInfo.goals).map((goal) => (
                <div
                  key={`goal-${goal.id}`}
                  className="bg-green-100 text-green-800 text-xs p-1 rounded truncate"
                  title={goal.title}
                >
                  Goal: {goal.title}
                </div>
              ))}

              {viewMode === "monthly" &&
                dayInfo.entries.length + dayInfo.goals.length > 4 && (
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
