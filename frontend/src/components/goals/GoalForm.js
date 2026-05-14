import React, { useState, useEffect } from 'react'; // Added useEffect

// Added onSave prop to handle saving/updating the goal
const GoalForm = ({ onClose, onSave, editGoal = null }) => {
  const [goal, setGoal] = useState({
    title: '',
    type: 'One-time', // Default type
    targetDate: '',
    category: '', // New field
    priority: 0, // New field, default priority
    description: '', // New field
    // Progress and streak are not set on creation, only updated later
    progress: editGoal?.progress || 0, // Keep progress if editing
    id: editGoal?.id || Date.now() // Add ID, use existing if editing
  });

  // Populate form if editing an existing goal
  useEffect(() => {
    if (editGoal) {
      setGoal(editGoal);
    }
  }, [editGoal]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox/radio button if needed, currently only text/select/range
    setGoal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!goal.title || !goal.targetDate || !goal.category) {
        alert("Please fill out Title, Target Date, and Category."); // Replace with a better UI message
        return;
    }
    onSave(goal); // Call onSave with the goal data
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4"> {/* Added padding */}
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Goal Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={goal.title}
          onChange={handleChange}
          placeholder="What do you want to achieve?" // Placeholder from image
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Goal Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Goal Type</label>
        <div className="mt-1 flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="type"
              value="One-time"
              checked={goal.type === 'One-time'}
              onChange={handleChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-gray-700">One-time</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="type"
              value="Recurring"
              checked={goal.type === 'Recurring'}
              onChange={handleChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-gray-700">Recurring</span>
          </label>
        </div>
      </div>

       {/* Category */}
       <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={goal.category}
          onChange={handleChange}
          placeholder="e.g., Health, Career, Personal"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

       {/* Priority (using a number input for simplicity, could be drag handle) */}
       <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <input
          type="number"
          id="priority"
          name="priority"
          value={goal.priority}
          onChange={handleChange}
          min="0" // Assuming 0 is highest priority, adjust as needed
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>


      {/* Target Date */}
      <div>
        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">Target Date</label>
        {/* Using type="date" for better mobile experience and date picker */}
        <input
          type="date"
          id="targetDate"
          name="targetDate"
          value={goal.targetDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

       {/* Description */}
       <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={goal.description}
          onChange={handleChange}
          rows="3"
          placeholder="Add details about your goal..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
      </div>


      {/* Progress input only shown when editing */}
      {editGoal && (
        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-gray-700">Progress (%)</label>
          <input
            type="range"
            id="progress"
            name="progress"
            min="0"
            max="100"
            value={goal.progress}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
          <p className="text-sm text-gray-600 mt-1">{goal.progress}% complete</p>
        </div>
      )}

       {/* AI Suggestions Placeholder */}
       <div className="flex items-center">
           <input type="checkbox" id="ai-suggestions" className="form-checkbox text-blue-600" disabled />
           <label htmlFor="ai-suggestions" className="ml-2 text-sm text-gray-500 italic">Get AI suggestions for this goal (Coming soon)</label>
       </div>


      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          // Adjusted button style to match the image (green)
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          {editGoal ? 'Update Goal' : 'Create Goal'} {/* Button text from image */}
        </button>
      </div>
    </form>
  );
};

export default GoalForm;
