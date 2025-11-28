from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import uvicorn
import httpx
from datetime import datetime
import json
import os
import aiofiles
import tempfile
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CivicShield Deepfake Detection Agent",
    description="Deepfake detection and analysis agent with comprehensive video/audio analysis",
    version="1.0.0"
)

# Configuration
AGENTS_API_URL = os.getenv("AGENTS_API_URL", "http://localhost:8000")
DEEPFAKE_SERVICE_URL = os.getenv("DEEPFAKE_SERVICE_URL", "http://localhost:5000")
AGENT_ID = "deepfake-detector-1"
MAIN_API_URL = os.getenv("MAIN_API_URL", "http://localhost:3000")

# Supported file types and limits
SUPPORTED_VIDEO_FORMATS = {".mp4", ".avi", ".mov", ".wmv", ".mkv", ".webm"}
SUPPORTED_IMAGE_FORMATS = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_VIDEO_DURATION = 300  # 5 minutes

class DeepfakeAnalysisRequest(BaseModel):
    analysis_type: str = Field(..., pattern=r"^(comprehensive|face_distortion|frame_anomaly|audio_analysis|sentiment|image_classification)$")
    priority: str = Field(default="medium", pattern=r"^(low|medium|high|critical)$")
    source_platform: Optional[str] = Field(None, description="Platform where content was found")
    source_url: Optional[str] = Field(None, description="Original URL of the content")
    author_handle: Optional[str] = Field(None, description="Author/uploader handle")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional metadata")

class DeepfakeAnalysisResult(BaseModel):
    analysis_id: str
    analysis_type: str
    overall_confidence: float = Field(..., ge=0, le=1)
    is_deepfake: bool
    risk_level: str
    detailed_results: Dict[str, Any]
    processing_time: float
    file_info: Dict[str, Any]
    timestamp: str
    recommendations: List[str]

class ComprehensiveAnalysisResult(BaseModel):
    analysis_id: str
    overall_confidence: float
    is_deepfake: bool
    risk_level: str
    individual_analyses: Dict[str, Any]
    consensus_score: float
    processing_time: float
    file_info: Dict[str, Any]
    flags_detected: List[str]
    recommendations: List[str]
    timestamp: str

