import React, { useState, useEffect } from 'react';

const JournalEntryForm = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Set initial form values if entry is provided (for editing)
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setMood(entry.mood || '');
    } else {
      // Clear form for new entry
      setTitle('');
      setContent('');
      setMood('');
    }
  }, [entry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    try {
      setSaving(true);
      
      const entryData = {
        title,
        content,
        mood: mood || null
      };
      
      let response;
      
      if (entry?.id) {
        // Update existing entry
        response = await fetch(`http://localhost:5000/api/entries/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entryData)
        });
      } else {
        // Create new entry
        response = await fetch('http://localhost:5000/api/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entryData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save entry');
      }
      
      const savedEntry = await response.json();
      onSave(savedEntry);
      
      // Clear form and errors
      setError(null);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="journal-entry-form">
      <h2>{entry?.id ? 'Edit Entry' : 'New Journal Entry'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind today?"
            required
          />
        </div>
        
        <div className="form-group">
          <label>How are you feeling?</label>
          <div className="mood-selector">
            <button
              type="button"
              className={`mood-button ${mood === 'Good' ? 'selected' : ''}`}
              onClick={() => setMood('Good')}
            >
              <span role="img" aria-label="Good">😊</span>
              <span>Good</span>
            </button>
            
            <button
              type="button"
              className={`mood-button ${mood === 'Neutral' ? 'selected' : ''}`}
              onClick={() => setMood('Neutral')}
            >
              <span role="img" aria-label="Neutral">😐</span>
              <span>Neutral</span>
            </button>
            
            <button
              type="button"
              className={`mood-button ${mood === 'Not Great' ? 'selected' : ''}`}
              onClick={() => setMood('Not Great')}
            >
              <span role="img" aria-label="Not Great">😔</span>
              <span>Not Great</span>
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Journal Entry</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={8}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;