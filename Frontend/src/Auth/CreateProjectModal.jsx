import React, { useState } from 'react';
import { X, UserPlus, Target, Plus, Mail } from 'lucide-react';
import api from '../api';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Active',
        isArchived: false
    });

    const [goalInput, setGoalInput] = useState("");
    const [goals, setGoals] = useState([]);
    const [emailInput, setEmailInput] = useState("");
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const addGoal = () => {
        if (!goalInput.trim()) return;
        setGoals([...goals, { title: goalInput, isCompleted: false }]);
        setGoalInput("");
    };

    const addMember = () => {
        const email = emailInput.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        
        if (!members.includes(email)) {
            setMembers([...members, email]);
        }
        setEmailInput("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/wj/projects/create', formData);
            const projectId = response.data.id;

            if (projectId) {
                if (goals.length > 0) {
                    await Promise.all(goals.map(goal => 
                        api.post(`/wj/projects/${projectId}/goals`, {
                            title: goal.title,
                            isCompleted: false,
                            projectId: projectId 
                        })
                    ));
                }

                if (members.length > 0) {
                    const memberPromises = members.map(email => 
                        api.post(`/wj/projects/${projectId}/members/add-by-email`, 
                            JSON.stringify(email), 
                            { headers: { 'Content-Type': 'application/json' } }
                        ).catch(err => {
                            console.error(`User ${email} not found or error:`, err.response?.data);
                            return null; 
                        })
                    );
                    await Promise.all(memberPromises);
                }

                onProjectCreated(projectId);
                onClose();
                setGoals([]);
                setMembers([]);
                setFormData({ name: '', description: '', startDate: '', endDate: '', status: 'Active', isArchived: false });
            }
        } catch (err) {
            console.error("Creation failed:", err.response?.data || err);
            alert("Error creating project. Please check fields and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                <header className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Create Project</h2>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[3px] mt-1">New Project</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-red-500"><X size={24}/></button>
                </header>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <input 
                            required
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="PROJECT TITLE"
                        />
                        <textarea 
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium text-slate-600 h-28 focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder:text-slate-300"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="DESCRIPTION..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Start Date</label>
                            <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-600" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">End Date</label>
                            <input type="date" required className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-600" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Mail size={12}/> Invite Members (Email Only)</label>
                        <div className="flex gap-2">
                            <input 
                                type="email"
                                className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-5 text-xs font-bold outline-none"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="member@email.com"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                            />
                            <button type="button" onClick={addMember} className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><UserPlus size={18}/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {members.map((email, i) => (
                                <span key={i} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm">
                                    {email}
                                    <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i))} className="hover:text-red-400"><X size={12}/></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Target size={12}/> Goals</label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-5 text-xs font-bold outline-none"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                placeholder="Define goal..."
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                            />
                            <button type="button" onClick={addGoal} className="bg-slate-200 text-slate-600 px-4 rounded-xl hover:bg-slate-300 transition-all"><Plus size={18}/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {goals.map((g, i) => (
                                <span key={i} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight">
                                    {g.title}
                                    <button type="button" onClick={() => setGoals(goals.filter((_, idx) => idx !== i))} className="hover:text-blue-800"><X size={12}/></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </form>

                <footer className="p-10 border-t border-slate-50 bg-white">
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black text-[11px] uppercase tracking-[3px] py-5 rounded-[1.5rem] shadow-2xl shadow-blue-200 transition-all active:scale-[0.97]`}
                    >
                        {loading ? "Launching..." : "Launch Workspace"}
                    </button>
                </footer>
            </div>
        </div>
    );
}