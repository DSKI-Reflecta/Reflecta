import React, { useState, useEffect } from "react";
import EntryList from "../journal/EntryList";
import EntryForm from "../journal/EntryForm";
import EntryDetail from "../journal/EntryDetail";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import {
  fetchJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../../api/api";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const sentimentOptions = [
  { value: "", label: "All" },
  { value: "1", label: "Terrible" },
  { value: "2", label: "Bad" },
  { value: "3", label: "Okay" },
  { value: "4", label: "Good" },
  { value: "5", label: "Great" },
];

const sleepOptions = [
  { value: "", label: "All" },
  { value: "1", label: "Very Poor" },
  { value: "2", label: "Poor" },
  { value: "3", label: "Fair" },
  { value: "4", label: "Good" },
  { value: "5", label: "Excellent" },
];

const stressOptions = [
  { value: "", label: "All" },
  { value: "1", label: "Very Low" },
  { value: "2", label: "Low" },
  { value: "3", label: "Moderate" },
  { value: "4", label: "High" },
  { value: "5", label: "Very High" },
];

const socialEngagementOptions = [
  { value: "", label: "All" },
  { value: "1", label: "Very Isolated" },
  { value: "2", label: "Isolated" },
  { value: "3", label: "Neutral" },
  { value: "4", label: "Social" },
  { value: "5", label: "Very Social" },
];

