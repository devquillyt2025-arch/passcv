'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import MonthYearPicker from '@/components/builder/MonthYearPicker';

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{children}</p>;
}

export default function EducationStep({ headless = false }: { headless?: boolean }) {
  const education = useResumeStore((state) => state.data.education || []);
  const { addEducation, updateEducation, removeEducation, reorderEducation } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(education[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderEducation(result.source.index, result.destination.index);
  };

  const inputCls =
    'w-full rounded-[8px] border border-[#E2E8F0] bg-white px-[14px] py-[10px] text-[14px] text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus:border-[var(--accent-color)] focus:ring-[3px] focus:ring-[var(--accent-ring)] focus:outline-none';

  return (
    <div className="space-y-5">
      {!headless && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Education</h2>
            <p className="text-sm text-gray-500 mt-1">Include your educational background.</p>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="education-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {education.map((edu, index) => {
                const isExpanded = expandedId === edu.id;
                return (
                  <Draggable key={edu.id} draggableId={edu.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`rounded-xl border overflow-hidden transition-all ${
                          snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200 shadow-sm'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'}`}
                          onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {edu.degree || '(Degree not specified)'}{edu.field ? ` in ${edu.field}` : ''}
                            </h3>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {edu.institution || 'Institution Name'} · {edu.startDate || 'Start'} – {edu.currentlyStudying ? 'Present' : (edu.endDate || 'End')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="divide-y divide-slate-100 bg-white">
                            {/* ─ Institution ─ */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Institution</GroupLabel>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Institution Name</label>
                                  <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Stanford University"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label>
                                  <input
                                    type="text"
                                    value={edu.location}
                                    onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Stanford, CA"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* ─ Qualification ─ */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Qualification</GroupLabel>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Degree</label>
                                  <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Bachelor of Science"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Field of Study</label>
                                  <input
                                    type="text"
                                    value={edu.field}
                                    onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Computer Science"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* ─ Duration ─ */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Duration</GroupLabel>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                                  <MonthYearPicker
                                    value={edu.startDate}
                                    onChange={(v) => updateEducation(edu.id, { startDate: v })}
                                    placeholder="Start date"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                                  {edu.currentlyStudying ? (
                                    <div className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 bg-gray-50">
                                      Present
                                    </div>
                                  ) : (
                                    <MonthYearPicker
                                      value={edu.endDate}
                                      onChange={(v) => updateEducation(edu.id, { endDate: v })}
                                      placeholder="End date"
                                    />
                                  )}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Score / CGPA</label>
                                  <input
                                    type="text"
                                    value={edu.score}
                                    onChange={(e) => updateEducation(edu.id, { score: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. 3.8/4.0"
                                  />
                                </div>
                              </div>
                              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  id={`current-edu-${edu.id}`}
                                  checked={edu.currentlyStudying}
                                  onChange={(e) => updateEducation(edu.id, { currentlyStudying: e.target.checked, endDate: '' })}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                                />
                                <span className="text-xs text-gray-600">I currently study here</span>
                              </label>
                            </div>
                          </div>
                        )}
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

      {education.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      <button
        onClick={() => addEducation()}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Education
      </button>
    </div>
  );
}
