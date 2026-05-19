'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { LanguageProficiency } from '@/lib/types';

const PROFICIENCY_LEVELS: LanguageProficiency[] = [
  'Native Speaker',
  'Fluent',
  'Professional Working Proficiency',
  'Limited Working Proficiency',
  'Elementary Proficiency',
];

export default function LanguagesStep({ headless = false }: { headless?: boolean }) {
  const languages = useResumeStore((state) => state.data.languages || []);
  const { addLanguage, updateLanguage, removeLanguage, reorderLanguages } = useResumeStore();

  const names = languages.map((l) => l.name.trim().toLowerCase());

  const isDuplicate = (id: string, name: string) => {
    const lower = name.trim().toLowerCase();
    return lower !== '' && names.filter((n) => n === lower).length > 1
      && languages.find((l) => l.id === id)?.name.trim().toLowerCase() === lower;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderLanguages(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-3">
      {!headless && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
          <p className="text-sm text-gray-500 mt-1">Add languages you speak and your proficiency level.</p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="languages-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {languages.map((lang, index) => {
                const duplicate = isDuplicate(lang.id, lang.name);
                return (
                  <Draggable key={lang.id} draggableId={lang.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-2 bg-white rounded-xl border px-3 py-2.5 transition-all ${
                          snapshot.isDragging
                            ? 'shadow-lg border-indigo-300'
                            : duplicate
                            ? 'border-amber-300 bg-amber-50'
                            : 'border-gray-200 shadow-sm'
                        }`}
                      >
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Language name */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
                            placeholder="e.g. English"
                            className={`w-full rounded-lg border px-3 py-1.5 text-sm text-gray-900 bg-white focus:ring-1 outline-none transition-colors ${
                              duplicate
                                ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-300'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                            }`}
                          />
                          {duplicate && (
                            <p className="text-xs text-amber-600 mt-0.5 ml-1">Duplicate language name</p>
                          )}
                        </div>

                        {/* Proficiency dropdown */}
                        <select
                          value={lang.proficiency}
                          onChange={(e) =>
                            updateLanguage(lang.id, { proficiency: e.target.value as LanguageProficiency })
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shrink-0"
                        >
                          {PROFICIENCY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>

                        {/* Delete */}
                        <button
                          onClick={() => removeLanguage(lang.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove language"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={addLanguage}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-100"
      >
        <Plus className="w-4 h-4" />
        Add Language
      </button>
    </div>
  );
}
