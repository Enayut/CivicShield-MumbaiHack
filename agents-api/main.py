from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uvicorn
import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CivicShield Agents API",
    description="High-performance API for monitoring agents and data collection",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MAIN_API_URL = os.getenv("MAIN_API_URL", "http://localhost:3000")
AGENT_API_KEY = os.getenv("AGENT_API_KEY", "agent-secret-key")

# Pydantic models for request/response
class ClaimSubmission(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    platform: str = Field(..., pattern="^(twitter|facebook|instagram|whatsapp|telegram|other)$")
    source_url: Optional[str] = None
    author: Optional[str] = None
    author_id: Optional[str] = None
    risk_level: Optional[str] = Field("medium", pattern="^(low|medium|high|critical)$")
    region: Optional[Dict[str, Any]] = None
    engagement: Optional[Dict[str, int]] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = Field("other", pattern="^(election|candidate|voting_process|evm|results|other)$")

class DeepfakeSubmission(BaseModel):
    analysis_id: str
    filename: str
    file_type: str = Field(..., pattern="^(image|video|audio)$")
    analysis_category: str = Field(..., pattern="^(image|video_single|video_comprehensive)$")
    confidence: float = Field(..., ge=0, le=1)
    is_deepfake: bool
    risk_level: str = Field(..., pattern="^(low|medium|high|critical)$")
    detailed_results: Dict[str, Any]
    processing_time: float
    source: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: str
    original_url: Optional[str] = None
    platform: Optional[str] = None
    author: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0, le=100)
    analysis_details: Optional[Dict[str, float]] = None
    flags: Optional[List[str]] = None

class AlertSubmission(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1, max_length=2000)
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    category: str = Field(..., pattern="^(deepfake|bot_network|misinformation|impersonation|hate_speech|other)$")
    location: Optional[Dict[str, Any]] = None
    affected_users: Optional[int] = Field(0, ge=0)
    platform: Optional[str] = None
    related_claims: Optional[List[str]] = None

class AgentStatus(BaseModel):
    agent_id: str
    agent_type: str
    status: str = Field(..., pattern="^(active|idle|error|offline)$")
    last_activity: datetime
    processed_items: int = 0
    error_count: int = 0
    metadata: Optional[Dict[str, Any]] = None

# In-memory storage for agent statuses (use Redis in production)
agent_statuses: Dict[str, AgentStatus] = {}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "CivicShield Agents API",
        "version": "1.0.0",
        "status": "running",
        "agents_count": len(agent_statuses),
        "docs": "/docs"
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "active_agents": len([a for a in agent_statuses.values() if a.status == "active"])
    }

# Agent registration and status
@app.post("/agents/register")
async def register_agent(agent: AgentStatus):
    """Register a new monitoring agent"""
    agent_statuses[agent.agent_id] = agent
    return {
        "message": f"Agent {agent.agent_id} registered successfully",
        "agent_id": agent.agent_id,
        "status": agent.status
    }

@app.get("/agents/status")
async def get_all_agents():
    """Get status of all registered agents"""
    return {
        "agents": list(agent_statuses.values()),
        "total_count": len(agent_statuses),
        "active_count": len([a for a in agent_statuses.values() if a.status == "active"])
    }

@app.get("/agents/status/{agent_id}")
async def get_agent_status(agent_id: str):
    """Get status of a specific agent"""
    if agent_id not in agent_statuses:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent_statuses[agent_id]

@app.put("/agents/status/{agent_id}")
async def update_agent_status(agent_id: str, status: AgentStatus):
    """Update agent status"""
    if agent_id not in agent_statuses:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent_statuses[agent_id] = status
    return {
        "message": f"Agent {agent_id} status updated",
        "status": status.status
    }