@app.get("/")
async def root():
    return {
        "message": "CivicShield Deepfake Detection Agent",
        "version": "1.0.0",
        "status": "active",
        "deepfake_service_available": await check_deepfake_service(),
        "supported_formats": {
            "video": list(SUPPORTED_VIDEO_FORMATS),
            "image": list(SUPPORTED_IMAGE_FORMATS)
        },
        "max_file_size_mb": MAX_FILE_SIZE // (1024 * 1024),
        "max_video_duration_seconds": MAX_VIDEO_DURATION
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    deepfake_service_status = await check_deepfake_service()
    
    return {
        "status": "healthy" if deepfake_service_status else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "deepfake_service": "available" if deepfake_service_status else "unavailable",
        "agent_id": AGENT_ID
    }

@app.post("/analyze/image", response_model=DeepfakeAnalysisResult)
async def analyze_image(
    file: UploadFile = File(...),
    analysis_request: str = Form(...),  # JSON string of DeepfakeAnalysisRequest
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Analyze image for deepfake detection"""
    try:
        # Parse analysis request
        request_data = json.loads(analysis_request)
        request_obj = DeepfakeAnalysisRequest(**request_data)
        
        # Validate file
        await validate_image_file(file)
        
        # Generate analysis ID
        analysis_id = f"img_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename[:10]}"
        
        start_time = datetime.utcnow()
        
        # Save file temporarily
        temp_path = await save_temp_file(file)
        
        try:
            # Send to deepfake service
            result = await call_deepfake_service("/predict", temp_path, "image")
            
            # Process results
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Determine overall assessment
            confidence = result.get("confidence", 0.0)
            is_deepfake = confidence > 0.6  # Threshold for deepfake classification
            risk_level = determine_risk_level(confidence, is_deepfake)
            
            # Generate recommendations
            recommendations = generate_recommendations(result, is_deepfake, "image")
            
            analysis_result = DeepfakeAnalysisResult(
                analysis_id=analysis_id,
                analysis_type="image_classification",
                overall_confidence=confidence,
                is_deepfake=is_deepfake,
                risk_level=risk_level,
                detailed_results=result,
                processing_time=processing_time,
                file_info={
                    "filename": file.filename,
                    "size": file.size,
                    "content_type": file.content_type
                },
                timestamp=datetime.utcnow().isoformat(),
                recommendations=recommendations
            )
            
            # Submit to main API in background
            background_tasks.add_task(
                submit_to_main_api,
                analysis_result.dict(),
                request_obj,
                "image"
            )
            
            return analysis_result
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@app.post("/analyze/video", response_model=DeepfakeAnalysisResult)
async def analyze_video_single(
    file: UploadFile = File(...),
    analysis_request: str = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Analyze video with single analysis type"""
    try:
        # Parse analysis request
        request_data = json.loads(analysis_request)
        request_obj = DeepfakeAnalysisRequest(**request_data)
        
        # Validate file
        await validate_video_file(file)
        
        # Generate analysis ID
        analysis_id = f"vid_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename[:10]}"
        
        start_time = datetime.utcnow()
        
        # Save file temporarily
        temp_path = await save_temp_file(file)
        
        try:
            # Route to appropriate analysis endpoint
            endpoint_map = {
                "face_distortion": "/analyze_distortions",
                "frame_anomaly": "/analyze_frame", 
                "audio_analysis": "/analyze_audio",
                "sentiment": "/analyze_sentiment"
            }
            
            endpoint = endpoint_map.get(request_obj.analysis_type)
            if not endpoint:
                raise HTTPException(status_code=400, detail=f"Unsupported analysis type: {request_obj.analysis_type}")
            
            # Send to deepfake service
            result = await call_deepfake_service(endpoint, temp_path, "video")
            
            # Process results
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Extract confidence and determine status
            confidence = extract_confidence_from_result(result, request_obj.analysis_type)
            is_deepfake = confidence > 0.6
            risk_level = determine_risk_level(confidence, is_deepfake)
            
            # Generate recommendations
            recommendations = generate_recommendations(result, is_deepfake, request_obj.analysis_type)
            
            analysis_result = DeepfakeAnalysisResult(
                analysis_id=analysis_id,
                analysis_type=request_obj.analysis_type,
                overall_confidence=confidence,
                is_deepfake=is_deepfake,
                risk_level=risk_level,
                detailed_results=result,
                processing_time=processing_time,
                file_info={
                    "filename": file.filename,
                    "size": file.size,
                    "content_type": file.content_type
                },
                timestamp=datetime.utcnow().isoformat(),
                recommendations=recommendations
            )
            
            # Submit to main API in background
            background_tasks.add_task(
                submit_to_main_api,
                analysis_result.dict(),
                request_obj,
                "video_single"
            )
            
            return analysis_result
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

@app.post("/analyze/comprehensive", response_model=ComprehensiveAnalysisResult)
async def analyze_video_comprehensive(
    file: UploadFile = File(...),
    analysis_request: str = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Comprehensive video analysis using all available methods"""
    try:
        # Parse analysis request
        request_data = json.loads(analysis_request)
        request_obj = DeepfakeAnalysisRequest(**request_data)
        
        # Validate file
        await validate_video_file(file)
        
        # Generate analysis ID
        analysis_id = f"comp_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename[:10]}"
        
        start_time = datetime.utcnow()
        
        # Save file temporarily
        temp_path = await save_temp_file(file)
        
        try:
            # Run all analysis types
            analysis_endpoints = [
                ("/analyze_distortions", "face_distortion"),
                ("/analyze_frame", "frame_anomaly"),
                ("/analyze_audio", "audio_analysis"),
                ("/analyze_sentiment", "sentiment"),
                ("/process_video", "comprehensive")
            ]
            
            individual_results = {}
            confidence_scores = []
            flags_detected = []
            
            for endpoint, analysis_type in analysis_endpoints:
                try:
                    result = await call_deepfake_service(endpoint, temp_path, "video")
                    individual_results[analysis_type] = result
                    
                    # Extract confidence
                    confidence = extract_confidence_from_result(result, analysis_type)
                    confidence_scores.append(confidence)
                    
                    # Check for flags
                    if confidence > 0.6:
                        flags_detected.append(f"{analysis_type}_suspicious")
                    
                except Exception as e:
                    individual_results[analysis_type] = {"error": str(e)}
                    print(f"Warning: {analysis_type} analysis failed: {e}")
            
            # Calculate overall metrics
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Consensus scoring
            valid_scores = [s for s in confidence_scores if s > 0]
            if valid_scores:
                overall_confidence = sum(valid_scores) / len(valid_scores)
                consensus_score = calculate_consensus_score(confidence_scores)
            else:
                overall_confidence = 0.0
                consensus_score = 0.0
            
            is_deepfake = overall_confidence > 0.6 and len(flags_detected) >= 2
            risk_level = determine_risk_level(overall_confidence, is_deepfake)
            
            # Enhanced risk assessment for comprehensive analysis
            if len(flags_detected) >= 3:
                risk_level = "critical"
            elif len(flags_detected) >= 2 and overall_confidence > 0.7:
                risk_level = "high"
            
            # Generate comprehensive recommendations
            recommendations = generate_comprehensive_recommendations(
                individual_results, 
                is_deepfake, 
                flags_detected,
                overall_confidence
            )
            
            comprehensive_result = ComprehensiveAnalysisResult(
                analysis_id=analysis_id,
                overall_confidence=overall_confidence,
                is_deepfake=is_deepfake,
                risk_level=risk_level,
                individual_analyses=individual_results,
                consensus_score=consensus_score,
                processing_time=processing_time,
                file_info={
                    "filename": file.filename,
                    "size": file.size,
                    "content_type": file.content_type
                },
                flags_detected=flags_detected,
                recommendations=recommendations,
                timestamp=datetime.utcnow().isoformat()
            )
            
            # Submit to main API in background
            background_tasks.add_task(
                submit_to_main_api,
                comprehensive_result.dict(),
                request_obj,
                "video_comprehensive"
            )
            
            return comprehensive_result
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive analysis failed: {str(e)}")

@app.get("/status")
async def get_status():
    """Get current agent status and statistics"""
    deepfake_service_status = await check_deepfake_service()
    
    return {
        "agent_id": AGENT_ID,
        "status": "active" if deepfake_service_status else "degraded",
        "deepfake_service": {
            "available": deepfake_service_status,
            "url": DEEPFAKE_SERVICE_URL,
            "endpoints": [
                "/predict (image classification)",
                "/analyze_distortions (face analysis)",
                "/analyze_frame (frame anomalies)",
                "/analyze_audio (audio analysis)",
                "/analyze_sentiment (sentiment analysis)",
                "/process_video (comprehensive)"
            ]
        },
        "capabilities": [
            "image_deepfake_detection",
            "video_face_distortion_analysis",
            "video_frame_anomaly_detection",
            "audio_analysis",
            "sentiment_analysis",
            "comprehensive_video_analysis"
        ],
        "limits": {
            "max_file_size_mb": MAX_FILE_SIZE // (1024 * 1024),
            "max_video_duration_seconds": MAX_VIDEO_DURATION,
            "supported_video_formats": list(SUPPORTED_VIDEO_FORMATS),
            "supported_image_formats": list(SUPPORTED_IMAGE_FORMATS)
        }
    }

# Helper Functions
async def check_deepfake_service() -> bool:
    """Check if deepfake service is available"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{DEEPFAKE_SERVICE_URL}/", timeout=5.0)
            return response.status_code == 200
    except:
        return False

async def validate_image_file(file: UploadFile):
    """Validate uploaded image file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check file extension
    file_ext = os.path.splitext(file.filename.lower())[1]
    if file_ext not in SUPPORTED_IMAGE_FORMATS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported image format. Supported: {SUPPORTED_IMAGE_FORMATS}"
        )
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

async def validate_video_file(file: UploadFile):
    """Validate uploaded video file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check file extension
    file_ext = os.path.splitext(file.filename.lower())[1]
    if file_ext not in SUPPORTED_VIDEO_FORMATS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported video format. Supported: {SUPPORTED_VIDEO_FORMATS}"
        )
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

async def save_temp_file(file: UploadFile) -> str:
    """Save uploaded file to temporary location"""
    # Create temp file
    temp_fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1])
    
    try:
        with os.fdopen(temp_fd, 'wb') as temp_file:
            content = await file.read()
            temp_file.write(content)
    except:
        os.close(temp_fd)
        raise
    
    # Reset file position for potential re-use
    await file.seek(0)
    
    return temp_path

