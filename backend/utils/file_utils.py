import os
import tempfile
from fastapi import UploadFile

def save_temp_file(file: UploadFile) -> str:
    """
    Saves a requested UploadFile object to a destination.
    Returns path.
    """
    ext = file.filename.split(".")[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp_file:
        temp_file.write(file.file.read())
        return temp_file.name
