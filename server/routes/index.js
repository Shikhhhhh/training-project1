// import express from 'express';
// import authRoutes from './auth.js';
// import adminRoutes from './admin.js';
// import studentRoutes from './student.js';
// import jobRoutes from './job.js';
// import applicationRoutes from './application.js';
// import verificationRoutes from './verification.js';
// import departmentRoutes from './department.js';
// import skillRoutes from './skill.js';
// import uploadRoutes from './upload.js';

// export default function setupRoutes(app) {
//   // ✅ Upload routes with raw body parser
//   app.use('/api/upload', express.raw({ type: '*/*', limit: '10mb' }), uploadRoutes);

//   // All other routes (use body parsers from server.js)
//   app.use('/api/auth', authRoutes);
//   app.use('/api/admin', adminRoutes);
//   app.use('/api/student', studentRoutes);
//   app.use('/api/jobs', jobRoutes);
//   app.use('/api/applications', applicationRoutes);
//   app.use('/api/verifications', verificationRoutes);
//   app.use('/api/departments', departmentRoutes);
//   app.use('/api/skills', skillRoutes);
// }
