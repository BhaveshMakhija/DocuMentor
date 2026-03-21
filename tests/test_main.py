from fastapi.testclient import TestClient
import sys
import os

# Append project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.main import app

client = TestClient(app)

def test_health_check():
    """
    Test the health check endpoint.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "DocuMentor API"}

def test_config_loading():
    """
    Test that the base config path exists.
    """
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'config.json')
    assert os.path.exists(config_path)
