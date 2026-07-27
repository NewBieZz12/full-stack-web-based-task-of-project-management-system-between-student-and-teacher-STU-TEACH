import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Rectangle } from 'recharts';

export const StatCard = ({ label, count, colorClass, isRed, onClick }) => (
    <button 
        onClick={onClick} 
        className={`p-6 rounded-[1.5rem] bg-white border-b-4 shadow-sm text-left transition-all ${colorClass || (isRed ? 'border-red-500' : 'border-blue-600')}`}
    >
        <p className="text-slate-400 font-black uppercase text-[7px] mb-1 tracking-widest">{label}</p>
        <p className={`text-3xl font-black ${isRed && count > 0 ? 'text-red-500' : 'text-slate-800'}`}>{count || 0}</p>
    </button>
);

export const ContentBoard = ({ title, tasks = [], type, isRed, icon, onItemClick }) => {
    const filtered = (tasks || []).filter(t => {
        const status = (t.status || t.Status || "").toLowerCase();
        const d = t.deadline ? new Date(t.deadline).setHours(0,0,0,0) : null;
        const now = new Date().setHours(0,0,0,0);

        if (status === 'done') return false; 

        if (type === 'overdue') {
            return d && d < now;
        }
        
        return !d || d >= now;
    });

    return (
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm h-[350px] flex flex-col">
            <h3 className={`text-[7px] font-black mb-4 uppercase tracking-[0.2em] flex items-center gap-2 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
                {icon} {title}
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {filtered.length > 0 ? filtered.map(t => (
                    <div 
                        key={t.id} 
                        onClick={() => onItemClick && onItemClick(t)}
                        className="p-3 bg-slate-50 rounded-xl text-[12px] font-bold flex justify-between items-center border border-transparent hover:border-slate-200 hover:bg-white cursor-pointer transition-all"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-700 truncate max-w-[120px]">{t.title || t.Title}</span>
                                {(t.projectName || t.ProjectName) && (
                                    <span className="text-[6px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 uppercase font-black tracking-tighter shrink-0">
                                        {t.projectName || t.ProjectName}
                                    </span>
                                )}
                            </div>
                            <span className="text-[7px] text-slate-400 font-black uppercase">
                                {t.deadline ? new Date(t.deadline).toLocaleDateString('en-GB') : 'No Deadline'}
                            </span>
                        </div>
                        <span className={`uppercase text-[7px] font-black px-2 py-1 rounded ${(t.status || t.Status) === 'In Progress' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {t.status || t.Status}
                        </span>
                    </div>
                )) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl py-10">
                        <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Clear Workspace</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ProjectTimeline = ({ tasks = [] }) => {
    const timelineData = React.useMemo(() => {
        const now = new Date();
        now.setHours(0,0,0,0);

        return tasks.slice(0, 10).map(t => {
            const deadline = t.deadline ? new Date(t.deadline) : new Date();
            deadline.setHours(0,0,0,0);
            const diffTime = deadline.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const status = (t.status || t.Status || "").toLowerCase();
            let outcome = 'pending';
            if (status === 'done') outcome = 'success';
            else if (diffDays < 0) outcome = 'error';

            return {
                name: (t.title || t.Title || "Untitled").substring(0, 15),
                range: [0, diffDays], 
                outcome: outcome,
                actualDays: diffDays
            };
        });
    }, [tasks]);

    const getBarColor = (outcome) => {
        switch (outcome) {
            case 'success': return '#3b82f6';
            case 'error': return '#ef4444';
            default: return '#fbbf24';
        }
    };

    const CustomRect = (props) => {
        return <Rectangle {...props} fill={getBarColor(props.payload.outcome)} radius={[0, 10, 10, 0]} />;
    };

    return (
        <section className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm w-full">
            <h3 className="font-black text-[7px] uppercase tracking-widest text-slate-400 italic mb-6">Project Deadlines Timeline (Days from Today)</h3>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={timelineData} margin={{ left: 40, right: 40, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{fontSize: 9, fontWeight: 800, fill: '#94a3b8'}} axisLine={{stroke: '#f1f5f9'}} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 9, fontWeight: 800, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                                        <p className="text-[10px] font-black uppercase text-slate-600">{data.name}</p>
                                        <p className="text-[9px] font-bold text-blue-600">{data.actualDays} Days to Deadline</p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Bar dataKey="range" shape={<CustomRect />} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};

export const ProgressRing = ({ stats }) => (
    <div className="bg-white p-6 rounded-[1.5rem] flex flex-col items-center border border-slate-100 shadow-sm justify-center">
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center bg-slate-50 shadow-inner border-4 border-white">
            <span className="text-2xl font-black text-emerald-500 italic">{stats?.myProgress || 0}%</span>
        </div>
        <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-widest text-center leading-relaxed">
            Personal Progress<br/><span className="text-emerald-500 font-black">Global: {stats?.teamProgress || 0}%</span>
        </p>
    </div>
);

export const Strip = ({ label, val, total, color }) => {
    const percentage = total > 0 ? (val / total) * 100 : 0;
    return (
        <div className="w-full">
            <div className="flex justify-between text-[7px] font-black uppercase mb-1.5 text-slate-400 tracking-tighter">
                <span>{label}</span>
                <span>{val || 0} UNITS</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }} 
                />
            </div>
        </div>
    );
};

export const CompactFeed = ({ tasks = [], onItemClick }) => (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm h-[300px] flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {(tasks || []).length > 0 ? tasks.map(t => {
                const status = (t.status || t.Status || "").toLowerCase();
                const statusColor = status === 'done' ? 'text-emerald-500' : status === 'in progress' ? 'text-amber-500' : 'text-blue-500';
                return (
                    <div 
                        key={t.id} 
                        onClick={() => onItemClick && onItemClick(t)}
                        className="p-3 bg-slate-50 rounded-xl text-[11px] font-bold flex justify-between items-center cursor-pointer hover:bg-blue-50 hover:border-blue-100 border border-transparent transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {t.assignedToImage || t.AssignedToImage ? (
                                    <img src={t.assignedToImage || t.AssignedToImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[8px] text-blue-400 font-black uppercase">
                                        {(t.assignedToName || t.AssignedToName || 'U').charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-700 truncate max-w-[180px]">{t.title || t.Title}</span>
                                <span className="text-[6px] text-slate-400 font-black uppercase tracking-tight">
                                    {t.assignedToName || t.AssignedToName || 'Unassigned'}
                                </span>
                            </div>
                        </div>
                        <span className={`${statusColor} text-[6px] uppercase font-black`}>{t.status || t.Status}</span>
                    </div>
                );
            }) : (
                <div className="h-full flex items-center justify-center">
                    <p className="text-[7px] text-slate-300 text-center py-4 font-black uppercase">No active items</p>
                </div>
            )}
        </div>
    </div>
);

const RADIAN = Math.PI / 180;

const CHART_COLORS = { 
    all: '#3b82f6',     
    overdue: '#ef4444', 
    current: '#fbbf24'  
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-black">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export const ChartPanel = ({ tasks = [], onSliceClick }) => {
    const unifiedData = React.useMemo(() => {
        const now = new Date().setHours(0,0,0,0);
        
        const overdue = tasks.filter(t => {
            const status = (t.status || t.Status || "").toLowerCase();
            const d = t.deadline ? new Date(t.deadline).setHours(0,0,0,0) : null;
            return status !== 'done' && d && d < now;
        }).length;

        const current = tasks.filter(t => {
            const status = (t.status || t.Status || "").toLowerCase();
            const d = t.deadline ? new Date(t.deadline).setHours(0,0,0,0) : null;
            return status !== 'done' && (!d || d >= now);
        }).length;

        return [
            { name: 'Total', value: tasks.length, type: 'all', fill: CHART_COLORS.all },
            { name: 'Overdue', value: overdue, type: 'overdue', fill: CHART_COLORS.overdue },
            { name: 'Current', value: current, type: 'current', fill: CHART_COLORS.current }
        ];
    }, [tasks]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm flex flex-col items-center">
                <h3 className="font-black text-[7px] uppercase tracking-widest text-slate-400 italic mb-4 w-full text-center">Workload Ratio (Pie)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={unifiedData.filter(d => d.value > 0)}
                                cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel}
                                outerRadius={120} dataKey="value"
                                onClick={(entry) => onSliceClick && onSliceClick(entry.type)}
                                className="cursor-pointer outline-none"
                            >
                                {unifiedData.filter(d => d.value > 0).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm flex flex-col items-center">
                <h3 className="font-black text-[7px] uppercase tracking-widest text-slate-400 italic mb-4 w-full text-center">Volume Comparison (Bar)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={unifiedData} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            onClick={(state) => { if (state && state.activePayload) onSliceClick(state.activePayload[0].payload.type); }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40} className="cursor-pointer">
                                {unifiedData.map((entry, index) => (
                                    <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
};