# Network Analysis Agent Documentation

## Overview

The Network Analysis Agent analyzes social network patterns, calculates viral potential scores, and verifies claims against news sources. It builds a dynamic graph of social connections and uses network analysis algorithms to detect misinformation patterns and assess source credibility.

## Key Features

### 🕸️ Network Graph Analysis
- **Source Graph**: Builds directed graph of author relationships
- **Centrality Metrics**: Calculates degree centrality and clustering coefficients  
- **Credibility Scoring**: Dynamic scoring based on network behavior
- **Risk Assessment**: Identifies suspicious patterns and coordination

### 📈 Viral Score Calculation
- **Reach Analysis**: Normalizes reach estimates and engagement
- **Network Position**: Considers author's centrality in the network
- **Content Risk**: Analyzes suspicious language patterns
- **Amplification Detection**: Identifies artificial boost patterns

### 📰 News Verification
- **NewsAPI Integration**: Cross-references claims with news articles
- **Keyword Extraction**: Smart keyword matching for relevance
- **Source Credibility**: Combines network and news analysis
- **Real-time Verification**: Live claim checking against news sources

## API Endpoints

### POST /analyze/network

Analyzes network patterns and returns viral score with source updates.

**Request:**
```json
{
  "authorHandle": "@username",
  "mentions": ["@user1", "@user2"],
  "reachEstimate": 10000,
  "retweetOf": "@original_author",
  "platform": "twitter",
  "content": "Post content text",
  "engagement": {
    "likes": 500,
    "shares": 200,
    "comments": 50
  },
  "hashtags": ["#trending"],
  "timestamp": "2024-11-27T12:00:00Z"
}
```

**Response:**
```json
{
  "viralScore": 0.75,
  "sourceUpdate": {
    "handle": "username",
    "credibilityScore": 0.65,
    "riskLevel": "medium",
    "networkMetrics": {
      "centrality": 0.12,
      "clustering": 0.08,
      "network_reach": 50000,
      "connections": 15
    },
    "totalPosts": 25,
    "avgReach": 8000
  },
  "networkInsights": {
    "posting_frequency": 2.5,
    "avg_reach_per_post": 8000,
    "mention_activity": 1.2,
    "network_position": "peripheral",
    "account_age_days": 180,
    "behavior_flag": "normal"
  },
  "riskAssessment": {
    "overall_risk_score": 0.3,
    "risk_factors": ["high_posting_frequency"],
    "coordination_likelihood": 0.1,
    "bot_probability": 0.2
  }
}
```

### POST /search/news

Searches news articles using NewsAPI.ai integration.

**Request:**
```json
{
  "query": "election voting fraud",
  "language": "en",
  "country": "us",
  "max_results": 20
}
```

**Response:**
```json
{
  "query": "election voting fraud",
  "total_results": 15,
  "articles": [
    {
      "title": "Election Security Measures Updated",
      "body": "Election officials announced new security...",
      "url": "https://example.com/article",
      "source": "Reliable News",
      "published_date": "2024-11-27T10:00:00Z",
      "relevance": 0.85,
      "sentiment": 0.1,
      "language": "en"
    }
  ],
  "search_timestamp": "2024-11-27T12:00:00Z"
}
```

### POST /verify/claim

Comprehensive claim verification using network analysis and news cross-referencing.

**Request:**
```json
{
  "claim_text": "Government using voting machines to manipulate elections",
  "author_handle": "@suspicious_account",
  "source_url": "https://twitter.com/suspicious_account/status/123456789",
  "context_keywords": ["election", "voting", "fraud"]
}
```

**Response:**
```json
{
  "claim_text": "Government using voting machines to manipulate elections",
  "verification_score": 0.25,
  "credibility": "likely_false",
  "author_analysis": {
    "handle": "suspicious_account",
    "credibility_score": 0.35,
    "risk_level": "high"
  },
  "news_analysis": {
    "related_articles_found": 8,
    "top_sources": ["Reuters", "AP News", "BBC"],
    "avg_sentiment": -0.1
  },
  "viral_potential": 0.78,
  "risk_assessment": {
    "overall_risk_score": 0.7,
    "risk_factors": ["high_posting_frequency", "excessive_mentions"],
    "coordination_likelihood": 0.6,
    "bot_probability": 0.4
  },
  "verification_timestamp": "2024-11-27T12:00:00Z"
}
```

### GET /network/graph

Returns the current network graph structure and statistics.

**Response:**
```json
{
  "nodes": [
    {
      "id": "username1",
      "credibility_score": 0.8,
      "total_posts": 150,
      "total_reach": 500000,
      "network_centrality": 0.25,
      "risk_indicators": 2
    }
  ],
  "edges": [
    {
      "source": "username1",
      "target": "username2",
      "weight": 5
    }
  ],
  "statistics": {
    "total_nodes": 45,
    "total_edges": 120,
    "density": 0.12,
    "clustering": 0.08,
    "connected_components": 3
  },
  "generated_at": "2024-11-27T12:00:00Z"
}
```

## Viral Score Algorithm

The viral score combines multiple factors:

```python
viral_score = (
    base_reach_score * 0.4 +          # Normalized reach (0-0.5)
    mention_boost * 0.3 +              # Mentions impact (0-0.3) 
    centrality_bonus * 0.2 +           # Network position (0-0.2)
    engagement_factor * 0.1            # Engagement ratio (0-0.2)
) * credibility_factor                 # Author credibility modifier
```

