# chat/utils.py
import json
import os

def load_disease_data():
    path = os.path.join(os.path.dirname(__file__), "data/24-Disease.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
