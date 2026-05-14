
import React from 'react';
// Import necessary icons, same as EntryCard
import { X, Edit, Trash2, Smile, Frown, Moon, Sun, Zap, Feather, User, Users, Meh } from 'lucide-react';

// Helper function to render state icons (copied from EntryCard for self-containment)
const renderStateIcon = (type, value) => {
    if (value === undefined || value === null) return null;
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return null;

    if (type === 'sentiment') {
        if (numericValue >= 4) return <Smile className="h-5 w-5 text-green-500" />;
        if (numericValue <= 2) return <Frown className="h-5 w-5 text-red-500" />;
        return <Meh className="h-5 w-5 text-yellow-500" />;
    }
     if (type === 'sleep') {
         if (numericValue >= 4) return <Sun className="h-5 w-5 text-yellow-500" />;
         if (numericValue <= 2) return <Moon className="h-5 w-5 text-blue-500" />;
         return <Moon className="h-5 w-5 text-gray-500" />;
     }
     if (type === 'stress') {
         if (numericValue >= 4) return <Zap className="h-5 w-5 text-red-500" />;
         if (numericValue <= 2) return <Feather className="h-5 w-5 text-green-500" />;
         return <Feather className="h-5 w-5 text-gray-500" />;
     }
      if (type === 'social_engagement') {
         if (numericValue >= 4) return <Users className="h-5 w-5 text-blue-500" />;
         if (numericValue <= 2) return <User className="h-5 w-5 text-gray-500" />;
         return <User className="h-5 w-5 text-gray-500" />;
     }
    return null;
};


const EntryDetail = ({ entry, onClose, onEdit, onDelete }) => {
  // If no entry is provided, don't render anything
  if (!entry) {
    return null;
  }

  return (
    // Overlay for the background (optional, depends on how you integrate it)
    // If using a dedicated modal component in the parent, this overlay might be part of that.
    // This structure assumes you are rendering this component conditionally in your main app/page component.
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      {/* Modal content area */}
      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full md:max-w-xl lg:max-w-2xl p-6 max-h-[80vh] flex flex-col"> {/* Increased max-w to better match image proportions */}

        {/* Close button */}
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

        {/* Header: Title and Date */}
        <div className="pb-4 border-b border-gray-200 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <h3 className="text-2xl font-bold leading-6 text-gray-900 break-words">{entry.title}</h3> {/* break-words to prevent long titles overflowing */}
          <p className="mt-1 text-sm text-gray-500">
            {entry.date ? new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'No date'} {/* Nicer date format */}
          </p>
        </div>

        {/* State Tracking Data with Icons */}
        {(entry.sentiment_level !== undefined && entry.sentiment_level !== null) ||
         (entry.sleep_quality !== undefined && entry.sleep_quality !== null) ||
         (entry.stress_level !== undefined && entry.stress_level !== null) ||
         (entry.social_engagement !== undefined && entry.social_engagement !== null) ? (
             <div className="flex items-center space-x-6 mt-4 text-sm text-gray-700 flex-wrap gap-y-2 flex-shrink-0"> {/* Added flex-wrap and gap-y for smaller screens */}
                 {(entry.sentiment_level !== undefined && entry.sentiment_level !== null) && (
                     <span className="flex items-center">
                         {renderStateIcon('sentiment', entry.sentiment_level)}
                         <span className="ml-1">{entry.sentiment_level}/5</span>
                     </span>
                 )}
                 {(entry.sleep_quality !== undefined && entry.sleep_quality !== null) && (
                     <span className="flex items-center">
                         {renderStateIcon('sleep', entry.sleep_quality)}
                         <span className="ml-1">{entry.sleep_quality}/5</span>
                     </span>
                 )}
                 {(entry.stress_level !== undefined && entry.stress_level !== null) && (
                     <span className="flex items-center">
                         {renderStateIcon('stress', entry.stress_level)}
                         <span className="ml-1">{entry.stress_level}/5</span>
                     </span>
                 )}
                 {(entry.social_engagement !== undefined && entry.social_engagement !== null) && (
                     <span className="flex items-center">
                         {renderStateIcon('social_engagement', entry.social_engagement)}
                         <span className="ml-1">{entry.social_engagement}/5</span>
                     </span>
                 )}
             </div>
         ) : null}


        {/* Main Content - Scrollable Area */}
        {/* Added flex-grow and overflow-y-auto here */}
        <div className="mt-4 text-gray-700 leading-relaxed overflow-y-auto flex-grow pr-2"> {/* Added pr-2 for scrollbar padding */}
          <p className="whitespace-pre-wrap">{entry.content}</p> {/* Use whitespace-pre-wrap to respect line breaks */}
        </div>

        {/* Action Buttons (Edit/Delete) */}
        {/* Added flex-shrink-0 */}
        <div className="mt-4 flex justify-end space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => onEdit(entry)}
            >
                 <Edit className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
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