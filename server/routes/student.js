import express from 'express';
import { StudentProfile, User } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// STUDENT-ONLY ROUTES
// ============================================

// @route   POST /api/student/profile
// @desc    Create student profile
// @access  Private/Student
router.post('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(409).json({ 
        success: false,
        error: 'Profile already exists. Use PUT to update.' 
      });
    }

    const profileData = {
      user: userId, // Changed from userId to user to match your model
      ...req.body,
    };

    const profile = await StudentProfile.create(profileData);
    await profile.populate('user', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile,
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create profile',
      details: error.message 
    });
  }
});

// @route   GET /api/student/profile/me
// @desc    Get my profile
// @access  Private/Student
router.get('/profile/me', protect, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.userId })
      .populate('user', 'name email department');

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        error: 'Profile not found. Please create your profile first.' 
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile',
      details: error.message 
    });
  }
});

// @route   PUT /api/student/profile
// @desc    Update student profile
// @access  Private/Student
router.put('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'name email department');

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        error: 'Profile not found. Please create your profile first.' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

// @route   DELETE /api/student/profile
// @desc    Delete own profile
// @access  Private/Student
router.delete('/profile', protect, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndDelete({ user: req.user.userId });

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        error: 'Profile not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete profile',
      details: error.message 
    });
  }
});

// ============================================
// RECRUITER/ADMIN/FACULTY ROUTES
// ============================================

// @route   GET /api/student/profiles
// @desc    Get all student profiles with advanced filters
// @access  Private/Recruiter/Admin/Faculty
router.get('/profiles', protect, authorize('recruiter', 'admin', 'faculty'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      skills, 
      graduationYear, 
      minCgpa,
      maxCgpa,
      department,
      program,
      branch,
      search,
      sort = '-createdAt'
    } = req.query;

    const filter = {};

    // Filter by skills
    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }

    // Filter by graduation year
    if (graduationYear) {
      filter.graduationYear = parseInt(graduationYear);
    }

    // Filter by CGPA range
    if (minCgpa || maxCgpa) {
      filter.cgpa = {};
      if (minCgpa) filter.cgpa.$gte = parseFloat(minCgpa);
      if (maxCgpa) filter.cgpa.$lte = parseFloat(maxCgpa);
    }

    // Filter by program
    if (program) {
      filter.program = { $regex: program, $options: 'i' };
    }

    // Filter by branch
    if (branch) {
      filter.branch = { $regex: branch, $options: 'i' };
    }

    // Search in studentId
    if (search) {
      filter.studentId = { $regex: search, $options: 'i' };
    }

    const profiles = await StudentProfile.find(filter)
      .populate('user', 'name email department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const count = await StudentProfile.countDocuments(filter);

    res.json({
      success: true,
      profiles,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Fetch profiles error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profiles',
      details: error.message 
    });
  }
});

// @route   GET /api/student/profile/:id
// @desc    Get specific student profile by ID
// @access  Private/Recruiter/Admin/Faculty
router.get('/profile/:id', protect, authorize('recruiter', 'admin', 'faculty'), async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id)
      .populate('user', 'name email department');

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        error: 'Profile not found' 
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile',
      details: error.message 
    });
  }
});

// @route   GET /api/student/stats
// @desc    Get student statistics (for admin dashboard)
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const verifiedStudents = await StudentProfile.countDocuments({ isVerified: true });
    
    // Average CGPA
    const avgCgpaResult = await StudentProfile.aggregate([
      { $group: { _id: null, avgCgpa: { $avg: '$cgpa' } } }
    ]);
    const avgCgpa = avgCgpaResult.length > 0 ? avgCgpaResult[0].avgCgpa : 0;

    // Students by graduation year
    const studentsByYear = await StudentProfile.aggregate([
      { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Students by branch
    const studentsByBranch = await StudentProfile.aggregate([
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        verifiedStudents,
        avgCgpa: avgCgpa.toFixed(2),
        studentsByYear,
        studentsByBranch,
      },
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

export default router;
