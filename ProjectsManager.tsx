import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  Mic,
  Tag,
  Check,
  X,
  Sparkles,
  Save,
} from 'lucide-react';
import { Project } from '../types/tts';
import { deleteProject, saveProject } from '../services/db';
import { LANGUAGES, PREBUILT_VOICES } from '../constants/voices';

interface ProjectsManagerProps {
  projects: Project[];
  onRefreshProjects: () => void;
  onOpenProjectInStudio: (project: Project) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onRefreshProjects,
  onOpenProjectInStudio,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Project['category']>('Podcast');
  const [text, setText] = useState('');
  const [targetVoiceId, setTargetVoiceId] = useState('voice-kore');
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  const [tagsInput, setTagsInput] = useState('');

  const openCreateModal = () => {
    setEditingProjectId(null);
    setTitle('');
    setDescription('');
    setCategory('Podcast');
    setText('');
    setTargetVoiceId('voice-kore');
    setTargetLanguage('en-US');
    setTagsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProjectId(p.id);
    setTitle(p.title);
    setDescription(p.description || '');
    setCategory(p.category);
    setText(p.text);
    setTargetVoiceId(p.targetVoiceId);
    setTargetLanguage(p.targetLanguage);
    setTagsInput((p.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const projectData: Project = {
      id: editingProjectId || `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      text: text.trim(),
      targetVoiceId,
      targetLanguage,
      readingSpeed: 1.0,
      pitch: 0,
      audioCount: editingProjectId
        ? projects.find((p) => p.id === editingProjectId)?.audioCount || 0
        : 0,
      tags,
      lastModified: Date.now(),
    };

    await saveProject(projectData);
    setIsModalOpen(false);
    onRefreshProjects();
  };

  const handleDeleteProject = async (id: string, projectTitle: string) => {
    if (confirm(`Are you sure you want to delete project "${projectTitle}"?`)) {
      await deleteProject(id);
      onRefreshProjects();
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Workspace Projects
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Audio & Speech Projects</h2>
          <p className="text-xs text-slate-400">
            Organize scripts, podcast episodes, audiobook chapters, and voiceover assignments.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-200 text-base">No projects created yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Create a project to bundle your voiceover scripts, preferred neural voice, and language settings.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const voice = PREBUILT_VOICES.find((v) => v.id === project.targetVoiceId) || PREBUILT_VOICES[0];
            const lang = LANGUAGES.find((l) => l.code === project.targetLanguage) || LANGUAGES[0];
            const wordCount = project.text ? project.text.trim().split(/\s+/).length : 0;

            return (
              <div
                key={project.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/50 p-5 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {project.category}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(project)}
                        title="Edit Project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        title="Delete Project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition line-clamp-1">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Script preview */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                    <p className="text-[11px] text-slate-300 italic line-clamp-2">
                      "{project.text || 'No script drafted yet.'}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>{wordCount} words</span>
                      <span>Modified: {formatDate(project.lastModified)}</span>
                    </div>
                  </div>

                  {/* Model & Language Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 flex items-center gap-1">
                      <Mic className="w-3 h-3 text-teal-400" />
                      {voice.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
                      {lang.flag} {lang.nativeName}
                    </span>
                    {(project.tags || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Open in Studio Button */}
                <button
                  type="button"
                  onClick={() => onOpenProjectInStudio(project)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-teal-300 font-semibold text-xs transition flex items-center justify-center gap-2 border border-teal-500/20"
                >
                  <span>Open in TTS Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">
                {editingProjectId ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 pt-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Tech Wave Podcast - Episode 12"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Podcast">Podcast</option>
                    <option value="Audiobook">Audiobook</option>
                    <option value="Voiceover">Voiceover</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Default Voice</label>
                  <select
                    value={targetVoiceId}
                    onChange={(e) => setTargetVoiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {PREBUILT_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gender})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Target Language</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary or production notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Initial Script Text</label>
                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or write the draft script..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="trailer, documentary, narration"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProjectId ? 'Save Modifications' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
