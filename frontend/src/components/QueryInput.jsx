import React, { useState } from 'react';

const QueryInput = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="query-input">
            <input 
                type="text" 
                placeholder="Ask about your documents..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
        </form>
    );
};

export default QueryInput;
