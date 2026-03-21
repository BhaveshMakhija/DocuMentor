import React, { useState } from 'react';

const QueryInput = ({ onSearch, disabled }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="query-form glass-panel">
            <input 
                type="text" 
                className="query-input"
                placeholder="Ask a question about your documents..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={disabled}
            />
            <button type="submit" className="submit-btn" disabled={disabled || !query.trim()}>Search</button>
        </form>
    );
};

export default QueryInput;
