import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One profile per user
      index: true,
    },
    program: {
      type: String,
      required: [true, 'Please provide your program/course'],
      trim: true,
      maxlength: [100, 'Program name cannot exceed 100 characters'],
    },
    graduationYear: {
      type: Number,
      required: [true, 'Please provide graduation year'],
      min: [2020, 'Graduation year must be 2020 or later'],
      max: [2030, 'Graduation year cannot exceed 2030'],
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
      default: null,
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: 'Cannot add more than 20 skills',
      },
    },
    projects: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Project title cannot exceed 100 characters'],
        },
        description: {
          type: String,
          maxlength: [500, 'Project description cannot exceed 500 characters'],
        },
        technologies: [String],
        url: {
          type: String,
          match: [
            /^https?:\/\/.+/,
            'Please provide a valid URL starting with http:// or https://',
          ],
        },
        startDate: Date,
        endDate: Date,
      },
    ],
    resumeUrl: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/.+|)$/,
        'Please provide a valid URL or leave empty',
      ],
    },
    githubUrl: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/(www\.)?github\.com\/.+|)$/,
        'Please provide a valid GitHub URL',
      ],
    },
    linkedinUrl: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/(www\.)?linkedin\.com\/.+|)$/,
        'Please provide a valid LinkedIn URL',
      ],
    },
    portfolioUrl: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/.+|)$/,
        'Please provide a valid URL',
      ],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    verifiedFlags: {
      resumeVerified: {
        type: Boolean,
        default: false,
      },
      academicVerified: {
        type: Boolean,
        default: false,
      },
      identityVerified: {
        type: Boolean,
        default: false,
      },
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching by graduation year and skills
studentProfileSchema.index({ graduationYear: 1, skills: 1 });

// Virtual for profile completion percentage
studentProfileSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  const total = 10;

  if (this.program) completed++;
  if (this.graduationYear) completed++;
  if (this.cgpa) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.projects && this.projects.length > 0) completed++;
  if (this.resumeUrl) completed++;
  if (this.githubUrl) completed++;
  if (this.linkedinUrl) completed++;
  if (this.portfolioUrl) completed++;
  if (this.bio) completed++;

  return Math.round((completed / total) * 100);
});

// Set virtuals to be included in JSON
studentProfileSchema.set('toJSON', { virtuals: true });
studentProfileSchema.set('toObject', { virtuals: true });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

export default StudentProfile;
