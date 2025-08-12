from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from app.db.database import get_db
from app.models.chat import ChatSession, ChatMessage
from app.dependencies import get_current_admin

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: int
    session_id: str
    customer_email: Optional[str]
    customer_name: Optional[str]
    created_at: datetime
    last_activity_at: datetime
    messages: List[ChatMessageOut]
    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None

class ChatMessageCreate(BaseModel):
    content: str
    role: str = "user"  # user | admin

@router.post("/sessions", response_model=ChatSessionOut)
def create_session(data: ChatSessionCreate, db: Session = Depends(get_db)):
    sess = ChatSession(session_id=str(uuid4()), customer_email=data.customer_email, customer_name=data.customer_name)
    db.add(sess)
    db.commit()
    db.refresh(sess)
    return ChatSessionOut.model_validate({**sess.__dict__, 'messages': []})

@router.get("/sessions", response_model=List[ChatSessionOut])
def list_sessions(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    sessions = db.query(ChatSession).order_by(ChatSession.last_activity_at.desc()).limit(100).all()
    out = []
    for s in sessions:
        msgs = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).order_by(ChatMessage.id.asc()).all()
        out.append(ChatSessionOut(
            id=s.id,
            session_id=s.session_id,
            customer_email=s.customer_email,
            customer_name=s.customer_name,
            created_at=s.created_at,
            last_activity_at=s.last_activity_at,
            messages=[ChatMessageOut.model_validate(m) for m in msgs]
        ))
    return out

@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_session(session_id: str, db: Session = Depends(get_db)):
    sess = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Not found")
    msgs = db.query(ChatMessage).filter(ChatMessage.session_id == sess.id).order_by(ChatMessage.id.asc()).all()
    return ChatSessionOut(
        id=sess.id,
        session_id=sess.session_id,
        customer_email=sess.customer_email,
        customer_name=sess.customer_name,
        created_at=sess.created_at,
        last_activity_at=sess.last_activity_at,
        messages=[ChatMessageOut.model_validate(m) for m in msgs]
    )

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageOut)
def post_message(session_id: str, data: ChatMessageCreate, db: Session = Depends(get_db)):
    sess = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    msg = ChatMessage(session_id=sess.id, role=data.role, content=data.content)
    sess.last_activity_at = datetime.utcnow()
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
