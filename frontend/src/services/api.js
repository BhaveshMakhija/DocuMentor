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
