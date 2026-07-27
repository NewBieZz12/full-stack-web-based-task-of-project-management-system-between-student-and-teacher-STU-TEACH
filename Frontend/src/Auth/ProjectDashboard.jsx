import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity } from 'lucide-react';
import api from '../api';
import { CompactFeed, ProjectTimeline, Strip } from './DashboardComponents';

export default function ProjectDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [teamTasks, setTeamTasks] = useState([]); 
    const isFetching = useRef(false);

    const loadProjectDetails = async (proj) => {
        if (!proj) return;
        try {
            setLoading(true);
            const tRes = await api.get(`/wj/work-items/project/${proj.id}`);
            const allItems = tRes?.data || [];
            
            setTeamTasks(allItems);
            setSelectedProject(proj);
        } catch (err) {
            console.error("Project Detail Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = useCallback(async () => {
        if (isFetching.current) return;
        try {
            isFetching.current = true;
            const res = await api.get('/wj/projects/my-projects');
            const activeProjects = (res?.data || []).filter(p => !p.isArchived);
            setProjects(activeProjects);
            
            if (activeProjects.length > 0) {
                await loadProjectDetails(activeProjects[0]);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error("Project List Error:", err);
            setLoading(false);
        } finally {
            isFetching.current = false;
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    if (loading && projects.length === 0) return (
        <div className="h-64 w-full flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Loading Workspace...</p>
        </div>
    );

    const totalItems = teamTasks.length;

    const doneCount = teamTasks.filter(t => 
        (t.status || t.Status || "").toLowerCase() === 'done'
    ).length;

    const inProgressCount = teamTasks.filter(t => 
        (t.status || t.Status || "").toLowerCase() === 'in progress'
    ).length;

    const todoCount = teamTasks.filter(t => {
        const s = (t.status || t.Status || "").toLowerCase();
        return s === 'todo' || s === 'to do' || s === 'to-do' || s === 'new' || s === 'backlog';
    }).length;

    const activeTasksForTimeline = teamTasks.filter(t => 
        (t.status || t.Status || "").toLowerCase() !== 'done'
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Activity size={16} />
                    </div>
                    <select 
                        className="bg-transparent font-bold text-slate-700 text-[10px] uppercase outline-none cursor-pointer"
                        value={selectedProject?.id || ''}
                        onChange={(e) => {
                            const proj = projects.find(p => p.id === parseInt(e.target.value));
                            if (proj) loadProjectDetails(proj);
                        }}
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => navigate(`/project/${selectedProject?.id}`)}
                    className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                    Open Board →
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                    <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Users size={10}/> All Member Task
                    </h3>
                    <CompactFeed 
                        tasks={teamTasks} 
                        onItemClick={(t) => navigate(`/project/${selectedProject?.id}`)}
                    />
                </div>

                <div className="space-y-3">
                    <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Activity size={10}/> Project Health
                    </h3>
                    <section className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm h-[300px] flex flex-col justify-center gap-6">
                        <Strip label="Done" val={doneCount} total={totalItems} color="bg-emerald-500" />
                        <Strip label="In Progress" val={inProgressCount} total={totalItems} color="bg-amber-400" />
                        <Strip label="To Do" val={todoCount} total={totalItems} color="bg-blue-500" />
                        <div className="mt-2 pt-4 border-t border-slate-50">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                Total Scope: {totalItems} Work Items
                            </span>
                        </div>
                    </section>
                </div>
            </div>

            <ProjectTimeline tasks={activeTasksForTimeline} />
        </div>
    );
}