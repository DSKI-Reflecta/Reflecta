import React, { useState } from "react";
import GoalList from "../goals/GoalList";
import GoalForm from "../goals/GoalForm";
import Modal from "../common/Modal";
import GoalDetail from "../goals/GoalDetail";
import { Sparkles } from "lucide-react";

import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  recommendGoals,
} from "../../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const GoalsPage = () => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [recommendedGoals, setRecommendedGoals] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);

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

  const handleRecommendGoals = async () => {
    setLoadingRecommendations(true);
    setRecommendationError(null);
    try {
      const recommendations = await recommendGoals();
      setRecommendedGoals(recommendations);
    } catch (error) {
      setRecommendationError("Failed to load recommendations.");
      console.error(error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleDeclineRecommendation = (index) => {
    setRecommendedGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const openAddGoalModal = (goal = null) => {
    setEditingGoal(goal);
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
        <div className="flex space-x-4">
          <button
            onClick={handleRecommendGoals}
            disabled={loadingRecommendations}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center disabled:bg-purple-300"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {loadingRecommendations ? "Loading..." : "Recommend Goals"}
          </button>
          <button
            onClick={() => openAddGoalModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Goal
          </button>
        </div>
      </div>

      {recommendationError && (
        <p className="text-center text-red-500 italic mb-4">
          {recommendationError}
        </p>
      )}
      {recommendedGoals.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Goal Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedGoals.map((rec, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      openAddGoalModal(rec);
                      handleDeclineRecommendation(index);
                    }}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRecommendation(index)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