const JournalPage = () => {
  const [showEntryFormModal, setShowEntryFormModal] = useState(false);
  const [showEntryDetailModal, setShowEntryDetailModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [sleepFilter, setSleepFilter] = useState("");
  const [stressFilter, setStressFilter] = useState("");
  const [socialEngagementFilter, setSocialEngagementFilter] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const {
    data: allEntries,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: fetchJournalEntries,
    staleTime: 5 * 60 * 1000,
  });

  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    if (!allEntries) {
      setFilteredEntries([]);
      return;
    }

    let updatedFilteredEntries = allEntries;

    if (searchTerm) {
      updatedFilteredEntries = updatedFilteredEntries.filter((entry) =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sentimentFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(
        (entry) =>
          entry.sentiment_level !== null &&
          entry.sentiment_level !== undefined &&
          String(entry.sentiment_level) === sentimentFilter
      );
    }

    if (sleepFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(
        (entry) =>
          entry.sleep_quality !== null &&
          entry.sleep_quality !== undefined &&
          String(entry.sleep_quality) === sleepFilter
      );
    }

    if (stressFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(
        (entry) =>
          entry.stress_level !== null &&
          entry.stress_level !== undefined &&
          String(entry.stress_level) === stressFilter
      );
    }

    if (socialEngagementFilter) {
      updatedFilteredEntries = updatedFilteredEntries.filter(
        (entry) =>
          entry.social_engagement !== null &&
          entry.social_engagement !== undefined &&
          String(entry.social_engagement) === socialEngagementFilter
      );
    }

    if (startDate || endDate) {
      updatedFilteredEntries = updatedFilteredEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        let isWithinRange = true;

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (entryDate < start) {
            isWithinRange = false;
          }
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (entryDate > end) {
            isWithinRange = false;
          }
        }

        return isWithinRange;
      });
    }

    const sortedFilteredEntries = updatedFilteredEntries.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setFilteredEntries(sortedFilteredEntries);
  }, [
    searchTerm,
    startDate,
    endDate,
    sentimentFilter,
    sleepFilter,
    stressFilter,
    socialEngagementFilter,
    allEntries,
  ]);

  const createEntryMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      closeFormModal();
    },
    onError: (err) => {
      console.error("Error creating entry:", err);
      setError(`Failed to create entry: ${err.message}`);
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ entryId, entryData }) =>
      updateJournalEntry(entryId, entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      closeFormModal();
    },
    onError: (err) => {
      console.error("Error updating entry:", err);
      setError(`Failed to update entry: ${err.message}`);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      if (showEntryDetailModal) {
        closeDetailModal();
      }
    },
    onError: (err) => {
      console.error("Error deleting entry:", err);
      setError(`Failed to delete entry: ${err.message}`);
    },
  });

  const handleSaveEntry = async (entryToSave) => {
    setError(null);
    const entryData = {
      content: entryToSave.content,
      sentiment_level: entryToSave.sentiment,
      sleep_quality: entryToSave.sleep,
      stress_level: entryToSave.stress,
      social_engagement: entryToSave.socialEngagement,
      date: entryToSave.date,
      title: entryToSave.title,
    };

    if (entryToSave.id) {
      updateEntryMutation.mutate({ entryId: entryToSave.id, entryData });
    } else {
      createEntryMutation.mutate(entryData);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setError(null);
      deleteEntryMutation.mutate(entryId);
    }
  };

  const openAddEntryModal = () => {
    setEditingEntry(null);
    setShowEntryFormModal(true);
  };

  const openEditEntryModal = (entry) => {
    setEditingEntry(entry);
    setShowEntryFormModal(true);
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setShowEntryDetailModal(true);
  };

  const closeFormModal = () => {
    setShowEntryFormModal(false);
    setEditingEntry(null);
    setError(null);
  };

  const closeDetailModal = () => {
    setShowEntryDetailModal(false);
    setSelectedEntry(null);
  };

  const handleEditFromDetail = (entry) => {
    closeDetailModal();
    openEditEntryModal(entry);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entries..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl transition-colors ${
            showFilters ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button onClick={openAddEntryModal} className="btn-primary ml-auto">
          New Entry
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="text-sm rounded-lg bg-gray-100 border-0 px-3 py-2 text-gray-600 focus:ring-2 focus:ring-purple-500"
          >
            {sentimentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === "" ? "Mood" : option.label}
              </option>
            ))}
          </select>
          <select
            value={sleepFilter}
            onChange={(e) => setSleepFilter(e.target.value)}
            className="text-sm rounded-lg bg-gray-100 border-0 px-3 py-2 text-gray-600 focus:ring-2 focus:ring-purple-500"
          >
            {sleepOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === "" ? "Sleep" : option.label}
              </option>
            ))}
          </select>
          <select
            value={stressFilter}
            onChange={(e) => setStressFilter(e.target.value)}
            className="text-sm rounded-lg bg-gray-100 border-0 px-3 py-2 text-gray-600 focus:ring-2 focus:ring-purple-500"
          >
            {stressOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === "" ? "Stress" : option.label}
              </option>
            ))}
          </select>
          <select
            value={socialEngagementFilter}
            onChange={(e) => setSocialEngagementFilter(e.target.value)}
            className="text-sm rounded-lg bg-gray-100 border-0 px-3 py-2 text-gray-600 focus:ring-2 focus:ring-purple-500"
          >
            {socialEngagementOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === "" ? "Social" : option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm rounded-lg bg-gray-100 border-0 px-3 py-2 text-gray-600 focus:ring-2 focus:ring-purple-500"
            placeholder="From"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm rounded-lg bg-gray-100 border-0 px-3 py-2 text-gray-600 focus:ring-2 focus:ring-purple-500"
            placeholder="To"
          />
        </div>
      )}

      {isLoading && (
        <p className="text-center text-gray-500">Loading entries...</p>
      )}
      {(isError || error) && (
        <p className="text-center text-red-500">
          Error: {error?.message || fetchError?.message}
        </p>
      )}

      {!isLoading && !isError && allEntries && (
        <EntryList
          entries={filteredEntries}
          onEditEntry={openEditEntryModal}
          onDeleteEntry={handleDeleteEntry}
          onSelectEntry={handleSelectEntry}
        />
      )}

      {showEntryFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-6 max-h-[95vh] flex flex-col">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                onClick={closeFormModal}
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-2xl font-bold leading-6 text-gray-900 break-words">
                {editingEntry ? "Edit Entry" : "New Journal Entry"}
              </h3>
            </div>
            <EntryForm
              onClose={closeFormModal}
              onSave={handleSaveEntry}
              editEntry={editingEntry}
            />
          </div>
        </div>
      )}

      {showEntryDetailModal && (
        <EntryDetail
          entry={selectedEntry}
          onClose={closeDetailModal}
          onEdit={handleEditFromDetail}
          onDelete={handleDeleteEntry}
        />
      )}
    </div>
  );
};

export default JournalPage;
