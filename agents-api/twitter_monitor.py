from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import uvicorn
import httpx
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CivicShield Twitter Monitor Agent",
    description="Twitter monitoring agent for misinformation detection",
    version="1.0.0"
)

# Configuration
AGENTS_API_URL = os.getenv("AGENTS_API_URL", "http://localhost:8000")
TEXT_ANALYZER_URL = os.getenv("TEXT_ANALYZER_URL", "http://localhost:8001")
AGENT_ID = "twitter-monitor-1"

# Twitter API credentials (for future Tweepy integration)
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "")
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY", "")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET", "")

# Mock tweet data for simulation
MOCK_TWEETS = [
    {
        "id": "1728901234567890123",
        "text": "BREAKING: Government secretly using voting machines to manipulate election results! Share before they delete this! #ElectionFraud",
        "user": {"username": "truthteller2024", "followers_count": 1500},
        "created_at": "2025-11-27T10:30:00Z",
        "public_metrics": {"retweet_count": 245, "like_count": 890, "reply_count": 67},
        "context_annotations": [{"entity": {"name": "Election"}}]
    },
    {
        "id": "1728901234567890124", 
        "text": "Election Commission of India announces extended voting hours in Delhi due to high turnout. Official statement released.",
        "user": {"username": "official_eci", "followers_count": 50000},
        "created_at": "2025-11-27T11:00:00Z",
        "public_metrics": {"retweet_count": 125, "like_count": 456, "reply_count": 23},
        "context_annotations": [{"entity": {"name": "Election Commission"}}]
    },
    {
        "id": "1728901234567890125",
        "text": "URGENT!!! Shocking discovery about candidate X's secret funding! Mainstream media won't report this! RT to expose the truth!",
        "user": {"username": "newsexposed", "followers_count": 3200},
        "created_at": "2025-11-27T11:15:00Z", 
        "public_metrics": {"retweet_count": 567, "like_count": 1234, "reply_count": 89},
        "context_annotations": [{"entity": {"name": "Political Candidate"}}]
    },
    {
        "id": "1728901234567890126",
        "text": "Weather update: Heavy rains expected in Mumbai tomorrow. Citizens advised to plan travel accordingly.",
        "user": {"username": "mumbai_weather", "followers_count": 8900},
        "created_at": "2025-11-27T11:30:00Z",
        "public_metrics": {"retweet_count": 45, "like_count": 123, "reply_count": 12},
        "context_annotations": [{"entity": {"name": "Weather"}}]
    },
    {
        "id": "1728901234567890127",
        "text": "You won't believe what politician Y said about EVMs! This video will shock you! They're trying to hide the truth! #Conspiracy #VotingFraud",
        "user": {"username": "viral_truth", "followers_count": 2100},
        "created_at": "2025-11-27T12:00:00Z",
        "public_metrics": {"retweet_count": 789, "like_count": 1567, "reply_count": 156},
        "context_annotations": [{"entity": {"name": "Electronic Voting Machine"}}]
    }
]

class TweetData(BaseModel):
    tweet_id: str
    text: str
    username: str
    user_followers: int
    created_at: str
    retweet_count: int
    like_count: int
    reply_count: int
    context: Optional[List[str]] = []

class MonitoringConfig(BaseModel):
    keywords: List[str] = Field(default=["election", "voting", "evm", "candidate", "fraud", "fake"])
    min_engagement: int = Field(default=50, description="Minimum likes+retweets to analyze")
    risk_threshold: float = Field(default=0.6, description="Confidence threshold for flagging")
    check_interval: int = Field(default=60, description="Check interval in seconds")

class MonitoringStatus(BaseModel):
    is_running: bool = False
    last_check: Optional[str] = None
    tweets_analyzed: int = 0
    claims_submitted: int = 0
    alerts_created: int = 0
    current_config: MonitoringConfig = MonitoringConfig()

# Global monitoring status
monitoring_status = MonitoringStatus()

@app.get("/")
async def root():
    return {        
        "message": "CivicShield Twitter Monitor Agent",        
        "version": "1.0.0",        
        "status": "active",        
        "monitoring_active": monitoring_status.is_running,        
        "tweets_analyzed": monitoring_status.tweets_analyzed,        
        "twitter_api_configured": bool(TWITTER_BEARER_TOKEN)    
    }

@app.get("/status")
async def get_monitoring_status():
    """Get current monitoring status"""
    return monitoring_status

@app.post("/start")
async def start_monitoring(config: MonitoringConfig, background_tasks: BackgroundTasks):
    """Start Twitter monitoring with given configuration"""
    monitoring_status.is_running = True
    monitoring_status.current_config = config
    
    # Start monitoring in background
    background_tasks.add_task(monitor_tweets_continuously)
    
    return {
        "message": "Twitter monitoring started",
        "config": config,
        "status": "running"
    }

