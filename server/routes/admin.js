import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/user.js';
import { Job, Application, StudentProfile } from '../models/index.js';
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

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
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

    // Active jobs count
    const activeJobs = await Job.countDocuments({ status: 'active' });

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
        activeJobs,
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

// @route   GET /api/admin/students
// @desc    Get all student profiles (Admin only)
// @access  Private/Admin
router.get('/students', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    console.log('Fetching students with params:', { page, limit, search });

    let filter = {};

    // If search is provided, search in user name or email
    if (search && search.trim()) {
      // First find users matching the search
      const users = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
        ],
        role: 'student',
      }).select('_id');

      const userIds = users.map(u => u._id);
      
      if (userIds.length > 0) {
        // Find profiles for matching users
        filter = { user: { $in: userIds } };
      } else {
        // No matching users found, return empty result
        return res.json({
          success: true,
          profiles: [],
          currentPage: Number(page),
          total: 0,
        });
      }
    }

    const profiles = await StudentProfile.find(filter)
      .populate('user', 'name email department profilePicture')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await StudentProfile.countDocuments(filter);

    console.log(`Found ${profiles.length} profiles (total: ${count})`);

    res.json({
      success: true,
      profiles,
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      details: error.message,
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

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        // job._id is already an ObjectId, but ensure consistency
        const applicationCount = await Application.countDocuments({ 
          jobId: job._id 
        });
        return {
          ...job.toObject(),
          applicationCount
        };
      })
    );

    const count = await Job.countDocuments(filter);
    res.json({
      success: true,
      jobs: jobsWithCounts,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      details: error.message,
    });
  }
});

// @route   GET /api/admin/jobs/:id/applications
// @desc    Get all applications for a specific job (Admin only)
// @access  Private/Admin
router.get('/jobs/:id/applications', protect, authorize('admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    console.log('Fetching applications for job:', req.params.id);

    // Ensure jobId is converted to ObjectId for query
    const jobObjectId = new mongoose.Types.ObjectId(req.params.id);
    
    console.log('Querying with jobId:', jobObjectId.toString());

    const applications = await Application.find({ jobId: jobObjectId })
      .populate({
        path: 'studentId',
        select: 'name email department',
        model: 'User'
      })
      .sort('-createdAt');

    console.log(`Found ${applications.length} applications`);
    
    // Debug: Check all applications in database for this job
    const allApplications = await Application.find({}).limit(5);
    console.log('Sample applications in DB:', allApplications.map(app => ({
      id: app._id,
      jobId: app.jobId?.toString(),
      studentId: app.studentId?.toString()
    })));

    // Log the first application structure for debugging
    if (applications.length > 0) {
      console.log('Sample application:', JSON.stringify(applications[0], null, 2));
    }

    res.json({
      success: true,
      applications,
      total: applications.length,
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch applications',
      details: error.message 
    });
  }
});

export default router;
