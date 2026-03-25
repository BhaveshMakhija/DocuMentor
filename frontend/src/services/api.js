const BASE_URL = 'http://localhost:8000';

export const queryBackend = async (q) => {
    const r = await fetch(`${BASE_URL}/query`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
    if (!r.ok) throw new Error("Failed");
    return r.json();
};

export const ingestDocument = async (f) => {
    const fd = new FormData(); fd.append('file', f);
    const r = await fetch(`${BASE_URL}/ingest`, { method: 'POST', body: fd });
    if (!r.ok) throw new Error("Failed");
    return r.json();
};

export const fetchEvaluation = async () => {
    const r = await fetch(`${BASE_URL}/api/evaluation`);
    if (!r.ok) return null;
    return r.json();
};

export const fetchLogs = async () => {
    const r = await fetch(`${BASE_URL}/api/logs`);
    if (!r.ok) throw new Error("Could not fetch observability logs.");
    return r.json();
};

export const runEvaluation = async (docId = null) => {
    const url = docId ? `${BASE_URL}/api/start-benchmark?doc_id=${docId}` : `${BASE_URL}/api/start-benchmark`;
    const r = await fetch(url, { method: 'POST' });
    if (!r.ok) throw new Error("Evaluation run failed.");
    return r.json();
};

export const fetchBenchmarkStatus = async (jobId) => {
    const r = await fetch(`${BASE_URL}/api/benchmark-status/${jobId}`);
    if (!r.ok) throw new Error("Job not found");
    return r.json();
};

export const fetchMetrics = async () => {
    const r = await fetch(`${BASE_URL}/api/metrics`);
    if (!r.ok) throw new Error("Could not fetch system metrics.");
    return r.json();
};

export const fetchDocuments = async () => {
    const r = await fetch(`${BASE_URL}/api/documents`);
    if (!r.ok) throw new Error("Could not fetch documents.");
    return r.json();
};

export const deleteDocument = async (filename) => {
    const r = await fetch(`${BASE_URL}/api/documents/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    if (!r.ok) throw new Error("Failed to delete document.");
    return r.json();
};

export const clearHistory = async () => {
    const r = await fetch(`${BASE_URL}/api/history`, { method: 'DELETE' });
    if (!r.ok) throw new Error("Failed to clear history.");
    return r.json();
};
