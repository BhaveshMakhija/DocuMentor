import os
import json
import uuid
import time
from typing import List
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

class EvalQuestion(BaseModel):
    factual_question: str = Field(description="A direct question that can be answered using facts from the chunk.")
    factual_answer: str = Field(description="The ground truth answer for the factual question, strictly from the chunk.")
    reasoning_question: str = Field(description="A question that requires some reasoning or connection based on the chunk.")
    reasoning_answer: str = Field(description="The ground truth answer for the reasoning question, strictly from the chunk.")

def load_keys():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

GENERATION_PROMPT = """You are an expert evaluator. Given the document chunk below, generate two questions and their ground truth answers.
1. A factual question: Direct, fact-based.
2. A reasoning question: Requires understanding context or multiple sentences.

The answers must be derived STRICTLY from the provided chunk.
Chunk: {chunk}

Output MUST be a valid JSON matching this structure:
{{
  "factual_question": "...",
  "factual_answer": "...",
  "reasoning_question": "...",
  "reasoning_answer": "..."
}}
"""

def generate_dataset(chunks: List, doc_id: str):
    ks = load_keys()
    gk = ks.get("GROQ_API_KEY", "")
    if not gk: raise ValueError("Groq API Key Missing")
    
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0, groq_api_key=gk)
    prompt = PromptTemplate.from_template(GENERATION_PROMPT)
    parser = JsonOutputParser(pydantic_object=EvalQuestion)
    chain = prompt | llm | parser
    
    dataset = []
    # Optimization: Sample max 10 chunks to keep generation time within 30-60s
    sampled_chunks = chunks[:10] if len(chunks) > 10 else chunks
    
    for chunk in sampled_chunks:
        content = chunk.page_content
        try:
            res = chain.invoke({"chunk": content})
            
            dataset.append({
                "question": res["factual_question"],
                "ground_truth": res["factual_answer"],
                "context": content,
                "type": "factual",
                "doc_id": doc_id
            })
            dataset.append({
                "question": res["reasoning_question"],
                "ground_truth": res["reasoning_answer"],
                "context": content,
                "type": "reasoning",
                "doc_id": doc_id
            })
        except Exception as e:
            print(f"Error generating question for chunk: {e}")
            continue
            
    # Save dataset
    dataset_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'evaluation', 'datasets')
    os.makedirs(dataset_dir, exist_ok=True)
    dataset_path = os.path.join(dataset_dir, f"{doc_id}.json")
    
    with open(dataset_path, 'w') as f:
        json.dump(dataset, f, indent=2)
        
    return dataset_path
