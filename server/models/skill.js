import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters'],
    },
    category: {
      type: String,
      enum: [
        'programming',
        'framework',
        'database',
        'devops',
        'cloud',
        'design',
        'testing',
        'soft-skill',
        'other',
      ],
      default: 'other',
      index: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
skillSchema.index({ name: 1 });
skillSchema.index({ category: 1, usageCount: -1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
