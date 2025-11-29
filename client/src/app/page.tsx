'use client';
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, Network, Search, FileText, Twitter, CheckCircle } from 'lucide-react';
import DashboardLayout from "@/components/dashboard-layout";

export default function CivicShieldLanding() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (showDashboard) {
    return <DashboardLayout />;
  }

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Deepfake Detection",
      description: "Advanced AI-powered detection system to identify manipulated media and protect electoral integrity"
    },
    {
      icon: <Twitter className="w-8 h-8" />,
      title: "Twitter Trending Analysis",
      description: "Real-time monitoring of social media trends and narratives affecting public discourse"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Text Analysis",
      description: "Sophisticated NLP algorithms to analyze sentiment, detect misinformation, and track narratives"
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: "Source Graph",
      description: "Visualize information networks and trace the origin of viral content across platforms"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Trending Alerts",
      description: "Instant notifications for emerging threats, viral misinformation, and critical developments"
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Election Commission Tools",
      description: "Comprehensive suite for monitoring, verification, and maintaining democratic processes"
    }
  ];

  const stats = [
    { number: "99.7%", label: "Detection Accuracy" },
    { number: "24/7", label: "Real-time Monitoring" },
    { number: "150+", label: "Election Cycles Protected" },
    { number: "<2s", label: "Average Response Time" }
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black border-b border-white' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">CIVIC SHIELD</span>
          </div>
          <div className=" text-white  md:flex items-center space-x-8">
            <a href="#features" className="hover:text-gray-400 transition-colors">Features</a>
            <a href="#technology" className="hover:text-gray-400 transition-colors">Technology</a>
            <a href="#contact" className="hover:text-gray-400 transition-colors">Contact</a>
            <button 
              onClick={() => setShowDashboard(true)}
              className="bg-white text-black px-6 py-2 font-semibold hover:bg-gray-200 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
           
          <video autoPlay muted loop className="w-full h-full object-cover opacity-30">
            <source src="/election.mp4" type="video/mp4" />
          </video>
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black opacity-60"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-6 inline-block">
            <Shield className="w-20 h-20 mx-auto animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">
            CIVIC SHIELD
          </h1>
          <p className="text-xl font-semibold md:text-2xl mb-8 text-white max-w-3xl mx-auto">
            Advanced AI-Powered Platform for Electoral Integrity, Deepfake Detection, and Democratic Protection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowDashboard(true)}
              className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Access Dashboard
            </button>
            <button className="border border-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-black transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white flex justify-center p-2">
            <div className="w-1 h-3 bg-white"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-b border-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-400 uppercase tracking-wide text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">COMPREHENSIVE PROTECTION</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete suite of tools designed to safeguard democratic processes and ensure information integrity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className=" bg-black text-white border-2 border-white p-8 hover:bg-white hover:text-black hover:border-black transition-all duration-300 group">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 group-hover:text-black">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6">CUTTING-EDGE TECHNOLOGY</h2>
              <p className="text-xl text-gray-400 mb-8">
                Built on advanced machine learning algorithms and real-time data processing to deliver unmatched accuracy and speed in threat detection.
              </p>
              <div className="space-y-4">
                {[
                  "Multi-modal AI detection systems",
                  "Real-time social media monitoring",
                  "Blockchain-verified audit trails",
                  "End-to-end encryption",
                  "Scalable cloud infrastructure"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-2 border-white p-12 aspect-square flex items-center justify-center">
              <Network className="w-full h-full opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">PROTECT DEMOCRACY TODAY</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join election commissions and organizations worldwide in safeguarding electoral integrity
          </p>
          <button 
            onClick={() => setShowDashboard(true)}
            className="bg-white text-black px-12 py-4 text-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6" />
                <span className="text-xl font-bold">CIVIC SHIELD</span>
              </div>
              <p className="text-gray-400">Protecting democratic processes through advanced technology</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">PLATFORM</h4>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Technology</div>
                <div>Security</div>
                <div>Documentation</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">CONTACT</h4>
              <div className="space-y-2 text-gray-400">
                <div>support@civicshield.com</div>
                <div>+1 (555) 123-4567</div>
                <div>24/7 Support Available</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white pt-8 text-center text-gray-400">
            <p>&copy; 2024 Civic Shield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}