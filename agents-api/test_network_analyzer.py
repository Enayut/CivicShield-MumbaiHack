#!/usr/bin/env python3
"""
CivicShield Network Analysis Agent Test Suite
Demonstrates network analysis, viral scoring, and news verification capabilities
"""

import asyncio
import httpx
import json
from datetime import datetime
import time

# Test configuration
NETWORK_ANALYZER_URL = "http://localhost:8003"
TEST_SCENARIOS = [
    {
        "name": "High-Risk Viral Content",
        "data": {
            "authorHandle": "@viraltruth2024",
            "mentions": ["@politician", "@newsoutlet", "@activist1", "@activist2"],
            "reachEstimate": 50000,
            "platform": "twitter",
            "content": "BREAKING: Secret documents reveal election manipulation! Share before they delete this! #ElectionFraud #Truth",
            "engagement": {"likes": 2500, "shares": 1200, "comments": 450},
            "hashtags": ["#ElectionFraud", "#Truth", "#Breaking"],
            "timestamp": "2024-11-27T10:30:00Z"
        }
    },
    {
        "name": "Credible News Source", 
        "data": {
            "authorHandle": "@officialnews",
            "mentions": ["@government", "@electioncommission"],
            "reachEstimate": 15000,
            "platform": "twitter",
            "content": "Election Commission announces extended voting hours in Delhi constituency due to high voter turnout.",
            "engagement": {"likes": 456, "shares": 123, "comments": 67},
            "hashtags": ["#Election2024", "#Delhi"],
            "timestamp": "2024-11-27T11:00:00Z"
        }
    },
    {
        "name": "Suspicious Bot Activity",
        "data": {
            "authorHandle": "@bot12345xyz",
            "mentions": ["@target1", "@target2", "@target3", "@target4", "@target5", "@target6"],
            "reachEstimate": 25000,
            "retweetOf": "@viraltruth2024",
            "platform": "twitter",
            "content": "RT: Secret documents reveal election manipulation! Everyone needs to see this!",
            "engagement": {"likes": 0, "shares": 890, "comments": 2},
            "hashtags": ["#ElectionFraud"],
            "timestamp": "2024-11-27T10:35:00Z"
        }
    }
]

