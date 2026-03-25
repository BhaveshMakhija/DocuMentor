import time
import json
import os
from database.db import save_metrics

# Model costs (example: Groq llama-3.1-8b-instant)
# $0.05 per 1M input tokens, $0.08 per 1M output tokens
INPUT_COST_PER_1K = 0.05 / 1000
OUTPUT_COST_PER_1K = 0.08 / 1000

class MetricsTracker:
    def __init__(self):
        self.start_time = None
        self.end_time = None
        self.input_tokens = 0
        self.output_tokens = 0
        self.latency = 0
        self.cost = 0

    def start_request(self):
        self.start_time = time.time()

    def end_request(self, input_tokens, output_tokens):
        self.end_time = time.time()
        self.latency = (self.end_time - self.start_time) # seconds
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.cost = (self.input_tokens * INPUT_COST_PER_1K) + (self.output_tokens * OUTPUT_COST_PER_1K)
        
        # Save to SQLite
        save_metrics(self.latency, self.input_tokens + self.output_tokens, self.cost)
        
        return {
            "latency": self.latency,
            "tokens": self.input_tokens + self.output_tokens,
            "cost": self.cost
        }
