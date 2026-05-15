import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function EducationStep() {
  const education = useResumeStore((state) => state.data.education || []);
  const { addEducation, updateEducation, removeEducation, reorderEducation } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(education[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderEducation(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
          <p className="text-sm text-gray-500 mt-1">
            Include your educational background.
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="education-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {education.map((edu, index) => {
                const isExpanded = expandedId === edu.id;
                return (
                  <Draggable key={edu.id} draggableId={edu.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-xl border overflow-hidden transition-all ${
                          snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200 shadow-sm'
                        }`}
                      >
                        <div 
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-400 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {edu.degree || '(Degree not specified)'} {edu.field ? `in ${edu.field}` : ''}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {edu.institution || 'Institution Name'} • {edu.startDate || 'Start'} - {edu.currentlyStudying ? 'Present' : (edu.endDate || 'End')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 space-y-4 bg-white">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. Stanford University"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={edu.location}
                                  onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. Stanford, CA"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. Bachelor of Science"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                                <input
                                  type="text"
                                  value={edu.field}
                                  onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. Computer Science"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                  type="month"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                  type="month"
                                  value={edu.endDate}
                                  disabled={edu.currentlyStudying}
                                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score / CGPA</label>
                                <input
                                  type="text"
                                  value={edu.score}
                                  onChange={(e) => updateEducation(edu.id, { score: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. 3.8/4.0"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`current-edu-${edu.id}`}
                                checked={edu.currentlyStudying}
                                onChange={(e) => updateEducation(edu.id, { currentlyStudying: e.target.checked, endDate: '' })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`current-edu-${edu.id}`} className="text-sm text-gray-700 cursor-pointer">
                                I currently study here
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

      <button
        onClick={() => {
          addEducation();
        }}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-100 mt-2"
      >
        <Plus className="w-4 h-4" />
        Add Education
      </button>
    </div>
  );
}
