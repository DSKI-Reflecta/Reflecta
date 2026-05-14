import React from 'react';
// Import necessary icons, including priority icons
import { Edit, Trash2, Tag, Calendar, ArrowDownCircle, MinusCircle, ArrowUpCircle } from 'lucide-react';

// This is the GoalCard component
// Added onClick prop to make the card clickable
const GoalCard = ({ goal, onEdit, onDelete, onClick }) => {

    // Helper to render priority icon and text
    const renderPriority = (priority) => {
        let icon;
        let colorClass;
        let text;

        switch (priority) {
            case 'Low':
                icon = <ArrowDownCircle className="h-4 w-4 mr-1 text-green-500" />;
                colorClass = 'text-green-700';
                text = 'Low Priority';
                break;
            case 'Medium':
                icon = <MinusCircle className="h-4 w-4 mr-1 text-yellow-500" />;
                colorClass = 'text-yellow-700';
                text = 'Medium Priority';
                break;
            case 'High':
                icon = <ArrowUpCircle className="h-4 w-4 mr-1 text-red-500" />;
                colorClass = 'text-red-700';
                text = 'High Priority';
                break;
            default:
                return null; // Don't render if priority is not recognized
        }

        return (
            <span className={`flex items-center text-sm font-semibold ${colorClass}`}>
                {icon}
                {text}
            </span>
        );
    };


  return (
    // Added aspect-square and cursor-pointer classes, reduced padding
    // Added onClick handler to make the card clickable
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow flex flex-col aspect-square cursor-pointer" onClick={() => onClick(goal)}>
      <div className="flex justify-between items-start mb-3">
        {/* Removed flex-1 and padding */}
        <div>
          {/* Display Category and Priority */}
          <div className="flex items-center text-sm text-gray-500 mb-1 space-x-4"> {/* Added space-x-4 */}
             {goal.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"> {/* Removed mr-2 */}
                  <Tag className="h-3 w-3 mr-1" /> {goal.category}
                </span>
             )}
             {/* Display Priority with Icon and Text */}
             {goal.priority && renderPriority(goal.priority)}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
          {/* Display Target Date */}
          {goal.targetDate && ( // Only show target date if it exists
            <p className="text-sm text-gray-600 mt-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" /> Target Date: {new Date(goal.targetDate).toLocaleDateString()}
            </p>
           )}
           {/* Display Goal Type */}
           <p className="text-sm text-gray-600 mt-1">
             Type: {goal.type || 'Not specified'}
           </p>
           {/* Removed Description display */}

        </div>
        {/* Buttons for Edit and Delete - These should ideally be outside the clickable card area or handled differently */}
        {/* For now, keeping them but note they are within the clickable area */}
        <div className="flex space-x-2">
            <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={(e) => { e.stopPropagation(); onEdit(goal); }} // Stop propagation to prevent card click
                aria-label="Edit Goal"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                className="p-1 text-red-400 hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }} // Stop propagation to prevent card click
                aria-label="Delete Goal"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      {goal.progress !== undefined && (
          <div className="mt-auto"> {/* Use mt-auto to push progress to the bottom */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{width: `${goal.progress}%`}}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{goal.progress}% complete</p>
          </div>
      )}
    </div>
  );
};

export default GoalCard;
