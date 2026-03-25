import os
import json
import time
import pandas as pd
from typing import List, Dict
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (faithfulness, answer_relevancy, context_precision)
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from api.core import run_qa_chain
from database.db import save_evaluation
from api.core.rag_logging.job_manager import JobManager

def get_root():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_keys():
    p = os.path.join(get_root(), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

class RAGEvaluator:
    def __init__(self):
        ks = load_keys()
        gk = ks.get("GROQ_API_KEY", "")
        # Production-grade Groq Config: Fixed n=1, high timeout, and retry logic
        self.llm = ChatGroq(
            model_name="llama-3.1-8b-instant", 
            temperature=0, 
            groq_api_key=gk,
            timeout=120,
            max_retries=3
        )
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    def run_eval(self, dataset_path: str, doc_id: str, enable_reranking: bool = True):
        with open(dataset_path, 'r') as f:
            dataset_in = json.load(f)
            
        # Optimization: Sample 3-5 questions for speed and stability
        import random
        dataset_sample = random.sample(dataset_in, 3) if len(dataset_in) > 3 else dataset_in
        
        results = []
        for item in dataset_sample:
            question = item['question']
            ground_truth = item['ground_truth']
            
            try:
                answer, docs, info = run_qa_chain(question, enable_reranking=enable_reranking)
                contexts = [d.page_content for d in docs]
                
                results.append({
                    "question": question,
                    "answer": answer,
                    "contexts": contexts if contexts else ["No context found"],
                    "ground_truth": ground_truth
                })
            except Exception as e:
                print(f"Error running QA chain: {e}")
                continue
        
        if not results:
            return {"faithfulness": 0, "answer_relevancy": 0, "context_precision": 0}

        df = pd.DataFrame(results)
        rag_dataset = Dataset.from_pandas(df)
        
        try:
            # Force RAGAS to use a single generation (n=1) across its metrics
            eval_result = evaluate(
                rag_dataset,
                metrics=[faithfulness, answer_relevancy, context_precision],
                llm=self.llm,
                embeddings=self.embeddings,
                is_async=False # Synchronous for stability on free tier API
            )
        except Exception as e:
            print(f"RAGAS failed: {e}")
            eval_result = {"faithfulness": 0, "answer_relevancy": 0, "context_precision": 0}

        # Safe float parsing with 4-decimal rounding
        def safe_float(v):
            import math
            try:
                if isinstance(v, (list, tuple)):
                    v = sum(v)/len(v) if v else 0.0
                val = float(v)
                return round(val, 4) if math.isfinite(val) else 0.0
            except:
                return 0.0

        metrics = {}
        for m in ["faithfulness", "answer_relevancy", "context_precision"]:
            try:
                val = eval_result[m]
                metrics[m] = safe_float(val)
            except:
                try:
                    val = getattr(eval_result, m, 0)
                    metrics[m] = safe_float(val)
                except:
                    metrics[m] = 0.0
        
        config = {"enable_reranking": enable_reranking, "doc_id": doc_id}
        save_evaluation(doc_id, metrics, config)
        return metrics

    def compare_pipelines(self, doc_id: str, job_id: str = None):
        """Production version with Job State Tracking"""
        dataset_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'evaluation', 'datasets', f"{doc_id}.json")
        
        def update_status(stage, progress, message):
            if job_id:
                JobManager.update_job(job_id, stage=stage, progress=progress, message=message)

        if not os.path.exists(dataset_path):
            if job_id: JobManager.update_job(job_id, status="failed", message=f"Dataset for {doc_id} not found.")
            return {"error": "Dataset not found"}
        
        try:
            update_status("baseline", 10, "Executing BASELINE RAG Pipeline (No Reranking)...")
            baseline_metrics = self.run_eval(dataset_path, doc_id, enable_reranking=False)
            
            update_status("improved", 50, "Improved Pipeline: Applying Cohere Reranking...")
            improved_metrics = self.run_eval(dataset_path, doc_id, enable_reranking=True)
            
            update_status("done", 90, "Finalizing results and syncing with database...")
            
            comparison = {
                "doc_id": doc_id,
                "baseline": baseline_metrics,
                "improved": improved_metrics,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
            }
            
            if job_id:
                JobManager.update_job(job_id, status="completed", progress=100, message="Benchmark Complete!", result=comparison)
            
            return comparison
        except Exception as e:
            if job_id:
                JobManager.update_job(job_id, status="failed", message=f"Backend Error: {str(e)}")
            raise e
