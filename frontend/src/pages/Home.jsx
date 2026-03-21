import React, { useState } from 'react';
import QueryInput from '../components/QueryInput';
import AnswerDisplay from '../components/AnswerDisplay';
import DocumentUpload from '../components/DocumentUpload';

const Home = () => {
    const [result, setResult] = useState(null);

    const handleSearch = async (query) => {
        // ... Placeholder API call
        setResult({ answer: `You asked: ${query}`, citations: [] });
    };

    const handleUpload = async (file) => {
        // ... Placeholder logic
        alert("Simulated ingestion of " + file.name);
    }

    return (
        <div className="home-container">
            <h1>DocuMentor Dashboard</h1>
            <DocumentUpload onUpload={handleUpload} />
            <QueryInput onSearch={handleSearch} />
            <AnswerDisplay answer={result?.answer} citations={result?.citations} />
        </div>
    );
};

export default Home;
