import React, { useState } from 'react';

const DocumentUpload = ({ onUpload }) => {
    const [file, setFile] = useState(null);

    const handleUpload = (e) => {
        // ... Placeholder logic to send via FormData
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="upload-section">
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Upload To DocuMentor</button>
        </div>
    );
};

export default DocumentUpload;