async def call_deepfake_service(endpoint: str, file_path: str, file_type: str) -> dict:
    """Call the deepfake detection service"""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            with open(file_path, 'rb') as f:
                files = {file_type: (os.path.basename(file_path), f, 'application/octet-stream')}
                
                response = await client.post(
                    f"{DEEPFAKE_SERVICE_URL}{endpoint}",
                    files=files
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    raise HTTPException(
                        status_code=502, 
                        detail=f"Deepfake service error: {response.status_code} - {response.text}"
                    )
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Deepfake service timeout")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Service communication error: {str(e)}")

def extract_confidence_from_result(result: dict, analysis_type: str) -> float:
    """Extract confidence score from analysis result"""
    if analysis_type == "face_distortion":
        return result.get("overall_confidence", result.get("confidence", 0.5))
    elif analysis_type == "frame_anomaly":
        return result.get("anomaly_score", result.get("confidence", 0.5))
    elif analysis_type == "audio_analysis":
        return result.get("deepfake_probability", result.get("confidence", 0.5))
    elif analysis_type == "sentiment":
        # Convert sentiment to confidence (more negative = higher chance of manipulation)
        sentiment_score = result.get("overall_sentiment", 0)
        return abs(sentiment_score) if sentiment_score < -0.3 else 0.3
    elif analysis_type == "comprehensive":
        return result.get("deepfake_probability", result.get("confidence", 0.5))
    else:
        return result.get("confidence", 0.5)

