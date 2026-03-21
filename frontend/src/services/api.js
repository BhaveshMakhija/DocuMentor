export const queryBackend = async (query) => {
    const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Search failed");
    }
    return res.json();
};

export const ingestDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
    }
    return res.json();
};
