import express from 'express';
import { Application, Job, StudentProfile } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/applications
// @desc    Apply to a job
// @access  Private/Student
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;
    const studentId = req.user.userId;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, studentId });
    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    // Check eligibility (optional - you can add more checks)
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (studentProfile && job.eligibility.minCGPA && studentProfile.cgpa < job.eligibility.minCGPA) {
      return res.status(403).json({ error: 'You do not meet the minimum CGPA requirement' });
    }

    const application = await Application.create({
      jobId,
      studentId,
      coverLetter,
      resumeUrl,
    });

    // Increment application count
    job.applicationCount += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ 
      error: 'Failed to submit application',
      details: error.message 
    });
  }
});

// @route   GET /api/applications/me
// @desc    Get my applications (Student)
// @access  Private/Student
router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const { page = 1, limit = 10, stage } = req.query;
    const filter = { studentId: req.user.userId };

    if (stage) {
      filter.stage = stage;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title companyName location jobType stipend applicationDeadline status')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a job (Recruiter)
// @access  Private/Recruiter
router.get('/job/:jobId', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10, stage } = req.query;
    const { jobId } = req.params;

    // Verify job ownership
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user.userId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    const filter = { jobId };
    if (stage) {
      filter.stage = stage;
    }

    const applications = await Application.find(filter)
      .populate('studentId', 'name email department')
      .populate({
        path: 'studentId',
        populate: {
          path: 'profile',
          model: 'StudentProfile',
        },
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application details
// @access  Private/Student/Recruiter
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('studentId', 'name email department');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Authorization check
    const isStudent = req.user.role === 'student' && application.studentId._id.toString() === req.user.userId;
    const isRecruiter = req.user.role === 'recruiter' && application.jobId.recruiterId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isRecruiter && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// @route   PATCH /api/applications/:id/stage
// @desc    Update application stage (Recruiter)
// @access  Private/Recruiter
router.patch('/:id/stage', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { stage } = req.body;

    const validStages = [
      'applied', 'screening', 'shortlisted', 
      'interview-scheduled', 'interview-completed', 
      'selected', 'rejected', 'withdrawn'
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify recruiter owns the job
    if (application.jobId.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    application.stage = stage;
    await application.save();

    res.json({
      success: true,
      message: 'Application stage updated',
      application,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application stage' });
  }
});

// @route   POST /api/applications/:id/note
// @desc    Add reviewer note
// @access  Private/Recruiter
router.post('/:id/note', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { note, rating } = req.body;

    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.jobId.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    application.reviewerNotes.push({
      reviewerId: req.user.userId,
      note,
      rating,
    });

    await application.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// @route   PATCH /api/applications/:id/interview
// @desc    Schedule interview
// @access  Private/Recruiter
router.patch('/:id/interview', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, location, meetingLink } = req.body;

    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.jobId.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    application.interviewDetails = {
      scheduledDate,
      scheduledTime,
      location,
      meetingLink,
      interviewers: [req.user.userId],
    };
    application.stage = 'interview-scheduled';

    await application.save();

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw application (Student)
// @access  Private/Student
router.delete('/:id', protect, authorize('student'), async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      studentId: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.stage = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

export default router;