def determine_risk_level(confidence: float, is_deepfake: bool) -> str:
    """Determine risk level based on confidence score"""
    if is_deepfake:
        if confidence > 0.9:
            return "critical"
        elif confidence > 0.75:
            return "high"
        else:
            return "medium"
    else:
        return "low"

def generate_recommendations(result: dict, is_deepfake: bool, analysis_type: str) -> List[str]:
    """Generate recommendations based on analysis results"""
    recommendations = []
    
    if is_deepfake:
        recommendations.extend([
            "Content flagged as potential deepfake",
            "Recommend manual review by human expert",
            "Consider cross-referencing with original sources"
        ])
        
        if analysis_type == "face_distortion":
            recommendations.append("Facial distortions detected - check for unnatural expressions")
        elif analysis_type == "frame_anomaly":
            recommendations.append("Frame inconsistencies detected - check for temporal artifacts")
        elif analysis_type == "audio_analysis":
            recommendations.append("Audio manipulation detected - verify against known voice samples")
    else:
        recommendations.extend([
            "Content appears authentic",
            "No significant manipulation detected"
        ])
    
    return recommendations

def generate_comprehensive_recommendations(
    results: dict, 
    is_deepfake: bool, 
    flags: List[str], 
    confidence: float
) -> List[str]:
    """Generate comprehensive recommendations"""
    recommendations = []
    
    if is_deepfake:
        recommendations.extend([
            f"High-confidence deepfake detection ({confidence:.2f})",
            f"Multiple analysis methods flagged content ({len(flags)} flags)",
            "URGENT: Recommend immediate content removal consideration",
            "Escalate to human expert review",
            "Document evidence for potential legal action"
        ])
    elif len(flags) > 0:
        recommendations.extend([
            "Suspicious patterns detected but not conclusive",
            "Recommend additional verification",
            "Monitor for similar content patterns"
        ])
    else:
        recommendations.extend([
            "Content appears authentic across all analysis methods",
            "No manipulation indicators detected"
        ])
    
    return recommendations

