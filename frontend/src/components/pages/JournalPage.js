import React, { useState, useEffect } from 'react';
import EntryList from '../journal/EntryList';
import EntryForm from '../journal/EntryForm';
import EntryDetail from '../journal/EntryDetail'; // Import the new detail component
import Modal from '../common/Modal'; // Assuming you have a Modal component
import { Search as SearchIcon, Calendar as CalendarIcon } from 'lucide-react';
// Import API functions
import {
    fetchJournalEntries,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry
} from '../../api/api';

const JournalPage = () => {
  const [showEntryFormModal, setShowEntryFormModal] = useState(false); // Renamed form modal state
  const [showEntryDetailModal, setShowEntryDetailModal] = useState(false); // New state for detail modal
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null); // New state for the selected entry for detail view
  const [allEntries, setAllEntries] = useState([]); // State to hold ALL journal entries fetched from API
  const [filteredEntries, setFilteredEntries] = useState([]); // State to hold filtered entries for display
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // State for search and filter criteria
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Removed the state for showAdvancedFilters


  // --- Data Fetching ---

  // Fetch entries from the backend using the API service
  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEntries = await fetchJournalEntries();
      setAllEntries(fetchedEntries); // Store all fetched entries
      // Do NOT set filteredEntries here initially, useEffect will handle the initial filter
    } catch (error) {
      console.error("Error loading entries:", error);
      setError("Failed to load journal entries.");
      setAllEntries([]); // Ensure state is empty on error
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---

  useEffect(() => {
    const filterEntries = () => {
      let updatedFilteredEntries = allEntries;

      // Filter by search term (title)
      if (searchTerm) {
        updatedFilteredEntries = updatedFilteredEntries.filter(entry =>
          entry.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by date range
      if (startDate || endDate) {
        updatedFilteredEntries = updatedFilteredEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          let isWithinRange = true;

          if (startDate) {
            const start = new Date(startDate);
            // Set time to start of day for accurate comparison
            start.setHours(0, 0, 0, 0);
            if (entryDate < start) {
              isWithinRange = false;
            }
          }

          if (endDate) {
            const end = new Date(endDate);
             // Set time to end of day for accurate comparison
            end.setHours(23, 59, 59, 999);
            if (entryDate > end) {
              isWithinRange = false;
            }
          }

          return isWithinRange;
        });
      }

      // Sort entries by date descending before setting filtered state
      const sortedFilteredEntries = updatedFilteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setFilteredEntries(sortedFilteredEntries);
    };

    filterEntries(); // Apply filter whenever search term, start date, end date, or allEntries changes
  }, [searchTerm, startDate, endDate, allEntries]); // Depend on filter criteria and allEntries


  // --- API Interaction Handlers ---

  // Create or update an entry using the API service
  const handleSaveEntry = async (entryToSave) => {
    setError(null); // Clear previous errors
    try {
      let savedEntry;
      // Prepare data to send, matching backend model expectations
      const entryData = {
          content: entryToSave.content,
          sentiment_level: entryToSave.sentiment,
          sleep_quality: entryToSave.sleep,
          stress_level: entryToSave.stress,
          social_engagement: entryToSave.socialEngagement,
          date: entryToSave.date,
          title: entryToSave.title
      };

      if (entryToSave.id) {
        // Update existing entry
        savedEntry = await updateJournalEntry(entryToSave.id, entryData);
        // Update the entry in the local state (allEntries)
        setAllEntries(allEntries.map(entry =>
          entry.id === savedEntry.id ? savedEntry : entry
        ));
      } else {
        // Create new entry
        savedEntry = await createJournalEntry(entryData);
        // Add new entry to the top of the local state (allEntries)
        setAllEntries([savedEntry, ...allEntries]);
      }

      closeFormModal(); // Close form modal on successful save

    } catch (error) {
      console.error("Error saving entry:", error);
      setError(`Failed to save entry: ${error.message}`);
      // Keep modal open to allow user to fix input or try again
    }
  };

  // Delete an entry using the API service
  const handleDeleteEntry = async (entryId) => {
      if (window.confirm("Are you sure you want to delete this entry?")) {
          setError(null); // Clear previous errors
          try {
              await deleteJournalEntry(entryId);
              // Remove the entry from the local state (allEntries)
              setAllEntries(allEntries.filter(entry => entry.id !== entryId));
          } catch (error) {
              console.error("Error deleting entry:", error);
              setError(`Failed to delete entry: ${error.message}`);
          }
      }
  };


  // --- Component Lifecycle and Modal Handling ---

  // Load entries when the component mounts
  useEffect(() => {
    loadEntries();
  }, []);

  // Handler for opening the Add Entry form modal
  const openAddEntryModal = () => {
    setEditingEntry(null);
    setShowEntryFormModal(true);
  };

  // Handler for opening the Edit Entry form modal
  const openEditEntryModal = (entry) => {
    setEditingEntry(entry);
    setShowEntryFormModal(true);
  };

  // Handler for selecting an entry to view details
  const handleSelectEntry = (entry) => {
      setSelectedEntry(entry);
      setShowEntryDetailModal(true);
  };

  // Handler for closing the Form modal
  const closeFormModal = () => {
    setShowEntryFormModal(false);
    setEditingEntry(null); // Clear editingEntry when form modal closes
    setError(null); // Clear errors when form modal closes
  };

   // Handler for closing the Detail modal
  const closeDetailModal = () => {
    setShowEntryDetailModal(false);
    setSelectedEntry(null); // Clear selectedEntry when detail modal closes
  };


  return (
    <div>
      {/* Header with Title and New Entry Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
        {/* New Entry Button - Positioned like the New Goal button */}
        <button
          onClick={openAddEntryModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Entry
        </button>
      </div>

      {/* Search and Filter Section - Styled to match image */}
      {/* Added bg-white, rounded-lg, shadow, and ring/ring-blue for the blue outline effect */}
      {/* Used flex and space-x for horizontal layout */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow ring-1 ring-blue-500 ring-opacity-50 flex flex-col md:flex-row gap-4 items-center"> {/* Adjusted styling and layout */}

          {/* Search by Title */}
          <div className="flex-1"> {/* Use flex-1 to allow it to grow */}
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">Search Title:</label>
              <div className="relative mt-1"> {/* Added relative and mt-1 */}
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> {/* Added pointer-events-none */}
                  <input
                      type="text"
                      id="searchTerm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title..." // Placeholder from image
                      className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" // Added padding-left for icon
                  />
              </div>
          </div>

          {/* Start Date */}
          <div className="flex-1"> {/* Use flex-1 */}
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date:</label>
              <div className="relative mt-1"> {/* Added relative and mt-1 */}
                   <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> {/* Calendar icon */}
                   <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" // Added padding-left
                  />
              </div>
          </div>

          {/* End Date */}
          <div className="flex-1"> {/* Use flex-1 */}
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date:</label>
              <div className="relative mt-1"> {/* Added relative and mt-1 */}
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> {/* Calendar icon */}
                  <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" // Added padding-left
                  />
              </div>
          </div>

          {/* Mood Rating (Placeholder) - Removed as per request */}
          {/*
          <div>
               <label htmlFor="moodRating" className="block text-sm font-medium text-gray-700 mb-1">Mood Rating</label>
               <select
                   id="moodRating"
                   name="moodRating"
                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                   // Add value and onChange handlers
               >
                    <option value="">Any rating</option>
                    {/* Add options based on your mood scale (e.g., 1-5) }
               </select>
          </div>
          */}
      </div>


      {/* Loading and Error Messages */}
      {loading && <p className="text-center text-gray-500">Loading entries...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Entry List - Pass FILTERED entries and handlers */}
      {!loading && !error && (
          <EntryList
            entries={filteredEntries} // Pass the filtered entries
            onEditEntry={openEditEntryModal} // Edit button opens form modal
            onDeleteEntry={handleDeleteEntry} // Delete button triggers delete
            onSelectEntry={handleSelectEntry} // Clicking card opens detail modal
          />
      )}


      {/* Modal for Add/Edit Entry Form */}
      {showEntryFormModal && (
        <Modal title={editingEntry ? "Edit Entry" : "New Journal Entry"} onClose={closeFormModal}>
          <EntryForm
            onClose={closeFormModal}
            onSave={handleSaveEntry}
            editEntry={editingEntry}
          />
        </Modal>
      )}

       {/* Modal for Journal Entry Detail View */}
       {showEntryDetailModal && (
           <Modal title="Journal Entry Detail" onClose={closeDetailModal}> {/* Title for detail modal */}
               <EntryDetail
                   entry={selectedEntry} // Pass the selected entry
                   onClose={closeDetailModal} // Pass the close handler
               />
           </Modal>
       )}
    </div>
  );
};

export default JournalPage;