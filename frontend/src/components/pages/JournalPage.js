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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define possible sentiment levels for the filter dropdown
const sentimentOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'Terrible' },
    { value: '2', label: 'Bad' },
    { value: '3', label: 'Okay' },
    { value: '4', label: 'Good' },
    { value: '5', label: 'Great' },
];

// Define possible sleep quality levels for the filter dropdown
const sleepOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'Very Poor' },
    { value: '2', label: 'Poor' },
    { value: '3', label: 'Fair' },
    { value: '4', label: 'Good' },
    { value: '5', label: 'Excellent' },
];

// Define possible stress levels for the filter dropdown
const stressOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'Very High' },
    { value: '2', label: 'High' },
    { value: '3', label: 'Moderate' },
    { value: '4', label: 'Low' },
    { value: '5', label: 'Very Low' },
];

// Define possible social engagement levels for the filter dropdown
const socialEngagementOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'Very Isolated' },
    { value: '2', label: 'Isolated' },
    { value: '3', label: 'Neutral' },
    { value: '4', label: 'Social' },
    { value: '5', label: 'Very Social' },
];



const JournalPage = () => {
  const [showEntryFormModal, setShowEntryFormModal] = useState(false); // Renamed form modal state
  const [showEntryDetailModal, setShowEntryDetailModal] = useState(false); // New state for detail modal
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null); // New state for the selected entry for detail view

  // State for search and filter criteria
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // States for filter dropdowns
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [sleepFilter, setSleepFilter] = useState('');
  const [stressFilter, setStressFilter] = useState('');
  const [socialEngagementFilter, setSocialEngagementFilter] = useState('');


  // State for local error handling (for mutations)
  const [error, setError] = useState(null);


  // Get QueryClient instance
  const queryClient = useQueryClient();

  // --- Data Fetching with useQuery ---
  const { data: allEntries, isLoading, isError, error: fetchError } = useQuery({
      queryKey: ['journalEntries'], // Unique key for this query
      queryFn: fetchJournalEntries, // Function to fetch data
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      // initialData: [] // Optional: provide initial data if available
  });


  // --- Filtering Logic (applied to fetched data) ---
  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    if (!allEntries) {
        setFilteredEntries([]); // Handle case where allEntries is not yet loaded
        return;
    }

    let updatedFilteredEntries = allEntries;

    // Filter by search term (title)
    if (searchTerm) {
      updatedFilteredEntries = updatedFilteredEntries.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by sentiment
    if (sentimentFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(entry =>
        entry.sentiment_level !== null && entry.sentiment_level !== undefined &&
        String(entry.sentiment_level) === sentimentFilter
      );
    }

    // Filter by sleep quality
    if (sleepFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(entry =>
        entry.sleep_quality !== null && entry.sleep_quality !== undefined &&
        String(entry.sleep_quality) === sleepFilter
      );
    }

    // Filter by stress level
    if (stressFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(entry =>
        entry.stress_level !== null && entry.stress_level !== undefined &&
        String(entry.stress_level) === stressFilter
      );
    }

    // Filter by social engagement
    if (socialEngagementFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(entry =>
        entry.social_engagement !== null && entry.social_engagement !== undefined &&
        String(entry.social_engagement) === socialEngagementFilter
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

  }, [searchTerm, startDate, endDate, sentimentFilter, sleepFilter, stressFilter, socialEngagementFilter, allEntries]); // Depend on ALL filter criteria and allEntries


  // --- Data Mutations with useMutation ---

  // Mutation for creating an entry
  const createEntryMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      // Invalidate the 'journalEntries' query to refetch data after creation
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      closeFormModal(); // Close modal on success
    },
    onError: (err) => {
        console.error("Error creating entry:", err);
        setError(`Failed to create entry: ${err.message}`); // Use local setError
         // Keep modal open to allow user to fix input or try again
    }
  });

  // Mutation for updating an entry
  const updateEntryMutation = useMutation({
    mutationFn: ({ entryId, entryData }) => updateJournalEntry(entryId, entryData),
    onSuccess: () => {
      // Invalidate the 'journalEntries' query to refetch data after update
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      closeFormModal(); // Close modal on success
    },
     onError: (err) => {
        console.error("Error updating entry:", err);
        setError(`Failed to update entry: ${err.message}`); // Use local setError
         // Keep modal open to allow user to fix input or try again
    }
  });

  // Mutation for deleting an entry
  const deleteEntryMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      // Invalidate the 'journalEntries' query to refetch data after deletion
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
       // Close the detail modal if it's open after deletion
      if (showEntryDetailModal) {
          closeDetailModal();
      }
    },
     onError: (err) => {
        console.error("Error deleting entry:", err);
        setError(`Failed to delete entry: ${err.message}`); // Use local setError
    }
  });


  // --- API Interaction Handlers (using mutations) ---

  const handleSaveEntry = async (entryToSave) => {
    setError(null); // Clear previous local errors before mutation
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
      // Update existing entry using mutation
      updateEntryMutation.mutate({ entryId: entryToSave.id, entryData });
    } else {
      // Create new entry using mutation
      createEntryMutation.mutate(entryData);
    }
  };

  const handleDeleteEntry = async (entryId) => {
      if (window.confirm("Are you sure you want to delete this entry?")) {
          setError(null); // Clear previous local errors before mutation
          // Delete entry using mutation
          deleteEntryMutation.mutate(entryId);
      }
  };


  // --- Modal Handling ---

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
    setError(null); // Clear local errors when form modal closes
  };

   // Handler for closing the Detail modal
  const closeDetailModal = () => {
    setShowEntryDetailModal(false);
    setSelectedEntry(null); // Clear selectedEntry when detail modal closes
  };

    // Handler for editing an entry from the detail view
    const handleEditFromDetail = (entry) => {
        closeDetailModal(); // Close the detail modal first
        openEditEntryModal(entry); // Then open the edit form modal
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

      {/* Search and Filter Section */}
<div className="mb-6 p-4 bg-white rounded-lg shadow ring-1 ring-blue-500 ring-opacity-50 flex flex-wrap gap-4">
  {/* Search by Title - Double width */}
  <div className="w-full md:w-64">
    <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Search Title:</label>
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        id="searchTerm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by title..."
        className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
      />
    </div>
  </div>

  {/* Sentiment Filter - Standard width */}
  <div className="w-full md:w-32">
    <label htmlFor="sentimentFilter" className="block text-sm font-medium text-gray-700 mb-1">Sentiment:</label>
    <div className="relative">
      <select
        id="sentimentFilter"
        value={sentimentFilter}
        onChange={(e) => setSentimentFilter(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
      >
        {sentimentOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>
      
  {/* Sleep Quality Filter - Standard width */}
  <div className="w-full md:w-32">
    <label htmlFor="sleepFilter" className="block text-sm font-medium text-gray-700 mb-1">Sleep Quality:</label>
    <div className="relative">
      <select
        id="sleepFilter"
        value={sleepFilter}
        onChange={(e) => setSleepFilter(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
      >
        {sleepOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>

  {/* Stress Level Filter - Standard width */}
  <div className="w-full md:w-32">
    <label htmlFor="stressFilter" className="block text-sm font-medium text-gray-700 mb-1">Stress Level:</label>
    <div className="relative">
      <select
        id="stressFilter"
        value={stressFilter}
        onChange={(e) => setStressFilter(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
      >
        {stressOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>

  {/* Social Engagement Filter - Standard width */}
  <div className="w-full md:w-32">
    <label htmlFor="socialEngagementFilter" className="block text-sm font-medium text-gray-700 mb-1">Social:</label>
    <div className="relative">
      <select
        id="socialEngagementFilter"
        value={socialEngagementFilter}
        onChange={(e) => setSocialEngagementFilter(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
      >
        {socialEngagementOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>

  {/* Start Date - Standard width */}
  <div className="w-full md:w-32">
    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
    <div className="relative">
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="date"
        id="startDate"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
      />
    </div>
  </div>

  {/* End Date - Standard width */}
  <div className="w-full md:w-32">
    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
    <div className="relative">
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="date"
        id="endDate"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
      />
    </div>
  </div>
</div>

      {/* Loading and Error Messages */}
      {isLoading && <p className="text-center text-gray-500">Loading entries...</p>}
      {(isError || error) && <p className="text-center text-red-500">Error: {error?.message || fetchError?.message}</p>}

      {/* Entry List - Pass FILTERED entries and handlers */}
      {!isLoading && !isError && allEntries && (
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
           <Modal title="Journal Entry Detail" onClose={closeDetailModal}>
               <EntryDetail
                   entry={selectedEntry} // Pass the selected entry
                   onClose={closeDetailModal} // Pass the close handler
                   onEdit={handleEditFromDetail} // Pass the edit handler
                   onDelete={handleDeleteEntry} // Pass delete handler
               />
           </Modal>
       )}
    </div>
  );
};

export default JournalPage;
