import React, { useState } from 'react';
const QueryInput = ({ onSearch, disabled }) => {
    const [q, setQ] = useState('');
    return (
        <form onSubmit={e => {e.preventDefault(); onSearch(q)}} className="query-form glass-panel">
            <input className="query-input" placeholder="Ask anything..." value={q} onChange={e => setQ(e.target.value)} disabled={disabled}/>
            <button type="submit" className="submit-btn" disabled={disabled || !q.trim()}>Ask</button>
        </form>
    );
};
export default QueryInput;