@app.post("/stop")
async def stop_monitoring():
    """Stop Twitter monitoring"""
    monitoring_status.is_running = False
    
    return {
        "message": "Twitter monitoring stopped",
        "final_stats": {
            "tweets_analyzed": monitoring_status.tweets_analyzed,
            "claims_submitted": monitoring_status.claims_submitted,
            "alerts_created": monitoring_status.alerts_created
        }
    }

@app.post("/analyze/tweet")
async def analyze_single_tweet(tweet: TweetData):
    """Analyze a single tweet for misinformation"""
    try:
        # Send tweet text to text analyzer
        analysis_request = {"text": tweet.text}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{TEXT_ANALYZER_URL}/analyze/text",
                json=analysis_request,
                timeout=30.0
            )
            
            if response.status_code == 200:
                analysis = response.json()
                
                # Calculate engagement score
                engagement_score = tweet.retweet_count + tweet.like_count + (tweet.reply_count * 2)
                
                # Determine risk level based on analysis and engagement
                risk_level = determine_risk_level(analysis, engagement_score, tweet.user_followers)
                
                result = {
                    "tweet_id": tweet.tweet_id,
                    "analysis": analysis,
                    "engagement_score": engagement_score,
                    "risk_level": risk_level,
                    "requires_action": analysis["confidence"] > monitoring_status.current_config.risk_threshold and analysis["label"] in ["fake", "maybe"],
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # Submit as claim if high risk
                if result["requires_action"]:
                    await submit_tweet_as_claim(tweet, analysis, risk_level)
                
                monitoring_status.tweets_analyzed += 1
                
                return result
            else:
                raise HTTPException(status_code=500, detail="Text analysis failed")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tweet analysis failed: {str(e)}")

@app.get("/simulate/check")
async def simulate_tweet_check():
    """Simulate checking tweets and analyzing them"""
    if not monitoring_status.is_running:
        raise HTTPException(status_code=400, detail="Monitoring is not active")
    
    results = []
    
    # Simulate checking recent tweets
    for tweet_data in MOCK_TWEETS[:3]:  # Check first 3 tweets
        tweet = TweetData(
            tweet_id=tweet_data["id"],
            text=tweet_data["text"],
            username=tweet_data["user"]["username"],
            user_followers=tweet_data["user"]["followers_count"],
            created_at=tweet_data["created_at"],
            retweet_count=tweet_data["public_metrics"]["retweet_count"],
            like_count=tweet_data["public_metrics"]["like_count"],
            reply_count=tweet_data["public_metrics"]["reply_count"],
            context=[ann["entity"]["name"] for ann in tweet_data.get("context_annotations", [])]
        )
        
        # Analyze the tweet
        try:
            result = await analyze_single_tweet(tweet)
            results.append(result)
        except Exception as e:
            results.append({
                "tweet_id": tweet.tweet_id,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
    
    monitoring_status.last_check = datetime.utcnow().isoformat()
    
    return {
        "simulation_results": results,
        "total_checked": len(results),
        "flagged_count": len([r for r in results if r.get("requires_action", False)]),
        "timestamp": monitoring_status.last_check
    }

def determine_risk_level(analysis: Dict, engagement_score: int, follower_count: int) -> str:
    """Determine risk level based on analysis results and social signals"""
    base_risk = analysis["confidence"]
    
    # Adjust risk based on engagement
    if engagement_score > 1000:
        base_risk += 0.1  # High engagement increases risk
    elif engagement_score > 500:
        base_risk += 0.05
    
    # Adjust risk based on account credibility
    if follower_count < 1000:
        base_risk += 0.05  # Low follower accounts slightly more risky
    elif follower_count > 10000:
        base_risk -= 0.05  # High follower accounts slightly less risky
    
    # Adjust based on analysis label
    if analysis["label"] == "fake":
        base_risk += 0.1
    elif analysis["label"] == "real":
        base_risk -= 0.1
    
    # Determine final risk level
    if base_risk >= 0.8:
        return "critical"
    elif base_risk >= 0.6:
        return "high"
    elif base_risk >= 0.4:
        return "medium"
    else:
        return "low"

async def submit_tweet_as_claim(tweet: TweetData, analysis: Dict, risk_level: str):
    """Submit flagged tweet as a claim to the main API"""
    try:
        claim_data = {
            "text": tweet.text,
            "platform": "twitter",
            "source_url": f"https://twitter.com/{tweet.username}/status/{tweet.tweet_id}",
            "author": tweet.username,
            "author_id": tweet.username,
            "risk_level": risk_level,
            "engagement": {
                "views": 0,  # Twitter API v2 doesn't always provide this
                "shares": tweet.retweet_count,
                "likes": tweet.like_count,
                "comments": tweet.reply_count
            },
            "tags": ["twitter", "ai_detected", "social_media"] + (tweet.context or []),
            "category": "election" if any(word in tweet.text.lower() for word in ["election", "vote", "evm", "candidate"]) else "other"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AGENTS_API_URL}/submit/claim",
                json=claim_data,
                timeout=15.0
            )
            
            if response.status_code in [200, 201]:
                monitoring_status.claims_submitted += 1
                print(f"✅ Submitted tweet {tweet.tweet_id} as claim")
                
                # Create alert if critical
                if risk_level == "critical":
                    await create_critical_alert(tweet, analysis, claim_data)
            else:
                print(f"❌ Failed to submit claim for tweet {tweet.tweet_id}: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error submitting tweet as claim: {e}")

async def create_critical_alert(tweet: TweetData, analysis: Dict, claim_data: Dict):
    """Create a critical alert for high-risk viral content"""
    try:
        alert_data = {
            "title": f"Viral Misinformation Detected on Twitter",
            "description": f"High-confidence fake news spreading rapidly. Tweet by @{tweet.username} has {tweet.like_count + tweet.retweet_count} engagements. Content: {tweet.text[:200]}...",
            "severity": "critical",
            "category": "misinformation",
            "location": {"country": "India"},  # Default, could be enhanced with geo data
            "affected_users": tweet.like_count + tweet.retweet_count,
            "platform": "twitter",
            "related_claims": []  # Would link to the claim ID if available
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AGENTS_API_URL}/submit/alert",
                json=alert_data,
                timeout=15.0
            )
            
            if response.status_code in [200, 201]:
                monitoring_status.alerts_created += 1
                print(f"🚨 Created critical alert for tweet {tweet.tweet_id}")
            else:
                print(f"❌ Failed to create alert for tweet {tweet.tweet_id}: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error creating alert: {e}")

async def monitor_tweets_continuously():
    """Continuously monitor tweets (background task)"""
    print("🔄 Starting continuous Twitter monitoring...")
    
    while monitoring_status.is_running:
        try:
            # In real implementation, this would use Tweepy to fetch tweets
            # For now, simulate with mock data
            
            config = monitoring_status.current_config
            
            # Simulate finding tweets with target keywords
            relevant_tweets = []
            for tweet_data in MOCK_TWEETS:
                tweet_text = tweet_data["text"].lower()
                if any(keyword.lower() in tweet_text for keyword in config.keywords):
                    engagement = tweet_data["public_metrics"]["retweet_count"] + tweet_data["public_metrics"]["like_count"]
                    if engagement >= config.min_engagement:
                        relevant_tweets.append(tweet_data)
            
            print(f"📊 Found {len(relevant_tweets)} relevant tweets to analyze")
            
            # Analyze each relevant tweet
            for tweet_data in relevant_tweets:
                if not monitoring_status.is_running:
                    break
                    
                tweet = TweetData(
                    tweet_id=tweet_data["id"],
                    text=tweet_data["text"],
                    username=tweet_data["user"]["username"],
                    user_followers=tweet_data["user"]["followers_count"],
                    created_at=tweet_data["created_at"],
                    retweet_count=tweet_data["public_metrics"]["retweet_count"],
                    like_count=tweet_data["public_metrics"]["like_count"],
                    reply_count=tweet_data["public_metrics"]["reply_count"]
                )
                
                try:
                    await analyze_single_tweet(tweet)
                    await asyncio.sleep(2)  # Rate limiting
                except Exception as e:
                    print(f"❌ Error analyzing tweet {tweet.tweet_id}: {e}")
            
            monitoring_status.last_check = datetime.utcnow().isoformat()
            
            # Wait before next check
            await asyncio.sleep(config.check_interval)
            
        except Exception as e:
            print(f"❌ Error in monitoring loop: {e}")
            await asyncio.sleep(30)  # Wait before retrying
    
    print("⏹️ Twitter monitoring stopped")

# Register agent on startup
@app.on_event("startup")
async def register_agent():
    """Register this agent with the main agents API"""
    try:
        agent_data = {
            "agent_id": AGENT_ID,
            "agent_type": "twitter_monitor",
            "status": "active",
            "last_activity": datetime.utcnow().isoformat(),
            "processed_items": 0,
            "error_count": 0,
            "metadata": {
                "capabilities": ["twitter_monitoring", "real_time_analysis", "viral_detection"],
                "twitter_api_configured": bool(TWITTER_BEARER_TOKEN),
                "version": "1.0.0"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AGENTS_API_URL}/agents/register",
                json=agent_data,
                timeout=10.0
            )
            print(f"✅ Twitter Monitor Agent registered: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed to register agent: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "twitter_monitor:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )