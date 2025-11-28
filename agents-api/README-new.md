# CivicShield Agents API

High-performance monitoring agents for misinformation detection and crisis management.

## 🏗️ Architecture

The CivicShield Agents API consists of multiple specialized agents:

- **Main Agents API** (Port 8000) - Central coordination and data forwarding
- **Text Analyzer Agent** (Port 8001) - AI-powered text analysis with Google Fact Check API
- **Twitter Monitor Agent** (Port 8002) - Real-time Twitter monitoring for viral misinformation

## 🚀 Quick Start

### Prerequisites

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Download spaCy model for text analysis
python -m spacy download en_core_web_sm
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Google Fact Check API
GOOGLE_OAUTH2_CLIENT_ID=your_client_id
GOOGLE_OAUTH2_CLIENT_SECRET=your_client_secret

# Twitter API (optional - uses mock data without)
TWITTER_BEARER_TOKEN=your_bearer_token

# Main API integration
MAIN_API_URL=http://localhost:3000
AGENT_API_KEY=agent-secret-key
```

### Starting All Agents

```bash
# Start all agents with monitoring
python start_agents.py start

# Or individual agents
python main.py              # Main API (port 8000)
python text_analyzer.py     # Text analyzer (port 8001) 
python twitter_monitor.py   # Twitter monitor (port 8002)
```

## 📊 Agent Details

### Text Analyzer Agent (port 8001)

AI-powered text analysis for misinformation detection.

**Analysis Features:**
- Rule-based fake news pattern detection  
- Google Fact Check API integration
- Named Entity Recognition (NER)
- Confidence scoring and risk assessment

### Twitter Monitor Agent (port 8002) 

Real-time Twitter monitoring for viral misinformation detection.

**Monitoring Features:**
- Keyword-based content monitoring
- Engagement-based risk assessment
- Automated claim submission
- Mock data simulation (when Twitter API unavailable)

## 🔬 Testing

### Test Text Analysis

```bash
curl -X POST "http://localhost:8001/analyze/text" \
-H "Content-Type: application/json" \
-d '{"text": "BREAKING: Shocking election fraud discovered!"}'
```

### Test Twitter Monitoring

```bash
# Start monitoring
curl -X POST "http://localhost:8002/start" \
-H "Content-Type: application/json" \
-d '{"keywords": ["election", "fraud"], "min_engagement": 50}'

# Simulate tweet check  
curl -X GET "http://localhost:8002/simulate/check"
```

## 📚 API Documentation

Full interactive API documentation available at:
- Main API: http://localhost:8000/docs
- Text Analyzer: http://localhost:8001/docs
- Twitter Monitor: http://localhost:8002/docs