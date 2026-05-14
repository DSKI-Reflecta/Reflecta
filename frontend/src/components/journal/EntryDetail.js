import React, { useState } from "react";
import {
  X,
  Edit,
  Trash2,
  Smile,
  Frown,
  Moon,
  Sun,
  Zap,
  Feather,
  User,
  Users,
  Meh,
  FileText,
  File,
  Activity,
  Heart,
  Flag,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const renderStateIcon = (type, value) => {
  if (value === undefined || value === null) return null;
  const numericValue = parseInt(value, 10);
  if (isNaN(numericValue)) return null;

  if (type === "sentiment") {
    if (numericValue >= 4) return <Smile className="h-5 w-5 text-green-500" />;
    if (numericValue <= 2) return <Frown className="h-5 w-5 text-red-500" />;
    return <Meh className="h-5 w-5 text-yellow-500" />;
  }
  if (type === "sleep") {
    if (numericValue >= 4) return <Sun className="h-5 w-5 text-green-500" />;
    if (numericValue <= 2) return <Moon className="h-5 w-5 text-red-500" />;
    return <Moon className="h-5 w-5 text-yellow-500" />;
  }
  if (type === "stress") {
    if (numericValue >= 4) return <Zap className="h-5 w-5 text-red-500" />;
    if (numericValue <= 2)
      return <Feather className="h-5 w-5 text-green-500" />;
    return <Feather className="h-5 w-5 text-yellow-500" />;
  }
  if (type === "social_engagement") {
    if (numericValue >= 4) return <Users className="h-5 w-5 text-green-500" />;
    if (numericValue <= 2) return <User className="h-5 w-5 text-red-500" />;
    return <User className="h-5 w-5 text-yellow-500" />;
  }
  return null;
};

const EntryDetail = ({ entry, onClose, onEdit, onDelete }) => {
  const [showOriginalContent, setShowOriginalContent] = useState(false);

  if (!entry) {
    return null;
  }

  const displayContent = showOriginalContent
    ? entry.content
    : entry.formatted_content || entry.content;

  const hasFormattedContent =
    entry.formatted_content && entry.formatted_content !== entry.content;

  const activities = entry.activities
    ? entry.activities
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item)
    : [];
  const sentiments = entry.sentiments
    ? entry.sentiments
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item)
    : [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl p-6 max-h-[95vh] flex flex-col">
        <div className="absolute top-4 right-4">
          <button
            type="button"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="pb-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-2xl font-bold leading-6 text-gray-900 break-words">
            {entry.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {entry.date
              ? new Date(entry.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No date"}
          </p>
        </div>

        {(entry.sentiment_level !== undefined &&
          entry.sentiment_level !== null) ||
        (entry.sleep_quality !== undefined && entry.sleep_quality !== null) ||
        (entry.stress_level !== undefined && entry.stress_level !== null) ||
        (entry.social_engagement !== undefined &&
          entry.social_engagement !== null) ? (
          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-700 flex-wrap gap-y-2 flex-shrink-0">
            {entry.sentiment_level !== undefined &&
              entry.sentiment_level !== null && (
                <span className="flex items-center">
                  {renderStateIcon("sentiment", entry.sentiment_level)}
                  <span className="ml-1">{entry.sentiment_level}/5</span>
                </span>
              )}
            {entry.sleep_quality !== undefined &&
              entry.sleep_quality !== null && (
                <span className="flex items-center">
                  {renderStateIcon("sleep", entry.sleep_quality)}
                  <span className="ml-1">{entry.sleep_quality}/5</span>
                </span>
              )}
            {entry.stress_level !== undefined &&
              entry.stress_level !== null && (
                <span className="flex items-center">
                  {renderStateIcon("stress", entry.stress_level)}
                  <span className="ml-1">{entry.stress_level}/5</span>
                </span>
              )}
            {entry.social_engagement !== undefined &&
              entry.social_engagement !== null && (
                <span className="flex items-center">
                  {renderStateIcon(
                    "social_engagement",
                    entry.social_engagement
                  )}
                  <span className="ml-1">{entry.social_engagement}/5</span>
                </span>
              )}
          </div>
        ) : null}

        <div className="flex flex-wrap items-start gap-6 mt-4 flex-shrink-0">
          {entry.goals && entry.goals.length > 0 && (
            <div className="">
              <div className="flex items-center mb-1 text-gray-700">
                <Flag className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-medium text-sm">Goals</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry.goals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs"
                  >
                    {goal.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activities.length > 0 && (
            <div className="">
              <div className="flex items-center mb-1 text-gray-700">
                <Activity className="h-4 w-4 text-blue-500 mr-2" />
                <span className="font-medium text-sm">Activities</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {activities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sentiments.length > 0 && (
            <div className="">
              <div className="flex items-center mb-1 text-gray-700">
                <Heart className="h-4 w-4 text-rose-500 mr-2" />
                <span className="font-medium text-sm">Sentiments</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sentiments.map((sentiment, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs"
                  >
                    {sentiment}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasFormattedContent && (
          <div className="mt-8 pt-4 border-t border-gray-200 flex items-center text-sm text-gray-600 space-x-2 flex-shrink-0">
            <button
              className={`flex items-center px-3 py-2 rounded-md ${
                !showOriginalContent
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100"
              }`}
              onClick={() => setShowOriginalContent(false)}
            >
              <FileText className="h-4 w-4 mr-1" />
              Formatted
            </button>
            <button
              className={`flex items-center px-3 py-2 rounded-md ${
                showOriginalContent
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100"
              }`}
              onClick={() => setShowOriginalContent(true)}
            >
              <File className="h-4 w-4 mr-1" />
              Original
            </button>
          </div>
        )}

        <div className="mt-4 text-gray-700 leading-relaxed overflow-y-auto flex-grow pr-2 min-h-[100px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayContent}
          </ReactMarkdown>
        </div>

        <div className="mt-4 flex justify-end space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onEdit(entry)}
          >
            <Edit
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
            Edit
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryDetail;