def calculate_consensus_score(scores: List[float]) -> float:
    """Calculate consensus score from multiple analysis results"""
    if not scores:
        return 0.0
    
    # Remove outliers and calculate weighted average
    valid_scores = [s for s in scores if s > 0]
    if not valid_scores:
        return 0.0
    
    # Simple consensus: average with higher weight for extreme values
    mean_score = sum(valid_scores) / len(valid_scores)
    high_confidence_count = sum(1 for s in valid_scores if s > 0.7)
    
    # Boost consensus if multiple methods agree on high confidence
    consensus_boost = high_confidence_count / len(valid_scores)
    
    return min(mean_score + (consensus_boost * 0.2), 1.0)

async def submit_to_main_api(analysis_data: dict, request_obj: DeepfakeAnalysisRequest, analysis_category: str):
    """Submit analysis results to main API"""
    try:
        # Format data for main API
        submission_data = {
            "analysis_id": analysis_data["analysis_id"],
            "filename": analysis_data["file_info"]["filename"],
            "file_type": "video" if analysis_category.startswith("video") else "image",
            "analysis_category": analysis_category,
            "confidence": analysis_data["overall_confidence"],
            "is_deepfake": analysis_data["is_deepfake"],
            "risk_level": analysis_data["risk_level"],
            "detailed_results": analysis_data["detailed_results"],
            "processing_time": analysis_data["processing_time"],
            "source": {
                "platform": request_obj.source_platform,
                "url": request_obj.source_url,
                "author": request_obj.author_handle
            },
            "metadata": request_obj.metadata,
            "timestamp": analysis_data["timestamp"]
        }
        
        # Submit to agents API first
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AGENTS_API_URL}/submit/deepfake",
                json=submission_data,
                timeout=15.0
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Submitted deepfake analysis {analysis_data['analysis_id']} to main API")
            else:
                print(f"❌ Failed to submit to main API: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error submitting to main API: {e}")

# Register agent on startup
@app.on_event("startup")
async def startup_event():
    """Register agent and verify deepfake service connection"""
    try:
        # Check deepfake service
        service_available = await check_deepfake_service()
        
        agent_data = {
            "agent_id": AGENT_ID,
            "agent_type": "deepfake_detector",
            "status": "active" if service_available else "degraded",
            "last_activity": datetime.utcnow().isoformat(),
            "processed_items": 0,
            "error_count": 0,
            "metadata": {
                "capabilities": [
                    "image_deepfake_detection",
                    "video_analysis", 
                    "comprehensive_analysis",
                    "audio_analysis",
                    "sentiment_analysis"
                ],
                "deepfake_service_url": DEEPFAKE_SERVICE_URL,
                "deepfake_service_available": service_available,
                "supported_formats": {
                    "video": list(SUPPORTED_VIDEO_FORMATS),
                    "image": list(SUPPORTED_IMAGE_FORMATS)
                },
                "version": "1.0.0"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AGENTS_API_URL}/agents/register",
                json=agent_data,
                timeout=10.0
            )
            print(f"✅ Deepfake Detection Agent registered: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed to register agent: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "deepfake_detector:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_level="info"
    )