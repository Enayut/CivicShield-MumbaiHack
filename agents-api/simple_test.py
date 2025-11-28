"""
Simple Network Analysis Agent Test (MongoDB version)
"""

import requests
import json
import time

def test_network_analyzer():
    base_url = "http://localhost:8003"
    
    print("🧪 Testing Network Analysis Agent (MongoDB version)")
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Agent is healthy")
            data = response.json()
            print(f"   Network size: {data.get('network_size', 0)}")
            print(f"   MongoDB connected: {data.get('mongodb_connected', False)}")
        else:
            print("❌ Agent health check failed")
            return
    except Exception as e:
        print(f"❌ Cannot connect to agent: {e}")
        return
    
    # Test network analysis
    test_data = {
        "authorHandle": "@testuser",
        "mentions": ["@politician", "@newsoutlet"],
        "reachEstimate": 10000,
        "content": "Breaking news about election fraud!",
        "engagement": {"likes": 500, "shares": 200, "comments": 50}
    }
    
    try:
        response = requests.post(f"{base_url}/analyze/network", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Network analysis successful")
            print(f"   Viral Score: {result['viralScore']:.3f}")
            print(f"   Credibility: {result['sourceUpdate']['credibilityScore']:.3f}")
            print(f"   Risk Level: {result['sourceUpdate']['riskLevel']}")
            print(f"   Network Connections: {result['sourceUpdate']['networkMetrics'].get('connections', 0)}")
        else:
            print(f"❌ Network analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Network analysis error: {e}")
    
    # Test news search
    try:
        response = requests.post(f"{base_url}/search/news", json={"query": "election voting", "max_results": 5})
        if response.status_code == 200:
            result = response.json()
            print("✅ News search successful")
            print(f"   Found {result['total_results']} articles")
            if result["articles"]:
                print(f"   Sample: {result['articles'][0]['title'][:50]}...")
        else:
            print(f"❌ News search failed: {response.status_code}")
    except Exception as e:
        print(f"❌ News search error: {e}")
    
    # Test network graph
    try:
        response = requests.get(f"{base_url}/network/graph")
        if response.status_code == 200:
            result = response.json()
            print("✅ Network graph generated")
            print(f"   Nodes: {result['statistics']['total_nodes']}")
            print(f"   Edges: {result['statistics']['total_edges']}")
            print(f"   Density: {result['statistics']['density']:.3f}")
        else:
            print(f"❌ Network graph failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Network graph error: {e}")
    
    # Test claim verification
    try:
        claim_data = {
            "claim_text": "Voting machines are being hacked to change election results",
            "author_handle": "@suspicious_user",
            "context_keywords": ["voting", "machines", "election", "fraud"]
        }
        response = requests.post(f"{base_url}/verify/claim", json=claim_data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Claim verification successful")
            print(f"   Verification Score: {result['verification_score']:.3f}")
            print(f"   Credibility: {result['credibility']}")
            print(f"   Viral Potential: {result['viral_potential']:.3f}")
        else:
            print(f"❌ Claim verification failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Claim verification error: {e}")

if __name__ == "__main__":
    test_network_analyzer()