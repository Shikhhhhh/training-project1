import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/auth.js';
import { uploadProfilePicture, uploadResume, uploadVerificationDoc } from '../config/cloudinary.js';
import { User, StudentProfile } from '../models/index.js';

const router = express.Router();

// ✅ ADD THIS: Configure multer for profile picture uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

router.post('/profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('📤 Starting profile picture upload...');
    console.log('File:', req.file?.filename, 'Size:', req.file?.size);

    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const cloudConfig = cloudinary.config();
    console.log('☁️ Cloudinary config check:', {
      hasCloudName: !!cloudConfig.cloud_name,
      hasApiKey: !!cloudConfig.api_key,
      hasApiSecret: !!cloudConfig.api_secret,
    });

    if (!cloudConfig.cloud_name) {
      console.error('❌ Cloudinary not configured properly');
      return res.status(500).json({
        success: false,
        error: 'Cloud storage not configured',
      });
    }

    console.log('📸 Creating upload stream to Cloudinary...');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile-pictures',
          resource_type: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' },
          ],
        },
        async (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful!');
            console.log('Result:', {
              url: result.secure_url,
              publicId: result.public_id,
              size: result.bytes,
            });

            // Update user's profilePicture in database
            try {
              await User.findByIdAndUpdate(req.user.userId, {
                profilePicture: result.secure_url,
              });
              console.log('✅ User profile picture updated in database');
            } catch (dbError) {
              console.error('⚠️ Failed to update user in database:', dbError);
              // Continue anyway - at least the upload succeeded
            }

            res.json({
              success: true,
              message: 'Profile picture uploaded successfully',
              url: result.secure_url,
              publicId: result.public_id,
              file: {
                name: result.public_id,
                size: result.bytes,
                url: result.secure_url,
              },
            });

            resolve(result);
          }
        }
      );

      console.log('📤 Sending buffer to upload stream...');
      uploadStream.end(req.file.buffer);
    });
  } catch (error) {
    console.error('❌ Upload handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image',
    });
  }
});

// Upload resume - ✅ UNCHANGED
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

// Upload verification document - ✅ UNCHANGED
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
