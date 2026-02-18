/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '@/lib/storage/adapter';
import { Project } from '@/lib/storage/types';
import { useRouter } from 'next/navigation';
import SlidePreview from '../generate/SlidePreview';
import { CreateProjectModal } from './CreateProjectModal';
import { UserMenu } from '../components/UserMenu';
import { initializeTemplatesIfNeeded } from '@/lib/templates/preexisting';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            setLoading(true);
            let list = await storage.listProjects();
            
            await initializeTemplatesIfNeeded(list, (p) => storage.saveProject(p));
            
            list = await storage.listProjects();
            setProjects(list);
            setLoading(false);
        };
        loadProjects();
    }, []);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreateProject = async (name: string, description: string, themeId: string) => {
        const newProject: Project = {
            id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            name: name || 'Untitled Project',
            description: description || 'New video generation project',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'draft',
            data: { slides: [], themeId }, // Store selected theme
            renderProgress: 0,
        };

        await storage.saveProject(newProject);
        router.push(`/generate?id=${newProject.id}`);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this project?')) {
            await storage.deleteProject(id);
                setLoading(true);
                const list = await storage.listProjects();
                setProjects(list);
                setLoading(false);
        }
    };
    

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
             <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
            
            <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-900">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center transform rotate-45">
                            <div className="w-5 h-5 bg-purple-600"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter">OpenScenes<span className="text-purple-500"></span></h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <UserMenu />
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">My Projects</h2>
                        <p className="text-zinc-500 text-sm">Manage your video generation pipeline.</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="h-12 px-6 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 group border-b-4 border-r-4 border-zinc-500 active:border-0 active:translate-y-1 active:translate-x-1"
                    >
                        <LucideIcons.Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        <span>Initialize New Project</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <LucideIcons.Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {/* New Project Card Placeholder */}
                        {/* New Project Card Placeholder */}
                        <div 
                            onClick={() => setShowCreateModal(true)}
                            className="h-full min-h-[300px] border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/30 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-zinc-800">
                                <LucideIcons.Plus className="w-8 h-8 text-zinc-600 group-hover:text-purple-500" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Create New Project</span>
                        </div>

                        <AnimatePresence>
                            {projects.map((project, i) => (
                                <ProjectCard key={project.id} project={project} index={i} onDelete={handleDelete} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {showCreateModal && (
                    <CreateProjectModal 
                        onClose={() => setShowCreateModal(false)}
                        onCreate={handleCreateProject}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ProjectCard({ project, index, onDelete }: { project: Project, index: number, onDelete: (e: React.MouseEvent, id: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/generate?id=${project.id}`} className="block h-full">
                <div className="h-full bg-zinc-900/50 border-2 border-zinc-900 hover:border-purple-600/50 transition-all group relative overflow-hidden flex flex-col min-h-[300px]">
                    <div className="absolute top-4 right-4 z-20">
                         <StatusBadge status={project.status} />
                    </div>

                    <div className="aspect-video bg-black relative overflow-hidden mb-0 group-hover:bg-zinc-800 transition-colors">
                         {project.data?.slides?.[0] ? (
                             <div className="w-full h-full relative cursor-default pointer-events-none">
                                <div className="absolute inset-0 bg-transparent z-10"></div>
                                <SlidePreview slide={project.data.slides[0]} scale={0.4} />
                             </div>
                         ) : project.thumbnail ? (
                             <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center relative">
                                  {/* Placeholder Pattern */}
                                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                  <LucideIcons.Film className="w-10 h-10 text-zinc-800 mb-2" />
                                  <span className="text-[10px] text-zinc-700 font-mono">NO PREVIEW AVAILABLE</span>
                             </div>
                         )}
                         
                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest border border-zinc-700">Open Editor</span>
                         </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="text-lg font-bold text-zinc-100 line-clamp-1">{project.name}</h3>
                             <button 
                                onClick={(e) => onDelete(e, project.id)}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                             >
                                 <LucideIcons.Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                        
                        <p className="text-xs text-zinc-500 line-clamp-2 mb-4 font-mono">{project.description}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-800/50">
                            <div className="flex gap-2">
                                <Badge icon={<LucideIcons.BrainCircuit className="w-3 h-3" />} label="Planner" active={project.status === 'planning'} />
                                <Badge icon={<LucideIcons.Cpu className="w-3 h-3" />} label="Renderer" active={project.status === 'rendering'} />
                            </div>
                            <span className="text-[10px] text-zinc-600 font-mono">
                                {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: Project['status'] }) {
    const colors = {
        draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        planning: 'bg-blue-900/50 text-blue-300 border-blue-800',
        rendering: 'bg-purple-900/50 text-purple-300 border-purple-800',
        done: 'bg-green-900/50 text-green-300 border-green-800',
        failed: 'bg-red-900/50 text-red-300 border-red-800'
    };

    return (
        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${colors[status] || colors.draft}`}>
            {status}
        </span>
    );
}

function Badge({ icon, label, active }: { icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${active ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-transparent border-transparent text-zinc-700 opacity-50'}`}>
            {icon}
            <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
        </div>
    );
}
