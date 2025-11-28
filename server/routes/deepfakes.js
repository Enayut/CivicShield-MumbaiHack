const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// Define Deepfake Analysis schema
const deepfakeAnalysisSchema = new mongoose.Schema({
  analysisId: {
    type: String,
    required: true,
    unique: true
  },
  filename: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['image', 'video', 'audio']
  },
  analysisCategory: {
    type: String,
    required: true,
    enum: ['image', 'video_single', 'video_comprehensive']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  isDeepfake: {
    type: Boolean,
    required: true
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  detailedResults: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  processingTime: {
    type: Number,
    required: true
  },
  source: {
    platform: String,
    url: String,
    author: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'confirmed', 'false_positive'],
    default: 'pending'
  },
  reviewNotes: String,
  detectedAt: {
    type: Date,
    required: true
  },
  agentId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: Number,
    default: function() {
      return this.riskLevel === 'critical' ? 5 : 
             this.riskLevel === 'high' ? 4 : 
             this.riskLevel === 'medium' ? 2 : 1
    }
  },
  flagsDetected: [{
    type: String
  }],
  recommendations: [{
    type: String
  }]
})

// Create indexes for better performance
deepfakeAnalysisSchema.index({ analysisId: 1 })
deepfakeAnalysisSchema.index({ riskLevel: 1, createdAt: -1 })
deepfakeAnalysisSchema.index({ isDeepfake: 1, confidence: -1 })
deepfakeAnalysisSchema.index({ 'source.platform': 1 })

const DeepfakeAnalysis = mongoose.model('DeepfakeAnalysis', deepfakeAnalysisSchema)

