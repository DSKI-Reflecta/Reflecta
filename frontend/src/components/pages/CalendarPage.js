import React, { useEffect, useState } from "react";
import JournalCalendar from "../calendar/JournalCalendar";
import EntryDetail from "../journal/EntryDetail";
import GoalDetail from "../goals/GoalDetail";
import EntryForm from "../journal/EntryForm";
import GoalForm from "../goals/GoalForm";
import Modal from "../common/Modal"; // Assuming Modal is used for forms

import {
  fetchCalendarData,
  addCalendarUpdateListener,
  removeCalendarUpdateListener,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CalendarPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["calendarData"],
    queryFn: fetchCalendarData,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showEntryFormModal, setShowEntryFormModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showGoalFormModal, setShowGoalFormModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const journalEntries = data?.journalEntries || [];
  const goals = data?.goals || [];

  useEffect(() => {
    const unsubscribe = addCalendarUpdateListener(() => {
      queryClient.invalidateQueries(["calendarData"]);
    });

    return () => {
      removeCalendarUpdateListener(unsubscribe);
    };
  }, [queryClient]);

  const createEntryMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarData"] });
      closeEntryFormModal();
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ entryId, entryData }) =>
      updateJournalEntry(entryId, entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarData"] });
      closeEntryFormModal();
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarData"] });
      setSelectedEntry(null); // Close detail modal if open
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarData"] });
      closeGoalFormModal();
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, goalData }) => updateGoal(goalId, goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarData"] });
      closeGoalFormModal();
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarData"] });
      setSelectedGoal(null); // Close detail modal if open
    },
  });

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
    setSelectedGoal(null);
  };

  const openEditEntryModal = (entry) => {
    setSelectedEntry(null); // Close detail modal
    setEditingEntry(entry);
    setShowEntryFormModal(true);
  };

  const closeEntryFormModal = () => {
    setShowEntryFormModal(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = async (entryToSave) => {
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
      deleteEntryMutation.mutate(entryId);
    }
  };

  const openEditGoalModal = (goal) => {
    setSelectedGoal(null); // Close detail modal
    setEditingGoal(goal);
    setShowGoalFormModal(true);
  };

  const closeGoalFormModal = () => {
    setShowGoalFormModal(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async (goalToSave) => {
    const goalData = {
      title: goalToSave.title,
      type: goalToSave.type,
      targetDate: goalToSave.targetDate,
      category: goalToSave.category,
      priority: goalToSave.priority,
      description: goalToSave.description,
      ...(goalToSave.id && { progress: goalToSave.progress }),
    };

    if (goalToSave.id) {
      updateGoalMutation.mutate({ goalId: goalToSave.id, goalData });
    } else {
      createGoalMutation.mutate(goalData);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  return (
    <div className="calendar-page-container p-4">
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500 italic">
            Loading calendar data...
          </p>
        </div>
      )}

      {isError && (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-red-500 italic">
            Error: {error?.message || "Failed to load calendar data"}
          </p>
        </div>
      )}

      {!isLoading && !isError && data && (
        <JournalCalendar
          journalEntries={journalEntries}
          goals={goals}
          onEntryClick={handleEntryClick}
          onGoalClick={handleGoalClick}
        />
      )}

      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={handleCloseDetail}
          onEdit={openEditEntryModal}
          onDelete={handleDeleteEntry}
        />
      )}

      {selectedGoal && (
        <GoalDetail
          goal={selectedGoal}
          onClose={handleCloseDetail}
          onEdit={openEditGoalModal}
          onDelete={handleDeleteGoal}
        />
      )}

      {showEntryFormModal && (
        <Modal
          title={editingEntry ? "Edit Entry" : "New Journal Entry"}
          onClose={closeEntryFormModal}
        >
          <EntryForm
            onClose={closeEntryFormModal}
            onSave={handleSaveEntry}
            editEntry={editingEntry}
          />
        </Modal>
      )}

      {showGoalFormModal && (
        <Modal
          title={editingGoal ? "Edit Goal" : "Create New Goal"}
          onClose={closeGoalFormModal}
        >
          <GoalForm
            onClose={closeGoalFormModal}
            onSave={handleSaveGoal}
            editGoal={editingGoal}
          />
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;
