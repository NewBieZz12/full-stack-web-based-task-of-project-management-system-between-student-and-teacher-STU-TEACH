import React from "react";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";

const PRIORITY_COLORS = {
  low: "bg-green-50 text-green-600 border-green-100",
  medium: "bg-amber-50 text-amber-600 border-amber-100",
  high: "bg-red-50 text-red-600 border-red-100",
};

const STATUS_COLORS = {
  "To-Do": "bg-slate-100 text-slate-600 border-slate-200",
  "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
  "Done": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const HyTaskCard = ({ hyTask, hyOnTaskClick }) => {
  
  const getStatusStyle = (status) => {
    return STATUS_COLORS[status] || "bg-slate-50 text-slate-500 border-slate-100";
  };

  return (
    <div
      onClick={() => hyOnTaskClick(hyTask)}
      className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200 cursor-pointer 
                 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
                 hover:border-blue-400 group"
    >
      <h3 className="font-bold text-slate-800 mb-3 text-[15px] leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
        {hyTask.hyTitle}
      </h3>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
            PRIORITY_COLORS[hyTask.hyPriority?.toLowerCase()] || PRIORITY_COLORS.medium
          }`}
        >
          {hyTask.hyPriority}
        </span>

        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(hyTask.hyStatus)}`}
        >
          {hyTask.hyStatus}
        </span>

        {hyTask.hyDueDate && (
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <Calendar className="w-3 h-3 text-blue-500" />
            {new Date(hyTask.hyDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {(hyTask.hyAssignees || []).length > 0 ? (
              hyTask.hyAssignees.map((user) => (
                <div
                  key={user.hyUserId}
                  title={user.hyName}
                  className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white border-2 border-white shadow-sm transition-transform hover:z-10 hover:scale-110"
                >
                  {user.hyAvatar}
                </div>
              ))
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-dashed border-slate-200" />
            )}
          </div>

          {hyTask.hyAttachments?.length > 0 && (
            <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
              <Paperclip className="w-3 h-3" />
              <span className="text-[10px] font-bold">{hyTask.hyAttachments.length}</span>
            </div>
          )}
        </div>

        {hyTask.hyCommentCount > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 rounded-full shadow-lg shadow-red-200">
              <span className="text-[9px] font-black text-white leading-none">
                {hyTask.hyCommentCount}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HyTaskCard;