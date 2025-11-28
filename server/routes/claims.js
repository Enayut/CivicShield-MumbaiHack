const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// Define Claim schema
const claimSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 5000
  },
  source: {
    platform: {
      type: String,
      required: true,
      enum: ['twitter', 'facebook', 'instagram', 'whatsapp', 'telegram', 'other']
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
  region: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  engagement: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['election', 'candidate', 'voting_process', 'evm', 'results', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'debunked', 'investigating'],
    default: 'pending'
  },
  verificationResults: {
    confidence: Number,
    factCheckResult: String,
    sources: [String],
    verdict: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  submittedBy: {
    type: String,
    default: 'system'
  },
  priority: {
    type: Number,
    default: 1
  }
})

const Claim = mongoose.model('Claim', claimSchema)

// Routes
router.post('/', async (req, res) => {
  try {
    const {
      text,
      source,
      riskLevel,
      region,
      engagement,
      tags,
      category
    } = req.body

    // Validate required fields
    if (!text || !source?.platform) {
      return res.status(400).json({
        error: 'Text and source platform are required'
      })
    }

    // Create new claim
    const newClaim = new Claim({
      text: text.trim(),
      source,
      riskLevel: riskLevel || 'medium',
      region: region || {},
      engagement: engagement || {},
      tags: tags || [],
      category: category || 'other',
      priority: riskLevel === 'critical' ? 5 : 
                riskLevel === 'high' ? 4 : 
                riskLevel === 'medium' ? 2 : 1,
      submittedBy: 'agents-api'
    })

    const savedClaim = await newClaim.save()

    res.status(201).json({
      message: 'Claim submitted successfully',
      claimId: savedClaim._id,
      status: 'pending',
      priority: savedClaim.priority,
      riskLevel: savedClaim.riskLevel
    })

  } catch (error) {
    console.error('Error creating claim:', error)
    res.status(500).json({
      error: 'Failed to create claim',
      details: error.message
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      riskLevel,
      category,
      status,
      platform
    } = req.query

    // Build filter query
    const filter = {}
    if (riskLevel) filter.riskLevel = riskLevel
    if (category) filter.category = category
    if (status) filter.status = status
    if (platform) filter['source.platform'] = platform

    // Calculate skip value
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Get claims with pagination
    const claims = await Claim.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count for pagination
    const totalClaims = await Claim.countDocuments(filter)
    const totalPages = Math.ceil(totalClaims / parseInt(limit))

    // Get summary statistics
    const stats = await Claim.aggregate([
      { $group: {
        _id: '$riskLevel',
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 }}
    ])

    res.json({
      claims,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalClaims,
        itemsPerPage: parseInt(limit)
      },
      statistics: {
        riskLevels: stats,
        totalClaims
      }
    })

  } catch (error) {
    console.error('Error fetching claims:', error)
    res.status(500).json({
      error: 'Failed to fetch claims',
      details: error.message
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).select('-__v')
    
    if (!claim) {
      return res.status(404).json({
        error: 'Claim not found'
      })
    }

    res.json(claim)

  } catch (error) {
    console.error('Error fetching claim:', error)
    res.status(500).json({
      error: 'Failed to fetch claim',
      details: error.message
    })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const { status, verificationResults } = req.body

    if (!status || !['pending', 'verified', 'debunked', 'investigating'].includes(status)) {
      return res.status(400).json({
        error: 'Valid status is required'
      })
    }

    const updateData = {
      status,
      updatedAt: new Date()
    }

    if (verificationResults) {
      updateData.verificationResults = verificationResults
    }

    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedClaim) {
      return res.status(404).json({
        error: 'Claim not found'
      })
    }

    res.json({
      message: 'Claim status updated successfully',
      claim: updatedClaim
    })

  } catch (error) {
    console.error('Error updating claim status:', error)
    res.status(500).json({
      error: 'Failed to update claim status',
      details: error.message
    })
  }
})

router.get('/stats/dashboard', async (req, res) => {
  try {
    // Get basic statistics
    const totalClaims = await Claim.countDocuments()
    const criticalClaims = await Claim.countDocuments({ riskLevel: 'critical' })
    const pendingClaims = await Claim.countDocuments({ status: 'pending' })
    
    // Get claims by risk level
    const riskStats = await Claim.aggregate([
      { $group: {
        _id: '$riskLevel',
        count: { $sum: 1 }
      }}
    ])

    // Get claims by platform
    const platformStats = await Claim.aggregate([
      { $group: {
        _id: '$source.platform',
        count: { $sum: 1 }
      }}
    ])

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentClaims = await Claim.countDocuments({
      createdAt: { $gte: oneDayAgo }
    })

    res.json({
      overview: {
        totalClaims,
        criticalClaims,
        pendingClaims,
        recentClaims
      },
      distribution: {
        byRiskLevel: riskStats.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        byPlatform: platformStats.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      details: error.message
    })
  }
})

module.exports = router