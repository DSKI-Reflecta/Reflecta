import React, { useState, useEffect } from "react";
import EntryList from "../journal/EntryList";
import EntryForm from "../journal/EntryForm";
import EntryDetail from "../journal/EntryDetail";
import Modal from "../common/Modal";
import { Search as SearchIcon, Calendar as CalendarIcon } from "lucide-react";
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
  { value: "1", label: "Very High" },
  { value: "2", label: "High" },
  { value: "3", label: "Moderate" },
  { value: "4", label: "Low" },
  { value: "5", label: "Very Low" },
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
        <button
          onClick={openAddEntryModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Entry
        </button>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow ring-1 ring-blue-500 ring-opacity-50 flex flex-wrap gap-4">
        <div className="w-full md:w-64">
          <label
            htmlFor="searchTerm"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Title:
          </label>
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

        <div className="w-full md:w-32">
          <label
            htmlFor="sentimentFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sentiment:
          </label>
          <div className="relative">
            <select
              id="sentimentFilter"
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
            >
              {sentimentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-32">
          <label
            htmlFor="sleepFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sleep Quality:
          </label>
          <div className="relative">
            <select
              id="sleepFilter"
              value={sleepFilter}
              onChange={(e) => setSleepFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
            >
              {sleepOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-32">
          <label
            htmlFor="stressFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Stress Level:
          </label>
          <div className="relative">
            <select
              id="stressFilter"
              value={stressFilter}
              onChange={(e) => setStressFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
            >
              {stressOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-32">
          <label
            htmlFor="socialEngagementFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Social:
          </label>
          <div className="relative">
            <select
              id="socialEngagementFilter"
              value={socialEngagementFilter}
              onChange={(e) => setSocialEngagementFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pr-8"
            >
              {socialEngagementOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-32">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date:
          </label>
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

        <div className="w-full md:w-32">
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date:
          </label>
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
        <Modal
          title={editingEntry ? "Edit Entry" : "New Journal Entry"}
          onClose={closeFormModal}
        >
          <EntryForm
            onClose={closeFormModal}
            onSave={handleSaveEntry}
            editEntry={editingEntry}
          />
        </Modal>
      )}

      {showEntryDetailModal && (
        <Modal title="Journal Entry Detail" onClose={closeDetailModal}>
          <EntryDetail
            entry={selectedEntry}
            onClose={closeDetailModal}
            onEdit={handleEditFromDetail}
            onDelete={handleDeleteEntry}
          />
        </Modal>
      )}
    </div>
  );
};

export default JournalPage;
