import os
import json
from typing import List, Dict
import pandas as pd
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
)

def run_evaluations(data: List[Dict]):
    """
    data should be a list of dictionaries with keys:
    'question', 'contexts', 'answer', 'ground_truth'
    """
    keys_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'keys.json')
    if os.path.exists(keys_path):
        with open(keys_path, 'r') as f:
            keys = json.load(f)
            openai_key = keys.get("OPENAI_API_KEY", "")
            if not openai_key or openai_key == "YOUR_OPENAI_API_KEY_HERE":
                raise ValueError("OPENAI_API_KEY is missing in config/keys.json")
            os.environ["OPENAI_API_KEY"] = openai_key
    
    dataset = Dataset.from_pandas(pd.DataFrame(data))
    
    result = evaluate(
        dataset,
        metrics=[
            context_precision,
            faithfulness,
            answer_relevancy,
        ],
    )
    
    # Save report
    os.makedirs(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'evaluation', 'reports'), exist_ok=True)
    df = result.to_pandas()
    df.to_csv(os.path.join(os.path.dirname(__file__), 'reports', 'eval_results.csv'), index=False)
    
    return result
