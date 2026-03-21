import os
import json
from typing import List, Dict
import pandas as pd
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (faithfulness, answer_relevancy, context_precision)
def run_evaluations(data: List[Dict]):
    keys_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    if os.path.exists(keys_path):
        with open(keys_path, 'r') as f:
            keys = json.load(f)
            os.environ["OPENAI_API_KEY"] = keys.get("OPENAI_API_KEY", "")
    dataset = Dataset.from_pandas(pd.DataFrame(data))
    result = evaluate(dataset, metrics=[context_precision, faithfulness, answer_relevancy])
    return result
