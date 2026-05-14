import React, { useState, useEffect } from 'react';
import JournalCalendar from '../calendar/JournalCalendar';

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:8000'; // Adjust if your backend runs on a different port or host

const CalendarPage = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch both journal entries and goals
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch journal entries
      const entriesResponse = await fetch(`${API_BASE_URL}/journal/entries/`);
      if (!entriesResponse.ok) {
        throw new Error(`HTTP error fetching entries! status: ${entriesResponse.status}`);
      }
      const entriesData = await entriesResponse.json();
      setJournalEntries(entriesData);

      // Fetch goals
      const goalsResponse = await fetch(`${API_BASE_URL}/goals/`);
      if (!goalsResponse.ok) {
        throw new Error(`HTTP error fetching goals! status: ${goalsResponse.status}`);
      }
      const goalsData = await goalsResponse.json();
      setGoals(goalsData);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Journal Calendar</h1>
        <p className="text-gray-600">View your journal entries and goals by date</p>
      </div>

      {/* Display loading, error, or calendar */}
      {loading && <p className="text-center text-gray-500 italic">Loading calendar data...</p>}
      {error && <p className="text-center text-red-500 italic">Error: {error}</p>}
      {!loading && !error && (
        <JournalCalendar
          journalEntries={journalEntries}
          goals={goals}
        />
      )}
    </div>
  );
};

export default CalendarPage;
