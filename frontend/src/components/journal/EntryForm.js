import React, { useState, useEffect } from "react";
import {
  Smile,
  Frown,
  Moon,
  Sun,
  Zap,
  Feather,
  User,
  Users,
} from "lucide-react";

const EntryForm = ({ onClose, onSave, editEntry = null }) => {
  const [entry, setEntry] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    sentiment: 3,
    sleep: 3,
    stress: 3,
    socialEngagement: 3,
  });

  useEffect(() => {
    if (editEntry) {
      setEntry({
        ...editEntry,
        date: editEntry.date ? editEntry.date.split("T")[0] : "",
        sentiment:
          editEntry.sentiment_level !== undefined &&
          editEntry.sentiment_level !== null
            ? editEntry.sentiment_level
            : 3,
        sleep:
          editEntry.sleep_quality !== undefined &&
          editEntry.sleep_quality !== null
            ? editEntry.sleep_quality
            : 3,
        stress:
          editEntry.stress_level !== undefined &&
          editEntry.stress_level !== null
            ? editEntry.stress_level
            : 3,
        socialEngagement:
          editEntry.social_engagement !== undefined &&
          editEntry.social_engagement !== null
            ? editEntry.social_engagement
            : 3,
      });
    } else {
      setEntry({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        sentiment: 3,
        sleep: 3,
        stress: 3,
        socialEngagement: 3,
      });
    }
  }, [editEntry]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    const newValue = type === "range" ? parseInt(value, 10) : value;

    setEntry((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entry.title || !entry.content || !entry.date) {
      alert("Please fill out Title, Content, and Date.");
      return;
    }
    onSave(entry);
  };

  const renderSlider = (name, label, min, max, minIcon, maxIcon, step = 1) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}: {entry[name]}
      </label>
      <div className="flex items-center space-x-2 mt-1">
        {minIcon}
        <input
          type="range"
          id={name}
          name={name}
          min={min}
          max={max}
          step={step}
          value={entry[name]}
          onChange={handleChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
        />
        {maxIcon}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 max-h-full overflow-y-auto"
    >
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date
        </label>
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

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
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

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Journal Entry
        </label>
        <textarea
          id="content"
          name="content"
          rows="4"
          value={entry.content}
          onChange={handleChange}
          placeholder="Write your thoughts here..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        ></textarea>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Track Your State
        </h3>
        {renderSlider(
          "sentiment",
          "Sentiment",
          1,
          5,
          <Frown className="h-5 w-5 text-gray-500" />,
          <Smile className="h-5 w-5 text-gray-500" />
        )}
        {renderSlider(
          "sleep",
          "Sleep Quality",
          1,
          5,
          <Moon className="h-5 w-5 text-gray-500" />,
          <Sun className="h-5 w-5 text-gray-500" />
        )}
        {renderSlider(
          "stress",
          "Stress Level",
          1,
          5,
          <Feather className="h-5 w-5 text-gray-500" />,
          <Zap className="h-5 w-5 text-gray-500" />
        )}
        {renderSlider(
          "socialEngagement",
          "Social Engagement",
          1,
          5,
          <User className="h-5 w-5 text-gray-500" />,
          <Users className="h-5 w-5 text-gray-500" />
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-6 flex-shrink-0">
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
          {editEntry ? "Update Entry" : "Save Entry"}
        </button>
      </div>
    </form>
  );
};

export default EntryForm;
