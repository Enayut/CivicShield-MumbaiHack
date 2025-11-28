const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      retryWrites: true
    });
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create initial users
    const users = [
      {
        email: 'admin@civicshield.ai',
        password: 'admin123',
        name: 'Admin User',
        organization: 'CivicShield AI',
        location: 'New Delhi, India',
        phone: '+91 98765 43210',
        bio: 'System administrator with full access to all features'
      },
      {
        email: 'priya.sharma@civicshield.ai',
        password: 'crisis123',
        name: 'Priya Sharma',
        organization: 'Election Commission of India',
        location: 'New Delhi, India',
        phone: '+91 98765 43211',
        bio: 'Crisis management specialist with 8+ years of experience in election monitoring and threat response coordination.'
      },
      {
        email: 'user@civicshield.ai',
        password: 'user123',
        name: 'Test User',
        organization: 'Test Organization',
        location: 'Mumbai, India',
        phone: '+91 98765 43212',
        bio: 'Regular user for testing purposes'
      },
      {
        email: 'analyst@civicshield.ai',
        password: 'analyst123',
        name: 'Data Analyst',
        organization: 'CivicShield AI',
        location: 'Bengaluru, India',
        phone: '+91 98765 43213',
        bio: 'Data analyst specializing in misinformation pattern detection'
      }
    ];

    // Create users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email}`);
    }

    console.log('Database seeded successfully!');
    
    // Print login credentials
    console.log('\n=== LOGIN CREDENTIALS ===');
    users.forEach(user => {
      console.log(`Email: ${user.email} | Password: ${user.password}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedUsers();