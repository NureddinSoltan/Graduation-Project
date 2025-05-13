# Clinexa FastAPI Backend

This is the backend for the Clinexa Medical Chatbot, providing an API endpoint for inference using a transformer model.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Make sure the model files are present in the `../model` directory (relative to this backend folder).
3. Run the backend:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API

- **POST** `/predict`
  - Request JSON: `{ "message": "user query here" }`
  - Response JSON: `{ "result": [...] }`

## Notes
- The backend loads the model at startup for best performance.
- CORS is enabled for local frontend development.
