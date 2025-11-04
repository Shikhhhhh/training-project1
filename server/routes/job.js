import express from 'express';
import { Job, Application } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// @route   GET /api/jobs
// @desc    Get all active jobs with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /jobs - Query params:', req.query);

    // Extract query parameters (NOT from req.body!)
    const {
      page = 1,
      limit = 10,
      search,
      skills,
      locationType,
      jobType,
      status = 'active',
    } = req.query;

    console.log('Extracted params:', { page, limit, search, skills, locationType, jobType, status });

    // Build filter
    const filter = { status };

    // Text search - search in title, description, companyName
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },  // ✅ Changed from 'company'
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by skills (array of skills)
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filter.skills = { $in: skillsArray };
    }

    // Filter by location type
    if (locationType) {
      filter.locationType = locationType;
    }

    // Filter by job type
    if (jobType) {
      filter.jobType = jobType;
    }

    console.log('Filter:', filter);

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    // Fetch jobs
    const jobs = await Job.find(filter)
      .populate('recruiterId', 'name email')
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Job.countDocuments(filter);

    console.log(`✅ Found ${jobs.length} jobs (total: ${total})`);

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Fetch jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      details: error.message,
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterId', 'name email company department');

    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    // Get application count for this job
    const applicationCount = await Application.countDocuments({ job: job._id });

    res.json({ 
      success: true, 
      job: {
        ...job.toObject(),
        applicationCount
      }
    });
  } catch (error) {
    console.error('Fetch job error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch job',
      details: error.message 
    });
  }
});

// ============================================
// RECRUITER-ONLY ROUTES
// ============================================

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private/Recruiter
router.post('/', protect, authorize('admin', 'recruiter'), async (req, res) => {
  try {
    // Extract all values from body
    const title = req.body.title;
    const description = req.body.description;
    const company = req.body.company;
    const location = req.body.location;
    const applicationDeadline = req.body.applicationDeadline;
    const duration = req.body.duration;
    const stipend = req.body.stipend;
    const requirements = req.body.requirements;
    let type = req.body.type;

    console.log('📥 RAW REQUEST:');
    console.log('  title:', title);
    console.log('  company:', company);
    console.log('  type received:', type);

    // Validate required fields
    if (!title || !company || !description || !location || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: title, company, description, location, applicationDeadline',
      });
    }

    // Normalize jobType - map frontend values to schema values
    const jobTypeMap = {
      'internship': 'internship',
      'fulltime': 'full-time',        // ← Map 'fulltime' to 'full-time'
      'full-time': 'full-time',
      'parttime': 'part-time',        // ← Map 'parttime' to 'part-time'
      'part-time': 'part-time',
      'contract': 'contract',
    };

    const normalizedJobType = jobTypeMap[type] || 'internship';
    
    console.log('  type normalized:', normalizedJobType);

    // Create job object with exact schema field names
    const jobData = {
      recruiterId: req.user.userId,
      title: title,
      companyName: company,
      description: description,
      location: location,
      applicationDeadline: applicationDeadline,
      jobType: normalizedJobType,  // ← Use normalized value
      skills: requirements ? [requirements] : [],
      duration: { value: duration || 1, unit: 'months' },
      stipend: { min: stipend || 0, max: stipend || 0, currency: 'INR' },
    };

    console.log('✅ Creating job with data:', jobData);

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully!',
      job: job,
    });
  } catch (error) {
    console.error('❌ Error creating job:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});




// @route   GET /api/jobs/recruiter/me
// @desc    Get all jobs posted by current recruiter
// @access  Private/Recruiter
router.get('/recruiter/me', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    const filter = { recruiterId: req.user.userId };

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const count = await Job.countDocuments(filter);

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicationCount
        };
      })
    );

    res.json({
      success: true,
      jobs: jobsWithCounts,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Fetch recruiter jobs error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch your jobs',
      details: error.message 
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private/Recruiter (own jobs only)
router.put('/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    // Check if the recruiter owns this job
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only update your own jobs' 
      });
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update job',
      details: error.message 
    });
  }
});

// @route   PATCH /api/jobs/:id/status
// @desc    Update job status (active/closed)
// @access  Private/Recruiter (own jobs only)
router.patch('/:id/status', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status. Must be either "active" or "closed"' 
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    // Check ownership
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only update your own jobs' 
      });
    }

    job.status = status;
    await job.save();

    res.json({
      success: true,
      message: `Job ${status} successfully`,
      job,
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update job status',
      details: error.message 
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private/Recruiter (own jobs only)
router.delete('/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    // Check ownership
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only delete your own jobs' 
      });
    }

    // Check if there are applications
    const applicationCount = await Application.countDocuments({ job: job._id });
    
    if (applicationCount > 0) {
      return res.status(400).json({ 
        success: false,
        error: `Cannot delete job with ${applicationCount} applications. Please close it instead.` 
      });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete job',
      details: error.message 
    });
  }
});

// @route   GET /api/jobs/:id/applications
// @desc    Get all applications for a specific job
// @access  Private/Recruiter (own jobs only)
router.get('/:id/applications', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    // Check ownership
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only view applications for your own jobs' 
      });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('student', 'name email department')
      .populate('studentProfile', 'cgpa skills resume')
      .sort('-createdAt');

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
