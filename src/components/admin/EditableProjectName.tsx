'use client';

import { useState, useTransition } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { updateProjectName } from '../../../src/app/[lang]/admin/projects/[id]/actions';
import type { Project } from '../../../src/app/[lang]/admin/projects/actions';

export default function EditableProjectName({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(project.name);
  const [originalName, setOriginalName] = useState(project.name);
  const [isPending, startTransition] = useTransition();
  const handleSave = () => {
    const trimmedName = currentName.trim();
    if (trimmedName === originalName || trimmedName === '') {
      setIsEditing(false);
      setCurrentName(originalName);
      return;
    }
    
    startTransition(async () => {
      const result = await updateProjectName(project.id, trimmedName);
      if (result?.success) {
        
        setOriginalName(result.newName);
      } else {
        setCurrentName(originalName);
      }
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentName(originalName);
  };
  
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold">Správa fotek pro:</span>
        <input
          type="text"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          className="text-xl font-bold p-1 border rounded-md"
          autoFocus
          
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <button
          onClick={handleSave}
          disabled={isPending || currentName.trim() === ''}
          className="p-2 rounded-md hover:bg-green-100 text-green-600 disabled:opacity-50"
          aria-label="Uložit jméno"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="p-2 rounded-md hover:bg-red-100 text-red-600 disabled:opacity-50"
          aria-label="Zrušit"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-xl font-semibold">
        Správa fotek pro: <span className="font-bold">{originalName}</span>
      </h1>
      <button
        onClick={() => setIsEditing(true)}
        className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-all ease-in-out duration-200 text-gray-600"
        aria-label="Upravit jméno projektu"
      >
        <Pencil size={18} />
      </button>
    </div>
  );
}