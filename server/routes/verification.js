import express from 'express';
import { Verification } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/verifications
// @desc    Submit document for verification (Student)
// @access  Private/Student
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { documentType, documentName, documentUrl, metadata } = req.body;

    const verification = await Verification.create({
      studentId: req.user.userId,
      documentType,
      documentName,
      documentUrl,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Document submitted for verification',
      verification,
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ 
      error: 'Failed to submit document',
      details: error.message 
    });
  }
});

// @route   GET /api/verifications/me
// @desc    Get my verifications (Student)
// @access  Private/Student
router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const verifications = await Verification.find({ studentId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, verifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

// @route   GET /api/verifications/queue
// @desc    Get verification queue (Faculty)
// @access  Private/Faculty
router.get('/queue', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;

    const verifications = await Verification.find({ status })
      .populate('studentId', 'name email department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: 1 }); // Oldest first

    const count = await Verification.countDocuments({ status });

    res.json({
      success: true,
      verifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
});

// @route   PATCH /api/verifications/:id
// @desc    Approve/Reject document (Faculty)
// @access  Private/Faculty
router.patch('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!['approved', 'rejected', 'resubmit-required'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks,
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    res.json({
      success: true,
      message: `Document ${status}`,
      verification,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// @route   GET /api/verifications/:id
// @desc    Get verification details
// @access  Private/Student/Faculty/Admin
router.get('/:id', protect, async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id)
      .populate('studentId', 'name email department')
      .populate('reviewedBy', 'name email');

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Authorization check
    const isStudent = req.user.role === 'student' && verification.studentId._id.toString() === req.user.userId;
    const isFaculty = req.user.role === 'faculty';
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isFaculty && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ success: true, verification });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verification' });
  }
});

export default router;
