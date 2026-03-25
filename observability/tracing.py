import os
import json
from langfuse import Langfuse
from langfuse.callback import CallbackHandler

def load_keys():
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'keys.json')
    if os.path.exists(p):
        with open(p, 'r') as f: return json.load(f)
    return {}

def get_langfuse():
    ks = load_keys()
    
    sk = ks.get("LANGFUSE_SECRET_KEY")
    pk = ks.get("LANGFUSE_PUBLIC_KEY")
    hu = ks.get("LANGFUSE_HOST", "https://cloud.langfuse.com")
    
    if pk and sk:
        return Langfuse(
            public_key=pk,
            secret_key=sk,
            host=hu
        )
    return None

def get_langfuse_callback():
    ks = load_keys()
    sk = ks.get("LANGFUSE_SECRET_KEY")
    pk = ks.get("LANGFUSE_PUBLIC_KEY")
    hu = ks.get("LANGFUSE_HOST", "https://cloud.langfuse.com")
    
    if pk and sk:
        return CallbackHandler(
            public_key=pk,
            secret_key=sk,
            host=hu
        )
    return None

def log_trace(name, input_data, output_data, metadata=None, spans=None):
    lf = get_langfuse()
    if not lf: return
    
    trace = lf.trace(name=name, input=input_data, output=output_data, metadata=metadata)
    
    if spans:
        for span_data in spans:
            trace.span(
                name=span_data.get('name'),
                input=span_data.get('input'),
                output=span_data.get('output'),
                start_time=span_data.get('start_time'),
                end_time=span_data.get('end_time'),
                metadata=span_data.get('metadata')
            )
