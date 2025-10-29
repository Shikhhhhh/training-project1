import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true, // Add index for faster queries
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'recruiter', 'faculty', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
      index: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
     profilePicture: { type: String, default: '' },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create compound index for role and email
userSchema.index({ role: 1, email: 1 });

// Virtual for user's full profile (will be used later)
userSchema.virtual('profile', {
  ref: 'StudentProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Method to exclude password from JSON responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
