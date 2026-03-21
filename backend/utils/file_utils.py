from fastapi import UploadFile
import tempfile
import os
def save_temp_file(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp_file:
        temp_file.write(file.file.read())
        return temp_file.name
