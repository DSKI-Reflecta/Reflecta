import React from 'react';
import { Edit, Trash2, Tag, Calendar, ArrowDownCircle, MinusCircle, ArrowUpCircle } from 'lucide-react';

const GoalCard = ({ goal, onEdit, onDelete, onClick }) => {
  // Helper to render priority icon and text
  const renderPriority = (priority) => {
    let icon;
    let colorClass;
    
    switch (priority) {
      case 'Low':
        icon = <ArrowDownCircle className="h-5 w-5 text-green-500" />;
        colorClass = 'text-green-700';
        break;
      case 'Medium':
        icon = <MinusCircle className="h-5 w-5 text-yellow-500" />;
        colorClass = 'text-yellow-700';
        break;
      case 'High':
        icon = <ArrowUpCircle className="h-5 w-5 text-red-500" />;
        colorClass = 'text-red-700';
        break;
      default:
        return null;
    }

    return (
      <span className={`flex items-center ${colorClass}`}>
        {icon}
      </span>
    );
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-2 hover:shadow-md transition-shadow flex flex-col h-40 cursor-pointer" 
      onClick={() => onClick(goal)}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="overflow-hidden">
          <div className="flex items-center text-xs text-gray-500 mb-1 space-x-2">
            {goal.category && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-24">
                <Tag className="h-4 w-4 mr-1" /> {goal.category}
              </span>
            )}
            {goal.priority && renderPriority(goal.priority)}
          </div>
          <h3 className="text-l font-semibold text-gray-900 truncate">{goal.title}</h3>
          {goal.targetDate && (
            <p className="text-xs text-gray-600 mt-0.5 flex items-center">
              <Calendar className="h-5 w-5 mr-1 text-gray-500" /> 
              {new Date(goal.targetDate).toLocaleDateString()}
            </p>
          )}
        
        </div>
        <div className="flex space-x-1">
          <button
            className="p-0.5 text-gray-400 hover:text-gray-600"
            onClick={(e) => { e.stopPropagation(); onEdit(goal); }}
            aria-label="Edit Goal"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            className="p-0.5 text-red-400 hover:text-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
            aria-label="Delete Goal"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {goal.progress !== undefined && (
        <div className="mt-auto">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{width: `${goal.progress}%`}}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">{goal.progress}% complete</p>
        </div>
      )}
    </div>
  );
};

export default GoalCard;