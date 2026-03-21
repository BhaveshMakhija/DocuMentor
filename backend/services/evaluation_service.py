import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from evaluation.evaluation import run_evaluations as run_ragas

def run_evaluations(test_data: list):
    return run_ragas(test_data)
