const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    platform: {
      type: String,
      enum: ['twitter', 'facebook', 'instagram', 'whatsapp', 'telegram', 'other'],
      required: true
    },
    url: String,
    author: String,
    authorId: String
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'verified', 'debunked', 'escalated', 'resolved'],
    default: 'pending'
  },
  deepfakeStatus: {
    type: String,
    enum: ['none', 'suspected', 'confirmed', 'not_applicable'],
    default: 'none'
  },
  factCheck: {
    result: {
      type: String,
      enum: ['true', 'false', 'mixed', 'unverified', 'pending'],
      default: 'pending'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    sources: [String],
    checkedBy: String,
    checkedAt: Date,
    reasoning: String
  },
  region: {
    country: { type: String, default: 'India' },
    state: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  engagement: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  tags: [String],
  category: {
    type: String,
    enum: ['election', 'candidate', 'voting_process', 'evm', 'results', 'other'],
    default: 'other'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
claimSchema.index({ text: 'text' });
claimSchema.index({ riskLevel: 1, status: 1 });
claimSchema.index({ 'region.state': 1, 'region.city': 1 });
claimSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Claim', claimSchema);