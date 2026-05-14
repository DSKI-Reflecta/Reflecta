import React from "react";
import GoalCard from "./GoalCard";

const GoalList = ({ goals, onEditGoal, onDeleteGoal, onGoalClick }) => {
  const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const sortedGoals = [...goals].sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 4;
    const priorityB = priorityOrder[b.priority] || 4;
    return priorityA - priorityB;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {sortedGoals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={onEditGoal}
          onDelete={onDeleteGoal}
          onClick={onGoalClick}
        />
      ))}
      {goals.length === 0 && (
        <p className="text-center text-gray-500 italic">
          No goals set yet. Click "New Goal" to add one!
        </p>
      )}
    </div>
  );
};

export default GoalList;
