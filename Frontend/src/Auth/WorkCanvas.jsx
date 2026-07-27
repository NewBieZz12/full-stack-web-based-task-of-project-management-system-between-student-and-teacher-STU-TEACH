import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import HyBoard from "../hy/HyBoard";
import TaskDetailModal from "../hy/TaskDetailModal"; 
import api from "../api"; 

const WorkCanvas = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [boardColumns, setBoardColumns] = useState([]); 
  const [projectMembers, setProjectMembers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskColumnId, setNewTaskColumnId] = useState(null); 

  const isPrivileged = project && (
    Number(currentUserId) === Number(project.createdById) || 
    userRole === "Teacher"
  );

  const fetchWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      
      const savedUserId = localStorage.getItem('hyUserId') || localStorage.getItem('userId');
      const savedRole = localStorage.getItem('role');
      
      if (savedUserId) setCurrentUserId(Number(savedUserId));
      if (savedRole) setUserRole(savedRole);

      const [pRes, iRes, cRes] = await Promise.all([
        api.get(`/wj/projects/${id}/details`), 
        api.get(`/wj/work-items/project/${id}`),
        api.get(`/wj/board-columns/project/${id}`) 
      ]);

      const details = pRes.data;
      setProject(details);
      
      const rawColumns = cRes.data?.$values || cRes.data || [];
      setBoardColumns(rawColumns); 
      
      const rawMembers = details.members?.$values || details.members || [];
      const mappedMembers = rawMembers.map(m => ({
        hyUserId: m.user?.id,
        hyName: (m.user?.username || "Unknown").toUpperCase(),
        hyRole: m.role,
        hyAvatar: (m.user?.username || "??").substring(0, 2).toUpperCase()
      }));
      setProjectMembers(mappedMembers);

      const rawItems = iRes.data?.$values || iRes.data || [];
      const mappedItems = rawItems.map(item => ({
        hyTaskItemId: item.id,
        hyTitle: item.title,
        hyDescription: item.content,
        hyStatus: item.status,
        hyColumnId: item.columnId, 
        hyPriority: item.priority || "Medium",
        hyDueDate: item.deadline || "", 
        hyAttachments: item.attachments?.$values || item.attachments || [],
        hyCommentCount: item.commentCount || 0,
        hyAssignees: item.assignedToId 
          ? mappedMembers.filter(m => m.hyUserId === item.assignedToId) 
          : []
      }));

      setWorkItems(mappedItems);
    } catch (err) {
      console.error("Load Error:", err);
      if (err.response?.status === 403) {
          alert("Access Denied: You are not a member of this project.");
          navigate('/project');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleAddColumn = async (name) => {
    if (!isPrivileged) return;
    try {
      await api.post(`/wj/board-columns`, { name, projectId: parseInt(id) });
      await fetchWorkspaceData(); 
    } catch (err) { alert("Failed to create column."); }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!isPrivileged) return;
    try {
      await api.delete(`/wj/board-columns/${columnId}`);
      await fetchWorkspaceData(); 
    } catch (err) { alert(err.response?.data?.message || "Delete failed."); }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsCreating(false);
    setShowModal(true);
  };

  const handleCreateRequest = (columnId) => { 
    if (!isPrivileged) {
      alert("Only Teachers or Project Owners can create tasks.");
      return;
    }
    setSelectedItem(null);
    setIsCreating(true);
    setNewTaskColumnId(columnId); 
    setShowModal(true);
  };

  const handleSaveItem = async (form) => {
    try {
      const targetColumnId = isCreating ? newTaskColumnId : (selectedItem?.hyColumnId || form.hyColumnId);
      
      const payload = {
        Title: form.hyTitle,
        Content: form.hyDescription || "",
        ColumnId: targetColumnId,
        Status: form.hyStatus || "To-Do", 
        Priority: form.hyPriority || "Medium",
        Deadline: form.hyDueDate ? new Date(form.hyDueDate).toISOString() : null,
        ProjectId: parseInt(id),
        AssignedToId: form.hyAssignees?.length > 0 ? form.hyAssignees[0].hyUserId : null
      };
  
      let savedTask;
      if (isCreating) {
        const res = await api.post(`/wj/work-items`, payload);
        savedTask = res.data;
      } else {
        const res = await api.put(`/wj/work-items/${selectedItem.hyTaskItemId}`, payload);
        savedTask = res.data;
      }
  
      const targetId = savedTask.id || savedTask.Id || selectedItem?.hyTaskItemId;
  
      if (targetId && form.hyNewFiles && form.hyNewFiles.length > 0) {
        for (const file of form.hyNewFiles) {
          const formData = new FormData();
          formData.append("file", file); 
          await api.post(`/wj/attachments/upload/${targetId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }
  
      await fetchWorkspaceData(); 
      setShowModal(false);
      setSelectedItem(null);
    } catch (err) { 
      console.error("Save error:", err);
      alert("Failed to save work item."); 
    }
  };

  const handleDeleteItem = async (taskId) => {
    if (!isPrivileged) return;
    if (window.confirm("Delete this entire task permanently?")) {
      try {
        await api.delete(`/wj/work-items/${taskId}`); 
        await fetchWorkspaceData();
        setShowModal(false);
      } catch (err) { alert("Delete failed."); }
    }
  };

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center font-black text-white uppercase tracking-widest text-xs">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Initializing Canvas...
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-900">
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30 w-full">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/project')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ChevronLeft size={22} />
            </button>
            <div className="flex flex-col">
              <span className="text-blue-600 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Workspace</span>
              <h1 className="text-xl font-black text-black uppercase tracking-tighter italic">
                {project?.name || "CANVAS"}
              </h1>
            </div>
          </div>
          <div className="flex -space-x-2">
            {projectMembers.slice(0, 4).map((m, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm" title={m.hyName}>
                {m.hyAvatar}
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 overflow-hidden">
          <div className="h-full w-full overflow-hidden flex justify-center items-start">
              <HyBoard
                hyTasks={workItems}
                hyColumns={boardColumns}
                hyOnTaskClick={handleItemClick}
                hyOnCreateTask={handleCreateRequest}
                hyOnAddColumn={handleAddColumn}
                hyOnDeleteColumn={handleDeleteColumn}
                hyIsOwner={isPrivileged}
              />
          </div>
        </main>
      </div>

      <TaskDetailModal
        hyShow={showModal}
        hyTask={selectedItem}
        hyIsCreating={isCreating}
        hyOnClose={() => setShowModal(false)}
        hyOnSave={handleSaveItem}
        hyOnDelete={handleDeleteItem}
        hyUsers={projectMembers} 
        hyColumns={boardColumns}
        hyIsOwner={isPrivileged}
      />
    </div>
  );
};

export default WorkCanvas;