const mongoose = require('mongoose');

const deepfakeLogSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalUrl: String,
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: true
  },
  status: {
    type: String,
    enum: ['authentic', 'suspicious', 'deepfake', 'processing', 'error'],
    default: 'processing'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  analysisDetails: {
    faceSwap: Number,
    lipSync: Number,
    audioVisual: Number,
    temporal: Number,
    faceAnalysis: Number,
    metadata: Number,
    pixelAnalysis: Number
  },
  flags: [String],
  source: {
    platform: String,
    url: String,
    author: String,
    uploadedAt: Date
  },
  location: {
    country: { type: String, default: 'India' },
    state: String,
    city: String
  },
  relatedClaim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  },
  analyzedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fileSize: Number,
  duration: Number, // for videos/audio
  resolution: String, // for images/videos
  processingTime: Number, // in milliseconds
  errorMessage: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
deepfakeLogSchema.index({ status: 1, confidence: -1 });
deepfakeLogSchema.index({ createdAt: -1 });
deepfakeLogSchema.index({ 'location.state': 1 });
deepfakeLogSchema.index({ fileType: 1 });

module.exports = mongoose.model('DeepfakeLog', deepfakeLogSchema);