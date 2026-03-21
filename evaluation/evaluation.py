import os
import json
from typing import List, Dict
import pandas as pd
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (faithfulness, answer_relevancy, context_precision)
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings

def run_evaluations(data: List[Dict]):
    keys_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    gk = ""
    if os.path.exists(keys_path):
        with open(keys_path, 'r') as f:
            keys = json.load(f)
            gk = keys.get("GROQ_API_KEY", "")
    
    # Initialize Groq LLM and HF Embeddings for RAGAS
    llm = ChatGroq(model_name="llama-3.1-8b-instant", groq_api_key=gk)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    dataset = Dataset.from_pandas(pd.DataFrame(data))
    result = evaluate(
        dataset, 
        metrics=[context_precision, faithfulness, answer_relevancy],
        llm=llm,
        embeddings=embeddings
    )
    return result
