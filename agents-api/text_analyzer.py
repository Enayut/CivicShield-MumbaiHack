from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import spacy
import re
import uvicorn
from datetime import datetime
import httpx
import asyncio
import os
import json
from urllib.parse import urlencode
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CivicShield Text Analysis Agent",
    description="Text analysis agent with NER and fake news detection",
    version="1.0.0"
)

# Load spaCy model (download with: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
    print("✅ spaCy model loaded successfully")
except OSError:
    print("❌ spaCy model not found. Install with: python -m spacy download en_core_web_sm")
    nlp = None

# Configuration
AGENTS_API_URL = os.getenv("AGENTS_API_URL", "http://localhost:8000")
AGENT_ID = "text-analyzer-1"

# Google Fact Check Tools API configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
FACT_CHECK_API_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

# OAuth2 credentials (for future implementation)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to analyze")

class Entity(BaseModel):
    text: str
    label: str
    start: int
    end: int
    confidence: float = 1.0

class Mention(BaseModel):
    text: str
    type: str  # person, organization, location, etc.
    start: int
    end: int

class TextAnalysisResponse(BaseModel):
    label: str = Field(..., description="Classification: fake, maybe, or real")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    entities: List[Entity] = Field(default=[], description="Named entities found")
    mentions: List[Mention] = Field(default=[], description="Relevant mentions")
    analysis_details: Dict[str, Any] = Field(default={}, description="Additional analysis info")
    fact_check_results: List[Dict[str, Any]] = Field(default=[], description="Google Fact Check results")
    combined_verdict: Optional[str] = Field(None, description="Combined verdict from style + fact check")

# Rule-based fake news detection patterns
FAKE_INDICATORS = {
    "sensational_words": [
        "shocking", "unbelievable", "amazing", "incredible", "secret", "hidden truth",
        "they don't want you to know", "exposed", "revealed", "scandal", "conspiracy",
        "urgent", "breaking", "must read", "viral", "explosive", "bombshell"
    ],
    "clickbait_patterns": [
        r"you won't believe",
        r"this will shock you",
        r"doctors hate this",
        r"one simple trick",
        r"what happens next will",
        r"the reason why",
        r"number \d+ will shock you"
    ],
    "emotional_manipulation": [
        "outraged", "furious", "devastating", "terrifying", "horrific",
        "disgusting", "shameful", "betrayal", "corruption"
    ],
    "credibility_undermining": [
        "mainstream media", "fake news", "cover-up", "suppressed",
        "censored", "banned", "deleted", "shadow banned"
    ],
    "false_urgency": [
        "share before it's deleted", "going viral", "everyone is talking",
        "before they take it down", "spread the word", "wake up"
    ]
}

def analyze_text_credibility(text: str) -> tuple[str, float, dict]:
    """
    Simple rule-based fake news detection
    Returns: (label, confidence, details)
    """
    text_lower = text.lower()
    
    # Initialize counters
    fake_signals = 0
    total_signals = 0
    details = {
        "sensational_count": 0,
        "clickbait_matches": [],
        "emotional_count": 0,
        "credibility_issues": 0,
        "urgency_signals": 0,
        "text_length": len(text),
        "caps_ratio": sum(1 for c in text if c.isupper()) / len(text) if text else 0
    }
    
    # Check for sensational words
    for word in FAKE_INDICATORS["sensational_words"]:
        if word in text_lower:
            fake_signals += 1
            details["sensational_count"] += 1
    total_signals += 1
    
    # Check for clickbait patterns
    for pattern in FAKE_INDICATORS["clickbait_patterns"]:
        matches = re.findall(pattern, text_lower)
        if matches:
            fake_signals += len(matches)
            details["clickbait_matches"].extend(matches)
    total_signals += 1
    
    # Check for emotional manipulation
    for word in FAKE_INDICATORS["emotional_manipulation"]:
        if word in text_lower:
            fake_signals += 1
            details["emotional_count"] += 1
    total_signals += 1
    
    # Check for credibility undermining
    for phrase in FAKE_INDICATORS["credibility_undermining"]:
        if phrase in text_lower:
            fake_signals += 2  # Weighted higher
            details["credibility_issues"] += 1
    total_signals += 1
    
    # Check for false urgency
    for phrase in FAKE_INDICATORS["false_urgency"]:
        if phrase in text_lower:
            fake_signals += 1
            details["urgency_signals"] += 1
    total_signals += 1
    
    # Check for excessive capitalization (shouting)
    if details["caps_ratio"] > 0.3:
        fake_signals += 1
    
    # Check for excessive punctuation
    exclamation_count = text.count('!')
    if exclamation_count > 3:
        fake_signals += 1
    
    # Calculate confidence and label
    if fake_signals == 0:
        return "real", 0.8, details
    elif fake_signals <= 2:
        return "maybe", 0.6, details
    else:
        confidence = min(0.9, 0.5 + (fake_signals * 0.1))
        return "fake", confidence, details

