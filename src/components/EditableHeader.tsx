// src/components/EditableHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { IconType } from 'react-icons';

interface EditableHeaderProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  Icon: IconType;
}

export const EditableHeader: React.FC<EditableHeaderProps> = ({ initialValue, onSave, Icon }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when edit mode is activated
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select(); // Select all text for easy replacement
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Only save if the value has actually changed
    if (value.trim() !== initialValue && value.trim() !== '') {
      onSave(value.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setValue(initialValue); // Revert changes
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Icon />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave} // Save when the input loses focus
          onKeyDown={handleKeyDown}
          className="w-full bg-white px-1 py-0 outline-none ring-2 ring-blue-500"
        />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="flex cursor-pointer items-center gap-2 rounded hover:bg-gray-200"
    >
      <Icon /> {initialValue}
    </div>
  );
};