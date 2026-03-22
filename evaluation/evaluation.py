import os
import json
import time
from typing import List, Dict
import pandas as pd
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (faithfulness, answer_relevancy, context_precision)
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings

# File to store evaluation results
RESULTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'eval_results.json')

def run_evaluations(data: List[Dict], version_name: str = "Improved"):
    """
    Run RAGAS evaluation on a given dataset and store results as JSON.
    
    Args:
        data: A list of dicts with keys 'question', 'contexts', 'answer', and 'ground_truth'.
        version_name: Name of the configuration being evaluated (e.g., 'Baseline' or 'Improved').
    
    Returns:
        Structured evaluation results dictionary.
    """
    keys_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    gk = ""
    if os.path.exists(keys_path):
        with open(keys_path, 'r') as f:
            keys = json.load(f)
            gk = keys.get("GROQ_API_KEY", "")
    
    # Initialize Groq LLM with temperature=0 for deterministic evaluation
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0, groq_api_key=gk)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Evaluation requires context precision, faithfulness, and answer relevancy
    dataset = Dataset.from_pandas(pd.DataFrame(data))
    
    # Run evaluation
    result_raw = evaluate(
        dataset, 
        metrics=[context_precision, faithfulness, answer_relevancy],
        llm=llm,
        embeddings=embeddings
    )
    
    # Convert result to structured dictionary and compute mean scores
    result_dict = {
        "version": version_name,
        "metrics": {
            "faithfulness": round(result_raw.get("faithfulness", 0), 2),
            "answer_relevancy": round(result_raw.get("answer_relevancy", 0), 2),
            "context_precision": round(result_raw.get("context_precision", 0), 2)
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
    }
    
    # Print clean output
    print(f"\nEvaluation Results for {version_name}:")
    print(f"Faithfulness: {result_dict['metrics']['faithfulness']}")
    print(f"Answer Relevancy: {result_dict['metrics']['answer_relevancy']}")
    print(f"Context Precision: {result_dict['metrics']['context_precision']}")
    
    return result_dict

def compare_versions(baseline_data: List[Dict], improved_data: List[Dict]):
    """
    Evaluate and compare two RAG versions.
    """
    baseline_res = run_evaluations(baseline_data, "Baseline")
    improved_res = run_evaluations(improved_data, "With Reranking")
    
    comparison = {
        "baseline": baseline_res,
        "improved": improved_res
    }
    
    # Save to eval_results.json
    with open(RESULTS_FILE, 'w') as f:
        json.dump(comparison, f, indent=4)
        
    # Output comparison table
    print("\n| Version              | Faithfulness | Relevancy | Context Precision |")
    print("|---------------------|-------------|----------|------------------|")
    print(f"| Baseline            | {baseline_res['metrics']['faithfulness']:<11} | {baseline_res['metrics']['answer_relevancy']:<8} | {baseline_res['metrics']['context_precision']:<16} |")
    print(f"| With Reranking      | {improved_res['metrics']['faithfulness']:<11} | {improved_res['metrics']['answer_relevancy']:<8} | {improved_res['metrics']['context_precision']:<16} |")
    
    return comparison
