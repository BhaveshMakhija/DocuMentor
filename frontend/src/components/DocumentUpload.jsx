import React, { useState } from 'react';

const DocumentUpload = ({ onUpload }) => {
    const [file, setFile] = useState(null);

    const handleUpload = () => {
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="glass-panel upload-section">
            <label className="upload-btn">
                <span>Upload Document (PDF, TXT, MD)</span>
                <input 
                    type="file" 
                    className="file-input"
                    accept=".pdf,.txt,.md"
                    onChange={e => setFile(e.target.files[0])} 
                />
            </label>
            {file && (
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center'}}>
                    <span style={{color: 'var(--text-muted)'}}>{file.name}</span>
                    <button onClick={handleUpload} className="submit-btn" style={{padding: '0.5rem 1rem'}}>Upload</button>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
