import express from 'express';
import { Department } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/departments
// @desc    Create department (Admin)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ 
      error: 'Failed to create department',
      details: error.message 
    });
  }
});

// @route   GET /api/departments
// @desc    Get all departments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const departments = await Department.find(filter)
      .populate('headOfDepartment', 'name email')
      .populate('faculty', 'name email')
      .sort({ name: 1 });

    res.json({ success: true, departments, count: departments.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// @route   GET /api/departments/:id
// @desc    Get single department
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'name email')
      .populate('faculty', 'name email');

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ success: true, department });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department (Admin)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update department',
      details: error.message 
    });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department (Admin)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;
