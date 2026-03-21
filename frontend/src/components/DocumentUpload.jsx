import React, { useState } from 'react';
const DocumentUpload = ({ onUpload }) => {
    const [f, setF] = useState(null);
    return (
        <div className="glass-panel upload-section">
            <label className="upload-btn"><span>Upload PDF/TXT/MD</span>
                <input type="file" className="file-input" accept=".pdf,.txt,.md" onChange={e => setF(e.target.files[0])}/>
            </label>
            {f && <div style={{marginTop: '1rem'}}>{f.name} <button onClick={() => onUpload(f)} className="submit-btn">Upload</button></div>}
        </div>
    );
};
export default DocumentUpload;
