import React, { useState } from 'react';
import GoalList from '../goals/GoalList';
import GoalForm from '../goals/GoalForm';
import Modal from '../common/Modal'; // Assuming you have a Modal component

const GoalsPage = () => {
  const [showGoalModal, setShowGoalModal] = useState(false); // Renamed state
  const [editingGoal, setEditingGoal] = useState(null);
  // Initial state with example goals including new fields
  const [goals, setGoals] = useState([
    { id: 1, title: 'Learn React', targetDate: '2025-12-31', progress: 30, category: 'Career', priority: 1, type: 'One-time', description: 'Complete a React course and build a project.' },
    { id: 2, title: 'Workout Daily', targetDate: 'Ongoing', progress: 70, category: 'Health', priority: 0, type: 'Recurring', description: 'Exercise for at least 30 minutes every day.' },
    { id: 3, title: 'Read 1 Book/Month', targetDate: 'Ongoing', progress: 60, category: 'Personal', priority: 2, type: 'Recurring', description: 'Read for at least 20 minutes daily.' }
  ]);

  const openAddGoalModal = () => {
    setEditingGoal(null); // Ensure editingGoal is null for adding
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal); // Set the goal to be edited
    setShowGoalModal(true);
  };

  const handleSaveGoal = (goalToSave) => {
      if (goalToSave.id) {
          // Update existing goal
          setGoals(goals.map(goal =>
              goal.id === goalToSave.id ? goalToSave : goal
          ));
      } else {
          // Add new goal (ID is generated in GoalForm)
          setGoals([...goals, goalToSave]);
      }
      closeModal(); // Close modal after saving
  };

  const handleDeleteGoal = (goalId) => {
      // Implement confirmation dialog here if desired
      if (window.confirm("Are you sure you want to delete this goal?")) {
           setGoals(goals.filter(goal => goal.id !== goalId));
      }
  };

  const closeModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null); // Clear editingGoal when modal closes
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Goals & Priorities</h1> {/* Updated Title */}
        <button
          onClick={openAddGoalModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Goal
        </button>
      </div>

      {/* Pass goals and handlers to GoalList */}
      <GoalList
        goals={goals}
        onEditGoal={openEditGoalModal}
        onDeleteGoal={handleDeleteGoal}
      />

      {/* Modal for Add/Edit Goal */}
      {showGoalModal && (
        <Modal title={editingGoal ? "Edit Goal" : "Create New Goal"} onClose={closeModal}> {/* Updated title */}
          <GoalForm
            onClose={closeModal}
            onSave={handleSaveGoal} // Pass the save handler
            editGoal={editingGoal}
          />
        </Modal>
      )}
    </div>
  );
};

export default GoalsPage;
