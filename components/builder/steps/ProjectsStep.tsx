import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function ProjectsStep() {
  const projects = useResumeStore((state) => state.data.projects || []);
  const { addProject, updateProject, removeProject, reorderProjects } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(projects[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderProjects(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">
            Highlight personal or professional projects that showcase your skills.
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="projects-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {projects.map((project, index) => {
                const isExpanded = expandedId === project.id;
                return (
                  <Draggable key={project.id} draggableId={project.id} index={index}>
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
                          onClick={() => setExpandedId(isExpanded ? null : project.id)}
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
                              {project.name || '(Project not specified)'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {project.startDate || 'Start'} - {project.endDate || 'End'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeProject(project.id); }}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                  type="text"
                                  value={project.name}
                                  onChange={(e) => updateProject(project.id, { name: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. E-Commerce Dashboard"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link / URL</label>
                                <input
                                  type="text"
                                  value={project.url}
                                  onChange={(e) => updateProject(project.id, { url: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                  placeholder="e.g. github.com/my-project"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                  type="month"
                                  value={project.startDate}
                                  onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                  type="month"
                                  value={project.endDate}
                                  onChange={(e) => updateProject(project.id, { endDate: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                              </div>
                              <textarea
                                value={project.description}
                                onChange={(e) => updateProject(project.id, { description: e.target.value })}
                                className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 outline-none"
                                placeholder="• Built with React and Node.js...&#10;• Achieved 10k daily active users..."
                              />
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
          addProject();
        }}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-100 mt-2"
      >
        <Plus className="w-4 h-4" />
        Add Project
      </button>
    </div>
  );
}
