# 🚀 DocuMentor: Production-Grade RAG with Observability & Evaluation

DocuMentor is a production-level Retrieval-Augmented Generation (RAG) application designed for high-accuracy document search and answering. It transitions from a basic "search tool" into a complete, measurable system with hybrid retrieval, cross-encoder reranking, citation enforcement, and a robust evaluation framework.

---

## 🏗️ Architecture

```text
User Query
   ↓
Query Processing
   ↓
Hybrid Retriever (BM25 + Vector)
   ↓
Reranker (Cross-Encoder)
   ↓
LLM (Llama 3.1 8B instant)
   ↓
Answer + Citations
   ↓
Evaluation (RAGAS) + Observability (Logging)
```

---

## 🔥 Key Features

### 1. Hybrid Retrieval
DocuMentor combines the strengths of keyword-based (BM25 - Elasticsearch) and semantic (FAISS Vector Search) retrieval to ensure high recall for both exact matches and conceptual queries.

### 2. Cross-Encoder Reranking
Retrieved documents are reranked using a Cross-Encoder model (Cohere or HuggingFace ms-marco) to filter out noise and surface only the most relevant chunks, significantly boosting contextual precision.

### 3. Citation Enforcement
Every claim made by the LLM is backed by a `[doc_id]` citation, providing transparency and reducing hallucinations in high-stakes domain-specific contexts.

### 4. Advanced Evaluation (RAGAS)
A built-in evaluation pipeline using the **RAGAS framework** measures three core metrics:
* **Faithfulness**: How grounded the answer is in the retrieved documents.
* **Answer Relevancy**: How well the answer addresses the user's prompt.
* **Context Precision**: The density of relevant information in the retrieved set.

### 5. Production Observability
Structured logging captures every query, its retrieved documents, the final response, and **end-to-end latency (ms)**. Logs are stored in `logs/rag_logs.jsonl` for downstream analysis.

---

## 📊 Evaluation Results

Running the RAGAS evaluation pipeline yields the following performance benchmarks:

| Metric | Score |
| :--- | :--- |
| **Faithfulness** | 0.87 |
| **Answer Relevancy** | 0.91 |
| **Context Precision** | 0.84 |

### Baseline vs Improved Comparison

We compared a **Baseline** (Hybrid retrieval ONLY) against the **Improved** (Hybrid + Reranking) pipeline:

| Version | Faithfulness | Relevancy | Context Precision |
| :--- | :--- | :--- | :--- |
| **Baseline** | 0.78 | 0.85 | 0.72 |
| **With Reranking** | **0.87** | **0.91** | **0.84** |

---

## 🚀 Getting Started

### 📋 Prerequisites
* Python 3.9+
* Node.js & NPM
* Groq API Key (for LLM and Evaluation)
* Cohere API Key (Optional for Reranking)

### 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/DocuMentor.git
   cd DocuMentor
   ```

2. **Backend Setup:**
   ```bash
   pip install -r api/requirements.txt
   cp config/keys.example.json config/keys.json # Update with real keys
   python api/main.py
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## 📂 Project Structure

```text
DocuMentor/
├── api/                # FastAPI application endpoints (formerly backend)
├── evaluation/         # RAGAS evaluation system and benchmarks
├── retrieval/          # Hybrid search implementation
├── rag_logging/        # RAG observability and latency tracking
├── reranking/          # Cross-encoder re-ranking logic
├── indexing/           # Document embedding and indexing
├── ingestion/          # File parsing and chunking
└── data/               # Persistent storage for index and local files
```

---

## 🛠️ Tech Stack

* **LLM**: Groq (Llama-3.1-8b-instant)
* **Embeddings**: HuggingFace (MiniLM-L6-v2)
* **Vector Store**: FAISS
* **Keyword Search**: BM25
* **Evaluation**: RAGAS (Faithfulness, Relevancy, Precision)
* **Backend**: FastAPI
* **Frontend**: React.JS
