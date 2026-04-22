import axios from 'axios';
import API_URL from './config';

export const uploadDataset = async (file, token, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/files/upload-dataset`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
  return response.data;
};

export const uploadDocument = async (file, token, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/files/upload-document`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
  return response.data;
};

export const getDatasets = async (token) => {
  const response = await axios.get(`${API_URL}/files/datasets`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getDocuments = async (token) => {
  const response = await axios.get(`${API_URL}/files/documents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteDataset = async (id, token) => {
  const response = await axios.delete(`${API_URL}/files/datasets/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
