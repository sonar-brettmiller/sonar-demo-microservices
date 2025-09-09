import React, { useState } from 'react';

const FileUpload = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLog, setUploadLog] = useState([]);

  // ⚠️ SECURITY ISSUE: No file type validation
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      // ⚠️ SECURITY ISSUE: Logging file information including potentially sensitive paths
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        webkitRelativePath: file.webkitRelativePath
      });

      // ⚠️ SECURITY ISSUE: Storing file metadata in localStorage
      localStorage.setItem('lastSelectedFile', JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: user?.username,
        timestamp: new Date().toISOString()
      }));
    }
  };

  // ⚠️ SECURITY ISSUE: Unsafe file upload simulation
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    // ⚠️ SECURITY ISSUE: No file size limits
    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB
      console.warn('Large file detected, but proceeding anyway...');
    }

    // ⚠️ SECURITY ISSUE: No file type restrictions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif'];
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    
    if (dangerousExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))) {
      console.warn('Potentially dangerous file type, but proceeding anyway...');
    }

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // ⚠️ SECURITY ISSUE: Simulated upload that stores file data unsafely
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          content: e.target.result, // ⚠️ SECURITY ISSUE: Storing file content in memory
          uploadedBy: user?.username,
          uploadedAt: new Date().toISOString(),
          userAgent: navigator.userAgent
        };

        // ⚠️ SECURITY ISSUE: Logging file content
        console.log('File uploaded:', fileData);

        // ⚠️ SECURITY ISSUE: Storing uploaded files in localStorage
        const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        uploadHistory.push(fileData);
        localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));

        const logEntry = `${new Date().toISOString()} - Uploaded: ${selectedFile.name} (${selectedFile.size} bytes)`;
        setUploadLog(prev => [...prev, logEntry]);

        alert('File uploaded successfully (simulated)');
        setUploadProgress(0);
        setSelectedFile(null);
      };

      // ⚠️ SECURITY ISSUE: Reading file as data URL without validation
      reader.readAsDataURL(selectedFile);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    }
  };

  // ⚠️ SECURITY ISSUE: Function that downloads upload history with sensitive data
  const downloadUploadHistory = () => {
    const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    
    const historyData = {
      uploads: history,
      exportedBy: user?.username,
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      // ⚠️ SECURITY ISSUE: Including session data
      sessionData: {
        cookies: document.cookie,
        localStorage: { ...localStorage }
      }
    };

    console.log('Downloading upload history:', historyData);

    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'upload-history.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ⚠️ SECURITY ISSUE: Function that previews file content unsafely
  const previewFile = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      // ⚠️ SECURITY ISSUE: Creating popup with file content without sanitization
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(`
        <html>
          <head><title>File Preview: ${selectedFile.name}</title></head>
          <body>
            <h3>File: ${selectedFile.name}</h3>
            <p>Size: ${selectedFile.size} bytes</p>
            <p>Type: ${selectedFile.type}</p>
            <hr>
            <pre>${e.target.result}</pre>
          </body>
        </html>
      `);
    };

    // ⚠️ SECURITY ISSUE: Reading file as text without type checking
    if (selectedFile.type.startsWith('text/') || selectedFile.name.endsWith('.txt')) {
      reader.readAsText(selectedFile);
    } else {
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="mt-3">
      <h6>📁 File Upload (Demo)</h6>
      
      <div className="form-group">
        <input
          type="file"
          className="form-control-file"
          onChange={handleFileSelect}
          // ⚠️ SECURITY ISSUE: No file type restrictions
          accept="*/*"
        />
      </div>

      {selectedFile && (
        <div className="alert alert-info">
          <strong>Selected:</strong> {selectedFile.name}<br/>
          <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB<br/>
          <strong>Type:</strong> {selectedFile.type || 'Unknown'}
          
          <div className="mt-2">
            <button 
              className="btn btn-primary btn-sm mr-2" 
              onClick={handleUpload}
            >
              📤 Upload
            </button>
            <button 
              className="btn btn-outline-info btn-sm" 
              onClick={previewFile}
            >
              👁️ Preview
            </button>
          </div>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress mb-3">
          <div 
            className="progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
        </div>
      )}

      {uploadLog.length > 0 && (
        <div>
          <h6 className="mt-3">Upload Log:</h6>
          <div className="card">
            <div className="card-body p-2">
              {uploadLog.map((log, index) => (
                <small key={index} className="d-block text-muted">
                  {log}
                </small>
              ))}
            </div>
          </div>
          
          <button 
            className="btn btn-outline-secondary btn-sm mt-2"
            onClick={downloadUploadHistory}
          >
            📥 Download History
          </button>
        </div>
      )}

      {/* ⚠️ SECURITY ISSUE: Hidden form that could be manipulated */}
      <form style={{ display: 'none' }} id="hidden-upload-form">
        <input type="hidden" name="max_file_size" value="999999999" />
        <input type="hidden" name="upload_path" value="../../../etc/passwd" />
        <input type="hidden" name="bypass_validation" value="true" />
      </form>

      <div className="alert alert-warning mt-3">
        <small>
          <strong>Security Issues:</strong> No file type validation, unsafe previews, 
          path traversal potential, sensitive data logging, unrestricted file sizes.
        </small>
      </div>
    </div>
  );
};

export default FileUpload;
