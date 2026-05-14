import React from 'react';
import GoalCard from './GoalCard';

// Added goals, onEditGoal, onDeleteGoal, and onGoalClick props
const GoalList = ({ goals, onEditGoal, onDeleteGoal, onGoalClick }) => {

  // Define the order for priority levels for sorting
  const priorityOrder = {
    'High': 1,
    'Medium': 2,
    'Low': 3
  };

  // Sort goals by priority (High -> Medium -> Low) before rendering
  const sortedGoals = [...goals].sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 4; // Default to a lower priority if value is unexpected
      const priorityB = priorityOrder[b.priority] || 4;
      return priorityA - priorityB;
  });

  return (
    // Removed the misplaced JSX comment
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {sortedGoals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={onEditGoal} // Pass the edit handler
          onDelete={onDeleteGoal} // Pass the delete handler
          onClick={onGoalClick} // Pass the new click handler for detail view
        />
      ))}
       {/* Message if no goals */}
       {goals.length === 0 && (
           <p className="text-center text-gray-500 italic">No goals set yet. Click "New Goal" to add one!</p>
       )}
    </div>
  );
};

export default GoalList;
