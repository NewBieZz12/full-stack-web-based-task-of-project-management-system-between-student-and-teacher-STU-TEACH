import React, { useState } from 'react';
import { uploadAttachment } from '../api'; 

const AttachmentUpload = ({ workItemId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const data = await uploadAttachment(workItemId, selectedFile);
      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="attachment-upload" style={{ marginTop: '10px' }}>
      <input type="file" onChange={handleFileChange} />
      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default AttachmentUpload;