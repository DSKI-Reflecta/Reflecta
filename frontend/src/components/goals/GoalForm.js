import React, { useState, useEffect } from 'react';
// Import icons for priority levels
import { ArrowDownCircle, MinusCircle, ArrowUpCircle } from 'lucide-react';


// Added onSave prop to handle saving/updating the goal
const GoalForm = ({ onClose, onSave, editGoal = null }) => {
  const [goal, setGoal] = useState({
    title: '',
    type: 'One-time', // Default type
    targetDate: '', // Initialize as empty string
    category: '',
    priority: 'Low', // Initialize with default string value
    description: '',
    progress: 0, // Default progress to 0
  });

   // Map slider value (0, 1, 2) to priority string ('Low', 'Medium', 'High')
  const priorityLevels = ['Low', 'Medium', 'High'];
  const getPriorityString = (sliderValue) => priorityLevels[sliderValue];
  const getPrioritySliderValue = (priorityString) => priorityLevels.indexOf(priorityString);


  // Populate form if editing an existing goal
  useEffect(() => {
    if (editGoal) {
      setGoal({
        ...editGoal,
        // Ensure targetDate is in ISO format or empty string for input type="date"
        targetDate: editGoal.targetDate ? editGoal.targetDate.split('T')[0] : '',
        // Ensure priority is set correctly from backend string
        priority: editGoal.priority || 'Low', // Default to 'Low' if not set
      });
    } else {
       // Reset form for new goal
       setGoal({
            title: '',
            type: 'One-time',
            targetDate: '', // Reset to empty string
            category: '',
            priority: 'Low', // Default priority for new goals
            description: '',
            progress: 0,
       });
    }
  }, [editGoal]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Handle number input for priority slider and range input for progress
    if (name === 'priority') {
        const sliderValue = parseInt(value, 10);
        setGoal(prev => ({
            ...prev,
            priority: getPriorityString(sliderValue) // Store the string value
        }));
    } else if (type === 'range') {
         const newValue = parseInt(value, 10);
         setGoal(prev => ({
            ...prev,
            [name]: newValue
         }));
    } else if (name === 'type') {
         // When goal type changes, update the state and clear target date if recurring
         setGoal(prev => ({
             ...prev,
             type: value,
             targetDate: value === 'Recurring' ? '' : prev.targetDate // Clear date if recurring
         }));
    }
    else {
        setGoal(prev => ({
            ...prev,
            [name]: value
        }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation - targetDate is only required for 'One-time' goals
    if (!goal.title || !goal.category) {
        alert("Please fill out Title and Category."); // Replace with a better UI message
        return;
    }
    if (goal.type === 'One-time' && !goal.targetDate) {
         alert("Please fill out the Target Date for One-time goals.");
         return;
    }

    // Prepare data to send to backend
    const goalDataToSave = { ...goal };
    // If goal is recurring, remove targetDate from the data sent to backend
    if (goalDataToSave.type === 'Recurring') {
        delete goalDataToSave.targetDate;
    }


    onSave(goalDataToSave); // Call onSave with the goal data
    // onClose(); // onClose is called by the parent after saving
  };

   // Helper to render slider with label, icons, and value display
  const renderPrioritySlider = () => (
      <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority: {goal.priority}</label>
          <div className="flex items-center space-x-2 mt-1"> {/* Container for icons and slider */}
              {/* Icon for Low Priority */}
              <ArrowDownCircle className="h-5 w-5 text-gray-500" />
              <input
                  type="range"
                  id="priority"
                  name="priority"
                  min="0"
                  max="2"
                  step="1"
                  // Use the mapped slider value for the input
                  value={getPrioritySliderValue(goal.priority)}
                  onChange={handleChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg" // Tailwind range styling, flex-1 to fill space
              />
              {/* Icon for High Priority */}
              <ArrowUpCircle className="h-5 w-5 text-red-500" />
          </div>
          {/* Optional labels for slider values */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
          </div>
      </div>
  );


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

       {/* Priority Slider */}
       {renderPrioritySlider()}


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
          // Conditionally disable and style if type is Recurring
          disabled={goal.type === 'Recurring'}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${goal.type === 'Recurring' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          // Remove 'required' attribute from the input, handle validation in handleSubmit
          // required={goal.type === 'One-time'}
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
      {/* Check if editGoal exists AND has an ID before showing progress */}
      {editGoal?.id && (
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
