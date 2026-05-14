import React, { useState} from 'react'; // Import useEffect
import GoalList from '../goals/GoalList';
import GoalForm from '../goals/GoalForm';
import Modal from '../common/Modal';
import GoalDetail from '../goals/GoalDetail'; // Import GoalDetail component


// Import API functions and react-query hooks
import {
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal
} from '../../api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


const GoalsPage = () => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  // State for managing the Goal Detail modal
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);


  // Get QueryClient instance
  const queryClient = useQueryClient();

  // --- Data Fetching with useQuery ---
  const { data: goals, isLoading, isError, error } = useQuery({
      queryKey: ['goals'], // Unique key for this query
      queryFn: fetchGoals, // Function to fetch data
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      // initialData: [] // Optional: provide initial data if available
  });


  // --- Data Mutations with useMutation ---

  // Mutation for creating a goal
  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      // Invalidate the 'goals' query to refetch data after creation
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      closeModal(); // Close modal on success
    },
     onError: (error) => {
        console.error("Error creating goal:", error);
        // Handle error state or display a message to the user
    }
  });

  // Mutation for updating a goal
  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, goalData }) => updateGoal(goalId, goalData),
    onSuccess: () => {
      // Invalidate the 'goals' query to refetch data after update
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      closeModal(); // Close modal on success
    },
     onError: (error) => {
        console.error("Error updating goal:", error);
        // Handle error state or display a message to the user
    }
  });

  // Mutation for deleting a goal
  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      // Invalidate the 'goals' query to refetch data after deletion
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
     onError: (error) => {
        console.error("Error deleting goal:", error);
        // Handle error state or display a message to the user
    }
  });


  // --- API Interaction Handlers (using mutations) ---

  const handleSaveGoal = async (goalToSave) => {
    // Prepare data to send, matching backend model expectations
    const goalData = {
        title: goalToSave.title,
        type: goalToSave.type,
        targetDate: goalToSave.targetDate, // Can be null for recurring
        category: goalToSave.category,
        priority: goalToSave.priority,
        description: goalToSave.description,
        // progress is only sent on update if it exists
        ...(goalToSave.id && { progress: goalToSave.progress })
    };

    if (goalToSave.id) {
      // Update existing goal using mutation
      updateGoalMutation.mutate({ goalId: goalToSave.id, goalData });
    } else {
      // Add new goal using mutation
      createGoalMutation.mutate(goalData);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      // Delete goal using mutation
      deleteGoalMutation.mutate(goalId);
    }
  };


  // --- Modal Handling ---

  const openAddGoalModal = () => {
    setEditingGoal(null); // Ensure editingGoal is null for adding
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal); // Set the goal to be edited
    setShowGoalModal(true);
  };

  const closeModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null); // Clear editingGoal when modal closes
    // Clear any mutation errors when modal closes if you add error state to mutations
  };

  // Handlers for the Goal Detail modal
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
        <h1 className="text-2xl font-bold text-gray-900">My Goals & Priorities</h1>
        <button
          onClick={openAddGoalModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Goal
        </button>
      </div>

      {/* Display loading, error, or goals list */}
      {isLoading && <p className="text-center text-gray-500 italic">Loading goals...</p>} {/* Use isLoading from useQuery */}
      {isError && <p className="text-center text-red-500 italic">Error: {error?.message}</p>} {/* Use isError and error from useQuery */}
      {/* Render only when not loading and no error, and goals data is available */}
      {!isLoading && !isError && goals && (
        <GoalList
          goals={goals}
          // Modified handlers to close detail modal if open when editing/deleting
          onEditGoal={(goal) => { openEditGoalModal(goal); closeGoalDetailModal(); }}
          onDeleteGoal={(goalId) => { handleDeleteGoal(goalId); closeGoalDetailModal(); }}
          onGoalClick={openGoalDetailModal} // Pass the handler for card clicks
        />
      )}


      {/* Modal for Add/Edit Goal - Renders only when showGoalModal is true */}
      {showGoalModal && (
        <Modal title={editingGoal ? "Edit Goal" : "Create New Goal"} onClose={closeModal}>
          <GoalForm
            onClose={closeModal}
            onSave={handleSaveGoal} // Pass the save handler
            editGoal={editingGoal}
          />
        </Modal>
      )}

      {/* Modal for Goal Detail - Renders only when showGoalDetailModal is true */}
      {showGoalDetailModal && selectedGoal && (
        <GoalDetail
          goal={selectedGoal}
          onClose={closeGoalDetailModal}
          // Pass handlers to the detail view, ensuring modals are managed correctly
          onEdit={(goal) => { openEditGoalModal(goal); closeGoalDetailModal(); }}
          onDelete={(goalId) => { handleDeleteGoal(goalId); closeGoalDetailModal(); }}
        />
      )}
    </div>
  );
};

export default GoalsPage;
