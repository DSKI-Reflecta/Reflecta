import React from "react";
import {
  Edit,
  Trash2,
  Tag,
  Calendar,
  ArrowDownCircle,
  MinusCircle,
  ArrowUpCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Modal from "../common/Modal";

const renderPriority = (priority) => {
  let icon;
  let colorClass;
  let text;

  switch (priority) {
    case "Low":
      icon = <ArrowDownCircle className="h-4 w-4 mr-1 text-green-500" />;
      colorClass = "text-green-700";
      text = "Low Priority";
      break;
    case "Medium":
      icon = <MinusCircle className="h-4 w-4 mr-1 text-yellow-500" />;
      colorClass = "text-yellow-700";
      text = "Medium Priority";
      break;
    case "High":
      icon = <ArrowUpCircle className="h-4 w-4 mr-1 text-red-500" />;
      colorClass = "text-red-700";
      text = "High Priority";
      break;
    default:
      return null;
  }

  return (
    <span className={`flex items-center text-sm font-semibold ${colorClass}`}>
      {icon}
      {text}
    </span>
  );
};

const GoalDetail = ({ goal, onClose, onEdit, onDelete }) => {
  if (!goal) {
    return null;
  }

  return (
    <Modal title="Goal Details" onClose={onClose}>
      <div className="p-4 flex flex-col h-full">
        <div className="pb-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-2xl font-bold leading-6 text-gray-900 break-words">
            {goal.title}
          </h3>
        </div>

        <div className="flex items-center space-x-6 mt-4 text-sm text-gray-700 flex-wrap gap-y-2 flex-shrink-0">
          {goal.category && (
            <span className="inline-flex items-center">
              <Tag className="h-4 w-4 mr-1 text-blue-500" /> {goal.category}
            </span>
          )}
          {goal.type && (
            <span className="inline-flex items-center">Type: {goal.type}</span>
          )}
          {goal.priority && renderPriority(goal.priority)}
          {goal.targetDate && (
            <span className="inline-flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" /> Target Date:{" "}
              {new Date(goal.targetDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {goal.progress !== undefined && (
          <div className="mt-4 flex-shrink-0">
            <div className="flex items-center mb-1 text-gray-700">
              <span className="font-medium text-sm">
                Progress: {goal.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {goal.description && (
          <div className="mt-4 text-gray-700 leading-relaxed overflow-y-auto flex-grow pr-2 min-h-[100px]">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h4>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {goal.description}
            </ReactMarkdown>
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onEdit(goal)}
          >
            <Edit
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
            Edit
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GoalDetail;
