import React, { useState, useEffect } from 'react';
import EntryList from '../journal/EntryList';
import EntryForm from '../journal/EntryForm';
import EntryDetail from '../journal/EntryDetail'; // Import the new detail component
import Modal from '../common/Modal'; // Assuming you have a Modal component
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
  const [entries, setEntries] = useState([]); // State to hold journal entries fetched from API
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // --- Data Fetching ---

  // Fetch entries from the backend using the API service
  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEntries = await fetchJournalEntries();
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
      setError("Failed to load journal entries.");
    } finally {
      setLoading(false);
    }
  };

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
        // Update the entry in the local state
        setEntries(entries.map(entry =>
          entry.id === savedEntry.id ? savedEntry : entry
        ));
      } else {
        // Create new entry
        savedEntry = await createJournalEntry(entryData);
        // Add new entry to the top of the local state
        setEntries([savedEntry, ...entries]);
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
              // Remove the entry from the local state
              setEntries(entries.filter(entry => entry.id !== entryId));
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


      {/* Loading and Error Messages */}
      {loading && <p className="text-center text-gray-500">Loading entries...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Entry List - Pass fetched entries and handlers */}
      {!loading && !error && (
          <EntryList
            entries={entries}
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
