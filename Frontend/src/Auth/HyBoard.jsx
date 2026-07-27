import React, { useState } from "react";
import HyColumn from "./HyColumn"; 
import { Plus, X, Trash2 } from "lucide-react"; 

const HyBoard = ({ 
  hyTasks, 
  hyColumns, 
  hyOnTaskClick, 
  hyOnCreateTask,
  hyOnAddColumn, 
  hyOnDeleteColumn,
  hyIsOwner
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      hyOnAddColumn(newColumnName.trim());
      setNewColumnName("");
      setIsAdding(false);
    }
  };

  const handleAttemptDelete = (column) => {
    const tasksInThisColumn = (hyTasks || []).filter(
      (t) => Number(t.hyColumnId) === Number(column.id)
    );

    if (tasksInThisColumn.length > 0) {
      alert(`Cannot delete "${column.name}". Move or delete the ${tasksInThisColumn.length} tasks inside it first.`);
      return;
    }

    setConfirmDeleteId(column.id);
  };

  const processDelete = (id) => {
    hyOnDeleteColumn(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex gap-8 h-full items-start overflow-x-auto pb-10 scrollbar-hide">
      {(hyColumns || []).map((column) => (
        <div key={column.id} className="relative group shrink-0">
          
          {hyIsOwner && (
            <div className="absolute -top-3 -right-2 z-20 flex flex-col items-end">
              {confirmDeleteId === column.id ? (
                <div className="bg-white border border-red-200 rounded-xl p-2 shadow-2xl flex items-center gap-2 animate-in zoom-in-95 duration-200">
                  <span className="text-[9px] font-black uppercase text-red-600 px-1">Delete?</span>
                  <button 
                    onClick={() => processDelete(column.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase hover:bg-red-700 transition-colors"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[8px] font-black uppercase hover:bg-slate-200"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleAttemptDelete(column)} 
                  className="bg-white p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  title="Delete Column"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}

          <HyColumn
            hyColumnId={column.id}
            hyColumnName={column.name}
            hyTasks={(hyTasks || []).filter((t) => Number(t.hyColumnId) === Number(column.id))}
            hyOnTaskClick={hyOnTaskClick}
            hyOnCreateTask={hyOnCreateTask}
            hyIsOwner={hyIsOwner}
          />
        </div>
      ))}

      {hyIsOwner && (
        <div className="shrink-0 w-72">
          {isAdding ? (
            <div className="bg-white p-5 rounded-[2rem] border-2 border-blue-500/20 shadow-xl shadow-blue-500/5">
              <h4 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">New Status Column</h4>
              <input
                autoFocus
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                placeholder="e.g. In Review"
                className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold mb-3 text-slate-900"
              />
              <div className="flex gap-2">
                <button onClick={handleAddColumn} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700">Create</button>
                <button onClick={() => setIsAdding(false)} className="px-4 bg-slate-100 text-slate-500 py-2 rounded-xl"><X size={14} /></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-72 py-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-all group shrink-0">
              <Plus size={20} className="mb-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Add Column</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HyBoard;