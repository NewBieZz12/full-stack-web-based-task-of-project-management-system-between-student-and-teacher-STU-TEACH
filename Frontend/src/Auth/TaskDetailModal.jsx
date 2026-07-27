import React, { useState, useEffect } from "react";
import { X, Paperclip, FileText, Trash2 } from "lucide-react";
import HyTaskForm from "./HyTaskForm";
import HyCommentSection from "./HyCommentSection";
import api, { uploadAttachment, deleteAttachment } from "../api"; 

const TaskDetailModal = ({ 
  hyShow, 
  hyTask, 
  hyIsCreating, 
  hyOnClose, 
  hyOnSave, 
  hyOnDelete, 
  hyUsers, 
  hyColumns,
  hyIsOwner 
}) => {
  const [hyFormData, setHyFormData] = useState({
    hyTitle: "",
    hyDescription: "",
    hyPriority: "medium",
    hyStatus: "To-Do",
    hyColumnId: null, 
    hyDueDate: "",
    hyAssignees: [],
    hyAttachments: [], 
    hyNewFiles: [],   
    hyInitialComment: "",
  });

  const [hyShowInitialMentions, setHyShowInitialMentions] = useState(false);
  const [hyInitialMentionQuery, setHyInitialMentionQuery] = useState("");

  const statusOptions = ["To-Do", "In Progress", "Done"];

  useEffect(() => {
    if (hyIsCreating) {
      setHyFormData({ 
        hyTitle: "", 
        hyDescription: "", 
        hyPriority: "medium", 
        hyStatus: "To-Do",
        hyColumnId: null, 
        hyDueDate: "", 
        hyAssignees: [], 
        hyAttachments: [], 
        hyNewFiles: [], 
        hyInitialComment: "" 
      });
    } else if (hyTask) {
      setHyFormData({
        ...hyTask,
        hyColumnId: hyTask.hyColumnId, 
        hyDueDate: hyTask.hyDueDate ? hyTask.hyDueDate.split("T")[0] : "",
        hyAttachments: hyTask.hyAttachments || [],
        hyNewFiles: [] 
      });
    }
  }, [hyTask, hyIsCreating, hyShow]);

  const handleSave = async () => {
    if (!hyFormData.hyTitle.trim()) return alert("Please enter a task title");
    hyOnSave(hyFormData); 
  };

  const handleStatusTransition = (newStatus) => {
    const targetColumn = (hyColumns || []).find(col => col.name === newStatus);
    
    setHyFormData({ 
        ...hyFormData, 
        hyStatus: newStatus,
        hyColumnId: targetColumn ? targetColumn.id : hyFormData.hyColumnId 
    });
  };

  const handleRemoveExistingAttachment = async (attachmentId) => {
    if (!hyIsOwner) return; 
    if (!window.confirm("Delete this attachment?")) return;
    try {
        await deleteAttachment(attachmentId);
        setHyFormData({
            ...hyFormData,
            hyAttachments: hyFormData.hyAttachments.filter(a => a.id !== attachmentId)
        });
    } catch (err) {
        alert("Failed to delete attachment");
    }
  };

  if (!hyShow) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <input 
            className={`text-2xl font-black text-slate-800 uppercase tracking-tighter bg-transparent outline-none w-full placeholder:text-slate-300 ${!hyIsOwner && !hyIsCreating ? 'cursor-default' : ''}`}
            value={hyFormData.hyTitle}
            onChange={(e) => setHyFormData({...hyFormData, hyTitle: e.target.value})}
            placeholder="ENTER TASK NAME..."
            disabled={!hyIsOwner && !hyIsCreating} 
          />
          <button 
            onClick={hyOnClose} 
            className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-all active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-12 text-slate-900">
          
          <div className="lg:col-span-2 space-y-10">
            
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Workflow Stage</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase">
                  Current: {hyFormData.hyStatus}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {statusOptions.map((status, index) => (
                  <React.Fragment key={status}>
                    <button
                      onClick={() => handleStatusTransition(status)}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                        hyFormData.hyStatus === status
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]"
                          : "bg-white border-transparent text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                    {index < statusOptions.length - 1 && (
                      <div className="h-px w-4 bg-slate-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <HyTaskForm 
              hyForm={hyFormData} 
              hySetForm={setHyFormData} 
              hyUsers={hyUsers} 
              hyReadOnly={!hyIsOwner && !hyIsCreating} 
            />

            {!hyIsCreating && hyFormData.hyAttachments?.length > 0 && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Files</label>
                    <div className="grid grid-cols-2 gap-3">
                        {hyFormData.hyAttachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Paperclip size={14} className="text-blue-500 shrink-0" />
                                    <span className="text-xs font-bold truncate">{file.fileName}</span>
                                </div>
                                {hyIsOwner && (
                                    <button onClick={() => handleRemoveExistingAttachment(file.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {hyIsCreating && (
              <div className="relative pt-8 border-t border-slate-100">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                  Initial Update & @Mentions
                </label>
                <textarea 
                  className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
                  placeholder="Mention teammates to notify them... (e.g. @john)"
                  value={hyFormData.hyInitialComment}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHyFormData({...hyFormData, hyInitialComment: val});
                    const match = val.match(/@([A-Za-z0-9_\.]*)$/);
                    if (match) {
                        setHyShowInitialMentions(true);
                        setHyInitialMentionQuery(match[1] || "");
                    } else { 
                        setHyShowInitialMentions(false); 
                    }
                  }}
                  rows={3}
                />
                
                {hyShowInitialMentions && (
                  <div className="absolute bottom-full mb-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Suggested Members
                    </div>
                    {hyUsers.filter(u => u.hyName.toLowerCase().includes(hyInitialMentionQuery.toLowerCase())).map(user => (
                      <button
                        key={user.hyUserId}
                        onClick={() => {
                          const replacement = `@${user.hyName} `;
                          const next = hyFormData.hyInitialComment.replace(/@([A-Za-z0-9_\.]*)$/, replacement);
                          setHyFormData({...hyFormData, hyInitialComment: next});
                          setHyShowInitialMentions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                          {user.hyAvatar}
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{user.hyName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 text-slate-900">
            {!hyIsCreating ? (
              <HyCommentSection hyTask={hyTask} hyUsers={hyUsers} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                   <FileText size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
                  Collaboration tools activate<br/>after the task is created
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center">
          {!hyIsCreating && hyIsOwner ? (
            <button 
              onClick={() => hyOnDelete(hyTask.hyTaskItemId)} 
              className="flex items-center gap-2 px-6 py-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 rounded-2xl transition-all"
            >
              <Trash2 size={16} /> Delete Task
            </button>
          ) : <div />}

          <div className="flex items-center gap-6">
            <button 
              onClick={hyOnClose} 
              className="px-6 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 uppercase text-[10px] tracking-widest transition-all"
            >
              {hyIsCreating ? "Confirm & Create Task" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;