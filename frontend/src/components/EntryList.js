import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const EntryList = ({ onSelectEntry, onNewEntry }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/entries');
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }
        const data = await response.json();
        setEntries(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Helper function to render mood emoji
  const renderMoodEmoji = (mood) => {
    switch (mood?.toLowerCase()) {
      case 'good':
        return '😊';
      case 'neutral':
        return '😐';
      case 'not great':
        return '😔';
      default:
        return '';
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) return <div className="loading">Loading entries...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="entry-list">
      {entries.map((entry) => (
        <div 
          key={entry.id} 
          className="entry-card"
          onClick={() => onSelectEntry(entry)}
        >
          <h3>{entry.title}</h3>
          <div className="entry-meta">
            <span>{formatDate(entry.created_at)}</span>
            {entry.mood && (
              <span className="mood">
                Mood: {renderMoodEmoji(entry.mood)} {entry.mood}
              </span>
            )}
          </div>
          <p className="entry-preview">
            {entry.content.length > 100 
              ? `${entry.content.substring(0, 100)}...` 
              : entry.content}
          </p>
        </div>
      ))}
      
      <button className="new-entry-button" onClick={onNewEntry}>
        <span className="icon">+</span> New Entry
      </button>
    </div>
  );
};

export default EntryList;