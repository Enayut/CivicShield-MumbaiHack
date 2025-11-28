const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')
const authRoutes = require('./routes/auth')
const claimsRoutes = require('./routes/claims')
const deepfakesRoutes = require('./routes/deepfakes')
const { authenticateToken } = require('./middleware/auth')
require('dotenv').config()

// Connect to MongoDB
connectDB()

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increased limit for analysis data
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Public routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CivicShield AI Backend API', 
    version: '2.0.0',
    status: 'running',
    endpoints: [
      'POST /auth/register - User registration',
      'POST /auth/login - User login',
      'GET /dashboard - Dashboard access (protected)',
      'GET /crisis - Crisis data (protected)',
      'POST /api/claims - Submit new claim',
      'GET /api/claims - Get claims list',
      'POST /api/deepfakes - Submit deepfake analysis',
      'GET /api/deepfakes - Get deepfake analyses'
    ]
  })
})

// Auth routes (public)
app.use('/auth', authRoutes)

// API routes (accessible to agents and frontend)
app.use('/api/claims', claimsRoutes)
app.use('/api/deepfakes', deepfakesRoutes)

// Protected routes example
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Welcome to the dashboard', 
    user: req.user 
  })
})

app.get('/crisis', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Crisis data access granted', 
    user: req.user,
    data: {
      activeCrises: 5,
      responseTeams: 3,
      affectedUsers: 354000
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})