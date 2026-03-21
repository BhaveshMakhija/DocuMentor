import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Upload, 
  MessageSquare, 
  Copy, 
  Check, 
  AlertCircle,
  Terminal,
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';
import { queryBackend, ingestDocument } from '../services/api';
import RAGVisualizer from '../components/RAGVisualizer';
import CitationList from '../components/CitationList';

const Home = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('idle');
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');
    
    const fileInputRef = useRef(null);

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
            setTimeout(() => setUploadSuccess(''), 4000);
        } catch (err) {
            setError('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result?.answer) return;
        navigator.clipboard.writeText(result.answer);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
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
                            <motion.div 
                            key="answer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 answer-box glow-card"
                            >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <MessageSquare size={16} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-100">AI Response</h2>
                                </div>
                                <button 
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                                >
                                {copySuccess ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                                {copySuccess ? 'Copied' : 'Copy Response'}
                                </button>
                            </div>

                            <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed text-lg">
                                {result.answer}
                            </div>

                            <CitationList citations={result.citations} />
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </>
                )}

                {activeTab === 'documents' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glow-card p-12">
                        <h2 className="text-3xl font-bold mb-6">Document Management</h2>
                        <p className="text-zinc-400 mb-8">Manage your indexed documents and upload new sources.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
                                <h3 className="font-bold mb-2">Ingest New Data</h3>
                                <p className="text-xs text-zinc-500 mb-4">Support for PDF and Text files.</p>
                                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all">
                                    {uploading ? 'Processing...' : 'Choose File'}
                                </button>
                            </div>
                            <div className="border border-white/10 rounded-2xl p-6 bg-white/5 flex flex-col items-center justify-center text-center">
                                <Database className="text-blue-400 mb-2" size={32} />
                                <div className="text-2xl font-bold">128</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest">Chunks Indexed</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'evaluation' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glow-card p-12 text-center">
                        <Cpu className="mx-auto text-purple-400 mb-4" size={48} />
                        <h2 className="text-3xl font-bold mb-6">RAG Evaluation</h2>
                        <p className="text-zinc-400 mb-8">Run RAGAS benchmarks to measure Faithfulness, Relevancy, and Accuracy.</p>
                        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:scale-105 transition-all">
                            Start Full Evaluation
                        </button>
                    </motion.div>
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
