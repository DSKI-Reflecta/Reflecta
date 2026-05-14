import React from 'react';
// Import necessary icons, including Meh
import { Edit, Trash2, Smile, Frown, Moon, Sun, Zap, Feather, User, Users, Meh } from 'lucide-react';

// Added onEdit and onDelete props
const EntryCard = ({ entry, onEdit, onDelete }) => {
  // Helper to render state icon based on value (simple example)
  const renderStateIcon = (type, value) => {
      // Handle cases where value might be missing or null
      if (value === undefined || value === null) return null;

      // Ensure value is treated as a number
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue)) return null;

      if (type === 'sentiment') {
          if (numericValue >= 4) return <Smile className="h-4 w-4 text-green-500" />;
          if (numericValue <= 2) return <Frown className="h-4 w-4 text-red-500" />;
          // Return Meh for the neutral case (value is 3)
          return <Meh className="h-4 w-4 text-yellow-500" />;
      }
       if (type === 'sleep') {
           // Assuming higher value is better sleep
           if (numericValue >= 4) return <Sun className="h-4 w-4 text-yellow-500" />; // Good sleep
           if (numericValue <= 2) return <Moon className="h-4 w-4 text-blue-500" />; // Poor sleep
           // Return a neutral icon for average sleep (value is 3)
           return <Moon className="h-4 w-4 text-gray-500" />; // Average sleep (using Moon as a placeholder)
       }
       if (type === 'stress') {
           // Assuming higher value is more stress
           if (numericValue >= 4) return <Zap className="h-4 w-4 text-red-500" />; // High stress
           if (numericValue <= 2) return <Feather className="h-4 w-4 text-green-500" />; // Low stress
           // Return a neutral icon for moderate stress (value is 3)
           return <Feather className="h-4 w-4 text-gray-500" />; // Moderate stress (using Feather as a placeholder)
       }
        if (type === 'social_engagement') { // Match backend field name
           // Assuming higher value is more social
           if (numericValue >= 4) return <Users className="h-4 w-4 text-blue-500" />; // Very social
           if (numericValue <= 2) return <User className="h-4 w-4 text-gray-500" />; // Alone/Minimal
           // Return a neutral icon for moderate social engagement (value is 3)
           return <User className="h-4 w-4 text-gray-500" />; // Moderate social (using User as a placeholder)
       }
      return null; // Return null if type is unknown or value is invalid
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
          {/* Display date - format as needed */}
          {/* Check if entry.date exists before trying to format */}
          <p className="text-sm text-gray-600">{entry.date ? new Date(entry.date).toLocaleDateString() : 'No date'}</p>

          {/* Display State Tracking Data with Icons */}
          {/* Check if any state tracking data exists before rendering the div */}
          {(entry.sentiment_level !== undefined && entry.sentiment_level !== null) ||
           (entry.sleep_quality !== undefined && entry.sleep_quality !== null) ||
           (entry.stress_level !== undefined && entry.stress_level !== null) ||
           (entry.social_engagement !== undefined && entry.social_engagement !== null) ? (
               <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                   {/* Display each state value if it exists, using backend field names */}
                   {(entry.sentiment_level !== undefined && entry.sentiment_level !== null) && (
                       <span className="flex items-center">
                           {renderStateIcon('sentiment', entry.sentiment_level)} {/* Use sentiment_level */}
                           <span className="ml-1">{entry.sentiment_level}/5</span>
                       </span>
                   )}
                   {(entry.sleep_quality !== undefined && entry.sleep_quality !== null) && (
                       <span className="flex items-center">
                           {renderStateIcon('sleep', entry.sleep_quality)} {/* Use sleep_quality */}
                           <span className="ml-1">{entry.sleep_quality}/5</span>
                       </span>
                   )}
                   {(entry.stress_level !== undefined && entry.stress_level !== null) && (
                       <span className="flex items-center">
                           {renderStateIcon('stress', entry.stress_level)} {/* Use stress_level */}
                           <span className="ml-1">{entry.stress_level}/5</span>
                       </span>
                   )}
                   {(entry.social_engagement !== undefined && entry.social_engagement !== null) && (
                       <span className="flex items-center">
                           {renderStateIcon('social_engagement', entry.social_engagement)} {/* Use social_engagement */}
                           <span className="ml-1">{entry.social_engagement}/5</span>
                       </span>
                   )}
               </div>
           ) : null} {/* Render nothing if no state data */}


        </div>
        <div className="flex space-x-2"> {/* Buttons for Edit and Delete */}
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
      {/* Display Content */}
      <p className="text-gray-700 mt-2">{entry.content}</p>

       {/* Optional: Display Activities and Keywords if available */}
       {(entry.activities?.length > 0 || entry.keywords?.length > 0) && (
           <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
               {entry.activities?.length > 0 && (
                   <p><strong>Activities:</strong> {entry.activities.join(', ')}</p>
               )}
                {entry.keywords?.length > 0 && (
                   <p><strong>Keywords:</strong> {entry.keywords.join(', ')}</p>
               )}
           </div>
       )}
    </div>
  );
};

export default EntryCard;
