import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, Sparkles, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function SkillsStep() {
  const skills = useResumeStore((state) => state.data.skills || []);
  const contact = useResumeStore((state) => state.data.contact || {});
  const { addSkill, updateSkill, removeSkill, reorderSkills, setSkills } = useResumeStore();
  const [isGenerating, setIsGenerating] = useState(false);

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
        body: JSON.stringify({
          jobTitle: contact.jobTitle || 'Software Engineer',
        }),
      });
      const data = await res.json();
      if (data.skills && Array.isArray(data.skills)) {
        const newSkills = data.skills.map((name: string) => ({
          id: uuidv4(),
          name,
          level: 'Intermediate'
        }));
        // Append new skills or replace based on preference. Let's append if less than 5, otherwise replace if empty, or just append avoiding duplicates.
        const currentSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
        const uniqueNewSkills = newSkills.filter((s: { name: string }) => !currentSkillNames.has(s.name.toLowerCase()));
        setSkills([...skills, ...uniqueNewSkills]);
      }
    } catch (error) {
      console.error('Failed to suggest skills', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add relevant skills and tools for the roles you&apos;re targeting.
          </p>
        </div>
        <button 
          onClick={handleSuggestSkills}
          disabled={isGenerating}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isGenerating ? 'Suggesting...' : 'Suggest Skills'}
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="skills-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {skills.map((skill, index) => (
                <Draggable key={skill.id} draggableId={skill.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-3 bg-white p-3 rounded-xl border group transition-shadow ${
                        snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200'
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
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                          placeholder="e.g. React.js, Python, Project Management"
                          className="w-full text-sm font-medium focus:outline-none placeholder-gray-400 bg-transparent"
                        />
                      </div>
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill(skill.id, { level: e.target.value })}
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={addSkill}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-100"
      >
        <Plus className="w-4 h-4" />
        Add Skill
      </button>
    </div>
  );
}
