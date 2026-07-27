
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5014/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const uploadAttachment = async (workItemId, file) => {
    const formData = new FormData();
    formData.append('file', file); 


    const response = await api.post(`/wj/attachments/upload/${workItemId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteAttachment = async (attachmentId) => {
    
    const response = await api.delete(`/wj/attachments/${attachmentId}`);
    return response.data;
};

export default api;