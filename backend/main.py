from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import uvicorn

# Load the model (adjust model path if needed)
MODEL_PATH = "../model"

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    message: str

# Load pipeline at startup
@app.on_event("startup")
def load_model():
    global nlp
    nlp = pipeline("text-classification", model=MODEL_PATH, tokenizer=MODEL_PATH)

@app.post("/predict")
def predict(req: QueryRequest):
    user_message = req.message
    result = nlp(user_message, top_k=3)  # Get top 3 predictions
    # Optional: round the scores and format
    formatted_result = [
        {
            "label": item["label"],
            "confidence": round(item["score"] * 100, 2)  # convert to percentage
        }
        for item in result
    ]
    return {"result": formatted_result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
