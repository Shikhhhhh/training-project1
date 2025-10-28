import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'resume',
        'transcript',
        'id-proof',
        'certificate',
        'enrollment',
        'other',
      ],
      required: true,
      index: true,
    },
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: [true, 'Document URL is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'resubmit-required'],
      default: 'pending',
      index: true,
    },
    remarks: {
      type: String,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      fileSize: Number,
      fileType: String,
      uploadedFrom: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
verificationSchema.index({ studentId: 1, documentType: 1, status: 1 });
verificationSchema.index({ status: 1, createdAt: -1 });

// Virtual for days pending
verificationSchema.virtual('daysPending').get(function () {
  if (this.status !== 'pending') return 0;
  const today = new Date();
  const submitted = this.submittedAt;
  const diffTime = today - submitted;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

verificationSchema.set('toJSON', { virtuals: true });
verificationSchema.set('toObject', { virtuals: true });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
