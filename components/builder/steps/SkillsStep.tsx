'use client';

import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, Sparkles, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { v4 as uuidv4 } from 'uuid';

export default function SkillsStep({ headless = false }: { headless?: boolean }) {
  const skills        = useResumeStore((state) => state.data.skills ?? []);
  const contact       = useResumeStore((state) => state.data.contact);
  const addSkill      = useResumeStore((state) => state.addSkill);
  const reorderSkills = useResumeStore((state) => state.reorderSkills);
  const setSkills     = useResumeStore((state) => state.setSkills);

  const [isGenerating, setIsGenerating] = useState(false);

  // One ref per skill input — lets us focus the newly added row immediately.
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevLengthRef = useRef(skills.length);

  // Sanitize skills loaded from old localStorage state that may lack `id` fields.
  // Without an id, draggableId is undefined (DnD breaks) and the id-based updateSkill
  // call matches nothing — the controlled input "snaps back" after every keystroke.
  useEffect(() => {
    if (skills.some((s) => !s.id)) {
      setSkills(skills.map((s) => (s.id ? s : { ...s, id: uuidv4() })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // After a skill is added (length increases), focus its input and scroll to it.
  useEffect(() => {
    if (skills.length > prevLengthRef.current) {
      const newIndex = skills.length - 1;
      const el = inputRefs.current[newIndex];
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    prevLengthRef.current = skills.length;
  }, [skills.length]);



  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: skills.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  // Index-based helpers — work correctly even when skill.id is missing,
  // which is the root cause of the "skill name not editable" regression.
  const updateName  = (index: number, name: string) =>
    setSkills(skills.map((s, i) => (i === index ? { ...s, name } : s)));

  const updateLevel = (index: number, level: string) =>
    setSkills(skills.map((s, i) => (i === index ? { ...s, level } : s)));

  const removeAtIndex = (index: number) =>
    setSkills(skills.filter((_, i) => i !== index));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderSkills(result.source.index, result.destination.index);
  };

  const handleSuggestSkills = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/builder/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: contact?.jobTitle || 'Software Engineer' }),
      });
      const data = await res.json();
      if (Array.isArray(data.skills)) {
        const existing = new Set(skills.map((s) => s.name.toLowerCase()));
        const fresh = data.skills
          .filter((name: string) => !existing.has(name.toLowerCase()))
          .map((name: string) => ({ id: uuidv4(), name, level: 'Intermediate' }));
        setSkills([...skills, ...fresh]);
      }
    } catch (err) {
      console.error('Failed to suggest skills', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + Suggest button */}
      <div className="flex items-center justify-between">
        {!headless && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add relevant skills and tools for the roles you&apos;re targeting.
            </p>
          </div>
        )}
        <button
          onClick={handleSuggestSkills}
          disabled={isGenerating}
          className={`flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50${headless ? ' ml-auto' : ''}`}
        >
          {isGenerating
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Sparkles className="w-3.5 h-3.5" />}
          {isGenerating ? 'Suggesting...' : 'Suggest Skills'}
        </button>
      </div>

      <div ref={parentRef} className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="skills-list" mode="virtual">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const index = virtualItem.index;
                  const skill = skills[index];
                  if (!skill) return null;
                  const draggableId = skill.id || `skill-${index}`;
                  
                  return (
                    <Draggable key={draggableId} draggableId={draggableId} index={index}>
                      {(provided, snapshot) => {
                        const style = provided.draggableProps.style || {};
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...style,
                              position: 'absolute',
                              top: virtualItem.start,
                              left: 0,
                              width: '100%',
                              height: virtualItem.size,
                              paddingBottom: '12px', // spacing between items
                            }}
                          >
                            <div
                              className={`flex items-center gap-3 bg-white p-3 rounded-xl border group transition-shadow h-full ${
                                snapshot.isDragging
                                  ? 'shadow-lg border-indigo-300'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing focus:outline-none"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              <div className="flex-1">
                                <input
                                  ref={(el) => { inputRefs.current[index] = el; }}
                                  type="text"
                                  value={skill.name}
                                  onChange={(e) => updateName(index, e.target.value)}
                                  placeholder="e.g. React.js, Python, Project Management"
                                  className="w-full text-sm font-medium text-gray-900 bg-white focus:outline-none placeholder-gray-400"
                                />
                              </div>

                              <select
                                value={skill.level || 'Intermediate'}
                                onChange={(e) => updateLevel(index, e.target.value)}
                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>

                              <button
                                onClick={() => removeAtIndex(index)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {skills.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      {/* Add skill — calls the store action directly; useEffect above handles focus */}
      <button
        onClick={addSkill}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Skill
      </button>
    </div>
  );
}
