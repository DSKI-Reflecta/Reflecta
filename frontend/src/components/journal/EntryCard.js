import React from 'react';
// Import necessary icons, including Meh
import { Edit, Trash2, Smile, Frown, Moon, Sun, Zap, Feather, User, Users, Meh } from 'lucide-react';

// Added onEdit, onDelete, and onSelect props
const EntryCard = ({ entry, onEdit, onDelete, onSelect }) => {
  // Helper to render state icon based on value (copied from EntryDetail)
  const renderStateIcon = (type, value) => {
      if (value === undefined || value === null) return null;
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue)) return null;

      if (type === 'sentiment') {
          if (numericValue >= 4) return <Smile className="h-4 w-4 text-green-500" />;
          if (numericValue <= 2) return <Frown className="h-4 w-4 text-red-500" />;
          return <Meh className="h-4 w-4 text-yellow-500" />;
      }
       if (type === 'sleep') {
           if (numericValue >= 4) return <Sun className="h-4 w-4 text-yellow-500" />;
           if (numericValue <= 2) return <Moon className="h-4 w-4 text-blue-500" />;
           return <Moon className="h-4 w-4 text-gray-500" />;
       }
       if (type === 'stress') {
           if (numericValue >= 4) return <Zap className="h-4 w-4 text-red-500" />;
           if (numericValue <= 2) return <Feather className="h-4 w-4 text-green-500" />;
           return <Feather className="h-4 w-4 text-gray-500" />;
       }
        if (type === 'social_engagement') {
           if (numericValue >= 4) return <Users className="h-4 w-4 text-blue-500" />;
           if (numericValue <= 2) return <User className="h-4 w-4 text-gray-500" />;
           return <User className="h-4 w-4 text-gray-500" />;
       }
      return null;
  };

  return (
    // Make the entire card clickable and add a cursor style
    // Call onSelect when the card is clicked, but prevent event propagation
    // from buttons inside the card.
    <div
        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
        onClick={() => onSelect(entry)} // Call onSelect when card is clicked
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
          {/* Display date - format as needed */}
          <p className="text-sm text-gray-600">{entry.date ? new Date(entry.date).toLocaleDateString() : 'No date'}</p>

          {/* Display State Tracking Data with Icons */}
          {(entry.sentiment_level !== undefined && entry.sentiment_level !== null) ||
           (entry.sleep_quality !== undefined && entry.sleep_quality !== null) ||
           (entry.stress_level !== undefined && entry.stress_level !== null) ||
           (entry.social_engagement !== undefined && entry.social_engagement !== null) ? (
               <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
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


        </div>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}> {/* Prevent click event from bubbling up to the card */}
            <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => onEdit(entry)} // Call onEdit with the entry object
                aria-label="Edit Entry"
            >
                <Edit className="h-5 w-5" />
            </button>
            <button
                className="p-1 text-red-400 hover:text-red-600"
                onClick={() => onDelete(entry.id)} // Call onDelete with the entry id
                aria-label="Delete Entry"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
      </div>
      {/* Removed the display of entry.content here */}
      {/* Removed the optional display of Activities and Keywords here */}

    </div>
  );
};

export default EntryCard;