class NetworkAnalysisTest:
    def __init__(self):
        self.results = []
        
    async def test_network_analysis(self, scenario):
        """Test network analysis endpoint"""
        print(f"\n🔍 Testing: {scenario['name']}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{NETWORK_ANALYZER_URL}/analyze/network",
                    json=scenario["data"],
                    timeout=15.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Network Analysis Successful")
                    print(f"   Viral Score: {result['viralScore']:.3f}")
                    print(f"   Author Credibility: {result['sourceUpdate']['credibilityScore']:.3f}")
                    print(f"   Risk Level: {result['sourceUpdate']['riskLevel']}")
                    print(f"   Network Connections: {result['sourceUpdate']['networkMetrics'].get('connections', 0)}")
                    
                    if result.get('riskAssessment'):
                        print(f"   Risk Factors: {', '.join(result['riskAssessment'].get('risk_factors', []))}")
                    
                    return result
                else:
                    print(f"❌ Network Analysis Failed: {response.status_code}")
                    print(f"   Error: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Network Analysis Error: {e}")
            return None
    
    async def test_news_search(self, query="election fraud voting machines"):
        """Test news search functionality"""
        print(f"\n📰 Testing News Search: '{query}'")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{NETWORK_ANALYZER_URL}/search/news",
                    json={
                        "query": query,
                        "language": "en",
                        "max_results": 10
                    },
                    timeout=20.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ News Search Successful")
                    print(f"   Total Results: {result['total_results']}")
                    
                    if result["articles"]:
                        print(f"   Top Sources: {', '.join(set([a['source'] for a in result['articles'][:3]]))}")
                        print(f"   Sample Title: {result['articles'][0]['title'][:100]}...")
                    
                    return result
                else:
                    print(f"❌ News Search Failed: {response.status_code}")
                    print(f"   Error: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ News Search Error: {e}")
            return None
    
    async def test_claim_verification(self):
        """Test claim verification with news cross-reference"""
        print(f"\n🔍 Testing Claim Verification")
        
        test_claim = {
            "claim_text": "Government is secretly using electronic voting machines to manipulate election results nationwide",
            "author_handle": "@viraltruth2024",
            "source_url": "https://twitter.com/viraltruth2024/status/123456789",
            "context_keywords": ["election", "voting", "machines", "manipulation", "fraud"]
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{NETWORK_ANALYZER_URL}/verify/claim",
                    json=test_claim,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Claim Verification Successful")
                    print(f"   Verification Score: {result['verification_score']:.3f}")
                    print(f"   Credibility: {result['credibility']}")
                    print(f"   Author Credibility: {result['author_analysis']['credibility_score']:.3f}")
                    print(f"   Viral Potential: {result['viral_potential']:.3f}")
                    print(f"   Related Articles Found: {result['news_analysis']['related_articles_found']}")
                    
                    return result
                else:
                    print(f"❌ Claim Verification Failed: {response.status_code}")
                    print(f"   Error: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Claim Verification Error: {e}")
            return None
    
    async def test_network_graph(self):
        """Test network graph generation"""
        print(f"\n🕸️ Testing Network Graph Generation")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{NETWORK_ANALYZER_URL}/network/graph",
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Network Graph Generated")
                    print(f"   Total Nodes: {result['statistics']['total_nodes']}")
                    print(f"   Total Edges: {result['statistics']['total_edges']}")
                    print(f"   Network Density: {result['statistics']['density']:.3f}")
                    print(f"   Connected Components: {result['statistics']['connected_components']}")
                    
                    # Show top nodes by credibility
                    if result["nodes"]:
                        sorted_nodes = sorted(result["nodes"], key=lambda x: x["credibility_score"], reverse=True)
                        print(f"   Top Credible Nodes:")
                        for node in sorted_nodes[:3]:
                            print(f"     • {node['id']}: {node['credibility_score']:.3f} credibility")
                    
                    return result
                else:
                    print(f"❌ Network Graph Failed: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"❌ Network Graph Error: {e}")
            return None
    
    async def check_agent_health(self):
        """Check if the agent is running"""
        print("🔍 Checking Network Analysis Agent Health...")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{NETWORK_ANALYZER_URL}/", timeout=5.0)
                
                if response.status_code == 200:
                    result = response.json()
                    print("✅ Network Analysis Agent is healthy")
                    print(f"   Status: {result.get('status', 'unknown')}")
                    print(f"   Network Size: {result.get('network_size', 0)} nodes")
                    print(f"   Total Authors: {result.get('total_authors', 0)}")
                    print(f"   News API Configured: {result.get('news_api_configured', False)}")
                    return True
                else:
                    print(f"❌ Health check failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Cannot connect to Network Analysis Agent: {e}")
            print("   Make sure the agent is running on port 8003")
            return False
    
    async def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting Network Analysis Agent Test Suite")
        print("=" * 60)
        
        # Check health first
        if not await self.check_agent_health():
            print("❌ Agent not available. Please start the agent first.")
            return
        
        # Test network analysis scenarios
        for scenario in TEST_SCENARIOS:
            result = await self.test_network_analysis(scenario)
            if result:
                self.results.append(result)
            time.sleep(1)  # Small delay between tests
        
        # Test news search
        await self.test_news_search("election voting machines fraud")
        time.sleep(1)
        
        # Test claim verification
        await self.test_claim_verification()
        time.sleep(1)
        
        # Test network graph
        await self.test_network_graph()
        
        # Summary
        print("\n" + "=" * 60)
        print("🎯 Test Summary")
        print(f"   Scenarios Tested: {len(TEST_SCENARIOS)}")
        print(f"   Successful Analyses: {len(self.results)}")
        
        if self.results:
            avg_viral_score = sum(r['viralScore'] for r in self.results) / len(self.results)
            avg_credibility = sum(r['sourceUpdate']['credibilityScore'] for r in self.results) / len(self.results)
            
            print(f"   Average Viral Score: {avg_viral_score:.3f}")
            print(f"   Average Credibility: {avg_credibility:.3f}")
            
            # Risk distribution
            risk_levels = [r['sourceUpdate']['riskLevel'] for r in self.results]
            for level in ['low', 'medium', 'high', 'critical']:
                count = risk_levels.count(level)
                if count > 0:
                    print(f"   {level.capitalize()} Risk: {count} accounts")
        
        print("\n✅ Network Analysis Agent Test Suite Complete!")

async def main():
    """Run the test suite"""
    test = NetworkAnalysisTest()
    await test.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())