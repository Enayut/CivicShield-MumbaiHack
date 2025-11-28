from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Set
import asyncio
import uvicorn
import httpx
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv
import numpy as np
from collections import defaultdict, Counter
import hashlib
import re
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import timedelta

load_dotenv()

app = FastAPI(
    title="CivicShield Network Analysis Agent",
    description="Social network analysis and viral potential assessment for misinformation detection",
    version="1.0.0"
)

# Configuration
AGENTS_API_URL = os.getenv("AGENTS_API_URL", "http://localhost:8000")
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "260cf323-495a-49b3-a805-24747e91907b")
NEWS_API_BASE_URL = "https://api.newsapi.ai/v1"
AGENT_ID = "network-analyzer-1"
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "civic_shield_network"

# MongoDB client
mongo_client = None
db = None

# MongoDB Collections:
# - authors: Author profiles and stats
# - connections: Network edges/relationships  
# - viral_patterns: Track viral content patterns
# - claims: Store claim relationships

# Cache for frequent lookups
author_cache = {}
connection_cache = {}

class NetworkAnalysisRequest(BaseModel):
    authorHandle: str = Field(..., pattern=r"^@?\w+$", description="Author's social media handle")
    mentions: List[str] = Field(default=[], description="List of mentioned users")
    reachEstimate: int = Field(..., ge=0, description="Estimated reach/impressions")
    retweetOf: Optional[str] = Field(None, description="Original post if this is a retweet")
    platform: Optional[str] = Field("twitter", description="Social media platform")
    content: Optional[str] = Field(None, description="Post content for analysis")
    engagement: Optional[Dict[str, int]] = Field(default={}, description="Likes, shares, comments")
    hashtags: Optional[List[str]] = Field(default=[], description="Hashtags used")
    timestamp: Optional[str] = Field(None, description="Post timestamp")

class SourceUpdate(BaseModel):
    handle: str
    credibilityScore: float = Field(..., ge=0, le=1)
    riskLevel: str = Field(..., pattern=r"^(low|medium|high|critical)$")
    networkMetrics: Dict[str, float] = {}
    totalPosts: int = 0
    avgReach: float = 0

class NetworkAnalysisResponse(BaseModel):
    viralScore: float = Field(..., ge=0, le=1, description="Viral potential score")
    sourceUpdate: SourceUpdate
    networkInsights: Dict[str, Any] = {}
    riskAssessment: Dict[str, Any] = {}
    relatedClaims: List[Dict[str, Any]] = []

class NewsSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    language: str = Field(default="en")
    country: Optional[str] = Field(None, pattern=r"^[a-z]{2}$")
    category: Optional[str] = Field(None)
    max_results: int = Field(default=50, ge=1, le=100)

class ClaimVerificationRequest(BaseModel):
    claim_text: str = Field(..., min_length=10, max_length=2000)
    author_handle: str
    source_url: Optional[str] = None
    context_keywords: List[str] = []

@app.get("/")
async def root():
    return {
        "message": "CivicShield Network Analysis Agent",
        "version": "1.0.0",
        "status": "active",
        "network_size": await get_network_size(),
        "total_authors": await get_total_authors(),
        "news_api_configured": bool(NEWS_API_KEY),
        "mongodb_connected": mongo_client is not None
    }

