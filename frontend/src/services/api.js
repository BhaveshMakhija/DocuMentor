export const queryBackend = async (q) => {
    const r = await fetch('http://localhost:8000/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
    if (!r.ok) throw new Error("Failed");
    return r.json();
};
export const ingestDocument = async (f) => {
    const fd = new FormData(); fd.append('file', f);
    const r = await fetch('http://localhost:8000/ingest', { method: 'POST', body: fd });
    if (!r.ok) throw new Error("Failed");
    return r.json();
};

// --- Evaluation, Logs & Documents —--

export const fetchEvaluation = async () => {
    const r = await fetch('http://localhost:8000/api/evaluation');
    if (!r.ok) throw new Error("Could not fetch evaluation results. Run evaluation first.");
    return r.json();
};

export const fetchLogs = async () => {
    const r = await fetch('http://localhost:8000/api/logs');
    if (!r.ok) throw new Error("Could not fetch observability logs.");
    return r.json();
};

export const fetchDocuments = async () => {
    const r = await fetch('http://localhost:8000/api/documents');
    if (!r.ok) throw new Error("Could not fetch documents.");
    return r.json();
};
