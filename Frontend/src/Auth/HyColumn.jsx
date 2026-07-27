import React from "react";
import { Plus } from "lucide-react";
import HyTaskCard from "./HyTaskCard"; 

const HyColumn = ({ hyColumnId, hyColumnName, hyTasks, hyOnTaskClick, hyOnCreateTask }) => {
  return (
    <div className="bg-slate-200/90 backdrop-blur-md rounded-[2rem] p-5 border border-slate-300 shadow-xl w-80 flex flex-col max-h-[calc(100vh-180px)]">
      
      <div className="flex items-center justify-between mb-6 px-2 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">
            {hyColumnName}
          </h2>
          <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
            {hyTasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
        {hyTasks.length > 0 ? (
          hyTasks.map((task) => (
            <HyTaskCard 
              key={task.hyTaskItemId} 
              hyTask={task} 
              hyOnTaskClick={hyOnTaskClick} 
            />
          ))
        ) : (
          <div className="py-10 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No Tasks</span>
          </div>
        )}

        <button
          onClick={() => hyOnCreateTask(hyColumnId)}
          className="w-full py-4 text-slate-700 hover:text-black hover:bg-white/80 border-2 border-dashed border-slate-400 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2 group sticky bottom-0 bg-slate-200/50 backdrop-blur-sm"
        >
          <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Plus className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Add Task</span>
        </button>
      </div>
    </div>
  );
};

export default HyColumn;