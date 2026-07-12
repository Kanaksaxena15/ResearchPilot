import os
import shutil
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pypdf import PdfReader
from app.database import get_db, Paper, User
from app.auth import get_current_user
from app.services.ibm import ibm_granite
from app.config import Config

router = APIRouter(prefix="/api/papers", tags=["papers"])
logger = logging.getLogger("app.routers.papers")

UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)

class AskRequest(BaseModel):
    question: str

@router.get("")
def get_papers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        papers = db.query(Paper).filter(Paper.user_id == current_user.id).order_by(Paper.created_at.desc()).all()
        
        serialized = []
        for p in papers:
            serialized.append({
                "id": p.id,
                "user_id": p.user_id,
                "filename": p.filename,
                "title": p.title,
                "created_at": p.created_at,
                "text_length": len(p.extracted_text) if p.extracted_text else 0,
                "has_summary": p.summary is not None,
                "has_insights": p.insights is not None
            })
        return {"papers": serialized}
    except Exception as e:
        logger.error(f"Error fetching papers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve research papers")

@router.get("/{paper_id}")
def get_paper(paper_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    if paper.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this research paper")
    
    return {"paper": {
        "id": paper.id,
        "user_id": paper.user_id,
        "filename": paper.filename,
        "filepath": paper.filepath,
        "title": paper.title,
        "extracted_text": paper.extracted_text,
        "summary": paper.summary,
        "insights": paper.insights,
        "created_at": paper.created_at
    }}

@router.post("/upload", status_code=201)
def upload_paper(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported!")
        
    # Generate clean path
    import time
    timestamp = int(time.time() * 1000)
    clean_filename = "".join([c if c.isalnum() or c in (".", "_", "-") else "_" for c in file.filename])
    saved_filename = f"{current_user.id}_{timestamp}_{clean_filename}"
    filepath = os.path.join(UPLOADS_DIR, saved_filename)
    
    # Save file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail="File upload failed")
        
    # Extract text using pypdf
    extracted_text = ""
    try:
        reader = PdfReader(filepath)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text + "\n"
    except Exception as parse_err:
        logger.error(f"Text extraction failed: {str(parse_err)}")
        extracted_text = "Text extraction from this PDF failed. You can still ask questions, and we will formulate general academic responses."

    if not extracted_text.strip():
        extracted_text = "This PDF document appears to contain no indexable text characters."

    # Heuristic for title
    title = os.path.splitext(file.filename)[0]
    lines = [l.strip() for l in extracted_text.split("\n") if l.strip()]
    if lines and 4 < len(lines[0]) < 100:
        first_line = lines[0]
        if "pdf" not in first_line.lower() and "page" not in first_line.lower():
            title = first_line

    try:
        new_paper = Paper(
            user_id=current_user.id,
            filename=saved_filename,
            filepath=filepath,
            title=title,
            extracted_text=extracted_text
        )
        db.add(new_paper)
        db.commit()
        db.refresh(new_paper)
        
        return {
            "message": "Research paper uploaded and parsed successfully!",
            "paper": {
                "id": new_paper.id,
                "title": new_paper.title,
                "filename": new_paper.filename,
                "textLength": len(new_paper.extracted_text)
            }
        }
    except Exception as e:
        logger.error(f"Database insertion failed: {str(e)}")
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail="Failed to process and index the PDF research paper")

@router.post("/{paper_id}/summary")
def get_paper_summary(paper_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not Config.IBM_API_KEY or not Config.IBM_PROJECT_ID:
        raise HTTPException(
            status_code=503,
            detail="IBM watsonx.ai credentials are not configured. Please define IBM_API_KEY and IBM_PROJECT_ID."
        )

    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    if paper.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    if paper.summary:
        return {"summary": paper.summary}
        
    # Generate using IBM Granite
    try:
        summary = ibm_granite.generate_summary(paper.title, paper.extracted_text)
        paper.summary = summary
        db.commit()
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Summary generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate executive summary from IBM Granite: {str(e)}"
        )

@router.post("/{paper_id}/ask")
def ask_paper_question(
    paper_id: int,
    payload: AskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not Config.IBM_API_KEY or not Config.IBM_PROJECT_ID:
        raise HTTPException(
            status_code=503,
            detail="IBM watsonx.ai credentials are not configured. Please define IBM_API_KEY and IBM_PROJECT_ID."
        )

    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
        
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    if paper.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    try:
        answer = ibm_granite.answer_question(paper.extracted_text, payload.question)
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Question answering failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer from IBM Granite: {str(e)}"
        )

@router.post("/{paper_id}/insights")
def get_paper_insights(paper_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not Config.IBM_API_KEY or not Config.IBM_PROJECT_ID:
        raise HTTPException(
            status_code=503,
            detail="IBM watsonx.ai credentials are not configured. Please define IBM_API_KEY and IBM_PROJECT_ID."
        )

    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    if paper.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    if paper.insights:
        return {"insights": paper.insights}
        
    try:
        insights = ibm_granite.generate_insights(paper.title, paper.extracted_text)
        paper.insights = insights
        db.commit()
        return {"insights": insights}
    except Exception as e:
        logger.error(f"Insights generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate analytical insights from IBM Granite: {str(e)}"
        )

@router.delete("/{paper_id}")
def delete_paper(paper_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    if paper.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You cannot delete this paper")
        
    # Delete from disk
    if paper.filepath and os.path.exists(paper.filepath):
        try:
            os.remove(paper.filepath)
        except Exception as e:
            logger.error(f"Failed to delete file from disk: {str(e)}")
            
    try:
        db.delete(paper)
        db.commit()
        return {"message": "Research paper deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete paper from DB: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete research paper")
