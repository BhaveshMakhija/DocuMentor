import React, { useState } from 'react';
import QueryInput from '../components/QueryInput';
import AnswerDisplay from '../components/AnswerDisplay';
import DocumentUpload from '../components/DocumentUpload';
import { queryBackend, ingestDocument } from '../services/api';

const Home = () => {
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query) => {
        setLoading(true); setStatus(''); setResult(null);
        try { const data = await queryBackend(query); setResult(data); } 
        catch (e) { setStatus('Error: ' + e.message); } 
        finally { setLoading(false); }
    };

    const handleUpload = async (file) => {
        setLoading(true); setStatus(`Uploading ${file.name}...`);
        try { const data = await ingestDocument(file); setStatus(`Success: ${data.message}`); } 
        catch (e) { setStatus('Error: ' + e.message); } 
        finally { setLoading(false); }
    }

    return (
        <div className="app-container">
            <header className="header"><h1>DocuMentor</h1><p>Ask My Docs AI</p></header>
            <main>
                <DocumentUpload onUpload={handleUpload} />
                <QueryInput onSearch={handleSearch} disabled={loading} />
                {status && <div className="status-msg">{status}</div>}
                <AnswerDisplay answer={result?.answer} citations={result?.citations} />
            </main>
        </div>
    );
};
export default Home;
