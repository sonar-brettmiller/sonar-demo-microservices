import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('❌ Please select a file first');
      return;
    }

    if (!user?.token) {
      setUploadStatus('❌ Upload failed. Please try again.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      setUploadStatus('✅ Upload successful!');
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="mt-3">
      <h6>📁 File Upload</h6>
      
      <div className="form-group">
        <label htmlFor="file-input">Select file:</label>
        <input
          id="file-input"
          type="file"
          className="form-control-file"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </div>

      {selectedFile && (
        <div className="alert alert-info">
          <strong>Selected:</strong> {selectedFile.name}<br/>
          <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB<br/>
          <strong>Type:</strong> {selectedFile.type || 'Unknown'}
        </div>
      )}

      <button 
        className="btn btn-primary btn-sm" 
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>

      {uploadStatus && (
        <div className="mt-2">
          <small className="text-muted">{uploadStatus}</small>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

