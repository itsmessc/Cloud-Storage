import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Update to your backend URL

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const register = (data) => apiClient.post('/auth/register', data);
export const login = (data) => apiClient.post('/auth/login', data);

// Folder
export const getFolderContents = (id) => apiClient.get(`/folder/${id}`);

// File
export const getFileById = (id) => apiClient.get(`/file/${id}`);
export const deleteFile = (id) => apiClient.delete(`/file/${id}`);
export const getCurrentFolder = async () => {
  const response = await axios.get(`${API_URL}/folder/current`, { /* include auth headers */ });
  return response.data;
};


export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/file/upload`, formData, { /* include auth headers */ });
  return response.data;
};


export const createFolder = async (folderData, token) => {
    return await axios.post(`${API_URL}/create`, folderData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const getSubfolders = async (folderId, token) => {
    return await axios.get(`${API_URL}/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
