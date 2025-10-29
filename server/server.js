import dotenv from 'dotenv';
dotenv.config();

// ADD THIS TEST
console.log('🧪 Testing .env values:');
console.log('CLOUDINARY_CLOUD_NAME =', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY =', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET =', process.env.CLOUDINARY_API_SECRET ? 'LOADED' : 'MISSING');
console.log('---');

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import jobRoutes from './routes/job.js';
import applicationRoutes from './routes/application.js';
import verificationRoutes from './routes/verification.js';
import departmentRoutes from './routes/department.js';
import skillRoutes from './routes/skill.js';



// Debug: Check environment variables
console.log('🔍 Environment Check:');
console.log('Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET');
console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('Cloudinary API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('---');

// Connect to database
connectDB();

const app = express();

// 1. CORS and cookies (must be first)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());

// 2. Upload routes (BEFORE body parsers)
console.log('✅ Registering upload routes at /api/upload');
app.use('/api/upload', uploadRoutes);

// 3. Body parsers (AFTER upload routes, BEFORE other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. All other routes (AFTER body parsers)
console.log('✅ Registering other routes');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/skills', skillRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (MUST have 4 parameters!)
app.use((err, req, res, next) => {
  console.error('❌ Error caught by error handler:');
  console.error(err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});