# MongoDB Helper Functions
async def get_or_create_author(handle: str) -> dict:
    """Get author from MongoDB or create new one"""
    try:
        # Check cache first
        if handle in author_cache:
            return author_cache[handle]
        
        # Get from database
        author = await db.authors.find_one({"handle": handle})
        
        if not author:
            # Create new author
            author = {
                "handle": handle,
                "total_posts": 0,
                "total_reach": 0,
                "total_mentions": 0,
                "credibility_score": 0.5,  # Start neutral
                "risk_indicators": 0,
                "first_seen": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                "followers_estimate": 0,
                "network_centrality": 0.0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await db.authors.insert_one(author)
            author["_id"] = result.inserted_id
        
        # Cache the result
        author_cache[handle] = author
        return author
        
    except Exception as e:
        print(f"Error getting/creating author {handle}: {e}")
        return None

async def update_author_stats(handle: str, request: NetworkAnalysisRequest):
    """Update author statistics in MongoDB"""
    try:
        author = await get_or_create_author(handle)
        if not author:
            return
        
        # Calculate updates
        updates = {
            "$inc": {
                "total_posts": 1,
                "total_reach": request.reachEstimate,
                "total_mentions": len(request.mentions)
            },
            "$set": {
                "last_activity": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
        
        # Update followers estimate if higher
        if request.reachEstimate > author.get("followers_estimate", 0):
            updates["$max"] = {"followers_estimate": request.reachEstimate // 10}
        
        await db.authors.update_one({"handle": handle}, updates)
        
        # Update cache
        if handle in author_cache:
            author_cache[handle]["total_posts"] += 1
            author_cache[handle]["total_reach"] += request.reachEstimate
            author_cache[handle]["total_mentions"] += len(request.mentions)
            author_cache[handle]["last_activity"] = datetime.utcnow()
        
    except Exception as e:
        print(f"Error updating author stats for {handle}: {e}")

async def update_network_connections(handle: str, request: NetworkAnalysisRequest):
    """Update network connections in MongoDB"""
    try:
        # Add mention relationships
        for mention in request.mentions:
            clean_mention = clean_handle(mention)
            await upsert_connection(handle, clean_mention, "mentions", 1.0)
        
        # Add retweet relationships
        if request.retweetOf:
            original_author = clean_handle(request.retweetOf)
            await upsert_connection(handle, original_author, "retweets", 0.5)
            
    except Exception as e:
        print(f"Error updating network connections for {handle}: {e}")

async def upsert_connection(source: str, target: str, connection_type: str, weight: float):
    """Insert or update a connection between two users"""
    try:
        # Ensure both users exist
        await get_or_create_author(source)
        await get_or_create_author(target)
        
        # Check if connection exists
        existing = await db.connections.find_one({
            "source": source,
            "target": target,
            "type": connection_type
        })
        
        if existing:
            # Update existing connection
            await db.connections.update_one(
                {"_id": existing["_id"]},
                {
                    "$inc": {"weight": weight, "interaction_count": 1},
                    "$set": {"last_interaction": datetime.utcnow()}
                }
            )
        else:
            # Create new connection
            connection = {
                "source": source,
                "target": target,
                "type": connection_type,
                "weight": weight,
                "interaction_count": 1,
                "first_interaction": datetime.utcnow(),
                "last_interaction": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            await db.connections.insert_one(connection)
            
    except Exception as e:
        print(f"Error upserting connection {source} -> {target}: {e}")

async def calculate_network_metrics(handle: str) -> dict:
    """Calculate network metrics for an author"""
    try:
        # Get all connections for this author
        outgoing = await db.connections.count_documents({"source": handle})
        incoming = await db.connections.count_documents({"target": handle})
        
        # Calculate total network reach (sum of connected users' followers)
        pipeline = [
            {"$match": {"source": handle}},
            {"$lookup": {
                "from": "authors",
                "localField": "target",
                "foreignField": "handle",
                "as": "target_author"
            }},
            {"$unwind": "$target_author"},
            {"$group": {
                "_id": None,
                "total_reach": {"$sum": "$target_author.followers_estimate"}
            }}
        ]
        
        reach_result = await db.connections.aggregate(pipeline).to_list(1)
        network_reach = reach_result[0]["total_reach"] if reach_result else 0
        
        # Simple centrality calculation (degree centrality)
        total_connections = outgoing + incoming
        
        # Get total network size for normalization
        total_authors = await db.authors.count_documents({})
        centrality = total_connections / max(total_authors - 1, 1) if total_authors > 1 else 0
        
        return {
            "centrality": centrality,
            "clustering": 0.0,  # Would need more complex calculation
            "network_reach": network_reach,
            "connections": total_connections,
            "outgoing_connections": outgoing,
            "incoming_connections": incoming
        }
        
    except Exception as e:
        print(f"Error calculating network metrics for {handle}: {e}")
        return {"centrality": 0, "clustering": 0, "network_reach": 0, "connections": 0}

async def get_network_size() -> int:
    """Get total number of nodes in network"""
    try:
        return await db.authors.count_documents({})
    except:
        return 0

async def get_total_authors() -> int:
    """Get total number of authors"""
    try:
        return await db.authors.count_documents({})
    except:
        return 0

@app.post("/analyze/network", response_model=NetworkAnalysisResponse)
async def analyze_network(request: NetworkAnalysisRequest):
    """Analyze social network patterns and compute viral score"""
    try:
        # Clean and normalize handle
        author_handle = clean_handle(request.authorHandle)
        
        # Update author statistics
        await update_author_stats(author_handle, request)
        
        # Update network connections
        await update_network_connections(author_handle, request)
        
        # Get author data
        author = await get_or_create_author(author_handle)
        if not author:
            raise HTTPException(status_code=500, detail="Failed to get author data")
        
        # Calculate viral score
        viral_score = await calculate_viral_score(author, request)
        
        # Update and get credibility score
        credibility_score, risk_level = await update_credibility_score(author, request)
        
        # Calculate network metrics
        network_metrics = await calculate_network_metrics(author_handle)
        
        # Generate insights
        insights = generate_network_insights(author, request)
        
        # Risk assessment
        risk_assessment = assess_risk_patterns(author, request)
        
        # Find related claims
        related_claims = await find_related_claims(request)
        
        # Create source update
        source_update = SourceUpdate(
            handle=author_handle,
            credibilityScore=credibility_score,
            riskLevel=risk_level,
            networkMetrics=network_metrics,
            totalPosts=author["total_posts"],
            avgReach=author["total_reach"] / max(author["total_posts"], 1)
        )
        
        return NetworkAnalysisResponse(
            viralScore=viral_score,
            sourceUpdate=source_update,
            networkInsights=insights,
            riskAssessment=risk_assessment,
            relatedClaims=related_claims
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Network analysis failed: {str(e)}")

@app.post("/search/news")
async def search_news(request: NewsSearchRequest):
    """Search for news articles using NewsAPI.ai"""
    try:
        async with httpx.AsyncClient() as client:
            params = {
                "query": request.query,
                "apikey": NEWS_API_KEY,
                "articlesCount": request.max_results,
                "lang": request.language,
                "sortBy": "rel"  # Relevance
            }
            
            if request.country:
                params["sourceLocationUri"] = f"http://en.wikipedia.org/wiki/{request.country.upper()}"
            
            if request.category:
                params["categoryUri"] = f"http://en.wikipedia.org/wiki/{request.category}"
            
            response = await client.get(
                f"{NEWS_API_BASE_URL}/article/getArticles",
                params=params,
                timeout=15.0
            )
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get("articles", {}).get("results", [])
                
                processed_articles = []
                for article in articles:
                    processed_articles.append({
                        "title": article.get("title", ""),
                        "body": article.get("body", "")[:500],  # First 500 chars
                        "url": article.get("url", ""),
                        "source": article.get("source", {}).get("title", "Unknown"),
                        "published_date": article.get("dateTime", ""),
                        "relevance": article.get("rel", 0),
                        "sentiment": article.get("sentiment", 0),
                        "language": article.get("lang", "en")
                    })
                
                return {
                    "query": request.query,
                    "total_results": len(processed_articles),
                    "articles": processed_articles,
                    "search_timestamp": datetime.utcnow().isoformat()
                }
            else:
                raise HTTPException(status_code=502, detail=f"NewsAPI error: {response.status_code}")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News search failed: {str(e)}")

@app.post("/verify/claim")
async def verify_claim_with_news(request: ClaimVerificationRequest):
    """Verify claim against news sources and network analysis"""
    try:
        # Extract key terms from claim
        keywords = extract_keywords(request.claim_text) + request.context_keywords
        search_query = " OR ".join(keywords[:5])  # Use top 5 keywords
        
        # Search for related news
        news_search = NewsSearchRequest(
            query=search_query,
            max_results=20
        )
        news_results = await search_news(news_search)
        
        # Analyze claim author's network
        network_request = NetworkAnalysisRequest(
            authorHandle=request.author_handle,
            reachEstimate=1000,  # Default estimate
            content=request.claim_text
        )
        network_analysis = await analyze_network(network_request)
        
        # Cross-reference claim with news articles
        verification_score = calculate_verification_score(
            request.claim_text, 
            news_results["articles"],
            network_analysis
        )
        
        # Determine credibility
        credibility = determine_claim_credibility(verification_score, network_analysis)
        
        return {
            "claim_text": request.claim_text[:200] + "..." if len(request.claim_text) > 200 else request.claim_text,
            "verification_score": verification_score,
            "credibility": credibility,
            "author_analysis": {
                "handle": network_analysis.sourceUpdate.handle,
                "credibility_score": network_analysis.sourceUpdate.credibilityScore,
                "risk_level": network_analysis.sourceUpdate.riskLevel
            },
            "news_analysis": {
                "related_articles_found": len(news_results["articles"]),
                "top_sources": list(set([a["source"] for a in news_results["articles"][:5]])),
                "avg_sentiment": np.mean([a.get("sentiment", 0) for a in news_results["articles"]]) if news_results["articles"] else 0
            },
            "viral_potential": network_analysis.viralScore,
            "risk_assessment": network_analysis.riskAssessment,
            "verification_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claim verification failed: {str(e)}")

@app.get("/network/graph")
async def get_network_graph():
    """Get current network graph structure from MongoDB"""
    try:
        nodes = []
        edges = []
        
        # Get all authors as nodes
        async for author in db.authors.find({}):
            nodes.append({
                "id": author["handle"],
                "credibility_score": author.get("credibility_score", 0.5),
                "total_posts": author.get("total_posts", 0),
                "total_reach": author.get("total_reach", 0),
                "network_centrality": author.get("network_centrality", 0.0),
                "risk_indicators": author.get("risk_indicators", 0),
                "followers_estimate": author.get("followers_estimate", 0)
            })
        
        # Get all connections as edges
        async for connection in db.connections.find({}):
            edges.append({
                "source": connection["source"],
                "target": connection["target"],
                "weight": connection.get("weight", 1),
                "type": connection.get("type", "unknown"),
                "interaction_count": connection.get("interaction_count", 1)
            })
        
        # Calculate network statistics
        total_nodes = len(nodes)
        total_edges = len(edges)
        
        # Calculate density (actual edges / possible edges)
        max_possible_edges = total_nodes * (total_nodes - 1) if total_nodes > 1 else 0
        density = total_edges / max_possible_edges if max_possible_edges > 0 else 0
        
        # Count connected components (simplified - just check if any isolated nodes)
        connected_nodes = set()
        for edge in edges:
            connected_nodes.add(edge["source"])
            connected_nodes.add(edge["target"])
        
        isolated_nodes = total_nodes - len(connected_nodes)
        connected_components = len(connected_nodes) + isolated_nodes if connected_nodes else total_nodes
        
        network_stats = {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "density": density,
            "clustering": 0.0,  # Would need complex calculation
            "connected_components": connected_components,
            "isolated_nodes": isolated_nodes
        }
        
        return {
            "nodes": nodes,
            "edges": edges,
            "statistics": network_stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph generation failed: {str(e)}")

def clean_handle(handle: str) -> str:
    """Clean and normalize social media handle"""
    handle = handle.strip().lower()
    if handle.startswith('@'):
        handle = handle[1:]
    return re.sub(r'[^a-z0-9_]', '', handle)

async def calculate_viral_score(author: dict, request: NetworkAnalysisRequest) -> float:
    """Calculate viral potential score using network analysis"""
    # Base score from reach and mentions
    base_score = min(request.reachEstimate / 10000, 0.5)  # Normalize reach to 0-0.5
    mention_boost = min(len(request.mentions) / 5, 0.3)  # Up to 0.3 boost from mentions
    
    # Author credibility factor
    credibility_factor = author.get("credibility_score", 0.5)
    
    # Network position factor
    centrality_bonus = author.get("network_centrality", 0) * 0.2
    
    # Engagement factor (if provided)
    engagement_factor = 0
    if request.engagement:
        total_engagement = sum(request.engagement.values())
        engagement_factor = min(total_engagement / max(request.reachEstimate, 1), 0.2)
    
    # Content risk factor
    content_risk = 0
    if request.content:
        risk_keywords = ["breaking", "urgent", "shocking", "exclusive", "secret", "hidden", "banned", "censored"]
        content_risk = sum(1 for keyword in risk_keywords if keyword in request.content.lower()) * 0.05
    
    viral_score = base_score + mention_boost + centrality_bonus + engagement_factor + content_risk
    return min(viral_score * credibility_factor, 1.0)  # Cap at 1.0

async def update_credibility_score(author: dict, request: NetworkAnalysisRequest) -> tuple[float, str]:
    """Update and return credibility score and risk level"""
    current_score = author.get("credibility_score", 0.5)
    
    # Factors that decrease credibility
    risk_indicators = 0
    
    # High reach with low followers suggests artificial amplification
    if request.reachEstimate > author.get("followers_estimate", 0) * 20:
        risk_indicators += 1
    
    # Too many mentions might indicate spam
    if len(request.mentions) > 10:
        risk_indicators += 1
    
    # Suspicious content patterns
    if request.content:
        suspicious_patterns = ["share before", "they don't want you", "mainstream media", "wake up", "truth"]
        risk_indicators += sum(1 for pattern in suspicious_patterns if pattern in request.content.lower())
    
    # Account age factor (new accounts are riskier)
    if author.get("first_seen"):
        if isinstance(author["first_seen"], str):
            account_age = (datetime.utcnow() - datetime.fromisoformat(author["first_seen"])).days
        else:
            account_age = (datetime.utcnow() - author["first_seen"]).days
        
        if account_age < 30:
            risk_indicators += 1
    
    # Calculate new credibility score
    total_posts = author.get("total_posts", 1)
    current_risk_indicators = author.get("risk_indicators", 0)
    new_risk_indicators = current_risk_indicators + risk_indicators
    
    risk_ratio = min(new_risk_indicators / max(total_posts, 1), 1.0)
    new_score = current_score * (1 - risk_ratio * 0.1)  # Gradually decrease credibility
    
    # Boost for consistent, low-risk posting
    if total_posts > 10 and risk_indicators == 0:
        new_score = min(new_score + 0.02, 1.0)
    
    # Update in database
    try:
        await db.authors.update_one(
            {"handle": author["handle"]},
            {
                "$set": {
                    "credibility_score": new_score,
                    "updated_at": datetime.utcnow()
                },
                "$inc": {"risk_indicators": risk_indicators}
            }
        )
        
        # Update cache
        if author["handle"] in author_cache:
            author_cache[author["handle"]]["credibility_score"] = new_score
            author_cache[author["handle"]]["risk_indicators"] += risk_indicators
            
    except Exception as e:
        print(f"Error updating credibility score: {e}")
    
    # Determine risk level
    if new_score < 0.3:
        risk_level = "critical"
    elif new_score < 0.5:
        risk_level = "high"
    elif new_score < 0.7:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return new_score, risk_level

def generate_network_insights(author: dict, request: NetworkAnalysisRequest) -> Dict[str, Any]:
    """Generate insights about the network analysis"""
    first_seen = author.get("first_seen")
    if isinstance(first_seen, str):
        first_seen = datetime.fromisoformat(first_seen)
    
    account_age_days = 0
    if first_seen:
        account_age_days = (datetime.utcnow() - first_seen).days
    
    insights = {
        "posting_frequency": author.get("total_posts", 0) / max(account_age_days, 1),
        "avg_reach_per_post": author.get("total_reach", 0) / max(author.get("total_posts", 1), 1),
        "mention_activity": author.get("total_mentions", 0) / max(author.get("total_posts", 1), 1),
        "network_position": "central" if author.get("network_centrality", 0) > 0.1 else "peripheral",
        "account_age_days": account_age_days
    }
    
    # Behavioral patterns
    if insights["posting_frequency"] > 5:
        insights["behavior_flag"] = "high_activity"
    elif insights["avg_reach_per_post"] > author.get("followers_estimate", 0):
        insights["behavior_flag"] = "unusual_reach"
    elif insights["mention_activity"] > 3:
        insights["behavior_flag"] = "mention_heavy"
    else:
        insights["behavior_flag"] = "normal"
    
    return insights

def assess_risk_patterns(author: dict, request: NetworkAnalysisRequest) -> Dict[str, Any]:
    """Assess risk patterns in the network"""
    risk_factors = []
    risk_score = 0
    
    # Check for bot-like behavior
    if author.get("total_posts", 0) > 20:
        first_seen = author.get("first_seen")
        if isinstance(first_seen, str):
            first_seen = datetime.fromisoformat(first_seen)
        
        if first_seen:
            days_active = max((datetime.utcnow() - first_seen).days, 1)
            if author.get("total_posts", 0) / days_active > 10:
                risk_factors.append("high_posting_frequency")
                risk_score += 0.2
    
    # Check for coordination patterns
    if len(request.mentions) > 5:
        risk_factors.append("excessive_mentions")
        risk_score += 0.15
    
    # Check for amplification networks
    if author.get("network_centrality", 0) > 0.8:
        risk_factors.append("network_hub")
        risk_score += 0.1
    
    return {
        "overall_risk_score": min(risk_score, 1.0),
        "risk_factors": risk_factors,
        "coordination_likelihood": min(len(risk_factors) * 0.3, 1.0),
        "bot_probability": min(risk_score * 0.8, 1.0)
    }

async def find_related_claims(request: NetworkAnalysisRequest) -> List[Dict[str, Any]]:
    """Find related claims using content similarity and network connections"""
    related_claims = []
    
    try:
        # Get network connections for this author
        author_handle = clean_handle(request.authorHandle)
        
        # Find connected accounts
        connections = await db.connections.find({
            "$or": [
                {"source": author_handle},
                {"target": author_handle}
            ]
        }).limit(5).to_list(5)
        
        for connection in connections:
            related_handle = connection["target"] if connection["source"] == author_handle else connection["source"]
            related_author = await db.authors.find_one({"handle": related_handle})
            
            if related_author:
                related_claims.append({
                    "related_author": related_handle,
                    "connection_strength": connection.get("weight", 1),
                    "credibility_score": related_author.get("credibility_score", 0.5),
                    "claim_type": "network_connected"
                })
        
        return related_claims
        
    except Exception as e:
        print(f"Error finding related claims: {e}")
        return []

def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text for news search"""
    # Simple keyword extraction (could be enhanced with NLP)
    text = text.lower()
    # Remove common words
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "should", "could", "can", "may", "might"}
    
    words = re.findall(r'\b\w+\b', text)
    keywords = [word for word in words if word not in stop_words and len(word) > 3]
    
    return keywords[:10]  # Return top 10 keywords

def calculate_verification_score(claim_text: str, articles: List[Dict], network_analysis) -> float:
    """Calculate verification score based on news articles and network analysis"""
    if not articles:
        return 0.1  # Low score if no articles found
    
    # Simple text matching score
    claim_words = set(extract_keywords(claim_text))
    
    relevance_scores = []
    for article in articles:
        article_words = set(extract_keywords(article.get("title", "") + " " + article.get("body", "")))
        overlap = len(claim_words.intersection(article_words))
        relevance_scores.append(overlap / max(len(claim_words), 1))
    
    avg_relevance = np.mean(relevance_scores) if relevance_scores else 0
    
    # Combine with network credibility
    network_credibility = network_analysis.sourceUpdate.credibilityScore
    
    return (avg_relevance * 0.7) + (network_credibility * 0.3)

def determine_claim_credibility(verification_score: float, network_analysis) -> str:
    """Determine overall claim credibility"""
    if verification_score > 0.7 and network_analysis.sourceUpdate.credibilityScore > 0.6:
        return "likely_credible"
    elif verification_score < 0.3 or network_analysis.sourceUpdate.credibilityScore < 0.4:
        return "likely_false"
    elif network_analysis.riskAssessment["overall_risk_score"] > 0.6:
        return "suspicious"
    else:
        return "uncertain"

# Register agent on startup and initialize MongoDB
@app.on_event("startup")
async def startup_event():
    """Initialize MongoDB connection and register agent"""
    global mongo_client, db
    
    try:
        # Initialize MongoDB connection
        mongo_client = AsyncIOMotorClient(MONGO_URI)
        db = mongo_client[DATABASE_NAME]
        
        # Test connection
        await db.command("ping")
        print(f"✅ Connected to MongoDB: {DATABASE_NAME}")
        
        # Create indexes for better performance
        await create_indexes()
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("   Network analysis will work with limited functionality")
    
    # Register agent with main API
    try:
        agent_data = {
            "agent_id": AGENT_ID,
            "agent_type": "network_analyzer",
            "status": "active",
            "last_activity": datetime.utcnow().isoformat(),
            "processed_items": 0,
            "error_count": 0,
            "metadata": {
                "capabilities": ["network_analysis", "viral_scoring", "news_verification", "graph_analysis"],
                "news_api_configured": bool(NEWS_API_KEY),
                "mongodb_connected": mongo_client is not None,
                "version": "1.0.0"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AGENTS_API_URL}/agents/register",
                json=agent_data,
                timeout=10.0
            )
            print(f"✅ Network Analysis Agent registered: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed to register agent: {e}")

async def create_indexes():
    """Create MongoDB indexes for optimal performance"""
    try:
        # Index on author handle for fast lookups
        await db.authors.create_index("handle", unique=True)
        await db.authors.create_index("credibility_score")
        await db.authors.create_index("last_activity")
        
        # Compound index for connections
        await db.connections.create_index([("source", 1), ("target", 1), ("type", 1)], unique=True)
        await db.connections.create_index("source")
        await db.connections.create_index("target")
        await db.connections.create_index("weight")
        
        # Index for viral patterns
        await db.viral_patterns.create_index("pattern")
        await db.viral_patterns.create_index("count")
        
        print("✅ MongoDB indexes created successfully")
        
    except Exception as e:
        print(f"⚠️  Error creating indexes: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up MongoDB connection on shutdown"""
    global mongo_client
    
    if mongo_client:
        mongo_client.close()
        print("✅ MongoDB connection closed")

if __name__ == "__main__":
    uvicorn.run(
        "network_analyzer:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )