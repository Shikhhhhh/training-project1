import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    companyLogo: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      required: [true, 'Please provide required skills'],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.length <= 20;
        },
        message: 'Skills must have 1-20 items',
      },
    },
    eligibility: {
      minCGPA: {
        type: Number,
        min: [0, 'CGPA cannot be negative'],
        max: [10, 'CGPA cannot exceed 10'],
        default: 0,
      },
      allowedPrograms: {
        type: [String],
        default: [],
      },
      graduationYears: {
        type: [Number],
        default: [],
      },
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'onsite',
    },
    jobType: {
      type: String,
      enum: ['internship', 'full-time', 'part-time', 'contract'],
      default: 'internship',
    },
    stipend: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    duration: {
      value: {
        type: Number,
        default: 0,
      },
      unit: {
        type: String,
        enum: ['weeks', 'months'],
        default: 'months',
      },
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 opening required'],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Please provide application deadline'],
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'cancelled'],
      default: 'active',
      index: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ recruiterId: 1, status: 1 });
jobSchema.index({ skills: 1, status: 1 });
jobSchema.index({ 'eligibility.graduationYears': 1, status: 1 });

// Text index for search functionality
jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

// Virtual for checking if job is expired
jobSchema.virtual('isExpired').get(function () {
  return new Date() > this.applicationDeadline;
});

// Virtual for days remaining
jobSchema.virtual('daysRemaining').get(function () {
  const today = new Date();
  const deadline = this.applicationDeadline;
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model('Job', jobSchema);

export default Job;
