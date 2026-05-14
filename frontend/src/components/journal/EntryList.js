import React from "react";
import EntryCard from "./EntryCard";

const EntryList = ({ entries, onEditEntry, onDeleteEntry, onSelectEntry }) => {
  return (
    <div className="grid gap-6">
      {Array.isArray(entries) &&
        entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEditEntry}
            onDelete={onDeleteEntry}
            onSelect={onSelectEntry}
          />
        ))}
      {(!entries || entries.length === 0) && (
        <p className="text-center text-gray-500 italic">
          No journal entries yet. Click "New Entry" to add one!
        </p>
      )}
    </div>
  );
};

export default EntryList;
