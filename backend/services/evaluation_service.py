import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from evaluation.evaluation import run_evaluations as run_ragas

def run_evaluations(test_data: list):
    return run_ragas(test_data)
