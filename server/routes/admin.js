import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/admin/users/faculty
// @desc    Create faculty account (Admin only)
// @access  Private/Admin
router.post('/users/faculty', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ 
        error: 'Name, email, and department are required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1@';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const faculty = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'faculty',
      department,
      isActive: true,
      approvalStatus: 'approved',
    });

    res.status(201).json({
      success: true,
      message: 'Faculty account created successfully',
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
      },
      tempPassword, // In production, send via email
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ 
      error: 'Failed to create faculty',
      details: error.message 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});

// Add this to admin.js
router.post('/jobs', protect, authorize('admin'), async (req, res) => {
  try {
    const jobData = {
      recruiterId: req.user.userId,
      ...req.body,
    };
    const job = await Job.create(jobData);
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job',
      details: error.message,
    });
  }
});

router.get('/jobs', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const jobs = await Job.find(filter)
      .populate('recruiterId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Job.countDocuments(filter);
    res.json({
      success: true,
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      details: error.message,
    });
  }
});

export default router;
