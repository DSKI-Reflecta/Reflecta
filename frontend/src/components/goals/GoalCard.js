import React from 'react';
// Import necessary icons, including priority icons
import { Edit, Trash2, Tag, Calendar, ArrowDownCircle, MinusCircle, ArrowUpCircle } from 'lucide-react';

// This is the GoalCard component
const GoalCard = ({ goal, onEdit, onDelete }) => {

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
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4"> {/* Added flex-1 and padding */}
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
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-gray-500" /> Target Date: {goal.targetDate || 'Not set'}
          </p>
           {/* Display Goal Type */}
           <p className="text-sm text-gray-600 mt-1">
             Type: {goal.type || 'Not specified'}
           </p>
           {/* Display Description if available */}
           {goal.description && (
             <p className="text-sm text-gray-700 mt-2 italic">{goal.description}</p>
           )}
        </div>
        <div className="flex space-x-2"> {/* Buttons for Edit and Delete */}
            <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => onEdit(goal)} // Call onEdit with the goal object
                aria-label="Edit Goal"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                className="p-1 text-red-400 hover:text-red-600"
                onClick={() => onDelete(goal.id)} // Call onDelete with the goal id
                aria-label="Delete Goal"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      {goal.progress !== undefined && (
          <div className="mt-4">
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
