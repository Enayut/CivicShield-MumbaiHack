#!/usr/bin/env python3
"""
CivicShield Agents Startup Script
Starts all monitoring agents in the correct order
"""

import subprocess
import sys
import time
import os
import signal
import asyncio
import socket
import urllib.request
from pathlib import Path

class AgentsManager:
    def __init__(self):
        self.processes = {}
        self.agents_dir = Path(__file__).parent
        
        # Agent configurations
        self.agents = [
            {
                "name": "Main Agents API",
                "file": "main.py",
                "port": 8000,
                "startup_delay": 0
            },
            {
                "name": "Text Analyzer",
                "file": "text_analyzer.py", 
                "port": 8001,
                "startup_delay": 2
            },
            {
                "name": "Twitter Monitor",
                "file": "twitter_monitor.py",
                "port": 8002,
                "startup_delay": 4
            },
            {
                "name": "Network Analyzer",
                "file": "network_analyzer.py",
                "port": 8003,
                "startup_delay": 6
            },
            {
                "name": "Deepfake Detection Agent",
                "file": "deepfake_detector.py",
                "port": 8004,
                "startup_delay": 8
            }
        ]
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print("\n🛑 Shutdown signal received. Stopping all agents...")
        self.stop_all_agents()
        sys.exit(0)
    
    def check_python_environment(self):
        """Check if Python environment is ready"""
        print("🔍 Checking Python environment...")
        
        # Check if we're in a virtual environment
        if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
            print("✅ Virtual environment detected")
        else:
            print("⚠️  Not in a virtual environment. Consider using 'python -m venv venv' and activating it.")
        
        # Check required packages
        required_packages = ['fastapi', 'uvicorn', 'httpx', 'pydantic', 'motor', 'pymongo', 'aiofiles', 'python-dotenv']
        missing_packages = []
        
        for package in required_packages:
            try:
                __import__(package)
                print(f"✅ {package} is installed")
            except ImportError:
                missing_packages.append(package)
                print(f"❌ {package} is missing")
        
        if missing_packages:
            print(f"\n📦 Install missing packages: pip install {' '.join(missing_packages)}")
            return False
        
        return True
    
    def check_ports_availability(self):
        """Check if required ports are available"""
        import socket
        
        print("🔍 Checking port availability...")
        
        for agent in self.agents:
            port = agent["port"]
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                result = sock.connect_ex(('localhost', port))
                if result == 0:
                    print(f"❌ Port {port} is already in use ({agent['name']})")
                    sock.close()
                    return False
                else:
                    print(f"✅ Port {port} is available ({agent['name']})")
                sock.close()
            except Exception as e:
                print(f"⚠️  Could not check port {port}: {e}")
        
        return True
    
    def check_external_services(self):
        """Check if external services are available"""
        print("🔍 Checking external services...")
        
        # Check Flask Deepfake Service (port 5000)
        try:
            response = urllib.request.urlopen("http://localhost:5000", timeout=3)
            if response.getcode() == 200:
                print("✅ Flask Deepfake Service is running (port 5000)")
            else:
                print("⚠️  Flask Deepfake Service returned unexpected status")
        except Exception:
            print("⚠️  Flask Deepfake Service not detected (port 5000)")
            print("   📝 To start it: cd Deepfake-detection-Ai-main/server && python app.py")
        
        # Check MongoDB (if needed)
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            result = sock.connect_ex(('localhost', 27017))
            sock.close()
            if result == 0:
                print("✅ MongoDB is running (port 27017)")
            else:
                print("⚠️  MongoDB not detected (port 27017)")
        except Exception:
            print("⚠️  MongoDB connection check failed")
    
    def start_agent(self, agent_config):
        """Start a single agent"""
        name = agent_config["name"]
        file = agent_config["file"]
        port = agent_config["port"]
        
        print(f"🚀 Starting {name} on port {port}...")
        
        try:
            # Start the agent process
            process = subprocess.Popen([
                sys.executable, file,
                "--host", "0.0.0.0",
                "--port", str(port),
                "--reload"
            ], cwd=self.agents_dir)
            
            self.processes[name] = {
                "process": process,
                "port": port,
                "file": file
            }
            
            print(f"✅ {name} started successfully (PID: {process.pid})")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start {name}: {e}")
            return False
    
    def stop_agent(self, name):
        """Stop a specific agent"""
        if name in self.processes:
            process_info = self.processes[name]
            process = process_info["process"]
            
            try:
                print(f"🛑 Stopping {name}...")
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # Force kill if it doesn't stop gracefully
                    print(f"⚠️  Force killing {name}...")
                    process.kill()
                    process.wait()
                
                print(f"✅ {name} stopped")
                del self.processes[name]
                
            except Exception as e:
                print(f"❌ Error stopping {name}: {e}")
    
    def stop_all_agents(self):
        """Stop all running agents"""
        agent_names = list(self.processes.keys())
        for name in reversed(agent_names):  # Stop in reverse order
            self.stop_agent(name)
    
    def check_agent_health(self, agent_config):
        """Check if an agent is responding"""
        import requests
        
        port = agent_config["port"]
        name = agent_config["name"]
        
        try:
            response = requests.get(f"http://localhost:{port}/", timeout=5)
            if response.status_code == 200:
                print(f"✅ {name} is healthy")
                return True
            else:
                print(f"⚠️  {name} returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ {name} health check failed: {e}")
            return False
    
    def monitor_agents(self):
        """Monitor running agents"""
        print("\n📊 Monitoring agents (Press Ctrl+C to stop)...")
        
        try:
            while True:
                print(f"\n⏰ Status check at {time.strftime('%Y-%m-%d %H:%M:%S')}")
                
                for agent_config in self.agents:
                    name = agent_config["name"]
                    
                    if name in self.processes:
                        process = self.processes[name]["process"]
                        
                        # Check if process is still running
                        if process.poll() is None:
                            # Process is running, check health
                            if not self.check_agent_health(agent_config):
                                print(f"⚠️  {name} is not responding but process is running")
                        else:
                            # Process has died
                            print(f"💀 {name} process has died")
                            del self.processes[name]
                    else:
                        print(f"⭕ {name} is not running")
                
                time.sleep(30)  # Check every 30 seconds
                
        except KeyboardInterrupt:
            print("\n🛑 Monitoring stopped")
    
    def start_all_agents(self):
        """Start all agents with proper delays"""
        print("🚀 Starting CivicShield Agents...")
        
        # Pre-flight checks
        if not self.check_python_environment():
            print("❌ Environment check failed. Please install required packages.")
            return False
        
        if not self.check_ports_availability():
            print("❌ Port availability check failed. Please free up the required ports.")
            return False
        
        # Check external services
        self.check_external_services()
        
        # Start agents with delays
        for agent_config in self.agents:
            startup_delay = agent_config.get("startup_delay", 0)
            
            if startup_delay > 0:
                print(f"⏳ Waiting {startup_delay} seconds before starting {agent_config['name']}...")
                time.sleep(startup_delay)
            
            if not self.start_agent(agent_config):
                print("❌ Failed to start agents. Stopping...")
                self.stop_all_agents()
                return False
        
        print("\n✅ All agents started successfully!")
        print("\n📋 Agent URLs:")
        for agent_config in self.agents:
            port = agent_config["port"]
            name = agent_config["name"]
            print(f"   • {name}: http://localhost:{port}")
        
        print(f"\n📚 API Documentation:")
        for agent_config in self.agents:
            port = agent_config["port"]
            name = agent_config["name"]
            print(f"   • {name}: http://localhost:{port}/docs")
        
        return True
    
    def restart_agent(self, agent_name):
        """Restart a specific agent"""
        # Find agent config
        agent_config = None
        for config in self.agents:
            if config["name"] == agent_name:
                agent_config = config
                break
        
        if not agent_config:
            print(f"❌ Agent '{agent_name}' not found")
            return False
        
        # Stop if running
        if agent_name in self.processes:
            self.stop_agent(agent_name)
            time.sleep(2)
        
        # Start again
        return self.start_agent(agent_config)

