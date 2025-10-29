import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadProfilePicture, uploadResume, uploadVerificationDoc } from '../config/cloudinary.js';
import { User, StudentProfile } from '../models/index.js';

const router = express.Router();

// Upload profile picture
router.post('/profile-picture', protect, (req, res, next) => {
  console.log('📸 Profile picture route hit');
  console.log('User from token:', req.user);
  
  uploadProfilePicture.single('profilePicture')(req, res, async (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    console.log('File from multer:', req.file);

    if (!req.file) {
      console.error('❌ No file received');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Make sure field name is "profilePicture"',
      });
    }

    try {
      const profilePictureUrl = req.file.path;
      console.log('✅ File uploaded to Cloudinary:', profilePictureUrl);

      await User.findByIdAndUpdate(
        req.user.userId,
        { profilePicture: profilePictureUrl },
        { new: true }
      );

      console.log('✅ User profile picture updated in database');

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
      console.error('❌ Upload processing error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});

// Upload resume
router.post('/resume', protect, (req, res, next) => {
  uploadResume.single('resume')(req, res, async (err) => {
    if (err) {
      console.error('Resume upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    try {
      const resumeUrl = req.file.path;
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
      console.error('Resume processing error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});

// Upload verification document
router.post('/verification', protect, (req, res, next) => {
  uploadVerificationDoc.single('document')(req, res, async (err) => {
    if (err) {
      console.error('Verification doc upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    try {
      const documentUrl = req.file.path;
      res.json({
        success: true,
        message: 'Document uploaded successfully',
        file: {
          url: documentUrl,
          filename: req.file.filename,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error('Document processing error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});

export default router;
