'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useEffect, useRef } from 'react';

export default function CustomSectionStep({ headless = false, sectionId }: { headless?: boolean, sectionId: string }) {
  const customSections = useResumeStore((state) => state.data.customSections || []);
  const section = customSections.find(s => s.id === sectionId);
  
  const updateCustomSectionTitle = useResumeStore((state) => state.updateCustomSectionTitle);
  const addCustomItem = useResumeStore((state) => state.addCustomItem);
  const updateCustomItem = useResumeStore((state) => state.updateCustomItem);
  const removeCustomItem = useResumeStore((state) => state.removeCustomItem);
  const reorderCustomItems = useResumeStore((state) => state.reorderCustomItems);
  const builderDesign = useResumeStore((state) => state.builderDesign);

  const items = section?.items || [];
  const prevLengthRef = useRef(items.length);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!section) return;
    if (items.length > prevLengthRef.current) {
      const newIndex = items.length - 1;
      const el = inputRefs.current[newIndex];
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    prevLengthRef.current = items.length;
  }, [section, items.length]);

  if (!section) return null;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderCustomItems(sectionId, result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5" style={{ '--accent-color': builderDesign.accentColor, '--accent-ring': `${builderDesign.accentColor}26` } as React.CSSProperties}>
      
      {/* Title Editor */}
      {!headless && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => updateCustomSectionTitle(sectionId, e.target.value)}
            className="w-full text-base font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-ring)] transition-all"
          />
        </div>
      )}

      {/* Item Rows */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`custom-list-${sectionId}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {items.map((item, index) => {
                const draggableId = item.id || `custom-item-${index}`;
                return (
                  <Draggable key={draggableId} draggableId={draggableId} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex gap-3 bg-white p-3 rounded-xl border group transition-shadow ${
                          snapshot.isDragging
                            ? 'shadow-lg border-indigo-300'
                            : 'border-gray-200'
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="pt-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing focus:outline-none"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <input
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => updateCustomItem(sectionId, item.id, { name: e.target.value })}
                            placeholder="e.g. Open Source Project"
                            className="w-full text-sm font-semibold text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
                          />
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => updateCustomItem(sectionId, item.id, { description: e.target.value })}
                            placeholder="Description or details (optional)..."
                            rows={2}
                            className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-2 focus:outline-none focus:bg-white focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-ring)] transition-all resize-none custom-scrollbar"
                          />
                        </div>

                        <button
                          onClick={() => removeCustomItem(sectionId, item.id)}
                          className="p-1.5 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
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

      {items.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      <button
        onClick={() => addCustomItem(sectionId)}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  );
}
