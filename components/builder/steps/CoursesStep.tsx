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

export default function CoursesStep({ headless = false }: { headless?: boolean }) {
  const courses = useResumeStore((state) => state.data.courses || []);
  const { addCourse, updateCourse, removeCourse, reorderCourses } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(courses[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderCourses(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5">
      {!headless && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Courses &amp; Training</h2>
          <p className="text-sm text-gray-500 mt-1">
            Online courses, bootcamps, workshops, and professional training.
          </p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="courses-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {courses.map((course, index) => {
                const isExpanded = expandedId === course.id;
                const draggableId = course.id || `course-${index}`;
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
                          onClick={() => setExpandedId(isExpanded ? null : course.id)}
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
                              {course.name || '(Course not specified)'}
                            </h3>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {course.platform || ''}
                              {course.completionDate ? ` · ${course.completionDate}` : ''}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeCourse(course.id); }}
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
                            {/* Course Details */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Course Details</GroupLabel>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Course Name</label>
                                <input
                                  type="text"
                                  value={course.name}
                                  onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                                  className={inputCls}
                                  placeholder="e.g. Machine Learning Specialization"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Platform / Institution</label>
                                  <input
                                    type="text"
                                    value={course.platform}
                                    onChange={(e) => updateCourse(course.id, { platform: e.target.value })}
                                    className={inputCls}
                                    placeholder="e.g. Coursera, Udemy, IIT"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Completion Date</label>
                                  <MonthYearPicker
                                    value={course.completionDate}
                                    onChange={(v) => updateCourse(course.id, { completionDate: v })}
                                    placeholder="Completion date"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Certificate URL */}
                            <div className="px-4 py-4 space-y-3">
                              <GroupLabel>Certificate (optional)</GroupLabel>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Certificate URL</label>
                                <input
                                  type="text"
                                  value={course.certificateUrl}
                                  onChange={(e) => updateCourse(course.id, { certificateUrl: e.target.value })}
                                  className={inputCls}
                                  placeholder="e.g. coursera.org/verify/..."
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

      {courses.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      <button
        onClick={() => {
          addCourse();
          setTimeout(() => {
            const list = useResumeStore.getState().data.courses || [];
            if (list.length > 0) setExpandedId(list[list.length - 1].id);
          }, 0);
        }}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Course
      </button>
    </div>
  );
}
