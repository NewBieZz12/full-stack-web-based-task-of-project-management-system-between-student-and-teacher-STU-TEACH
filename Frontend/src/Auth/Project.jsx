import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Plus, Star, Trash2, CheckCircle2, Circle, Archive, ArchiveRestore,
    Search, LayoutGrid, Clock, Settings, ChevronRight, X, Save, ExternalLink, UserPlus, Target
} from 'lucide-react';
import api from '../api'; 
import CreateProjectModal from './CreateProjectModal';

const calculateTimelineProgress = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    if (isNaN(startDate) || isNaN(endDate)) return 0;
    if (today <= startDate) return 0;
    if (today >= endDate) return 100;
    const totalDuration = endDate - startDate;
    const elapsed = today - startDate;
    return Math.floor((elapsed / totalDuration) * 100);
};

export default function Project() {
    const navigate = useNavigate();
    const { id: urlProjectId } = useParams(); 

    const [projects, setProjects] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [targetEmail, setTargetEmail] = useState("");
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const hasFullAccess = selectedProject && (
        Number(currentUserId) === Number(selectedProject.createdById) || 
        userRole === "Teacher"
    );

    const fetchProjects = async (preventAutoSelect = false) => {
        try {
            const res = await api.get('/wj/projects/my-projects');
            const projectData = Array.isArray(res.data) ? res.data : (res.data?.$values || []);
            setProjects(projectData);

            const targetId = urlProjectId || (projectData.length > 0 ? projectData[0].id : null);
            if (targetId && targetId !== "undefined" && !preventAutoSelect) {
                fetchProjectDetails(targetId);
            }
        } catch (err) {
            console.error("Error fetching projects", err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectDetails = async (projectId) => {
        if (!projectId || projectId === "undefined") return;
        setDetailsLoading(true);
        try {
            const res = await api.get(`/wj/projects/${projectId}/details`);
            setSelectedProject(res.data);
            localStorage.setItem('lastProjectId', projectId);
            setIsEditing(false); 
        } catch (err) {
            console.error("Error fetching project details", err);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => { 
        const savedUserId = localStorage.getItem('hyUserId') || localStorage.getItem('userId');
        const savedRole = localStorage.getItem('role');

        if (savedUserId) setCurrentUserId(Number(savedUserId));
        if (savedRole) setUserRole(savedRole);

        fetchProjects(); 
    }, [urlProjectId]);

    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        if (!hasFullAccess) return;
        if (!window.confirm("Are you sure you want to delete this project permanently?")) return;
        try {
            await api.delete(`/wj/projects/${projectId}`);
            if (selectedProject?.id === projectId) setSelectedProject(null);
            fetchProjects(true);
        } catch (err) { alert("Delete failed."); }
    };

    const handleToggleArchive = async (e, projectId) => {
        e.stopPropagation();
        if (!hasFullAccess) return;
        try {
            await api.patch(`/wj/projects/${projectId}/archive`);
            fetchProjects(true);
        } catch (err) { alert("Failed to update archive status."); }
    };

    const handleSaveProject = async () => {
        if (!hasFullAccess) return;
        try {
            await api.put(`/wj/projects/${selectedProject.id}/update`, editForm);
            setIsEditing(false);
            fetchProjectDetails(selectedProject.id); 
            fetchProjects(true); 
        } catch (err) { 
            alert("Could not save changes."); 
        }
    };

    const handleAddByEmail = async () => {
        if (!hasFullAccess || !targetEmail) return;
        try {
            await api.post(`/wj/projects/${selectedProject.id}/members/add-by-email`, 
                JSON.stringify(targetEmail), 
                { headers: { 'Content-Type': 'application/json' } }
            );
            setTargetEmail(""); 
            fetchProjectDetails(selectedProject.id); 
        } catch (err) { alert(err.response?.data?.message || "Failed to add user"); }
    };

    const handleAddGoal = async () => {
        if (!hasFullAccess || !newGoalTitle.trim()) return;
        try {
            await api.post(`/wj/projects/${selectedProject.id}/goals`, { title: newGoalTitle });
            setNewGoalTitle("");
            fetchProjectDetails(selectedProject.id);
        } catch (err) { console.error(err); }
    };

    const handleToggleGoal = async (goalId) => {
        try {
            await api.patch(`/wj/projects/goals/${goalId}/toggle`);
            fetchProjectDetails(selectedProject.id);
        } catch (err) { console.error(err); }
    };

    const handleDeleteGoal = async (e, goalId) => {
        e.stopPropagation();
        if (!hasFullAccess) return;
        if (!window.confirm("Delete this goal?")) return;
        try {
            await api.delete(`/wj/projects/goals/${goalId}`);
            fetchProjectDetails(selectedProject.id);
        } catch (err) { console.error(err); }
    };

    const startEditing = () => {
        if (!hasFullAccess) return;
        setEditForm({ 
            name: selectedProject.name,
            description: selectedProject.description || "",
            startDate: selectedProject.startDate?.split('T')[0] || "",
            endDate: selectedProject.endDate?.split('T')[0] || ""
        });
        setIsEditing(true);
    };

    const displayProjects = projects.filter(p => {
        const name = p?.name || "";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && (showArchived ? p.isArchived : !p.isArchived);
    });

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Loading Projects...</p>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-700 font-sans overflow-hidden">
            <section className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project-List</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setShowArchived(!showArchived)} className={`p-1.5 rounded-lg transition-all ${showArchived ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                                {showArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                            </button>
                            <button onClick={() => setIsModalOpen(true)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            placeholder="Search projects..." 
                            className="w-full bg-slate-50 border-none rounded-lg py-2 pl-10 text-sm outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
                    {displayProjects.map((p, index) => (
                        <div 
                            key={p.id || index} 
                            onClick={() => fetchProjectDetails(p.id)} 
                            className={`group p-4 rounded-xl cursor-pointer transition-all border-l-4 flex justify-between items-center ${selectedProject?.id === p.id ? 'bg-blue-50 border-blue-600 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                        >
                            <h3 className={`font-bold text-sm truncate pr-2 ${selectedProject?.id === p.id ? 'text-blue-700' : 'text-slate-600'}`}>
                                {p.name || "Untitled Project"}
                            </h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                {(Number(p.createdById) === Number(currentUserId) || userRole === "Teacher") && (
                                    <>
                                        <button onClick={(e) => handleToggleArchive(e, p.id)} title="Archive Project" className="p-1 text-slate-300 hover:text-amber-500">
                                            {p.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                        </button>
                                        <button onClick={(e) => handleDeleteProject(e, p.id)} title="Delete Project" className="p-1 text-slate-300 hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <main className="flex-1 bg-white flex flex-col overflow-hidden">
                {detailsLoading ? (
                    <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : selectedProject ? (
                    <>
                        <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                {isEditing && hasFullAccess ? (
                                    <input 
                                        className="text-3xl font-black text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent uppercase tracking-tighter italic"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    />
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                                            <span>Review</span> <ChevronRight size={12} /> <span className="text-blue-600">{selectedProject.name}</span>
                                        </div>
                                        <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">{selectedProject.name}</h1>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                {hasFullAccess && (
                                    isEditing ? (
                                        <button onClick={handleSaveProject} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"><Save size={14}/> Apply Changes</button>
                                    ) : (
                                        <button onClick={startEditing} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Settings size={20}/></button>
                                    )
                                )}
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 flex gap-10">
                            <div className="flex-[1.5] space-y-10">
                                <section className={`p-6 rounded-3xl transition-all ${isEditing && hasFullAccess ? 'bg-blue-50 border border-blue-100' : ''}`}>
                                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[2px] flex items-center gap-2 mb-6"><Clock size={14}/> Timeline</h3>
                                    {isEditing && hasFullAccess ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[8px] font-bold text-blue-600 uppercase mb-1 block">Start Date</label>
                                                <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({...editForm, startDate: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-600 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-bold text-blue-600 uppercase mb-1 block">End Date</label>
                                                <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({...editForm, endDate: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-600 outline-none" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative w-full h-1.5 bg-slate-100 rounded-full">
                                                <div className="absolute h-full bg-blue-600 rounded-full transition-all" style={{ width: `${calculateTimelineProgress(selectedProject.startDate, selectedProject.endDate)}%` }} />
                                            </div>
                                            <div className="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Start: {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'N/A'}</span>
                                                <span>End: {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </>
                                    )}
                                </section>

                                {hasFullAccess && (
                                    <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <h3 className="text-[10px] font-black uppercase tracking-[2px] mb-4 text-slate-500 flex items-center gap-2"><UserPlus size={14}/> Add Team Member</h3>
                                        <div className="flex gap-2">
                                            <input 
                                                type="email" placeholder="member@email.com" 
                                                className="flex-1 bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                                value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)}
                                            />
                                            <button onClick={handleAddByEmail} className="bg-blue-600 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">Add</button>
                                        </div>
                                    </section>
                                )}

                                <section>
                                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[2px] mb-6 flex items-center gap-2"><Target size={14}/> Project Goals</h3>
                                    {hasFullAccess && (
                                        <div className="flex gap-2 mb-4">
                                            <input 
                                                placeholder="Add a new goal..." 
                                                className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-4 text-sm outline-none"
                                                value={newGoalTitle}
                                                onChange={(e) => setNewGoalTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                                            />
                                            <button onClick={handleAddGoal} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><Plus size={18}/></button>
                                        </div>
                                    )}
                                    <div className="grid gap-3">
                                        {(selectedProject.goals?.$values || selectedProject.goals || []).map((goal) => (
                                            <div key={goal.id} onClick={() => !isEditing && handleToggleGoal(goal.id)} className={`group flex items-center justify-between p-4 bg-slate-50 rounded-2xl transition-all ${!isEditing ? 'hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer' : 'opacity-80'}`}>
                                                <div className="flex items-center gap-4">
                                                    {goal.isCompleted ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Circle className="text-slate-300" size={20} />}
                                                    <span className={`text-sm font-bold ${goal.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{goal.title}</span>
                                                </div>
                                                {hasFullAccess && (
                                                    <button onClick={(e) => handleDeleteGoal(e, goal.id)} className="p-1 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[2px] mb-4 text-slate-400">Project Team</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {(selectedProject.members?.$values || selectedProject.members || []).map((member) => (
                                            <div key={member.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-full border border-slate-100">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                    {member.user?.username?.substring(0, 2).toUpperCase() || "??"}
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{member.user?.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl">
                                    <h3 className="text-[10px] font-black uppercase tracking-[3px] mb-8 text-blue-400">Total Progress</h3>
                                    <p className="text-5xl font-black italic mb-4">{selectedProject.progress || 0}%</p>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${selectedProject.progress || 0}%` }} />
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/workspace/${selectedProject.id}`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-3 shadow-lg transition-all hover:scale-[1.02]">Launch Board <ExternalLink size={16}/></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-10"><LayoutGrid size={64} /><p className="font-black text-[10px] uppercase mt-4">Select Project</p></div>
                )}
            </main>

            <CreateProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onProjectCreated={(id) => {
                    fetchProjects();
                    fetchProjectDetails(id);
                }} 
            />
        </div>
    );
}