import api from "../api"; 

export const hyGetAllTasks = async (projectId) => {
  try {
    const res = await api.get(`/wj/work-items/project/${projectId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const hyCreateTask = async (taskDto) => {
  try {
    const res = await api.post("/wj/work-items", taskDto);
    return res.data;
  } catch (error) {
    console.error("Error creating task:", error?.response?.data || error);
    return null;
  }
};

export const hyUpdateTask = async (id, taskDto) => {
  try {
    const res = await api.put(`/wj/work-items/${id}`, taskDto);
    return res.data;
  } catch (error) {
    console.error("Error updating task:", error);
    return null;
  }
};

export const hyDeleteTask = async (id) => {
  try {
    await api.delete(`/wj/work-items/${id}`);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

export const hyGetCommentsByTask = async (taskId) => {
  try {
    const res = await api.get(`/wj/comments/task/${taskId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const hyCreateComment = async (commentDto) => {
  try {
    const res = await api.post("/wj/comments", commentDto);
    return res.data;
  } catch (error) {
    console.error("Error creating comment:", error?.response?.data || error);
    return null;
  }
};

export const hyUploadAttachment = async (taskId, file) => {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post(`/wj/attachments/upload/${taskId}`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return null;
  }
};