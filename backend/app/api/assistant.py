"""
Assistant API Router
Endpoints for the bottom-left SaFact Assistant chat widget.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import time
from services.assistant_service import assistant_service

router = APIRouter(prefix="/api/assistant", tags=["Assistant"])

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: Optional[List[Dict[str, str]]] = Field(default=[])

class ChatResponse(BaseModel):
    reply: str
    source: str
    grounded: bool
    timestamp: float

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest):
    """
    Submits a user query to the SaFact Assistant. Answers are grounded in the
    latest camera scan and zone density telemetry, utilizing local Ollama when online.
    """
    try:
        res = assistant_service.generate_response(req.message, req.history)
        return {
            "reply": res["reply"],
            "source": res["source"],
            "grounded": res["grounded"],
            "timestamp": time.time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant error: {str(e)}")
