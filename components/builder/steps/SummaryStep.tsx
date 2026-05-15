import { useResumeStore } from '@/lib/store/useResumeStore';
import { Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function SummaryStep() {
  const { summary, experience, skills, contact } = useResumeStore((state) => state.data);
  const updateSummary = useResumeStore((state) => state.updateSummary);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/builder/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: contact.jobTitle,
          experience,
          skills
        }),
      });
      const data = await res.json();
      if (data.summary) {
        updateSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to generate summary', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2>
          <p className="text-sm text-gray-500 mt-1">
            Write a short summary highlighting your key achievements and skills.
          </p>
        </div>
        <button 
          onClick={handleGenerateSummary}
          disabled={isGenerating}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isGenerating ? 'Generating...' : 'AI Rewrite'}
        </button>
      </div>

      <div>
        <textarea
          value={summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="e.g. Results-driven Software Engineer with 5+ years of experience building scalable web applications..."
          className="w-full min-h-[200px] rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y"
        />
        <p className="text-xs text-gray-400 mt-2 text-right">
          {summary.length} / 400 characters recommended
        </p>
      </div>
    </div>
  );
}
