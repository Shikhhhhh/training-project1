import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverLetter: {
      type: String,
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
      default: '',
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required'],
    },
    stage: {
      type: String,
      enum: [
        'applied',
        'screening',
        'shortlisted',
        'interview-scheduled',
        'interview-completed',
        'selected',
        'rejected',
        'withdrawn',
      ],
      default: 'applied',
      index: true,
    },
    scores: {
      resumeScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      interviewScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      technicalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
    },
    reviewerNotes: [
      {
        reviewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: {
          type: String,
          maxlength: 500,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    interviewDetails: {
      scheduledDate: Date,
      scheduledTime: String,
      location: String,
      meetingLink: String,
      interviewers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      feedback: String,
    },
    status: {
      type: String,
      enum: ['pending', 'under-review', 'completed'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - prevent duplicate applications
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

// Compound indexes for efficient queries
applicationSchema.index({ studentId: 1, stage: 1 });
applicationSchema.index({ jobId: 1, stage: 1 });
applicationSchema.index({ stage: 1, createdAt: -1 });

// Virtual for time since application
applicationSchema.virtual('daysSinceApplied').get(function () {
  const today = new Date();
  const applied = this.appliedAt;
  const diffTime = today - applied;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