def extract_entities_and_mentions(text: str) -> tuple[List[Entity], List[Mention]]:
    """Extract named entities and relevant mentions using spaCy"""
    if not nlp:
        return [], []
    
    doc = nlp(text)
    entities = []
    mentions = []
    
    # Extract named entities
    for ent in doc.ents:
        # Filter relevant entity types
        if ent.label_ in ["PERSON", "ORG", "GPE", "NORP", "EVENT", "LAW", "LANGUAGE"]:
            entity = Entity(
                text=ent.text,
                label=ent.label_,
                start=ent.start_char,
                end=ent.end_char,
                confidence=1.0  # spaCy doesn't provide confidence directly
            )
            entities.append(entity)
            
            # Also add to mentions with more readable type
            mention_type = {
                "PERSON": "person",
                "ORG": "organization", 
                "GPE": "location",
                "NORP": "nationality",
                "EVENT": "event",
                "LAW": "law",
                "LANGUAGE": "language"
            }.get(ent.label_, "other")
            
            mention = Mention(
                text=ent.text,
                type=mention_type,
                start=ent.start_char,
                end=ent.end_char
            )
            mentions.append(mention)
    
    return entities, mentions

async def search_fact_check_claims(text: str, query_terms: List[str] = None) -> List[Dict[str, Any]]:
    """Search Google Fact Check Tools API for related claims"""
    if not GOOGLE_API_KEY:
        print("⚠️ Google API key not configured, skipping fact check")
        return []
    
    try:
        # Extract key terms for search if not provided
        if not query_terms:
            doc = nlp(text) if nlp else None
            if doc:
                # Extract important entities and noun phrases for search
                query_terms = []
                for ent in doc.ents:
                    if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT"]:
                        query_terms.append(ent.text)
                
                # Add important noun chunks
                for chunk in doc.noun_chunks:
                    if len(chunk.text.split()) <= 3:  # Keep it short
                        query_terms.append(chunk.text)
            
            # Fallback: use first few words
            if not query_terms:
                query_terms = text.split()[:5]
        
        fact_check_results = []
        
        # Search with different query combinations
        search_queries = query_terms[:3]  # Limit to top 3 terms
        
        for query in search_queries:
            params = {
                "query": query,
                "key": GOOGLE_API_KEY,
                "languageCode": "en",
                "pageSize": 5
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    FACT_CHECK_API_URL,
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    claims = data.get("claims", [])
                    
                    for claim in claims:
                        claim_text = claim.get("text", "")
                        reviews = claim.get("claimReview", [])
                        
                        for review in reviews:
                            fact_check_result = {
                                "query": query,
                                "claim_text": claim_text,
                                "publisher": review.get("publisher", {}).get("name", "Unknown"),
                                "url": review.get("url", ""),
                                "title": review.get("title", ""),
                                "rating": review.get("textualRating", ""),
                                "date": review.get("reviewDate", ""),
                                "relevance_score": calculate_text_similarity(text, claim_text)
                            }
                            fact_check_results.append(fact_check_result)
                
                # Add small delay to avoid rate limiting
                await asyncio.sleep(0.1)
        
        # Sort by relevance and return top results
        fact_check_results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        return fact_check_results[:10]  # Top 10 most relevant
        
    except Exception as e:
        print(f"Fact check API error: {e}")
        return []

def calculate_text_similarity(text1: str, text2: str) -> float:
    """Simple text similarity calculation"""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    if not union:
        return 0.0
    
    return len(intersection) / len(union)

def combine_analysis_verdict(style_label: str, style_confidence: float, fact_check_results: List[Dict]) -> tuple[str, float]:
    """Combine writing style analysis with fact check results"""
    if not fact_check_results:
        return style_label, style_confidence
    
    # Analyze fact check ratings
    false_ratings = ["false", "mostly false", "pants on fire", "fake", "incorrect"]
    true_ratings = ["true", "mostly true", "correct", "accurate"]
    mixed_ratings = ["mixed", "partly true", "half true", "unproven"]
    
    false_count = 0
    true_count = 0
    mixed_count = 0
    
    # Count ratings from high-relevance results
    high_relevance_results = [r for r in fact_check_results if r.get("relevance_score", 0) > 0.3]
    
    for result in high_relevance_results:
        rating = result.get("rating", "").lower()
        
        if any(false_term in rating for false_term in false_ratings):
            false_count += 1
        elif any(true_term in rating for true_term in true_ratings):
            true_count += 1
        elif any(mixed_term in rating for mixed_term in mixed_ratings):
            mixed_count += 1
    
    total_fact_checks = false_count + true_count + mixed_count
    
    if total_fact_checks == 0:
        return style_label, style_confidence
    
    # Calculate fact check verdict
    if false_count > true_count and false_count > mixed_count:
        fact_verdict = "fake"
        fact_confidence = min(0.9, 0.6 + (false_count / total_fact_checks) * 0.3)
    elif true_count > false_count and true_count > mixed_count:
        fact_verdict = "real"
        fact_confidence = min(0.9, 0.6 + (true_count / total_fact_checks) * 0.3)
    else:
        fact_verdict = "maybe"
        fact_confidence = 0.5
    
    # Combine style and fact check analysis
    if style_label == fact_verdict:
        # Both agree - increase confidence
        combined_confidence = min(0.95, (style_confidence + fact_confidence) / 2 + 0.1)
        return style_label, combined_confidence
    elif style_label == "fake" and fact_verdict == "real":
        # Style says fake, fact check says real - lean towards fact check but lower confidence
        return "maybe", 0.4
    elif style_label == "real" and fact_verdict == "fake":
        # Style says real, fact check says fake - lean towards fact check
        return "fake", min(0.8, fact_confidence)
    else:
        # Mixed results
        return "maybe", (style_confidence + fact_confidence) / 2

@app.get("/")
async def root():
    return {
        "message": "CivicShield Text Analysis Agent",
        "version": "1.0.0",
        "status": "active",
        "capabilities": ["NER", "fake_news_detection", "entity_extraction", "google_fact_check"],
        "spacy_loaded": nlp is not None,
        "google_api_configured": bool(GOOGLE_API_KEY)
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "spacy_model": "loaded" if nlp else "not_loaded",
        "timestamp": datetime.utcnow()
    }

@app.post("/analyze/text", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze text for fake news indicators and extract entities
    """
    try:
        text = request.text.strip()
        
        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Perform writing style analysis
        style_label, style_confidence, analysis_details = analyze_text_credibility(text)
        
        # Extract entities and mentions
        entities, mentions = extract_entities_and_mentions(text)
        
        # Perform fact checking
        fact_check_results = await search_fact_check_claims(text)
        
        # Combine style analysis with fact checking
        combined_label, combined_confidence = combine_analysis_verdict(
            style_label, style_confidence, fact_check_results
        )
        
        # Add some basic text statistics to analysis details
        analysis_details.update({
            "word_count": len(text.split()),
            "sentence_count": len([s for s in text.split('.') if s.strip()]),
            "entities_found": len(entities),
            "fact_checks_found": len(fact_check_results),
            "style_analysis": {
                "label": style_label,
                "confidence": style_confidence
            },
            "analysis_timestamp": datetime.utcnow().isoformat()
        })
        
        response = TextAnalysisResponse(
            label=combined_label,
            confidence=combined_confidence,
            entities=entities,
            mentions=mentions,
            analysis_details=analysis_details,
            fact_check_results=fact_check_results,
            combined_verdict=f"Style: {style_label} ({style_confidence:.2f}) + Fact Check: {len(fact_check_results)} results = {combined_label} ({combined_confidence:.2f})"
        )
        
        # Register processing with main agents API (fire and forget)
        asyncio.create_task(report_analysis_to_agents_api(text, response))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/batch", response_model=List[TextAnalysisResponse])
async def analyze_batch_texts(requests: List[TextAnalysisRequest]):
    """Analyze multiple texts in batch"""
    if len(requests) > 50:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 50 texts")
    
    results = []
    for req in requests:
        try:
            # Reuse the single analysis function
            analysis_result = await analyze_text(req)
            results.append(analysis_result)
        except Exception as e:
            # Add error result for failed analyses
            error_response = TextAnalysisResponse(
                label="error",
                confidence=0.0,
                entities=[],
                mentions=[],
                analysis_details={"error": str(e)}
            )
            results.append(error_response)
    
    return results

async def report_analysis_to_agents_api(text: str, analysis: TextAnalysisResponse):
    """Report analysis results to the main agents API"""
    try:
        if analysis.label == "fake":
            # Create a claim submission for potential fake news
            claim_data = {
                "text": text[:500],  # Truncate for storage
                "platform": "text_analyzer",
                "risk_level": "high" if analysis.confidence > 0.8 else "medium",
                "category": "other",
                "tags": ["ai_detected", "text_analysis"]
            }
            
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{AGENTS_API_URL}/submit/claim",
                    json=claim_data,
                    timeout=10.0
                )
        
        # Update agent status
        agent_status = {
            "agent_id": AGENT_ID,
            "agent_type": "text_analyzer",
            "status": "active",
            "last_activity": datetime.utcnow().isoformat(),
            "processed_items": 1,
            "error_count": 0,
            "metadata": {
                "last_analysis_label": analysis.label,
                "last_confidence": analysis.confidence
            }
        }
        
        async with httpx.AsyncClient() as client:
            await client.put(
                f"{AGENTS_API_URL}/agents/status/{AGENT_ID}",
                json=agent_status,
                timeout=10.0
            )
            
    except Exception as e:
        print(f"Failed to report to agents API: {e}")

# Register agent on startup
@app.on_event("startup")
async def register_agent():
    """Register this agent with the main agents API"""
    try:
        agent_data = {
            "agent_id": AGENT_ID,
            "agent_type": "text_analyzer",
            "status": "active",
            "last_activity": datetime.utcnow().isoformat(),
            "processed_items": 0,
            "error_count": 0,
            "metadata": {
                "capabilities": ["NER", "fake_news_detection"],
                "spacy_loaded": nlp is not None,
                "version": "1.0.0"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AGENTS_API_URL}/agents/register",
                json=agent_data,
                timeout=10.0
            )
            print(f"✅ Agent registered successfully: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed to register agent: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "text_analyzer:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )