import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import studentRoutes from './student.js';
import jobRoutes from './job.js';
import applicationRoutes from './application.js';
import verificationRoutes from './verification.js';
import departmentRoutes from './department.js';
import skillRoutes from './skill.js';
import uploadRoutes from './upload.js';

export default function setupRoutes(app) {
  // Authentication routes
  app.use('/api/auth', authRoutes);
  
  // Admin routes
  app.use('/api/admin', adminRoutes);
  
  // Student routes
  app.use('/api/student', studentRoutes);
  
  // Job routes
  app.use('/api/jobs', jobRoutes);
  
  // Application routes
  app.use('/api/applications', applicationRoutes);
  
  // Verification routes
  app.use('/api/verifications', verificationRoutes);
  
  // Department routes
  app.use('/api/departments', departmentRoutes);
  
  // Skill routes
  app.use('/api/skills', skillRoutes);
  
  // Upload routes
  app.use('/api/upload', uploadRoutes);
}
