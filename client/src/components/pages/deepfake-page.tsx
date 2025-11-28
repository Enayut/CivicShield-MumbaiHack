import React, { useState, ChangeEvent } from 'react';
import { Upload, Shield, AlertTriangle, CheckCircle, Eye, Camera, FileVideo, Download, RefreshCw, Filter } from 'lucide-react';

// Define interfaces for type safety
interface DetectionDetails {
  faceSwap?: number;
  lipSync?: number;
  audioVisual?: number;
  temporal?: number;
  faceAnalysis?: number;
  metadata?: number;
  pixelAnalysis?: number;
}

interface DetectionResult {
  id: number;
  filename: string;
  uploadTime: string;
  status: 'authentic' | 'suspicious' | 'deepfake';
  confidence: number;
  type: 'video' | 'image';
  details: DetectionDetails;
  flags: string[];
}

const DeepfakePage = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectionResult | null>(null);

  // Hardcoded detection results for demo
  const mockResults: DetectionResult[] = [
    {
      id: 1,
      filename: "political_speech_video.mp4",
      uploadTime: "2025-01-15 14:30:22",
      status: "suspicious",
      confidence: 87.3,
      type: "video",
      details: {
        faceSwap: 92.1,
        lipSync: 78.5,
        audioVisual: 89.7,
        temporal: 85.2
      },
      flags: ["Facial inconsistencies detected", "Audio-visual mismatch", "Compression artifacts"]
    },
    {
      id: 2,
      filename: "candidate_interview.jpg",
      uploadTime: "2025-01-15 13:45:11",
      status: "authentic",
      confidence: 95.8,
      type: "image",
      details: {
        faceAnalysis: 96.2,
        metadata: 94.1,
        pixelAnalysis: 97.3
      },
      flags: []
    },
    {
      id: 3,
      filename: "rally_footage.mp4",
      uploadTime: "2025-01-15 12:20:33",
      status: "deepfake",
      confidence: 96.4,
      type: "video",
      details: {
        faceSwap: 97.8,
        lipSync: 94.2,
        audioVisual: 96.1,
        temporal: 97.1
      },
      flags: ["High probability deepfake", "Face replacement detected", "Synthetic audio patterns"]
    }
  ];

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAnalyzing(true);
      // Simulate analysis
      setTimeout(() => {
        setAnalyzing(false);
        setResults(mockResults[0]); // Show first result for demo
      }, 3000);
    }
  };

  const getStatusColor = (status: DetectionResult['status']) => {
    switch (status) {
      case 'authentic': return 'text-green-500 dark:text-green-400';
      case 'suspicious': return 'text-yellow-500 dark:text-yellow-400';
      case 'deepfake': return 'text-red-500 dark:text-red-400';
      default: return 'text-text-500 dark:text-text-400';
    }
  };

  const getStatusBg = (status: DetectionResult['status']) => {
    switch (status) {
      case 'authentic': return 'bg-green-500/20 dark:bg-green-500/20';
      case 'suspicious': return 'bg-yellow-500/20 dark:bg-yellow-500/20';
      case 'deepfake': return 'bg-red-500/20 dark:bg-red-500/20';
      default: return 'bg-background/20 dark:bg-background/20';
    }
  };

  const getStatusIcon = (status: DetectionResult['status']) => {
    switch (status) {
      case 'authentic': return <CheckCircle className="w-3 h-3" />;
      case 'suspicious': return <AlertTriangle className="w-3 h-3" />;
      case 'deepfake': return <Shield className="w-3 h-3" />;
      default: return <Eye className="w-3 h-3" />;
    }
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence > 90) return 'bg-red-500';
    if (confidence > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-background text-text-900 dark:text-text-100">
      {/* Header */}
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-900 dark:text-text-100 mb-1 mt-3">Deepfake Detector</h1>
            {/* <p className="text-text-600 dark:text-text-400 text-base">AI-powered detection of manipulated media in election content</p> */}
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-lg shadow-xl border border-border/20 text-sm text-text-700 dark:text-text-300 rounded-lg hover:bg-background/80 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-lg shadow-xl border border-border/20 text-sm text-text-700 dark:text-text-300 rounded-lg hover:bg-background/80 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-lg shadow-xl border border-border/20 text-sm text-text-700 dark:text-text-300 rounded-lg hover:bg-background/80 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Upload & Analysis Section */}
          <div className="xl:col-span-2">
            <div className="bg-background/60 backdrop-blur-lg rounded-lg border border-border/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="w-5 h-5 text-text-900 dark:text-text-100" />
                <h2 className="text-lg font-medium text-text-900 dark:text-text-100">Media Upload & Analysis</h2>
              </div>
              <p className="text-sm text-text-600 dark:text-text-400 mb-4">Upload images or videos to detect potential deepfakes and manipulation</p>
              
              <div className="border-2 border-dashed border-border/20 rounded-lg p-8 text-center hover:border-primary-600 transition-colors mb-4">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    {analyzing ? (
                      <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-10 h-10 text-text-500 dark:text-text-400" />
                        <div>
                          <p className="text-text-900 dark:text-text-100 font-medium mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-text-600 dark:text-text-400 text-sm">
                            Images: JPG, PNG, WEBP • Videos: MP4, AVI, MOV
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {analyzing && (
                <div className="p-3 bg-background/60 backdrop-blur-lg border border-border/20 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
                    <div>
                      <p className="font-medium text-text-900 dark:text-text-100 text-sm">Analyzing Media</p>
                      <p className="text-xs text-text-600 dark:text-text-400">Processing deepfake detection algorithms...</p>
                    </div>
                  </div>
                </div>
              )}

              {results && (
                <div className="border border-border/20 rounded-lg p-4 bg-background/60 backdrop-blur-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileVideo className="w-4 h-4 text-text-900 dark:text-text-100" />
                      <span className="font-medium text-text-900 dark:text-text-100 text-sm">{results.filename}</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(results.status)} ${getStatusBg(results.status)}`}>
                      {getStatusIcon(results.status)}
                      {results.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-text-600 dark:text-text-400 mb-1">Confidence Score</p>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold text-text-900 dark:text-text-100">{results.confidence}%</div>
                        <div className="flex-1 bg-border/40 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${getConfidenceBarColor(results.confidence)}`}
                            style={{ width: `${results.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-text-600 dark:text-text-400 mb-1">Upload Time</p>
                      <p className="text-xs text-text-900 dark:text-text-100">{results.uploadTime}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-text-600 dark:text-text-400 mb-2">Detection Details</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(results.details).map(([key, value]) => (
                        <div key={key} className="bg-background/40 p-2 rounded border border-border/10">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-text-600 dark:text-text-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-xs font-medium text-text-900 dark:text-text-100">{value}%</span>
                          </div>
                          <div className="w-full bg-border/40 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${value && value > 90 ? 'bg-red-500' : value && value > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {results.flags.length > 0 && (
                    <div>
                      <p className="text-xs text-text-600 dark:text-text-400 mb-2">Detection Flags</p>
                      <div className="space-y-1">
                        {results.flags.map((flag, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs bg-red-500/20 text-red-500 dark:text-red-400 p-2 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            {flag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detection Stats */}
          <div className="xl:col-span-1">
            <div className="bg-background/60 backdrop-blur-lg rounded-lg border border-border/20 p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-text-900 dark:text-text-100">Detection Stats</h2>
              </div>
              <p className="text-sm text-text-600 dark:text-text-400 mb-4">Real-time detection statistics and threat levels</p>
              
              <div className="space-y-3">
                <div className="p-3 bg-background/40 rounded border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-900 dark:text-text-100 font-medium text-sm">Total Scanned</span>
                    <span className="text-xl font-semibold text-text-900 dark:text-text-100">1,247</span>
                  </div>
                  <div className="text-xs text-green-500">+12% incidents</div>
                </div>

                <div className="p-3 bg-background/60 backdrop-blur-lg rounded border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-900 dark:text-text-100 font-medium text-sm">Deepfakes Found</span>
                    <span className="text-xl font-semibold text-text-900 dark:text-text-100">23</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="text-xs text-red-500">Critical</div>
                    <div className="text-xs text-red-500 ml-auto">+8% incidents</div>
                  </div>
                </div>

                <div className="p-3 bg-background/40 rounded border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-900 dark:text-text-100 font-medium text-sm">Suspicious</span>
                    <span className="text-xl font-semibold text-text-900 dark:text-text-100">89</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="text-xs text-yellow-500">High</div>
                    <div className="text-xs text-yellow-500 ml-auto">-3% incidents</div>
                  </div>
                </div>

                <div className="p-3 bg-background/60 backdrop-blur-lg rounded border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-900 dark:text-text-100 font-medium text-sm">Authentic</span>
                    <span className="text-xl font-semibold text-text-900 dark:text-text-100">1,135</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="text-xs text-green-500">Low</div>
                    <div className="text-xs text-green-500 ml-auto">-15% incidents</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-background/60 backdrop-blur-lg rounded-lg border border-border/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-text-900 dark:text-text-100">Recent Activity</h2>
                <button className="text-xs text-text-600 dark:text-text-400 hover:text-text-900 dark:hover:text-text-100 transition-colors">View All →</button>
              </div>
              <p className="text-sm text-text-600 dark:text-text-400 mb-4">Latest detection results and analysis</p>

              <div className="space-y-2">
                {mockResults.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 bg-background/40 rounded border border-border/20 hover:bg-background/60 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {item.type === 'video' ? <FileVideo className="w-3 h-3 text-text-600 dark:text-text-400" /> : <Camera className="w-3 h-3 text-text-600 dark:text-text-400" />}
                        <span className="text-xs text-text-900 dark:text-text-100 font-medium truncate">{item.filename.substring(0, 18)}...</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${getStatusColor(item.status)} ${getStatusBg(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-600 dark:text-text-400">{item.uploadTime}</span>
                      <span className="text-xs text-text-900 dark:text-text-100 font-medium">{item.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepfakePage;