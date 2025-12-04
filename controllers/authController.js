const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email }
  const secret = process.env.JWT_SECRET
  
  // Check if JWT_SECRET exists
  if (!secret) {
    console.error('❌ JWT_SECRET is not defined in environment variables!')
    throw new Error('JWT_SECRET is not configured')
  }
  
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d'
  return jwt.sign(payload, secret, { expiresIn })
}

exports.register = async (req, res) => {
  try {
    console.log('📝 Registration attempt:', { 
      name: req.body.name, 
      email: req.body.email,
      hasPassword: !!req.body.password 
    })

    const { name, email, password } = req.body
    
    // Validate input
    if (!name || !email || !password) {
      console.log('❌ Missing required fields')
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      })
    }

    // Check if user exists
    console.log('🔍 Checking if user exists...')
    const existing = await User.findOne({ email })
    if (existing) {
      console.log('❌ Email already registered:', email)
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Create new user
    console.log('👤 Creating new user...')
    const user = new User({ name, email, password, role: 'user' })
    
    console.log('💾 Saving user to database...')
    await user.save()
    console.log('✅ User saved successfully:', user._id)

    // Sign token
    console.log('🔑 Signing JWT token...')
    const token = signToken(user)
    console.log('✅ Token generated successfully')

    res.status(201).json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token,
    })
    console.log('✅ Registration successful for:', email)

  } catch (err) {
    console.error('❌ Registration error:', err)
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    
    res.status(500).json({ 
      message: 'Registration failed', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
}

exports.createAdmin = async (req, res) => {
  try {
    console.log('👑 Admin creation attempt:', { 
      name: req.body.name, 
      email: req.body.email 
    })

    const { name, email, password } = req.body
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      console.log('❌ Email already registered:', email)
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = new User({ name, email, password, role: 'admin' })
    await user.save()
    
    console.log('✅ Admin created successfully:', email)
    
    res.status(201).json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    })
  } catch (err) {
    console.error('❌ Admin creation error:', err)
    res.status(500).json({ 
      message: 'Admin creation failed', 
      error: err.message 
    })
  }
}

exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email })

    const { email, password } = req.body
    
    if (!email || !password) {
      console.log('❌ Missing credentials')
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      })
    }

    console.log('🔍 Finding user...')
    const user = await User.findOne({ email })
    if (!user) {
      console.log('❌ User not found:', email)
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    console.log('✅ User found:', user._id)

    console.log('🔒 Comparing password...')
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      console.log('❌ Password mismatch')
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    console.log('✅ Password match')

    console.log('🔑 Signing token...')
    const token = signToken(user)
    console.log('✅ Token generated')

    res.json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token,
    })
    console.log('✅ Login successful for:', email)

  } catch (err) {
    console.error('❌ Login error:', err)
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    
    res.status(500).json({ 
      message: 'Login failed', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
}

exports.me = async (req, res) => {
  try {
    console.log('👤 Fetching user profile for ID:', req.user.id)
    
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      console.log('❌ User not found:', req.user.id)
      return res.status(404).json({ message: 'User not found' })
    }
    
    console.log('✅ User profile fetched:', user.email)
    res.json({ user })
    
  } catch (err) {
    console.error('❌ Profile fetch error:', err)
    res.status(500).json({ 
      message: 'Failed to load profile', 
      error: err.message 
    })
  }
}