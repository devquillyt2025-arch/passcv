'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import MonthYearPicker from '@/components/builder/MonthYearPicker';

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{children}</p>;
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none';

export default function VolunteerStep({ headless = false }: { headless?: boolean }) {
  const volunteer = useResumeStore((state) => state.data.volunteer || []);
  const { addVolunteer, updateVolunteer, removeVolunteer, reorderVolunteer } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(volunteer[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderVolunteer(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5">
      {!headless && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Volunteer Work</h2>
          <p className="text-sm text-gray-500 mt-1">
            Highlight volunteer and community involvement.
          </p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="volunteer-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {volunteer.map((vol, index) => {
                const isExpanded = expandedId === vol.id;
                const draggableId = vol.id || `vol-${index}`;
                return (
                  <Draggable key={draggableId} draggableId={draggableId} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`rounded-xl border overflow-hidden transition-all ${
                          snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200 shadow-sm'
                        }`}
                      >
                        {/* Row header */}
                        <div
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'}`}
                          onClick={() => setExpandedId(isExpanded ? null : vol.id)}
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
                              {vol.role || vol.organization || '(Entry not specified)'}
                            </h3>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {vol.organization || ''}
                              {vol.startDate ? ` · ${vol.startDate}` : ''}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeVolunteer(vol.id); }}
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
                            {/* Role Details */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Role Details</GroupLabel>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Organization</label>
                                  <input
                                    type="text"
                                    value={vol.organization}
                                    onChange={(e) => updateVolunteer(vol.id, { organization: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Red Cross"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Role / Title</label>
                                  <input
                                    type="text"
                                    value={vol.role}
                                    onChange={(e) => updateVolunteer(vol.id, { role: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Community Coordinator"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Location (optional)</label>
                                <input
                                  type="text"
                                  value={vol.location}
                                  onChange={(e) => updateVolunteer(vol.id, { location: e.target.value })}
                                  className={inputCls}
                                  placeholder="e.g. New York, NY"
                                />
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Duration</GroupLabel>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                                  <MonthYearPicker
                                    value={vol.startDate}
                                    onChange={(v) => updateVolunteer(vol.id, { startDate: v })}
                                    placeholder="Start date"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                                  <MonthYearPicker
                                    value={vol.currentlyVolunteering ? '' : vol.endDate}
                                    onChange={(v) => updateVolunteer(vol.id, { endDate: v })}
                                    placeholder="End date"
                                    disabled={vol.currentlyVolunteering}
                                  />
                                </div>
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer w-fit">
                                <input
                                  type="checkbox"
                                  checked={vol.currentlyVolunteering}
                                  onChange={(e) => updateVolunteer(vol.id, { currentlyVolunteering: e.target.checked })}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs text-gray-600">Currently volunteering here</span>
                              </label>
                            </div>

                            {/* Description */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Description</GroupLabel>
                              <textarea
                                value={vol.description}
                                onChange={(e) => updateVolunteer(vol.id, { description: e.target.value })}
                                className="w-full min-h-[100px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition"
                                placeholder={"• Organised weekly food drives serving 300+ families\n• Trained 20 new volunteers on safety protocols"}
                              />
                              <p className="text-[11px] text-gray-400">One bullet per line. Quantify impact where possible.</p>
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

      {volunteer.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      <button
        onClick={() => {
          addVolunteer();
          // expand the new entry on next tick
          setTimeout(() => {
            const store = useResumeStore.getState();
            const list = store.data.volunteer || [];
            if (list.length > 0) setExpandedId(list[list.length - 1].id);
          }, 0);
        }}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Volunteer Entry
      </button>
    </div>
  );
}
