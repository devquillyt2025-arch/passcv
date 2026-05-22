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

export default function PublicationsStep({ headless = false }: { headless?: boolean }) {
  const publications = useResumeStore((state) => state.data.publications || []);
  const { addPublication, updatePublication, removePublication, reorderPublications } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(publications[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderPublications(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5">
      {!headless && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Publications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Research papers, articles, books, and other published works.
          </p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="publications-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {publications.map((pub, index) => {
                const isExpanded = expandedId === pub.id;
                const draggableId = pub.id || `pub-${index}`;
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
                        <div
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'}`}
                          onClick={() => setExpandedId(isExpanded ? null : pub.id)}
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
                              {pub.title || '(Publication not specified)'}
                            </h3>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {pub.publisher || ''}
                              {pub.date ? ` · ${pub.date}` : ''}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removePublication(pub.id); }}
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
                            {/* Publication Details */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Publication Details</GroupLabel>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
                                <input
                                  type="text"
                                  value={pub.title}
                                  onChange={(e) => updatePublication(pub.id, { title: e.target.value })}
                                  className={inputCls}
                                  placeholder="e.g. Deep Learning for NLP: A Survey"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Publisher / Journal</label>
                                  <input
                                    type="text"
                                    value={pub.publisher}
                                    onChange={(e) => updatePublication(pub.id, { publisher: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Nature, IEEE, O'Reilly"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
                                  <MonthYearPicker
                                    value={pub.date}
                                    onChange={(v) => updatePublication(pub.id, { date: v })}
                                    placeholder="Publication date"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Optional fields */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Optional</GroupLabel>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Co-authors (comma separated)</label>
                                <input
                                  type="text"
                                  value={pub.coAuthors}
                                  onChange={(e) => updatePublication(pub.id, { coAuthors: e.target.value })}
                                  className={inputCls}
                                  placeholder="e.g. Jane Smith, Bob Lee"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">URL</label>
                                <input
                                  type="text"
                                  value={pub.url}
                                  onChange={(e) => updatePublication(pub.id, { url: e.target.value })}
                                  className={inputCls}
                                  placeholder="e.g. doi.org/10.xxxx or arxiv.org/abs/..."
                                />
                              </div>
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

      {publications.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      <button
        onClick={() => {
          addPublication();
          setTimeout(() => {
            const list = useResumeStore.getState().data.publications || [];
            if (list.length > 0) setExpandedId(list[list.length - 1].id);
          }, 0);
        }}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Publication
      </button>
    </div>
  );
}
