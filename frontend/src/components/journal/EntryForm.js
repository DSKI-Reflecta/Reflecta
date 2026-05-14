import React, { useState, useEffect } from 'react';
// Importing icons for sliders: Sentiment, Sleep, Stress, Social Engagement
import {
    Smile, Frown, Moon, Sun, // Sentiment, Sleep
    Zap, Feather, // Stress (using Zap for high stress, Feather for low)
    User, Users // Social Engagement
} from 'lucide-react';

// Added onSave prop to handle saving/updating the entry
const EntryForm = ({ onClose, onSave, editEntry = null }) => {
  const [entry, setEntry] = useState({
    // Basic entry fields
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0], // Store date in 'YYYY-MM-DD' format
    // State tracking fields (default values)
    sentiment: 3, // Default neutral sentiment (1-5)
    sleep: 3,     // Default average sleep (1-5)
    stress: 3,    // Default average stress (1-5)
    socialEngagement: 3, // Default moderate social engagement (e.g., 1-5 scale)
    // We will NOT generate ID here, backend will provide it on creation
    // id: editEntry?.id
  });

   // Populate form if editing an existing entry
  useEffect(() => {
    if (editEntry) {
      setEntry({
         ...editEntry,
         // Ensure date is in YYYY-MM-DD format for input type="date"
         // Backend date might be ISO string, so split it
         date: editEntry.date ? editEntry.date.split('T')[0] : '',
         // Explicitly set slider values from editEntry (using backend field names)
         sentiment: editEntry.sentiment_level !== undefined && editEntry.sentiment_level !== null ? editEntry.sentiment_level : 3,
         sleep: editEntry.sleep_quality !== undefined && editEntry.sleep_quality !== null ? editEntry.sleep_quality : 3,
         stress: editEntry.stress_level !== undefined && editEntry.stress_level !== null ? editEntry.stress_level : 3,
         socialEngagement: editEntry.social_engagement !== undefined && editEntry.social_engagement !== null ? editEntry.social_engagement : 3,
      });
    } else {
        // Reset form for new entry
         setEntry({
            title: '',
            content: '',
            date: new Date().toISOString().split('T')[0],
            sentiment: 3,
            sleep: 3,
            stress: 3,
            socialEngagement: 3,
         });
    }
  }, [editEntry]); // Depend on editEntry


  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert slider values (which are strings) to numbers
    const newValue = type === 'range' ? parseInt(value, 10) : value;

    setEntry(prev => ({ ...prev, [name]: newValue }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!entry.title || !entry.content || !entry.date) {
        alert("Please fill out Title, Content, and Date."); // Replace with a better UI message
        return;
    }
    // Pass the current entry state to the onSave handler
    onSave(entry);
    // onClose(); // onClose is called by the parent after saving
  };

  // Helper to render slider with label, icons, and value display
  const renderSlider = (name, label, min, max, minIcon, maxIcon, step = 1) => (
      <div>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}: {entry[name]}</label>
          <div className="flex items-center space-x-2 mt-1"> {/* Container for icons and slider */}
              {minIcon} {/* Icon for the minimum value */}
              <input
                  type="range"
                  id={name}
                  name={name}
                  min={min}
                  max={max}
                  step={step}
                  // Use the corresponding state value for the slider
                  value={entry[name]}
                  onChange={handleChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" // Tailwind range styling, flex-1 to fill space
              />
              {maxIcon} {/* Icon for the maximum value */}
          </div>
          {/* Optional labels for min/max slider values */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{min}</span>
              <span>{max}</span>
          </div>
      </div>
  );


  return (
    // Added max-h-full and overflow-y-auto to the form itself
    // This ensures the form content is scrollable within the modal if it gets too tall
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-h-full overflow-y-auto">
      {/* Date Picker */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={entry.date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={entry.title}
          onChange={handleChange}
          placeholder="What's on your mind today?"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Journal Entry</label>
        <textarea
          id="content"
          name="content"
          rows="4" // Reduced default rows slightly
          value={entry.content}
          onChange={handleChange}
          placeholder="Write your thoughts here..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        ></textarea>
      </div>

      {/* State Tracking Sliders */}
      <div className="space-y-4 pt-4 border-t border-gray-200"> {/* Reduced space-y slightly */}
        <h3 className="text-lg font-semibold text-gray-800">Track Your State</h3>
         {/* Render sliders with icons */}
         {renderSlider('sentiment', 'Sentiment', 1, 5, <Frown className="h-5 w-5 text-gray-500" />, <Smile className="h-5 w-5 text-gray-500" />)}
         {renderSlider('sleep', 'Sleep Quality', 1, 5, <Moon className="h-5 w-5 text-gray-500" />, <Sun className="h-5 w-5 text-gray-500" />)}
         {renderSlider('stress', 'Stress Level', 1, 5, <Feather className="h-5 w-5 text-gray-500" />, <Zap className="h-5 w-5 text-gray-500" />)}
         {renderSlider('socialEngagement', 'Social Engagement (1=Alone, 5=Very Social)', 1, 5, <User className="h-5 w-5 text-gray-500" />, <Users className="h-5 w-5 text-gray-500" />)}
      </div>


      {/* Buttons */}
      <div className="flex justify-end space-x-3 mt-6 flex-shrink-0"> {/* Added flex-shrink-0 */}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {editEntry ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};

export default EntryForm;
