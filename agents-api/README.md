# CivicShield Agents API

FastAPI server for high-performance agent communication and data collection.

## Features

- **High Performance**: Async FastAPI for handling thousands of agent requests
- **Real-time**: WebSocket support for live agent status updates  
- **Batch Processing**: Handle bulk data submissions efficiently
- **Auto-forwarding**: Automatically forwards data to main Node.js API
- **Agent Management**: Register, track, and monitor agent status
- **Comprehensive Docs**: Auto-generated API documentation

## Quick Start

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set environment variables** (create `.env` file):
```env
MAIN_API_URL=http://localhost:3000
AGENT_API_KEY=your-secret-key
```

3. **Run the server**:
```bash
python main.py
```

Server runs on: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Agent Management
- `POST /agents/register` - Register new monitoring agent
- `GET /agents/status` - Get all agent statuses
- `GET /agents/status/{agent_id}` - Get specific agent status
- `PUT /agents/status/{agent_id}` - Update agent status

### Data Submission
- `POST /submit/claim` - Submit misinformation claim
- `POST /submit/deepfake` - Submit deepfake detection
- `POST /submit/alert` - Submit crisis alert
- `POST /submit/batch/claims` - Submit multiple claims (max 100)

### Analytics
- `GET /analytics/summary` - Get processing summary
- `GET /health` - Health check endpoint

### Real-time
- `WS /ws/agent/{agent_id}` - WebSocket for real-time updates

## Example Usage

### Register Agent
```python
import httpx

agent_data = {
    "agent_id": "twitter-monitor-1",
    "agent_type": "social_media_monitor", 
    "status": "active",
    "last_activity": "2025-11-27T10:00:00",
    "processed_items": 0
}

async with httpx.AsyncClient() as client:
    response = await client.post("http://localhost:8000/agents/register", json=agent_data)
```

### Submit Claim
```python
claim_data = {
    "text": "Breaking: Fake news about election results",
    "platform": "twitter",
    "source_url": "https://twitter.com/user/status/123",
    "risk_level": "high",
    "category": "election"
}

async with httpx.AsyncClient() as client:
    response = await client.post("http://localhost:8000/submit/claim", json=claim_data)
```

## Integration with Main API

The FastAPI server automatically forwards all submissions to your main Node.js API at the configured `MAIN_API_URL`. This creates a seamless data pipeline:

1. **Monitoring Agents** → **FastAPI Server** → **Node.js API** → **MongoDB**
2. **Real-time Updates** → **WebSockets** → **Dashboard**

## Production Deployment

For production:
1. Use a proper ASGI server like Gunicorn with Uvicorn workers
2. Set up Redis for agent status storage
3. Configure proper CORS origins
4. Add authentication/authorization
5. Set up monitoring and logging