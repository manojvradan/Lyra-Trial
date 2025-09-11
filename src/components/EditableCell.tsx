// src/components/EditableCell.tsx
import React, { useState, useRef, useEffect } from 'react';

interface EditableCellProps {
  initialValue: string;
  onSave: (newValue: string) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({ initialValue, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (value !== initialValue) {
      onSave(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-full w-full bg-white px-2 py-1.5 outline-none ring-2 ring-blue-500"
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="h-full truncate px-2 py-1.5"
    >
      {initialValue}
    </div>
  );
};