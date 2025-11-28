const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved', 'escalated'],
    default: 'active'
  },
  location: {
    country: { type: String, default: 'India' },
    state: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  affectedUsers: {
    type: Number,
    default: 0
  },
  platform: {
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'whatsapp', 'telegram', 'multiple', 'other']
  },
  category: {
    type: String,
    enum: ['deepfake', 'bot_network', 'misinformation', 'impersonation', 'hate_speech', 'other'],
    required: true
  },
  relatedClaims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseTeam: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  actions: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  resolvedAt: Date,
  escalatedAt: Date
}, {
  timestamps: true
});

// Index for better performance
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ 'location.state': 1, 'location.city': 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ category: 1 });

module.exports = mongoose.model('Alert', alertSchema);