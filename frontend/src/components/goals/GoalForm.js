import React, { useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
const GoalForm = ({ onClose, onSave, editGoal = null }) => {
  const [goal, setGoal] = useState({
    title: "",
    type: "One-time",
    targetDate: "",
    category: "",
    priority: "Low",
    description: "",
    progress: 0,
  });

  const priorityLevels = ["Low", "Medium", "High"];
  const getPriorityString = (sliderValue) => priorityLevels[sliderValue];
  const getPrioritySliderValue = (priorityString) =>
    priorityLevels.indexOf(priorityString);

  useEffect(() => {
    if (editGoal) {
      setGoal({
        ...editGoal,
        targetDate: editGoal.targetDate
          ? editGoal.targetDate.split("T")[0]
          : "",
        priority: editGoal.priority || "Low",
      });
    } else {
      setGoal({
        title: "",
        type: "One-time",
        targetDate: "",
        category: "",
        priority: "Low",
        description: "",
        progress: 0,
      });
    }
  }, [editGoal]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "priority") {
      const sliderValue = parseInt(value, 10);
      setGoal((prev) => ({
        ...prev,
        priority: getPriorityString(sliderValue),
      }));
    } else if (type === "range") {
      const newValue = parseInt(value, 10);
      setGoal((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else if (name === "type") {
      setGoal((prev) => ({
        ...prev,
        type: value,
        targetDate: value === "Recurring" ? "" : prev.targetDate,
      }));
    } else {
      setGoal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goal.title || !goal.category) {
      alert("Please fill out Title and Category.");
      return;
    }
    if (goal.type === "One-time" && !goal.targetDate) {
      alert("Please fill out the Target Date for One-time goals.");
      return;
    }

    const goalDataToSave = { ...goal };
    if (goalDataToSave.type === "Recurring") {
      delete goalDataToSave.targetDate;
    }

    onSave(goalDataToSave);
  };

  const renderPrioritySlider = () => (
    <div>
      <label
        htmlFor="priority"
        className="block text-sm font-medium text-gray-700"
      >
        Priority: {goal.priority}
      </label>
      <div className="flex items-center space-x-2 mt-1">
        <ArrowDownCircle className="h-5 w-5 text-gray-500" />
        <input
          type="range"
          id="priority"
          name="priority"
          min="0"
          max="2"
          step="1"
          value={getPrioritySliderValue(goal.priority)}
          onChange={handleChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
        />
        <ArrowUpCircle className="h-5 w-5 text-red-500" />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Goal Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={goal.title}
          onChange={handleChange}
          placeholder="What do you want to achieve?"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Goal Type
        </label>
        <div className="mt-1 flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="type"
              value="One-time"
              checked={goal.type === "One-time"}
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
              checked={goal.type === "Recurring"}
              onChange={handleChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-gray-700">Recurring</span>
          </label>
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
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

      {renderPrioritySlider()}

      <div>
        <label
          htmlFor="targetDate"
          className="block text-sm font-medium text-gray-700"
        >
          Target Date
        </label>
        <input
          type="date"
          id="targetDate"
          name="targetDate"
          value={goal.targetDate}
          onChange={handleChange}
          disabled={goal.type === "Recurring"}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            goal.type === "Recurring" ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description (Optional)
        </label>
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

      {editGoal?.id && (
        <div>
          <label
            htmlFor="progress"
            className="block text-sm font-medium text-gray-700"
          >
            Progress (%)
          </label>
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
          <p className="text-sm text-gray-600 mt-1">
            {goal.progress}% complete
          </p>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="ai-suggestions"
          className="form-checkbox text-blue-600"
          disabled
        />
        <label
          htmlFor="ai-suggestions"
          className="ml-2 text-sm text-gray-500 italic"
        >
          Get AI suggestions for this goal (Coming soon)
        </label>
      </div>

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
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          {editGoal ? "Update Goal" : "Create Goal"}
        </button>
      </div>
    </form>
  );
};

export default GoalForm;
