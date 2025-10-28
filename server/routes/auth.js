import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { generateToken } from '../utils/jwt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    // Only allow student and recruiter self-registration
    const allowedRoles = ['student', 'recruiter'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(403).json({ 
        error: 'You can only register as student or recruiter' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Students active immediately, recruiters need approval
    const isStudentRole = !role || role === 'student';

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department: department || '',
      isActive: isStudentRole,
      approvalStatus: isStudentRole ? 'approved' : 'pending',
    });

    const message = isStudentRole 
      ? 'Registration successful! You can now login.'
      : 'Registration successful! Your account is pending admin approval.';

    res.status(201).json({
      success: true,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register user',
      details: error.message 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Check for extra fields (strict validation)
    const allowedFields = ['email', 'password'];
    const receivedFields = Object.keys(req.body);
    const extraFields = receivedFields.filter(field => !allowedFields.includes(field));

    if (extraFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: `Invalid fields: ${extraFields.join(', ')}. Only email and password are allowed.`
      });
    }
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      if (user.approvalStatus === 'pending') {
        return res.status(403).json({ 
          error: 'Your account is pending approval' 
        });
      }
      return res.status(403).json({ 
        error: 'Your account is inactive' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set HTTPOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        lastLogin: user.lastLogin,
      },
      token, // Include token for testing purposes
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to login',
      details: error.message 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.status(200).json({ 
    success: true,
    message: 'Logout successful' 
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      details: error.message 
    });
  }
});

export default router;
