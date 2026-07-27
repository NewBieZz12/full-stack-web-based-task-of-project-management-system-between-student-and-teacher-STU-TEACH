import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, LogOut, UserCircle, Kanban, Box } from 'lucide-react';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('role') || 'Guest';
    
    const isInsideWorkspace = location.pathname.startsWith('/workspace/');
    const currentPathId = location.pathname.split('/')[2]; 
    
    const lastProjectId = currentPathId || localStorage.getItem('lastProjectId');

    const menuItems = [
        { 
            name: 'Dashboard', 
            path: '/dashboard', 
            view: 'personal-dashboard', 
            icon: <LayoutDashboard size={20}/> 
        },
        { 
            name: 'Project List', 
            path: '/project', 
            view: 'project-list', 
            icon: <Briefcase size={20}/> 
        },
        { 
            name: 'Workspace', 
            path: lastProjectId ? `/workspace/${lastProjectId}` : '/project', 
            icon: <Kanban size={20}/> 
        },
    ];

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col p-6 shadow-xl fixed h-full z-50 transition-all">
            <div className="flex items-center space-x-3 mb-10">
                <div className="p-2 rounded-lg bg-white/10 flex items-center justify-center">
                    <Box size={24} className="text-blue-300" />
                </div>
                <h2 className="text-xl font-bold tracking-tight uppercase italic">Stu<span className="text-blue-300">&</span>Teach</h2>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = item.name === 'Workspace' 
                        ? isInsideWorkspace 
                        : location.pathname.startsWith(item.path);

                    return (
                        <button 
                            key={item.name}
                            onClick={() => {
                                if (item.name === 'Workspace' && !lastProjectId) {
                                    alert("Please select a project from the Project List first.");
                                    navigate('/project');
                                } else {
                                    navigate(item.path, { state: { view: item.view } });
                                }
                            }}
                            className={`flex items-center space-x-3 w-full p-3.5 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest ${
                                isActive 
                                ? 'bg-white text-[#1e3a8a] shadow-lg translate-x-1' 
                                : 'text-blue-200 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span className={isActive ? 'text-blue-600' : 'text-blue-300'}>{item.icon}</span>
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4">
                <div className="flex items-center space-x-3 p-3 mb-4 bg-white/5 rounded-xl">
                    <UserCircle size={24} className="text-blue-300" />
                    <span className="text-[10px] font-black uppercase tracking-tighter truncate">{userRole}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full text-blue-200 hover:text-red-300 transition-all font-bold text-xs uppercase tracking-widest">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}