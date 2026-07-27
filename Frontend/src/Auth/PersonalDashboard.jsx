import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import api from '../api';
import { StatCard, ContentBoard, ChartPanel } from './DashboardComponents'; 

export default function PersonalDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const isFetching = useRef(false);

    const fetchData = useCallback(async () => {
        if (isFetching.current) return;
        try {
            isFetching.current = true;
            setLoading(true);
            
            const tRes = await api.get('/wj/dashboard/recent-items');
            
            const storedId = localStorage.getItem('userId');
            const currentUserId = storedId ? parseInt(storedId) : null;
            
            const allItems = tRes?.data || [];
            const myTasks = allItems.filter(item => item.assignedToId == currentUserId);
            
            setTasks(myTasks);
        } catch (err) {
            console.error("Dashboard Data Sync Error:", err);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    if (loading) return (
        <div className="h-64 w-full flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Syncing Dashboard...</p>
        </div>
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const isTaskOverdue = (t) => {
        const status = (t.status || t.Status || "").toLowerCase();
        if (status === 'done' || !t.deadline) return false;
        
        const d = new Date(t.deadline);
        const deadlineDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        
        return deadlineDate < today;
    };

    const isTaskCurrent = (t) => {
        const status = (t.status || t.Status || "").toLowerCase();
        if (status === 'done') return false;
        
        if (!t.deadline) return true;
        
        const d = new Date(t.deadline);
        const deadlineDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        
        return deadlineDate >= today;
    };

    const overdueTasks = tasks.filter(isTaskOverdue);
    const currentTasks = tasks.filter(isTaskCurrent);
    const totalCount = tasks.length;

    const getFilteredTasks = () => {
        if (filter === 'overdue') return overdueTasks;
        if (filter === 'current') return currentTasks;
        return tasks;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    label="Total Task" 
                    count={totalCount} 
                    colorClass="border-blue-600"
                    onClick={() => setFilter('all')} 
                />
                <StatCard 
                    label="Current" 
                    count={currentTasks.length} 
                    colorClass="border-amber-400"
                    onClick={() => setFilter('current')} 
                />
                <StatCard 
                    label="Overdue" 
                    count={overdueTasks.length} 
                    isRed 
                    colorClass="border-red-500"
                    onClick={() => setFilter('overdue')} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContentBoard 
                    title={filter === 'all' ? "Recent Task" : `Recent Items (${filter})`} 
                    tasks={getFilteredTasks()} 
                    type="recent" 
                    icon={<Calendar size={12}/>}
                    onItemClick={(t) => navigate(`/project/${t.projectId}`)} 
                />
                
                <ContentBoard 
                    title="Attention Required" 
                    tasks={tasks} 
                    type="overdue" 
                    isRed 
                    icon={<AlertCircle size={12}/>} 
                    onItemClick={(t) => navigate(`/project/${t.projectId}`)}
                />
            </div>

            <div className="grid grid-cols-1">
                <ChartPanel 
                    tasks={tasks} 
                    onSliceClick={(type) => setFilter(type)} 
                />
            </div>
        </div>
    );
}