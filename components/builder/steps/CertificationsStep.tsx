'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import MonthYearPicker from '@/components/builder/MonthYearPicker';

export default function CertificationsStep({ headless = false }: { headless?: boolean }) {
  const certifications = useResumeStore((state) => state.data.certifications || []);
  const { addCertification, updateCertification, removeCertification, reorderCertifications } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(certifications[0]?.id || null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderCertifications(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-5">
      {!headless && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add professional certifications and credentials.
            </p>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="certifications-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {certifications.map((cert, index) => {
                const isExpanded = expandedId === cert.id;
                return (
                  <Draggable key={cert.id} draggableId={cert.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-xl border overflow-hidden transition-all ${
                          snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200 shadow-sm'
                        }`}
                      >
                        {/* Card header */}
                        <div
                          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : cert.id)}
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
                              {cert.name || '(Certification not specified)'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {cert.issuer || 'Issuing Organization'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeCertification(cert.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* Expanded form */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 bg-white">
                            {/* Row 1: Name + Issuer */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                                <input
                                  type="text"
                                  value={cert.name}
                                  onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="e.g. AWS Certified Solutions Architect"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                                <input
                                  type="text"
                                  value={cert.issuer}
                                  onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="e.g. Amazon Web Services"
                                />
                              </div>
                            </div>

                            {/* Row 2: Issue Date + Expiry Date */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                <MonthYearPicker
                                  value={cert.issueDate}
                                  onChange={(v) => updateCertification(cert.id, { issueDate: v })}
                                  placeholder="Issue date"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                {cert.doesNotExpire ? (
                                  <div className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 bg-gray-50">
                                    Does not expire
                                  </div>
                                ) : (
                                  <MonthYearPicker
                                    value={cert.expiryDate}
                                    onChange={(v) => updateCertification(cert.id, { expiryDate: v })}
                                    placeholder="Expiry date (optional)"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Does not expire checkbox */}
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`no-expiry-${cert.id}`}
                                checked={cert.doesNotExpire}
                                onChange={(e) => updateCertification(cert.id, { doesNotExpire: e.target.checked, expiryDate: '' })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`no-expiry-${cert.id}`} className="text-sm text-gray-700 cursor-pointer">
                                Does not expire
                              </label>
                            </div>

                            {/* Row 3: Credential ID + URL */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input
                                  type="text"
                                  value={cert.credentialId}
                                  onChange={(e) => updateCertification(cert.id, { credentialId: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="e.g. ABC123XYZ"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input
                                  type="text"
                                  value={cert.credentialUrl}
                                  onChange={(e) => updateCertification(cert.id, { credentialUrl: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  placeholder="e.g. verify.example.com/cert"
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

      {certifications.length === 0 && (
        <p className="text-[13px] text-gray-400 italic text-center py-4">No entries yet.</p>
      )}
      <button
        onClick={() => {
          addCertification();
        }}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-violet-700 border border-dashed border-violet-300 rounded-[10px] bg-transparent hover:bg-violet-50 transition-colors mt-2"
      >
        <Plus className="w-4 h-4" />
        Add Certification
      </button>
    </div>
  );
}
