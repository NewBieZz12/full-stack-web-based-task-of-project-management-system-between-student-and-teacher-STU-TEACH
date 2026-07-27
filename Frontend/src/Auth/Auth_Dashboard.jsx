import React, { useState } from 'react';
import PersonalDashboard from './PersonalDashboard';
import ProjectDashboard from './ProjectDashboard';

export default function Auth_Dashboard() {
    const [view, setView] = useState('personal'); 

    return (
        <div className="w-full h-screen bg-[#f8fafc] overflow-hidden flex flex-col font-sans">
            <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center space-x-6">
                    <h1 className="text-lg font-black italic tracking-tighter uppercase">
                        <span className="text-slate-800">DASHBOARD</span> <span className="text-blue-600"></span>
                    </h1>
                    
                    <div className="flex items-center space-x-2 bg-slate-100 p-0.5 rounded-full px-2 border border-slate-200">
                        <span className={`text-[7px] font-black ${view === 'personal' ? 'text-blue-600' : 'text-slate-400'}`}>PERSONAL</span>
                        <div className="w-7 h-3.5 bg-white rounded-full cursor-pointer flex items-center relative" 
                            onClick={() => setView(view === 'personal' ? 'project' : 'personal')}>
                            <div className={`w-2.5 h-2.5 bg-blue-600 rounded-full transition-all duration-300 ${view === 'project' ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                        </div>
                        <span className={`text-[7px] font-black ${view === 'project' ? 'text-blue-600' : 'text-slate-400'}`}>PROJECT</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                {view === 'personal' ? <PersonalDashboard /> : <ProjectDashboard />}
            </main>
        </div>
    );
}