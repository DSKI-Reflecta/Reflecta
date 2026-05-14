import React from 'react';
import GoalCard from './GoalCard';

// Added goals, onEditGoal, onDeleteGoal props
const GoalList = ({ goals, onEditGoal, onDeleteGoal }) => {

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
    <div className="grid gap-6">
      {sortedGoals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={() => onEditGoal(goal)} // Pass the goal object to edit handler
          onDelete={() => onDeleteGoal(goal.id)} // Pass the goal id to delete handler
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
