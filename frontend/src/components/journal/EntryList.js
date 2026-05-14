import React from 'react';
import EntryCard from './EntryCard';

// Added entries, onEditEntry, onDeleteEntry, and onSelectEntry props
const EntryList = ({ entries, onEditEntry, onDeleteEntry, onSelectEntry }) => {

  return (
    <div className="grid gap-6">
      {/* Check if entries is an array before mapping */}
      {Array.isArray(entries) && entries.map(entry => (
        <EntryCard
          key={entry.id} // Use unique ID from backend
          entry={entry}
          onEdit={onEditEntry} // Pass the edit handler
          onDelete={onDeleteEntry} // Pass the delete handler
          onSelect={onSelectEntry} // Pass the select handler
        />
      ))}
       {/* Message if no entries */}
       {(!entries || entries.length === 0) && (
           <p className="text-center text-gray-500 italic">No journal entries yet. Click "New Entry" to add one!</p>
       )}
    </div>
  );
};

export default EntryList;
