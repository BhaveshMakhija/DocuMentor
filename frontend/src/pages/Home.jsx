import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Upload, 
  AlertCircle,
  Terminal,
  CheckCircle,
  Database,
  FileText,
  Calendar,
  Trash2
} from 'lucide-react';
import { queryBackend, ingestDocument, fetchDocuments, deleteDocument } from '../services/api';
import RAGVisualizer from '../components/RAGVisualizer';
import AnswerDisplay from '../components/AnswerDisplay';
import EvaluationDashboard from '../components/EvaluationDashboard';

const Home = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(() => {
        const saved = localStorage.getItem('last_rag_result');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('idle');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('active_tab') || 'chat';
    });
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [documents, setDocuments] = useState([]);
    
    const fileInputRef = useRef(null);

    // Persist result and active tab
    useEffect(() => {
        if (result) {
            localStorage.setItem('last_rag_result', JSON.stringify(result));
        }
    }, [result]);

    useEffect(() => {
        localStorage.setItem('active_tab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'documents') {
            loadDocuments();
        }
    }, [activeTab]);

    const loadDocuments = async () => {
        try {
            const docs = await fetchDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error("Failed to load documents:", err);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim() || loading) return;

        setLoading(true);
        setResult(null);
        setError('');
        
        // Sequence of visualization steps
        setStep('query');
        await new Promise(r => setTimeout(r, 800));
        setStep('hybrid');
        await new Promise(r => setTimeout(r, 1200));
        setStep('rerank');

        try {
            const data = await queryBackend(query);
            await new Promise(r => setTimeout(r, 1000));
            setStep('llm');
            await new Promise(r => setTimeout(r, 1500));
            setResult(data);
        } catch (err) {
            setError(err.message || 'The RAG pipeline encountered an error.');
            setStep('error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadSuccess('');
        try {
            await ingestDocument(file);
            setUploadSuccess(`Successfully ingested: ${file.name}`);
            loadDocuments(); 
            setTimeout(() => setUploadSuccess(''), 4000);
        } catch (err) {
            setError('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };
    
    const handleDeleteDocument = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}? This will remove all associated evaluations.`)) return;
        try {
            await deleteDocument(filename);
            loadDocuments();
        } catch (err) {
            setError('Delete failed: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Header / Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('chat')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center pulse">
                         <Terminal size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tighter premium-gradient-text uppercase">DocuMentor</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    <button 
                       type="button" 
                       onClick={() => setActiveTab('documents')}
                       className={`${activeTab === 'documents' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors uppercase tracking-widest`}
                    >
                      Documents
                    </button>
                    <button 
                       type="button" 
                       onClick={() => setActiveTab('evaluation')}
                       className={`${activeTab === 'evaluation' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors uppercase tracking-widest`}
                    >
                      Evaluation
                    </button>
                    <button 
                       type="button" 
                       onClick={() => setActiveTab('configuration')}
                       className={`${activeTab === 'configuration' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors uppercase tracking-widest`}
                    >
                      Configuration
                    </button>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 text-xs font-bold transition-all"
                >
                  <Upload size={14} /> {uploading ? 'Ingesting...' : 'Ingest Document'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
            </nav>

            <main className="container mx-auto max-w-5xl pt-32 pb-40 px-6">
                {activeTab === 'chat' && (
                    <>
                        <header className="mb-20 text-center">
                            <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl font-bold mb-4 premium-gradient-text"
                            >
                            Ask your Documents.
                            </motion.h1>
                            <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-500 text-lg"
                            >
                            A high-performance RAG pipeline for instant retrieval and clear intelligence.
                            </motion.p>
                        </header>

                        <div className="relative search-container">
                            <form onSubmit={handleSearch} className="relative z-20">
                                <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="search-input"
                                placeholder="What would you like to know?"
                                />
                                <button 
                                type="submit" 
                                disabled={loading}
                                className="absolute right-3 top-3 bg-blue-600 p-2.5 rounded-xl hover:bg-blue-500 transition-all flex items-center gap-2 group"
                                >
                                <Send size={18} />
                                </button>
                            </form>
                            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] -z-10 rounded-full" />
                        </div>

                        {uploadSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium"
                        >
                            <CheckCircle size={14} /> {uploadSuccess}
                        </motion.div>
                        )}

                        {(loading || step !== 'idle') && (
                        <RAGVisualizer currentStep={step} stats={result?.process_info} />
                        )}

                        <AnimatePresence>
                        {result && !loading && (
                             <AnswerDisplay 
                                 answer={result.answer} 
                                 citations={result.citations} 
                                 stats={result.process_info}
                             />
                        )}
                        </AnimatePresence>
                    </>
                )}

                {activeTab === 'documents' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glow-card p-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold">Document Management</h2>
                                <p className="text-zinc-400 mt-2">Manage your persistence layer and monitor indexing.</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">{documents.length}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Files</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">
                                        {documents.reduce((acc, d) => acc + d.chunk_count, 0)}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Chunks</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Upload Area */}
                            <div className="lg:col-span-1 border border-white/10 rounded-2xl p-8 bg-white/5 flex flex-col justify-center text-center group hover:border-blue-500/30 transition-all">
                                <Upload className="mx-auto text-zinc-500 group-hover:text-blue-400 mb-4 transition-colors" size={40} />
                                <h3 className="font-bold mb-2">Ingest New Data</h3>
                                <p className="text-xs text-zinc-500 mb-6">PDF, TXT, or MD support.</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    disabled={uploading}
                                    className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? 'Processing...' : <><Upload size={16} /> Choose File</>}
                                </button>
                            </div>

                            {/* Document List */}
                            <div className="lg:col-span-2 border border-white/10 rounded-2xl bg-black/40 p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{doc.filename}</div>
                                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1"><Calendar size={10} /> {doc.date_ingested?.split(' ')[0]}</span>
                                                            <span className="flex items-center gap-1"><Database size={10} /> {doc.chunk_count} Chunks</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                                        Indexed
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteDocument(doc.filename)}
                                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                        title="Delete Document"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-12">
                                        <Database size={40} className="mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No documents indexed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'evaluation' && (
                    <EvaluationDashboard />
                )}

                {activeTab === 'configuration' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glow-card p-12">
                        <h2 className="text-3xl font-bold mb-6">Pipeline Configuration</h2>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="font-bold">LLM Model</div>
                                    <div className="text-xs text-zinc-500">llama-3.1-8b-instant (via Groq)</div>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded">ACTIVE</div>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="font-bold">Embedding Model</div>
                                    <div className="text-xs text-zinc-500">sentence-transformers/all-MiniLM-L6-v2</div>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded">LOCAL</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && (
                   <div className="mt-8 flex items-center gap-3 p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-sm">
                      <AlertCircle size={18} /> {error}
                   </div>
                )}
            </main>

            {/* Background Decorations */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] -z-10 rounded-full" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] -z-10 rounded-full" />
        </div>
    );
};

export default Home;
