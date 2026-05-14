import React, { useState } from "react";
import GoalList from "../goals/GoalList";
import GoalForm from "../goals/GoalForm";
import Modal from "../common/Modal";
import GoalDetail from "../goals/GoalDetail";

import { fetchGoals, createGoal, updateGoal, deleteGoal } from "../../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const GoalsPage = () => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const queryClient = useQueryClient();

  const {
    data: goals,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    staleTime: 5 * 60 * 1000,
  });

  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      closeModal();
    },
    onError: (error) => {
      console.error("Error creating goal:", error);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, goalData }) => updateGoal(goalId, goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      closeModal();
    },
    onError: (error) => {
      console.error("Error updating goal:", error);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error) => {
      console.error("Error deleting goal:", error);
    },
  });

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

  const openAddGoalModal = () => {
    setEditingGoal(null);
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const closeModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const openGoalDetailModal = (goal) => {
    setSelectedGoal(goal);
    setShowGoalDetailModal(true);
  };

  const closeGoalDetailModal = () => {
    setSelectedGoal(null);
    setShowGoalDetailModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Goals & Priorities</h1>
        <button
          onClick={openAddGoalModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Goal
        </button>
      </div>

      {isLoading && (
        <p className="text-center text-gray-500 italic">Loading goals...</p>
      )}
      {isError && (
        <p className="text-center text-red-500 italic">
          Error: {error?.message}
        </p>
      )}
      {!isLoading && !isError && goals && (
        <GoalList
          goals={goals}
          onEditGoal={(goal) => {
            openEditGoalModal(goal);
            closeGoalDetailModal();
          }}
          onDeleteGoal={(goalId) => {
            handleDeleteGoal(goalId);
            closeGoalDetailModal();
          }}
          onGoalClick={openGoalDetailModal}
        />
      )}

      {showGoalModal && (
        <Modal
          title={editingGoal ? "Edit Goal" : "Create New Goal"}
          onClose={closeModal}
        >
          <GoalForm
            onClose={closeModal}
            onSave={handleSaveGoal}
            editGoal={editingGoal}
          />
        </Modal>
      )}

      {showGoalDetailModal && selectedGoal && (
        <GoalDetail
          goal={selectedGoal}
          onClose={closeGoalDetailModal}
          onEdit={(goal) => {
            openEditGoalModal(goal);
            closeGoalDetailModal();
          }}
          onDelete={(goalId) => {
            handleDeleteGoal(goalId);
            closeGoalDetailModal();
          }}
        />
      )}
    </div>
  );
};

export default GoalsPage;