# Data submission endpoints
@app.post("/submit/claim")
async def submit_claim(claim: ClaimSubmission, background_tasks: BackgroundTasks):
    """Submit a new claim from monitoring agents"""
    try:
        # Process claim data
        claim_data = {
            "text": claim.text,
            "source": {
                "platform": claim.platform,
                "url": claim.source_url,
                "author": claim.author,
                "authorId": claim.author_id
            },
            "riskLevel": claim.risk_level,
            "region": claim.region or {},
            "engagement": claim.engagement or {},
            "tags": claim.tags or [],
            "category": claim.category
        }
        
        # Add background task to forward to main API
        background_tasks.add_task(forward_to_main_api, "/api/claims", claim_data)
        
        return {
            "message": "Claim submitted successfully",
            "status": "processing",
            "claim_preview": claim.text[:100] + "..." if len(claim.text) > 100 else claim.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing claim: {str(e)}")

@app.post("/submit/deepfake")
async def submit_deepfake(deepfake: DeepfakeSubmission, background_tasks: BackgroundTasks):
    """Submit deepfake detection analysis result"""
    try:
        # Process deepfake analysis data
        deepfake_data = {
            "analysisId": deepfake.analysis_id,
            "filename": deepfake.filename,
            "fileType": deepfake.file_type,
            "analysisCategory": deepfake.analysis_category,
            "confidence": deepfake.confidence,
            "isDeepfake": deepfake.is_deepfake,
            "riskLevel": deepfake.risk_level,
            "detailedResults": deepfake.detailed_results,
            "processingTime": deepfake.processing_time,
            "source": deepfake.source or {},
            "metadata": deepfake.metadata or {},
            "timestamp": deepfake.timestamp,
            "detectedAt": datetime.utcnow().isoformat(),
            "agentId": "deepfake-detector-1"
        }
        
        # Add background task to forward to main API
        background_tasks.add_task(forward_to_main_api, "/api/deepfakes", deepfake_data)
        
        return {
            "message": "Deepfake analysis submitted successfully",
            "status": "processing",
            "analysis_id": deepfake.analysis_id,
            "confidence": deepfake.confidence,
            "is_deepfake": deepfake.is_deepfake,
            "risk_level": deepfake.risk_level
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing deepfake analysis: {str(e)}")
        return {
            "message": "Deepfake analysis submitted successfully",
            "filename": deepfake.filename,
            "confidence": deepfake.confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing deepfake: {str(e)}")

@app.post("/submit/alert")
async def submit_alert(alert: AlertSubmission, background_tasks: BackgroundTasks):
    """Submit a new crisis alert"""
    try:
        alert_data = {
            "title": alert.title,
            "description": alert.description,
            "severity": alert.severity,
            "category": alert.category,
            "location": alert.location or {},
            "affectedUsers": alert.affected_users,
            "platform": alert.platform,
            "relatedClaims": alert.related_claims or []
        }
        
        # Add background task to forward to main API
        background_tasks.add_task(forward_to_main_api, "/api/alerts", alert_data)
        
        return {
            "message": "Alert submitted successfully",
            "severity": alert.severity,
            "title": alert.title
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing alert: {str(e)}")

# Batch submission endpoints for high-volume agents
@app.post("/submit/batch/claims")
async def submit_batch_claims(claims: List[ClaimSubmission], background_tasks: BackgroundTasks):
    """Submit multiple claims in batch"""
    if len(claims) > 100:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 100 claims")
    
    try:
        processed_claims = []
        for claim in claims:
            claim_data = {
                "text": claim.text,
                "source": {
                    "platform": claim.platform,
                    "url": claim.source_url,
                    "author": claim.author,
                    "authorId": claim.author_id
                },
                "riskLevel": claim.risk_level,
                "region": claim.region or {},
                "engagement": claim.engagement or {},
                "tags": claim.tags or [],
                "category": claim.category
            }
            processed_claims.append(claim_data)
        
        # Add background task to forward batch to main API
        background_tasks.add_task(forward_to_main_api, "/api/claims/batch", {"claims": processed_claims})
        
        return {
            "message": f"Batch of {len(claims)} claims submitted successfully",
            "count": len(claims),
            "status": "processing"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing batch: {str(e)}")

# Analytics endpoints for agents
@app.get("/analytics/summary")
async def get_analytics_summary():
    """Get quick analytics summary for agents"""
    return {
        "timestamp": datetime.utcnow(),
        "agents": {
            "total": len(agent_statuses),
            "active": len([a for a in agent_statuses.values() if a.status == "active"]),
            "idle": len([a for a in agent_statuses.values() if a.status == "idle"]),
            "error": len([a for a in agent_statuses.values() if a.status == "error"])
        },
        "processing_stats": {
            "total_processed": sum(a.processed_items for a in agent_statuses.values()),
            "total_errors": sum(a.error_count for a in agent_statuses.values())
        }
    }

# Background task to forward data to main API
async def forward_to_main_api(endpoint: str, data: dict):
    """Forward data to main Node.js API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MAIN_API_URL}{endpoint}",
                json=data,
                headers={"Authorization": f"Bearer {AGENT_API_KEY}"},
                timeout=30.0
            )
            if response.status_code not in [200, 201]:
                print(f"Error forwarding to main API: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error forwarding to main API: {str(e)}")

# WebSocket endpoint for real-time agent communication
@app.websocket("/ws/agent/{agent_id}")
async def websocket_agent(websocket, agent_id: str):
    """WebSocket endpoint for real-time agent communication"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Handle real-time agent updates
            if data.get("type") == "status_update":
                if agent_id in agent_statuses:
                    agent_statuses[agent_id].status = data.get("status", "active")
                    agent_statuses[agent_id].last_activity = datetime.utcnow()
            
            # Echo back confirmation
            await websocket.send_json({
                "type": "confirmation",
                "message": "Status updated",
                "timestamp": datetime.utcnow().isoformat()
            })
    except Exception as e:
        print(f"WebSocket error for agent {agent_id}: {str(e)}")
    finally:
        # Mark agent as offline when disconnected
        if agent_id in agent_statuses:
            agent_statuses[agent_id].status = "offline"

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )