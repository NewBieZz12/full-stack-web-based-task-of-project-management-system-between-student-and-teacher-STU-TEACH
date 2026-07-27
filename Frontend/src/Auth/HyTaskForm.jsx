import React from "react";
import { Paperclip, Plus, X, Download, Trash2, Calendar, ShieldAlert, UserPlus } from "lucide-react";
import { deleteAttachment } from "../api";

const HyTaskForm = ({ hyForm, hySetForm, hyUsers, hyReadOnly }) => {
  
  const hyHandleFileUpload = (e) => {
    if (hyReadOnly) return;
    const files = Array.from(e.target.files);
    hySetForm({ 
      ...hyForm, 
      hyNewFiles: [...(hyForm.hyNewFiles || []), ...files] 
    });
  };

  const removePendingFile = (index) => {
    if (hyReadOnly) return;
    const updatedFiles = [...hyForm.hyNewFiles];
    updatedFiles.splice(index, 1);
    hySetForm({ ...hyForm, hyNewFiles: updatedFiles });
  };

  const handleDeleteExisting = async (fileId) => {
    if (hyReadOnly) return; 
    if (window.confirm("Permanent delete this attachment?")) {
      try {
        await deleteAttachment(fileId);
        hySetForm({
          ...hyForm,
          hyAttachments: (hyForm.hyAttachments || []).filter((f) => f.id !== fileId),
        });
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete file.");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <ShieldAlert size={12} className="text-blue-500" /> Priority Level
          </label>
          <select
            value={hyForm.hyPriority}
            onChange={(e) => hySetForm({ ...hyForm, hyPriority: e.target.value })}
            className={`w-full px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${hyReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
            disabled={hyReadOnly}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <Calendar size={12} className="text-blue-500" /> Completion Date
          </label>
          <input
            type="date"
            value={hyForm.hyDueDate}
            onChange={(e) => hySetForm({ ...hyForm, hyDueDate: e.target.value })}
            className={`w-full px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${hyReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
            disabled={hyReadOnly}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <UserPlus size={12} className="text-blue-500" /> Assign Teammate
        </label>
        <div className="flex gap-2 flex-wrap">
          {hyUsers.map((user) => {
            const isSelected = hyForm.hyAssignees?.some(u => u.hyUserId === user.hyUserId);
            return (
              <button
                key={user.hyUserId}
                type="button"
                onClick={() => {
                  if (hyReadOnly) return;
                  hySetForm({
                    ...hyForm,
                    hyAssignees: isSelected ? [] : [user] 
                  });
                }}
                className={`px-4 py-2 rounded-2xl border-2 transition-all flex items-center gap-2 text-xs font-bold ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white border-slate-100 text-slate-500 " + (!hyReadOnly ? "hover:border-blue-200" : "")
                } ${hyReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {user.hyAvatar}
                </span>
                {user.hyName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
        <textarea
          value={hyForm.hyDescription}
          onChange={(e) => hySetForm({ ...hyForm, hyDescription: e.target.value })}
          placeholder={hyReadOnly ? "No description provided." : "What needs to be done?..."}
          rows={4}
          className={`w-full px-4 py-3 bg-slate-100 border-none rounded-2xl resize-none text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${hyReadOnly ? 'opacity-80' : ''}`}
          disabled={hyReadOnly}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Attachments</label>
        <div className="space-y-2">
          {(hyForm.hyAttachments || []).map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-xs font-bold text-slate-600 truncate">{file.fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`http://localhost:5014${file.filePath}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-1 text-blue-500 hover:bg-white rounded transition-all"
                >
                  <Download size={16} />
                </a>
                {!hyReadOnly && (
                  <button 
                    type="button" 
                    onClick={() => handleDeleteExisting(file.id)} 
                    className="p-1 text-red-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {(hyForm.hyNewFiles || []).map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <Plus className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Ready:</span>
                <span className="text-xs font-bold text-slate-600 truncate">{file.name}</span>
              </div>
              {!hyReadOnly && (
                <button type="button" onClick={() => removePendingFile(index)} className="text-red-400">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          {!hyReadOnly && (
            <label className="flex items-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-all text-xs font-black uppercase tracking-widest bg-slate-50/50">
              <Plus size={16} /> Add attachment
              <input type="file" multiple onChange={hyHandleFileUpload} className="hidden" />
            </label>
          )}
          
          {hyReadOnly && (hyForm.hyAttachments || []).length === 0 && (
            <div className="text-[10px] font-bold text-slate-400 uppercase italic py-2">
              No files attached to this task
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HyTaskForm;