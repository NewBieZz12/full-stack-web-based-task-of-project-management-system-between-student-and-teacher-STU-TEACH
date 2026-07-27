import React, { useState, useEffect } from "react";
import { hyGetCommentsByTask, hyCreateComment } from "./hyTaskService"; 

const HyCommentSection = ({ hyTask, hyUsers = [] }) => {
  const [hyComments, setHyComments] = useState([]);
  const [hyText, setHyText] = useState("");
  const [hyShowMentions, setHyShowMentions] = useState(false);
  const [hyMentionQuery, setHyMentionQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const effectiveTaskId = hyTask?.hyTaskItemId || hyTask?.id;

  const mapComment = (c) => ({
    id: c.id,
    hyText: c.content,
    hyTimestamp: c.createdAt,
    hyUser: {
      hyName: c.authorName || "Teammate",
      hyAvatar: c.authorName?.substring(0, 2).toUpperCase() || "👤"
    }
  });

  useEffect(() => {
    const fetchComments = async () => {
      if (!effectiveTaskId) return;
      try {
        setIsSyncing(true);
        const response = await hyGetCommentsByTask(effectiveTaskId);
        const rawComments = Array.isArray(response) ? response : (response?.data || []);
        setHyComments(rawComments.map(mapComment));
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsSyncing(false);
      }
    };
    fetchComments();
  }, [effectiveTaskId]);

  const hyAddComment = async () => {
    if (!hyText.trim() || !effectiveTaskId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session missing. Please log in.");
        return;
      }

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payloadData = JSON.parse(window.atob(base64));

      const currentUserId = payloadData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payloadData.nameid || payloadData.sub;

      if (!currentUserId) {
        alert("Could not identify user. Please log in again.");
        return;
      }

      const payload = {
        content: hyText,
        workItemId: effectiveTaskId,
        authorId: parseInt(currentUserId)
      };

      const result = await hyCreateComment(payload);

      if (result) {
        setHyText("");
        const refresh = await hyGetCommentsByTask(effectiveTaskId);
        const refreshData = Array.isArray(refresh) ? refresh : (refresh?.data || []);
        setHyComments(refreshData.map(mapComment));
      }
    } catch (error) {
      console.error("Post Error:", error);
      alert("Failed to send comment.");
    }
  };

  const hyHandleMention = (user) => {
    const username = user.hyName || user.username;
    const replacement = `@${username} `;
    const lastAtIndex = hyText.lastIndexOf("@");
    const nextText = hyText.substring(0, lastAtIndex) + replacement;
    setHyText(nextText);
    setHyShowMentions(false);
  };

  const hyMentionCandidates = (hyUsers || []).filter((u) => {
    const q = hyMentionQuery.toLowerCase();
    const uName = (u.hyName || "").toLowerCase();
    return uName.includes(q);
  });

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Discussion</h3>
          
          {hyComments.length > 0 && (
            <div className="flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-red-500 rounded-full shadow-sm shadow-red-200">
              <span className="text-[9px] font-black text-white leading-none">
                {hyComments.length}
              </span>
            </div>
          )}
        </div>
        
        {isSyncing && <span className="text-[9px] font-bold text-blue-500 animate-pulse uppercase">Syncing...</span>}
      </div>

      <div className="space-y-3 relative">
        <textarea
          value={hyText}
          onChange={(e) => {
            setHyText(e.target.value);
            const match = e.target.value.match(/@([A-Za-z0-9_\.]*)$/);
            if (match) {
              setHyShowMentions(true);
              setHyMentionQuery(match[1] ?? "");
            } else {
              setHyShowMentions(false);
            }
          }}
          placeholder="Type @ to mention..."
          rows={2}
          className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] resize-none focus:border-blue-500 outline-none text-sm font-medium transition-all"
        />

        {hyShowMentions && hyMentionCandidates.length > 0 && (
          <div className="absolute bottom-full mb-2 w-full max-w-xs bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2">
            {hyMentionCandidates.map((user) => (
              <button
                key={user.hyUserId || user.id}
                onClick={() => hyHandleMention(user)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {user.hyAvatar || user.hyName?.substring(0,2)}
                </div>
                <span className="text-xs font-black text-slate-700">{user.hyName}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={hyAddComment}
            disabled={!hyText.trim() || isSyncing}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {isSyncing ? "Sending..." : "Post Update"}
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
        {hyComments.length > 0 ? (
          [...hyComments].reverse().map((comment) => (
            <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2">
              <div className="h-10 w-10 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-100 shadow-sm">
                {comment.hyUser?.hyAvatar}
              </div>
              <div className="flex-1 bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-slate-800 uppercase">{comment.hyUser?.hyName}</span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">
                    {comment.hyTimestamp ? new Date(comment.hyTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.hyText}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No conversation yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HyCommentSection;