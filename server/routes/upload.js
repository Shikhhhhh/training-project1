import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  uploadResume, 
  uploadProfilePicture, 
  uploadVerificationDoc 
} from '../config/cloudinary.js';
import { User, StudentProfile } from '../models/index.js';

const router = express.Router();

// Upload resume
router.post('/resume', protect, uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const resumeUrl = req.file.path;
    
    // Update user's student profile with resume URL
    await StudentProfile.findOneAndUpdate(
      { user: req.user.userId },
      { resume: resumeUrl },
      { new: true, upsert: false }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      file: {
        url: resumeUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Upload profile picture
router.post('/profile-picture', protect, uploadProfilePicture.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }
    console.log(req.file);
    const profilePictureUrl = req.file.path;
    
    // Update user's profile picture
    await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: profilePictureUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      file: {
        url: profilePictureUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Upload verification document
router.post('/verification', protect, uploadVerificationDoc.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const documentUrl = req.file.path;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      file: {
        url: documentUrl,
        filename: req.file.filename,
        size: req.file.size,
        format: req.file.format,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Error handler for multer errors
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size too large. Maximum size is 5MB for resumes, 2MB for images.',
    });
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
  
  next(error);
});

export default router;

