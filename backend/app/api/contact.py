"""
Contact API Router
Handles contact inquiries and customer support requests with regex email validation.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
import time
import uuid

router = APIRouter(prefix="/api/contact", tags=["Contact"])

class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    message: str = Field(..., min_length=5, max_length=2000)

@router.post("")
@router.post("/")
def submit_contact(req: ContactRequest):
    ticket_id = f"CARE-{uuid.uuid4().hex[:6].upper()}"
    return {
        "status": "success",
        "ticket_id": ticket_id,
        "message": f"Thank you, {req.name}. Your inquiry has been received (Ticket #{ticket_id}). The SaFact Customer Care team will respond to {req.email}.",
        "received_at": time.time()
    }