// Routes
router.post('/', async (req, res) => {
  try {
    const {
      analysisId,
      filename,
      fileType,
      analysisCategory,
      confidence,
      isDeepfake,
      riskLevel,
      detailedResults,
      processingTime,
      source,
      metadata,
      timestamp,
      detectedAt,
      agentId
    } = req.body

    // Validate required fields
    if (!analysisId || !filename || !fileType || !analysisCategory) {
      return res.status(400).json({
        error: 'analysisId, filename, fileType, and analysisCategory are required'
      })
    }

    // Check if analysis already exists
    const existingAnalysis = await DeepfakeAnalysis.findOne({ analysisId })
    if (existingAnalysis) {
      return res.status(409).json({
        error: 'Analysis with this ID already exists',
        existingAnalysisId: analysisId
      })
    }

    // Extract recommendations and flags from detailed results
    const flagsDetected = []
    const recommendations = []
    
    if (detailedResults) {
      if (detailedResults.flags_detected) {
        flagsDetected.push(...detailedResults.flags_detected)
      }
      if (detailedResults.recommendations) {
        recommendations.push(...detailedResults.recommendations)
      }
    }

    // Create new deepfake analysis record
    const newAnalysis = new DeepfakeAnalysis({
      analysisId,
      filename,
      fileType,
      analysisCategory,
      confidence: parseFloat(confidence),
      isDeepfake: Boolean(isDeepfake),
      riskLevel,
      detailedResults,
      processingTime: parseFloat(processingTime),
      source: source || {},
      metadata: metadata || {},
      detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
      agentId: agentId || 'unknown',
      flagsDetected,
      recommendations
    })

    const savedAnalysis = await newAnalysis.save()

    // Log high-risk detections
    if (riskLevel === 'critical' || riskLevel === 'high') {
      console.log(`🚨 HIGH-RISK DEEPFAKE DETECTED: ${analysisId} - Confidence: ${confidence} - Risk: ${riskLevel}`)
    }

    res.status(201).json({
      message: 'Deepfake analysis submitted successfully',
      analysisId: savedAnalysis.analysisId,
      confidence: savedAnalysis.confidence,
      isDeepfake: savedAnalysis.isDeepfake,
      riskLevel: savedAnalysis.riskLevel,
      priority: savedAnalysis.priority,
      mongoId: savedAnalysis._id
    })

  } catch (error) {
    console.error('Error creating deepfake analysis:', error)
    res.status(500).json({
      error: 'Failed to create deepfake analysis',
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
      fileType,
      analysisCategory,
      isDeepfake,
      agentId,
      status
    } = req.query

    // Build filter query
    const filter = {}
    if (riskLevel) filter.riskLevel = riskLevel
    if (fileType) filter.fileType = fileType
    if (analysisCategory) filter.analysisCategory = analysisCategory
    if (isDeepfake !== undefined) filter.isDeepfake = isDeepfake === 'true'
    if (agentId) filter.agentId = agentId
    if (status) filter.status = status

    // Calculate skip value
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Get analyses with pagination
    const analyses = await DeepfakeAnalysis.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-detailedResults -__v') // Exclude heavy detailed results in list view

    // Get total count for pagination
    const totalAnalyses = await DeepfakeAnalysis.countDocuments(filter)
    const totalPages = Math.ceil(totalAnalyses / parseInt(limit))

    // Get summary statistics
    const stats = await DeepfakeAnalysis.aggregate([
      { $group: {
        _id: {
          riskLevel: '$riskLevel',
          isDeepfake: '$isDeepfake'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }},
      { $sort: { '_id.riskLevel': 1 }}
    ])

    res.json({
      analyses,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalAnalyses,
        itemsPerPage: parseInt(limit)
      },
      statistics: {
        breakdown: stats,
        totalAnalyses
      }
    })

  } catch (error) {
    console.error('Error fetching deepfake analyses:', error)
    res.status(500).json({
      error: 'Failed to fetch deepfake analyses',
      details: error.message
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    let analysis;
    
    // Check if id is MongoDB ObjectId or analysisId
    if (mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24) {
      analysis = await DeepfakeAnalysis.findById(req.params.id).select('-__v')
    } else {
      analysis = await DeepfakeAnalysis.findOne({ analysisId: req.params.id }).select('-__v')
    }
    
    if (!analysis) {
      return res.status(404).json({
        error: 'Deepfake analysis not found'
      })
    }

    res.json(analysis)

  } catch (error) {
    console.error('Error fetching deepfake analysis:', error)
    res.status(500).json({
      error: 'Failed to fetch deepfake analysis',
      details: error.message
    })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const { status, reviewNotes } = req.body

    if (!status || !['pending', 'reviewed', 'confirmed', 'false_positive'].includes(status)) {
      return res.status(400).json({
        error: 'Valid status is required'
      })
    }

    const updateData = {
      status,
      updatedAt: new Date()
    }

    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes
    }

    let updatedAnalysis;
    
    // Check if id is MongoDB ObjectId or analysisId
    if (mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24) {
      updatedAnalysis = await DeepfakeAnalysis.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
    } else {
      updatedAnalysis = await DeepfakeAnalysis.findOneAndUpdate(
        { analysisId: req.params.id },
        updateData,
        { new: true, runValidators: true }
      )
    }

    if (!updatedAnalysis) {
      return res.status(404).json({
        error: 'Deepfake analysis not found'
      })
    }

    res.json({
      message: 'Analysis status updated successfully',
      analysis: updatedAnalysis
    })

  } catch (error) {
    console.error('Error updating analysis status:', error)
    res.status(500).json({
      error: 'Failed to update analysis status',
      details: error.message
    })
  }
})

router.get('/stats/dashboard', async (req, res) => {
  try {
    // Get basic statistics
    const totalAnalyses = await DeepfakeAnalysis.countDocuments()
    const deepfakeCount = await DeepfakeAnalysis.countDocuments({ isDeepfake: true })
    const criticalAnalyses = await DeepfakeAnalysis.countDocuments({ riskLevel: 'critical' })
    const pendingReviews = await DeepfakeAnalysis.countDocuments({ status: 'pending' })
    
    // Get analyses by risk level
    const riskStats = await DeepfakeAnalysis.aggregate([
      { $group: {
        _id: '$riskLevel',
        count: { $sum: 1 },
        deepfakeCount: { 
          $sum: { $cond: [{ $eq: ['$isDeepfake', true] }, 1, 0] }
        },
        avgConfidence: { $avg: '$confidence' }
      }}
    ])

    // Get analyses by file type
    const fileTypeStats = await DeepfakeAnalysis.aggregate([
      { $group: {
        _id: '$fileType',
        count: { $sum: 1 },
        deepfakeCount: { 
          $sum: { $cond: [{ $eq: ['$isDeepfake', true] }, 1, 0] }
        }
      }}
    ])

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentAnalyses = await DeepfakeAnalysis.countDocuments({
      createdAt: { $gte: oneDayAgo }
    })

    // Get confidence distribution
    const confidenceStats = await DeepfakeAnalysis.aggregate([
      { $bucket: {
        groupBy: '$confidence',
        boundaries: [0, 0.3, 0.6, 0.8, 1.0],
        default: 'other',
        output: {
          count: { $sum: 1 },
          deepfakeCount: { 
            $sum: { $cond: [{ $eq: ['$isDeepfake', true] }, 1, 0] }
          }
        }
      }}
    ])

    res.json({
      overview: {
        totalAnalyses,
        deepfakeCount,
        authenticity: {
          authentic: totalAnalyses - deepfakeCount,
          suspicious: deepfakeCount,
          authenticityRate: totalAnalyses > 0 ? ((totalAnalyses - deepfakeCount) / totalAnalyses * 100).toFixed(1) : 0
        },
        criticalAnalyses,
        pendingReviews,
        recentAnalyses
      },
      distribution: {
        byRiskLevel: riskStats.reduce((acc, item) => {
          acc[item._id] = {
            total: item.count,
            deepfakes: item.deepfakeCount,
            avgConfidence: parseFloat(item.avgConfidence.toFixed(3))
          }
          return acc
        }, {}),
        byFileType: fileTypeStats.reduce((acc, item) => {
          acc[item._id] = {
            total: item.count,
            deepfakes: item.deepfakeCount
          }
          return acc
        }, {}),
        byConfidence: confidenceStats
      }
    })

  } catch (error) {
    console.error('Error fetching deepfake dashboard stats:', error)
    res.status(500).json({
      error: 'Failed to fetch deepfake dashboard statistics',
      details: error.message
    })
  }
})

router.get('/stats/trends', async (req, res) => {
  try {
    const { period = '7d' } = req.query
    
    // Calculate date range based on period
    let startDate
    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get daily trends
    const dailyTrends = await DeepfakeAnalysis.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalAnalyses: { $sum: 1 },
        deepfakeCount: { 
          $sum: { $cond: [{ $eq: ['$isDeepfake', true] }, 1, 0] }
        },
        highRiskCount: { 
          $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0] }
        },
        avgConfidence: { $avg: '$confidence' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])

    res.json({
      period,
      trends: dailyTrends.map(trend => ({
        date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
        totalAnalyses: trend.totalAnalyses,
        deepfakeCount: trend.deepfakeCount,
        highRiskCount: trend.highRiskCount,
        avgConfidence: parseFloat(trend.avgConfidence.toFixed(3)),
        authenticityRate: ((trend.totalAnalyses - trend.deepfakeCount) / trend.totalAnalyses * 100).toFixed(1)
      }))
    })

  } catch (error) {
    console.error('Error fetching deepfake trends:', error)
    res.status(500).json({
      error: 'Failed to fetch deepfake trends',
      details: error.message
    })
  }
})

module.exports = router