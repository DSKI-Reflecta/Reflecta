import React, { useState, useEffect } from 'react';
import EntryList from '../journal/EntryList';
import EntryForm from '../journal/EntryForm';
import Modal from '../common/Modal'; // Assuming you have a Modal component
import FloatingNewEntryButton from '../FloatingButton'; // Assuming this is your floating button component

// Define your backend API base URL
const API_BASE_URL = 'http://127.0.0.1:8000/journal'; // Adjust if your API is hosted elsewhere

const JournalPage = () => {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entries, setEntries] = useState([]); // State to hold journal entries fetched from API
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // --- API Interaction Functions ---

  // Fetch entries from the backend
  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/entries/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Assuming data is an array of entries, sort by date descending
      const sortedEntries = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sortedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("Failed to load journal entries.");
    } finally {
      setLoading(false);
    }
  };

  // Create or update an entry
  const handleSaveEntry = async (entryToSave) => {
    setError(null); // Clear previous errors
    const method = entryToSave.id ? 'PUT' : 'POST';
    const url = entryToSave.id ? `${API_BASE_URL}/entries/${entryToSave.id}` : `${API_BASE_URL}/entries/`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        // Send only the fields expected by the backend Create/Update models
        body: JSON.stringify({
            content: entryToSave.content,
            // Mapping frontend state names to backend model names
            sentiment_level: entryToSave.sentiment,
            sleep_quality: entryToSave.sleep,
            stress_level: entryToSave.stress,
            social_engagement: entryToSave.socialEngagement,
            // Note: 'date' and 'title' are not in JournalEntryBase in your provided models,
            // but they were in your frontend state and previous API interaction.
            // Assuming your backend actually handles these fields in Create/Update,
            // or you might need to adjust your backend models or frontend state/mapping.
            // For now, I'll keep them in the body based on previous code, but be aware
            // this might need adjustment if your backend strictly follows the provided models.
            date: entryToSave.date, // Keeping based on previous frontend structure
            title: entryToSave.title // Keeping based on previous frontend structure
        }),
      });

      if (!response.ok) {
         // Attempt to read error message from backend
         // Check if the response is JSON before trying to parse
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.indexOf("application/json") !== -1) {
             const errorData = await response.json();
             throw new Error(`HTTP error! status: ${response.status} - ${errorData.detail || JSON.stringify(errorData)}`);
         } else {
             // If not JSON, read as text and include in error
             const errorText = await response.text();
             throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
         }
      }

      // Assuming the backend returns the saved/updated entry
      const savedEntry = await response.json();

      if (method === 'POST') {
        // Add new entry to the top of the list
        setEntries([savedEntry, ...entries]);
      } else {
        // Update the entry in the list
        setEntries(entries.map(entry =>
          entry.id === savedEntry.id ? savedEntry : entry
        ));
      }

      closeModal(); // Close modal on successful save
      // Optionally refetch entries to ensure data consistency, especially if backend does processing
      // fetchEntries();

    } catch (error) {
      console.error("Error saving entry:", error);
      setError(`Failed to save entry: ${error.message}`);
      // Keep modal open to allow user to fix input or try again
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (entryId) => {
      if (window.confirm("Are you sure you want to delete this entry?")) {
          setError(null); // Clear previous errors
          try {
              const response = await fetch(`${API_BASE_URL}/entries/${entryId}`, {
                  method: 'DELETE',
              });

              if (!response.ok) {
                 const contentType = response.headers.get("content-type");
                 if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.detail || JSON.stringify(errorData)}`);
                 } else {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                 }
              }

              // Assuming backend returns success: true or similar, or just a 200 status
              // Filter out the deleted entry from the state
              setEntries(entries.filter(entry => entry.id !== entryId));

          } catch (error) {
              console.error("Error deleting entry:", error);
              setError(`Failed to delete entry: ${error.message}`);
          }
      }
  };


  // --- Component Lifecycle and Modal Handling ---

  // Fetch entries when the component mounts
  useEffect(() => {
    fetchEntries();
  }, []); // Empty dependency array means this runs once on mount

  const openAddEntryModal = () => {
    setEditingEntry(null); // Ensure editingEntry is null for adding
    setShowEntryModal(true);
  };

  const openEditEntryModal = (entry) => {
    setEditingEntry(entry); // Set the entry to be edited
    setShowEntryModal(true);
  };

  const closeModal = () => {
    setShowEntryModal(false);
    setEditingEntry(null); // Clear editingEntry when modal closes
    setError(null); // Clear errors when modal closes
  };

  return (
    // Added pb-20 to ensure space for the floating button at the bottom
    <div className="relative pb-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Journal Entries</h1>

      {/* Loading and Error Messages */}
      {loading && <p className="text-center text-gray-500">Loading entries...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Entry List - Pass fetched entries and handlers */}
      {!loading && !error && (
          <EntryList
            entries={entries}
            onEditEntry={openEditEntryModal}
            onDeleteEntry={handleDeleteEntry}
          />
      )}


      {/* Modal for Add/Edit Entry */}
      {showEntryModal && (
        <Modal title={editingEntry ? "Edit Entry" : "New Journal Entry"} onClose={closeModal}>
          {/* Pass onSave handler and editingEntry to EntryForm */}
          <EntryForm
            onClose={closeModal}
            onSave={handleSaveEntry} // Pass the save handler
            editEntry={editingEntry}
          />
        </Modal>
      )}

      {/* Floating New Entry Button - Fixed position */}
      <div className="fixed bottom-6 right-6 z-40">
         <FloatingNewEntryButton onClick={openAddEntryModal} />
      </div>
    </div>
  );
};

export default JournalPage;
