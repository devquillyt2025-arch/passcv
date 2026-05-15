import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function ExperienceStep() {
  const experience = useResumeStore((state) => state.data.experience);
  const { addExperience, updateExperience, removeExperience, reorderExperience } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(experience[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderExperience(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-500 mt-1">
            Show your relevant experience (last 10 years). Use bullet points to note your achievements.
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="experience-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {experience.map((exp, index) => {
                const isExpanded = expandedId === exp.id;
                return (
                  <Draggable key={exp.id} draggableId={exp.id} index={index}>
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
                          onClick={() => setExpandedId(isExpanded ? null : exp.id)}
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
                              {exp.position || '(Not specified)'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {exp.company || 'Company Name'} • {exp.startDate || 'Start'} - {exp.currentlyWorking ? 'Present' : (exp.endDate || 'End')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. Frontend Developer"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. Google"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. New York, NY"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                  <input
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                  <input
                                    type="month"
                                    value={exp.endDate}
                                    disabled={exp.currentlyWorking}
                                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`current-${exp.id}`}
                                checked={exp.currentlyWorking}
                                onChange={(e) => updateExperience(exp.id, { currentlyWorking: e.target.checked, endDate: '' })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`current-${exp.id}`} className="text-sm text-gray-700 cursor-pointer">
                                I currently work here
                              </label>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                      const res = await fetch('/api/builder/enhance-bullets', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          text: exp.description,
                                          position: exp.position,
                                          company: exp.company
                                        }),
                                      });
                                      const data = await res.json();
                                      if (data.enhancedText) {
                                        updateExperience(exp.id, { description: data.enhancedText });
                                      }
                                    } catch (err) {
                                      console.error('Failed to enhance bullets', err);
                                    }
                                  }}
                                  disabled={!exp.description.trim()}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Enhance with AI
                                </button>
                              </div>
                              <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                                className="w-full min-h-[150px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                placeholder="• Developed new features...&#10;• Improved performance by..."
                              />
                              <p className="text-xs text-gray-500 mt-1">Separate bullets with a new line or a bullet character (•).</p>
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
          addExperience();
          // Optionally auto-expand the new one
        }}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-100 mt-2"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </button>
    </div>
  );
}