### Factors:
- **Base Reach**: `min(reachEstimate / 10000, 0.5)`
- **Mention Boost**: `min(len(mentions) / 5, 0.3)`
- **Centrality Bonus**: `network_centrality * 0.2`
- **Engagement Factor**: `min(total_engagement / reach, 0.2)`
- **Credibility Factor**: Author's current credibility score

## Credibility Scoring

Dynamic credibility scoring that updates with each post:

### Risk Indicators (decrease credibility):
- **Artificial Amplification**: Reach >> followers estimate
- **Spam Patterns**: Excessive mentions (>10 per post)
- **Suspicious Content**: Contains conspiracy language
- **New Account**: Less than 30 days old
- **Coordination**: Similar patterns to known bot networks

### Trust Indicators (increase credibility):
- **Consistent Posting**: Regular, low-risk content
- **Verified Sources**: Links to credible news sources  
- **Network Position**: Connected to verified accounts
- **Engagement Quality**: High-quality interactions

## Graph Storage Architecture

### Current Implementation:
- **In-Memory**: NetworkX graphs for development/testing
- **Author Stats**: Dictionary with comprehensive metrics
- **Real-time Updates**: Immediate graph updates on new data

### Production Recommendations:

#### Option 1: Neo4j Graph Database
```cypher
// Node structure
CREATE (a:Author {
  handle: "username",
  credibility_score: 0.75,
  total_posts: 150,
  first_seen: datetime(),
  risk_indicators: 2
})

// Relationship structure  
CREATE (a)-[:MENTIONS {weight: 5, last_interaction: datetime()}]->(b)
CREATE (a)-[:RETWEETS {weight: 2, frequency: 0.3}]->(b)
```

#### Option 2: MongoDB with Graph Queries
```javascript
// Author document
{
  _id: "username",
  credibility_score: 0.75,
  network_metrics: {
    centrality: 0.12,
    clustering: 0.08,
    connections: 15
  },
  connections: [
    {
      target: "other_user",
      relationship_type: "mentions",
      weight: 5,
      last_interaction: ISODate()
    }
  ]
}
```

## Integration Examples

### With Twitter Monitor Agent
```python
# Twitter agent sends network data
network_data = {
    "authorHandle": tweet.username,
    "mentions": extract_mentions(tweet.text),
    "reachEstimate": tweet.like_count + tweet.retweet_count * 5,
    "content": tweet.text,
    "engagement": {
        "likes": tweet.like_count,
        "shares": tweet.retweet_count,
        "comments": tweet.reply_count
    }
}

# Network analysis result used for claim submission
if viral_score > 0.7 and risk_level in ["high", "critical"]:
    submit_claim_to_main_api(tweet, network_analysis)
```

### With Text Analyzer Agent
```python
# Combined analysis workflow
text_analysis = await analyze_text(content)
network_analysis = await analyze_network(network_data)

final_score = (
    text_analysis["confidence"] * 0.6 +
    network_analysis["viral_score"] * 0.4
)

risk_level = max(text_analysis["risk"], network_analysis["risk"])
```

## Testing

### Start the Agent
```bash
cd agents-api
python network_analyzer.py
```

### Test Network Analysis
```bash
curl -X POST "http://localhost:8003/analyze/network" \
-H "Content-Type: application/json" \
-d '{
  "authorHandle": "@testuser",
  "mentions": ["@politician", "@newsoutlet"],
  "reachEstimate": 15000,
  "content": "Breaking: Election fraud discovered!",
  "engagement": {"likes": 500, "shares": 200}
}'
```

### Test News Search
```bash
curl -X POST "http://localhost:8003/search/news" \
-H "Content-Type: application/json" \
-d '{
  "query": "election voting fraud",
  "max_results": 10
}'
```

### Test Claim Verification
```bash
curl -X POST "http://localhost:8003/verify/claim" \
-H "Content-Type: application/json" \
-d '{
  "claim_text": "Voting machines are being hacked to change results",
  "author_handle": "@concernedcitizen",
  "context_keywords": ["voting", "machines", "hack", "election"]
}'
```

### View Network Graph
```bash
curl -X GET "http://localhost:8003/network/graph"
```

## Monitoring and Analytics

### Key Metrics to Track:
- **Network Growth**: Nodes and edges over time
- **Credibility Distribution**: High vs low credibility sources
- **Viral Patterns**: Trending viral scores and content
- **Risk Indicators**: Emerging suspicious patterns
- **News Coverage**: Topics with high news-to-social ratio

### Dashboard Integration:
- Real-time network visualization
- Source credibility heatmaps
- Viral content alerts
- Network anomaly detection
- Cross-platform correlation analysis

## Configuration

### Environment Variables:
```env
# NewsAPI Configuration
NEWS_API_KEY=your_newsapi_key

# Graph Storage
GRAPH_STORAGE=memory  # memory|neo4j|mongodb
NEO4J_URI=neo4j://localhost:7687
MONGODB_URI=mongodb://localhost:27017

# Analysis Parameters
VIRAL_THRESHOLD=0.7
CREDIBILITY_DECAY_RATE=0.1
MAX_NETWORK_SIZE=10000
```

### Algorithm Tuning:
- Adjust viral score weights based on platform
- Customize risk indicators for different regions
- Fine-tune credibility decay rates
- Configure network size limits for performance