def main():
    manager = AgentsManager()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "start":
            if manager.start_all_agents():
                manager.monitor_agents()
        
        elif command == "stop":
            print("🛑 Stopping all agents...")
            manager.stop_all_agents()
            print("✅ All agents stopped")
        
        elif command == "status":
            print("📊 Checking agent status...")
            for agent_config in manager.agents:
                manager.check_agent_health(agent_config)
        
        elif command == "restart":
            if len(sys.argv) > 2:
                agent_name = sys.argv[2]
                manager.restart_agent(agent_name)
            else:
                print("🔄 Restarting all agents...")
                manager.stop_all_agents()
                time.sleep(2)
                if manager.start_all_agents():
                    manager.monitor_agents()
        
        else:
            print("❌ Unknown command")
            show_help()
    
    else:
        # Default: start and monitor
        if manager.start_all_agents():
            manager.monitor_agents()

def show_help():
    print("""
CivicShield Agents Manager

Usage:
  python start_agents.py [command]

Commands:
  start    - Start all agents and monitor (default)
  stop     - Stop all running agents
  status   - Check health status of agents
  restart  - Restart all agents
  restart <name> - Restart specific agent

Examples:
  python start_agents.py
  python start_agents.py start
  python start_agents.py restart "Text Analyzer"
  python start_agents.py stop
""")

if __name__ == "__main__":
    main()