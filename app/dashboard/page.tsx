'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, Edit, Loader2, LogOut } from 'lucide-react';
import { useResumeStore, initialResumeData } from '@/lib/store/useResumeStore';

export default function DashboardPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const { loadResumeData, setResumeId } = useResumeStore();

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, name, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (data) setResumes(data);
      if (error) console.error('Error fetching resumes:', error);
    }
    setLoading(false);
  };

  const handleCreateNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        name: 'Untitled Resume',
        data: initialResumeData
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating resume:', error);
      return;
    }

    if (data) {
      // Load empty state and set ID
      loadResumeData(initialResumeData);
      setResumeId(data.id);
      router.push('/builder');
    }
  };

  const handleEdit = async (id: string) => {
    const { data, error } = await supabase
      .from('resumes')
      .select('data')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading resume:', error);
      return;
    }

    if (data && data.data) {
      loadResumeData(data.data);
      setResumeId(id);
      router.push('/builder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (!error) {
      setResumes(resumes.filter(r => r.id !== id));
    } else {
      console.error('Error deleting resume:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-xl font-bold text-indigo-700 tracking-tight">
          TailorCV
        </Link>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Resumes</h1>
            <p className="text-gray-500 mt-1">Manage and edit your saved resumes</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Create your first ATS-optimized resume to land your dream job faster.
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Build Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div 
                key={resume.id} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                <div 
                  className="aspect-[1/1.2] bg-gray-100 flex flex-col items-center justify-center p-6 cursor-pointer relative overflow-hidden"
                  onClick={() => handleEdit(resume.id)}
                >
                  <div className="w-3/4 h-full bg-white shadow-sm border border-gray-200 rounded absolute -bottom-6 flex flex-col pt-8 px-6 gap-3">
                    <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-full mt-4"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-full mt-2"></div>
                    <div className="h-1.5 bg-gray-100 rounded w-4/6"></div>
                  </div>
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <span className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Edit
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate" title={resume.name}>{resume.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
